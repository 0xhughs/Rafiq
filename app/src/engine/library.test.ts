import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { ARCHIVE, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import {
  NEEDED_STRING_LIST,
  NOTE_TEXT,
  PACK_STAMP_RAFIQ,
  PRIVATE_STRING_LIST,
  communityFileHasPlayerName,
  communityFileSource,
  createLibraryQuest,
  loadNote,
  parseLibraryQuest,
  payloadHasNeededFacts,
  payloadHasPrivate,
  recitationFrom,
  windowHasConstraintAndHold,
} from './library';
import { createParcelQuest } from './parcel';
import { parseEvidence } from './shop';
import { createInitialState, reduce } from './state';
import { hydrateSave, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';

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

function act(state: GameState, action: GameAction): GameState {
  return reduce(state, action);
}

function pickupTrash(state: GameState): GameState {
  let next = at(state, WORLD_POS.trash.x, WORLD_POS.trash.y, 'apartment');
  next = act(next, { type: 'INTERACT' });
  if (next.mode === 'dialogue') next = act(next, { type: 'ADVANCE_DIALOGUE' });
  return next;
}

function toStreet(state: GameState): GameState {
  return act(at(state, WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y, 'apartment'), {
    type: 'INTERACT',
  });
}

function disposeBag(state: GameState): GameState {
  return act(at(state, WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y, 'street'), {
    type: 'INTERACT',
  });
}

function acceptHelp(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
  const order = ['discover', 'hello', 'introduce', 'broken', 'wrong_fact', 'fact_admission'] as const;
  for (const node of order) {
    expect(next.dialogueNode).toBe(node);
    next = act(next, { type: 'ADVANCE_DIALOGUE' });
  }
  next = act(next, { type: 'CHOOSE', choice: 'agree' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  return next;
}

function checkpoint(): GameState {
  return acceptHelp(disposeBag(toStreet(pickupTrash(start()))));
}

function interactShop(state: GameState, x: number, y: number): GameState {
  return act(at(state, x, y, 'shop'), { type: 'INTERACT' });
}

function skipExplain(state: GameState): GameState {
  if (state.mode !== 'explain') return state;
  return act(state, { type: 'SKIP_EXPLAIN' });
}

function playShopHelped(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y, 'street'), { type: 'INTERACT' });
  next = interactShop(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = interactShop(next, WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = interactShop(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'tell_no_mango' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  next = interactShop(next, WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = interactShop(next, WORLD_POS.calculator.x, WORLD_POS.calculator.y);
  for (const key of ['3', '×', '3', '+', '2', '×', '4', '='] as const) {
    next = act(next, { type: 'CALCULATOR_KEY', key });
  }
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = interactShop(next, WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
  next = act(next, { type: 'NOTICE_APPLY', field: 'total' });
  next = act(next, { type: 'NOTICE_APPLY', field: 'dates' });
  next = act(next, { type: 'NOTICE_APPLY', field: 'water' });
  next = act(next, { type: 'NOTICE_POST', asDraft: false });
  next = skipExplain(next);
  next = interactShop(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'CHOOSE', choice: 'refuse_dates' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = interactShop(next, WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = interactShop(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'correct_dates' });
  next = act(next, { type: 'CHOOSE', choice: 'verify_later' });
  next = interactShop(next, WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = interactShop(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'reject_water' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  next = interactShop(next, WORLD_POS.crate.x, WORLD_POS.crate.y);
  next = act(next, { type: 'CRATE_DECIDE', who: 'shopkeeper' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  expect(next.shopQuest.phase).toBe('helped');
  expect(next.evidence['1.4']).toBeUndefined();
  expect(next.evidence['1.5']).toBeUndefined();
  expect(next.evidence['2.5']).toBeUndefined();
  return next;
}

function interactParcel(state: GameState, x: number, y: number): GameState {
  return act(at(state, x, y, 'parcel'), { type: 'INTERACT' });
}

function playParcelDone(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.parcelDoor.x, WORLD_POS.parcelDoor.y, 'street'), {
    type: 'INTERACT',
  });
  next = interactParcel(next, WORLD_POS.clerk.x, WORLD_POS.clerk.y);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(at(next, WORLD_POS.parcelTalk.x, WORLD_POS.parcelTalk.y, 'parcel'), { type: 'INTERACT' });
  next = act(next, { type: 'CHOOSE', choice: 'delegate_retrieve' });
  next = act(next, { type: 'CHOOSE', choice: 'stop_overbroad' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  next = interactParcel(next, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  next = act(next, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'r17' });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'location', value: 'west' });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'constraints', value: 'repair_no_pay' });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'returnFormat', value: 'tag_to_desk' });
  next = act(next, { type: 'INSTRUCTION_SEND' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  expect(next.parcelQuest.commsRepaired).toBe(true);
  expect(next.storyObjective).toBe(OBJECTIVES.parcelDone);
  expect(next.evidence['1.4']).toBeUndefined();
  expect(next.evidence['1.5']).toBeUndefined();
  expect(next.evidence['2.5']).toBeUndefined();
  return next;
}

function enterArchive(state: GameState): GameState {
  return act(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
    type: 'INTERACT',
  });
}

function openContext(state: GameState): GameState {
  return act(at(state, WORLD_POS.contextBench.x, WORLD_POS.contextBench.y, 'archive'), {
    type: 'INTERACT',
  });
}

function openFile(state: GameState): GameState {
  return act(at(state, WORLD_POS.communityFile.x, WORLD_POS.communityFile.y, 'archive'), {
    type: 'INTERACT',
  });
}

function openPack(state: GameState): GameState {
  return act(at(state, WORLD_POS.packTable.x, WORLD_POS.packTable.y, 'archive'), { type: 'INTERACT' });
}

function restoreConstraint(state: GameState): GameState {
  let next = state.mode === 'context' ? state : openContext(state);
  next = act(next, { type: 'CONTEXT_LOAD', note: 'constraint' });
  next = act(next, { type: 'CONTEXT_LOAD', note: 'hold' });
  next = act(next, { type: 'CONTEXT_RECITE' });
  return next;
}

function redactAll(state: GameState): GameState {
  let next = state.mode === 'redact' ? state : openFile(state);
  next = act(next, { type: 'REDACT_TOGGLE', field: 'name_noura' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'name_khalid' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'phone' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'address' });
  return next;
}

function assembleCorrectPack(state: GameState): GameState {
  let next = state.mode === 'pack' ? state : openPack(state);
  next = act(next, { type: 'PACK_TOGGLE', file: 'spec' });
  next = act(next, { type: 'PACK_TOGGLE', file: 'delivery' });
  next = act(next, { type: 'PACK_STAMP', stamp: 'rafiq_repair' });
  next = act(next, { type: 'PACK_ASSEMBLE' });
  return next;
}

describe('archive access', () => {
  it('keeps F locked until commsRepaired, then enters archive without moving 01-04 landmarks', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * 48 + 24, y: 5 * 48 + 24 });
    expect(WORLD_POS.libraryInner).toEqual({ x: 6 * 48 + 24, y: 4 * 48 + 24 });
    let state = act(at(checkpoint(), WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('library');
    expect(state.dialogueNode).toBe('library_inner_locked');
    state = playShopHelped(checkpoint());
    state = act(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('library_inner_locked');
    expect(state.evidence['1.4']).toBeUndefined();
    state = playParcelDone(playShopHelped(checkpoint()));
    state = enterArchive(state);
    expect(state.map).toBe('archive');
    expect(playerHitsSolid('archive', state.position.x, state.position.y)).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'archive_visit')).toBe(true);
    expect(new Set(ARCHIVE.legend.map((row) => row.length))).toEqual(new Set([16]));
  });
});

describe('1.4 working window', () => {
  it('starts full of decoys, overflows FIFO, and awards only after overflow and constraint recitation', () => {
    let state = enterArchive(playParcelDone(playShopHelped(checkpoint())));
    expect(state.libraryQuest.windowSlots).toEqual(['festival', 'mango']);
    const loaded = loadNote(state.libraryQuest.windowSlots, 'constraint');
    expect(loaded.dropped).toBe('festival');
    expect(loaded.slots).toEqual(['mango', 'constraint']);
    state = openContext(state);
    expect(state.mode).toBe('context');
    state = act(state, { type: 'CONTEXT_PIN', note: 'constraint' });
    expect(state.libraryQuest.pinnedNotes).toContain('constraint');
    expect(state.evidence['1.4']).toBeUndefined();
    state = act(state, { type: 'CONTEXT_RECITE' });
    expect(state.evidence['1.4']).toBeUndefined();
    expect(state.libraryQuest.lastRecitation).not.toBe(NOTE_TEXT.constraint);
    state = act(state, { type: 'CONTEXT_LOAD', note: 'constraint' });
    expect(state.libraryQuest.overflowSeen).toBe(true);
    expect(state.libraryQuest.windowSlots).toEqual(['mango', 'constraint']);
    expect(state.libraryQuest.lastDroppedNote).toBe('festival');
    expect(state.evidence['1.4']).toBeUndefined();
    state = act(state, { type: 'CONTEXT_LOAD', note: 'hold' });
    expect(state.libraryQuest.windowSlots).toEqual(['constraint', 'hold']);
    expect(windowHasConstraintAndHold(state.libraryQuest.windowSlots)).toBe(true);
    expect(state.evidence['1.4']).toBeUndefined();
    state = act(state, { type: 'CONTEXT_RECITE' });
    expect(state.libraryQuest.lastRecitation).toBe(NOTE_TEXT.constraint);
    expect(recitationFrom(state.libraryQuest.windowSlots)).toBe(NOTE_TEXT.constraint);
    expect(state.evidence['1.4']).toBe('demonstrated');
    expect(state.journalEvents.some((event) => event.id === 'constraint_restored')).toBe(true);
    expect(state.evidence['2.5']).toBeUndefined();
  });

  it('does not treat pin or journal as the 1.4 path', () => {
    let state = openContext(enterArchive(playParcelDone(playShopHelped(checkpoint()))));
    state = act(state, { type: 'CONTEXT_PIN', note: 'constraint' });
    state = act(state, { type: 'CONTEXT_PIN', note: 'hold' });
    expect(state.libraryQuest.pinnedNotes).toEqual(['constraint', 'hold']);
    expect(state.libraryQuest.windowSlots).toEqual(['festival', 'mango']);
    expect(state.evidence['1.4']).toBeUndefined();
  });
});

describe('1.5 community file', () => {
  it('keeps the player name out of the file and awards only a clean needed payload', () => {
    const player = 'ZAYNAB-PRIVACY-PROBE';
    let state = start(player);
    state = playParcelDone(playShopHelped(acceptHelp(disposeBag(toStreet(pickupTrash(state))))));
    state = enterArchive(state);
    const source = communityFileSource();
    for (const item of PRIVATE_STRING_LIST) expect(source).toContain(item);
    for (const item of NEEDED_STRING_LIST) expect(source).toContain(item);
    expect(communityFileHasPlayerName(player)).toBe(false);
    expect(source).not.toContain(player);
    state = openFile(state);
    expect(state.mode).toBe('redact');
    expect(state.evidence['1.5']).toBeUndefined();
    state = act(state, { type: 'REDACT_GIVE' });
    expect(state.evidence['1.5']).toBeUndefined();
    expect(payloadHasPrivate(state.libraryQuest.lastPayload)).toBe(true);
    state = redactAll(state);
    state = act(state, { type: 'FACT_TOGGLE', field: 'shelf' });
    state = act(state, { type: 'REDACT_GIVE' });
    expect(state.evidence['1.5']).toBeUndefined();
    expect(payloadHasNeededFacts(state.libraryQuest.lastPayload)).toBe(false);
    state = act(state, { type: 'FACT_TOGGLE', field: 'shelf' });
    state = act(state, { type: 'REDACT_GIVE' });
    expect(payloadHasPrivate(state.libraryQuest.lastPayload)).toBe(false);
    expect(payloadHasNeededFacts(state.libraryQuest.lastPayload)).toBe(true);
    expect(state.libraryQuest.lastPayload).not.toContain(player);
    expect(state.evidence['1.5']).toBe('demonstrated');
    expect(state.journalEvents.some((event) => event.id === 'file_redacted')).toBe(true);
  });
});

describe('2.5 named pack', () => {
  it('requires حزمة إصلاح رفيق with spec+delivery and rejects decoys, unnamed, and festival stamp', () => {
    let state = openPack(enterArchive(playParcelDone(playShopHelped(checkpoint()))));
    expect(PACK_STAMP_RAFIQ).toBe('حزمة إصلاح رفيق');
    state = act(state, { type: 'PACK_ASSEMBLE' });
    expect(state.evidence['2.5']).toBeUndefined();
    state = act(state, { type: 'PACK_TOGGLE', file: 'spec' });
    state = act(state, { type: 'PACK_TOGGLE', file: 'delivery' });
    state = act(state, { type: 'PACK_STAMP', stamp: 'festival' });
    state = act(state, { type: 'PACK_ASSEMBLE' });
    expect(state.evidence['2.5']).toBeUndefined();
    state = act(state, { type: 'PACK_STAMP', stamp: 'rafiq_repair' });
    state = act(state, { type: 'PACK_TOGGLE', file: 'festival' });
    state = act(state, { type: 'PACK_ASSEMBLE' });
    expect(state.evidence['2.5']).toBeUndefined();
    state = act(state, { type: 'PACK_TOGGLE', file: 'festival' });
    state = act(state, { type: 'PACK_ASSEMBLE' });
    expect(state.evidence['2.5']).toBe('demonstrated');
    expect(state.journalEvents.some((event) => event.id === 'pack_assembled')).toBe(true);
    expect(state.evidence['1.4']).toBeUndefined();
  });

  it('does not treat the 1.4 window as the 2.5 path', () => {
    const state = restoreConstraint(enterArchive(playParcelDone(playShopHelped(checkpoint()))));
    expect(state.evidence['1.4']).toBe('demonstrated');
    expect(state.evidence['2.5']).toBeUndefined();
    expect(state.libraryQuest.packAssembled).toBe(false);
  });
});

describe('module release and leftovers', () => {
  it('releases the spec, HUD cassette, and keeps the robot unsupported after 1.4+1.5+2.5', () => {
    let state = enterArchive(playParcelDone(playShopHelped(checkpoint())));
    state = restoreConstraint(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = redactAll(openFile(state));
    state = act(state, { type: 'REDACT_GIVE' });
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = assembleCorrectPack(state);
    expect(state.evidence['1.4']).toBe('demonstrated');
    expect(state.evidence['1.5']).toBe('demonstrated');
    expect(state.evidence['2.5']).toBe('demonstrated');
    expect(state.libraryQuest.specReleased).toBe(true);
    expect(state.libraryQuest.contextModule).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.moduleReady);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = act(at(state, WORLD_POS.specCase.x, WORLD_POS.specCase.y, 'archive'), { type: 'INTERACT' });
    expect(state.inspectTarget).toBe('spec');
    expect(state.libraryQuest.specReleased).toBe(true);
    expect(state.evidence['2.3']).toBeUndefined();
    expect(state.evidence['2.6']).toBeUndefined();
    expect(state.evidence['3.1']).toBeUndefined();
    expect(state.evidence['3.2']).toBeUndefined();
    expect(state.evidence['3.3']).toBeUndefined();
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_archive');
    expect(DIALOGUE.companion_after_archive.text(state.playerName)).toMatch(/الأخبار|منتصف/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness/);
  });

  it('hydrates missing libraryQuest as unstarted and keeps saveVersion 1', () => {
    const state = playShopHelped(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    expect(envelope.libraryQuest.windowSlots).toEqual(['festival', 'mango']);
    const legacy = { ...envelope, libraryQuest: undefined, librarian: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.libraryQuest).toEqual(createLibraryQuest());
    expect(hydrated.librarian).toBe('unmet');
    expect(parseLibraryQuest(undefined).phase).toBe('unstarted');
    expect(parseEvidence({ '1.4': 'demonstrated', '9.9': 'demonstrated' })).toEqual({
      '1.4': 'demonstrated',
    });
    expect(createParcelQuest().commsRepaired).toBe(false);
  });
});
