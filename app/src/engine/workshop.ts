import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  AppointmentSlot,
  BoardKind,
  BriefAcceptance,
  BriefConstraints,
  BriefExclusions,
  BriefField,
  BriefScreens,
  DialogueNodeId,
  EvidenceMap,
  ExplainTopic,
  ExtraControl,
  GameState,
  JournalEvent,
  ResultPart,
  WorkshopQuest,
} from './types';
import { WORKSHOP_PHASES } from './types';

export const SLOT_LABELS: Record<AppointmentSlot, string> = {
  sunday: 'الأحد — بعد العصر',
  monday: 'الاثنين — ضحى',
  tuesday: 'الثلاثاء — عصراً',
};

export const NEED_TEXT = [
  'ورقة الحاجة — مدير الورشة',
  'الجيران يحتاجون لوحة مواعيد المعاينة بفترات مكتوبة.',
  `الفترات المعلّقة: ${SLOT_LABELS.sunday}، ${SLOT_LABELS.monday}، ${SLOT_LABELS.tuesday}.`,
  'الحجز: اختيار فترة معلّقة ثم ظهور «محجوز» على تلك الفترة.',
].join('\n');

export const EXTRAS_TEXT = [
  'طلبات إضافية — ليست الحاجة',
  'دفع إلكتروني',
  'دردشة مباشرة',
  'ساعات استقبال حيّة',
  'كiosk / مفتاح API',
  'هذه الطلبات خارج النطاق وما زالت غير متفق عليها من قاعة الأخبار.',
].join('\n');

export const SCREENS_OK = 'لوحة الفترات الثلاث المعلّقة + شاشة تأكيد الحجز';
export const CONSTRAINTS_OK = 'فترات معلّقة على الورق فقط، حجز واحد، بلا دفع وبلا دردشة';
export const EXCLUSIONS_OK =
  'لا دفع، لا دردشة، لا ساعات حيّة (ما زالت غير متفق عليها من قاعة الأخبار)، لا كiosk ولا مفتاح API';
export const ACCEPTANCE_OK = 'اختيار فترة معلّقة ثم ظهور «محجوز» على تلك الفترة';

export const WORKSHOP_EXPLAIN = {
  product:
    'وصف المنتج عقد للبنّاء: شاشات وقيود واستثناءات وقبول ملاحظ. قول الروبوت «تم» لا يكفي.',
  appointments:
    'حاجة واحدة: لوحة مواعيد المعاينة. احجز فترة معلّقة على الورق حتى تظهر «محجوز»، وأخرج الطلبات الإضافية.',
} as const;

export const WORKSHOP_FEEDBACK = {
  needInspect: 'اقرأ ورقة الحاجة أولاً: لوحة مواعيد المعاينة.',
  needScreens: 'أضف الشاشات: لوحة الفترات الثلاث المعلّقة وشاشة تأكيد الحجز.',
  needConstraints: 'أضف القيود: فترات معلّقة على الورق فقط، حجز واحد، بلا دفع وبلا دردشة.',
  needExclusions:
    'أضف الاستثناءات: لا دفع، لا دردشة، لا ساعات حيّة، لا كiosk ولا مفتاح API.',
  needAcceptance: 'أضف القبول الملاحظ: اختيار فترة معلّقة ثم ظهور «محجوز» على تلك الفترة.',
  buildWithoutBrief: 'البنّاء يرفض العمل بلا وصف منتج. اكتب الأجزاء الأربعة ثم سلّم الورق.',
  extrasInBrief: 'الوصف يحمل طلباً إضافياً. أخرج الدفع والدردشة والساعات الحيّة والكiosk ثم أعد البناء.',
  extraControl: 'هذا الزر خارج النطاق. احجز فترة معلّقة على اللوحة النحيلة.',
  inspectOnly: 'قراءة الورق لا تكفي. طابق الأجزاء الأربعة على ورقة الفحص ثم احجز فترة.',
  robotDone: 'قول «تم» ليس قبولاً. افحص اللوحة مقابل الوصف.',
  booked: 'الفترة محجوزة.',
  needSlim: 'احجز على لوحة الفترات الثلاث بلا أزرار إضافية.',
  resultNeedBoard: 'ابنِ اللوحة أولاً ثم طابقها على ورقة الفحص.',
  handoffOk: 'وُصف المنتج سُلّم إلى البنّاء.',
  builtSlim: 'بُنيت لوحة الفترات الثلاث.',
  builtBloated: 'بُنيت لوحة فيها طلبات إضافية. أخرجها من الوصف وأعد البناء.',
  resultMismatch: 'اللوحة لا تطابق هذا الجزء من العقد. صحّح الوصف أو أعد البناء.',
} as const;

const PHASES = new Set<string>(WORKSHOP_PHASES);

export function createWorkshopQuest(): WorkshopQuest {
  return {
    phase: 'unstarted',
    briefed: false,
    inspectedNeed: false,
    inspectedExtras: false,
    screens: null,
    constraints: null,
    exclusions: null,
    acceptance: null,
    extraPay: false,
    extraChat: false,
    extraLive: false,
    extraKiosk: false,
    extrasInBrief: false,
    handedOff: false,
    builtWithoutBrief: false,
    boardKind: 'none',
    inspectedResult: false,
    resultScreensOk: false,
    resultConstraintsOk: false,
    resultExclusionsOk: false,
    resultAcceptanceOk: false,
    bookedSlot: null,
    extraControlUsed: false,
    robotSaidDone: false,
    servicePosted: false,
    pendingExplain: null,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parseScreens(value: unknown): BriefScreens {
  if (value === 'board_and_confirm' || value === 'kiosk_api') return value;
  return null;
}

function parseConstraints(value: unknown): BriefConstraints {
  if (value === 'paper_one_no_pay_chat' || value === 'live_hours') return value;
  return null;
}

function parseExclusions(value: unknown): BriefExclusions {
  if (
    value === 'no_extras' ||
    value === 'include_pay' ||
    value === 'include_chat' ||
    value === 'include_live' ||
    value === 'include_kiosk'
  ) {
    return value;
  }
  return null;
}

function parseAcceptance(value: unknown): BriefAcceptance {
  if (value === 'slot_shows_booked' || value === 'robot_said_done' || value === 'click_count') {
    return value;
  }
  return null;
}

function parseSlot(value: unknown): AppointmentSlot | null {
  if (value === 'sunday' || value === 'monday' || value === 'tuesday') return value;
  return null;
}

function parseBoard(value: unknown): BoardKind {
  if (value === 'slim' || value === 'bloated' || value === 'none') return value;
  return 'none';
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'product' || value === 'appointments') return value;
  return null;
}

export function extrasFromBrief(quest: Pick<
  WorkshopQuest,
  | 'extraPay'
  | 'extraChat'
  | 'extraLive'
  | 'extraKiosk'
  | 'screens'
  | 'constraints'
  | 'exclusions'
>): boolean {
  return (
    quest.extraPay ||
    quest.extraChat ||
    quest.extraLive ||
    quest.extraKiosk ||
    quest.screens === 'kiosk_api' ||
    quest.constraints === 'live_hours' ||
    quest.exclusions === 'include_pay' ||
    quest.exclusions === 'include_chat' ||
    quest.exclusions === 'include_live' ||
    quest.exclusions === 'include_kiosk'
  );
}

export function parseWorkshopQuest(value: unknown): WorkshopQuest {
  const fallback = createWorkshopQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as WorkshopQuest['phase'])
      : fallback.phase;
  const screens = parseScreens(raw.screens);
  const constraints = parseConstraints(raw.constraints);
  const exclusions = parseExclusions(raw.exclusions);
  const extras = {
    extraPay: onFlag(raw, 'extraPay'),
    extraChat: onFlag(raw, 'extraChat'),
    extraLive: onFlag(raw, 'extraLive'),
    extraKiosk: onFlag(raw, 'extraKiosk'),
    screens,
    constraints,
    exclusions,
  };
  return {
    phase,
    briefed: onFlag(raw, 'briefed'),
    inspectedNeed: onFlag(raw, 'inspectedNeed'),
    inspectedExtras: onFlag(raw, 'inspectedExtras'),
    screens,
    constraints,
    exclusions,
    acceptance: parseAcceptance(raw.acceptance),
    extraPay: extras.extraPay,
    extraChat: extras.extraChat,
    extraLive: extras.extraLive,
    extraKiosk: extras.extraKiosk,
    extrasInBrief: extrasFromBrief(extras),
    handedOff: onFlag(raw, 'handedOff'),
    builtWithoutBrief: onFlag(raw, 'builtWithoutBrief'),
    boardKind: parseBoard(raw.boardKind),
    inspectedResult: onFlag(raw, 'inspectedResult'),
    resultScreensOk: onFlag(raw, 'resultScreensOk'),
    resultConstraintsOk: onFlag(raw, 'resultConstraintsOk'),
    resultExclusionsOk: onFlag(raw, 'resultExclusionsOk'),
    resultAcceptanceOk: onFlag(raw, 'resultAcceptanceOk'),
    bookedSlot: parseSlot(raw.bookedSlot),
    extraControlUsed: onFlag(raw, 'extraControlUsed'),
    robotSaidDone: onFlag(raw, 'robotSaidDone'),
    servicePosted: onFlag(raw, 'servicePosted'),
    pendingExplain: parsePending(raw.pendingExplain),
  };
}

export function isWorkshopOpen(state: GameState): boolean {
  return state.festivalQuest.workshopMaterials;
}

export function fourPartsComplete(quest: WorkshopQuest): boolean {
  return (
    quest.screens === 'board_and_confirm' &&
    quest.constraints === 'paper_one_no_pay_chat' &&
    quest.exclusions === 'no_extras' &&
    quest.acceptance === 'slot_shows_booked'
  );
}

export function missingBriefMessage(quest: WorkshopQuest): string | null {
  if (quest.screens !== 'board_and_confirm') return WORKSHOP_FEEDBACK.needScreens;
  if (quest.constraints !== 'paper_one_no_pay_chat') return WORKSHOP_FEEDBACK.needConstraints;
  if (quest.exclusions !== 'no_extras') return WORKSHOP_FEEDBACK.needExclusions;
  if (quest.acceptance !== 'slot_shows_booked') return WORKSHOP_FEEDBACK.needAcceptance;
  return null;
}

export function resultMatched(quest: WorkshopQuest): boolean {
  return (
    quest.resultScreensOk &&
    quest.resultConstraintsOk &&
    quest.resultExclusionsOk &&
    quest.resultAcceptanceOk
  );
}

export function canAward42(quest: WorkshopQuest): boolean {
  return (
    quest.inspectedNeed &&
    fourPartsComplete(quest) &&
    quest.handedOff &&
    resultMatched(quest) &&
    quest.boardKind === 'slim'
  );
}

export function canAward41(quest: WorkshopQuest): boolean {
  return (
    quest.inspectedNeed &&
    !quest.extrasInBrief &&
    quest.exclusions === 'no_extras' &&
    quest.boardKind === 'slim' &&
    quest.bookedSlot !== null &&
    !quest.extraControlUsed
  );
}

function syncPhase(quest: WorkshopQuest): WorkshopQuest {
  let phase: WorkshopQuest['phase'] = 'unstarted';
  if (quest.servicePosted) phase = 'posted';
  else if (
    quest.inspectedNeed ||
    quest.handedOff ||
    quest.boardKind !== 'none' ||
    quest.bookedSlot !== null
  ) {
    phase = 'working';
  } else if (quest.briefed) phase = 'briefed';
  return { ...quest, phase };
}

export function workshopObjective(state: GameState): string {
  const quest = state.workshopQuest;
  if (state.labQuest.labReady) return OBJECTIVES.labReady;
  if (state.kioskQuest.kioskReady) return OBJECTIVES.labWork;
  if (quest.servicePosted) return OBJECTIVES.kioskWork;
  if (state.map === 'workshop' || quest.briefed || state.festivalQuest.workshopMaterials) {
    return OBJECTIVES.workshopWork;
  }
  return state.storyObjective;
}

export function awardWorkshopEvidence(state: GameState): GameState {
  const quest = syncPhase(state.workshopQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward41(quest)) evidence['4.1'] = 'demonstrated';
  if (canAward42(quest)) evidence['4.2'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (evidence['4.1'] === 'demonstrated' && evidence['4.2'] === 'demonstrated' && !quest.servicePosted) {
    nextQuest = { ...quest, servicePosted: true };
    events = recordEvent(events, 'service_posted');
  }
  nextQuest = syncPhase(nextQuest);
  const kioskQuest =
    nextQuest.servicePosted && state.kioskQuest.phase === 'unstarted' && !state.kioskQuest.faceHasKey
      ? { ...state.kioskQuest, faceHasKey: true }
      : state.kioskQuest;
  const next: GameState = {
    ...state,
    evidence,
    workshopQuest: nextQuest,
    kioskQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: workshopObjective(next),
  };
}

export function managerNode(state: GameState): DialogueNodeId {
  const quest = state.workshopQuest;
  if (state.labQuest.labReady) return 'manager_lab_thanks';
  if (state.kioskQuest.kioskReady) return 'manager_kiosk_thanks';
  if (quest.servicePosted) return 'manager_thanks';
  if (quest.briefed) return 'manager_revisit';
  return 'manager_hello';
}

export function finishManagerBrief(state: GameState): GameState {
  const quest = syncPhase({ ...state.workshopQuest, briefed: true });
  const next = { ...state, workshopQuest: quest, manager: 'greeted' as const };
  return {
    ...next,
    mode: 'playing',
    dialogueNode: null,
    storyObjective: workshopObjective(next),
  };
}

export function closeWorkshopDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node) return null;
  if (node === 'manager_hello' || node === 'manager_brief') {
    return finishManagerBrief(state);
  }
  if (
    node.startsWith('manager') ||
    node === 'companion_after_workshop' ||
    node === 'companion_after_kiosk' ||
    node === 'companion_after_lab'
  ) {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      manager: node.startsWith('manager') ? 'greeted' : state.manager,
    };
  }
  return null;
}

export function isWorkshopOverlay(mode: GameState['mode']): boolean {
  return mode === 'brief' || mode === 'board';
}

export function isWorkshopInspect(target: GameState['inspectTarget']): boolean {
  return (
    target === 'workshop_need' ||
    target === 'workshop_extras' ||
    target === 'workshop_builder' ||
    target === 'workshop_result'
  );
}

export function isWorkshopExplain(topic: ExplainTopic | null): boolean {
  return topic === 'product' || topic === 'appointments';
}

export function closeWorkshopOverlay(state: GameState): GameState {
  const pending = state.workshopQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      workshopQuest: { ...state.workshopQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: workshopObjective(state),
  };
}

export function skipWorkshopExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: workshopObjective(state),
  };
}

function withQuest(state: GameState, quest: WorkshopQuest, extra: Partial<GameState> = {}): GameState {
  return awardWorkshopEvidence({ ...state, workshopQuest: syncPhase(quest), ...extra });
}

function clearBuild(quest: WorkshopQuest): WorkshopQuest {
  return {
    ...quest,
    handedOff: false,
    boardKind: 'none',
    bookedSlot: null,
    extraControlUsed: false,
    resultScreensOk: false,
    resultConstraintsOk: false,
    resultExclusionsOk: false,
    resultAcceptanceOk: false,
  };
}

type WorkshopInspect = 'workshop_need' | 'workshop_extras' | 'workshop_builder' | 'workshop_result';

export function inspectWorkshop(state: GameState, target: WorkshopInspect): GameState {
  const quest = { ...state.workshopQuest };
  if (target === 'workshop_need') quest.inspectedNeed = true;
  if (target === 'workshop_extras') quest.inspectedExtras = true;
  if (target === 'workshop_result') quest.inspectedResult = true;
  return withQuest(
    { ...state, mode: 'inspect', inspectTarget: target, shopFeedback: null },
    quest,
  );
}

export function openBrief(state: GameState): GameState {
  return withQuest({ ...state, mode: 'brief', shopFeedback: null }, state.workshopQuest);
}

export function openBoard(state: GameState): GameState {
  return withQuest({ ...state, mode: 'board', shopFeedback: null }, state.workshopQuest);
}

export function reduceBriefSet(state: GameState, field: BriefField, value: string): GameState {
  if (state.mode !== 'brief') return state;
  const quest: WorkshopQuest = clearBuild({ ...state.workshopQuest });
  if (field === 'screens') quest.screens = parseScreens(value);
  if (field === 'constraints') quest.constraints = parseConstraints(value);
  if (field === 'exclusions') quest.exclusions = parseExclusions(value);
  if (field === 'acceptance') quest.acceptance = parseAcceptance(value);
  if (field === 'extra') {
    if (value === 'pay') quest.extraPay = !quest.extraPay;
    if (value === 'chat') quest.extraChat = !quest.extraChat;
    if (value === 'live') quest.extraLive = !quest.extraLive;
    if (value === 'kiosk') quest.extraKiosk = !quest.extraKiosk;
    if (value === 'none') {
      quest.extraPay = false;
      quest.extraChat = false;
      quest.extraLive = false;
      quest.extraKiosk = false;
    }
  }
  quest.extrasInBrief = extrasFromBrief(quest);
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceBuilderHand(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'workshop_builder') return state;
  if (!state.workshopQuest.inspectedNeed) {
    return withQuest(state, { ...state.workshopQuest, handedOff: false }, {
      shopFeedback: WORKSHOP_FEEDBACK.needInspect,
    });
  }
  const missing = missingBriefMessage(state.workshopQuest);
  if (missing) {
    return withQuest(state, { ...state.workshopQuest, handedOff: false }, { shopFeedback: missing });
  }
  const quest: WorkshopQuest = {
    ...state.workshopQuest,
    extrasInBrief: extrasFromBrief(state.workshopQuest),
    handedOff: true,
  };
  return withQuest(state, quest, { shopFeedback: WORKSHOP_FEEDBACK.handoffOk });
}

export function reduceBuilderBuild(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'workshop_builder') return state;
  if (!state.workshopQuest.handedOff) {
    return withQuest(
      state,
      {
        ...state.workshopQuest,
        builtWithoutBrief: true,
        boardKind: 'none',
        bookedSlot: null,
      },
      { shopFeedback: WORKSHOP_FEEDBACK.buildWithoutBrief },
    );
  }
  const extras = extrasFromBrief(state.workshopQuest);
  const bloated = extras || !fourPartsComplete(state.workshopQuest);
  const quest: WorkshopQuest = {
    ...state.workshopQuest,
    extrasInBrief: extras,
    boardKind: bloated ? 'bloated' : 'slim',
    bookedSlot: null,
    extraControlUsed: false,
    resultScreensOk: false,
    resultConstraintsOk: false,
    resultExclusionsOk: false,
    resultAcceptanceOk: false,
    pendingExplain: bloated ? null : state.workshopQuest.pendingExplain,
  };
  return withQuest(state, quest, {
    shopFeedback: bloated ? WORKSHOP_FEEDBACK.builtBloated : WORKSHOP_FEEDBACK.builtSlim,
  });
}

export function reduceBuilderDone(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'workshop_builder') return state;
  return withQuest(state, { ...state.workshopQuest, robotSaidDone: true }, {
    shopFeedback: WORKSHOP_FEEDBACK.robotDone,
  });
}

function partMatchesSlim(quest: WorkshopQuest, part: ResultPart): boolean {
  if (quest.boardKind !== 'slim') return false;
  if (part === 'screens') return quest.screens === 'board_and_confirm';
  if (part === 'constraints') return quest.constraints === 'paper_one_no_pay_chat';
  if (part === 'exclusions') return quest.exclusions === 'no_extras' && !quest.extrasInBrief;
  return quest.acceptance === 'slot_shows_booked';
}

export function reduceResultMatch(state: GameState, part: ResultPart): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'workshop_result') return state;
  if (!state.workshopQuest.inspectedNeed) {
    return withQuest(state, { ...state.workshopQuest, inspectedResult: true }, {
      shopFeedback: WORKSHOP_FEEDBACK.needInspect,
    });
  }
  const missing = missingBriefMessage(state.workshopQuest);
  if (missing) {
    return withQuest(state, { ...state.workshopQuest, inspectedResult: true }, { shopFeedback: missing });
  }
  if (!state.workshopQuest.handedOff || state.workshopQuest.boardKind === 'none') {
    return withQuest(state, { ...state.workshopQuest, inspectedResult: true }, {
      shopFeedback: WORKSHOP_FEEDBACK.resultNeedBoard,
    });
  }
  if (!partMatchesSlim(state.workshopQuest, part)) {
    return withQuest(state, { ...state.workshopQuest, inspectedResult: true }, {
      shopFeedback:
        state.workshopQuest.boardKind === 'bloated'
          ? WORKSHOP_FEEDBACK.extrasInBrief
          : WORKSHOP_FEEDBACK.resultMismatch,
    });
  }
  const quest: WorkshopQuest = { ...state.workshopQuest, inspectedResult: true };
  if (part === 'screens') quest.resultScreensOk = true;
  if (part === 'constraints') quest.resultConstraintsOk = true;
  if (part === 'exclusions') quest.resultExclusionsOk = true;
  if (part === 'acceptance') quest.resultAcceptanceOk = true;
  if (
    quest.resultScreensOk &&
    quest.resultConstraintsOk &&
    quest.resultExclusionsOk &&
    quest.resultAcceptanceOk
  ) {
    quest.pendingExplain = 'product';
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceBoardBook(state: GameState, slot: AppointmentSlot): GameState {
  if (state.mode !== 'board') return state;
  if (!state.workshopQuest.inspectedNeed) {
    return withQuest(state, state.workshopQuest, { shopFeedback: WORKSHOP_FEEDBACK.needInspect });
  }
  if (state.workshopQuest.boardKind === 'none') {
    return withQuest(state, state.workshopQuest, { shopFeedback: WORKSHOP_FEEDBACK.resultNeedBoard });
  }
  if (state.workshopQuest.boardKind !== 'slim' || extrasFromBrief(state.workshopQuest)) {
    return withQuest(
      state,
      { ...state.workshopQuest, extrasInBrief: true },
      { shopFeedback: WORKSHOP_FEEDBACK.extrasInBrief },
    );
  }
  const quest: WorkshopQuest = {
    ...state.workshopQuest,
    bookedSlot: slot,
    extrasInBrief: false,
    pendingExplain: 'appointments',
  };
  return withQuest(state, quest, { shopFeedback: WORKSHOP_FEEDBACK.booked });
}

export function reduceBoardExtra(state: GameState, control: ExtraControl): GameState {
  if (state.mode !== 'board') return state;
  if (control !== 'pay' && control !== 'chat' && control !== 'live' && control !== 'kiosk') {
    return state;
  }
  return withQuest(
    state,
    { ...state.workshopQuest, extraControlUsed: true },
    { shopFeedback: WORKSHOP_FEEDBACK.extraControl },
  );
}

export function slotBookedLabel(quest: WorkshopQuest, slot: AppointmentSlot): string {
  if (quest.bookedSlot === slot) return 'محجوز';
  return SLOT_LABELS[slot];
}
