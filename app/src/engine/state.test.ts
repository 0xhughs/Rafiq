import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { DIALOGUE, JOURNAL_TEXT, LOCKED_COPY, OBJECTIVES } from './dialogue';
import { grantItem } from './inventory';
import { APARTMENT, LIBRARY, PARCEL, PORTALS, SHOP, STREET, WORLD_POS } from './maps';
import { NAME_ERRORS } from './names';
import { robotPosition } from './npc';
import { createInitialState, reduce, stepGame } from './state';
import {
  MemoryStore,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  clearRafiqKeys,
  hydrateSave,
  loadAdventure,
  persistAdventure,
  toEnvelope,
  validateSave,
} from './save';
import type { GameState, MapId } from './types';

const TILE_MIN_INSIDE = 48;

function start(name = 'علي حسن'): GameState {
  let state = createInitialState();
  state = reduce(state, { type: 'NAME_DRAFT', value: name });
  state = reduce(state, { type: 'SUBMIT_NAME' });
  state = reduce(state, { type: 'CONFIRM_NAME' });
  return state;
}

function at(state: GameState, x: number, y: number, map?: MapId): GameState {
  return reduce(state, { type: 'DEBUG_TELEPORT', map, x, y });
}

function pickupTrash(state: GameState): GameState {
  let next = at(state, WORLD_POS.trash.x, WORLD_POS.trash.y, 'apartment');
  next = reduce(next, { type: 'INTERACT' });
  if (next.mode === 'dialogue') {
    next = reduce(next, { type: 'ADVANCE_DIALOGUE' });
  }
  return next;
}

function toStreet(state: GameState): GameState {
  return reduce(at(state, WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y, 'apartment'), {
    type: 'INTERACT',
  });
}

function disposeBag(state: GameState): GameState {
  const next = at(state, WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y, 'street');
  return reduce(next, { type: 'INTERACT' });
}

function inspectRobot(state: GameState): GameState {
  const next = at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street');
  return reduce(next, { type: 'INTERACT' });
}

function reachAskHelp(state: GameState): GameState {
  let next = inspectRobot(state);
  const order = ['discover', 'hello', 'introduce', 'broken', 'wrong_fact', 'fact_admission'] as const;
  for (const node of order) {
    expect(next.dialogueNode).toBe(node);
    next = reduce(next, { type: 'ADVANCE_DIALOGUE' });
  }
  expect(next.dialogueNode).toBe('ask_help');
  return next;
}

function acceptHelp(state: GameState): GameState {
  let next = reachAskHelp(state);
  next = reduce(next, { type: 'CHOOSE', choice: 'agree' });
  next = reduce(next, { type: 'ADVANCE_DIALOGUE' });
  next = reduce(next, { type: 'ADVANCE_DIALOGUE' });
  return next;
}

function checkpoint(): GameState {
  return acceptHelp(disposeBag(toStreet(pickupTrash(start()))));
}

describe('maps', () => {
  it('keeps apartment and street legends rectangular with collisions', () => {
    expect(new Set(APARTMENT.legend.map((row) => row.length))).toEqual(new Set([16]));
    expect(new Set(STREET.legend.map((row) => row.length))).toEqual(new Set([34]));
    expect(playerHitsSolid('apartment', APARTMENT.spawn.x, APARTMENT.spawn.y)).toBe(false);
    expect(playerHitsSolid('street', STREET.entryFromOther.x, STREET.entryFromOther.y)).toBe(
      false,
    );
  });
});

describe('name entry flow', () => {
  it('starts in the HTML name-entry mode, not in the world', () => {
    const state = createInitialState();
    expect(state.mode).toBe('name_entry');
    expect(state.playerName).toBe('');
  });

  it('rejects blank names before the world starts', () => {
    let state = createInitialState();
    state = reduce(state, { type: 'NAME_DRAFT', value: '   ' });
    state = reduce(state, { type: 'SUBMIT_NAME' });
    expect(state.mode).toBe('name_entry');
    expect(state.nameError).toBe(NAME_ERRORS.blank);
  });

  it('shows the trimmed name for correction before spawn', () => {
    let state = createInitialState();
    state = reduce(state, { type: 'NAME_DRAFT', value: '  علي حسن  ' });
    state = reduce(state, { type: 'SUBMIT_NAME' });
    expect(state.mode).toBe('confirm_name');
    expect(state.playerName).toBe('علي حسن');
    state = reduce(state, { type: 'REVISE_NAME' });
    expect(state.mode).toBe('name_entry');
    expect(state.nameDraft).toBe('علي حسن');
  });

  it('spawns beside the bed after confirm', () => {
    const state = start();
    expect(state.mode).toBe('playing');
    expect(state.map).toBe('apartment');
    expect(state.position).toEqual(APARTMENT.spawn);
    expect(state.trash).toBe('home');
    expect(state.storyObjective).toBe(OBJECTIVES.takeTrash);
  });

  it('ignores movement during name entry', () => {
    let state = createInitialState();
    const origin = { ...state.position };
    state = reduce(state, { type: 'MOVE', dx: 80, dy: 80 });
    expect(state.position).toEqual(origin);
  });
});

describe('apartment movement and chore', () => {
  it('blocks movement into walls', () => {
    const state = start();
    const moved = reduce(state, { type: 'MOVE', dx: 0, dy: -400 });
    expect(moved.position.y).toBeGreaterThan(TILE_MIN_INSIDE);
    expect(moved.position.y).toBeLessThan(state.position.y + 1);
    expect(playerHitsSolid('apartment', moved.position.x, moved.position.y)).toBe(false);
  });

  it('picks up the trash bag once and shows the leaving line', () => {
    let state = at(start(), WORLD_POS.trash.x, WORLD_POS.trash.y);
    expect(reduce(state, { type: 'INTERACT' }).trash).toBe('carried');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('pickup_leaving');
    expect(DIALOGUE.pickup_leaving.text(state.playerName)).toBe('سأخرج كيس القمامة، ثم أعود.');
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.mode).toBe('playing');
    state = reduce(at(state, WORLD_POS.trash.x, WORLD_POS.trash.y), { type: 'INTERACT' });
    expect(state.trash).toBe('carried');
    expect(state.dialogueNode).not.toBe('pickup_leaving');
  });

  it('allows leaving without the bag and returning to finish the chore', () => {
    let state = toStreet(start());
    expect(state.map).toBe('street');
    expect(state.trash).toBe('home');
    expect(state.encounter).toBe('unseen');
    state = reduce(at(state, WORLD_POS.streetDoor.x, WORLD_POS.streetDoor.y), { type: 'INTERACT' });
    expect(state.map).toBe('apartment');
    expect(state.trash).toBe('home');
    state = pickupTrash(state);
    expect(state.trash).toBe('carried');
  });

  it('keeps door transitions idempotent', () => {
    let state = start();
    for (let i = 0; i < 3; i += 1) {
      state = toStreet(state);
      expect(state.map).toBe('street');
      state = reduce(at(state, WORLD_POS.streetDoor.x, WORLD_POS.streetDoor.y), {
        type: 'INTERACT',
      });
      expect(state.map).toBe('apartment');
    }
    expect(state.trash).toBe('home');
  });
});

describe('dumpster encounter', () => {
  it('disposes the bag once and reveals a single robot', () => {
    let state = pickupTrash(start());
    state = toStreet(state);
    state = disposeBag(state);
    expect(state.trash).toBe('disposed');
    expect(state.encounter).toBe('available');
    const again = disposeBag(state);
    expect(again.trash).toBe('disposed');
    expect(again.encounter).toBe('available');
    expect(again.encounter).not.toBe('unseen');
  });

  it('does not respawn the bag after disposal', () => {
    let state = disposeBag(toStreet(pickupTrash(start())));
    state = reduce(at(state, WORLD_POS.streetDoor.x, WORLD_POS.streetDoor.y), {
      type: 'INTERACT',
    });
    state = reduce(at(state, WORLD_POS.trash.x, WORLD_POS.trash.y), { type: 'INTERACT' });
    expect(state.trash).toBe('disposed');
  });
});

describe('conversation and help acceptance', () => {
  it('pauses movement during dialogue and advances one node per action', () => {
    let state = inspectRobot(disposeBag(toStreet(pickupTrash(start()))));
    expect(state.mode).toBe('dialogue');
    const origin = { ...state.position };
    state = reduce(state, { type: 'MOVE', dx: 90, dy: 0 });
    expect(state.position).toEqual(origin);
    expect(state.dialogueNode).toBe('discover');
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('hello');
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('introduce');
    expect(DIALOGUE.introduce.text(state.playerName)).toContain(state.playerName);
  });

  it('includes an unseen-local-fact beat that the robot cannot know', () => {
    expect(DIALOGUE.wrong_fact.text('علي')).toMatch(/زرقاء|كتاب/);
    expect(DIALOGUE.fact_admission.text('علي')).toMatch(/لم أدخل|لم أر/);
  });

  it('lets the player postpone and reopen, then agree later', () => {
    let state = reachAskHelp(disposeBag(toStreet(pickupTrash(start()))));
    state = reduce(state, { type: 'CHOOSE', choice: 'postpone' });
    expect(state.mode).toBe('playing');
    expect(state.encounter).toBe('available');
    state = inspectRobot(state);
    expect(state.dialogueNode).toBe('ask_help');
    state = reduce(state, { type: 'CHOOSE', choice: 'agree' });
    expect(state.encounter).toBe('help_accepted');
    expect(state.storyObjective).toBe(OBJECTIVES.cornerStore);
    expect(state.checkpointReached).toBe(true);
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('lead');
    expect(DIALOGUE.lead.text(state.playerName)).toMatch(/المتجر عند الزاوية/);
  });

  it('requires the encounter before help can be accepted', () => {
    let state = start();
    state = reduce(state, { type: 'CHOOSE', choice: 'agree' });
    expect(state.encounter).toBe('unseen');
    expect(state.checkpointReached).toBe(false);
    state = pickupTrash(state);
    state = reduce(state, { type: 'CHOOSE', choice: 'agree' });
    expect(state.encounter).toBe('unseen');
  });

  it('does not award topic 1.1 mastery or lesson state', () => {
    let state = reachAskHelp(disposeBag(toStreet(pickupTrash(start()))));
    state = reduce(state, { type: 'CHOOSE', choice: 'agree' });
    expect(state).not.toHaveProperty('mastery');
    expect(JSON.stringify(state)).not.toMatch(/1\.1|امتحان|اختبار|درس/);
  });

  it('ignores extra advances on a choice node', () => {
    let state = reachAskHelp(disposeBag(toStreet(pickupTrash(start()))));
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('ask_help');
  });
});

describe('pause overlay', () => {
  it('pauses and resumes without restarting the slice', () => {
    let state = pickupTrash(start());
    state = reduce(state, { type: 'OPEN_HELP' });
    expect(state.mode).toBe('paused');
    expect(state.trash).toBe('carried');
    state = reduce(state, { type: 'CLOSE_OVERLAY' });
    expect(state.mode).toBe('playing');
    expect(state.trash).toBe('carried');
  });
});

describe('city maps and portals', () => {
  it('registers five walkable maps and bidirectional portal pairs', () => {
    expect(playerHitsSolid('shop', SHOP.spawn.x, SHOP.spawn.y)).toBe(false);
    expect(playerHitsSolid('library', LIBRARY.spawn.x, LIBRARY.spawn.y)).toBe(false);
    expect(playerHitsSolid('parcel', PARCEL.spawn.x, PARCEL.spawn.y)).toBe(false);
    expect(PORTALS.map((portal) => portal.id).sort()).toEqual(['home', 'library', 'parcel', 'shop']);
    const streetPortals = PORTALS.filter((portal) =>
      portal.ends.some((end) => end.map === 'street'),
    );
    expect(streetPortals.length).toBeGreaterThan(1);
  });

  it('keeps slice 01 dumpster and robot cells in place', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * 48 + 24, y: 5 * 48 + 24 });
    expect(WORLD_POS.dumpster.x).toBe(14 * 48 + 72);
    expect(WORLD_POS.apartmentDoor).toEqual(APARTMENT.door);
  });

  it('locks shop and library before help_accepted without skipping the chore', () => {
    let state = at(start(), WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y, 'street');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.map).toBe('street');
    expect(state.dialogueNode).toBe('locked_shop');
    expect(state.trash).toBe('home');
    expect(state.encounter).toBe('unseen');
    expect(DIALOGUE.locked_shop.text(state.playerName, state.storyObjective)).toBe(
      LOCKED_COPY.shop(state.storyObjective),
    );
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    state = at(state, WORLD_POS.libraryDoor.x, WORLD_POS.libraryDoor.y, 'street');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.map).toBe('street');
    expect(state.dialogueNode).toBe('locked_library');
    expect(state.encounter).toBe('unseen');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.encounter).toBe('unseen');
    expect(state.trash).toBe('home');
  });

  it('enters shop and library after help_accepted and returns to the street', () => {
    let state = at(checkpoint(), WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y, 'street');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.map).toBe('shop');
    expect(playerHitsSolid('shop', state.position.x, state.position.y)).toBe(false);
    expect(state.mapsVisited).toContain('shop');
    expect(state.journalEvents.some((event) => event.id === 'shop_visit')).toBe(true);
    expect(state.encounter).toBe('help_accepted');
    expect(robotPosition(state)).toEqual({
      x: state.position.x - 32,
      y: state.position.y + 10,
    });
    state = reduce(at(state, WORLD_POS.shopExit.x, WORLD_POS.shopExit.y, 'shop'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('street');
    expect(playerHitsSolid('street', state.position.x, state.position.y)).toBe(false);

    state = reduce(at(state, WORLD_POS.libraryDoor.x, WORLD_POS.libraryDoor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('library');
    expect(playerHitsSolid('library', state.position.x, state.position.y)).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'library_visit')).toBe(true);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    state = reduce(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('library_inner_locked');
    expect(DIALOGUE.library_inner_locked.text(state.playerName, state.storyObjective)).toMatch(
      /بقالة الزاوية/,
    );
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    state = reduce(at(state, WORLD_POS.libraryExit.x, WORLD_POS.libraryExit.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('street');
  });

  it('blocks a wall on shop and library', () => {
    const shopBlocked = reduce(
      at(checkpoint(), WORLD_POS.shopWestWallInside.x, WORLD_POS.shopWestWallInside.y, 'shop'),
      { type: 'MOVE', dx: -400, dy: 0 },
    );
    expect(shopBlocked.position.x).toBeGreaterThan(40);
    expect(playerHitsSolid('shop', shopBlocked.position.x, shopBlocked.position.y)).toBe(false);
    const libraryBlocked = reduce(
      at(checkpoint(), WORLD_POS.libraryWestWallInside.x, WORLD_POS.libraryWestWallInside.y, 'library'),
      { type: 'MOVE', dx: -400, dy: 0 },
    );
    expect(libraryBlocked.position.x).toBeGreaterThan(40);
  });
});

describe('inventory', () => {
  it('grants trash_bag once and does not duplicate on replay', () => {
    let state = pickupTrash(start());
    expect(state.inventory).toEqual(['trash_bag']);
    state = pickupTrash(state);
    expect(state.inventory).toEqual(['trash_bag']);
    expect(grantItem(state.inventory, 'trash_bag')).toEqual(['trash_bag']);
    state = disposeBag(toStreet(state));
    expect(state.inventory).toEqual([]);
    state = disposeBag(state);
    expect(state.inventory).toEqual([]);
    expect(state.trash).toBe('disposed');
  });
});

describe('street neighbor NPC', () => {
  it('postpones and reopens without changing encounter or trash', () => {
    let state = at(toStreet(start()), WORLD_POS.neighbor.x, WORLD_POS.neighbor.y, 'street');
    state = reduce(state, { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('neighbor_hello');
    expect(DIALOGUE.neighbor_hello.text(state.playerName, state.storyObjective)).toBe(
      'صباح الخير. أنت جارنا الجديد؟',
    );
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(DIALOGUE.neighbor_reply.text(state.playerName, state.storyObjective)).toMatch(
      /المتجر عند الزاوية/,
    );
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('neighbor_pointer');
    const trash = state.trash;
    const encounter = state.encounter;
    state = reduce(state, { type: 'CHOOSE', choice: 'npc_postpone' });
    expect(state.mode).toBe('playing');
    expect(state.trash).toBe(trash);
    expect(state.encounter).toBe(encounter);
    expect(state.neighbor).toBe('unmet');
    state = reduce(at(state, WORLD_POS.neighbor.x, WORLD_POS.neighbor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('neighbor_hello');
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    state = reduce(state, { type: 'CHOOSE', choice: 'npc_thanks' });
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.neighbor).toBe('greeted');
    expect(state.journalEvents.filter((event) => event.id === 'neighbor_greeting')).toHaveLength(1);
    state = reduce(at(state, WORLD_POS.neighbor.x, WORLD_POS.neighbor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('neighbor_revisit');
    state = reduce(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.neighbor).toBe('greeted');
    expect(state.journalEvents.filter((event) => event.id === 'neighbor_greeting')).toHaveLength(1);
    expect(state.encounter).toBe('unseen');
  });
});

describe('save envelope', () => {
  it('round-trips a checkpoint and rejects missing saveVersion', () => {
    const state = checkpoint();
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    expect(envelope.robot.companion).toBe(true);
    expect(envelope.endingState).toBe('in_progress');
    expect(envelope.evidence).toEqual({});
    const valid = validateSave(JSON.stringify(envelope));
    expect(valid).not.toBeNull();
    const hydrated = hydrateSave(valid!, 'ok', false);
    expect(hydrated.mode).toBe('playing');
    expect(hydrated.dialogueNode).toBeNull();
    expect(hydrated.playerName).toBe(state.playerName);
    expect(hydrated.encounter).toBe('help_accepted');
    expect(hydrated.map).toBe(state.map);
    expect(hydrated.inventory).toEqual(state.inventory);

    const missingVersion = { ...envelope, saveVersion: undefined };
    expect(validateSave(missingVersion)).toBeNull();
  });

  it('loads backup when the primary JSON is corrupt', () => {
    const store = new MemoryStore();
    const first = persistAdventure(store, pickupTrash(start()));
    persistAdventure(store, checkpoint());
    expect(store.getItem(SAVE_BACKUP_KEY)).toBeTruthy();
    store.setItem(SAVE_KEY, '{not-json');
    const loaded = loadAdventure(store);
    expect(loaded.status).toBe('recovered');
    if (loaded.status !== 'recovered') throw new Error('expected recovered save');
    expect(loaded.state.restoreNotice).toBe(true);
    expect(loaded.state.playerName).toBe(first.playerName);
    expect(loaded.state.mode).toBe('playing');
  });

  it('snaps an unsafe saved pixel to the map spawn', () => {
    const state = checkpoint();
    const envelope = toEnvelope(state);
    envelope.position = { x: 4, y: 4 };
    envelope.map = 'shop';
    const hydrated = hydrateSave(envelope, 'ok', false);
    expect(hydrated.position).toEqual(SHOP.spawn);
    expect(playerHitsSolid('shop', hydrated.position.x, hydrated.position.y)).toBe(false);
  });

  it('ignores LearnAI-like keys when saving and clearing Rafiq keys', () => {
    const store = new MemoryStore();
    store.setItem('learnai.progress', 'quiz-done');
    store.setItem('learnai-completion', '1');
    persistAdventure(store, checkpoint());
    expect(store.getItem('learnai.progress')).toBe('quiz-done');
    expect(store.getItem(SAVE_KEY)).toContain('"saveVersion":1');
    clearRafiqKeys(store);
    expect(store.getItem(SAVE_KEY)).toBeNull();
    expect(store.getItem(SAVE_BACKUP_KEY)).toBeNull();
    expect(store.getItem('learnai.progress')).toBe('quiz-done');
    expect(store.getItem('learnai-completion')).toBe('1');
  });

  it('marks storage unavailable when setItem throws and keeps the session playable', () => {
    const store = new MemoryStore();
    const throwing = {
      getItem: (key: string) => store.getItem(key),
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: (key: string) => store.removeItem(key),
    };
    const next = persistAdventure(throwing, checkpoint());
    expect(next.saveStatus).toBe('unavailable');
    expect(next.mode).toBe('playing');
    expect(next.encounter).toBe('help_accepted');
  });

  it('persists NPC postpone through stepGame without changing encounter', () => {
    const store = new MemoryStore();
    let state = at(toStreet(start()), WORLD_POS.neighbor.x, WORLD_POS.neighbor.y, 'street');
    state = stepGame(store, state, { type: 'INTERACT' });
    state = stepGame(store, state, { type: 'ADVANCE_DIALOGUE' });
    state = stepGame(store, state, { type: 'ADVANCE_DIALOGUE' });
    const encounter = state.encounter;
    state = stepGame(store, state, { type: 'CHOOSE', choice: 'npc_postpone' });
    expect(state.encounter).toBe(encounter);
    expect(validateSave(store.getItem(SAVE_KEY))).not.toBeNull();
    const loaded = loadAdventure(store);
    expect(loaded.status).toBe('ok');
    if (loaded.status !== 'ok') throw new Error('expected ok save');
    expect(loaded.state.encounter).toBe(encounter);
    expect(loaded.state.neighbor).toBe('unmet');
  });
});

describe('objectives copy', () => {
  it('does not claim the corner store is still closed', () => {
    expect(OBJECTIVES.cornerStore).not.toMatch(/سيُفتح|مغلق/);
    expect(OBJECTIVES.cornerStore).toMatch(/بقالة الزاوية/);
    expect(JOURNAL_TEXT.shop_visit).toMatch(/بقالة/);
  });
});
