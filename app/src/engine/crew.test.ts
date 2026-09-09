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
import { createLabQuest } from './lab';
import { listInteractables } from './interact';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import { createInitialState, reduce } from './state';
import { hydrateSave, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';
import { MAP_IDS } from './types';
import { BULLETIN_1447, createSkillQuest } from './skill';
import { HOUR_THU, SEND_RECEIPT } from './approval';
import {
  ACCEPTED_TEXT,
  CREW_EXPLAIN,
  CREW_FEEDBACK,
  CRIT_ACCURACY_FAIL,
  CRIT_ACCURACY_OK,
  HALL_NOTICE,
  HALL_NOTICE_FLAW,
  HANDOFF_TEXT,
  QUALITY_EMPTY,
  ROLES_EMPTY,
  SOURCE_TEXT,
  VERSION_EMPTY,
  VERSION_V1,
  VERSION_V2,
  canAward61,
  canAward62,
  createCrewQuest,
  parseCrewQuest,
  awardCrewEvidence,
  reduceCrewAccept,
  reduceCrewAssignBuilder,
  reduceCrewAssignResearcher,
  reduceCrewAssignReviewer,
  reduceCrewHandoff,
  reduceCrewInspectSource,
  reduceCrewMajority,
  reduceCrewOpenCriteria,
  reduceCrewPickConflict,
  reduceCrewPickEvidence,
  reduceCrewQualityMajority,
  reduceCrewQualityResend,
  reduceCrewQualityRobotDone,
  reduceCrewRepairAccuracy,
  reduceCrewRepairTone,
  reduceCrewResend,
  reduceCrewRobotDone,
  reduceCrewRolesMerge,
  reduceCrewSetOwner,
  versionText,
} from './crew';

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

const CREW_SRC = [
  reduceCrewAssignResearcher,
  reduceCrewAssignBuilder,
  reduceCrewAssignReviewer,
  reduceCrewRolesMerge,
  reduceCrewSetOwner,
  reduceCrewHandoff,
  reduceCrewInspectSource,
  reduceCrewMajority,
  reduceCrewPickEvidence,
  reduceCrewPickConflict,
  reduceCrewRobotDone,
  reduceCrewResend,
  reduceCrewOpenCriteria,
  reduceCrewRepairAccuracy,
  reduceCrewRepairTone,
  reduceCrewAccept,
  reduceCrewQualityMajority,
  reduceCrewQualityRobotDone,
  reduceCrewQualityResend,
  canAward61,
  canAward62,
  parseCrewQuest,
  awardCrewEvidence,
]
  .map((fn) => fn.toString())
  .join('\n');

describe('crew stations after approvalReady', () => {
  it('places 1 and 2 on row 8, keeps landmarks, and does not award 6.1/6.2 on approval success', () => {
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
    expect(WORKSHOP.legend[6][8]).toBe('.');
    expect(WORKSHOP.legend[7][8]).toBe('d');
    expect(WORKSHOP.legend[5][1]).toBe('u');
    expect(WORKSHOP.legend[5][3]).toBe('z');
    expect(WORKSHOP.legend[5][12]).toBe('j');
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(WORLD_POS.crewDesk).not.toEqual(WORLD_POS.approveDesk);
    expect(WORLD_POS.qualityDesk).not.toEqual(WORLD_POS.decisionDesk);
    expect(WORLD_POS.crewDesk).not.toEqual(WORLD_POS.qualityDesk);
    expect(playerHitsSolid('workshop', WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(104);
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);
    expect(`${CREW_EXPLAIN.roles_and_owner} ${CREW_EXPLAIN.quality_before_accept}`).not.toMatch(
      /MCP|harness/,
    );
    expect(OBJECTIVES.crewWork).not.toMatch(/MCP|harness/);
    expect(OBJECTIVES.crewReady).not.toMatch(/MCP|harness/);
    expect(JOURNAL_TEXT.crew_ready).not.toMatch(/MCP|harness/);
    expect(JSON.stringify(createCrewQuest())).not.toMatch(/MCP|harness/);
    expect(JSON.stringify(createSkillQuest())).not.toMatch(/MCP|harness/);
    expect(CREW_SRC).not.toMatch(/fetch\(/);
    expect(CREW_SRC).not.toMatch(/Date\.now\(/);
    expect(CREW_SRC).not.toMatch(/setInterval/);
    expect(CREW_SRC).not.toMatch(/eval\(/);

    const labDone = playToLabDone(checkpoint());
    expect(JSON.stringify(labDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(labDone)).not.toMatch(/harness/);
    const kioskDone = playToKioskDone(checkpoint());
    expect(JSON.stringify(kioskDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(kioskDone)).not.toMatch(/harness/);
    const agentDone = playToAgentDone(checkpoint());
    expect(JSON.stringify(agentDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(agentDone)).not.toMatch(/harness/);

    let state = playToSkillDone(checkpoint());
    const beforeReady = listInteractables(state).map((item) => item.id);
    expect(beforeReady).toContain('approve_desk');
    expect(beforeReady).not.toContain('crew_desk');
    expect(beforeReady).not.toContain('quality_desk');
    state = playToApprovalDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.crewWork);
    expect(state.approvalQuest.approvalReady).toBe(true);
    expect(state.crewQuest.crewReady).toBe(false);
    expect(state.evidence['5.7']).toBe('demonstrated');
    expect(state.evidence['6.3']).toBe('demonstrated');
    expect(state.evidence['6.1']).toBeUndefined();
    expect(state.evidence['6.2']).toBeUndefined();
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('crew_desk');
    expect(after).toContain('quality_desk');
    expect(after).toContain('approve_desk');
    expect(after).toContain('decision_desk');
  });
});

describe('6.2 distinct roles and evidence version', () => {
  it('awards only after distinct roles, librarian owner, handoff, inspect, majority refuse, and evidence v2', () => {
    let state = playToApprovalDone(checkpoint());
    state = openCrew(state);
    expect(state.mode).toBe('crew');
    expect(state.crewQuest.view).toBe('roles');
    expect(state.crewQuest.openedRoles).toBe(true);
    expect(state.evidence['6.2']).toBeUndefined();
    expect(ROLES_EMPTY).toBe('لا طاقم معيّن');
    expect(versionText(state.crewQuest)).toBe(VERSION_EMPTY);
    state = act(state, { type: 'CREW_ASSIGN_RESEARCHER' });
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_ROLES_MERGE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.merge);
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_ASSIGN_BUILDER' });
    state = act(state, { type: 'CREW_ASSIGN_REVIEWER' });
    expect(state.crewQuest.roleResearcher).toBe(true);
    expect(state.crewQuest.roleBuilder).toBe(true);
    expect(state.crewQuest.roleReviewer).toBe(true);
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_HANDOFF' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.handoffFirst);
    state = act(state, { type: 'CREW_SET_OWNER', owner: 'majority' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.ownerMajority);
    state = act(state, { type: 'CREW_SET_OWNER', owner: 'robot' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.ownerRobot);
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_SET_OWNER', owner: 'librarian' });
    state = act(state, { type: 'CREW_HANDOFF' });
    expect(state.crewQuest.handoffShown).toBe(true);
    expect(versionText(state.crewQuest)).toBe(VERSION_V1);
    expect(HANDOFF_TEXT).toContain('أمينة القاعة');
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_PICK_EVIDENCE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.inspectFirst);
    state = act(state, { type: 'CREW_INSPECT_SOURCE' });
    expect(SOURCE_TEXT).toContain('NH-1447');
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_PICK_EVIDENCE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.refuseMajority);
    state = act(state, { type: 'CREW_PICK_CONFLICT' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.pickConflict);
    expect(versionText(state.crewQuest)).toBe(VERSION_V1);
    expect(HALL_NOTICE_FLAW).toContain(HOUR_THU);
    state = act(state, { type: 'CREW_MAJORITY' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.majorityTruth);
    expect(versionText(state.crewQuest)).not.toContain(HOUR_THU);
    state = act(state, { type: 'CREW_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.robotDoneRoles);
    state = act(state, { type: 'CREW_RESEND' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.resend);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(state.approvalQuest.bulletinSent).toBe(true);
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_PICK_EVIDENCE' });
    expect(state.crewQuest.pickedDraft).toBe('evidence');
    expect(state.crewQuest.sharedVersion).toBe('v2');
    expect(versionText(state.crewQuest)).toBe(VERSION_V2);
    expect(VERSION_V2).toContain('sat-10');
    expect(VERSION_V2).toContain('sun-16');
    expect(VERSION_V2).toContain('wed-18');
    expect(VERSION_V2).toContain('لا تعليق.');
    expect(VERSION_V2).not.toContain(HOUR_THU);
    expect(canAward62(state.crewQuest, true)).toBe(true);
    expect(state.evidence['6.2']).toBe('demonstrated');
    expect(state.evidence['6.1']).toBeUndefined();
    expect(state.crewQuest.crewReady).toBe(false);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  });

  it('assign-only, inspect-only, handoff-only, manager-talk, and robot تم do not award 6.2', () => {
    let state = playToApprovalDone(checkpoint());
    state = openCrew(state);
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_ASSIGN_RESEARCHER' });
    state = act(state, { type: 'CREW_ASSIGN_BUILDER' });
    state = act(state, { type: 'CREW_ASSIGN_REVIEWER' });
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_SET_OWNER', owner: 'librarian' });
    state = act(state, { type: 'CREW_HANDOFF' });
    expect(state.evidence['6.2']).toBeUndefined();
    state = act(state, { type: 'CREW_INSPECT_SOURCE' });
    expect(state.evidence['6.2']).toBeUndefined();
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_approval_thanks');
    expect(DIALOGUE.manager_approval_thanks.text(state.playerName)).toMatch(
      /رُفض إرسال خاطئ ثم وُوفق على نشرة القاعة إلى أمينة القاعة، وقرار عيادة ليان بقي عند إنسان/,
    );
    expect(DIALOGUE.manager_approval_thanks.text(state.playerName)).toContain(
      'منصة الطاقم ومنضدة الجودة في الورشة تنتظران تنسيق الأدوار ومراجعة الناتج.',
    );
    expect(state.evidence['6.2']).toBeUndefined();
    expect(state.crewQuest.crewReady).toBe(false);
  });
});

describe('6.1 quality repair then accept', () => {
  it('awards only after criteria, failed accuracy, repair, and accept without thu-09', () => {
    let state = playToApprovalDone(checkpoint());
    state = openQuality(state);
    expect(state.mode).toBe('crew');
    expect(state.crewQuest.view).toBe('quality');
    expect(QUALITY_EMPTY).toBe('لا تقييم معروض');
    expect(state.evidence['6.1']).toBeUndefined();
    state = act(state, { type: 'CREW_ACCEPT' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.criteriaFirst);
    state = act(state, { type: 'CREW_OPEN_CRITERIA' });
    expect(state.crewQuest.criteriaOpened).toBe(true);
    expect(state.crewQuest.accuracyOk).toBe(false);
    expect(CRIT_ACCURACY_FAIL).toBe('الدقة: فشل');
    expect(HALL_NOTICE_FLAW).toContain(HOUR_THU);
    expect(state.evidence['6.1']).toBeUndefined();
    state = act(state, { type: 'CREW_ACCEPT' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.failedCriterion);
    state = act(state, { type: 'CREW_REPAIR_TONE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.repairTone);
    state = act(state, { type: 'CREW_QUALITY_MAJORITY' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.qualityMajority);
    state = act(state, { type: 'CREW_QUALITY_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.robotDoneQuality);
    state = act(state, { type: 'CREW_QUALITY_RESEND' });
    expect(state.shopFeedback).toBe(CREW_FEEDBACK.resend);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    expect(state.evidence['6.1']).toBeUndefined();
    state = act(state, { type: 'CREW_REPAIR_ACCURACY' });
    expect(state.crewQuest.accuracyOk).toBe(true);
    expect(state.crewQuest.repaired).toBe(true);
    expect(CRIT_ACCURACY_OK).toBe('الدقة: نجح');
    expect(HALL_NOTICE).toBe(BULLETIN_1447);
    expect(state.evidence['6.1']).toBeUndefined();
    state = act(state, { type: 'CREW_ACCEPT' });
    expect(state.crewQuest.accepted).toBe(true);
    expect(state.crewQuest.acceptedText).toBe(ACCEPTED_TEXT);
    expect(ACCEPTED_TEXT).toContain('sat-10');
    expect(ACCEPTED_TEXT).not.toContain(HOUR_THU);
    expect(canAward61(state.crewQuest, true)).toBe(true);
    expect(state.evidence['6.1']).toBe('demonstrated');
    expect(state.evidence['6.2']).toBeUndefined();
    expect(state.crewQuest.crewReady).toBe(false);
    expect(state.approvalQuest.bulletinSent).toBe(true);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  });
});

describe('AC03 both ids close the slice', () => {
  it('sets crewReady, thanks, hydrate, and keeps the desks independent', () => {
    const onlyRoles = complete62(playToApprovalDone(checkpoint()));
    expect(onlyRoles.evidence['6.2']).toBe('demonstrated');
    expect(onlyRoles.evidence['6.1']).toBeUndefined();
    expect(onlyRoles.crewQuest.crewReady).toBe(false);
    const onlyQuality = complete61(playToApprovalDone(checkpoint()));
    expect(onlyQuality.evidence['6.1']).toBe('demonstrated');
    expect(onlyQuality.evidence['6.2']).toBeUndefined();
    expect(onlyQuality.crewQuest.crewReady).toBe(false);

    let state = complete61(complete62(playToApprovalDone(checkpoint())));
    expect(state.evidence['6.1']).toBe('demonstrated');
    expect(state.evidence['6.2']).toBe('demonstrated');
    expect(state.crewQuest.crewReady).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.pathWork);
    expect(state.journalEvents.some((event) => event.id === 'approval_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'crew_ready')).toBe(true);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_crew_thanks');
    expect(DIALOGUE.manager_crew_thanks.text(state.playerName)).toMatch(
      /عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/,
    );
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_crew');
    expect(DIALOGUE.companion_after_crew.text(state.playerName)).toMatch(
      /أغلبية الطاقم تقرر الحقيقة|معيار فاشل يُقبل/,
    );
    expect(robotPosition(state).x).toBe(state.position.x - 32);

    const envelope = toEnvelope(playToApprovalDone(checkpoint()));
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, crewQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.crewQuest).toEqual(createCrewQuest());
    expect(hydrated.crewQuest.crewReady).toBe(false);
    expect(hydrated.approvalQuest.approvalReady).toBe(true);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.crewWork);
    expect(parseCrewQuest(undefined).phase).toBe('unstarted');
    expect(createLabQuest().labReady).toBe(false);
  });
});
