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
import {
  BRIDGE_EXPLAIN,
  HOUR_SAT,
  HOUR_SUN,
  HOUR_WED,
  MCP_NOTE,
} from './bridge';
import { createLabQuest } from './lab';
import { listInteractables } from './interact';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import { createInitialState, reduce } from './state';
import { hydrateSave, toEnvelope, validateSave } from './save';
import type { GameAction, GameState, MapId } from './types';
import { MAP_IDS } from './types';
import {
  BULLETIN_1447,
  BULLETIN_2208,
  CLOCK_START,
  CLOCK_SUN8,
  DEMO_SLOT_KEY,
  HOUR_FRI,
  HOUR_MON,
  INPUT_RECORD,
  ONESHOT_TEXT,
  OUTPUT_DRAFT,
  RUN_COUNT_LABEL,
  SKILL_CARD_EMPTY,
  SKILL_EXPLAIN,
  SKILL_FEEDBACK,
  SKILL_NAME,
  STANDING_LINE,
  STEPS_LOOKUP,
  STOP_UNKNOWN,
  TRAY_EMPTY,
  TRAY_SUN,
  TRIGGER_HOURS,
  TRIGGER_LOG,
  canAward55,
  canAward56,
  createSkillQuest,
  fiveFieldsCorrect,
  oneshotText,
  parseSkillQuest,
  trialText,
} from './skill';

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

describe('skill stations after bridgeReady', () => {
  it('places J and Z on row 8, keeps landmarks, and does not award 5.5/5.6 on bridge success', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[4]).toBe('#...........e..#');
    expect(WORKSHOP.legend[5]).toBe('#u.z...a..m.j..#');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t4...#');
    expect(WORKSHOP.legend[7]).toBe('#.......d......#');
    expect(WORKSHOP.legend[8]).toBe('#O1wJfhZ.vx3l2V#');
    expect(WORKSHOP.legend[8][3]).toBe('w');
    expect(WORKSHOP.legend[8][4]).toBe('J');
    expect(WORKSHOP.legend[8][5]).toBe('f');
    expect(WORKSHOP.legend[8][6]).toBe('h');
    expect(WORKSHOP.legend[8][7]).toBe('Z');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(WORKSHOP.legend[8][9]).toBe('v');
    expect(WORKSHOP.legend[8][10]).toBe('x');
    expect(WORKSHOP.legend[8][12]).toBe('l');
    expect(WORKSHOP.legend[6][8]).toBe('.');
    expect(WORKSHOP.legend[7][8]).toBe('d');
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(WORLD_POS.builderBench).not.toEqual(WORLD_POS.skillBench);
    expect(playerHitsSolid('workshop', WORLD_POS.skillBench.x, WORLD_POS.skillBench.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(104);
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);
    expect(`${SKILL_EXPLAIN.oneshot_vs_skill} ${SKILL_EXPLAIN.standing_vs_skill} ${SKILL_EXPLAIN.routine_clock}`).not.toMatch(
      /MCP|harness/,
    );
    expect(OBJECTIVES.skillWork).not.toMatch(/MCP|harness/);
    expect(OBJECTIVES.skillReady).not.toMatch(/MCP|harness/);
    expect(OBJECTIVES.approvalWork).not.toMatch(/MCP|harness/);
    expect(JOURNAL_TEXT.skill_ready).not.toMatch(/MCP|harness/);
    expect(JSON.stringify(createSkillQuest())).not.toMatch(/MCP|harness/);

    const labDone = playToLabDone(checkpoint());
    expect(JSON.stringify(labDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(labDone)).not.toMatch(/harness/);
    const kioskDone = playToKioskDone(checkpoint());
    expect(JSON.stringify(kioskDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(kioskDone)).not.toMatch(/harness/);
    const agentDone = playToAgentDone(checkpoint());
    expect(JSON.stringify(agentDone)).not.toMatch(/MCP/);
    expect(JSON.stringify(agentDone)).not.toMatch(/harness/);

    let state = playToAgentDone(checkpoint());
    const beforeReady = listInteractables(state).map((item) => item.id);
    expect(beforeReady).not.toContain('skill_bench');
    expect(beforeReady).not.toContain('skill_clock');
    expect(beforeReady).toContain('bridge_host');
    state = playToBridgeDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.skillWork);
    expect(state.bridgeQuest.bridgeReady).toBe(true);
    expect(state.skillQuest.skillReady).toBe(false);
    expect(state.evidence['5.3']).toBe('demonstrated');
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.evidence['5.6']).toBeUndefined();
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('skill_bench');
    expect(after).toContain('skill_clock');
    expect(after).toContain('bridge_host');
    expect(after).toContain('agent_console');
    expect(after).toContain('lab_terminal');
  });
});

describe('5.5 reusable skill', () => {
  it('awards only after oneshot invent, correct, standing refuse, five fields, save, and NH-2208', () => {
    let state = playToBridgeDone(checkpoint());
    state = openBench(state);
    expect(state.mode).toBe('skill');
    expect(state.skillQuest.view).toBe('bench');
    expect(state.skillQuest.openedBench).toBe(true);
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.skillQuest.skillReady).toBe(false);
    expect(SKILL_CARD_EMPTY).toBe('لا مهارة محفوظة');
    state = act(state, { type: 'SKILL_ONESHOT' });
    expect(oneshotText(state.skillQuest)).toBe(ONESHOT_TEXT);
    expect(ONESHOT_TEXT).toContain('الدقيقة 7');
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.skillQuest.skillSaved).toBe(false);
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.saveBeforeCorrect);
    state = act(state, { type: 'SKILL_CORRECT' });
    expect(oneshotText(state.skillQuest)).toBe(BULLETIN_1447);
    expect(BULLETIN_1447).toContain(HOUR_SAT);
    expect(BULLETIN_1447).toContain(HOUR_SUN);
    expect(BULLETIN_1447).toContain(HOUR_WED);
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.missingConfig);
    state = act(state, { type: 'SKILL_SET_TRIGGER', trigger: 'anytime' });
    state = act(state, { type: 'SKILL_SET_INPUT', input: 'secret' });
    state = act(state, { type: 'SKILL_SET_STEPS', steps: 'mix_opinion' });
    state = act(state, { type: 'SKILL_SET_OUTPUT', output: 'send_now' });
    state = act(state, { type: 'SKILL_SET_STOP', stop: 'always_invent' });
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.wrongTrigger);
    state = act(state, { type: 'SKILL_SET_TRIGGER', trigger: 'hours_record' });
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.wrongInput);
    state = act(state, { type: 'SKILL_SET_INPUT', input: 'record_id' });
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.wrongSteps);
    state = act(state, { type: 'SKILL_SET_STEPS', steps: 'lookup_format' });
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.wrongOutput);
    state = act(state, { type: 'SKILL_SET_OUTPUT', output: 'tray_draft' });
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.wrongStop);
    state = act(state, { type: 'SKILL_SET_STOP', stop: 'unknown_stop' });
    expect(fiveFieldsCorrect(state.skillQuest)).toBe(true);
    state = act(state, { type: 'SKILL_STANDING' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.standing);
    expect(STANDING_LINE).toBe('العربية المبسطة. لا تخترع أرقاماً.');
    expect(state.evidence['5.5']).toBeUndefined();
    state = act(state, { type: 'SKILL_SAVE' });
    expect(state.skillQuest.skillSaved).toBe(true);
    expect(state.skillQuest.inspectedCard).toBe(true);
    expect(SKILL_NAME).toBe('تلخيص ساعات القاعة');
    expect(TRIGGER_HOURS).toBe('عند ورود سجل ساعات قاعة الحي');
    expect(INPUT_RECORD).toContain('NH-xxxx');
    expect(STEPS_LOOKUP).toContain('ابحث');
    expect(OUTPUT_DRAFT).toContain('الدرج');
    expect(STOP_UNKNOWN).toContain('غير محددة');
    expect(JSON.stringify(state.skillQuest)).not.toContain(DEMO_SLOT_KEY);
    expect(canAward55(state.skillQuest, true)).toBe(false);
    state = act(state, { type: 'SKILL_TRIAL_SAME' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.trialSame);
    expect(state.evidence['5.5']).toBeUndefined();
    state = act(state, { type: 'SKILL_TRIAL_SECOND' });
    expect(trialText(state.skillQuest)).toBe(BULLETIN_2208);
    expect(BULLETIN_2208).toContain(HOUR_FRI);
    expect(BULLETIN_2208).toContain(HOUR_MON);
    expect(canAward55(state.skillQuest, true)).toBe(true);
    expect(state.evidence['5.5']).toBe('demonstrated');
    expect(state.evidence['5.6']).toBeUndefined();
    expect(state.skillQuest.skillReady).toBe(false);
    expect(state.storyObjective).toBe(OBJECTIVES.skillWork);
  });

  it('inspect-only, manager-talk, robot تم, standing, connector, and secret do not award 5.5', () => {
    let state = playToBridgeDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.skillWork);
    state = openBench(state);
    expect(state.skillQuest.openedBench).toBe(true);
    expect(state.evidence['5.5']).toBeUndefined();
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_bridge_thanks');
    expect(DIALOGUE.manager_bridge_thanks.text(state.playerName)).toMatch(
      /مسودة ساعات قاعة الحي حُفظت من NH-1447/,
    );
    expect(state.evidence['5.5']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = openClock(state);
    expect(state.mode).toBe('skill');
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.evidence['5.6']).toBeUndefined();
    state = playing(state);
    state = openBench(state);
    state = act(state, { type: 'SKILL_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.robotDone);
    expect(state.evidence['5.5']).toBeUndefined();
    state = act(state, { type: 'SKILL_STANDING' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.standing);
    state = act(state, { type: 'SKILL_LOAD_CONNECTOR' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.connector);
    state = act(state, { type: 'SKILL_EMBED_SECRET' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.secret);
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.skillQuest.skillReady).toBe(false);
  });
});

describe('5.6 routine clock', () => {
  it('awards only after sun-8 fire, pause, and a silent post-pause tick', () => {
    let state = playToBridgeDone(checkpoint());
    state = openClock(state);
    expect(state.mode).toBe('skill');
    expect(state.skillQuest.view).toBe('clock');
    expect(state.skillQuest.clockLabel).toBe(CLOCK_START);
    expect(CLOCK_START).toContain('16:00');
    expect(state.skillQuest.trayText).toBe(TRAY_EMPTY);
    expect(RUN_COUNT_LABEL(0)).toBe('تشغيلات الروتين: 0');
    state = act(state, { type: 'SKILL_ARM' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.armBeforeSkill);
    expect(state.evidence['5.6']).toBeUndefined();
    state = act(state, { type: 'SKILL_SET_SCHEDULE', schedule: 'every_event' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.eventSchedule);
    state = act(state, { type: 'SKILL_SET_SCHEDULE', schedule: 'send_dawn' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.sendSchedule);
    state = playing(state);
    state = complete55(state);
    expect(state.evidence['5.5']).toBe('demonstrated');
    expect(state.evidence['5.6']).toBeUndefined();
    state = playing(state);
    state = openClock(state);
    state = act(state, { type: 'SKILL_TICK_EMPTY' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.emptySource);
    expect(state.skillQuest.trayText).toBe(TRAY_EMPTY);
    expect(state.skillQuest.runCount).toBe(0);
    state = act(state, { type: 'SKILL_SET_SCHEDULE', schedule: 'sun8' });
    state = act(state, { type: 'SKILL_ARM' });
    expect(state.skillQuest.armed).toBe(true);
    state = act(state, { type: 'SKILL_TICK_SUN8' });
    expect(state.skillQuest.fired).toBe(true);
    expect(state.skillQuest.inspectedFire).toBe(true);
    expect(state.skillQuest.clockLabel).toBe(CLOCK_SUN8);
    expect(CLOCK_SUN8).toContain('08:00');
    expect(state.skillQuest.trayText).toBe(TRAY_SUN);
    expect(TRAY_SUN).toContain(HOUR_SAT);
    expect(state.skillQuest.runCount).toBe(1);
    expect(TRIGGER_LOG).toContain(SKILL_NAME);
    expect(state.evidence['5.6']).toBeUndefined();
    expect(state.mode).toBe('skill');
    state = act(state, { type: 'SKILL_PAUSE' });
    expect(state.mode).toBe('skill');
    expect(state.mode).not.toBe('paused');
    expect(state.skillQuest.paused).toBe(true);
    expect(state.evidence['5.6']).toBeUndefined();
    const tray = state.skillQuest.trayText;
    const count = state.skillQuest.runCount;
    state = act(state, { type: 'SKILL_TICK_SUN8' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.paused);
    expect(state.skillQuest.trayText).toBe(tray);
    expect(state.skillQuest.runCount).toBe(count);
    expect(state.skillQuest.silentTick).toBe(true);
    expect(canAward56(state.skillQuest, true)).toBe(true);
    expect(state.evidence['5.6']).toBe('demonstrated');
    expect(state.skillQuest.skillReady).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.approvalWork);
    expect(state.evidence['5.7']).toBeUndefined();
    expect(state.evidence['6.3']).toBeUndefined();
    expect(state.approvalQuest.approvalReady).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'bridge_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'skill_ready')).toBe(true);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    expect(JSON.stringify(state)).not.toMatch(/harness/);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_skill_thanks');
    expect(DIALOGUE.manager_skill_thanks.text(state.playerName)).toMatch(
      /حُفظت مهارة تلخيص ساعات القاعة وجُرّبت على NH-2208، والروتين المجدول توقف بعد الإلبات/,
    );
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_skill');
    expect(DIALOGUE.companion_after_skill.text(state.playerName)).toMatch(
      /الدستور الدائم مهارة|الروتين المتوقف ما زال يعمل/,
    );
    expect(robotPosition(state).x).toBe(state.position.x - 32);
  });

  it('cancel-without-fire and pause-without-fire do not award, and hydrates missing skillQuest', () => {
    let state = complete55(playToBridgeDone(checkpoint()));
    state = playing(state);
    state = openClock(state);
    state = act(state, { type: 'SKILL_SET_SCHEDULE', schedule: 'sun8' });
    state = act(state, { type: 'SKILL_ARM' });
    state = act(state, { type: 'SKILL_CANCEL' });
    expect(state.shopFeedback).toBe(SKILL_FEEDBACK.cancelled);
    state = act(state, { type: 'SKILL_TICK_SUN8' });
    expect(state.skillQuest.fired).toBe(false);
    expect(state.evidence['5.6']).toBeUndefined();
    expect(state.skillQuest.skillReady).toBe(false);
    state = act(state, { type: 'SKILL_PAUSE' });
    expect(state.skillQuest.paused).toBe(true);
    expect(state.skillQuest.fired).toBe(false);
    expect(state.evidence['5.6']).toBeUndefined();
    state = complete56(playToBridgeDone(checkpoint()));
    expect(state.evidence['5.5']).toBe('demonstrated');
    expect(state.evidence['5.6']).toBe('demonstrated');
    expect(state.skillQuest.skillReady).toBe(true);
    const envelope = toEnvelope(playToBridgeDone(checkpoint()));
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, skillQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.skillQuest).toEqual(createSkillQuest());
    expect(hydrated.skillQuest.skillReady).toBe(false);
    expect(hydrated.bridgeQuest.bridgeReady).toBe(true);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.skillWork);
    expect(parseSkillQuest(undefined).phase).toBe('unstarted');
    expect(createLabQuest().labReady).toBe(false);
  });
});
