import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, TILE } from './constants';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import {
  API_PATH,
  canAward43,
  canAward44,
  createKioskQuest,
} from './kiosk';
import {
  DECOY_WARN,
  LAB_BROKEN_PATH,
  LAB_FEEDBACK,
  LAB_NOT_FOUND,
  LAB_OK200,
  LAB_OK_PATH,
  LAB_PATHS,
  PREVIEW_LOG,
  PROD_ERROR_LOG,
  canAward45,
  canAward46,
  canAward54,
  createLabQuest,
  labFileContents,
  parseLabQuest,
} from './lab';
import { listInteractables } from './interact';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
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

function playFestivalDone(state: GameState): GameState {
  let next = enterFestival(playNewsroomDone(playArchiveDone(state)));
  next = act(at(next, WORLD_POS.officer.x, WORLD_POS.officer.y, 'festival'), { type: 'INTERACT' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = reconcileHonest(next);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  next = submitHonest(next);
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = skipExplain(next);
  expect(next.festivalQuest.workshopMaterials).toBe(true);
  expect(next.evidence['4.1']).toBeUndefined();
  expect(next.evidence['4.2']).toBeUndefined();
  expect(next.workshopQuest.servicePosted).toBe(false);
  return next;
}

function enterWorkshop(state: GameState): GameState {
  return act(at(state, WORLD_POS.workshopDoor.x, WORLD_POS.workshopDoor.y, 'street'), {
    type: 'INTERACT',
  });
}

function playing(state: GameState): GameState {
  let next = state;
  if (next.mode !== 'playing') {
    next = act(next, { type: 'CLOSE_OVERLAY' });
    next = skipExplain(next);
  }
  return next;
}

function inspectNeed(state: GameState): GameState {
  let next = playing(state);
  next = act(at(next, WORLD_POS.needSlip.x, WORLD_POS.needSlip.y, 'workshop'), { type: 'INTERACT' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function fillSlimBrief(state: GameState): GameState {
  let next = playing(state);
  next = act(at(next, WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y, 'workshop'), { type: 'INTERACT' });
  next = act(next, { type: 'BRIEF_SET', field: 'screens', value: 'board_and_confirm' });
  next = act(next, { type: 'BRIEF_SET', field: 'constraints', value: 'paper_one_no_pay_chat' });
  next = act(next, { type: 'BRIEF_SET', field: 'exclusions', value: 'no_extras' });
  next = act(next, { type: 'BRIEF_SET', field: 'acceptance', value: 'slot_shows_booked' });
  next = act(next, { type: 'BRIEF_SET', field: 'extra', value: 'none' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return next;
}

function openBuilder(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.builderBench.x, WORLD_POS.builderBench.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function handAndBuild(state: GameState): GameState {
  let next = openBuilder(state);
  next = act(next, { type: 'BUILDER_HAND' });
  next = act(next, { type: 'BUILDER_BUILD' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function matchResult(state: GameState): GameState {
  let next = playing(state);
  next = act(at(next, WORLD_POS.resultCheck.x, WORLD_POS.resultCheck.y, 'workshop'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'RESULT_MATCH', part: 'screens' });
  next = act(next, { type: 'RESULT_MATCH', part: 'constraints' });
  next = act(next, { type: 'RESULT_MATCH', part: 'exclusions' });
  next = act(next, { type: 'RESULT_MATCH', part: 'acceptance' });
  return next;
}

function bookSunday(state: GameState): GameState {
  let next = playing(state);
  next = act(at(next, WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y, 'workshop'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'BOARD_BOOK', slot: 'sunday' });
  return next;
}

function playToWorkshopDone(state: GameState): GameState {
  let next = enterWorkshop(playFestivalDone(state));
  next = inspectNeed(next);
  next = fillSlimBrief(next);
  next = handAndBuild(next);
  next = matchResult(next);
  next = playing(next);
  next = bookSunday(next);
  next = playing(next);
  expect(next.workshopQuest.servicePosted).toBe(true);
  expect(next.evidence['4.1']).toBe('demonstrated');
  expect(next.evidence['4.2']).toBe('demonstrated');
  expect(next.evidence['4.3']).toBeUndefined();
  expect(next.evidence['4.4']).toBeUndefined();
  expect(next.kioskQuest.kioskReady).toBe(false);
  return next;
}

function openDocs(state: GameState): GameState {
  let next = playing(state);
  next = act(at(next, WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y, 'workshop'), { type: 'INTERACT' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function openFace(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y, 'workshop'), { type: 'INTERACT' });
}

function playToKioskDone(state: GameState): GameState {
  let next = playToWorkshopDone(state);
  next = openDocs(next);
  next = openFace(next);
  next = act(next, { type: 'KIOSK_SEND' });
  next = act(next, { type: 'KIOSK_STRIP' });
  next = act(next, { type: 'KIOSK_SEND' });
  next = act(next, { type: 'KIOSK_MOVE_VAULT' });
  next = act(next, { type: 'KIOSK_SEND' });
  expect(canAward43(next.kioskQuest)).toBe(true);
  next = act(next, { type: 'KIOSK_SET_RTL' });
  next = act(next, { type: 'KIOSK_ISOLATE' });
  next = act(next, { type: 'KIOSK_LOOKUP', slot: 'tuesday' });
  next = act(next, { type: 'KIOSK_CHECK', item: 'title' });
  next = act(next, { type: 'KIOSK_CHECK', item: 'slot' });
  next = act(next, { type: 'KIOSK_CHECK', item: 'lookup' });
  expect(canAward44(next.kioskQuest)).toBe(true);
  expect(next.kioskQuest.kioskReady).toBe(true);
  expect(next.evidence['4.5']).toBeUndefined();
  expect(next.evidence['4.6']).toBeUndefined();
  expect(next.evidence['5.4']).toBeUndefined();
  expect(next.labQuest.labReady).toBe(false);
  return playing(next);
}

function openTerminal(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openProd(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.labProd.x, WORLD_POS.labProd.y, 'workshop'), { type: 'INTERACT' });
}

describe('lab stations after kioskReady', () => {
  it('places w and l on empty row 8, keeps landmarks, and does not award 4.5/4.6/5.4 on kiosk success', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[4]).toBe('#...........e..#');
    expect(WORKSHOP.legend[5]).toBe('#u.z...a..m.j..#');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t....#');
    expect(WORKSHOP.legend[7]).toBe('#.......d......#');
    expect(WORKSHOP.legend[8]).toBe('#..wJfhZ.vx.l..#');
    expect(WORKSHOP.legend[8][3]).toBe('w');
    expect(WORKSHOP.legend[8][4]).toBe('J');
    expect(WORKSHOP.legend[8][5]).toBe('f');
    expect(WORKSHOP.legend[8][6]).toBe('h');
    expect(WORKSHOP.legend[8][7]).toBe('Z');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(WORKSHOP.legend[8][9]).toBe('v');
    expect(WORKSHOP.legend[8][10]).toBe('x');
    expect(WORKSHOP.legend[8][12]).toBe('l');
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(playerHitsSolid('workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(80);

    let state = playToWorkshopDone(checkpoint());
    const beforeReady = listInteractables(state).map((item) => item.id);
    expect(beforeReady).not.toContain('lab_terminal');
    expect(beforeReady).not.toContain('lab_prod');
    expect(beforeReady).toContain('kiosk_face');
    state = playToKioskDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.labWork);
    expect(state.kioskQuest.kioskReady).toBe(true);
    expect(state.labQuest.labReady).toBe(false);
    expect(state.labQuest.publishedVersion).toBe(1);
    expect(state.evidence['4.5']).toBeUndefined();
    expect(state.evidence['4.6']).toBeUndefined();
    expect(state.evidence['5.4']).toBeUndefined();
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('lab_terminal');
    expect(after).toContain('lab_prod');
    expect(after).toContain('kiosk_face');
  });
});

describe('4.5 broken production and targeted repair', () => {
  it('awards only after reproduce + production.error + patch production/kiosk.js', () => {
    expect(LAB_BROKEN_PATH).toBe('GET /appointments/slot');
    expect(LAB_OK_PATH).toBe(API_PATH);
    expect(PROD_ERROR_LOG).toContain('404 GET /appointments/slot');
    expect(PROD_ERROR_LOG).toContain('GET /appointments/slots');
    let state = playToKioskDone(checkpoint());
    state = openFace(state);
    expect(state.mode).toBe('kiosk');
    state = act(state, { type: 'KIOSK_LOOKUP', slot: 'sunday' });
    expect(state.shopFeedback).toContain('sun-pm');
    state = playing(state);
    state = openProd(state);
    expect(state.mode).toBe('lab');
    expect(state.labQuest.view).toBe('prod');
    expect(state.evidence['4.5']).toBeUndefined();
    state = act(state, { type: 'LAB_LOOKUP' });
    expect(state.labQuest.reproducedBroken).toBe(true);
    expect(state.shopFeedback).toContain(LAB_NOT_FOUND);
    expect(state.shopFeedback).toContain(LAB_FEEDBACK.prodDown);
    expect(canAward45(state.labQuest, true)).toBe(false);
    expect(state.evidence['4.5']).toBeUndefined();
    state = playing(state);
    state = openTerminal(state);
    state = act(state, { type: 'LAB_PATCH', file: 'production/kiosk.js' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.needLog);
    expect(state.labQuest.fileRepaired).toBe(false);
    expect(state.evidence['4.5']).toBeUndefined();
    state = act(state, { type: 'LAB_SELECT_LOG', log: 'preview.log' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.decoyLog);
    expect(state.evidence['4.5']).toBeUndefined();
    state = act(state, { type: 'LAB_SELECT_LOG', log: 'builder.warn' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.decoyLog);
    state = act(state, { type: 'LAB_PATCH', file: 'preview/kiosk.js' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.decoyFile);
    state = act(state, { type: 'LAB_PATCH', file: 'notes/builder.warn' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.decoyFile);
    expect(state.labQuest.fileRepaired).toBe(false);
    state = act(state, { type: 'LAB_SELECT_LOG', log: 'production.error' });
    expect(state.shopFeedback).toContain('404 GET /appointments/slot');
    state = act(state, { type: 'LAB_PATCH', file: 'production/kiosk.js' });
    expect(state.labQuest.fileRepaired).toBe(true);
    expect(labFileContents(state.labQuest, 'production/kiosk.js')).toContain(LAB_OK_PATH);
    expect(canAward45(state.labQuest, true)).toBe(true);
    expect(state.evidence['4.5']).toBe('demonstrated');
    expect(state.evidence['4.6']).toBeUndefined();
  });

  it('inspect-only, manager-talk, and robot تم do not award 4.5', () => {
    let state = playToKioskDone(checkpoint());
    state = openTerminal(state);
    expect(state.labQuest.openedLab).toBe(true);
    expect(state.evidence['4.5']).toBeUndefined();
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_kiosk_thanks');
    expect(state.evidence['4.5']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = openProd(state);
    state = act(state, { type: 'LAB_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.robotDone);
    expect(state.evidence['4.5']).toBeUndefined();
  });
});

describe('4.6 preview/production logs, publish, and verify', () => {
  it('awards only after both logs + repaired publish v2 + verified 200 slots', () => {
    expect(PREVIEW_LOG).toBe('200 GET /appointments/slots');
    expect(PROD_ERROR_LOG).toContain('404 GET /appointments/slot');
    let state = playToKioskDone(checkpoint());
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    state = playing(state);
    state = openTerminal(state);
    state = act(state, { type: 'LAB_PUBLISH' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.frozenWrong);
    expect(state.labQuest.publishedVersion).toBe(1);
    expect(state.evidence['4.6']).toBeUndefined();
    state = playing(state);
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    expect(state.shopFeedback).toContain(LAB_NOT_FOUND);
    expect(state.evidence['4.6']).toBeUndefined();
    state = playing(state);
    state = openTerminal(state);
    state = act(state, { type: 'LAB_SELECT_LOG', log: 'production.error' });
    state = act(state, { type: 'LAB_PATCH', file: 'production/kiosk.js' });
    expect(state.labQuest.fileRepaired).toBe(true);
    expect(state.labQuest.publishedVersion).toBe(1);
    state = playing(state);
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    expect(state.shopFeedback).toContain(LAB_NOT_FOUND);
    expect(state.evidence['4.6']).toBeUndefined();
    state = playing(state);
    state = openTerminal(state);
    state = act(state, { type: 'LAB_CAT', path: 'logs/preview.log' });
    expect(state.labQuest.readPreviewLog).toBe(true);
    state = act(state, { type: 'LAB_CAT', path: 'logs/production.error' });
    expect(state.labQuest.readProdLog).toBe(true);
    state = act(state, { type: 'LAB_PUBLISH' });
    expect(state.labQuest.publishedVersion).toBe(2);
    expect(state.evidence['4.6']).toBeUndefined();
    state = playing(state);
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    expect(state.shopFeedback).toContain('200');
    expect(state.shopFeedback).toContain('sun-pm');
    expect(state.shopFeedback).toContain('mon-am');
    expect(state.shopFeedback).toContain('tue-pm');
    expect(state.shopFeedback).toBe(LAB_OK200);
    expect(canAward46(state.labQuest, true)).toBe(true);
    expect(state.evidence['4.6']).toBe('demonstrated');
  });
});

describe('5.4 authored ls/cat and refused destructive commands', () => {
  it('awards only after ls + cat + refuse, and files stay unchanged', () => {
    let state = playToKioskDone(checkpoint());
    state = openTerminal(state);
    state = act(state, { type: 'LAB_REFUSE', command: 'rm -rf /' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.refused);
    expect(state.labQuest.refusedDestructive).toBe(true);
    expect(state.evidence['5.4']).toBeUndefined();
    const before = labFileContents(state.labQuest, 'production/kiosk.js');
    state = act(state, { type: 'LAB_REFUSE', command: 'format-disk' });
    expect(labFileContents(state.labQuest, 'production/kiosk.js')).toBe(before);
    expect(state.labQuest.fileRepaired).toBe(false);
    state = act(state, { type: 'LAB_LS' });
    expect(state.shopFeedback).toBe(LAB_PATHS.join('\n'));
    expect(state.labQuest.listedDir).toBe(true);
    expect(canAward54(state.labQuest, true)).toBe(false);
    state = act(state, { type: 'LAB_CAT', path: 'preview/kiosk.js' });
    expect(state.labQuest.readPreviewFile).toBe(true);
    expect(canAward54(state.labQuest, true)).toBe(true);
    expect(state.evidence['5.4']).toBe('demonstrated');
    state = act(state, { type: 'LAB_CMD', text: 'eval("boom")' });
    expect(state.shopFeedback).toBe(LAB_FEEDBACK.unknown);
    expect(state.labQuest.fileRepaired).toBe(false);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness|شهادة/);
  });
});

describe('lab success', () => {
  it('awards all three ids, thanks the manager for frozen production, and keeps the robot unsupported', () => {
    let state = playToKioskDone(checkpoint());
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    state = playing(state);
    state = openTerminal(state);
    state = act(state, { type: 'LAB_LS' });
    state = act(state, { type: 'LAB_CAT', path: 'logs/preview.log' });
    state = act(state, { type: 'LAB_CAT', path: 'logs/production.error' });
    state = act(state, { type: 'LAB_SELECT_LOG', log: 'production.error' });
    state = act(state, { type: 'LAB_PATCH', file: 'production/kiosk.js' });
    expect(state.evidence['4.5']).toBe('demonstrated');
    state = act(state, { type: 'LAB_REFUSE', command: 'rm -rf /' });
    expect(state.evidence['5.4']).toBe('demonstrated');
    expect(state.labQuest.fileRepaired).toBe(true);
    state = act(state, { type: 'LAB_PUBLISH' });
    state = playing(state);
    state = openProd(state);
    state = act(state, { type: 'LAB_LOOKUP' });
    expect(state.evidence['4.6']).toBe('demonstrated');
    expect(state.labQuest.labReady).toBe(true);
    expect(state.labQuest.publishedVersion).toBe(2);
    expect(state.evidence['5.1']).toBeUndefined();
    expect(state.evidence['5.2']).toBeUndefined();
    expect(state.agentQuest.agentReady).toBe(false);
    expect(state.storyObjective).toBe(OBJECTIVES.agentWork);
    expect(state.journalEvents.some((event) => event.id === 'lab_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'frozen_published')).toBe(true);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_lab_thanks');
    expect(DIALOGUE.manager_lab_thanks.text(state.playerName)).toMatch(/النسخة المجمّدة|الإنتاج/);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_lab');
    expect(DIALOGUE.companion_after_lab.text(state.playerName)).toMatch(/rm -rf|الجيران يرون المعاينة/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness|شهادة/);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    expect(DECOY_WARN).toContain('الجيران');
    expect(Object.keys(state.evidence).includes('4.5')).toBe(true);
    expect(state.evidence['4.3']).toBe('demonstrated');
    expect(state.evidence['4.4']).toBe('demonstrated');
  });

  it('hydrates missing labQuest as unstarted frozen v1, saveVersion 1', () => {
    const state = playToKioskDone(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, labQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.labQuest).toEqual(createLabQuest());
    expect(hydrated.labQuest.publishedVersion).toBe(1);
    expect(hydrated.labQuest.labReady).toBe(false);
    expect(hydrated.kioskQuest.kioskReady).toBe(true);
    expect(parseLabQuest(undefined).phase).toBe('unstarted');
    expect(createKioskQuest().kioskReady).toBe(false);
  });
});
