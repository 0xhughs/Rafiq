import { PRODUCT_TITLE } from './constants';
import { endingObjective, recordEvent } from './dialogue';
import type { ExplainTopic, GameState, PassportQuest } from './types';
import { EVIDENCE_IDS, PASSPORT_PHASES } from './types';

export const CAMPAIGN_VERSION = 'رفيق ١';
export const CAMPAIGN_DATE = '٩ أيلول ٢٠٢٦';
export const PASSPORT_PNG_NAME = 'rafiq-passport.png';
export const PASSPORT_PDF_NAME = 'rafiq-passport.pdf';

export const CERTIFICATE_TITLE = 'شهادة إتمام تعليمية';
export const CERTIFICATE_INVITE =
  'الروبوت: أدعوك إلى مدينة الذكاء الاصطناعي. هذا جواز إتمام تعليمي، لا اعتماد رسمي.';
export const CERTIFICATE_BODY =
  'هذا إتمام لحملة رفيق التعليمية. يثبت ممارسة أفعال موثّقة داخل اللعبة، لا إتقاناً مهنياً ولا اعتماداً رسمياً.';
export const CERTIFICATE_VERSION_LINE = `إصدار الحملة: ${CAMPAIGN_VERSION}`;
export const CERTIFICATE_DATE_LINE = `تاريخ الإتمام: ${CAMPAIGN_DATE}`;
export const CERTIFICATE_DISCLAIMER =
  'ليست اعتماداً ولا علامة تحقق عامة. تُحفظ على جهازك فقط.';

export const PASSPORT_EXPLAIN = {
  educational_passport:
    'الجواز إتمام تعليمي من دليل الحملة، لا اعتماداً رسمياً ولا نسبة اختبار. التنزيل محلي ويمكن إعادته.',
} as const;

export const PASSPORT_FEEDBACK = {
  ineligible: 'الجواز يُمنح بعد دليل الحملة الكامل.',
  confirmFirst: 'أكّد الاسم الظاهر قبل التنزيل.',
  exam: 'لا اختبار موقوت. الجواز يُمنح بدليل الحملة.',
  percent: 'لا نسبة اختبار مختلقة على الجواز.',
  verifyPublic: 'لا علامة تحقق عامة ولا سجل تحقق.',
  registry: 'الأسماء تبقى على جهازك. لا سجل عام.',
  legacy: 'نتيجة الاختبار القديم لا تمنح الجواز.',
  network: 'التنزيل محلي. لا طلب شبكة.',
  robotDone: 'قول «تم» ليس جواز سفر. أكّد الاسم ثم نزّل.',
  fail: 'تعذّر التنزيل. أعد المحاولة من هذه الشاشة.',
} as const;

const PHASES = new Set<string>(PASSPORT_PHASES);

export function createPassportQuest(): PassportQuest {
  return {
    phase: 'unstarted',
    thanksHeard: false,
    opened: false,
    invited: false,
    nameConfirmed: false,
    pngDownloaded: false,
    pdfDownloaded: false,
    issued: false,
    completionDate: '',
    downloadError: null,
    pendingExplain: null,
    view: 'ending',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'educational_passport') return value;
  return null;
}

function parseError(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseDate(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function syncPhase(quest: PassportQuest): PassportQuest {
  let phase: PassportQuest['phase'] = 'unstarted';
  if (quest.issued) phase = 'ready';
  else if (quest.opened || quest.invited || quest.thanksHeard || quest.nameConfirmed) {
    phase = 'working';
  }
  return { ...quest, phase, view: 'ending' };
}

export function parsePassportQuest(value: unknown): PassportQuest {
  const fallback = createPassportQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as PassportQuest['phase'])
      : fallback.phase;
  return syncPhase({
    phase,
    thanksHeard: onFlag(raw, 'thanksHeard'),
    opened: onFlag(raw, 'opened'),
    invited: onFlag(raw, 'invited'),
    nameConfirmed: onFlag(raw, 'nameConfirmed'),
    pngDownloaded: onFlag(raw, 'pngDownloaded'),
    pdfDownloaded: onFlag(raw, 'pdfDownloaded'),
    issued: onFlag(raw, 'issued'),
    completionDate: parseDate(raw.completionDate),
    downloadError: parseError(raw.downloadError),
    pendingExplain: parsePending(raw.pendingExplain),
    view: 'ending',
  });
}

export function certificateLines(playerName: string): string[] {
  return [
    CERTIFICATE_TITLE,
    PRODUCT_TITLE,
    playerName,
    CERTIFICATE_BODY,
    CERTIFICATE_VERSION_LINE,
    CERTIFICATE_DATE_LINE,
    CERTIFICATE_DISCLAIMER,
  ];
}

export function isPassportEligible(state: GameState): boolean {
  return (
    state.pathQuest.restored &&
    EVIDENCE_IDS.every((id) => state.evidence[id] === 'demonstrated')
  );
}

function withObjective(state: GameState): GameState {
  return {
    ...state,
    storyObjective: endingObjective(state) ?? state.storyObjective,
  };
}

function overlayFeedback(state: GameState, message: string): GameState {
  return {
    ...state,
    shopFeedback: message,
    passportQuest: { ...state.passportQuest, downloadError: message },
  };
}

export function openPassportOverlay(state: GameState): GameState {
  if (!isPassportEligible(state)) {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      shopFeedback: PASSPORT_FEEDBACK.ineligible,
    };
  }
  const firstOpen = !state.passportQuest.opened;
  const quest = syncPhase({
    ...state.passportQuest,
    opened: true,
    invited: true,
    completionDate: state.passportQuest.completionDate || CAMPAIGN_DATE,
    downloadError: null,
    view: 'ending',
  });
  const events = firstOpen
    ? recordEvent(state.journalEvents, 'passport_opened')
    : state.journalEvents;
  const endingState = state.passportQuest.issued || state.endingState === 'issued' ? 'issued' : 'invited';
  return withObjective({
    ...state,
    mode: 'ending',
    dialogueNode: null,
    shopFeedback: null,
    endingState,
    passportQuest: quest,
    journalEvents: events,
  });
}

export function reducePassportOpen(state: GameState): GameState {
  if (state.mode !== 'playing' && state.mode !== 'ending') return state;
  return openPassportOverlay(state);
}

export function reducePassportConfirmName(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  if (!state.passportQuest.nameConfirmed) {
    const quest = syncPhase({ ...state.passportQuest, nameConfirmed: true, downloadError: null });
    return {
      ...state,
      shopFeedback: null,
      passportQuest: quest,
      journalEvents: recordEvent(state.journalEvents, 'name_confirmed'),
    };
  }
  return { ...state, shopFeedback: null, passportQuest: { ...state.passportQuest, downloadError: null } };
}

export function reducePassportDownload(state: GameState, format: 'png' | 'pdf'): GameState {
  if (state.mode !== 'ending') return state;
  if (!state.passportQuest.nameConfirmed) {
    return overlayFeedback(state, PASSPORT_FEEDBACK.confirmFirst);
  }
  const firstIssue = !state.passportQuest.issued;
  const quest = syncPhase({
    ...state.passportQuest,
    pngDownloaded: format === 'png' ? true : state.passportQuest.pngDownloaded,
    pdfDownloaded: format === 'pdf' ? true : state.passportQuest.pdfDownloaded,
    issued: true,
    downloadError: null,
    pendingExplain: firstIssue ? 'educational_passport' : state.passportQuest.pendingExplain,
  });
  const events = firstIssue
    ? recordEvent(state.journalEvents, 'passport_issued')
    : state.journalEvents;
  return withObjective({
    ...state,
    shopFeedback: null,
    endingState: 'issued',
    passportQuest: quest,
    journalEvents: events,
  });
}

export function reducePassportDownloadFail(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.fail);
}

export function reducePassportExam(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.exam);
}

export function reducePassportPercent(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.percent);
}

export function reducePassportVerifyPublic(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.verifyPublic);
}

export function reducePassportRegistry(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.registry);
}

export function reducePassportLegacy(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.legacy);
}

export function reducePassportNetwork(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.network);
}

export function reducePassportRobotDone(state: GameState): GameState {
  if (state.mode !== 'ending') return state;
  return overlayFeedback(state, PASSPORT_FEEDBACK.robotDone);
}

export function isPassportExplain(topic: ExplainTopic | null): boolean {
  return topic === 'educational_passport';
}

export function closePassportOverlay(state: GameState): GameState {
  const pending = state.passportQuest.pendingExplain;
  if (pending && state.passportQuest.issued) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      passportQuest: { ...state.passportQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return withObjective({
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    dialogueNode: null,
  });
}

export function skipPassportExplain(state: GameState): GameState {
  return withObjective({
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
  });
}

export function markThanksHeard(state: GameState): GameState {
  if (state.passportQuest.thanksHeard) {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    passportQuest: syncPhase({ ...state.passportQuest, thanksHeard: true }),
  };
}
