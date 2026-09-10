import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, TILE } from './constants';
import { DIALOGUE, JOURNAL_TEXT, OBJECTIVES } from './dialogue';
import { canAward43, canAward44 } from './kiosk';
import {
  AGENT_FEEDBACK,
  BOARD_EMPTY,
  canAward51,
  canAward52,
  neighborBoardText,
} from './agent';
import { BRIDGE_EXPLAIN, MCP_NOTE } from './bridge';
import { listInteractables } from './interact';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import { createInitialState, reduce, stepGame } from './state';
import { hydrateSave, loadAdventure, MemoryStore, persistAdventure, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';
import { EVIDENCE_IDS, MAP_IDS } from './types';
import { SEND_RECEIPT } from './approval';
import { CREW_EXPLAIN } from './crew';
import {
  DRAFT_TEXT,
  EXTRA_STOPPED,
  HOUR_FRI20,
  HOUR_THU19,
  NIGHT_NOTICE,
  NIGHT_RECEIPT,
  PACK_TEXT,
  PATH_EMPTY,
  PATH_EXPLAIN,
  PATH_FEEDBACK,
  PLAN_BOUNDED,
  PLAN_EMPTY,
  RECORD_NH_3301,
  RUMOR_TEXT,
  SEAL_EMPTY,
  SOURCE_TEXT,
  canAward64,
  createPathQuest,
  parsePathQuest,
  planReady,
  prepComplete,
  reducePathConfirm,
  reducePathExam,
  reducePathExtraStep,
  reducePathInspectSend,
  reducePathInspectSource,
  reducePathLoadClinic,
  reducePathLoadMango,
  reducePathLoadReading,
  reducePathPrepare,
  reducePathQuiz,
  reducePathRefuseRumor,
  reducePathReject,
  reducePathResendOld,
  reducePathRobotDone,
  reducePathRunChat,
  reducePathRunOld,
  reducePathRunSkill,
  reducePathSetGoal,
  reducePathSetPayload,
  reducePathSetRecipient,
  reducePathSetStop,
  reducePathSetTools,
  reducePathTrustRumor,
} from './path';

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

const PATH_SRC = [
  reducePathInspectSource,
  reducePathTrustRumor,
  reducePathRefuseRumor,
  reducePathSetGoal,
  reducePathSetTools,
  reducePathSetStop,
  reducePathLoadReading,
  reducePathLoadMango,
  reducePathLoadClinic,
  reducePathRunSkill,
  reducePathRunOld,
  reducePathRunChat,
  reducePathExtraStep,
  reducePathExam,
  reducePathQuiz,
  reducePathRobotDone,
  reducePathPrepare,
  reducePathSetRecipient,
  reducePathSetPayload,
  reducePathInspectSend,
  reducePathReject,
  reducePathConfirm,
  reducePathResendOld,
  canAward64,
  parsePathQuest,
]
  .map((fn) => fn.toString())
  .join('\n');

describe('path stations after crewReady', () => {
  it('places 3 and 4, keeps landmarks, and does not award 6.4 from crew success', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[4]).toBe('#...........e..#');
    expect(WORKSHOP.legend[5]).toBe('#u.z...a..m.j..#');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t4...#');
    expect(WORKSHOP.legend[7]).toBe('#.......d......#');
    expect(WORKSHOP.legend[8]).toBe('#O1wJfhZ.vx3l2V#');
    expect(WORKSHOP.legend[8][1]).toBe('O');
    expect(WORKSHOP.legend[8][2]).toBe('1');
    expect(WORKSHOP.legend[8][3]).toBe('w');
    expect(WORKSHOP.legend[8][4]).toBe('J');
    expect(WORKSHOP.legend[8][5]).toBe('f');
    expect(WORKSHOP.legend[8][6]).toBe('h');
    expect(WORKSHOP.legend[8][7]).toBe('Z');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(WORKSHOP.legend[8][9]).toBe('v');
    expect(WORKSHOP.legend[8][10]).toBe('x');
    expect(WORKSHOP.legend[8][11]).toBe('3');
    expect(WORKSHOP.legend[8][12]).toBe('l');
    expect(WORKSHOP.legend[8][13]).toBe('2');
    expect(WORKSHOP.legend[8][14]).toBe('V');
    expect(WORKSHOP.legend[6][1]).toBe('k');
    expect(WORKSHOP.legend[6][3]).toBe('q');
    expect(WORKSHOP.legend[6][8]).toBe('.');
    expect(WORKSHOP.legend[6][10]).toBe('t');
    expect(WORKSHOP.legend[6][11]).toBe('4');
    expect(WORKSHOP.legend[7][8]).toBe('d');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(WORLD_POS.pathDesk).not.toEqual(WORLD_POS.crewDesk);
    expect(WORLD_POS.sealDesk).not.toEqual(WORLD_POS.qualityDesk);
    expect(WORLD_POS.pathDesk).not.toEqual(WORLD_POS.sealDesk);
    expect(playerHitsSolid('workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(112);
    expect(EVIDENCE_IDS.length).toBe(34);
    expect(EVIDENCE_IDS).toContain('6.4');
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);
    expect(PATH_EXPLAIN.integrated_path).not.toMatch(/MCP|harness/);
    expect(OBJECTIVES.pathWork).not.toMatch(/MCP|harness/);
    expect(OBJECTIVES.restored).not.toMatch(/MCP|harness/);
    expect(JOURNAL_TEXT.restored).not.toMatch(/MCP|harness/);
    expect(JSON.stringify(createPathQuest())).not.toMatch(/MCP|harness/);
    expect(PATH_SRC).not.toMatch(/fetch\(/);
    expect(PATH_SRC).not.toMatch(/Date\.now\(/);
    expect(PATH_SRC).not.toMatch(/setInterval/);
    expect(PATH_SRC).not.toMatch(/eval\(/);

    const beforeReady = listInteractables(playToApprovalDone(checkpoint())).map((item) => item.id);
    expect(beforeReady).not.toContain('path_desk');
    expect(beforeReady).not.toContain('seal_desk');
    const state = playToCrewDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.pathWork);
    expect(state.crewQuest.crewReady).toBe(true);
    expect(state.pathQuest.restored).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.approvalQuest.bulletinSent).toBe(true);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('path_desk');
    expect(after).toContain('seal_desk');
  });
});

describe('AC01 prep then seal awards 6.4 only', () => {
  it('runs source, plan, pack, skill, extra, then reject-edit-approve', () => {
    let state = playToCrewDone(checkpoint());
    const receipt = state.approvalQuest.receiptText;
    const tray = state.skillQuest.trayText;
    state = openPrep(state);
    expect(state.mode).toBe('path');
    expect(state.pathQuest.view).toBe('prep');
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.pathQuest.restored).toBe(false);

    state = act(state, { type: 'PATH_TRUST_RUMOR' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.trustRumor);
    state = act(state, { type: 'PATH_REFUSE_RUMOR' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.refuseFirst);
    expect(state.pathQuest.rumorRefused).toBe(false);
    state = act(state, { type: 'PATH_INSPECT_SOURCE' });
    expect(state.pathQuest.sourceInspected).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();
    state = act(state, { type: 'PATH_REFUSE_RUMOR' });
    expect(state.pathQuest.rumorRefused).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();

    state = act(state, { type: 'PATH_SET_GOAL', goal: 'live' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.liveGoal);
    expect(planReady(state.pathQuest)).toBe(false);
    state = act(state, { type: 'PATH_SET_TOOLS', tools: 'pay' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.payTools);
    state = act(state, { type: 'PATH_SET_STOP', stop: 'unlimited' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.unlimitedStop);
    expect(planReady(state.pathQuest)).toBe(false);
    state = act(state, { type: 'PATH_SET_GOAL', goal: 'reading' });
    state = act(state, { type: 'PATH_SET_TOOLS', tools: 'safe' });
    state = act(state, { type: 'PATH_SET_STOP', stop: 'budget' });
    expect(planReady(state.pathQuest)).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();

    state = act(state, { type: 'PATH_LOAD_MANGO' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.mango);
    state = act(state, { type: 'PATH_LOAD_CLINIC' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.clinic);
    expect(state.pathQuest.packReady).toBe(false);
    state = act(state, { type: 'PATH_LOAD_READING' });
    expect(state.pathQuest.packReady).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();

    state = act(state, { type: 'PATH_RUN_OLD' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.runOld);
    state = act(state, { type: 'PATH_RUN_CHAT' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.runChat);
    state = act(state, { type: 'PATH_RUN_SKILL' });
    expect(state.pathQuest.skillRan).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();

    const afterSkill = { ...state.pathQuest };
    state = act(state, { type: 'PATH_EXTRA_STEP' });
    expect(state.shopFeedback).toBe(EXTRA_STOPPED);
    expect(state.pathQuest.extraStopped).toBe(true);
    expect(state.pathQuest.skillRan).toBe(afterSkill.skillRan);
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.pathQuest.restored).toBe(false);
    expect(prepComplete(state.pathQuest)).toBe(true);
    expect(state.approvalQuest.receiptText).toBe(receipt);
    expect(state.skillQuest.trayText).toBe(tray);

    state = playing(state);
    state = openSeal(state);
    expect(state.pathQuest.view).toBe('seal');
    expect(state.evidence['6.4']).toBeUndefined();
    state = act(state, { type: 'PATH_PREPARE' });
    expect(state.pathQuest.prepared).toBe(true);
    expect(state.pathQuest.recipient).toBe('neighbors');
    expect(state.pathQuest.payload).toBe('exact');
    expect(state.pathQuest.nightSent).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.inspectFirst);
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.wrongRecipient);
    state = act(state, { type: 'PATH_SET_RECIPIENT', recipient: 'payroll' });
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.wrongRecipient);
    state = act(state, { type: 'PATH_SET_PAYLOAD', payload: 'stream' });
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.wrongPayload);
    expect(state.pathQuest.nightSent).toBe(false);

    state = act(state, { type: 'PATH_SET_RECIPIENT', recipient: 'librarian' });
    state = act(state, { type: 'PATH_SET_PAYLOAD', payload: 'exact' });
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_REJECT' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.rejectCorrect);
    expect(state.pathQuest.rejectedWrong).toBe(false);

    state = act(state, { type: 'PATH_SET_RECIPIENT', recipient: 'neighbors' });
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_REJECT' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.rejectedWrong);
    expect(state.pathQuest.rejectedWrong).toBe(true);
    expect(state.pathQuest.nightSent).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();

    state = act(state, { type: 'PATH_SET_RECIPIENT', recipient: 'librarian' });
    state = act(state, { type: 'PATH_SET_PAYLOAD', payload: 'exact' });
    expect(state.pathQuest.needsRereview).toBe(true);
    expect(state.pathQuest.inspectedSend).toBe(false);
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.rereview);
    expect(state.pathQuest.nightSent).toBe(false);
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.pathQuest.nightSent).toBe(true);
    expect(state.pathQuest.receiptText).toBe(NIGHT_RECEIPT);
    expect(state.pathQuest.receiptText).toContain(HOUR_THU19);
    expect(state.pathQuest.receiptText).not.toContain(HOUR_FRI20);
    expect(state.evidence['6.4']).toBe('demonstrated');
    expect(state.pathQuest.restored).toBe(true);
    expect(state.endingState).toBe('in_progress');
    expect(state.approvalQuest.receiptText).toBe(receipt);
    expect(state.approvalQuest.bulletinSent).toBe(true);
    expect(state.skillQuest.trayText).toBe(tray);
    expect(state.evidence['6.1']).toBe('demonstrated');
    expect(state.evidence['6.2']).toBe('demonstrated');
    expect(state.evidence['5.7']).toBe('demonstrated');
    expect(state.evidence['6.3']).toBe('demonstrated');
  });

  it('blocks exam, quiz, robot done, resend-old, prepare-before-prep, and manager-talk-only', () => {
    let state = playToCrewDone(checkpoint());
    state = openPrep(state);
    state = act(state, { type: 'PATH_EXAM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.exam);
    state = act(state, { type: 'PATH_QUIZ' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.quiz);
    state = act(state, { type: 'PATH_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.robotDone);
    expect(state.evidence['6.4']).toBeUndefined();

    state = act(state, { type: 'PATH_LOAD_READING' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.packBeforeSource);
    state = act(state, { type: 'PATH_RUN_SKILL' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.runBeforePlan);
    state = act(state, { type: 'PATH_EXTRA_STEP' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.extraFirst);

    state = act(state, { type: 'PATH_INSPECT_SOURCE' });
    state = act(state, { type: 'PATH_SET_GOAL', goal: 'reading' });
    state = act(state, { type: 'PATH_SET_TOOLS', tools: 'safe' });
    state = act(state, { type: 'PATH_SET_STOP', stop: 'budget' });
    state = act(state, { type: 'PATH_RUN_SKILL' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.runBeforePack);

    state = playing(state);
    state = openSeal(state);
    state = act(state, { type: 'PATH_PREPARE' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.prepareFirst);
    expect(state.pathQuest.prepared).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();
    state = act(state, { type: 'PATH_RESEND_OLD' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.resendOld);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(state.approvalQuest.bulletinSent).toBe(true);

    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_crew_thanks');
    expect(DIALOGUE.manager_crew_thanks.text(state.playerName)).toMatch(
      /عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/,
    );
    expect(DIALOGUE.manager_crew_thanks.text(state.playerName)).toContain(
      'منصة المسار ومنصة الختم في الورشة تنتظران مهمة السهرة.',
    );
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.pathQuest.restored).toBe(false);
  });

  it('does not award on inspect-only, plan-only, pack-only, skill-run-only, extra-stop-only, or prepare-only', () => {
    let state = completePrep(playToCrewDone(checkpoint()));
    expect(prepComplete(state.pathQuest)).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.pathQuest.restored).toBe(false);
    expect(canAward64(state.pathQuest, true)).toBe(false);

    state = playing(state);
    state = openSeal(state);
    state = act(state, { type: 'PATH_PREPARE' });
    expect(state.pathQuest.prepared).toBe(true);
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.pathQuest.nightSent).toBe(false);

    const sealOnly = openSeal(playToCrewDone(checkpoint()));
    expect(sealOnly.pathQuest.view).toBe('seal');
    expect(sealOnly.evidence['6.4']).toBeUndefined();
    const preparedEarly = act(sealOnly, { type: 'PATH_PREPARE' });
    expect(preparedEarly.pathQuest.prepared).toBe(false);
    expect(preparedEarly.evidence['6.4']).toBeUndefined();
  });

  it('requires a wrong reject before approving the corrected send', () => {
    let state = completePrep(playToCrewDone(checkpoint()));
    state = playing(state);
    state = openSeal(state);
    state = act(state, { type: 'PATH_PREPARE' });
    state = act(state, { type: 'PATH_SET_RECIPIENT', recipient: 'librarian' });
    state = act(state, { type: 'PATH_SET_PAYLOAD', payload: 'exact' });
    state = act(state, { type: 'PATH_INSPECT_SEND' });
    state = act(state, { type: 'PATH_CONFIRM' });
    expect(state.shopFeedback).toBe(PATH_FEEDBACK.rejectFirst);
    expect(state.pathQuest.nightSent).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();
  });
});

describe('AC02 restoration and AC03 6.4 closes the slice', () => {
  it('awards 6.4, sets restored, thanks, hydrate, and keeps earlier ids', () => {
    let state = completeSeal(completePrep(playToCrewDone(checkpoint())));
    expect(state.evidence['6.4']).toBe('demonstrated');
    expect(state.pathQuest.restored).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.restored);
    expect(state.endingState).toBe('in_progress');
    expect(state.journalEvents.some((event) => event.id === 'crew_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'restored')).toBe(true);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    for (const id of EVIDENCE_IDS) {
      expect(state.evidence[id], id).toBe('demonstrated');
    }
    expect(state.evidence['5.1']).toBe('demonstrated');
    expect(state.evidence['5.2']).toBe('demonstrated');
    expect(state.evidence['5.3']).toBe('demonstrated');
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    expect(JSON.stringify(state)).not.toMatch(/امتحان/);
    expect(JSON.stringify(state)).not.toMatch(/شهادة/);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(state.pathQuest.receiptText).toBe(NIGHT_RECEIPT);
    expect(NIGHT_NOTICE).toContain(HOUR_THU19);
    expect(RUMOR_TEXT).toContain(HOUR_FRI20);
    expect(SOURCE_TEXT).toContain(RECORD_NH_3301);
    expect(DRAFT_TEXT).toContain(HOUR_THU19);
    expect(PACK_TEXT).toContain(RECORD_NH_3301);
    expect(PLAN_BOUNDED).toContain('خطة محدودة');
    expect(PLAN_EMPTY).toBe('لا خطة محدودة');
    expect(PATH_EMPTY).toBe('لا مسار جاهز');
    expect(SEAL_EMPTY).toBe('لا ختم جاهز');

    state = playing(state);
    if (state.mode === 'explain') state = act(state, { type: 'SKIP_EXPLAIN' });
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_restore_thanks');
    expect(DIALOGUE.manager_restore_thanks.text(state.playerName)).toMatch(
      /سُهرة القراءة نُشرت بعد سند NH-3301 وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية، والروبوت صار جاهزاً تحت إشراف/,
    );
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_restore');
    const thanks = DIALOGUE.companion_after_restore.text(state.playerName);
    expect(thanks).toContain('شكراً');
    expect(thanks).toContain(state.playerName);
    expect(thanks).toContain('صرت جاهزاً للعمل تحت إشرافك في الحي');
    expect(thanks).toMatch(/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/);
    expect(CREW_EXPLAIN.roles_and_owner).not.toMatch(/MCP|harness/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);

    const envelope = toEnvelope(playToCrewDone(checkpoint()));
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, pathQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.pathQuest).toEqual(createPathQuest());
    expect(hydrated.pathQuest.restored).toBe(false);
    expect(hydrated.crewQuest.crewReady).toBe(true);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.pathWork);
    expect(parsePathQuest(undefined).phase).toBe('unstarted');
  });
});

describe('R1 unfinished path persist', () => {
  it('hydrates inspect+refuse+reading-goal without awarding 6.4', () => {
    let state = playToCrewDone(checkpoint());
    state = openPrep(state);
    state = act(state, { type: 'PATH_INSPECT_SOURCE' });
    state = act(state, { type: 'PATH_REFUSE_RUMOR' });
    state = act(state, { type: 'PATH_SET_GOAL', goal: 'reading' });
    expect(state.pathQuest.sourceInspected).toBe(true);
    expect(state.pathQuest.rumorRefused).toBe(true);
    expect(state.pathQuest.goal).toBe('reading');
    expect(state.pathQuest.tools).toBeNull();
    expect(state.pathQuest.packReady).toBe(false);
    expect(state.pathQuest.skillRan).toBe(false);
    expect(state.pathQuest.restored).toBe(false);
    expect(state.evidence['6.4']).toBeUndefined();
    expect(state.endingState).toBe('in_progress');
    expect(state.journalEvents.filter((event) => event.id === 'source_verified')).toHaveLength(1);
    expect(state.journalEvents.filter((event) => event.id === 'path_opened')).toHaveLength(1);
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);

    const envelope = toEnvelope(state);
    const parsed = validateSave(JSON.stringify(envelope));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.mode).toBe('playing');
    expect(hydrated.pathQuest.sourceInspected).toBe(true);
    expect(hydrated.pathQuest.rumorRefused).toBe(true);
    expect(hydrated.pathQuest.goal).toBe('reading');
    expect(hydrated.pathQuest.tools).toBeNull();
    expect(hydrated.pathQuest.packReady).toBe(false);
    expect(hydrated.pathQuest.skillRan).toBe(false);
    expect(hydrated.pathQuest.restored).toBe(false);
    expect(hydrated.evidence['6.4']).toBeUndefined();
    expect(hydrated.endingState).toBe('in_progress');
    expect(hydrated.journalEvents.filter((event) => event.id === 'source_verified')).toHaveLength(1);
    expect(hydrated.journalEvents.filter((event) => event.id === 'path_opened')).toHaveLength(1);

    const store = new MemoryStore();
    persistAdventure(store, playing(playToCrewDone(checkpoint())));
    const loaded = loadAdventure(store);
    expect(loaded.status).toBe('ok');
    if (loaded.status !== 'ok') throw new Error('expected ok save');
    let live = loaded.state;
    live = stepGame(store, live, {
      type: 'DEBUG_TELEPORT',
      map: 'workshop',
      x: WORLD_POS.pathDesk.x,
      y: WORLD_POS.pathDesk.y,
    });
    live = stepGame(store, live, { type: 'INTERACT' });
    live = stepGame(store, live, { type: 'PATH_INSPECT_SOURCE' });
    live = stepGame(store, live, { type: 'PATH_REFUSE_RUMOR' });
    live = stepGame(store, live, { type: 'PATH_SET_GOAL', goal: 'reading' });
    expect(live.pathQuest.goal).toBe('reading');
    const reloaded = loadAdventure(store);
    expect(reloaded.status).toBe('ok');
    if (reloaded.status !== 'ok') throw new Error('expected ok save');
    expect(reloaded.state.mode).toBe('playing');
    expect(reloaded.state.pathQuest.sourceInspected).toBe(true);
    expect(reloaded.state.pathQuest.rumorRefused).toBe(true);
    expect(reloaded.state.pathQuest.goal).toBe('reading');
    expect(reloaded.state.pathQuest.tools).toBeNull();
    expect(reloaded.state.pathQuest.restored).toBe(false);
    expect(reloaded.state.evidence['6.4']).toBeUndefined();
  });
});

