import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, TILE } from './constants';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import {
  canAward43,
  canAward44,
} from './kiosk';
import {
  AGENT_FEEDBACK,
  BOARD_EMPTY,
  canAward51,
  canAward52,
  neighborBoardText,
} from './agent';
import {
  BRIDGE_EXPLAIN,
  BRIDGE_FEEDBACK,
  DRAFT_EMPTY,
  DRAFT_SAVED,
  HOUR_SAT,
  HOUR_SUN,
  HOUR_WED,
  MCP_NOTE,
  RESOURCE_WEEK,
  TOOL_LOOKUP,
  TOOL_SAVE,
  canAward53,
  createBridgeQuest,
  grantLimited,
  mcpComplete,
  parseBridgeQuest,
} from './bridge';
import { createLabQuest } from './lab';
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

describe('bridge stations after agentReady', () => {
  it('places f and v on empty row 8, keeps landmarks, and does not award 5.3 on agent success', () => {
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
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(playerHitsSolid('workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(112);
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);

    let state = playToLabDone(checkpoint());
    const beforeReady = listInteractables(state).map((item) => item.id);
    expect(beforeReady).not.toContain('bridge_host');
    expect(beforeReady).not.toContain('bridge_browser');
    expect(beforeReady).toContain('agent_console');
    state = playToAgentDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.bridgeWork);
    expect(state.agentQuest.agentReady).toBe(true);
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    expect(state.evidence['5.1']).toBe('demonstrated');
    expect(state.evidence['5.2']).toBe('demonstrated');
    expect(state.evidence['5.3']).toBeUndefined();
    expect(JSON.stringify(state)).not.toMatch(/MCP/);
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('bridge_host');
    expect(after).toContain('bridge_browser');
    expect(after).toContain('agent_console');
    expect(after).toContain('lab_terminal');
  });
});

describe('5.3 civic lookup and draft', () => {
  it('awards only after connect, list, limited grant, NH-1447 lookup, save, and seeing the draft', () => {
    let state = playToAgentDone(checkpoint());
    state = openHost(state);
    expect(state.mode).toBe('bridge');
    expect(state.bridgeQuest.openedHost).toBe(true);
    expect(state.evidence['5.3']).toBeUndefined();
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    state = act(state, { type: 'BRIDGE_LOOKUP' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.notConnected);
    expect(canAward53(state.bridgeQuest, true)).toBe(false);
    state = act(state, { type: 'BRIDGE_CONNECT' });
    expect(state.bridgeQuest.connected).toBe(true);
    expect(MCP_NOTE).toMatch(/MCP/);
    state = act(state, { type: 'BRIDGE_SAVE_DRAFT' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.notListed);
    state = act(state, { type: 'BRIDGE_LIST_TOOLS' });
    state = act(state, { type: 'BRIDGE_SAVE_DRAFT' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.notListed);
    state = act(state, { type: 'BRIDGE_LIST_RESOURCES' });
    state = act(state, { type: 'BRIDGE_LOOKUP' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.wrongGrant);
    state = limitedGrant(state);
    expect(grantLimited(state.bridgeQuest)).toBe(true);
    state = act(state, { type: 'BRIDGE_SAVE_DRAFT' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.saveWithoutLookup);
    expect(state.bridgeQuest.draftSaved).toBe(false);
    state = act(state, { type: 'BRIDGE_LOOKUP' });
    expect(state.bridgeQuest.lookedUp).toBe(true);
    expect(canAward53(state.bridgeQuest, true)).toBe(false);
    expect(state.evidence['5.3']).toBeUndefined();
    state = act(state, { type: 'BRIDGE_SAVE_DRAFT' });
    expect(state.bridgeQuest.draftSaved).toBe(true);
    expect(state.bridgeQuest.inspectedDraft).toBe(true);
    expect(DRAFT_SAVED).toContain(HOUR_SAT);
    expect(DRAFT_SAVED).toContain(HOUR_SUN);
    expect(DRAFT_SAVED).toContain(HOUR_WED);
    expect(canAward53(state.bridgeQuest, true)).toBe(true);
    expect(state.evidence['5.3']).toBe('demonstrated');
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    expect(TOOL_LOOKUP).toBe('lookup_hours');
    expect(TOOL_SAVE).toBe('save_draft');
    expect(RESOURCE_WEEK).toBe('hours://neighborhood/week');
  });

  it('inspect-only, manager-talk, and robot تم do not award 5.3', () => {
    let state = playToAgentDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.bridgeWork);
    state = openHost(state);
    expect(state.bridgeQuest.openedHost).toBe(true);
    expect(state.evidence['5.3']).toBeUndefined();
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_agent_thanks');
    expect(DIALOGUE.manager_agent_thanks.text(state.playerName)).toMatch(
      /لوحة الحي تعرض الفترات الثلاث/,
    );
    expect(state.evidence['5.3']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = openBrowser(state);
    expect(state.mode).toBe('bridge');
    expect(state.evidence['5.3']).toBeUndefined();
    state = playing(state);
    state = openHost(state);
    state = act(state, { type: 'BRIDGE_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.robotDone);
    expect(state.evidence['5.3']).toBeUndefined();
    expect(state.bridgeQuest.bridgeReady).toBe(false);
  });
});

describe('MCP named connector and browser contrast', () => {
  it('denies rewrite, misses pay_fees, refuses browser save, then closes the slice', () => {
    let state = playToAgentDone(checkpoint());
    state = connectListGrant(state);
    state = act(state, { type: 'BRIDGE_GRANT', grant: 'all' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.grantAll);
    expect(state.evidence['5.3']).toBeUndefined();
    state = act(state, { type: 'BRIDGE_GRANT', grant: 'rewrite' });
    state = act(state, { type: 'BRIDGE_GRANT', grant: 'payroll' });
    state = limitedGrant(state);
    expect(grantLimited(state.bridgeQuest)).toBe(true);
    state = act(state, { type: 'BRIDGE_LOOKUP_PAYROLL' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.payroll);
    state = act(state, { type: 'BRIDGE_LOOKUP' });
    state = act(state, { type: 'BRIDGE_SAVE_DRAFT' });
    expect(state.evidence['5.3']).toBe('demonstrated');
    state = act(state, { type: 'BRIDGE_INVOKE_REWRITE' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.deniedRewrite);
    expect(state.bridgeQuest.deniedRewrite).toBe(true);
    expect(state.bridgeQuest.draftSaved).toBe(true);
    state = act(state, { type: 'BRIDGE_INVOKE_PAY' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.missingPay);
    expect(mcpComplete(state.bridgeQuest)).toBe(true);
    state = act(state, { type: 'BRIDGE_LOAD_SKILL' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.loadSkill);
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    state = playing(state);
    state = openBrowser(state);
    expect(state.bridgeQuest.browserSeen).toBe(true);
    expect(state.evidence['5.3']).toBe('demonstrated');
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    state = act(state, { type: 'BRIDGE_BROWSER_SAVE' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.browserSave);
    expect(state.bridgeQuest.browserSaveFailed).toBe(true);
    expect(state.bridgeQuest.bridgeReady).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.skillWork);
    expect(state.evidence['5.5']).toBeUndefined();
    expect(state.evidence['5.6']).toBeUndefined();
    expect(state.skillQuest.skillReady).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'agent_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'bridge_ready')).toBe(true);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_bridge_thanks');
    expect(DIALOGUE.manager_bridge_thanks.text(state.playerName)).toMatch(
      /مسودة ساعات قاعة الحي حُفظت من NH-1447 عبر موصل محدود/,
    );
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_bridge');
    expect(DIALOGUE.companion_after_bridge.text(state.playerName)).toMatch(
      /MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/,
    );
    expect(robotPosition(state).x).toBe(state.position.x - 32);
  });

  it('keeps draft empty on browser-save before connector save, and hydrates missing bridgeQuest', () => {
    let state = playToAgentDone(checkpoint());
    expect(DRAFT_EMPTY).toBe('المسودة فارغة');
    state = openBrowser(state);
    state = act(state, { type: 'BRIDGE_BROWSER_SAVE' });
    expect(state.shopFeedback).toBe(BRIDGE_FEEDBACK.browserSave);
    expect(state.bridgeQuest.draftSaved).toBe(false);
    expect(state.evidence['5.3']).toBeUndefined();
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    const envelope = toEnvelope(playToAgentDone(checkpoint()));
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, bridgeQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.bridgeQuest).toEqual(createBridgeQuest());
    expect(hydrated.bridgeQuest.bridgeReady).toBe(false);
    expect(hydrated.agentQuest.agentReady).toBe(true);
    expect(parseBridgeQuest(undefined).phase).toBe('unstarted');
    expect(createLabQuest().labReady).toBe(false);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.bridgeWork);
  });
});


