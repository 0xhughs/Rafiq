import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { APARTMENT, STREET, WORLD_POS } from './maps';
import { NAME_ERRORS } from './names';
import { createInitialState, reduce } from './state';
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

describe('maps', () => {
  it('keeps apartment and street legends rectangular with collisions', () => {
    expect(new Set(APARTMENT.legend.map((row) => row.length))).toEqual(new Set([16]));
    expect(new Set(STREET.legend.map((row) => row.length))).toEqual(new Set([20]));
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
