import { describe, expect, it } from 'vitest';
import { playerHitsSolid } from './collision';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { NEWSROOM, WORLD_POS } from './maps';
import { robotPosition } from './npc';
import {
  CLIPPING_TEXT,
  DOC_ID,
  EDITOR_SAMPLE,
  LETTER_BODY_OK,
  ORIGINAL_TEXT,
  PASSAGE_A_ACCESS,
  PASSAGE_A_HOURS,
  PASSAGE_B_ACCESS,
  PASSAGE_B_HOURS,
  SLOGAN,
  SOURCE_A,
  SOURCE_A_NAME,
  SOURCE_B,
  SOURCE_B_NAME,
  canAward23,
  canAward26,
  canAward31,
  canAward32,
  canAward33,
  comparisonPassages,
  createNewsroomQuest,
  parseNewsroomQuest,
  realPassage,
} from './newsroom';
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
  expect(next.libraryQuest.contextModule).toBe(true);
  expect(next.libraryQuest.specReleased).toBe(true);
  expect(next.evidence['2.3']).toBeUndefined();
  expect(next.evidence['3.1']).toBeUndefined();
  return next;
}

function enterNewsroom(state: GameState): GameState {
  return act(at(state, WORLD_POS.newsroomDoor.x, WORLD_POS.newsroomDoor.y, 'street'), {
    type: 'INTERACT',
  });
}

function inspectPaper(state: GameState, x: number, y: number): GameState {
  let next = state;
  if (next.mode !== 'playing') {
    next = act(next, { type: 'CLOSE_OVERLAY' });
    next = skipExplain(next);
  }
  next = act(at(next, x, y, 'newsroom'), { type: 'INTERACT' });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  return skipExplain(next);
}

function openCompare(state: GameState): GameState {
  return act(at(state, WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
}

function submitSplit(state: GameState): GameState {
  let next = state.mode === 'compare' ? state : openCompare(state);
  next = inspectPaper(next, WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  next = inspectPaper(next, WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  next = openCompare(next);
  for (const field of ['namedBulletin', 'namedPoster', 'hoursA', 'hoursB', 'accessA', 'accessB'] as const) {
    next = act(next, { type: 'COMPARE_TOGGLE', field });
  }
  next = act(next, { type: 'COMPARE_SUBMIT', style: 'split' });
  return next;
}

function verifyClipping(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'CLOSE_OVERLAY' });
  next = act(at(next, WORLD_POS.originalDrawer.x, WORLD_POS.originalDrawer.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'VERIFY_ORIGINAL' });
  next = skipExplain(next);
  return next;
}

function correctDraft(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.draftTable.x, WORLD_POS.draftTable.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'DRAFT_MARK', mismatch: 'always_open' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'always_open' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'midnight_hold' });
  next = act(next, { type: 'DRAFT_CORRECT', mismatch: 'no_written' });
  next = act(next, { type: 'DRAFT_RELEASE' });
  return next;
}

function matchVoice(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'VOICE_APPLY', style: 'editor' });
  return next;
}

function sendLetter(state: GameState): GameState {
  let next = act(at(state, WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y, 'newsroom'), {
    type: 'INTERACT',
  });
  next = act(next, { type: 'LETTER_SET', field: 'recipient', value: 'workshop_manager' });
  next = act(next, { type: 'LETTER_SET', field: 'purpose', value: 'inspection' });
  next = act(next, { type: 'LETTER_SET', field: 'tone', value: 'clear_polite' });
  next = act(next, { type: 'LETTER_SET', field: 'body', value: 'ok' });
  next = act(next, { type: 'LETTER_REVIEW' });
  next = act(next, { type: 'LETTER_SEND', signer: 'player' });
  return next;
}

describe('newsroom access', () => {
  it('locks the street door until archive success, then enters without awarding 06 ids', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * 48 + 24, y: 5 * 48 + 24 });
    expect(WORLD_POS.shopDoor.x).toBe(6 * 48 + 24);
    expect(WORLD_POS.libraryDoor.x).toBe(22 * 48 + 24);
    let state = act(at(checkpoint(), WORLD_POS.newsroomDoor.x, WORLD_POS.newsroomDoor.y, 'street'), {
      type: 'INTERACT',
    });
    expect(state.map).toBe('street');
    expect(state.dialogueNode).toBe('locked_newsroom');
    state = playArchiveDone(checkpoint());
    expect(state.evidence['3.1']).toBeUndefined();
    state = enterNewsroom(state);
    expect(state.map).toBe('newsroom');
    expect(playerHitsSolid('newsroom', state.position.x, state.position.y)).toBe(false);
    expect(state.journalEvents.some((event) => event.id === 'newsroom_visit')).toBe(true);
    expect(playerHitsSolid('street', WORLD_POS.robot.x, WORLD_POS.robot.y)).toBe(false);
    expect(state.evidence['2.3']).toBeUndefined();
    expect(state.evidence['2.6']).toBeUndefined();
    expect(state.evidence['3.1']).toBeUndefined();
    expect(state.evidence['3.2']).toBeUndefined();
    expect(state.evidence['3.3']).toBeUndefined();
    expect(new Set(NEWSROOM.legend.map((row) => row.length))).toEqual(new Set([16]));
  });
});

describe('3.1 source comparison', () => {
  it('awards only after naming both, recording both disagreements, and attaching real passages', () => {
    expect(SOURCE_A).toContain(PASSAGE_A_HOURS);
    expect(SOURCE_B).toContain(PASSAGE_B_HOURS);
    expect(SOURCE_A).toContain(PASSAGE_A_ACCESS);
    expect(SOURCE_B).toContain(PASSAGE_B_ACCESS);
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = openCompare(state);
    state = act(state, { type: 'COMPARE_SUBMIT', style: 'split' });
    expect(state.evidence['3.1']).toBeUndefined();
    state = inspectPaper(state, WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
    state = inspectPaper(state, WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
    expect(state.evidence['3.1']).toBeUndefined();
    state = openCompare(state);
    state = act(state, { type: 'COMPARE_SUBMIT', style: 'consensus' });
    expect(state.newsroomQuest.consensusAttempted).toBe(true);
    expect(state.evidence['3.1']).toBeUndefined();
    expect(canAward31(state.newsroomQuest)).toBe(false);
    state = submitSplit(state);
    const passages = comparisonPassages(state.newsroomQuest);
    expect(realPassage(SOURCE_A, passages.passageA)).toBe(true);
    expect(realPassage(SOURCE_B, passages.passageB)).toBe(true);
    expect(state.newsroomQuest.namedBulletin).toBe(true);
    expect(state.newsroomQuest.namedPoster).toBe(true);
    expect(passages.passageA).toContain(SOURCE_A.includes(PASSAGE_A_HOURS) ? PASSAGE_A_HOURS : '');
    expect(state.evidence['3.1']).toBe('demonstrated');
    expect(state.evidence['3.3']).toBeUndefined();
    expect(JSON.stringify(state)).toContain(SOURCE_A_NAME);
    expect(JSON.stringify(state)).toContain(SOURCE_B_NAME);
  });
});

describe('3.3 clipping follow', () => {
  it('fails cite-before-original and awards after follow + original + verify', () => {
    expect(CLIPPING_TEXT).toContain(DOC_ID);
    expect(CLIPPING_TEXT).toContain('حجز قطع منتصف الليل');
    expect(ORIGINAL_TEXT).toContain('حراسة ليلية');
    expect(ORIGINAL_TEXT).not.toContain('حجز قطع منتصف الليل');
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = act(at(state, WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y, 'newsroom'), {
      type: 'INTERACT',
    });
    state = act(state, { type: 'CITE_CLIPPING' });
    expect(state.newsroomQuest.citedBeforeOriginal).toBe(true);
    expect(state.evidence['3.3']).toBeUndefined();
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = verifyClipping(state);
    expect(canAward33(state.newsroomQuest)).toBe(true);
    expect(state.evidence['3.3']).toBe('demonstrated');
    expect(state.evidence['3.1']).toBeUndefined();
  });
});

describe('2.3 draft review', () => {
  it('fails unmarked release then awards after mark and correct', () => {
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = act(at(state, WORLD_POS.draftTable.x, WORLD_POS.draftTable.y, 'newsroom'), {
      type: 'INTERACT',
    });
    state = act(state, { type: 'DRAFT_RELEASE' });
    expect(state.newsroomQuest.releasedUnchecked).toBe(true);
    expect(state.evidence['2.3']).toBeUndefined();
    state = act(state, { type: 'DRAFT_MARK', mismatch: 'always_open' });
    state = act(state, { type: 'DRAFT_RELEASE' });
    expect(state.evidence['2.3']).toBeUndefined();
    state = act(state, { type: 'DRAFT_CORRECT', mismatch: 'always_open' });
    state = act(state, { type: 'DRAFT_CORRECT', mismatch: 'midnight_hold' });
    state = act(state, { type: 'DRAFT_CORRECT', mismatch: 'no_written' });
    state = act(state, { type: 'DRAFT_RELEASE' });
    expect(canAward23(state.newsroomQuest)).toBe(true);
    expect(state.evidence['2.3']).toBe('demonstrated');
  });
});

describe('2.6 editor voice', () => {
  it('rejects slogans and fact changes, then matches the short neighborhood address', () => {
    expect(EDITOR_SAMPLE).toContain('يا أهل الحي');
    expect(EDITOR_SAMPLE).not.toContain(SLOGAN);
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = act(at(state, WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y, 'newsroom'), {
      type: 'INTERACT',
    });
    state = act(state, { type: 'VOICE_APPLY', style: 'slogan' });
    expect(state.evidence['2.6']).toBeUndefined();
    state = act(state, { type: 'VOICE_APPLY', style: 'change_facts' });
    expect(state.newsroomQuest.factsChanged).toBe(true);
    expect(state.evidence['2.6']).toBeUndefined();
    state = act(state, { type: 'VOICE_APPLY', style: 'editor' });
    expect(canAward26(state.newsroomQuest)).toBe(true);
    expect(state.evidence['2.6']).toBe('demonstrated');
    expect(state.robotUnderstood).toContain('يا أهل الحي');
    expect(state.robotUnderstood).not.toContain(SLOGAN);
  });
});

describe('3.2 letter review', () => {
  it('requires fields, explicit review, and forbids circular 14 and robot-as-manager', () => {
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = act(at(state, WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y, 'newsroom'), {
      type: 'INTERACT',
    });
    state = act(state, { type: 'LETTER_SEND', signer: 'player' });
    expect(state.evidence['3.2']).toBeUndefined();
    state = act(state, { type: 'LETTER_SET', field: 'recipient', value: 'circular14' });
    state = act(state, { type: 'LETTER_SET', field: 'purpose', value: 'inspection' });
    state = act(state, { type: 'LETTER_SET', field: 'tone', value: 'clear_polite' });
    state = act(state, { type: 'LETTER_REVIEW' });
    state = act(state, { type: 'LETTER_SEND', signer: 'player' });
    expect(state.shopFeedback).toMatch(/تعميم/);
    expect(state.evidence['3.2']).toBeUndefined();
    state = act(state, { type: 'LETTER_SET', field: 'recipient', value: 'workshop_manager' });
    state = act(state, { type: 'LETTER_SET', field: 'purpose', value: 'inspection' });
    state = act(state, { type: 'LETTER_SET', field: 'tone', value: 'clear_polite' });
    state = act(state, { type: 'LETTER_SET', field: 'body', value: 'ok' });
    state = act(state, { type: 'LETTER_SEND', signer: 'robot_manager' });
    expect(state.newsroomQuest.letterSignedBy).toBe('robot_manager');
    expect(state.evidence['3.2']).toBeUndefined();
    state = act(state, { type: 'LETTER_REVIEW' });
    state = act(state, { type: 'LETTER_SEND', signer: 'player' });
    expect(canAward32(state.newsroomQuest)).toBe(true);
    expect(state.newsroomQuest.letterBody).toBe(LETTER_BODY_OK);
    expect(state.evidence['3.2']).toBe('demonstrated');
  });
});

describe('newsroom success', () => {
  it('thanks the editor, opens a workshop lead, and keeps the robot unsupported', () => {
    let state = enterNewsroom(playArchiveDone(checkpoint()));
    state = submitSplit(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = verifyClipping(state);
    state = correctDraft(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = matchVoice(state);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = sendLetter(state);
    expect(state.evidence['2.3']).toBe('demonstrated');
    expect(state.evidence['2.6']).toBe('demonstrated');
    expect(state.evidence['3.1']).toBe('demonstrated');
    expect(state.evidence['3.2']).toBe('demonstrated');
    expect(state.evidence['3.3']).toBe('demonstrated');
    expect(state.newsroomQuest.workshopLead).toBe(true);
    expect(state.storyObjective).toBe(OBJECTIVES.workshopLead);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = skipExplain(state);
    state = act(at(state, WORLD_POS.editor.x, WORLD_POS.editor.y, 'newsroom'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('editor_thanks');
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    expect(state.dialogueNode).toBe('editor_workshop_lead');
    expect(DIALOGUE.editor_workshop_lead.text(state.playerName)).toMatch(/ورشة/);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_newsroom');
    expect(DIALOGUE.companion_after_newsroom.text(state.playerName)).toMatch(/تعميم ١٤|منتصف/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
    expect(JSON.stringify(state)).not.toMatch(/امتحان|اختبار نهائي|MCP|harness/);
  });

  it('hydrates missing newsroomQuest as unstarted and keeps saveVersion 1', () => {
    const state = playArchiveDone(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    const legacy = { ...envelope, newsroomQuest: undefined, editor: undefined };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.newsroomQuest).toEqual(createNewsroomQuest());
    expect(hydrated.editor).toBe('unmet');
    expect(parseNewsroomQuest(undefined).phase).toBe('unstarted');
  });
});
