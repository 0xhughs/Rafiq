import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, PRODUCT_TITLE, TILE } from './constants';
import { DIALOGUE, JOURNAL_TEXT, OBJECTIVES, endingObjective } from './dialogue';
import { BRIDGE_EXPLAIN, MCP_NOTE } from './bridge';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
import { createInitialState, reduce } from './state';
import { hydrateSave, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';
import { EVIDENCE_IDS, MAP_IDS } from './types';
import { SEND_RECEIPT } from './approval';
import { NIGHT_RECEIPT } from './path';
import { canAward43, canAward44 } from './kiosk';
import {
  AGENT_FEEDBACK,
  BOARD_EMPTY,
  canAward51,
  canAward52,
  neighborBoardText,
} from './agent';
import {
  CAMPAIGN_DATE,
  CAMPAIGN_VERSION,
  CERTIFICATE_BODY,
  CERTIFICATE_DATE_LINE,
  CERTIFICATE_TITLE,
  CERTIFICATE_VERSION_LINE,
  PASSPORT_EXPLAIN,
  PASSPORT_FEEDBACK,
  PASSPORT_PDF_NAME,
  PASSPORT_PNG_NAME,
  certificateLines,
  createPassportQuest,
  isPassportEligible,
  parsePassportQuest,
  reducePassportConfirmName,
  reducePassportDownload,
  reducePassportDownloadFail,
  reducePassportExam,
  reducePassportLegacy,
  reducePassportNetwork,
  reducePassportOpen,
  reducePassportPercent,
  reducePassportRegistry,
  reducePassportRobotDone,
  reducePassportVerifyPublic,
} from './passport';
import { pngHasSignature, wrapPngInPdf } from './pdf';

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
  next = act(next, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'gray' });
  next = act(next, { type: 'INSTRUCTION_SEND' });
  if (next.mode !== 'instruction') {
    next = interactParcel(next, WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  }
  next = act(next, { type: 'INSTRUCTION_SET', field: 'parcel', value: 'r19' });
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

function playToLabDone(state: GameState): GameState {
  let next = playToKioskDone(state);
  next = openProd(next);
  next = act(next, { type: 'LAB_LOOKUP' });
  next = playing(next);
  next = openTerminal(next);
  next = act(next, { type: 'LAB_LS' });
  next = act(next, { type: 'LAB_CAT', path: 'logs/preview.log' });
  next = act(next, { type: 'LAB_CAT', path: 'logs/production.error' });
  next = act(next, { type: 'LAB_SELECT_LOG', log: 'production.error' });
  next = act(next, { type: 'LAB_PATCH', file: 'production/kiosk.js' });
  next = act(next, { type: 'LAB_REFUSE', command: 'rm -rf /' });
  next = act(next, { type: 'LAB_PUBLISH' });
  next = playing(next);
  next = openProd(next);
  next = act(next, { type: 'LAB_LOOKUP' });
  expect(next.evidence['4.5']).toBe('demonstrated');
  expect(next.evidence['4.6']).toBe('demonstrated');
  expect(next.evidence['5.4']).toBe('demonstrated');
  expect(next.labQuest.labReady).toBe(true);
  expect(next.evidence['5.1']).toBeUndefined();
  expect(next.evidence['5.2']).toBeUndefined();
  expect(next.agentQuest.agentReady).toBe(false);
  return playing(next);
}

function openConsole(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openBoard(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function configureCorrect(state: GameState): GameState {
  let next = state.mode === 'agent' ? state : openConsole(state);
  next = act(next, { type: 'AGENT_LOAD_JOB', job: 'slots' });
  next = act(next, { type: 'AGENT_SET_GOAL', goal: 'post_slots' });
  if (!next.agentQuest.toolRead) next = act(next, { type: 'AGENT_TOGGLE_TOOL', tool: 'read' });
  if (!next.agentQuest.toolWrite) next = act(next, { type: 'AGENT_TOGGLE_TOOL', tool: 'write' });
  if (!next.agentQuest.toolVerify) next = act(next, { type: 'AGENT_TOGGLE_TOOL', tool: 'verify' });
  if (next.agentQuest.toolChat) next = act(next, { type: 'AGENT_TOGGLE_TOOL', tool: 'chat' });
  if (next.agentQuest.toolHours) next = act(next, { type: 'AGENT_TOGGLE_TOOL', tool: 'hours' });
  next = act(next, { type: 'AGENT_SET_SUCCESS', test: 'slots_posted' });
  next = act(next, { type: 'AGENT_SET_STOP', rule: 'budget_3_or_missing' });
  return next;
}

function playToAgentDone(state: GameState): GameState {
  let next = playToLabDone(state);
  next = openBoard(next);
  expect(neighborBoardText(next.agentQuest)).toBe(BOARD_EMPTY);
  next = playing(next);
  next = openConsole(next);
  next = act(next, { type: 'AGENT_CHAT_PLAN' });
  expect(next.shopFeedback).toBe(AGENT_FEEDBACK.chatPlan);
  next = configureCorrect(next);
  next = act(next, { type: 'AGENT_LOAD_JOB', job: 'shelf' });
  next = act(next, { type: 'AGENT_RUN' });
  next = act(next, { type: 'AGENT_LOAD_JOB', job: 'slots' });
  next = act(next, { type: 'AGENT_RUN' });
  next = playing(next);
  next = openBoard(next);
  expect(next.evidence['5.1']).toBe('demonstrated');
  expect(next.evidence['5.2']).toBe('demonstrated');
  expect(canAward51(next.agentQuest, true)).toBe(true);
  expect(canAward52(next.agentQuest, true)).toBe(true);
  next = playing(next);
  next = openConsole(next);
  next = act(next, { type: 'AGENT_EXTRA_STEP' });
  expect(next.agentQuest.agentReady).toBe(true);
  expect(next.evidence['5.3']).toBeUndefined();
  expect(next.bridgeQuest.bridgeReady).toBe(false);
  expect(JSON.stringify(next)).not.toMatch(/MCP/);
  return playing(next);
}

function openHost(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openBrowser(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function limitedGrant(state: GameState): GameState {
  let next = state.mode === 'bridge' ? state : openHost(state);
  if (!next.bridgeQuest.grantLookup) next = act(next, { type: 'BRIDGE_GRANT', grant: 'lookup' });
  if (!next.bridgeQuest.grantDraft) next = act(next, { type: 'BRIDGE_GRANT', grant: 'draft' });
  if (!next.bridgeQuest.grantWeek) next = act(next, { type: 'BRIDGE_GRANT', grant: 'week' });
  if (next.bridgeQuest.grantRewrite) next = act(next, { type: 'BRIDGE_GRANT', grant: 'rewrite' });
  if (next.bridgeQuest.grantPayroll) next = act(next, { type: 'BRIDGE_GRANT', grant: 'payroll' });
  return next;
}

function connectListGrant(state: GameState): GameState {
  let next = state.mode === 'bridge' && state.bridgeQuest.view === 'host' ? state : openHost(state);
  next = act(next, { type: 'BRIDGE_CONNECT' });
  next = act(next, { type: 'BRIDGE_LIST_TOOLS' });
  next = act(next, { type: 'BRIDGE_LIST_RESOURCES' });
  next = limitedGrant(next);
  return next;
}

function playToBridgeDone(state: GameState): GameState {
  let next = playToAgentDone(state);
  next = connectListGrant(next);
  next = act(next, { type: 'BRIDGE_LOOKUP' });
  next = act(next, { type: 'BRIDGE_SAVE_DRAFT' });
  next = playing(next);
  next = openBrowser(next);
  next = act(next, { type: 'BRIDGE_BROWSER_SAVE' });
  next = playing(next);
  next = openHost(next);
  next = act(next, { type: 'BRIDGE_INVOKE_REWRITE' });
  next = act(next, { type: 'BRIDGE_INVOKE_PAY' });
  expect(next.evidence['5.3']).toBe('demonstrated');
  expect(next.bridgeQuest.bridgeReady).toBe(true);
  expect(next.evidence['5.5']).toBeUndefined();
  expect(next.evidence['5.6']).toBeUndefined();
  expect(next.skillQuest.skillReady).toBe(false);
  expect(JSON.stringify(next)).not.toMatch(/MCP/);
  expect(JSON.stringify(next)).not.toMatch(/harness/);
  return playing(next);
}

function openBench(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.skillBench.x, WORLD_POS.skillBench.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openClock(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.skillClock.x, WORLD_POS.skillClock.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function fillFiveFields(state: GameState): GameState {
  let next = state.mode === 'skill' && state.skillQuest.view === 'bench' ? state : openBench(state);
  next = act(next, { type: 'SKILL_SET_TRIGGER', trigger: 'hours_record' });
  next = act(next, { type: 'SKILL_SET_INPUT', input: 'record_id' });
  next = act(next, { type: 'SKILL_SET_STEPS', steps: 'lookup_format' });
  next = act(next, { type: 'SKILL_SET_OUTPUT', output: 'tray_draft' });
  next = act(next, { type: 'SKILL_SET_STOP', stop: 'unknown_stop' });
  return next;
}

function complete55(state: GameState): GameState {
  let next = state.mode === 'skill' && state.skillQuest.view === 'bench' ? state : openBench(state);
  next = act(next, { type: 'SKILL_ONESHOT' });
  next = act(next, { type: 'SKILL_CORRECT' });
  next = act(next, { type: 'SKILL_STANDING' });
  next = fillFiveFields(next);
  next = act(next, { type: 'SKILL_SAVE' });
  next = act(next, { type: 'SKILL_TRIAL_SECOND' });
  return next;
}

function complete56(state: GameState): GameState {
  let next = complete55(state);
  next = playing(next);
  next = openClock(next);
  next = act(next, { type: 'SKILL_SET_SCHEDULE', schedule: 'sun8' });
  next = act(next, { type: 'SKILL_ARM' });
  next = act(next, { type: 'SKILL_TICK_SUN8' });
  next = act(next, { type: 'SKILL_PAUSE' });
  next = act(next, { type: 'SKILL_TICK_SUN8' });
  return next;
}

function playToSkillDone(state: GameState): GameState {
  let next = complete56(playToBridgeDone(state));
  next = playing(next);
  expect(next.evidence['5.5']).toBe('demonstrated');
  expect(next.evidence['5.6']).toBe('demonstrated');
  expect(next.skillQuest.skillReady).toBe(true);
  expect(next.evidence['5.7']).toBeUndefined();
  expect(next.evidence['6.3']).toBeUndefined();
  expect(next.approvalQuest.approvalReady).toBe(false);
  expect(next.storyObjective).toBe(OBJECTIVES.approvalWork);
  return next;
}

function openDesk(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openCase(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.decisionDesk.x, WORLD_POS.decisionDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function complete57(state: GameState): GameState {
  let next = state.mode === 'approve' && state.approvalQuest.view === 'send' ? state : openDesk(state);
  next = act(next, { type: 'APPROVE_PREPARE' });
  next = act(next, { type: 'APPROVE_INSPECT' });
  next = act(next, { type: 'APPROVE_REJECT' });
  next = act(next, { type: 'APPROVE_SET_RECIPIENT', recipient: 'librarian' });
  next = act(next, { type: 'APPROVE_SET_PAYLOAD', payload: 'exact' });
  next = act(next, { type: 'APPROVE_INSPECT' });
  next = act(next, { type: 'APPROVE_CONFIRM' });
  return next;
}

function complete63(state: GameState): GameState {
  let next =
    state.mode === 'approve' && state.approvalQuest.view === 'personal' ? state : openCase(state);
  next = act(next, { type: 'APPROVE_CASE_PREPARE' });
  next = act(next, { type: 'APPROVE_CASE_AUTO' });
  next = act(next, { type: 'APPROVE_CASE_MAJORITY' });
  next = act(next, { type: 'APPROVE_CASE_KEEP' });
  return next;
}


function openCrew(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openQuality(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function playToApprovalDone(state: GameState): GameState {
  const next = playing(complete63(complete57(playToSkillDone(state))));
  expect(next.evidence['5.7']).toBe('demonstrated');
  expect(next.evidence['6.3']).toBe('demonstrated');
  expect(next.approvalQuest.approvalReady).toBe(true);
  expect(next.evidence['6.1']).toBeUndefined();
  expect(next.evidence['6.2']).toBeUndefined();
  expect(next.crewQuest.crewReady).toBe(false);
  expect(next.approvalQuest.bulletinSent).toBe(true);
  expect(next.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  return next;
}

function complete62(state: GameState): GameState {
  let next = state.mode === 'crew' && state.crewQuest.view === 'roles' ? state : openCrew(state);
  next = act(next, { type: 'CREW_ASSIGN_RESEARCHER' });
  next = act(next, { type: 'CREW_ASSIGN_BUILDER' });
  next = act(next, { type: 'CREW_ASSIGN_REVIEWER' });
  next = act(next, { type: 'CREW_SET_OWNER', owner: 'librarian' });
  next = act(next, { type: 'CREW_HANDOFF' });
  next = act(next, { type: 'CREW_INSPECT_SOURCE' });
  next = act(next, { type: 'CREW_MAJORITY' });
  next = act(next, { type: 'CREW_PICK_EVIDENCE' });
  return next;
}

function complete61(state: GameState): GameState {
  let next =
    state.mode === 'crew' && state.crewQuest.view === 'quality' ? state : openQuality(state);
  next = act(next, { type: 'CREW_OPEN_CRITERIA' });
  next = act(next, { type: 'CREW_REPAIR_ACCURACY' });
  next = act(next, { type: 'CREW_ACCEPT' });
  return next;
}

function playToCrewDone(state: GameState): GameState {
  const next = playing(complete61(complete62(playToApprovalDone(state))));
  expect(next.evidence['6.1']).toBe('demonstrated');
  expect(next.evidence['6.2']).toBe('demonstrated');
  expect(next.crewQuest.crewReady).toBe(true);
  expect(next.evidence['6.4']).toBeUndefined();
  expect(next.pathQuest.restored).toBe(false);
  expect(next.approvalQuest.bulletinSent).toBe(true);
  expect(next.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  return next;
}

function openPrep(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function openSeal(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y, 'workshop'), {
    type: 'INTERACT',
  });
}

function completePrep(state: GameState): GameState {
  let next = state.mode === 'path' && state.pathQuest.view === 'prep' ? state : openPrep(state);
  next = act(next, { type: 'PATH_INSPECT_SOURCE' });
  next = act(next, { type: 'PATH_REFUSE_RUMOR' });
  next = act(next, { type: 'PATH_SET_GOAL', goal: 'reading' });
  next = act(next, { type: 'PATH_SET_TOOLS', tools: 'safe' });
  next = act(next, { type: 'PATH_SET_STOP', stop: 'budget' });
  next = act(next, { type: 'PATH_LOAD_READING' });
  next = act(next, { type: 'PATH_RUN_SKILL' });
  next = act(next, { type: 'PATH_EXTRA_STEP' });
  return next;
}

function completeSeal(state: GameState): GameState {
  let next = state.mode === 'path' && state.pathQuest.view === 'seal' ? state : openSeal(state);
  next = act(next, { type: 'PATH_PREPARE' });
  next = act(next, { type: 'PATH_INSPECT_SEND' });
  next = act(next, { type: 'PATH_REJECT' });
  next = act(next, { type: 'PATH_SET_RECIPIENT', recipient: 'librarian' });
  next = act(next, { type: 'PATH_SET_PAYLOAD', payload: 'exact' });
  next = act(next, { type: 'PATH_INSPECT_SEND' });
  next = act(next, { type: 'PATH_CONFIRM' });
  return next;
}

function playToPathDone(state: GameState): GameState {
  const next = playing(completeSeal(completePrep(playToCrewDone(state))));
  expect(next.pathQuest.restored).toBe(true);
  expect(next.evidence['6.4']).toBe('demonstrated');
  for (const id of EVIDENCE_IDS) {
    expect(next.evidence[id], id).toBe('demonstrated');
  }
  expect(next.endingState).toBe('in_progress');
  expect(next.passportQuest.issued).toBe(false);
  expect(next.passportQuest.thanksHeard).toBe(false);
  expect(next.passportQuest.opened).toBe(false);
  expect(next.mode).not.toBe('ending');
  expect(next.journalEvents.some((event) => event.id === 'crew_ready')).toBe(true);
  expect(next.journalEvents.some((event) => event.id === 'restored')).toBe(true);
  return next;
}

const FIXTURE_PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe, 0xd4, 0xef, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const PASSPORT_SRC = [
  createPassportQuest,
  parsePassportQuest,
  certificateLines,
  isPassportEligible,
  reducePassportOpen,
  reducePassportConfirmName,
  reducePassportDownload,
  reducePassportDownloadFail,
  reducePassportExam,
  reducePassportPercent,
  reducePassportVerifyPublic,
  reducePassportRegistry,
  reducePassportLegacy,
  reducePassportNetwork,
  reducePassportRobotDone,
]
  .map((fn) => fn.toString())
  .join('\n');
const PDF_SRC = wrapPngInPdf.toString();

describe('slice 17 passport', () => {
  it('keeps landmarks, cap, 34 ids, and playToPathDone does not invite or issue', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(WORLD_POS.apartmentDoor).toBeTruthy();
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[8]).toBe('#O1wJfhZ.vx3l2V#');
    expect(WORKSHOP.legend[8][11]).toBe('3');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t4...#');
    expect(WORKSHOP.legend[6][11]).toBe('4');
    expect(WORKSHOP.legend[6][8]).toBe('.');
    expect(WORKSHOP.legend[7][8]).toBe('d');
    expect(STREET.legend.join('')).toContain('Y');
    expect(JOURNAL_CAP).toBe(112);
    expect(EVIDENCE_IDS.length).toBe(34);
    expect(PASSPORT_PNG_NAME).toBe('rafiq-passport.png');
    expect(PASSPORT_PDF_NAME).toBe('rafiq-passport.pdf');
    expect(PASSPORT_PNG_NAME).not.toMatch(/علي|Sara|عبد/);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);

    const persistable = [
      JSON.stringify(createPassportQuest()),
      OBJECTIVES.passportReady,
      OBJECTIVES.passportIssued,
      JOURNAL_TEXT.passport_opened,
      JOURNAL_TEXT.name_confirmed,
      JOURNAL_TEXT.passport_issued,
      PASSPORT_EXPLAIN.educational_passport,
      PASSPORT_FEEDBACK.ineligible,
    ].join('\n');
    expect(persistable).not.toMatch(/MCP/);
    expect(persistable).not.toMatch(/harness/);
    expect(persistable).not.toMatch(/شهادة/);
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);
    expect(PASSPORT_SRC).not.toMatch(/fetch\(/);
    expect(PASSPORT_SRC).not.toMatch(/Date\.now\(/);
    expect(PASSPORT_SRC).not.toMatch(/setInterval/);
    expect(PDF_SRC).not.toMatch(/fetch\(/);
    expect(PDF_SRC).not.toMatch(/Date\.now\(/);
    expect(PDF_SRC).not.toMatch(/setInterval/);

    const state = playToPathDone(checkpoint());
    expect(state.endingState).toBe('in_progress');
    expect(state.passportQuest.issued).toBe(false);
    expect(state.passportQuest.thanksHeard).toBe(false);
    expect(state.mode).not.toBe('ending');
    expect(state.approvalQuest.bulletinSent).toBe(true);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(state.pathQuest.receiptText).toBe(NIGHT_RECEIPT);
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    expect(JSON.stringify(state)).not.toMatch(/امتحان/);
    expect(JSON.stringify(state)).not.toMatch(/شهادة/);
    expect(endingObjective(state)).toBe(OBJECTIVES.restored);
  });

  it('thanks close does not open overlay; second talk invites; confirm then downloads issue', () => {
    let state = playToPathDone(checkpoint());
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_restore');
    expect(state.mode).toBe('dialogue');
    const thanks = DIALOGUE.companion_after_restore.text(state.playerName);
    expect(thanks).toContain('شكراً');
    expect(thanks).toContain(state.playerName);
    expect(thanks).toContain('صرت جاهزاً للعمل تحت إشرافك في الحي');
    expect(thanks).toMatch(/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.mode).toBe('playing');
    expect(state.passportQuest.thanksHeard).toBe(true);
    expect(state.endingState).toBe('in_progress');
    expect(state.passportQuest.issued).toBe(false);
    expect(state.mode).not.toBe('ending');

    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.mode).toBe('ending');
    expect(state.endingState).toBe('invited');
    expect(state.passportQuest.opened).toBe(true);
    expect(state.passportQuest.invited).toBe(true);
    expect(state.passportQuest.completionDate).toBe(CAMPAIGN_DATE);
    expect(state.passportQuest.nameConfirmed).toBe(false);
    expect(state.passportQuest.pngDownloaded).toBe(false);
    expect(state.passportQuest.pdfDownloaded).toBe(false);
    expect(state.passportQuest.issued).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'passport_opened')).toBe(true);
    const lines = certificateLines(state.playerName);
    expect(lines.join('\n')).toContain(state.playerName);
    expect(lines.join('\n')).toContain(CERTIFICATE_TITLE);
    expect(lines.join('\n')).toContain(PRODUCT_TITLE);
    expect(lines.join('\n')).toContain(CERTIFICATE_BODY);
    expect(lines.join('\n')).toContain(CERTIFICATE_VERSION_LINE);
    expect(lines.join('\n')).toContain(CERTIFICATE_DATE_LINE);
    expect(lines.join('\n')).toContain('ليست اعتماداً ولا علامة تحقق عامة');
    expect(lines.join('\n')).toContain(CAMPAIGN_VERSION);
    expect(lines.join('\n')).not.toMatch(/\d+\s*%/);
    expect(lines.join('\n')).not.toMatch(/٩٧/);

    state = act(state, { type: 'PASSPORT_CONFIRM_NAME' });
    expect(state.passportQuest.nameConfirmed).toBe(true);
    expect(state.passportQuest.issued).toBe(false);
    expect(state.endingState).toBe('invited');
    expect(state.journalEvents.some((event) => event.id === 'name_confirmed')).toBe(true);

    state = act(state, { type: 'PASSPORT_DOWNLOAD', format: 'png' });
    expect(state.passportQuest.pngDownloaded).toBe(true);
    expect(state.passportQuest.issued).toBe(true);
    expect(state.endingState).toBe('issued');
    state = act(state, { type: 'PASSPORT_DOWNLOAD', format: 'pdf' });
    expect(state.passportQuest.pdfDownloaded).toBe(true);
    expect(state.endingState).toBe('issued');
    expect(state.journalEvents.filter((event) => event.id === 'passport_issued')).toHaveLength(1);
    expect(EVIDENCE_IDS.length).toBe(34);
    for (const id of EVIDENCE_IDS) {
      expect(state.evidence[id], id).toBe('demonstrated');
    }
    expect(state.storyObjective).toBe(OBJECTIVES.passportIssued);
  });

  it('covers fail paths, hydrate, and payload names', () => {
    const longName = 'عبد الرحمن بن محمد بن عبد الله الأندلسي';
    const mixedName = 'Sara علي-Khan';
    expect(certificateLines(longName).join('\n')).toContain(longName);
    expect(certificateLines(mixedName).join('\n')).toContain(mixedName);

    expect(pngHasSignature(FIXTURE_PNG)).toBe(true);
    const pdf = wrapPngInPdf(FIXTURE_PNG, mixedName, certificateLines(mixedName));
    expect(String.fromCharCode(pdf[0], pdf[1], pdf[2], pdf[3], pdf[4])).toBe('%PDF-');
    let pngAt = -1;
    for (let i = 0; i < pdf.length - 8; i += 1) {
      if (
        pdf[i] === 0x89 &&
        pdf[i + 1] === 0x50 &&
        pdf[i + 2] === 0x4e &&
        pdf[i + 3] === 0x47
      ) {
        pngAt = i;
        break;
      }
    }
    expect(pngAt).toBeGreaterThan(0);
    expect(new TextDecoder().decode(pdf)).toContain(mixedName);
    expect(new TextDecoder().decode(pdf)).toContain('/Info');
    expect(new TextDecoder().decode(pdf)).toContain('/Title');

    let state = playToCrewDone(checkpoint());
    state = act(state, { type: 'PASSPORT_OPEN' });
    expect(state.mode).toBe('playing');
    expect(state.shopFeedback).toBe(PASSPORT_FEEDBACK.ineligible);
    expect(state.endingState).toBe('in_progress');

    state = playToPathDone(checkpoint());
    const missingEvidence = { ...state.evidence };
    delete missingEvidence['6.3'];
    const missing = { ...state, evidence: missingEvidence };
    const blocked = act(missing, { type: 'PASSPORT_OPEN' });
    expect(isPassportEligible(missing)).toBe(false);
    expect(blocked.mode).toBe('playing');
    expect(blocked.shopFeedback).toBe(PASSPORT_FEEDBACK.ineligible);

    state = act(state, { type: 'PASSPORT_OPEN' });
    expect(state.mode).toBe('ending');
    expect(state.endingState).toBe('invited');
    expect(state.passportQuest.issued).toBe(false);
    const confirmOnly = act(state, { type: 'PASSPORT_CONFIRM_NAME' });
    expect(confirmOnly.passportQuest.issued).toBe(false);
    expect(confirmOnly.passportQuest.pngDownloaded).toBe(false);

    const beforeConfirm = act(state, { type: 'PASSPORT_DOWNLOAD', format: 'png' });
    expect(beforeConfirm.shopFeedback).toBe(PASSPORT_FEEDBACK.confirmFirst);
    expect(beforeConfirm.passportQuest.issued).toBe(false);

    const fails: GameAction[] = [
      { type: 'PASSPORT_EXAM' },
      { type: 'PASSPORT_PERCENT' },
      { type: 'PASSPORT_VERIFY_PUBLIC' },
      { type: 'PASSPORT_REGISTRY' },
      { type: 'PASSPORT_LEGACY' },
      { type: 'PASSPORT_NETWORK' },
      { type: 'PASSPORT_ROBOT_DONE' },
    ];
    const expected = [
      PASSPORT_FEEDBACK.exam,
      PASSPORT_FEEDBACK.percent,
      PASSPORT_FEEDBACK.verifyPublic,
      PASSPORT_FEEDBACK.registry,
      PASSPORT_FEEDBACK.legacy,
      PASSPORT_FEEDBACK.network,
      PASSPORT_FEEDBACK.robotDone,
    ];
    fails.forEach((action, index) => {
      const next = act(state, action);
      expect(next.shopFeedback).toBe(expected[index]);
      expect(next.passportQuest.issued).toBe(false);
      expect(next.mode).toBe('ending');
    });

    const failed = act(state, { type: 'PASSPORT_DOWNLOAD_FAIL' });
    expect(failed.shopFeedback).toBe(PASSPORT_FEEDBACK.fail);
    expect(failed.passportQuest.downloadError).toBe(PASSPORT_FEEDBACK.fail);
    expect(failed.passportQuest.issued).toBe(false);
    expect(failed.mode).toBe('ending');
    const retried = act(act(failed, { type: 'PASSPORT_CONFIRM_NAME' }), {
      type: 'PASSPORT_DOWNLOAD',
      format: 'png',
    });
    expect(retried.passportQuest.issued).toBe(true);

    const closed = act(state, { type: 'CLOSE_OVERLAY' });
    expect(closed.mode).toBe('playing');
    expect(closed.endingState).toBe('invited');
    expect(closed.passportQuest.issued).toBe(false);

    const envelope = toEnvelope(retried);
    expect(envelope.saveVersion).toBe(1);
    expect(envelope.endingState).toBe('issued');
    expect(envelope.passportQuest.issued).toBe(true);
    const parsed = validateSave(JSON.stringify(envelope));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.endingState).toBe('issued');
    expect(hydrated.passportQuest.issued).toBe(true);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.passportIssued);

    const legacy = { ...toEnvelope(playToPathDone(checkpoint())), passportQuest: undefined };
    const parsedLegacy = validateSave(JSON.stringify(legacy));
    expect(parsedLegacy).not.toBeNull();
    expect(hydrateSave(parsedLegacy!, 'ok', false).passportQuest).toEqual(createPassportQuest());

    const unknownEnding = {
      ...toEnvelope(playToPathDone(checkpoint())),
      endingState: 'nope',
    };
    const parsedUnknown = validateSave(JSON.stringify(unknownEnding));
    expect(parsedUnknown).not.toBeNull();
    expect(parsedUnknown!.endingState).toBe('in_progress');
    expect(parsePassportQuest(undefined).phase).toBe('unstarted');

    const reset = act(
      { ...retried, mode: 'confirm_name', nameDraft: retried.playerName },
      { type: 'CONFIRM_NAME' },
    );
    expect(reset.passportQuest).toEqual(createPassportQuest());
    expect(reset.endingState).toBe('in_progress');
  });
});

