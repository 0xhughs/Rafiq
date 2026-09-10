import { recordEvent } from './dialogue';
import { labObjective } from './lab';
import { RECIPIENT_LIBRARIAN, RECIPIENT_NEIGHBORS, RECIPIENT_PAYROLL } from './approval';
import type {
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  PathGoal,
  PathPayload,
  PathQuest,
  PathRecipient,
  PathStop,
  PathTools,
} from './types';
import { PATH_PHASES } from './types';

export { RECIPIENT_LIBRARIAN, RECIPIENT_NEIGHBORS, RECIPIENT_PAYROLL };

export const HOUR_THU19 = 'thu-19';
export const HOUR_FRI20 = 'fri-20';
export const RECORD_NH_3301 = 'NH-3301';
export const NIGHT_NOTICE = `سهرة القراءة: ${HOUR_THU19}. باب القاعة فقط. لا بث.`;
export const NIGHT_FLAW = `سهرة القراءة: ${HOUR_FRI20}. باب القاعة فقط. بث مباشر.`;
export const RUMOR_TEXT = `الروبوت: سهرة القراءة: ${HOUR_FRI20}. بث مباشر لكل الحي.`;
export const SOURCE_TEXT = `سند ${RECORD_NH_3301}: ${NIGHT_NOTICE}`;
export const DRAFT_TEXT = `مسودة السهرة: ${NIGHT_NOTICE}`;
export const PACK_TEXT = `الحزمة: ملاحظة السهرة + سند ${RECORD_NH_3301}. بلا مانجو وبلا عيادة.`;
export const PLAN_EMPTY = 'لا خطة محدودة';
export const PLAN_BOUNDED =
  'خطة محدودة: نشر سهرة القراءة بأدوات القراءة والكتابة والتحقق، تتوقف عند ثلاث خطوات أو نقص.';
export const PATH_EMPTY = 'لا مسار جاهز';
export const SEAL_EMPTY = 'لا ختم جاهز';
export const EXTRA_STOPPED = 'توقفت الخطوة الإضافية. حد الخطة نافذ.';
export const NIGHT_RECEIPT = `إيصال السهرة: إلى أمينة القاعة — ${NIGHT_NOTICE}`;
export const PAYLOAD_EXACT = NIGHT_NOTICE;
export const PAYLOAD_STREAM = NIGHT_FLAW;

export const PATH_EXPLAIN = {
  integrated_path:
    'المسار يجمع تحقق السند وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية. الترميم عمل تحت إشراف ولا يلغي الهلوسة.',
} as const;

export const PATH_FEEDBACK = {
  trustRumor: 'السند يخالف الادعاء. ارفض الادعاء بعد قراءة المصدر.',
  refuseFirst: 'اقرأ سند المصدر قبل رفض الادعاء.',
  liveGoal: 'الخطة بلا حد ليست مسار القاعة.',
  payTools: 'الدفع والبث خارج المهمة.',
  unlimitedStop: 'الخطة بلا شرط توقف مرفوضة.',
  packBeforeSource: 'اقرأ سند المصدر قبل حزم السياق.',
  mango: 'هذه الملاحظة خارج نافذة السهرة.',
  clinic: 'لا تُدخل بياناً شخصياً في حزمة السهرة.',
  runBeforePlan: 'اضبط خطة محدودة قبل تشغيل المهارة.',
  runBeforePack: 'جهّز حزمة السياق قبل تشغيل المهارة.',
  runOld: 'هذا سجل قديم. المهمة سجل NH-3301.',
  runChat: 'الدردشة ليست مساراً. شغّل المهارة على السجل الجديد.',
  extraFirst: 'شغّل المهارة أولاً.',
  exam: 'لا امتحان موقوت. المسار يُغلق بالدليل.',
  quiz: 'لا اختبار اختيارات. أنجز المهمة في الورشة.',
  robotDone: 'قول «تم» ليس مساراً. تحقق ثم وافق أنت.',
  prepareFirst: 'أكمل المسار على منصة المسار أولاً: سند وخطة وحزمة ومهارة وحد توقف.',
  inspectFirst: 'راجع المستلم والحمولة قبل الموافقة.',
  wrongRecipient: 'المستلم غير صحيح. ارفض الإرسال الخاطئ.',
  wrongPayload: 'الحمولة تخالف سند NH-3301.',
  rejectedWrong: 'رُفض الإرسال الخاطئ. عدّل المستلم والحمولة ثم راجع من جديد.',
  rejectCorrect: 'لا ترفض الإرسال الصحيح. ارفض المحاولة الخاطئة.',
  rereview: 'بعد التعديل أعد المراجعة. لا إرسال صامت.',
  rejectFirst: 'ارفض محاولة خاطئة قبل الموافقة على الإرسال المصحح.',
  resendOld: 'لا إعادة إرسال للنشرة السابقة. هذه سهرة قراءة جديدة.',
} as const;

const PHASES = new Set<string>(PATH_PHASES);

export function createPathQuest(): PathQuest {
  return {
    phase: 'unstarted',
    openedPrep: false,
    openedSeal: false,
    sourceInspected: false,
    rumorRefused: false,
    goal: null,
    tools: null,
    stop: null,
    packReady: false,
    skillRan: false,
    extraStopped: false,
    prepared: false,
    recipient: null,
    payload: null,
    inspectedSend: false,
    rejectedWrong: false,
    needsRereview: false,
    nightSent: false,
    receiptText: '',
    restored: false,
    pendingExplain: null,
    view: 'prep',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'integrated_path') return value;
  return null;
}

function parseView(value: unknown): PathQuest['view'] {
  if (value === 'seal') return 'seal';
  return 'prep';
}

function parseGoal(value: unknown): PathGoal | null {
  if (value === 'reading' || value === 'live') return value;
  return null;
}

function parseTools(value: unknown): PathTools | null {
  if (value === 'safe' || value === 'pay') return value;
  return null;
}

function parseStop(value: unknown): PathStop | null {
  if (value === 'budget' || value === 'unlimited') return value;
  return null;
}

function parseRecipient(value: unknown): PathRecipient | null {
  if (value === 'librarian' || value === 'neighbors' || value === 'payroll') return value;
  return null;
}

function parsePayload(value: unknown): PathPayload | null {
  if (value === 'exact' || value === 'stream') return value;
  return null;
}

function parseReceipt(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parsePathQuest(value: unknown): PathQuest {
  const fallback = createPathQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as PathQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedPrep: onFlag(raw, 'openedPrep'),
    openedSeal: onFlag(raw, 'openedSeal'),
    sourceInspected: onFlag(raw, 'sourceInspected'),
    rumorRefused: onFlag(raw, 'rumorRefused'),
    goal: parseGoal(raw.goal),
    tools: parseTools(raw.tools),
    stop: parseStop(raw.stop),
    packReady: onFlag(raw, 'packReady'),
    skillRan: onFlag(raw, 'skillRan'),
    extraStopped: onFlag(raw, 'extraStopped'),
    prepared: onFlag(raw, 'prepared'),
    recipient: parseRecipient(raw.recipient),
    payload: parsePayload(raw.payload),
    inspectedSend: onFlag(raw, 'inspectedSend'),
    rejectedWrong: onFlag(raw, 'rejectedWrong'),
    needsRereview: onFlag(raw, 'needsRereview'),
    nightSent: onFlag(raw, 'nightSent'),
    receiptText: parseReceipt(raw.receiptText),
    restored: onFlag(raw, 'restored'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function planReady(quest: PathQuest): boolean {
  return quest.goal === 'reading' && quest.tools === 'safe' && quest.stop === 'budget';
}

export function planText(quest: PathQuest): string {
  return planReady(quest) ? PLAN_BOUNDED : PLAN_EMPTY;
}

export function draftText(quest: PathQuest): string {
  return quest.skillRan ? DRAFT_TEXT : '';
}

export function recipientLabel(recipient: PathRecipient | null): string {
  if (recipient === 'librarian') return RECIPIENT_LIBRARIAN;
  if (recipient === 'neighbors') return RECIPIENT_NEIGHBORS;
  if (recipient === 'payroll') return RECIPIENT_PAYROLL;
  return '';
}

export function payloadText(payload: PathPayload | null): string {
  if (payload === 'exact') return PAYLOAD_EXACT;
  if (payload === 'stream') return PAYLOAD_STREAM;
  return '';
}

export function reviewText(quest: PathQuest): string {
  return `المستلم: ${recipientLabel(quest.recipient)}\nالحمولة: ${payloadText(quest.payload)}`;
}

export function prepComplete(quest: PathQuest): boolean {
  return (
    quest.sourceInspected &&
    quest.rumorRefused &&
    planReady(quest) &&
    quest.packReady &&
    quest.skillRan &&
    quest.extraStopped
  );
}

function nightMatches(text: string): boolean {
  return (
    text === NIGHT_RECEIPT &&
    text.includes(HOUR_THU19) &&
    text.includes('باب القاعة فقط') &&
    text.includes('لا بث.') &&
    !text.includes(HOUR_FRI20) &&
    !text.includes('بث مباشر')
  );
}

export function canAward64(quest: PathQuest, crewReady: boolean): boolean {
  return (
    crewReady &&
    quest.sourceInspected &&
    quest.rumorRefused &&
    planReady(quest) &&
    quest.packReady &&
    quest.skillRan &&
    quest.extraStopped &&
    quest.prepared &&
    quest.inspectedSend &&
    quest.rejectedWrong &&
    quest.recipient === 'librarian' &&
    quest.payload === 'exact' &&
    !quest.needsRereview &&
    quest.nightSent &&
    nightMatches(quest.receiptText)
  );
}

function syncPhase(quest: PathQuest): PathQuest {
  let phase: PathQuest['phase'] = 'unstarted';
  if (quest.restored) phase = 'ready';
  else if (
    quest.openedPrep ||
    quest.openedSeal ||
    quest.sourceInspected ||
    quest.prepared ||
    quest.nightSent ||
    quest.packReady ||
    quest.skillRan
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function awardPathEvidence(state: GameState): GameState {
  const quest = syncPhase(state.pathQuest);
  const crewReady = state.crewQuest.crewReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had64 = evidence['6.4'] === 'demonstrated';
  if (canAward64(quest, crewReady)) evidence['6.4'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (planReady(nextQuest)) {
    events = recordEvent(events, 'plan_bounded');
  }
  if (nextQuest.packReady) {
    events = recordEvent(events, 'pack_ready');
  }
  if (nextQuest.skillRan) {
    events = recordEvent(events, 'skill_ran');
  }
  if (nextQuest.nightSent) {
    events = recordEvent(events, 'night_sent');
  }
  if (evidence['6.4'] === 'demonstrated' && !had64) {
    nextQuest = { ...nextQuest, restored: true, pendingExplain: 'integrated_path' };
    events = recordEvent(events, 'restored');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    pathQuest: nextQuest,
    journalEvents: events,
    endingState: 'in_progress',
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: PathQuest, extra: Partial<GameState> = {}): GameState {
  return awardPathEvidence({ ...state, pathQuest: syncPhase(quest), ...extra });
}

function requirePath(state: GameState): boolean {
  return state.crewQuest.crewReady && state.mode === 'path';
}

export function openPathDesk(state: GameState): GameState {
  if (!state.crewQuest.crewReady) return state;
  const quest: PathQuest = {
    ...state.pathQuest,
    openedPrep: true,
    view: 'prep',
  };
  const events = recordEvent(state.journalEvents, 'path_opened');
  return withQuest({ ...state, mode: 'path', shopFeedback: null, journalEvents: events }, quest);
}

export function openSealDesk(state: GameState): GameState {
  if (!state.crewQuest.crewReady) return state;
  const quest: PathQuest = {
    ...state.pathQuest,
    openedSeal: true,
    view: 'seal',
  };
  const events = recordEvent(state.journalEvents, 'path_opened');
  return withQuest({ ...state, mode: 'path', shopFeedback: null, journalEvents: events }, quest);
}

export function reducePathInspectSource(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest: PathQuest = { ...state.pathQuest, sourceInspected: true, view: 'prep' };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathTrustRumor(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, {
    shopFeedback: PATH_FEEDBACK.trustRumor,
  });
}

export function reducePathRefuseRumor(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!quest.sourceInspected) {
    return withQuest(state, { ...quest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.refuseFirst });
  }
  const next: PathQuest = { ...quest, rumorRefused: true, view: 'prep' };
  const events = recordEvent(state.journalEvents, 'source_verified');
  return withQuest({ ...state, journalEvents: events }, next, { shopFeedback: null });
}

export function reducePathSetGoal(state: GameState, goal: PathGoal): GameState {
  if (!requirePath(state)) return state;
  const quest: PathQuest = { ...state.pathQuest, goal, view: 'prep' };
  if (goal === 'live') {
    return withQuest(state, quest, { shopFeedback: PATH_FEEDBACK.liveGoal });
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathSetTools(state: GameState, tools: PathTools): GameState {
  if (!requirePath(state)) return state;
  const quest: PathQuest = { ...state.pathQuest, tools, view: 'prep' };
  if (tools === 'pay') {
    return withQuest(state, quest, { shopFeedback: PATH_FEEDBACK.payTools });
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathSetStop(state: GameState, stop: PathStop): GameState {
  if (!requirePath(state)) return state;
  const quest: PathQuest = { ...state.pathQuest, stop, view: 'prep' };
  if (stop === 'unlimited') {
    return withQuest(state, quest, { shopFeedback: PATH_FEEDBACK.unlimitedStop });
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathLoadReading(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!quest.sourceInspected) {
    return withQuest(state, { ...quest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.packBeforeSource });
  }
  const next: PathQuest = { ...quest, packReady: true, view: 'prep' };
  return withQuest(state, next, { shopFeedback: null });
}

export function reducePathLoadMango(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.mango });
}

export function reducePathLoadClinic(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.clinic });
}

export function reducePathRunSkill(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!planReady(quest)) {
    return withQuest(state, { ...quest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.runBeforePlan });
  }
  if (!quest.packReady) {
    return withQuest(state, { ...quest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.runBeforePack });
  }
  const next: PathQuest = { ...quest, skillRan: true, view: 'prep' };
  return withQuest(state, next, { shopFeedback: null });
}

export function reducePathRunOld(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.runOld });
}

export function reducePathRunChat(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.runChat });
}

export function reducePathExtraStep(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!quest.skillRan) {
    return withQuest(state, { ...quest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.extraFirst });
  }
  const next: PathQuest = { ...quest, extraStopped: true, view: 'prep' };
  return withQuest(state, next, { shopFeedback: EXTRA_STOPPED });
}

export function reducePathExam(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.exam });
}

export function reducePathQuiz(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.quiz });
}

export function reducePathRobotDone(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'prep' }, { shopFeedback: PATH_FEEDBACK.robotDone });
}

function dirtyAfterInspect(quest: PathQuest): PathQuest {
  if (!quest.inspectedSend && !quest.needsRereview) return quest;
  return { ...quest, inspectedSend: false, needsRereview: true };
}

export function reducePathPrepare(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!prepComplete(quest)) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.prepareFirst });
  }
  const next: PathQuest = dirtyAfterInspect({
    ...quest,
    prepared: true,
    recipient: 'neighbors',
    payload: 'exact',
    view: 'seal',
  });
  return withQuest(state, next, { shopFeedback: null });
}

export function reducePathSetRecipient(state: GameState, recipient: PathRecipient): GameState {
  if (!requirePath(state)) return state;
  if (!state.pathQuest.prepared) {
    return withQuest(state, { ...state.pathQuest, view: 'seal' }, { shopFeedback: null });
  }
  const quest: PathQuest = dirtyAfterInspect({
    ...state.pathQuest,
    recipient,
    view: 'seal',
  });
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathSetPayload(state: GameState, payload: PathPayload): GameState {
  if (!requirePath(state)) return state;
  if (!state.pathQuest.prepared) {
    return withQuest(state, { ...state.pathQuest, view: 'seal' }, { shopFeedback: null });
  }
  const quest: PathQuest = dirtyAfterInspect({
    ...state.pathQuest,
    payload,
    view: 'seal',
  });
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePathInspectSend(state: GameState): GameState {
  if (!requirePath(state)) return state;
  if (!state.pathQuest.prepared) {
    return withQuest(state, { ...state.pathQuest, view: 'seal' }, { shopFeedback: null });
  }
  const quest: PathQuest = {
    ...state.pathQuest,
    inspectedSend: true,
    needsRereview: false,
    view: 'seal',
  };
  return withQuest(state, quest, { shopFeedback: null });
}

function isCorrectPair(quest: PathQuest): boolean {
  return quest.recipient === 'librarian' && quest.payload === 'exact';
}

function isWrongAttempt(quest: PathQuest): boolean {
  return (
    quest.recipient === 'neighbors' ||
    quest.recipient === 'payroll' ||
    quest.payload === 'stream'
  );
}

export function reducePathReject(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!quest.prepared) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: null });
  }
  if (isCorrectPair(quest)) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.rejectCorrect });
  }
  if (!isWrongAttempt(quest)) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: null });
  }
  const next: PathQuest = {
    ...quest,
    rejectedWrong: true,
    view: 'seal',
  };
  const events = recordEvent(state.journalEvents, 'night_rejected');
  return withQuest(
    { ...state, journalEvents: events },
    next,
    { shopFeedback: PATH_FEEDBACK.rejectedWrong },
  );
}

export function reducePathConfirm(state: GameState): GameState {
  if (!requirePath(state)) return state;
  const quest = state.pathQuest;
  if (!quest.prepared) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.inspectFirst });
  }
  if (!quest.inspectedSend) {
    const message = quest.needsRereview ? PATH_FEEDBACK.rereview : PATH_FEEDBACK.inspectFirst;
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: message });
  }
  if (quest.payload === 'stream') {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.wrongPayload });
  }
  if (quest.recipient === 'neighbors' || quest.recipient === 'payroll') {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.wrongRecipient });
  }
  if (!quest.rejectedWrong) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.rejectFirst });
  }
  if (quest.needsRereview) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.rereview });
  }
  if (!isCorrectPair(quest)) {
    return withQuest(state, { ...quest, view: 'seal' }, { shopFeedback: PATH_FEEDBACK.wrongRecipient });
  }
  const next: PathQuest = {
    ...quest,
    nightSent: true,
    receiptText: NIGHT_RECEIPT,
    view: 'seal',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reducePathResendOld(state: GameState): GameState {
  if (!requirePath(state)) return state;
  return withQuest(state, { ...state.pathQuest, view: 'seal' }, {
    shopFeedback: PATH_FEEDBACK.resendOld,
  });
}

export function isPathOverlay(mode: GameState['mode']): boolean {
  return mode === 'path';
}

export function isPathExplain(topic: ExplainTopic | null): boolean {
  return topic === 'integrated_path';
}

export function closePathOverlay(state: GameState): GameState {
  const pending = state.pathQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      pathQuest: { ...state.pathQuest, pendingExplain: null },
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

export function skipPathExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
