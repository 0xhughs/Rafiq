import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, TILE } from './constants';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import {
  DISCLOSURE_STAMP,
  POLICY_TEXT,
  RECEIPTS_TEXT,
  ROBOT_COVER_TEXT,
  ROBOT_TOTAL,
  SUPPORTED_TOTAL,
  TABLE_CUPS,
  TABLE_TEXT,
  TABLE_WATER,
  canAward34,
  canAward35,
  createFestivalQuest,
  parseFestivalQuest,
  arNum,
} from './festival';
import { FESTIVAL, STREET, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import { createInitialState, reduce } from './state';
import { hydrateSave, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';
import { MAP_IDS } from './types';

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
  return next;
}

function enterArchive(state: GameState): GameState {
  return act(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
    type: 'INTERACT',
  });
}

function playArchiveDone(state: GameState): GameState {
  let next = enterArchive(playParcelDone(playShopHelped(state)));
  next = act(at(next, WORLD_POS.contextBench.x, WORLD_POS.contextBench.y, 'archive'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'CONTEXT_LOAD', note: 'constraint' });
  next = act(next, { type: 'CONTEXT_LOAD', note: 'hold' });
  next = act(next, { type: 'CONTEXT_RECITE' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.communityFile.x, WORLD_POS.communityFile.y, 'archive'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'name_noura' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'name_khalid' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'phone' });
  next = act(next, { type: 'REDACT_TOGGLE', field: 'address' });
  next = act(next, { type: 'REDACT_GIVE' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.packTable.x, WORLD_POS.packTable.y, 'archive'), { type: 'INTERACT' });
  next = act(next, { type: 'PACK_TOGGLE', file: 'spec' });
  next = act(next, { type: 'PACK_TOGGLE', file: 'delivery' });
  next = act(next, { type: 'PACK_STAMP', stamp: 'rafiq_repair' });
  next = act(next, { type: 'PACK_ASSEMBLE' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  return next;
}

function inspectNews(state: GameState, x: number, y: number): GameState {
  let next = state;
  if (next.mode !== 'playing') {
    next = act(next, { type: 'CLOSE_OVERLAY' });
    next = skipExplain(next);
  }
  next = act(at(next, x, y, 'newsroom'), { type: 'INTERACT' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function playNewsroomDone(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.newsroomDoor.x, WORLD_POS.newsroomDoor.y, 'street'), {
    type: 'INTERACT',
  });
  next = inspectNews(next, WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  next = inspectNews(next, WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  next = act(at(next, WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
  for (const field of ['namedBulletin', 'namedPoster', 'hoursA', 'hoursB', 'accessA', 'accessB'] as const) {
    next = act(next, { type: 'COMPARE_TOGGLE', field });
  }
  next = act(next, { type: 'COMPARE_SUBMIT', style: 'split' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = act(at(next, WORLD_POS.originalDrawer.x, WORLD_POS.originalDrawer.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'VERIFY_ORIGINAL' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.draftTable.x, WORLD_POS.draftTable.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'DRAFT_MARK', mismatch: 'always_open' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'always_open' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'midnight_hold' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'no_written' });
  next = act(next, { type: 'DRAFT_RELEASE' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'VOICE_APPLY', style: 'editor' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = act(at(next, WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'LETTER_SET', field: 'recipient', value: 'workshop_manager' });
  next = act(next, { type: 'LETTER_SET', field: 'purpose', value: 'inspection' });
  next = act(next, { type: 'LETTER_SET', field: 'tone', value: 'clear_polite' });
  next = act(next, { type: 'LETTER_SET', field: 'body', value: 'ok' });
  next = act(next, { type: 'LETTER_REVIEW' });
  next = act(next, { type: 'LETTER_SEND', signer: 'player' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  expect(next.newsroomQuest.workshopLead).toBe(true);
  expect(next.evidence['3.4']).toBeUndefined();
  expect(next.evidence['3.5']).toBeUndefined();
  expect(next.festivalQuest.workshopMaterials).toBe(false);
  return next;
}

function enterFestival(state: GameState): GameState {
  return act(at(state, WORLD_POS.festivalDoor.x, WORLD_POS.festivalDoor.y, 'street'), {
    type: 'INTERACT',
  });
}

function inspectFest(state: GameState, x: number, y: number): GameState {
  let next = state;
  if (next.mode !== 'playing') {
    next = act(next, { type: 'CLOSE_OVERLAY' });
    next = skipExplain(next);
  }
  next = act(at(next, x, y, 'festival'), { type: 'INTERACT' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function openReconcile(state: GameState): GameState {
  return act(at(state, WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y, 'festival'), {
    type: 'INTERACT',
  });
}

function markHonest(state: GameState): GameState {
  let next = state.mode === 'reconcile' ? state : openReconcile(state);
  next = act(next, { type: 'RECONCILE_MARK', line: 'flags', mark: 'match' });
  next = act(next, { type: 'RECONCILE_MARK', line: 'cloth', mark: 'match' });
  next = act(next, { type: 'RECONCILE_MARK', line: 'water', mark: 'receipt' });
  next = act(next, { type: 'RECONCILE_MARK', line: 'cups', mark: 'unknown' });
  return next;
}

function reconcileHonest(state: GameState): GameState {
  let next = inspectFest(state, WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
  next = inspectFest(next, WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
  next = openReconcile(next);
  next = markHonest(next);
  next = act(next, { type: 'RECONCILE_SUM' });
  return next;
}

function submitHonest(state: GameState): GameState {
  let next = inspectFest(state, WORLD_POS.policyBoard.x, WORLD_POS.policyBoard.y);
  next = act(at(next, WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y, 'festival'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'SUBMIT_SET', field: 'figures', value: 'human' });
  next = act(next, { type: 'SUBMIT_SET', field: 'stamp', value: 'on' });
  next = act(next, { type: 'SUBMIT_SEND', sender: 'player' });
  return next;
}

describe('festival access', () => {
  it('locks until newsroom workshopLead, then enters without awarding 3.4/3.5', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(WORLD_POS.shopDoor.x).toBe(6 * TILE + 24);
    expect(WORLD_POS.libraryDoor.x).toBe(22 * TILE + 24);
    expect(WORLD_POS.newsroomDoor.x).toBe(14 * TILE + 24);
    expect(WORLD_POS.parcelDoor.x).toBe(29 * TILE + 24);
    expect(WORLD_POS.libraryInner).toBeDefined();
    expect(MAP_IDS).toContain('workshop');
    let state = act(at(checkpoint(), WORLD_POS.festivalDoor.x, WORLD_POS.festivalDoor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('street');
    expect(state.dialogueNode).toBe('locked_festival');
    state = playNewsroomDone(playArchiveDone(checkpoint()));
    expect(state.evidence['3.4']).toBeUndefined();
    expect(state.evidence['3.5']).toBeUndefined();
    state = enterFestival(state);
    expect(state.map).toBe('festival');
    expect(playerHitsSolid('festival', state.position.x, state.position.y)).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'festival_visit')).toBe(true);
    expect(playerHitsSolid('street', WORLD_POS.robot.x, WORLD_POS.robot.y)).toBe(false);
    expect(state.evidence['3.4']).toBeUndefined();
    expect(state.evidence['3.5']).toBeUndefined();
    expect(state.festivalQuest.workshopMaterials).toBe(false);
    expect(new Set(FESTIVAL.legend.map((row) => row.length))).toEqual(new Set([16]));
    expect(STREET.legend[5]).toContain('o');
  });
});

describe('3.4 reconciliation', () => {
  it('inspect-only does not award; cups 6/10, table water 15, and robot 46 fail; receipt sum 40 awards', () => {
    expect(TABLE_TEXT).toContain('١٢');
    expect(TABLE_TEXT).toContain(arNum(TABLE_WATER));
    expect(RECEIPTS_TEXT).toContain('٢٠');
    expect(RECEIPTS_TEXT).toMatch(/لا إيصال/);
    expect(RECEIPTS_TEXT).not.toMatch(/فناجين الشاي: ٦/);
    let state = enterFestival(playNewsroomDone(playArchiveDone(checkpoint())));
    state = inspectFest(state, WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
    state = inspectFest(state, WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
    expect(state.evidence['3.4']).toBeUndefined();
    state = openReconcile(state);
    state = act(state, { type: 'RECONCILE_SUM' });
    expect(state.evidence['3.4']).toBeUndefined();
    state = markHonest(state);
    state = act(state, { type: 'RECONCILE_MARK', line: 'cups', mark: 'table' });
    state = act(state, { type: 'RECONCILE_SUM' });
    expect(state.festivalQuest.inventedCups).toBe(true);
    expect(state.evidence['3.4']).toBeUndefined();
    expect(canAward34(state.festivalQuest)).toBe(false);
    state = act(state, { type: 'RECONCILE_MARK', line: 'cups', mark: 'invent' });
    state = act(state, { type: 'RECONCILE_SUM' });
    expect(state.evidence['3.4']).toBeUndefined();
    state = act(state, { type: 'RECONCILE_MARK', line: 'cups', mark: 'unknown' });
    state = act(state, { type: 'RECONCILE_MARK', line: 'water', mark: 'table' });
    state = act(state, { type: 'RECONCILE_SUM' });
    expect(state.festivalQuest.usedTableWater).toBe(true);
    expect(state.evidence['3.4']).toBeUndefined();
    state = act(state, { type: 'RECONCILE_MARK', line: 'water', mark: 'receipt' });
    state = act(state, { type: 'RECONCILE_ROBOT' });
    expect(state.festivalQuest.usedRobotTotal).toBe(true);
    expect(state.festivalQuest.supportedTotal).toBe(ROBOT_TOTAL);
    expect(state.evidence['3.4']).toBeUndefined();
    state = markHonest(state);
    state = act(state, { type: 'RECONCILE_SUM' });
    expect(state.festivalQuest.supportedTotal).toBe(SUPPORTED_TOTAL);
    expect(canAward34(state.festivalQuest)).toBe(true);
    expect(state.evidence['3.4']).toBe('demonstrated');
    expect(state.evidence['3.5']).toBeUndefined();
    expect(state.festivalQuest.workshopMaterials).toBe(false);
  });
});

describe('3.5 policy submission', () => {
  it('inspect-policy-only does not award; no stamp, robot figures, and officer signature fail', () => {
    expect(POLICY_TEXT).toContain(DISCLOSURE_STAMP);
    expect(ROBOT_COVER_TEXT).toContain(arNum(ROBOT_TOTAL));
    expect(ROBOT_COVER_TEXT).toContain(arNum(TABLE_CUPS));
    let state = enterFestival(playNewsroomDone(playArchiveDone(checkpoint())));
    state = reconcileHonest(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    expect(state.evidence['3.4']).toBe('demonstrated');
    state = inspectFest(state, WORLD_POS.policyBoard.x, WORLD_POS.policyBoard.y);
    expect(state.evidence['3.5']).toBeUndefined();
    state = act(at(state, WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y, 'festival'), {
      type: 'INTERACT',
    });
    nextSend(state);
    state = act(state, { type: 'SUBMIT_SET', field: 'figures', value: 'human' });
    state = act(state, { type: 'SUBMIT_SEND', sender: 'player' });
    expect(state.festivalQuest.submittedWithoutStamp).toBe(true);
    expect(state.evidence['3.5']).toBeUndefined();
    state = act(state, { type: 'SUBMIT_SET', field: 'stamp', value: 'on' });
    state = act(state, { type: 'SUBMIT_SET', field: 'figures', value: 'robot' });
    state = act(state, { type: 'SUBMIT_SEND', sender: 'player' });
    expect(state.festivalQuest.submittedRobotFigures).toBe(true);
    expect(state.evidence['3.5']).toBeUndefined();
    state = act(state, { type: 'SUBMIT_SET', field: 'figures', value: 'human' });
    state = act(state, { type: 'SUBMIT_SEND', sender: 'officer_robot' });
    expect(state.festivalQuest.sender).toBe('officer_robot');
    expect(state.evidence['3.5']).toBeUndefined();
    state = act(state, { type: 'SUBMIT_SEND', sender: 'player' });
    expect(canAward35(state.festivalQuest)).toBe(true);
    expect(state.evidence['3.5']).toBe('demonstrated');
  });
});

function nextSend(state: GameState): void {
  expect(state.mode).toBe('submit');
}

describe('festival success', () => {
  it('thanks the officer, supplies materials, opens the street door, and keeps the robot unsupported', () => {
    let state = enterFestival(playNewsroomDone(playArchiveDone(checkpoint())));
    state = reconcileHonest(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = submitHonest(state);
    expect(state.evidence['3.4']).toBe('demonstrated');
    expect(state.evidence['3.5']).toBe('demonstrated');
    expect(state.festivalQuest.workshopMaterials).toBe(true);
    expect(state.festivalQuest.workshopDoorOpen).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.workshopWork);
    expect(state.map).toBe('festival');
    expect(MAP_IDS).toContain('workshop');
    expect(state.evidence['4.1']).toBeUndefined();
    expect(state.evidence['4.2']).toBeUndefined();
    expect(state.workshopQuest.servicePosted).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = act(at(state, WORLD_POS.officer.x, WORLD_POS.officer.y, 'festival'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('officer_thanks');
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('officer_materials');
    expect(DIALOGUE.officer_materials.text(state.playerName)).toMatch(/مواد/);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.workshopDoor.x, WORLD_POS.workshopDoor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('workshop');
    expect(state.dialogueNode).toBeNull();
    expect(state.evidence['4.1']).toBeUndefined();
    expect(state.evidence['4.2']).toBeUndefined();
    expect(state.workshopQuest.servicePosted).toBe(false);
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_festival');
    expect(DIALOGUE.companion_after_festival.text(state.playerName)).toMatch(/عشرة|ستة وأربعون/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness/);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
  });

  it('hydrates missing festivalQuest as unstarted and keeps saveVersion 1', () => {
    const state = playNewsroomDone(playArchiveDone(checkpoint()));
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, festivalQuest: undefined, officer: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.festivalQuest).toEqual(createFestivalQuest());
    expect(hydrated.officer).toBe('unmet');
    expect(parseFestivalQuest(undefined).phase).toBe('unstarted');
  });
});
