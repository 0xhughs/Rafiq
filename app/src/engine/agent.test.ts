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
  CHAT_PLAN_TEXT,
  GOAL_SLOTS_TEXT,
  LIVE_HOURS_TEXT,
  canAward51,
  canAward52,
  createAgentQuest,
  neighborBoardText,
  parseAgentQuest,
} from './agent';
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

describe('agent stations after labReady', () => {
  it('places h and x on empty row 8, keeps landmarks, and does not award 5.1/5.2 on lab success', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[4]).toBe('#...........e..#');
    expect(WORKSHOP.legend[5]).toBe('#u.z...a..m.j..#');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t....#');
    expect(WORKSHOP.legend[7]).toBe('#.......d......#');
    expect(WORKSHOP.legend[8]).toBe('#..w.fh..vx.l..#');
    expect(WORKSHOP.legend[8][3]).toBe('w');
    expect(WORKSHOP.legend[8][5]).toBe('f');
    expect(WORKSHOP.legend[8][6]).toBe('h');
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
    expect(playerHitsSolid('workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    expect(JOURNAL_CAP).toBe(72);

    let state = playToKioskDone(checkpoint());
    const beforeReady = listInteractables(state).map((item) => item.id);
    expect(beforeReady).not.toContain('agent_console');
    expect(beforeReady).not.toContain('agent_board');
    expect(beforeReady).toContain('lab_terminal');
    state = playToLabDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.agentWork);
    expect(state.labQuest.labReady).toBe(true);
    expect(state.agentQuest.agentReady).toBe(false);
    expect(state.evidence['5.1']).toBeUndefined();
    expect(state.evidence['5.2']).toBeUndefined();
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('agent_console');
    expect(after).toContain('agent_board');
    expect(after).toContain('lab_terminal');
  });
});

describe('5.1 observe-act-check on the neighborhood board', () => {
  it('awards only after chat-plan fail, three tools in the trace, and inspecting the posted board', () => {
    expect(CHAT_PLAN_TEXT).toBe('سأكتب الفترات الآن من الدردشة.');
    expect(GOAL_SLOTS_TEXT).toContain('لوحة الحي');
    let state = playToLabDone(checkpoint());
    state = openBoard(state);
    expect(neighborBoardText(state.agentQuest)).toBe(BOARD_EMPTY);
    expect(state.evidence['5.1']).toBeUndefined();
    state = playing(state);
    state = openConsole(state);
    expect(state.mode).toBe('agent');
    expect(state.agentQuest.openedAgent).toBe(true);
    expect(state.evidence['5.1']).toBeUndefined();
    state = act(state, { type: 'AGENT_CHAT_PLAN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.chatPlan);
    expect(neighborBoardText(state.agentQuest)).toBe(BOARD_EMPTY);
    expect(canAward51(state.agentQuest, true)).toBe(false);
    state = configureCorrect(state);
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.successStop);
    expect(state.agentQuest.trace.map((step) => step.tool)).toEqual([
      'read_slots',
      'write_notice',
      'verify_notice',
    ]);
    expect(state.agentQuest.trace.map((step) => step.phase)).toEqual(['راقب', 'نفّذ', 'تحقق']);
    expect(canAward51(state.agentQuest, true)).toBe(false);
    expect(state.evidence['5.1']).toBeUndefined();
    state = playing(state);
    state = openBoard(state);
    expect(state.shopFeedback ?? neighborBoardText(state.agentQuest)).toBeTruthy();
    const board = neighborBoardText(state.agentQuest);
    expect(board).toContain('sun-pm');
    expect(board).toContain('mon-am');
    expect(board).toContain('tue-pm');
    expect(board).not.toContain(LIVE_HOURS_TEXT);
    expect(canAward51(state.agentQuest, true)).toBe(true);
    expect(state.evidence['5.1']).toBe('demonstrated');
    expect(state.evidence['5.2']).toBeUndefined();
  });

  it('inspect-only, manager-talk, and robot تم do not award 5.1', () => {
    let state = playToLabDone(checkpoint());
    state = openConsole(state);
    expect(state.agentQuest.openedAgent).toBe(true);
    expect(state.evidence['5.1']).toBeUndefined();
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_lab_thanks');
    expect(DIALOGUE.manager_lab_thanks.text(state.playerName)).toMatch(/النسخة المجمّدة|الإنتاج/);
    expect(state.evidence['5.1']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = openBoard(state);
    expect(neighborBoardText(state.agentQuest)).toBe(BOARD_EMPTY);
    expect(state.evidence['5.1']).toBeUndefined();
    state = playing(state);
    state = openConsole(state);
    state = act(state, { type: 'AGENT_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.robotDone);
    expect(state.evidence['5.1']).toBeUndefined();
  });
});

describe('5.2 four-part job and stopping', () => {
  it('rejects wrong config, then awards after success-stop and missing-input stop', () => {
    let state = playToLabDone(checkpoint());
    state = openConsole(state);
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.missingConfig);
    expect(state.evidence['5.2']).toBeUndefined();
    state = act(state, { type: 'AGENT_LOAD_JOB', job: 'slots' });
    state = act(state, { type: 'AGENT_SET_GOAL', goal: 'chat_only' });
    state = act(state, { type: 'AGENT_TOGGLE_TOOL', tool: 'read' });
    state = act(state, { type: 'AGENT_TOGGLE_TOOL', tool: 'write' });
    state = act(state, { type: 'AGENT_TOGGLE_TOOL', tool: 'verify' });
    state = act(state, { type: 'AGENT_SET_SUCCESS', test: 'slots_posted' });
    state = act(state, { type: 'AGENT_SET_STOP', rule: 'budget_3_or_missing' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.wrongGoal);
    state = act(state, { type: 'AGENT_SET_GOAL', goal: 'post_slots' });
    state = act(state, { type: 'AGENT_TOGGLE_TOOL', tool: 'hours' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.wrongTools);
    state = act(state, { type: 'AGENT_TOGGLE_TOOL', tool: 'hours' });
    state = act(state, { type: 'AGENT_SET_SUCCESS', test: 'robot_done' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.wrongSuccess);
    state = act(state, { type: 'AGENT_SET_SUCCESS', test: 'click_count' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.wrongSuccess);
    state = act(state, { type: 'AGENT_SET_SUCCESS', test: 'slots_posted' });
    state = act(state, { type: 'AGENT_SET_STOP', rule: 'budget_1' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.budget1);
    expect(neighborBoardText(state.agentQuest)).toBe(BOARD_EMPTY);
    expect(state.evidence['5.2']).toBeUndefined();
    state = act(state, { type: 'AGENT_SET_STOP', rule: 'budget_3_or_missing' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.successStop);
    expect(state.agentQuest.successStopped).toBe(true);
    expect(canAward52(state.agentQuest, true)).toBe(false);
    const posted = neighborBoardText(state.agentQuest);
    state = act(state, { type: 'AGENT_LOAD_JOB', job: 'shelf' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.missingInput);
    expect(neighborBoardText(state.agentQuest)).toBe(posted);
    expect(canAward52(state.agentQuest, true)).toBe(true);
    expect(state.evidence['5.2']).toBe('demonstrated');
  });
});

describe('runner limits and agentReady', () => {
  it('stops an extra step at budget 3, refuses live_hours, and thanks the manager', () => {
    let state = playToLabDone(checkpoint());
    state = openConsole(state);
    state = act(state, { type: 'AGENT_CHAT_PLAN' });
    state = configureCorrect(state);
    state = act(state, { type: 'AGENT_RUN' });
    state = playing(state);
    state = openBoard(state);
    expect(state.evidence['5.1']).toBe('demonstrated');
    state = playing(state);
    state = openConsole(state);
    state = act(state, { type: 'AGENT_LOAD_JOB', job: 'shelf' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(state.evidence['5.2']).toBe('demonstrated');
    state = act(state, { type: 'AGENT_INVOKE', tool: 'live_hours' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.permission);
    state = act(state, { type: 'AGENT_LOAD_JOB', job: 'slots' });
    state = act(state, { type: 'AGENT_SET_STOP', rule: 'unlimited' });
    state = act(state, { type: 'AGENT_EXTRA_STEP' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.unlimitedExtra);
    expect(neighborBoardText(state.agentQuest)).toContain(LIVE_HOURS_TEXT);
    expect(state.agentQuest.stoppedExtra).toBe(false);
    expect(state.agentQuest.agentReady).toBe(false);
    state = act(state, { type: 'AGENT_SET_STOP', rule: 'budget_3_or_missing' });
    state = act(state, { type: 'AGENT_RUN' });
    expect(neighborBoardText(state.agentQuest)).not.toContain(LIVE_HOURS_TEXT);
    state = act(state, { type: 'AGENT_EXTRA_STEP' });
    expect(state.shopFeedback).toBe(AGENT_FEEDBACK.budget3);
    expect(neighborBoardText(state.agentQuest)).toContain('sun-pm');
    expect(neighborBoardText(state.agentQuest)).not.toContain(LIVE_HOURS_TEXT);
    expect(state.agentQuest.stoppedExtra).toBe(true);
    expect(state.agentQuest.agentReady).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.bridgeWork);
    expect(state.evidence['5.3']).toBeUndefined();
    expect(state.bridgeQuest.bridgeReady).toBe(false);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness|شهادة/);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_agent_thanks');
    expect(DIALOGUE.manager_agent_thanks.text(state.playerName)).toMatch(
      /لوحة الحي تعرض الفترات الثلاث/,
    );
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_agent');
    expect(DIALOGUE.companion_after_agent.text(state.playerName)).toMatch(
      /الدردشة وحدها وكالة|المشغّل اختياري/,
    );
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    expect(state.journalEvents.some((event) => event.id === 'lab_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'agent_ready')).toBe(true);
  });

  it('hydrates missing agentQuest as unstarted, saveVersion 1', () => {
    const state = playToLabDone(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, agentQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.agentQuest).toEqual(createAgentQuest());
    expect(hydrated.agentQuest.agentReady).toBe(false);
    expect(hydrated.labQuest.labReady).toBe(true);
    expect(hydrated.labQuest).toEqual(expect.objectContaining({ labReady: true }));
    expect(parseAgentQuest(undefined).phase).toBe('unstarted');
    expect(createLabQuest().labReady).toBe(false);
    expect(hydrated.storyObjective).toBe(OBJECTIVES.agentWork);
  });
});

