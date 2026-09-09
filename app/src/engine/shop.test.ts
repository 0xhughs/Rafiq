import { describe, expect, it } from 'vitest';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { WORLD_POS } from './maps';
import { robotPosition } from './npc';
import {
  SECOND_CLAIM_FORBIDDEN,
  applyCalculatorKey,
  createCalculator,
  createShopQuest,
  evaluateShopTokens,
  matchLookupNl,
  noticeBody,
  parseEvidence,
  parseShopQuest,
} from './shop';
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

function enterShop(state: GameState): GameState {
  return act(at(state, WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y, 'street'), { type: 'INTERACT' });
}

function interactPos(state: GameState, x: number, y: number): GameState {
  return act(at(state, x, y, 'shop'), { type: 'INTERACT' });
}

function hearMango(state: GameState): GameState {
  let next = interactPos(enterShop(state), WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  expect(next.dialogueNode).toBe('shopkeeper_hello');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(DIALOGUE.shop_robot_mango.text(next.playerName)).toBe(
    'عصير المانجو على الرف الأيسر، سعره اثنا عشر ريالاً.',
  );
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.dialogueNode).toBe('shop_ask_records');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.shopQuest.phase).toBe('lookup');
  expect(next.shopQuest.heardMango).toBe(true);
  return next;
}

function skipExplain(state: GameState): GameState {
  if (state.mode !== 'explain') return state;
  return act(state, { type: 'SKIP_EXPLAIN' });
}

function computeSeventeen(state: GameState): GameState {
  let next = interactPos(state, WORLD_POS.calculator.x, WORLD_POS.calculator.y);
  expect(next.mode).toBe('calculator');
  for (const key of ['3', '×', '3', '+', '2', '×', '4', '='] as const) {
    next = act(next, { type: 'CALCULATOR_KEY', key });
  }
  expect(next.calculator.result).toBe(17);
  expect(next.shopQuest.hasExactTotal).toBe(true);
  return act(next, { type: 'CLOSE_OVERLAY' });
}

function inspect(state: GameState, which: 'west' | 'east' | 'price'): GameState {
  const pos =
    which === 'west' ? WORLD_POS.shelfWest : which === 'east' ? WORLD_POS.shelfEast : WORLD_POS.priceList;
  const next = interactPos(state, pos.x, pos.y);
  expect(next.mode).toBe('inspect');
  return act(next, { type: 'CLOSE_OVERLAY' });
}

function playLookup(state: GameState): GameState {
  let next = hearMango(state);
  expect(next.evidence['1.1']).toBeUndefined();
  next = inspect(next, 'west');
  expect(next.evidence['1.1']).toBeUndefined();
  next = interactPos(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'tell_no_mango' });
  expect(next.evidence['1.1']).toBe('demonstrated');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  expect(next.shopQuest.phase).toBe('notice');
  return next;
}

function playNotice(state: GameState): GameState {
  let next = inspect(state, 'east');
  next = computeSeventeen(next);
  next = interactPos(next, WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
  expect(next.mode).toBe('notice');
  next = act(next, { type: 'NOTICE_APPLY', field: 'total' });
  next = act(next, { type: 'NOTICE_APPLY', field: 'dates' });
  next = act(next, { type: 'NOTICE_APPLY', field: 'water' });
  next = act(next, { type: 'NOTICE_POST', asDraft: false });
  expect(next.evidence['1.2']).toBe('demonstrated');
  next = skipExplain(next);
  expect(next.shopQuest.phase).toBe('transaction');
  return next;
}

function playPrice(state: GameState): GameState {
  let next = interactPos(state, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.dialogueNode).toBe('shop_robot_dates');
  next = act(next, { type: 'CHOOSE', choice: 'refuse_dates' });
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = inspect(next, 'east');
  next = interactPos(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'correct_dates' });
  expect(next.dialogueNode).toBe('shop_second_claim');
  expect(DIALOGUE.shop_second_claim.text(next.playerName)).toMatch(/ماء/);
  next = act(next, { type: 'CHOOSE', choice: 'verify_later' });
  next = inspect(next, 'west');
  next = interactPos(next, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  next = act(next, { type: 'CHOOSE', choice: 'reject_water' });
  expect(next.evidence['1.3']).toBe('demonstrated');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  expect(next.shopQuest.phase).toBe('crate');
  return next;
}

function playCrate(state: GameState): GameState {
  let next = interactPos(state, WORLD_POS.crate.x, WORLD_POS.crate.y);
  next = act(next, { type: 'CRATE_DECIDE', who: 'shopkeeper' });
  expect(next.evidence['1.6']).toBe('demonstrated');
  expect(next.dialogueNode).toBe('shop_success_thanks');
  expect(next.storyObjective).toBe(OBJECTIVES.repairLead);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(next.dialogueNode).toBe('shop_repair_lead');
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  expect(DIALOGUE.shop_robot_unsupported.text(next.playerName)).toMatch(/المكتبة|الفجر/);
  next = act(next, { type: 'ADVANCE_DIALOGUE' });
  next = skipExplain(next);
  expect(next.shopQuest.phase).toBe('helped');
  expect(next.journalEvents.some((event) => event.id === 'shop_helped')).toBe(true);
  return next;
}

describe('shop calculator', () => {
  it('evaluates 3×3+2×4 as 17 with multiplication first', () => {
    expect(evaluateShopTokens([3, 'mul', 3, 'add', 2, 'mul', 4])).toBe(17);
    let calc = createCalculator();
    for (const key of ['3', '×', '3', '+', '2', '×', '4', '=']) {
      calc = applyCalculatorKey(calc, key);
    }
    expect(calc.result).toBe(17);
  });
});

describe('shop evidence predicates', () => {
  it('does not award 1.1 on inspect alone or robot mango without a source', () => {
    let state = hearMango(checkpoint());
    expect(state.evidence['1.1']).toBeUndefined();
    state = inspect(state, 'west');
    expect(state.evidence['1.1']).toBeUndefined();
    state = inspect(state, 'east');
    state = inspect(state, 'price');
    expect(state.evidence['1.1']).toBeUndefined();
    state = interactPos(state, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
    state = act(state, { type: 'CHOOSE', choice: 'trust_mango' });
    expect(state.dialogueNode).toBe('shop_lookup_trust_fail');
    expect(state.evidence['1.1']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    const fresh = hearMango(checkpoint());
    state = interactPos(fresh, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
    state = act(state, { type: 'CHOOSE', choice: 'tell_no_mango' });
    expect(state.dialogueNode).toBe('shop_lookup_need_source');
    expect(state.evidence['1.1']).toBeUndefined();
  });

  it('awards 1.1 only after inspect then sourced fact, then allows skipping the note', () => {
    const state = playLookup(checkpoint());
    expect(state.evidence).toEqual({ '1.1': 'demonstrated' });
    expect(state.mode).toBe('playing');
    expect(JSON.stringify(state.storyObjective)).not.toMatch(/1\.1/);
  });

  it('rejects posting the unchecked draft and requires calculator 17 plus a source fact', () => {
    let state = playLookup(checkpoint());
    state = interactPos(state, WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
    state = act(state, { type: 'NOTICE_POST', asDraft: true });
    expect(state.evidence['1.2']).toBeUndefined();
    expect(state.shopQuest.noticePosted).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = inspect(state, 'east');
    state = interactPos(state, WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
    state = act(state, { type: 'NOTICE_APPLY', field: 'total' });
    expect(state.shopQuest.noticeTotalFixed).toBe(false);
    state = act(state, { type: 'CLOSE_OVERLAY' });
    state = computeSeventeen(state);
    state = interactPos(state, WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
    state = act(state, { type: 'NOTICE_APPLY', field: 'total' });
    state = act(state, { type: 'NOTICE_POST', asDraft: false });
    expect(state.evidence['1.2']).toBeUndefined();
    state = act(state, { type: 'NOTICE_APPLY', field: 'dates' });
    state = act(state, { type: 'NOTICE_POST', asDraft: false });
    expect(state.evidence['1.2']).toBeUndefined();
    expect(noticeBody(state.shopQuest)).toMatch(/نفد/);
    state = act(state, { type: 'NOTICE_APPLY', field: 'water' });
    state = act(state, { type: 'NOTICE_POST', asDraft: false });
    expect(state.evidence['1.2']).toBe('demonstrated');
    expect(noticeBody(state.shopQuest)).toMatch(/١٧/);
    expect(noticeBody(state.shopQuest)).not.toMatch(/٢٠|١٨|نفد/);
  });

  it('does not treat calculator as a lookup tool for 1.1', () => {
    let state = hearMango(checkpoint());
    state = computeSeventeen(state);
    expect(state.evidence['1.1']).toBeUndefined();
    state = interactPos(state, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
    state = act(state, { type: 'CHOOSE', choice: 'tell_no_mango' });
    expect(state.evidence['1.1']).toBeUndefined();
  });

  it('recovers from trusting 18, then requires inspect after refuse and independent water check', () => {
    let state = playNotice(playLookup(checkpoint()));
    state = interactPos(state, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(state, { type: 'CHOOSE', choice: 'trust_dates' });
    expect(state.dialogueNode).toBe('shop_trust_18_fail');
    expect(state.evidence['1.3']).toBeUndefined();
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = playPrice(state);
    expect(state.evidence['1.3']).toBe('demonstrated');
    expect(state.shopQuest.phase).toBe('crate');
  });

  it('does not name the second object in the unaided-check copy', () => {
    const forbidden = SECOND_CLAIM_FORBIDDEN.join('|');
    expect(DIALOGUE.shop_second_need_check.text('علي')).not.toMatch(new RegExp(forbidden));
    expect(DIALOGUE.shop_second_prompt.text('علي')).not.toMatch(new RegExp(forbidden));
    expect(DIALOGUE.shop_second_trust_fail.text('علي')).not.toMatch(new RegExp(forbidden));
    expect(OBJECTIVES.verifyNewClaim).not.toMatch(new RegExp(forbidden));
    expect(DIALOGUE.shop_second_claim.text('علي')).toMatch(/ماء|نفد|خمسة/);
  });

  it('lets the shopkeeper decide the crate and refuses a robot decision', () => {
    let state = playPrice(playNotice(playLookup(checkpoint())));
    state = interactPos(state, WORLD_POS.crate.x, WORLD_POS.crate.y);
    state = act(state, { type: 'CRATE_DECIDE', who: 'robot' });
    expect(state.evidence['1.6']).toBeUndefined();
    expect(state.shopQuest.crateRobotAttempted).toBe(true);
    expect(state.mode).toBe('crate');
    state = act(state, { type: 'CRATE_DECIDE', who: 'shopkeeper' });
    expect(state.evidence['1.6']).toBe('demonstrated');
    expect(state.evidence['1.1']).toBe('demonstrated');
    expect(state.evidence['1.2']).toBe('demonstrated');
    expect(state.evidence['1.3']).toBe('demonstrated');
  });

  it('finishes the visit with a repair lead, locked library door, and a still-unsupported robot', () => {
    let state = playCrate(playPrice(playNotice(playLookup(checkpoint()))));
    expect(Object.keys(state.evidence).sort()).toEqual(['1.1', '1.2', '1.3', '1.6']);
    expect(state.storyObjective).toBe(OBJECTIVES.repairLead);
    state = act(at(state, WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y, 'library'), {
      type: 'INTERACT',
    });
    expect(state.dialogueNode).toBe('library_inner_locked');
    state = act(state, { type: 'ADVANCE_DIALOGUE' });
    state = act(at(state, WORLD_POS.robot.x, WORLD_POS.robot.y, 'street'), { type: 'INTERACT' });
    expect(state.dialogueNode).toBe('companion_after_shop');
    expect(DIALOGUE.companion_after_shop.text(state.playerName)).toMatch(/المكتبة|الفجر/);
    expect(robotPosition(state).x).toBe(state.position.x - 32);
  });

  it('keeps only demonstrated 1.1 1.2 1.3 1.6 and drops unknown keys on hydrate', () => {
    const state = playLookup(checkpoint());
    const envelope = toEnvelope(state);
    expect(envelope.saveVersion).toBe(1);
    expect(envelope.evidence).toEqual({ '1.1': 'demonstrated' });
    const messy = {
      ...envelope,
      evidence: { '1.1': 'demonstrated', '9.9': 'demonstrated', foo: 'yes' },
    };
    const valid = validateSave(JSON.stringify(messy));
    expect(valid).not.toBeNull();
    expect(valid!.evidence).toEqual({ '1.1': 'demonstrated' });
    expect(parseEvidence({ '1.6': 'demonstrated', '2.1': 'demonstrated' })).toEqual({
      '1.6': 'demonstrated',
    });
  });

  it('hydrates old evidence {} saves as shop unstarted', () => {
    const state = checkpoint();
    const envelope = toEnvelope(state);
    const legacy = { ...envelope, shopQuest: undefined, evidence: {} };
    const parsed = validateSave(JSON.stringify(legacy));
    expect(parsed).not.toBeNull();
    const hydrated = hydrateSave(parsed!, 'ok', false);
    expect(hydrated.shopQuest).toEqual(createShopQuest());
    expect(hydrated.evidence).toEqual({});
    expect(parseShopQuest(undefined).phase).toBe('unstarted');
  });

  it('accepts meaning-preserving Arabic lookup lines and clarifies the rest', () => {
    expect(matchLookupNl('لا يوجد مانجو على البطاقة')).toBe('no_mango');
    expect(matchLookupNl('عصير المانجو باثني عشر')).toBe('mango');
    expect(matchLookupNl('افتح الملفات')).toBe('unsupported');
    let state = inspect(hearMango(checkpoint()), 'west');
    state = interactPos(state, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
    state = act(state, { type: 'SUBMIT_NL', text: 'لا يوجد مانجو' });
    expect(state.evidence['1.1']).toBe('demonstrated');
    expect(state.robotUnderstood).toMatch(/مانجو/);
  });
});
