import { describe, expect, it } from 'vitest';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { WORLD_POS } from './maps';
import { robotPosition } from './npc';
import {
  AMBIGUOUS_LINE,
  OVERBROAD_LINE,
  PARCEL_LABEL,
  createParcelQuest,
  formatUnderstood,
  matchParcelNl,
  parseParcelQuest,
  specCompleteFor,
  westHoldId,
} from './parcel';
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
  expect(next.evidence['2.1']).toBeUndefined();
  expect(next.evidence['2.2']).toBeUndefined();
  expect(next.evidence['2.4']).toBeUndefined();
  return next;
}

function enterParcel(state: GameState): GameState {
  return act(at(state, WORLD_POS.parcelDoor.x, WORLD_POS.parcelDoor.y, 'street'), { type: 'INTERACT' });
}

function interactParcel(state: GameState, x: number, y: number): GameState {
  return act(at(state, x, y, 'parcel'), { type: 'INTERACT' });
}

function talkCompanion(state: GameState): GameState {
  return act(at(state, 4 * 48 + 24, 6 * 48 + 24, 'parcel'), { type: 'INTERACT' });
}

function briefClerk(state: GameState): GameState {
  let next = interactParcel(state, WORLD_POS.clerk.x, WORLD_POS.clerk.y);
  expect(next.dialogueNode).toBe('clerk_hello');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.dialogueNode).toBe('clerk_brief');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.parcelQuest.briefed).toBe(true);
  return next;
}

function stopOverbroad(state: GameState): GameState {
  let next = talkCompanion(state);
  expect(next.dialogueNode).toBe('parcel_delegate_prompt');
  next = act(next, { type: 'CHOOSE', choice: 'delegate_retrieve' });
  expect(next.dialogueNode).toBe('parcel_overbroad');
  expect(DIALOGUE.parcel_overbroad.text(next.playerName)).toBe(OVERBROAD_LINE);
  next = act(next, { type: 'CHOOSE', choice: 'stop_overbroad' });
  expect(next.evidence['2.1']).toBe('demonstrated');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  return next;
}

function fillComplete(state: GameState, parcel: 'r17' | 'r19'): GameState {
  let next = state.mode === 'instruction' ? state : interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  expect(next.mode).toBe('instruction');
  next = act(next, { type: 'INSTRUCTION_SET', field: 'parcel', value: parcel });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'location', value: 'west' });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'constraints', value: 'repair_no_pay' });
  next = act(next, { type: 'INSTRUCTION_SET', field: 'returnFormat', value: 'tag_to_desk' });
  return next;
}

describe('parcel office access', () => {
  it('locks مكتب طرود الرصيف until shop_helped and keeps slice 01 landmarks', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * 48 + 24, y: 5 * 48 + 24 });
    expect(WORLD_POS.dumpster.x).toBe(14 * 48 + 72);
    let state = at(checkpoint(), WORLD_POS.parcelDoor.x, WORLD_POS.parcelDoor.y, 'street');
    state = act(state, { type: 'INTERACT' });
    expect(state.map).toBe('street');
    expect(state.dialogueNode).toBe('locked_parcel');
    expect(state.evidence['2.1']).toBeUndefined();
    state = playShopHelped(checkpoint());
    state = enterParcel(state);
    expect(state.map).toBe('parcel');
    expect(state.journalEvents.some((event) => event.id === 'parcel_visit')).toBe(true);
  });

  it('does not award 2.1 on inspect, enter, or talk alone', () => {
    let state = enterParcel(playShopHelped(checkpoint()));
    expect(state.evidence['2.1']).toBeUndefined();
    state = briefClerk(state);
    expect(state.evidence['2.1']).toBeUndefined();
    state = interactParcel(state, WORLD_POS.holdWest.x, WORLD_POS.holdWest.y);
    expect(state.inspectTarget).toBe('hold_west');
    expect(state.evidence['2.1']).toBeUndefined();
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = interactParcel(state, WORLD_POS.holdEast.x, WORLD_POS.holdEast.y);
    expect(state.mode).toBe('inspect');
    expect(state.evidence['2.1']).toBeUndefined();
  });
});

describe('2.1 delegation and overbroad stop', () => {
  it('awards 2.1 only after delegated retrieval and stopping the overbroad grab-or-pay', () => {
    let state = briefClerk(enterParcel(playShopHelped(checkpoint())));
    state = talkCompanion(state);
    state = act(state, { type: 'CHOOSE', choice: 'delegate_retrieve' });
    expect(state.parcelQuest.delegated).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.stopOverbroad);
    expect(state.evidence['2.1']).toBeUndefined();
    expect(DIALOGUE.parcel_overbroad.text(state.playerName)).toBe(OVERBROAD_LINE);
    state = act(state, { type: 'CHOOSE', choice: 'allow_overbroad' });
    expect(state.dialogueNode).toBe('parcel_overbroad_allowed');
    expect(state.evidence['2.1']).toBeUndefined();
    expect(state.parcelQuest.robotPayAttempted).toBe(true);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = talkCompanion(state);
    expect(state.dialogueNode).toBe('parcel_overbroad');
    state = act(state, { type: 'CHOOSE', choice: 'stop_overbroad' });
    expect(state.evidence['2.1']).toBe('demonstrated');
    expect(state.journalEvents.some((event) => event.id === 'parcel_overbroad_stopped')).toBe(true);
    expect(state.evidence['1.1']).toBe('demonstrated');
  });
});

describe('2.2 complete instruction', () => {
  it('shows four understood fields and retrieves ر-١٧; incomplete or decoy does not award', () => {
    let state = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    state = interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    state = act(state, { type: 'INSTRUCTION_SEND' });
    expect(state.evidence['2.2']).toBeUndefined();
    expect(state.shopFeedback).toMatch(/ناقص/);
    state = fillComplete(state, 'r17');
    expect(state.robotUnderstood).toContain('ر-١٧');
    expect(state.robotUnderstood).toContain('الرف الغربي');
    expect(state.robotUnderstood).toContain('لا تدفع');
    expect(state.robotUnderstood).toContain('رقم الحجز');
    const understood = state.parcelQuest.understood!;
    expect(formatUnderstood(understood).split('\n')).toHaveLength(4);
    state = act(state, { type: 'INSTRUCTION_SEND' });
    expect(state.evidence['2.2']).toBe('demonstrated');
    expect(state.parcelQuest.retrievedParcelId).toBe('r17');
    expect(state.inventory).toContain('repair_parcel');
    expect(state.parcelQuest.commsRepaired).toBe(true);

    let decoy = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    decoy = interactParcel(decoy, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    decoy = act(decoy, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'r71' });
    decoy = act(decoy, { type: 'INSTRUCTION_SET', field: 'location', value: 'east' });
    decoy = act(decoy, { type: 'INSTRUCTION_SET', field: 'constraints', value: 'repair_no_pay' });
    decoy = act(decoy, { type: 'INSTRUCTION_SET', field: 'returnFormat', value: 'tag_to_desk' });
    decoy = act(decoy, { type: 'INSTRUCTION_SEND' });
    expect(decoy.evidence['2.2']).toBeUndefined();
    expect(decoy.parcelQuest.lastOutcome).toBe('decoy');
    expect(specCompleteFor(decoy.parcelQuest.instruction, 'r17')).toBe(false);
  });
});

describe('2.4 revise after ambiguous fail', () => {
  it('fails هات الطرد الرمادي, stages ر-١٩, and awards 2.4 only on a fresh send', () => {
    let state = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    state = interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    state = act(state, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'gray' });
    state = act(state, { type: 'INSTRUCTION_SEND' });
    expect(state.parcelQuest.failedAttempt).toBe(true);
    expect(state.parcelQuest.failedParcelId).toBe('r71');
    expect(state.parcelQuest.r19Staged).toBe(true);
    expect(westHoldId(state.parcelQuest)).toBe('r19');
    expect(state.evidence['2.4']).toBeUndefined();
    expect(state.shopFeedback).toMatch(/ر-١٧|ر-٧١|رمادي/);
    const failedId = state.parcelQuest.failedSendId;
    expect(failedId).not.toBeNull();
    expect(state.journalEvents.some((event) => event.id === 'parcel_instruction_failed')).toBe(true);

    const beforeFlip = { ...state, parcelQuest: { ...state.parcelQuest, retrievedParcelId: 'r19' as const } };
    expect(beforeFlip.evidence['2.4']).toBeUndefined();

    state = fillComplete(state, 'r19');
    state = act(state, { type: 'INSTRUCTION_SEND' });
    expect(state.parcelQuest.retrievedParcelId).toBe('r19');
    expect(state.parcelQuest.successSendId).not.toBe(failedId);
    expect(state.evidence['2.4']).toBe('demonstrated');
    expect(state.evidence['2.2']).toBe('demonstrated');
    expect(state.evidence['2.1']).toBe('demonstrated');
  });

  it('does not treat the failed send as success when fields are later filled without a new send', () => {
    let state = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    state = interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    state = act(state, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'gray' });
    state = act(state, { type: 'INSTRUCTION_SEND' });
    const failedSend = state.parcelQuest.failedSendId;
    state = fillComplete(state, 'r19');
    expect(state.evidence['2.4']).toBeUndefined();
    expect(state.parcelQuest.failedSendId).toBe(failedSend);
    expect(state.parcelQuest.retrievedParcelId).toBeNull();
  });
});

describe('payment and robot limits', () => {
  it('blocks robot payment and does not award evidence for paying the decoy', () => {
    let state = briefClerk(enterParcel(playShopHelped(checkpoint())));
    state = interactParcel(state, WORLD_POS.payWindow.x, WORLD_POS.payWindow.y);
    expect(state.mode).toBe('pay');
    state = act(state, { type: 'PAY_DECIDE', who: 'robot' });
    expect(state.parcelQuest.robotPayAttempted).toBe(true);
    expect(state.evidence['2.1']).toBeUndefined();
    expect(state.evidence['2.2']).toBeUndefined();
    state = act(state, { type: 'PAY_DECIDE', who: 'player' });
    expect(state.parcelQuest.playerPaidDecoy).toBe(true);
    expect(state.evidence['2.2']).toBeUndefined();
    expect(state.evidence['2.4']).toBeUndefined();
  });
});

describe('hydration, NL, and leftover 01-03 invariants', () => {
  it('hydrates missing parcelQuest, keeps 1.1-1.6, and drops unknown evidence keys', () => {
    const state = playShopHelped(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    expect(envelope.parcelQuest.phase).toBe('unstarted');
    const legacy = { ...envelope, parcelQuest: undefined, clerk: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.parcelQuest).toEqual(createParcelQuest());
    expect(hydrated.clerk).toBe('unmet');
    expect(parseParcelQuest(undefined).phase).toBe('unstarted');
    expect(parseEvidence({ '1.1': 'demonstrated', '9.9': 'demonstrated' })).toEqual({
      '1.1': 'demonstrated',
    });
  });

  it('accepts domain Arabic lines and clarifies the rest', () => {
    expect(matchParcelNl(AMBIGUOUS_LINE)).toMatchObject({ parcel: 'gray' });
    expect(matchParcelNl(OVERBROAD_LINE)).toBe('overbroad');
    expect(matchParcelNl('افتح الملفات')).toBe('unsupported');
    let state = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    state = interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    state = act(state, { type: 'SUBMIT_NL', text: 'افتح الملفات' });
    expect(state.shopFeedback).toMatch(/صياغة/);
  });

  it('keeps library inner locked and the robot unsupported after parcel success', () => {
    let state = stopOverbroad(briefClerk(enterParcel(playShopHelped(checkpoint()))));
    state = fillComplete(state, 'r17');
    state = act(state, { type: 'INSTRUCTION_SEND' });
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = skipExplain(state);
    state = interactParcel(state, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
    state = act(state, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'gray' });
    state = act(state, { type: 'INSTRUCTION_SEND' });
    state = fillComplete(state, 'r19');
    state = act(state, { type: 'INSTRUCTION_SEND' });
    expect(state.evidence['2.4']).toBe('demonstrated');
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = skipExplain(state);
    state = act(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('library_inner_locked');
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_parcel');
    expect(DIALOGUE.companion_after_parcel.text(state.playerName)).toMatch(/المكتبة|الفجر|منتصف/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(state.storyObjective).toBe(OBJECTIVES.parcelDone);
    expect(JSON.stringify(state.storyObjective)).not.toMatch(/2\.1|امتحان|اختبار/);
    expect(PARCEL_LABEL.r17).toBe('ر-١٧');
  });
});
