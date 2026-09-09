import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { JOURNAL_CAP, TILE } from './constants';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import {
  API_HEADER,
  API_PATH,
  CHECKLIST,
  DEMO_SLOT_KEY,
  DOCS_TEXT,
  KIOSK_FEEDBACK,
  KIOSK_TITLE,
  canAward43,
  canAward44,
  createKioskQuest,
  faceLeaking,
  parseKioskQuest,
} from './kiosk';
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

function openVault(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.kioskVault.x, WORLD_POS.kioskVault.y, 'workshop'), { type: 'INTERACT' });
}

function openFace(state: GameState): GameState {
  const next = playing(state);
  return act(at(next, WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y, 'workshop'), { type: 'INTERACT' });
}

describe('kiosk stations after servicePosted', () => {
  it('unlocks q a e on empty cells, keeps landmarks, and does not award 4.3/4.4 on workshop success', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(MAP_IDS).toContain('workshop');
    expect(WORKSHOP.legend[4]).toBe('#...........e..#');
    expect(WORKSHOP.legend[5]).toBe('#u.z...a..m.j..#');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t....#');
    expect(JSON.stringify(WORKSHOP.legend.join(''))).not.toMatch(/[PEIRFDGY]/);
    expect(STREET.legend[5]).toContain('o');
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(WORLD_POS.libraryInner).toEqual(WORLD_POS.libraryInner);
    expect(playerHitsSolid('workshop', WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.kioskVault.x, WORLD_POS.kioskVault.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y)).toBe(true);
    expect(playerHitsSolid('workshop', WORKSHOP.spawn.x, WORKSHOP.spawn.y)).toBe(false);
    let state = enterWorkshop(playFestivalDone(checkpoint()));
    const before = listInteractables(state).map((item) => item.id);
    expect(before).not.toContain('kiosk_docs');
    expect(before).not.toContain('kiosk_vault');
    expect(before).not.toContain('kiosk_face');
    state = playToWorkshopDone(checkpoint());
    expect(state.storyObjective).toBe(OBJECTIVES.kioskWork);
    expect(state.kioskQuest.kioskReady).toBe(false);
    expect(state.evidence['4.3']).toBeUndefined();
    expect(state.evidence['4.4']).toBeUndefined();
    const after = listInteractables(state).map((item) => item.id);
    expect(after).toContain('kiosk_docs');
    expect(after).toContain('kiosk_vault');
    expect(after).toContain('kiosk_face');
    expect(JOURNAL_CAP).toBe(96);
  });
});

describe('4.3 dummy key and simulated request', () => {
  it('starts leaking, fails exposure and missing-key, and awards only after inspect + both fails + vault + clean face + 200', () => {
    expect(DOCS_TEXT).toContain(API_PATH);
    expect(DOCS_TEXT).toContain(API_HEADER);
    expect(DOCS_TEXT).toContain(DEMO_SLOT_KEY);
    expect(DOCS_TEXT).toContain('وهمي');
    expect(KIOSK_FEEDBACK.missing).toBe('المفتاح غير موجود');
    let state = playToWorkshopDone(checkpoint());
    expect(faceLeaking(state)).toBe(true);
    expect(state.kioskQuest.vaultHasKey).toBe(false);
    state = openDocs(state);
    expect(state.kioskQuest.inspectedDocs).toBe(true);
    expect(state.evidence['4.3']).toBeUndefined();
    state = openVault(state);
    expect(state.kioskQuest.vaultHasKey).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = openFace(state);
    expect(state.mode).toBe('kiosk');
    expect(state.kioskQuest.faceHasKey).toBe(true);
    expect(state.kioskQuest.openedBroken).toBe(true);
    state = act(state, { type: 'KIOSK_SEND' });
    expect(state.kioskQuest.sawExposure).toBe(true);
    expect(state.shopFeedback).toBe(KIOSK_FEEDBACK.exposure);
    expect(state.evidence['4.3']).toBeUndefined();
    state = act(state, { type: 'KIOSK_STRIP' });
    expect(state.kioskQuest.faceHasKey).toBe(false);
    state = act(state, { type: 'KIOSK_SEND' });
    expect(state.kioskQuest.sawMissingKey).toBe(true);
    expect(state.shopFeedback).toBe(KIOSK_FEEDBACK.missing);
    expect(canAward43(state.kioskQuest)).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = openVault(state);
    state = act(state, { type: 'KIOSK_VAULT_PUT' });
    expect(state.kioskQuest.vaultHasKey).toBe(true);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = openFace(state);
    state = act(state, { type: 'KIOSK_SEND' });
    expect(state.shopFeedback).toBe(KIOSK_FEEDBACK.ok200);
    expect(state.kioskQuest.requestOk).toBe(true);
    expect(canAward43(state.kioskQuest)).toBe(true);
    expect(state.evidence['4.3']).toBe('demonstrated');
    expect(state.evidence['4.4']).toBeUndefined();
  });

  it('inspect-only, vault-without-send, manager-talk, and robot تم do not award 4.3', () => {
    let state = playToWorkshopDone(checkpoint());
    state = openDocs(state);
    expect(state.evidence['4.3']).toBeUndefined();
    state = openVault(state);
    state = act(state, { type: 'KIOSK_VAULT_PUT' });
    state = act(state, { type: 'CLOSE_OVERLAY' });
    expect(state.evidence['4.3']).toBeUndefined();
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_thanks');
    expect(state.evidence['4.3']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = openFace(state);
    state = act(state, { type: 'KIOSK_ROBOT_DONE' });
    expect(state.shopFeedback).toBe(KIOSK_FEEDBACK.robotDone);
    expect(state.evidence['4.3']).toBeUndefined();
  });
});

describe('4.4 RTL repair and manual lookup', () => {
  it('starts LTR-broken, fails lookup until RTL, and awards only after isolate + lookup + checklist', () => {
    expect(KIOSK_TITLE).toBe('احجز موعد المعاينة');
    expect(CHECKLIST.title).toBe('العنوان من اليمين');
    expect(CHECKLIST.slot).toContain('slot-id');
    expect(CHECKLIST.lookup).toContain('التأكيد');
    expect(KIOSK_FEEDBACK.fixRtl).toBe('أصلح اتجاه الواجهة أولاً');
    let state = playToWorkshopDone(checkpoint());
    state = openFace(state);
    expect(state.kioskQuest.layoutRtl).toBe(false);
    expect(state.kioskQuest.openedBroken).toBe(true);
    state = act(state, { type: 'KIOSK_LOOKUP', slot: 'sunday' });
    expect(state.shopFeedback).toBe(KIOSK_FEEDBACK.fixRtl);
    expect(state.kioskQuest.lookupDone).toBe(false);
    expect(state.evidence['4.4']).toBeUndefined();
    state = act(state, { type: 'CLOSE_OVERLAY' });
    expect(state.evidence['4.4']).toBeUndefined();
    state = openFace(state);
    state = act(state, { type: 'KIOSK_SET_RTL' });
    state = act(state, { type: 'KIOSK_ISOLATE' });
    state = act(state, { type: 'KIOSK_LOOKUP', slot: 'monday' });
    expect(state.kioskQuest.lookupDone).toBe(true);
    expect(state.shopFeedback).toContain('slot-id: mon-am');
    expect(canAward44(state.kioskQuest)).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    expect(state.evidence['4.4']).toBeUndefined();
    state = openFace(state);
    state = act(state, { type: 'KIOSK_CHECK', item: 'title' });
    state = act(state, { type: 'KIOSK_CHECK', item: 'slot' });
    state = act(state, { type: 'KIOSK_CHECK', item: 'lookup' });
    expect(canAward44(state.kioskQuest)).toBe(true);
    expect(state.evidence['4.4']).toBe('demonstrated');
  });
});

describe('kiosk success', () => {
  it('awards both ids, thanks the manager for the usable kiosk, and keeps the robot unsupported', () => {
    let state = playToWorkshopDone(checkpoint());
    state = openDocs(state);
    state = openFace(state);
    state = act(state, { type: 'KIOSK_SEND' });
    state = act(state, { type: 'KIOSK_STRIP' });
    state = act(state, { type: 'KIOSK_SEND' });
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = openVault(state);
    state = act(state, { type: 'KIOSK_VAULT_PUT' });
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = openFace(state);
    state = act(state, { type: 'KIOSK_SEND' });
    expect(state.evidence['4.3']).toBe('demonstrated');
    state = act(state, { type: 'KIOSK_SET_RTL' });
    state = act(state, { type: 'KIOSK_ISOLATE' });
    state = act(state, { type: 'KIOSK_LOOKUP', slot: 'tuesday' });
    state = act(state, { type: 'KIOSK_CHECK', item: 'title' });
    state = act(state, { type: 'KIOSK_CHECK', item: 'slot' });
    state = act(state, { type: 'KIOSK_CHECK', item: 'lookup' });
    expect(state.evidence['4.4']).toBe('demonstrated');
    expect(state.kioskQuest.kioskReady).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.labWork);
    expect(state.labQuest.labReady).toBe(false);
    expect(state.evidence['4.5']).toBeUndefined();
    expect(state.evidence['4.6']).toBeUndefined();
    expect(state.evidence['5.4']).toBeUndefined();
    expect(state.journalEvents.some((event) => event.id === 'kiosk_ready')).toBe(true);
    expect(state.journalEvents.some((event) => event.id === 'service_posted')).toBe(true);
    state = playing(state);
    state = act(at(state, WORLD_POS.manager.x, WORLD_POS.manager.y, 'workshop'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('manager_kiosk_thanks');
    expect(DIALOGUE.manager_kiosk_thanks.text(state.playerName)).toMatch(/كiosk/);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_kiosk');
    expect(DIALOGUE.companion_after_kiosk.text(state.playerName)).toMatch(/ضع المفتاح على الشاشة|Book appointment/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness|شهادة/);
    expect(state.journalEvents.length).toBeLessThanOrEqual(JOURNAL_CAP);
    expect(state.evidence['4.3']).toBe('demonstrated');
    expect(state.evidence['4.4']).toBe('demonstrated');
    expect(state.evidence['4.5']).toBeUndefined();
    expect(state.evidence['4.6']).toBeUndefined();
    expect(state.evidence['5.4']).toBeUndefined();
    expect(state.labQuest.labReady).toBe(false);
  });

  it('hydrates missing kioskQuest as unstarted with face leaking after posted, saveVersion 1', () => {
    const state = playToWorkshopDone(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, kioskQuest: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.kioskQuest).toEqual(createKioskQuest());
    expect(hydrated.kioskQuest.faceHasKey).toBe(false);
    expect(hydrated.workshopQuest.servicePosted).toBe(true);
    expect(faceLeaking(hydrated)).toBe(true);
    expect(parseKioskQuest(undefined).phase).toBe('unstarted');
  });
});
