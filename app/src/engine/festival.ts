import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  CupsMark,
  DialogueNodeId,
  EvidenceMap,
  ExplainTopic,
  FestivalQuest,
  FlagsMark,
  ClothMark,
  GameState,
  JournalEvent,
  StockLineId,
  SubmitFigures,
  SubmitSender,
  WaterMark,
} from './types';
import { FESTIVAL_PHASES } from './types';

export const TABLE_FLAGS = 12;
export const TABLE_CLOTH = 8;
export const TABLE_CUPS = 6;
export const TABLE_WATER = 15;
export const RECEIPT_FLAGS = 12;
export const RECEIPT_CLOTH = 8;
export const RECEIPT_WATER = 20;
export const ROBOT_CUPS = 6;
export const ROBOT_CUPS_GUESS = 10;
export const SUPPORTED_TOTAL = 40;
export const ROBOT_TOTAL = 46;

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function arNum(n: number): string {
  return String(n).replace(/\d/g, (digit) => AR_DIGITS[Number(digit)] ?? digit);
}

export const DISCLOSURE_STAMP = 'صيغ بمساعدة الروبوت';

export const TABLE_TEXT = [
  'جدول مخزون المهرجان',
  `أعلام الحي: ${arNum(TABLE_FLAGS)}`,
  `أقمشة المقاعد: ${arNum(TABLE_CLOTH)}`,
  `فناجين الشاي: ${arNum(TABLE_CUPS)}`,
  `صناديق الماء: ${arNum(TABLE_WATER)}`,
].join('\n');

export const RECEIPTS_TEXT = [
  'إيصالات التوريد',
  `إيصال أعلام الحي: ${arNum(RECEIPT_FLAGS)}`,
  `إيصال أقمشة المقاعد: ${arNum(RECEIPT_CLOTH)}`,
  `إيصال صناديق الماء: ${arNum(RECEIPT_WATER)}`,
  'لا إيصال لفناجين الشاي.',
].join('\n');

export const POLICY_TEXT = [
  'سياسة العمل والدراسة — مكتب المهرجان',
  'يجوز للروبوت أن يساعد في صياغة البيان.',
  `إذا ساعد في الصياغة يجب أن يحمل الورق ختم «${DISCLOSURE_STAMP}».`,
  'أرقام الإنسان تبقى، بما فيها القيم غير المعروفة.',
  'لا تُدرج قيمة بلا إيصال.',
].join('\n');

export const ROBOT_COVER_TEXT = [
  'بيان المخزون المصحح — غلاف الروبوت',
  `المجموع: ${arNum(ROBOT_TOTAL)}`,
  `فناجين الشاي: ${arNum(ROBOT_CUPS)}`,
  'إلى ورشة الإصلاح لصرف مواد المعاينة.',
  'توقيع موظفة المكتب بواسطة الروبوت.',
].join('\n');

export const HUMAN_STATEMENT = [
  'بيان المخزون المصحح',
  `المجموع المؤيَّد: ${arNum(SUPPORTED_TOTAL)}`,
  'فناجين الشاي: غير معروف — لا إيصال',
  'إلى ورشة الإصلاح لصرف مواد المعاينة.',
].join('\n');

export const FESTIVAL_EXPLAIN = {
  reconcile:
    'لا تخترع رقماً بلا إيصال. الأعلام والأقمشة مطابقة، الماء من الإيصال عشرون، والفناجين غير معروفة. المجموع المؤيَّد أربعون.',
  policy:
    'إذا ساعد الروبوت في الصياغة يظهر الختم. أرقامك تبقى، بما فيها غير المعروف، وأنت من يرسل لا الموظفة.',
} as const;

export const FESTIVAL_FEEDBACK = {
  inspectOnly: 'قراءة الجدول والإيصالات لا تكفي. طابق على ورقة المطابقة.',
  needInspect: 'اقرأ الجدول والإيصالات أولاً.',
  needFlags: 'علّم الأعلام مطابقة للإيصال.',
  needCloth: 'علّم الأقمشة مطابقة للإيصال.',
  tableWater: 'ماء الجدول خمسة عشر. خذ العشرين من الإيصال.',
  cupsTable: 'فناجين الجدول ستة ليست إيصالاً. اتركها غير معروفة.',
  cupsInvent: 'لا تخمّن الفناجين عشرة. لا إيصال.',
  robotTotal: 'مجموع الروبوت ستة وأربعون يضيف فناجين الجدول. لا تجمع غير المؤيَّد.',
  sumOk: 'المجموع المؤيَّد أربعون من الإيصالات الثلاثة.',
  needPolicy: 'اقرأ سياسة العمل والدراسة قبل الإرسال.',
  needStamp: 'الغلاف صيغ بمساعدة الروبوت. ضع ختم صيغ بمساعدة الروبوت.',
  robotFigures: 'أرقام الروبوت ستة وأربعون وفناجين ستة. أبقِ أرقامك: أربعون وغير معروف.',
  officerSign: 'الروبوت لا يوقّع باسم موظفة المكتب. أرسل أنت.',
  needHuman: 'أبقِ المجموع أربعين والفناجين غير معروفة.',
  submitOk: 'البيان يحمل أرقامك والختم، وأُرسل بتوقيعك.',
} as const;

const PHASES = new Set<string>(FESTIVAL_PHASES);

export function createFestivalQuest(): FestivalQuest {
  return {
    phase: 'unstarted',
    briefed: false,
    inspectedTable: false,
    inspectedReceipts: false,
    inspectedPolicy: false,
    inspectedCover: false,
    flagsMark: null,
    clothMark: null,
    waterMark: null,
    cupsMark: null,
    summedSupported: false,
    supportedTotal: null,
    usedTableWater: false,
    inventedCups: false,
    usedRobotTotal: false,
    reconciled: false,
    figuresChoice: 'robot',
    stamped: false,
    sender: null,
    submitted: false,
    submittedWithoutStamp: false,
    submittedRobotFigures: false,
    workshopMaterials: false,
    workshopDoorOpen: false,
    pendingExplain: null,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parseFlags(value: unknown): FlagsMark {
  return value === 'match' ? 'match' : null;
}

function parseCloth(value: unknown): ClothMark {
  return value === 'match' ? 'match' : null;
}

function parseWater(value: unknown): WaterMark {
  if (value === 'receipt' || value === 'table') return value;
  return null;
}

function parseCups(value: unknown): CupsMark {
  if (value === 'unknown' || value === 'table' || value === 'invent') return value;
  return null;
}

function parseFigures(value: unknown): SubmitFigures {
  if (value === 'human' || value === 'robot') return value;
  return null;
}

function parseSender(value: unknown): SubmitSender | null {
  if (value === 'player' || value === 'officer_robot') return value;
  return null;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'reconcile' || value === 'policy') return value;
  return null;
}

function parseTotal(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parseFestivalQuest(value: unknown): FestivalQuest {
  const fallback = createFestivalQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as FestivalQuest['phase'])
      : fallback.phase;
  return {
    phase,
    briefed: onFlag(raw, 'briefed'),
    inspectedTable: onFlag(raw, 'inspectedTable'),
    inspectedReceipts: onFlag(raw, 'inspectedReceipts'),
    inspectedPolicy: onFlag(raw, 'inspectedPolicy'),
    inspectedCover: onFlag(raw, 'inspectedCover'),
    flagsMark: parseFlags(raw.flagsMark),
    clothMark: parseCloth(raw.clothMark),
    waterMark: parseWater(raw.waterMark),
    cupsMark: parseCups(raw.cupsMark),
    summedSupported: onFlag(raw, 'summedSupported'),
    supportedTotal: parseTotal(raw.supportedTotal),
    usedTableWater: onFlag(raw, 'usedTableWater'),
    inventedCups: onFlag(raw, 'inventedCups'),
    usedRobotTotal: onFlag(raw, 'usedRobotTotal'),
    reconciled: onFlag(raw, 'reconciled'),
    figuresChoice: parseFigures(raw.figuresChoice) ?? fallback.figuresChoice,
    stamped: onFlag(raw, 'stamped'),
    sender: parseSender(raw.sender),
    submitted: onFlag(raw, 'submitted'),
    submittedWithoutStamp: onFlag(raw, 'submittedWithoutStamp'),
    submittedRobotFigures: onFlag(raw, 'submittedRobotFigures'),
    workshopMaterials: onFlag(raw, 'workshopMaterials'),
    workshopDoorOpen: onFlag(raw, 'workshopDoorOpen'),
    pendingExplain: parsePending(raw.pendingExplain),
  };
}

export function isFestivalOpen(state: GameState): boolean {
  return state.newsroomQuest.workshopLead;
}

export function canAward34(quest: FestivalQuest): boolean {
  return (
    quest.inspectedTable &&
    quest.inspectedReceipts &&
    quest.flagsMark === 'match' &&
    quest.clothMark === 'match' &&
    quest.waterMark === 'receipt' &&
    quest.cupsMark === 'unknown' &&
    quest.summedSupported &&
    quest.supportedTotal === SUPPORTED_TOTAL &&
    quest.reconciled
  );
}

export function canAward35(quest: FestivalQuest): boolean {
  return (
    canAward34(quest) &&
    quest.inspectedPolicy &&
    quest.figuresChoice === 'human' &&
    quest.stamped &&
    quest.submitted &&
    quest.sender === 'player'
  );
}

function syncPhase(quest: FestivalQuest): FestivalQuest {
  let phase: FestivalQuest['phase'] = 'unstarted';
  if (quest.workshopMaterials) phase = 'supplied';
  else if (
    quest.reconciled ||
    quest.submitted ||
    quest.inspectedTable ||
    quest.inspectedReceipts ||
    quest.inspectedPolicy
  ) {
    phase = 'working';
  } else if (quest.briefed) phase = 'briefed';
  return { ...quest, phase };
}

export function festivalObjective(state: GameState): string {
  const quest = state.festivalQuest;
  if (quest.workshopMaterials) return OBJECTIVES.workshopMaterials;
  if (state.map === 'festival' || quest.briefed) return OBJECTIVES.festivalWork;
  if (state.newsroomQuest.workshopLead) return OBJECTIVES.workshopLead;
  return state.storyObjective;
}

export function awardFestivalEvidence(state: GameState): GameState {
  const quest = syncPhase(state.festivalQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward34(quest)) evidence['3.4'] = 'demonstrated';
  if (canAward35(quest)) evidence['3.5'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  if (canAward34(quest)) events = recordEvent(events, 'stock_reconciled');
  if (canAward35(quest)) events = recordEvent(events, 'statement_submitted');
  let nextQuest = quest;
  if (evidence['3.4'] === 'demonstrated' && evidence['3.5'] === 'demonstrated') {
    nextQuest = { ...quest, workshopMaterials: true, workshopDoorOpen: true };
    events = recordEvent(events, 'workshop_materials');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    festivalQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: festivalObjective(next),
  };
}

export function officerNode(state: GameState): DialogueNodeId {
  const quest = state.festivalQuest;
  if (quest.workshopMaterials) return 'officer_thanks';
  if (quest.briefed) return 'officer_revisit';
  return 'officer_hello';
}

export function finishOfficerBrief(state: GameState): GameState {
  const quest = syncPhase({ ...state.festivalQuest, briefed: true });
  const next = { ...state, festivalQuest: quest, officer: 'greeted' as const };
  return {
    ...next,
    mode: 'playing',
    dialogueNode: null,
    storyObjective: festivalObjective(next),
  };
}

export function closeFestivalDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node) return null;
  if (node === 'officer_hello' || node === 'officer_brief') {
    return finishOfficerBrief(state);
  }
  if (
    node.startsWith('officer') ||
    node === 'companion_after_festival' ||
    node === 'locked_festival' ||
    node === 'locked_workshop' ||
    node === 'workshop_door_open'
  ) {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      officer: node.startsWith('officer') ? 'greeted' : state.officer,
    };
  }
  return null;
}

export function isFestivalOverlay(mode: GameState['mode']): boolean {
  return mode === 'reconcile' || mode === 'submit';
}

export function isFestivalExplain(topic: ExplainTopic | null): boolean {
  return topic === 'reconcile' || topic === 'policy';
}

export function closeFestivalOverlay(state: GameState): GameState {
  const pending = state.festivalQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      festivalQuest: { ...state.festivalQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: festivalObjective(state),
  };
}

export function skipFestivalExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: festivalObjective(state),
  };
}

function withQuest(state: GameState, quest: FestivalQuest, extra: Partial<GameState> = {}): GameState {
  return awardFestivalEvidence({ ...state, festivalQuest: syncPhase(quest), ...extra });
}

type InspectTargetFest = 'festival_table' | 'festival_receipts' | 'festival_policy' | 'festival_cover';

export function inspectFestival(state: GameState, target: InspectTargetFest): GameState {
  const quest = { ...state.festivalQuest };
  if (target === 'festival_table') quest.inspectedTable = true;
  if (target === 'festival_receipts') quest.inspectedReceipts = true;
  if (target === 'festival_policy') quest.inspectedPolicy = true;
  if (target === 'festival_cover') quest.inspectedCover = true;
  return withQuest(
    { ...state, mode: 'inspect', inspectTarget: target, shopFeedback: null },
    quest,
  );
}

export function openReconcile(state: GameState): GameState {
  return withQuest({ ...state, mode: 'reconcile', shopFeedback: null }, state.festivalQuest);
}

export function openSubmit(state: GameState): GameState {
  const quest = { ...state.festivalQuest, inspectedCover: true };
  return withQuest({ ...state, mode: 'submit', shopFeedback: null }, quest);
}

export function workshopDoorNode(state: GameState): DialogueNodeId {
  return state.festivalQuest.workshopDoorOpen ? 'workshop_door_open' : 'locked_workshop';
}

function parseLineMark(line: StockLineId, mark: string): string | null {
  if (line === 'flags' || line === 'cloth') {
    return mark === 'match' ? 'match' : null;
  }
  if (line === 'water') {
    if (mark === 'receipt' || mark === 'table') return mark;
    return null;
  }
  if (mark === 'unknown' || mark === 'table' || mark === 'invent') return mark;
  return null;
}

export function reduceReconcileMark(state: GameState, line: StockLineId, mark: string): GameState {
  if (state.mode !== 'reconcile') return state;
  const parsed = parseLineMark(line, mark);
  if (!parsed) return state;
  const quest: FestivalQuest = {
    ...state.festivalQuest,
    summedSupported: false,
    reconciled: false,
  };
  if (line === 'flags') quest.flagsMark = parsed as FlagsMark;
  if (line === 'cloth') quest.clothMark = parsed as ClothMark;
  if (line === 'water') {
    quest.waterMark = parsed as WaterMark;
    if (parsed === 'table') quest.usedTableWater = true;
  }
  if (line === 'cups') {
    quest.cupsMark = parsed as CupsMark;
    if (parsed === 'invent' || parsed === 'table') quest.inventedCups = true;
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceReconcileRobot(state: GameState): GameState {
  if (state.mode !== 'reconcile') return state;
  const quest: FestivalQuest = {
    ...state.festivalQuest,
    cupsMark: 'table',
    waterMark: state.festivalQuest.waterMark === 'receipt' ? 'receipt' : state.festivalQuest.waterMark,
    usedRobotTotal: true,
    inventedCups: true,
    summedSupported: false,
    supportedTotal: ROBOT_TOTAL,
    reconciled: false,
  };
  return withQuest(state, quest, { shopFeedback: FESTIVAL_FEEDBACK.robotTotal });
}

export function reduceReconcileSum(state: GameState): GameState {
  if (state.mode !== 'reconcile') return state;
  if (!state.festivalQuest.inspectedTable || !state.festivalQuest.inspectedReceipts) {
    return withQuest(state, { ...state.festivalQuest, reconciled: false, summedSupported: false }, {
      shopFeedback: FESTIVAL_FEEDBACK.inspectOnly,
    });
  }
  if (state.festivalQuest.flagsMark !== 'match') {
    return withQuest(state, { ...state.festivalQuest, reconciled: false, summedSupported: false }, {
      shopFeedback: FESTIVAL_FEEDBACK.needFlags,
    });
  }
  if (state.festivalQuest.clothMark !== 'match') {
    return withQuest(state, { ...state.festivalQuest, reconciled: false, summedSupported: false }, {
      shopFeedback: FESTIVAL_FEEDBACK.needCloth,
    });
  }
  if (state.festivalQuest.waterMark === 'table') {
    return withQuest(
      state,
      {
        ...state.festivalQuest,
        usedTableWater: true,
        reconciled: false,
        summedSupported: false,
        supportedTotal: RECEIPT_FLAGS + RECEIPT_CLOTH + TABLE_WATER,
      },
      { shopFeedback: FESTIVAL_FEEDBACK.tableWater },
    );
  }
  if (state.festivalQuest.waterMark !== 'receipt') {
    return withQuest(state, { ...state.festivalQuest, reconciled: false, summedSupported: false }, {
      shopFeedback: FESTIVAL_FEEDBACK.tableWater,
    });
  }
  if (state.festivalQuest.cupsMark === 'table') {
    return withQuest(
      state,
      {
        ...state.festivalQuest,
        inventedCups: true,
        reconciled: false,
        summedSupported: false,
        supportedTotal: ROBOT_TOTAL,
      },
      { shopFeedback: FESTIVAL_FEEDBACK.cupsTable },
    );
  }
  if (state.festivalQuest.cupsMark === 'invent') {
    return withQuest(
      state,
      {
        ...state.festivalQuest,
        inventedCups: true,
        reconciled: false,
        summedSupported: false,
        supportedTotal: RECEIPT_FLAGS + RECEIPT_CLOTH + RECEIPT_WATER + ROBOT_CUPS_GUESS,
      },
      { shopFeedback: FESTIVAL_FEEDBACK.cupsInvent },
    );
  }
  if (state.festivalQuest.cupsMark !== 'unknown') {
    return withQuest(state, { ...state.festivalQuest, reconciled: false, summedSupported: false }, {
      shopFeedback: FESTIVAL_FEEDBACK.cupsInvent,
    });
  }
  const quest: FestivalQuest = {
    ...state.festivalQuest,
    summedSupported: true,
    supportedTotal: SUPPORTED_TOTAL,
    reconciled: true,
    pendingExplain: 'reconcile',
  };
  return withQuest(state, quest, {
    shopFeedback: FESTIVAL_FEEDBACK.sumOk,
    robotUnderstood: `المجموع المؤيَّد ${arNum(SUPPORTED_TOTAL)} من الإيصالات. الفناجين غير معروفة.`,
  });
}

export function reduceSubmitSet(
  state: GameState,
  field: 'figures' | 'stamp',
  value: string,
): GameState {
  if (state.mode !== 'submit') return state;
  const quest: FestivalQuest = { ...state.festivalQuest, submitted: false };
  if (field === 'figures') quest.figuresChoice = parseFigures(value) ?? quest.figuresChoice;
  if (field === 'stamp') quest.stamped = value === 'on' || value === 'true';
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceSubmitSend(state: GameState, sender: SubmitSender): GameState {
  if (state.mode !== 'submit') return state;
  if (sender === 'officer_robot') {
    const quest: FestivalQuest = {
      ...state.festivalQuest,
      sender: 'officer_robot',
      submitted: false,
    };
    return withQuest(state, quest, { shopFeedback: FESTIVAL_FEEDBACK.officerSign });
  }
  if (!state.festivalQuest.inspectedPolicy) {
    return withQuest(state, { ...state.festivalQuest, submitted: false, sender: 'player' }, {
      shopFeedback: FESTIVAL_FEEDBACK.needPolicy,
    });
  }
  if (!state.festivalQuest.stamped) {
    return withQuest(
      state,
      {
        ...state.festivalQuest,
        sender: 'player',
        submitted: false,
        submittedWithoutStamp: true,
      },
      { shopFeedback: FESTIVAL_FEEDBACK.needStamp },
    );
  }
  if (state.festivalQuest.figuresChoice !== 'human') {
    return withQuest(
      state,
      {
        ...state.festivalQuest,
        sender: 'player',
        submitted: false,
        submittedRobotFigures: true,
      },
      { shopFeedback: FESTIVAL_FEEDBACK.robotFigures },
    );
  }
  if (!canAward34(state.festivalQuest)) {
    return withQuest(state, { ...state.festivalQuest, submitted: false, sender: 'player' }, {
      shopFeedback: FESTIVAL_FEEDBACK.needHuman,
    });
  }
  const quest: FestivalQuest = {
    ...state.festivalQuest,
    sender: 'player',
    submitted: true,
    pendingExplain: 'policy',
  };
  return withQuest(state, quest, { shopFeedback: FESTIVAL_FEEDBACK.submitOk });
}
