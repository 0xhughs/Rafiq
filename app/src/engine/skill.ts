import { recordEvent } from './dialogue';
import { labObjective } from './lab';
import { HOUR_SAT, HOUR_SUN, HOUR_WED } from './bridge';
import type {
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  SkillInput,
  SkillOutput,
  SkillQuest,
  SkillSchedule,
  SkillSteps,
  SkillStop,
  SkillTrigger,
} from './types';
import { SKILL_PHASES } from './types';

export const RECORD_SECOND = 'NH-2208';
export const HOUR_FRI = 'fri-14';
export const HOUR_MON = 'mon-11';
export const CLOCK_START = 'الخميس 16:00 بتوقيت الحي';
export const CLOCK_SUN8 = 'الأحد 08:00 بتوقيت الحي';
export const CLOCK_TIME_THU = '16:00';
export const CLOCK_TIME_SUN = '08:00';
export const TRAY_EMPTY = 'الدرج فارغ';
export const BULLETIN_1447 = `نشرة القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}. لا تعليق.`;
export const BULLETIN_2208 = `نشرة القاعة: ${HOUR_FRI}، ${HOUR_MON}. لا تعليق.`;
export const TRAY_SUN = `مسودة الأحد في الدرج: ${BULLETIN_1447}`;
export const ONESHOT_TEXT = 'قاعة الحي مفتوحة من الدقيقة 7 بلا مصدر.';
export const SKILL_NAME = 'تلخيص ساعات القاعة';
export const SKILL_CARD_EMPTY = 'لا مهارة محفوظة';
export const STANDING_LINE = 'العربية المبسطة. لا تخترع أرقاماً.';
export const TRIGGER_HOURS = 'عند ورود سجل ساعات قاعة الحي';
export const TRIGGER_ANYTIME = 'عند الحاجة';
export const TRIGGER_CHAT = 'عند كل رسالة';
export const INPUT_RECORD = 'رقم السجل NH-xxxx';
export const INPUT_SECRET = 'مفتاح الواجهة demo-slot-key';
export const INPUT_ALL = 'كل ملفات الحي';
export const STEPS_LOOKUP = 'ابحث في السجل ثم صغ نشرة بلا تعليق ولا دقيقة مختلقة';
export const STEPS_OPINION = 'اخلط رأي المذيع بالساعات';
export const OUTPUT_DRAFT = 'نشرة ساعات في الدرج بلا إرسال';
export const OUTPUT_SEND = 'أرسل إلى الجيران الآن';
export const STOP_UNKNOWN = 'توقف إن غابت الساعات أو كانت غير محددة';
export const STOP_INVENT = 'أكمل دائماً ولو بالتخمين';
export const TRIGGER_LOG = `الأحد 08:00 — شُغّلت مهارة ${SKILL_NAME}`;
export const RUN_COUNT_LABEL = (count: number) => `تشغيلات الروتين: ${count}`;
export const DEMO_SLOT_KEY = 'demo-slot-key';

export const SKILL_EXPLAIN = {
  oneshot_vs_skill:
    'الأمر الواحد يلخّص مرة وقد يخترع دقيقة. المهارة إجراء محفوظ بخطوات يُعاد على سجل جديد.',
  standing_vs_skill:
    'الدستور الدائم أسلوب عام. المهارة إجراء له محفّز ومدخلات وخطوات وناتج وشرط توقف.',
  routine_clock:
    'الروتين يشغّل المهارة على ساعة الحي عندما يحين الموعد. الإلبات يوقف التشغيل بلا إرسال.',
} as const;

export const SKILL_FEEDBACK = {
  saveBeforeCorrect: 'احفظ المهارة بعد تصحيح الناتج، لا من المسودة الأولى.',
  missingConfig: 'اضبط المحفّز والمدخلات والخطوات والناتج وشرط التوقف أولاً.',
  wrongTrigger: 'حدّد المحفّز: عند ورود سجل ساعات قاعة الحي.',
  wrongInput: 'المدخل: رقم السجل NH-xxxx فقط. لا تضع أسراراً في المهارة.',
  wrongSteps: 'الخطوات بعد التصحيح: ابحث ثم صغ نشرة بلا تعليق.',
  wrongOutput: 'الناتج مسودة في الدرج، لا إرسال.',
  wrongStop: 'شرط التوقف: إن غابت الساعات اكتب غير محدد وأوقف.',
  standing: 'الدستور الدائم ليس مهارة. المهارة إجراء بخطوات.',
  connector: 'الموصل ليس مهارة. المهارة إجراء محفوظ بعد تصحيح.',
  secret: 'لا تضع أسراراً في نص المهارة.',
  trialSame: 'جرّب المهارة على سجل ثانٍ مختلف: NH-2208.',
  robotDone: 'قول «تم» ليس قبولاً. صحّح الإجراء ثم احفظ مهارة وجرّبها على سجل ثانٍ.',
  armBeforeSkill: 'جدول بعد مهارة مُجرَّبة على مدخل ثانٍ.',
  eventSchedule: 'الطلب يبقى تحت يدك. ابدأ بجدول الأحد لا بكل إشعار.',
  sendSchedule: 'الروتين يعدّ المسودة فقط. الإرسال قرار بشري.',
  emptySource: 'المصدر فارغ. احفظ فشلاً وأوقف. لا تختلق صفوفاً.',
  paused: 'الروتين متوقف. لم تُكتب مسودة جديدة.',
  cancelled: 'أُلغي الجدول. المهارة محفوظة بلا تشغيل.',
} as const;

const PHASES = new Set<string>(SKILL_PHASES);

export function createSkillQuest(): SkillQuest {
  return {
    phase: 'unstarted',
    openedBench: false,
    openedClock: false,
    oneshotSeen: false,
    corrected: false,
    trigger: null,
    inputKind: null,
    steps: null,
    outputKind: null,
    stopRule: null,
    standingRefused: false,
    secretRefused: false,
    connectorRefused: false,
    skillSaved: false,
    trialSecond: false,
    inspectedCard: false,
    schedule: null,
    armed: false,
    fired: false,
    inspectedFire: false,
    emptyStopped: false,
    paused: false,
    cancelled: false,
    silentTick: false,
    runCount: 0,
    clockLabel: CLOCK_START,
    trayText: TRAY_EMPTY,
    skillReady: false,
    pendingExplain: null,
    view: 'bench',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'oneshot_vs_skill' || value === 'standing_vs_skill' || value === 'routine_clock') {
    return value;
  }
  return null;
}

function parseView(value: unknown): SkillQuest['view'] {
  if (value === 'clock') return 'clock';
  return 'bench';
}

function parseTrigger(value: unknown): SkillTrigger | null {
  if (value === 'hours_record' || value === 'anytime' || value === 'every_chat') return value;
  return null;
}

function parseInput(value: unknown): SkillInput | null {
  if (value === 'record_id' || value === 'secret' || value === 'all_files') return value;
  return null;
}

function parseSteps(value: unknown): SkillSteps | null {
  if (value === 'lookup_format' || value === 'mix_opinion') return value;
  return null;
}

function parseOutput(value: unknown): SkillOutput | null {
  if (value === 'tray_draft' || value === 'send_now') return value;
  return null;
}

function parseStop(value: unknown): SkillStop | null {
  if (value === 'unknown_stop' || value === 'always_invent') return value;
  return null;
}

function parseSchedule(value: unknown): SkillSchedule | null {
  if (value === 'sun8' || value === 'every_event' || value === 'send_dawn') return value;
  return null;
}

function parseRunCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function parseClock(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : CLOCK_START;
}

function parseTray(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : TRAY_EMPTY;
}

export function parseSkillQuest(value: unknown): SkillQuest {
  const fallback = createSkillQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as SkillQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedBench: onFlag(raw, 'openedBench'),
    openedClock: onFlag(raw, 'openedClock'),
    oneshotSeen: onFlag(raw, 'oneshotSeen'),
    corrected: onFlag(raw, 'corrected'),
    trigger: parseTrigger(raw.trigger),
    inputKind: parseInput(raw.inputKind),
    steps: parseSteps(raw.steps),
    outputKind: parseOutput(raw.outputKind),
    stopRule: parseStop(raw.stopRule),
    standingRefused: onFlag(raw, 'standingRefused'),
    secretRefused: onFlag(raw, 'secretRefused'),
    connectorRefused: onFlag(raw, 'connectorRefused'),
    skillSaved: onFlag(raw, 'skillSaved'),
    trialSecond: onFlag(raw, 'trialSecond'),
    inspectedCard: onFlag(raw, 'inspectedCard'),
    schedule: parseSchedule(raw.schedule),
    armed: onFlag(raw, 'armed'),
    fired: onFlag(raw, 'fired'),
    inspectedFire: onFlag(raw, 'inspectedFire'),
    emptyStopped: onFlag(raw, 'emptyStopped'),
    paused: onFlag(raw, 'paused'),
    cancelled: onFlag(raw, 'cancelled'),
    silentTick: onFlag(raw, 'silentTick'),
    runCount: parseRunCount(raw.runCount),
    clockLabel: parseClock(raw.clockLabel),
    trayText: parseTray(raw.trayText),
    skillReady: onFlag(raw, 'skillReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function fiveFieldsCorrect(quest: SkillQuest): boolean {
  return (
    quest.trigger === 'hours_record' &&
    quest.inputKind === 'record_id' &&
    quest.steps === 'lookup_format' &&
    quest.outputKind === 'tray_draft' &&
    quest.stopRule === 'unknown_stop'
  );
}

export function oneshotText(quest: SkillQuest): string {
  if (quest.corrected) return BULLETIN_1447;
  if (quest.oneshotSeen) return ONESHOT_TEXT;
  return '';
}

export function trialText(quest: SkillQuest): string {
  return quest.trialSecond ? BULLETIN_2208 : '';
}

export function triggerLogText(quest: SkillQuest): string {
  return quest.fired ? TRIGGER_LOG : '';
}

export function canAward55(quest: SkillQuest, bridgeReady: boolean): boolean {
  const oneshot = oneshotText(quest);
  const trial = trialText(quest);
  return (
    bridgeReady &&
    quest.oneshotSeen &&
    quest.corrected &&
    oneshot.includes(HOUR_SAT) &&
    oneshot.includes(HOUR_SUN) &&
    oneshot.includes(HOUR_WED) &&
    quest.standingRefused &&
    fiveFieldsCorrect(quest) &&
    quest.skillSaved &&
    quest.inspectedCard &&
    quest.trialSecond &&
    trial.includes(HOUR_FRI) &&
    trial.includes(HOUR_MON)
  );
}

export function canAward56(quest: SkillQuest, bridgeReady: boolean): boolean {
  return (
    canAward55(quest, bridgeReady) &&
    quest.schedule === 'sun8' &&
    quest.fired &&
    quest.inspectedFire &&
    quest.trayText.includes(HOUR_SAT) &&
    quest.trayText.includes(HOUR_SUN) &&
    quest.trayText.includes(HOUR_WED) &&
    quest.runCount === 1 &&
    quest.paused &&
    quest.silentTick
  );
}

function syncPhase(quest: SkillQuest): SkillQuest {
  let phase: SkillQuest['phase'] = 'unstarted';
  if (quest.skillReady) phase = 'ready';
  else if (
    quest.openedBench ||
    quest.openedClock ||
    quest.oneshotSeen ||
    quest.corrected ||
    quest.skillSaved ||
    quest.armed ||
    quest.fired
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function awardSkillEvidence(state: GameState): GameState {
  const quest = syncPhase(state.skillQuest);
  const ready = state.bridgeQuest.bridgeReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had55 = evidence['5.5'] === 'demonstrated';
  const had56 = evidence['5.6'] === 'demonstrated';
  if (canAward55(quest, ready)) evidence['5.5'] = 'demonstrated';
  if (canAward56(quest, ready)) evidence['5.6'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (evidence['5.5'] === 'demonstrated' && !had55) {
    nextQuest = { ...nextQuest, pendingExplain: 'oneshot_vs_skill' };
  }
  if (evidence['5.6'] === 'demonstrated' && !had56) {
    nextQuest = { ...nextQuest, pendingExplain: 'routine_clock' };
  }
  if (
    evidence['5.5'] === 'demonstrated' &&
    evidence['5.6'] === 'demonstrated' &&
    !nextQuest.skillReady
  ) {
    nextQuest = { ...nextQuest, skillReady: true, pendingExplain: 'routine_clock' };
    events = recordEvent(events, 'skill_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    skillQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: SkillQuest, extra: Partial<GameState> = {}): GameState {
  return awardSkillEvidence({ ...state, skillQuest: syncPhase(quest), ...extra });
}

function requireSkill(state: GameState): boolean {
  return state.bridgeQuest.bridgeReady && state.mode === 'skill';
}

export function openSkillBench(state: GameState): GameState {
  if (!state.bridgeQuest.bridgeReady) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    openedBench: true,
    view: 'bench',
    inspectedCard: state.skillQuest.skillSaved ? true : state.skillQuest.inspectedCard,
  };
  const events = recordEvent(state.journalEvents, 'skill_opened');
  return withQuest({ ...state, mode: 'skill', shopFeedback: null, journalEvents: events }, quest);
}

export function openSkillClock(state: GameState): GameState {
  if (!state.bridgeQuest.bridgeReady) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    openedClock: true,
    view: 'clock',
    inspectedFire: state.skillQuest.fired ? true : state.skillQuest.inspectedFire,
  };
  const events = recordEvent(state.journalEvents, 'skill_opened');
  return withQuest({ ...state, mode: 'skill', shopFeedback: null, journalEvents: events }, quest);
}

export function reduceSkillOneshot(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    oneshotSeen: true,
    view: 'bench',
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceSkillCorrect(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  if (!state.skillQuest.oneshotSeen) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  const quest: SkillQuest = {
    ...state.skillQuest,
    corrected: true,
    view: 'bench',
  };
  const events = recordEvent(state.journalEvents, 'oneshot_corrected');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceSkillSetTrigger(state: GameState, trigger: SkillTrigger): GameState {
  if (!requireSkill(state)) return state;
  if (state.skillQuest.skillSaved) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  return withQuest(state, { ...state.skillQuest, trigger, view: 'bench' }, { shopFeedback: null });
}

export function reduceSkillSetInput(state: GameState, input: SkillInput): GameState {
  if (!requireSkill(state)) return state;
  if (state.skillQuest.skillSaved) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  return withQuest(
    state,
    { ...state.skillQuest, inputKind: input, view: 'bench' },
    { shopFeedback: null },
  );
}

export function reduceSkillSetSteps(state: GameState, steps: SkillSteps): GameState {
  if (!requireSkill(state)) return state;
  if (state.skillQuest.skillSaved) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  return withQuest(state, { ...state.skillQuest, steps, view: 'bench' }, { shopFeedback: null });
}

export function reduceSkillSetOutput(state: GameState, output: SkillOutput): GameState {
  if (!requireSkill(state)) return state;
  if (state.skillQuest.skillSaved) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  return withQuest(
    state,
    { ...state.skillQuest, outputKind: output, view: 'bench' },
    { shopFeedback: null },
  );
}

export function reduceSkillSetStop(state: GameState, stop: SkillStop): GameState {
  if (!requireSkill(state)) return state;
  if (state.skillQuest.skillSaved) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  return withQuest(
    state,
    { ...state.skillQuest, stopRule: stop, view: 'bench' },
    { shopFeedback: null },
  );
}

function saveBlockReason(quest: SkillQuest): string | null {
  if (!quest.corrected) return SKILL_FEEDBACK.saveBeforeCorrect;
  if (
    quest.trigger === null ||
    quest.inputKind === null ||
    quest.steps === null ||
    quest.outputKind === null ||
    quest.stopRule === null
  ) {
    return SKILL_FEEDBACK.missingConfig;
  }
  if (quest.trigger !== 'hours_record') return SKILL_FEEDBACK.wrongTrigger;
  if (quest.inputKind !== 'record_id') return SKILL_FEEDBACK.wrongInput;
  if (quest.steps !== 'lookup_format') return SKILL_FEEDBACK.wrongSteps;
  if (quest.outputKind !== 'tray_draft') return SKILL_FEEDBACK.wrongOutput;
  if (quest.stopRule !== 'unknown_stop') return SKILL_FEEDBACK.wrongStop;
  return null;
}

export function reduceSkillSave(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const blocked = saveBlockReason(state.skillQuest);
  if (blocked) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: blocked });
  }
  const quest: SkillQuest = {
    ...state.skillQuest,
    skillSaved: true,
    inspectedCard: true,
    view: 'bench',
  };
  const events = recordEvent(state.journalEvents, 'skill_saved');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceSkillStanding(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    standingRefused: true,
    view: 'bench',
  };
  return withQuest(state, quest, { shopFeedback: SKILL_FEEDBACK.standing });
}

export function reduceSkillLoadConnector(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    connectorRefused: true,
    view: 'bench',
  };
  return withQuest(state, quest, { shopFeedback: SKILL_FEEDBACK.connector });
}

export function reduceSkillEmbedSecret(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    secretRefused: true,
    view: 'bench',
  };
  return withQuest(state, quest, { shopFeedback: SKILL_FEEDBACK.secret });
}

export function reduceSkillTrialSecond(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  if (!state.skillQuest.skillSaved || !fiveFieldsCorrect(state.skillQuest)) {
    return withQuest(state, { ...state.skillQuest, view: 'bench' }, { shopFeedback: null });
  }
  const quest: SkillQuest = {
    ...state.skillQuest,
    trialSecond: true,
    view: 'bench',
  };
  const events = recordEvent(state.journalEvents, 'second_trial');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceSkillTrialSame(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  return withQuest(state, { ...state.skillQuest, view: 'bench' }, {
    shopFeedback: SKILL_FEEDBACK.trialSame,
  });
}

export function reduceSkillRobotDone(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  return withQuest(state, state.skillQuest, { shopFeedback: SKILL_FEEDBACK.robotDone });
}

export function reduceSkillSetSchedule(state: GameState, schedule: SkillSchedule): GameState {
  if (!requireSkill(state)) return state;
  if (schedule === 'every_event') {
    return withQuest(
      state,
      { ...state.skillQuest, schedule: 'every_event', view: 'clock' },
      { shopFeedback: SKILL_FEEDBACK.eventSchedule },
    );
  }
  if (schedule === 'send_dawn') {
    return withQuest(
      state,
      { ...state.skillQuest, schedule: 'send_dawn', view: 'clock' },
      { shopFeedback: SKILL_FEEDBACK.sendSchedule },
    );
  }
  return withQuest(
    state,
    { ...state.skillQuest, schedule: 'sun8', view: 'clock' },
    { shopFeedback: null },
  );
}

export function reduceSkillArm(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  if (!canAward55(state.skillQuest, state.bridgeQuest.bridgeReady)) {
    return withQuest(state, { ...state.skillQuest, view: 'clock' }, {
      shopFeedback: SKILL_FEEDBACK.armBeforeSkill,
    });
  }
  if (state.skillQuest.schedule === 'every_event') {
    return withQuest(state, { ...state.skillQuest, view: 'clock' }, {
      shopFeedback: SKILL_FEEDBACK.eventSchedule,
    });
  }
  if (state.skillQuest.schedule === 'send_dawn') {
    return withQuest(state, { ...state.skillQuest, view: 'clock' }, {
      shopFeedback: SKILL_FEEDBACK.sendSchedule,
    });
  }
  if (state.skillQuest.schedule !== 'sun8') {
    return withQuest(state, { ...state.skillQuest, view: 'clock' }, {
      shopFeedback: SKILL_FEEDBACK.eventSchedule,
    });
  }
  const quest: SkillQuest = {
    ...state.skillQuest,
    armed: true,
    cancelled: false,
    paused: false,
    silentTick: false,
    view: 'clock',
  };
  const events = recordEvent(state.journalEvents, 'clock_armed');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceSkillTickSun8(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest = state.skillQuest;
  if (quest.paused) {
    return withQuest(
      state,
      { ...quest, silentTick: quest.fired, view: 'clock' },
      { shopFeedback: SKILL_FEEDBACK.paused },
    );
  }
  if (quest.cancelled || !quest.armed || quest.schedule !== 'sun8') {
    return withQuest(state, { ...quest, view: 'clock' }, {
      shopFeedback: quest.cancelled ? SKILL_FEEDBACK.cancelled : null,
    });
  }
  if (quest.fired) {
    return withQuest(
      state,
      { ...quest, inspectedFire: true, view: 'clock' },
      { shopFeedback: null },
    );
  }
  const next: SkillQuest = {
    ...quest,
    fired: true,
    inspectedFire: true,
    silentTick: false,
    clockLabel: CLOCK_SUN8,
    trayText: TRAY_SUN,
    runCount: 1,
    view: 'clock',
  };
  const events = recordEvent(state.journalEvents, 'routine_fired');
  return withQuest({ ...state, journalEvents: events }, next, { shopFeedback: null });
}

export function reduceSkillTickEmpty(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    emptyStopped: true,
    view: 'clock',
  };
  return withQuest(state, quest, { shopFeedback: SKILL_FEEDBACK.emptySource });
}

export function reduceSkillPause(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    paused: true,
    view: 'clock',
  };
  const events = recordEvent(state.journalEvents, 'routine_paused');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceSkillCancel(state: GameState): GameState {
  if (!requireSkill(state)) return state;
  const quest: SkillQuest = {
    ...state.skillQuest,
    armed: false,
    cancelled: true,
    paused: false,
    view: 'clock',
  };
  return withQuest(state, quest, { shopFeedback: SKILL_FEEDBACK.cancelled });
}

export function isSkillOverlay(mode: GameState['mode']): boolean {
  return mode === 'skill';
}

export function isSkillExplain(topic: ExplainTopic | null): boolean {
  return topic === 'oneshot_vs_skill' || topic === 'standing_vs_skill' || topic === 'routine_clock';
}

export function closeSkillOverlay(state: GameState): GameState {
  const pending = state.skillQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      skillQuest: { ...state.skillQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}

export function skipSkillExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
