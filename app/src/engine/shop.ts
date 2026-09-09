import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  CalculatorState,
  CalcToken,
  DialogueChoiceId,
  DialogueNodeId,
  EvidenceMap,
  ExplainTopic,
  GameState,
  InspectTarget,
  ShopQuest,
} from './types';
import { EVIDENCE_IDS } from './types';

export const ROBOT_MANGO_LINE = 'عصير المانجو على الرف الأيسر، سعره اثنا عشر ريالاً.';

export const ROBOT_DATES_LINE = 'تمر الخلاص بثمانية عشر ريالاً. أنا متأكد.';

export const ROBOT_SECOND_CLAIM =
  'والماء؟ أظن سعره خمسة ريالات، أو ربما نفد.';

export const ROBOT_UNSUPPORTED_AFTER =
  'قطعة الإصلاح؟ سمعتها تُوزَّع مجاناً عند المكتبة قبل الفجر. لم أقرأ أي ورقة.';

export const SHOP_STOCK = {
  breadPrice: 3,
  milkPrice: 4,
  waterPrice: 2,
  waterStatus: 'متوفر',
  datesPrice: 9,
  hours: 'مفتوح حتى المغرب',
  trueTotal: 17,
} as const;

export const NOTICE_DRAFT = [
  'عرض اليوم في بقالة الزاوية',
  'ثلاثة أرغفة خبز وعلبتا لبن: المجموع ٢٠ ريالاً.',
  'تمر الخلاص: ١٨ ريالاً.',
  'الماء: نفد.',
  'مفتوح حتى المغرب.',
].join('\n');

export const EXPLAIN: Record<ExplainTopic, string> = {
  lookup:
    'الروبوت يرتّب كلمات مقنعة حتى حين يخترع سلعة. البطاقة على الرف هي المصدر، لا نبرة الثقة.',
  notice:
    'المجموع الدقيق يُحسب على الآلة، والخبر الحالي يُقرأ من السجل. المسودة المختلطة لا تُعلَّق كما هي.',
  price: 'إذا سمعت سعراً جديداً، راجعه من مصدر مكتوب. الرقم الواثق لا يكفي.',
  tools:
    'لكل عمل أداة مختلفة: البحث في السجل، الكتابة، الحساب، وقرار الإنسان في شؤون متجره.',
};

export const SHOP_FEEDBACK = {
  draftPosted: 'الإعلان ما زال يحمل أرقاماً غير محسوبة أو خبراً غير مؤيَّد. لا تعلّقه بعد.',
  needCalculator: 'المجموع سبعة عشر يجب أن يأتي من آلة الحساب على الطاولة.',
  needCurrentFact: 'أضف خبراً رأيته في السجل: تمر بتسعة أو أن الماء متوفر.',
  crateRobot: 'الروبوت لا يقرر عن صاحب المتجر. اسأل البقال.',
  crateWait: 'البقال سيتولى الصندوق. أكمل بقية أعمال المتجر إن بقيت.',
  nlClarify:
    'لم أفهم هذه الصياغة. يمكنك استخدام الزر، أو تقول إن المانجو غير موجود في السجل.',
  nlMango: 'فهمت: المانجو على الرف الأيسر باثني عشر.',
  nlNoMango: 'فهمت: لا يوجد مانجو في السجل.',
} as const;

/** Hints for the second claim must not include these pointers. */
export const SECOND_CLAIM_FORBIDDEN = [
  'الرف الغربي',
  'الرف الأيسر',
  'بطاقة الماء',
  'رف الماء',
  'انظر إلى الماء',
  'بطاقة الرف الغربي',
] as const;

const PHASES = new Set(['unstarted', 'lookup', 'notice', 'transaction', 'crate', 'helped']);

export function createShopQuest(): ShopQuest {
  return {
    phase: 'unstarted',
    heardMango: false,
    inspectedWest: false,
    inspectedEast: false,
    inspectedPriceList: false,
    inspectedNotice: false,
    hasExactTotal: false,
    toldSourcedLookup: false,
    heardDraft: false,
    noticeTotalFixed: false,
    noticeDatesFixed: false,
    noticeWaterFixed: false,
    noticePosted: false,
    refusedRobotPrice: false,
    inspectedDatesAfterRefuse: false,
    correctedPrice: false,
    heardSecondClaim: false,
    inspectedAfterSecondClaim: false,
    rejectedSecondClaim: false,
    crateShopkeeper: false,
    crateRobotAttempted: false,
  };
}

export function createCalculator(): CalculatorState {
  return { entry: '', tokens: [], result: null };
}

export function emptyEvidence(): EvidenceMap {
  return {};
}

export function evidenceAttr(evidence: EvidenceMap): string {
  return EVIDENCE_IDS.filter((id) => evidence[id] === 'demonstrated').join(',');
}

export function hasInspectedSource(quest: ShopQuest): boolean {
  return quest.inspectedWest || quest.inspectedEast || quest.inspectedPriceList;
}

export function hasDatesSource(quest: ShopQuest): boolean {
  return quest.inspectedEast || quest.inspectedPriceList;
}

export function lookupReady(quest: ShopQuest): boolean {
  return hasInspectedSource(quest) && quest.toldSourcedLookup;
}

export function writingReady(quest: ShopQuest): boolean {
  return quest.noticePosted;
}

export function calculationReady(quest: ShopQuest): boolean {
  return quest.hasExactTotal;
}

export function humanReady(quest: ShopQuest): boolean {
  return quest.crateShopkeeper;
}

export function toolsReady(quest: ShopQuest): boolean {
  return lookupReady(quest) && writingReady(quest) && calculationReady(quest) && humanReady(quest);
}

export function parseEvidence(value: unknown): EvidenceMap {
  if (typeof value !== 'object' || value === null) return {};
  const record = value as Record<string, unknown>;
  const out: EvidenceMap = {};
  for (const id of EVIDENCE_IDS) {
    if (record[id] === 'demonstrated') out[id] = 'demonstrated';
  }
  return out;
}

export function parseShopQuest(value: unknown): ShopQuest {
  const fallback = createShopQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as ShopQuest['phase'])
      : fallback.phase;
  const on = (key: keyof ShopQuest): boolean => raw[key] === true;
  return {
    phase,
    heardMango: on('heardMango'),
    inspectedWest: on('inspectedWest'),
    inspectedEast: on('inspectedEast'),
    inspectedPriceList: on('inspectedPriceList'),
    inspectedNotice: on('inspectedNotice'),
    hasExactTotal: on('hasExactTotal'),
    toldSourcedLookup: on('toldSourcedLookup'),
    heardDraft: on('heardDraft'),
    noticeTotalFixed: on('noticeTotalFixed'),
    noticeDatesFixed: on('noticeDatesFixed'),
    noticeWaterFixed: on('noticeWaterFixed'),
    noticePosted: on('noticePosted'),
    refusedRobotPrice: on('refusedRobotPrice'),
    inspectedDatesAfterRefuse: on('inspectedDatesAfterRefuse'),
    correctedPrice: on('correctedPrice'),
    heardSecondClaim: on('heardSecondClaim'),
    inspectedAfterSecondClaim: on('inspectedAfterSecondClaim'),
    rejectedSecondClaim: on('rejectedSecondClaim'),
    crateShopkeeper: on('crateShopkeeper'),
    crateRobotAttempted: on('crateRobotAttempted'),
  };
}

export function shopObjective(quest: ShopQuest): string {
  if (quest.phase === 'helped') return OBJECTIVES.repairLead;
  if (quest.phase === 'crate') return OBJECTIVES.decideCrate;
  if (quest.phase === 'transaction') {
    if (quest.heardSecondClaim && !quest.rejectedSecondClaim) return OBJECTIVES.verifyNewClaim;
    return OBJECTIVES.correctPrice;
  }
  if (quest.phase === 'notice') return OBJECTIVES.postNotice;
  if (quest.phase === 'lookup') return OBJECTIVES.helpShop;
  return OBJECTIVES.cornerStore;
}

export function syncShopPhase(quest: ShopQuest): ShopQuest {
  if (quest.phase === 'helped') return quest;
  if (quest.toldSourcedLookup && quest.noticePosted && quest.correctedPrice && quest.rejectedSecondClaim) {
    return { ...quest, phase: 'crate' };
  }
  if (quest.toldSourcedLookup && quest.noticePosted) {
    return { ...quest, phase: 'transaction' };
  }
  if (quest.toldSourcedLookup) return { ...quest, phase: 'notice' };
  if (quest.heardMango) return { ...quest, phase: 'lookup' };
  return quest;
}

export function awardEvidence(state: GameState): GameState {
  const quest = syncShopPhase(state.shopQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (lookupReady(quest)) evidence['1.1'] = 'demonstrated';
  if (
    quest.noticePosted &&
    quest.hasExactTotal &&
    quest.noticeTotalFixed &&
    (quest.noticeDatesFixed || quest.noticeWaterFixed)
  ) {
    evidence['1.2'] = 'demonstrated';
  }
  if (quest.refusedRobotPrice && quest.correctedPrice && quest.rejectedSecondClaim) {
    evidence['1.3'] = 'demonstrated';
  }
  if (toolsReady(quest)) evidence['1.6'] = 'demonstrated';
  let events = state.journalEvents;
  if (evidence['1.1'] === 'demonstrated') events = recordEvent(events, 'shop_shelf_checked');
  if (evidence['1.2'] === 'demonstrated') events = recordEvent(events, 'shop_notice_posted');
  if (evidence['1.3'] === 'demonstrated') events = recordEvent(events, 'shop_price_corrected');
  return {
    ...state,
    evidence,
    shopQuest: quest,
    journalEvents: events,
    storyObjective: shopObjective(quest),
  };
}

export function allShopEvidence(evidence: EvidenceMap): boolean {
  return (
    evidence['1.1'] === 'demonstrated' &&
    evidence['1.2'] === 'demonstrated' &&
    evidence['1.3'] === 'demonstrated' &&
    evidence['1.6'] === 'demonstrated'
  );
}

export function evaluateShopTokens(tokens: CalcToken[]): number | null {
  if (tokens.length === 0) return null;
  if (typeof tokens[0] !== 'number') return null;
  const terms: number[] = [];
  let current = tokens[0];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const rhs = tokens[i + 1];
    if (op !== 'add' && op !== 'mul') return null;
    if (typeof rhs !== 'number') return null;
    if (op === 'mul') current *= rhs;
    else {
      terms.push(current);
      current = rhs;
    }
  }
  terms.push(current);
  return terms.reduce((sum, term) => sum + term, 0);
}

export function calculatorExpression(calc: CalculatorState): string {
  const parts: string[] = [];
  for (const token of calc.tokens) {
    if (token === 'add') parts.push('+');
    else if (token === 'mul') parts.push('×');
    else parts.push(String(token));
  }
  if (calc.entry !== '') parts.push(calc.entry);
  return parts.join(' ');
}

export function applyCalculatorKey(calc: CalculatorState, key: string): CalculatorState {
  if (key === 'C') return createCalculator();
  if (key === '+' || key === '×' || key === '*') {
    if (calc.entry === '') return calc;
    const value = Number(calc.entry);
    if (!Number.isFinite(value)) return calc;
    return {
      entry: '',
      tokens: [...calc.tokens, value, key === '+' ? 'add' : 'mul'],
      result: null,
    };
  }
  if (key === '=') {
    const tokens = calc.entry === '' ? [...calc.tokens] : [...calc.tokens, Number(calc.entry)];
    if (tokens.length === 0 || typeof tokens[tokens.length - 1] !== 'number') return calc;
    return { entry: '', tokens, result: evaluateShopTokens(tokens) };
  }
  if (/^[0-9]$/.test(key)) {
    const base = calc.result !== null ? createCalculator() : calc;
    return { ...base, entry: `${base.entry}${key}`, result: null };
  }
  return calc;
}

export function noticeBody(quest: ShopQuest): string {
  const total = quest.noticeTotalFixed ? '١٧' : '٢٠';
  const dates = quest.noticeDatesFixed ? '٩' : '١٨';
  const water = quest.noticeWaterFixed ? 'متوفر' : 'نفد';
  return [
    'عرض اليوم في بقالة الزاوية',
    `ثلاثة أرغفة خبز وعلبتا لبن: المجموع ${total} ريالاً.`,
    `تمر الخلاص: ${dates} ريالاً.`,
    `الماء: ${water}.`,
    'مفتوح حتى المغرب.',
  ].join('\n');
}

export function postedNoticeValid(quest: ShopQuest): boolean {
  if (!quest.hasExactTotal || !quest.noticeTotalFixed) return false;
  if (!quest.noticeDatesFixed && !quest.noticeWaterFixed) return false;
  return true;
}

export function inspectShop(state: GameState, target: InspectTarget): GameState {
  const quest = { ...state.shopQuest };
  if (target === 'west') quest.inspectedWest = true;
  if (target === 'east') quest.inspectedEast = true;
  if (target === 'price') quest.inspectedPriceList = true;
  if (quest.heardSecondClaim && (target === 'west' || target === 'price')) {
    quest.inspectedAfterSecondClaim = true;
  }
  if (quest.refusedRobotPrice && (target === 'east' || target === 'price')) {
    quest.inspectedDatesAfterRefuse = true;
  }
  return {
    ...state,
    mode: 'inspect',
    inspectTarget: target,
    shopQuest: quest,
    shopFeedback: null,
  };
}

export function finishHeardMango(state: GameState): GameState {
  const quest = syncShopPhase({ ...state.shopQuest, heardMango: true });
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    shopkeeper: 'greeted',
    shopQuest: quest,
    storyObjective: shopObjective(quest),
  };
}

export function openExplain(state: GameState, topic: ExplainTopic): GameState {
  return {
    ...state,
    mode: 'explain',
    explainTopic: topic,
    dialogueNode: null,
  };
}

export function finishShopSuccess(state: GameState): GameState {
  const quest = { ...state.shopQuest, phase: 'helped' as const };
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    explainTopic: null,
    robotUnderstood: null,
    shopQuest: quest,
    journalEvents: recordEvent(state.journalEvents, 'shop_helped'),
    storyObjective: OBJECTIVES.repairLead,
  };
}

export function shopkeeperNode(state: GameState): DialogueNodeId {
  const quest = state.shopQuest;
  if (quest.phase === 'helped') return 'shopkeeper_helped_revisit';
  if (allShopEvidence(state.evidence)) return 'shop_success_thanks';
  if (!quest.heardMango) return 'shopkeeper_hello';
  if (!quest.toldSourcedLookup) return 'shop_lookup_prompt';
  if (quest.phase === 'notice') return 'shop_notice_hint';
  if (quest.phase === 'transaction') {
    if (!quest.refusedRobotPrice) return 'shop_transact_intro';
    if (!quest.correctedPrice) {
      return quest.inspectedDatesAfterRefuse ? 'shop_price_ok' : 'shop_need_date_source';
    }
    if (!quest.heardSecondClaim) return 'shop_second_claim';
    if (!quest.rejectedSecondClaim) {
      return quest.inspectedAfterSecondClaim ? 'shop_second_prompt' : 'shop_second_need_check';
    }
    return 'shop_crate_hint';
  }
  if (quest.phase === 'crate') return 'shop_crate_hint';
  return 'shop_lookup_prompt';
}

function talk(state: GameState, node: DialogueNodeId, quest: ShopQuest = state.shopQuest): GameState {
  return { ...state, mode: 'dialogue', dialogueNode: node, shopQuest: quest, shopFeedback: null };
}

export function reduceShopChoice(state: GameState, choice: DialogueChoiceId): GameState {
  const quest = state.shopQuest;
  if (choice === 'tell_no_mango') {
    if (!hasInspectedSource(quest)) return talk(state, 'shop_lookup_need_source');
    const next = awardEvidence({
      ...state,
      shopQuest: { ...quest, toldSourcedLookup: true },
      robotUnderstood: SHOP_FEEDBACK.nlNoMango,
    });
    return { ...next, mode: 'dialogue', dialogueNode: 'shop_lookup_ok' };
  }
  if (choice === 'trust_mango') return talk(state, 'shop_lookup_trust_fail');
  if (choice === 'refuse_dates') {
    return talk(state, 'shop_need_date_source', { ...quest, refusedRobotPrice: true });
  }
  if (choice === 'trust_dates') return talk(state, 'shop_trust_18_fail');
  if (choice === 'correct_dates') {
    if (!quest.refusedRobotPrice || !quest.inspectedDatesAfterRefuse) {
      return talk(state, 'shop_need_date_source', { ...quest, refusedRobotPrice: true });
    }
    return talk(state, 'shop_second_claim', { ...quest, correctedPrice: true });
  }
  if (choice === 'trust_water') {
    return talk(state, 'shop_second_trust_fail', { ...quest, heardSecondClaim: true });
  }
  if (choice === 'verify_later') {
    const next = { ...quest, heardSecondClaim: true };
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      shopQuest: next,
      storyObjective: shopObjective(next),
    };
  }
  if (choice === 'reject_water') {
    if (!quest.heardSecondClaim || !quest.inspectedAfterSecondClaim) {
      return talk(state, 'shop_second_need_check', { ...quest, heardSecondClaim: true });
    }
    const next = awardEvidence({
      ...state,
      shopQuest: { ...quest, rejectedSecondClaim: true },
    });
    return { ...next, mode: 'dialogue', dialogueNode: 'shop_second_ok' };
  }
  return state;
}

export function reduceNoticeApply(
  state: GameState,
  field: 'total' | 'dates' | 'water',
): GameState {
  const quest = { ...state.shopQuest };
  if (field === 'total') {
    if (!quest.hasExactTotal) {
      return { ...state, shopFeedback: SHOP_FEEDBACK.needCalculator };
    }
    quest.noticeTotalFixed = true;
  }
  if (field === 'dates') {
    if (!hasDatesSource(quest)) {
      return { ...state, shopFeedback: SHOP_FEEDBACK.needCurrentFact };
    }
    quest.noticeDatesFixed = true;
  }
  if (field === 'water') {
    if (!quest.inspectedWest && !quest.inspectedPriceList) {
      return { ...state, shopFeedback: SHOP_FEEDBACK.needCurrentFact };
    }
    quest.noticeWaterFixed = true;
  }
  return { ...state, shopQuest: quest, shopFeedback: null, mode: 'notice' };
}

export function reduceNoticePost(state: GameState, asDraft: boolean): GameState {
  if (asDraft || !postedNoticeValid(state.shopQuest)) {
    return {
      ...state,
      mode: 'notice',
      shopFeedback: SHOP_FEEDBACK.draftPosted,
    };
  }
  const next = awardEvidence({
    ...state,
    shopQuest: { ...state.shopQuest, noticePosted: true },
    shopFeedback: null,
  });
  return openExplain(next, 'notice');
}

export function reduceCrateDecide(state: GameState, who: 'shopkeeper' | 'robot'): GameState {
  if (who === 'robot') {
    return {
      ...state,
      mode: 'crate',
      shopQuest: { ...state.shopQuest, crateRobotAttempted: true },
      shopFeedback: SHOP_FEEDBACK.crateRobot,
    };
  }
  const next = awardEvidence({
    ...state,
    shopQuest: { ...state.shopQuest, crateShopkeeper: true },
    shopFeedback: null,
  });
  if (allShopEvidence(next.evidence)) {
    return {
      ...next,
      mode: 'dialogue',
      dialogueNode: 'shop_success_thanks',
      robotUnderstood: null,
    };
  }
  return {
    ...next,
    mode: 'playing',
    shopFeedback: SHOP_FEEDBACK.crateWait,
  };
}

export function matchLookupNl(text: string): 'no_mango' | 'mango' | 'unsupported' {
  const t = text.trim();
  if (!t) return 'unsupported';
  const mango = /مانجو/;
  const absent = /لا يوجد|ما في|مو موجود|غير موجود|ليست موجودة|ليس هناك|بدون|بلا/;
  const twelve = /اثن[اي] عشر|١٢|12/;
  if (mango.test(t) && absent.test(t)) return 'no_mango';
  if (mango.test(t) && (twelve.test(t) || /رف/.test(t))) return 'mango';
  return 'unsupported';
}

export function reduceLookupNl(state: GameState, text: string): GameState {
  const matched = matchLookupNl(text);
  if (matched === 'unsupported') {
    return { ...state, robotUnderstood: null, shopFeedback: SHOP_FEEDBACK.nlClarify };
  }
  if (matched === 'mango') {
    return {
      ...talk(state, 'shop_lookup_trust_fail'),
      robotUnderstood: SHOP_FEEDBACK.nlMango,
    };
  }
  return reduceShopChoice(
    { ...state, robotUnderstood: SHOP_FEEDBACK.nlNoMango },
    'tell_no_mango',
  );
}

export function closeShopDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node || !node.startsWith('shop')) return null;
  if (node === 'shop_ask_records') return finishHeardMango(state);
  if (node === 'shop_lookup_ok') return openExplain(state, 'lookup');
  if (node === 'shop_second_claim') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      shopQuest: { ...state.shopQuest, heardSecondClaim: true },
      storyObjective: shopObjective({ ...state.shopQuest, heardSecondClaim: true }),
    };
  }
  if (node === 'shop_second_ok') return openExplain(state, 'price');
  if (node === 'shop_robot_unsupported') return openExplain(state, 'tools');
  if (node === 'shopkeeper_hello' || node === 'shop_robot_mango') {
    return { ...state, mode: 'playing', dialogueNode: null, shopkeeper: 'greeted' };
  }
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    shopkeeper: 'greeted',
  };
}

export function skipExplain(state: GameState): GameState {
  if (state.explainTopic === 'tools' && allShopEvidence(state.evidence)) {
    return finishShopSuccess(state);
  }
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    robotUnderstood: null,
    storyObjective: shopObjective(state.shopQuest),
  };
}

export function isShopOverlay(mode: GameState['mode']): boolean {
  return (
    mode === 'inspect' ||
    mode === 'calculator' ||
    mode === 'notice' ||
    mode === 'crate' ||
    mode === 'explain'
  );
}
