import { recordEvent } from './dialogue';
import { labObjective } from './lab';
import { HOUR_SAT, HOUR_SUN, HOUR_WED } from './bridge';
import { BULLETIN_1447, TRAY_SUN } from './skill';
import type {
  ApprovalDecision,
  ApprovalPayload,
  ApprovalQuest,
  ApprovalRecipient,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
} from './types';
import { APPROVAL_PHASES } from './types';

export { BULLETIN_1447, TRAY_SUN };

export const HOUR_THU = 'thu-09';
export const CLINIC_NOTE = 'CL-19';
export const RECIPIENT_LIBRARIAN = 'أمينة القاعة';
export const RECIPIENT_NEIGHBORS = 'كل الجيران';
export const RECIPIENT_PAYROLL = 'مسير الرواتب';
export const PAYLOAD_EXACT = BULLETIN_1447;
export const PAYLOAD_EXTRA = `نشرة القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}، ${HOUR_THU}. لا تعليق.`;
export const PAYLOAD_COMMENT = `نشرة القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}. تعليق: القاعة أجمل قاعة.`;
export const SEND_EMPTY = 'لا إرسال مُجهَّز';
export const CASE_EMPTY = 'لا قرار معروض';
export const CASE_CONTEXT = `طلب من أمينة القاعة: هل نثبت ملاحظة عيادة ليان ابنة نورة الشمري (${CLINIC_NOTE}) على لوحة القاعة؟ القرار شخصي ولا يُؤتمت.`;
export const CASE_WAIT = 'الروبوت جهّز السياق وينتظر. لم يقرر.';
export const CASE_RESULT = 'بقيت ملاحظة العيادة عند نورة. الروبوت لم يقرر.';
export const SEND_RECEIPT = `إيصال الإرسال: إلى ${RECIPIENT_LIBRARIAN} — ${BULLETIN_1447}`;

export const APPROVE_EXPLAIN = {
  human_before_send:
    'فعل لا يُرجع يحتاج مراجعة بشرية للمستلم والحمولة. ارفض الخاطئ ثم وافق على المصحح.',
  what_not_to_automate:
    'قرار عيادة طفل شخصي. الروبوت يجهّز السياق وينتظر. الأغلبية والأتمتة ليستا قراراً.',
} as const;

export const APPROVE_FEEDBACK = {
  inspectFirst: 'راجع المستلم والحمولة قبل الموافقة.',
  wrongRecipient: 'المستلم غير صحيح. ارفض الإرسال الخاطئ.',
  wrongPayload: 'الحمولة غير مطابقة لمسودة الأحد.',
  rejectedWrong: 'رُفض الإرسال الخاطئ. عدّل المستلم والحمولة ثم راجع من جديد.',
  rejectCorrect: 'لا ترفض الإرسال الصحيح. ارفض المحاولة الخاطئة.',
  rereview: 'بعد التعديل أعد المراجعة. لا إرسال صامت.',
  rejectFirst: 'ارفض محاولة خاطئة قبل الموافقة على الإرسال المصحح.',
  deleteDraft: 'المسودة لا تُحذف من هنا. الإرسال قرار بشري.',
  pay: 'الإرسال ليس دفعاً. لا تدفع من الخزنة.',
  robotDoneSend: 'قول «تم» ليس موافقة. راجع ثم ارفض أو وافق أنت.',
  auto: 'القرار الشخصي لا يُؤتمت. أبقه عند إنسان مسؤول.',
  majority: 'الأغلبية ليست قراراً مسؤولاً عن عيادة طفل.',
  robotDoneCase: 'قول «تم» ليس قراراً. القرار لك.',
  share: 'مشاركة عيادة طفل ليست للنشر العام.',
  keepWithoutRefusals: 'ارفض قرار الروبوت والأغلبية ثم قرر أنت.',
} as const;

const PHASES = new Set<string>(APPROVAL_PHASES);

export function createApprovalQuest(): ApprovalQuest {
  return {
    phase: 'unstarted',
    openedDesk: false,
    openedCase: false,
    prepared: false,
    recipient: null,
    payload: null,
    inspectedSend: false,
    rejectedWrong: false,
    needsRereview: false,
    approved: false,
    bulletinSent: false,
    receiptText: '',
    contextPrepared: false,
    inspectedCase: false,
    robotWaited: false,
    autoRefused: false,
    majorityRefused: false,
    shareRefused: false,
    humanDecided: false,
    decision: null,
    approvalReady: false,
    pendingExplain: null,
    view: 'send',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'human_before_send' || value === 'what_not_to_automate') {
    return value;
  }
  return null;
}

function parseView(value: unknown): ApprovalQuest['view'] {
  if (value === 'personal') return 'personal';
  return 'send';
}

function parseRecipient(value: unknown): ApprovalRecipient | null {
  if (value === 'librarian' || value === 'neighbors' || value === 'payroll') return value;
  return null;
}

function parsePayload(value: unknown): ApprovalPayload | null {
  if (value === 'exact' || value === 'extra_hour' || value === 'comment') return value;
  return null;
}

function parseDecision(value: unknown): ApprovalDecision | null {
  if (value === 'keep_private' || value === 'share') return value;
  return null;
}

function parseReceipt(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseApprovalQuest(value: unknown): ApprovalQuest {
  const fallback = createApprovalQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as ApprovalQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedDesk: onFlag(raw, 'openedDesk'),
    openedCase: onFlag(raw, 'openedCase'),
    prepared: onFlag(raw, 'prepared'),
    recipient: parseRecipient(raw.recipient),
    payload: parsePayload(raw.payload),
    inspectedSend: onFlag(raw, 'inspectedSend'),
    rejectedWrong: onFlag(raw, 'rejectedWrong'),
    needsRereview: onFlag(raw, 'needsRereview'),
    approved: onFlag(raw, 'approved'),
    bulletinSent: onFlag(raw, 'bulletinSent'),
    receiptText: parseReceipt(raw.receiptText),
    contextPrepared: onFlag(raw, 'contextPrepared'),
    inspectedCase: onFlag(raw, 'inspectedCase'),
    robotWaited: onFlag(raw, 'robotWaited'),
    autoRefused: onFlag(raw, 'autoRefused'),
    majorityRefused: onFlag(raw, 'majorityRefused'),
    shareRefused: onFlag(raw, 'shareRefused'),
    humanDecided: onFlag(raw, 'humanDecided'),
    decision: parseDecision(raw.decision),
    approvalReady: onFlag(raw, 'approvalReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function recipientLabel(recipient: ApprovalRecipient | null): string {
  if (recipient === 'librarian') return RECIPIENT_LIBRARIAN;
  if (recipient === 'neighbors') return RECIPIENT_NEIGHBORS;
  if (recipient === 'payroll') return RECIPIENT_PAYROLL;
  return '';
}

export function payloadText(payload: ApprovalPayload | null): string {
  if (payload === 'exact') return PAYLOAD_EXACT;
  if (payload === 'extra_hour') return PAYLOAD_EXTRA;
  if (payload === 'comment') return PAYLOAD_COMMENT;
  return '';
}

export function reviewText(quest: ApprovalQuest): string {
  return `المستلم: ${recipientLabel(quest.recipient)}\nالحمولة: ${payloadText(quest.payload)}`;
}

function receiptMatches(text: string): boolean {
  return (
    text === SEND_RECEIPT &&
    text.includes(HOUR_SAT) &&
    text.includes(HOUR_SUN) &&
    text.includes(HOUR_WED) &&
    text.includes('لا تعليق.') &&
    !text.includes(HOUR_THU)
  );
}

export function canAward57(quest: ApprovalQuest, skillReady: boolean): boolean {
  return (
    skillReady &&
    quest.prepared &&
    quest.inspectedSend &&
    quest.rejectedWrong &&
    quest.recipient === 'librarian' &&
    quest.payload === 'exact' &&
    !quest.needsRereview &&
    quest.approved &&
    quest.bulletinSent &&
    receiptMatches(quest.receiptText)
  );
}

export function canAward63(quest: ApprovalQuest, skillReady: boolean): boolean {
  return (
    skillReady &&
    quest.contextPrepared &&
    quest.robotWaited &&
    quest.autoRefused &&
    quest.majorityRefused &&
    quest.humanDecided &&
    quest.decision === 'keep_private'
  );
}

function syncPhase(quest: ApprovalQuest): ApprovalQuest {
  let phase: ApprovalQuest['phase'] = 'unstarted';
  if (quest.approvalReady) phase = 'ready';
  else if (
    quest.openedDesk ||
    quest.openedCase ||
    quest.prepared ||
    quest.contextPrepared ||
    quest.approved ||
    quest.humanDecided
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function awardApprovalEvidence(state: GameState): GameState {
  const quest = syncPhase(state.approvalQuest);
  const skillReady = state.skillQuest.skillReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had57 = evidence['5.7'] === 'demonstrated';
  const had63 = evidence['6.3'] === 'demonstrated';
  if (canAward57(quest, skillReady)) evidence['5.7'] = 'demonstrated';
  if (canAward63(quest, skillReady)) evidence['6.3'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (evidence['5.7'] === 'demonstrated' && !had57) {
    nextQuest = { ...nextQuest, pendingExplain: 'human_before_send' };
    events = recordEvent(events, 'send_approved');
  }
  if (evidence['6.3'] === 'demonstrated' && !had63) {
    nextQuest = { ...nextQuest, pendingExplain: 'what_not_to_automate' };
    events = recordEvent(events, 'human_decided');
  }
  if (
    evidence['5.7'] === 'demonstrated' &&
    evidence['6.3'] === 'demonstrated' &&
    !nextQuest.approvalReady
  ) {
    nextQuest = { ...nextQuest, approvalReady: true };
    events = recordEvent(events, 'approval_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    approvalQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: ApprovalQuest, extra: Partial<GameState> = {}): GameState {
  return awardApprovalEvidence({ ...state, approvalQuest: syncPhase(quest), ...extra });
}

function requireApprove(state: GameState): boolean {
  return state.skillQuest.skillReady && state.mode === 'approve';
}

export function openApproveDesk(state: GameState): GameState {
  if (!state.skillQuest.skillReady) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    openedDesk: true,
    view: 'send',
  };
  const events = recordEvent(state.journalEvents, 'approve_opened');
  return withQuest({ ...state, mode: 'approve', shopFeedback: null, journalEvents: events }, quest);
}

export function openDecisionDesk(state: GameState): GameState {
  if (!state.skillQuest.skillReady) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    openedCase: true,
    view: 'personal',
  };
  const events = recordEvent(state.journalEvents, 'approve_opened');
  return withQuest({ ...state, mode: 'approve', shopFeedback: null, journalEvents: events }, quest);
}

function dirtyAfterInspect(quest: ApprovalQuest): ApprovalQuest {
  if (!quest.inspectedSend && !quest.needsRereview) return quest;
  return { ...quest, inspectedSend: false, needsRereview: true };
}

export function reduceApprovePrepare(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest: ApprovalQuest = dirtyAfterInspect({
    ...state.approvalQuest,
    prepared: true,
    recipient: 'neighbors',
    payload: 'exact',
    view: 'send',
  });
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceApproveSetRecipient(state: GameState, recipient: ApprovalRecipient): GameState {
  if (!requireApprove(state)) return state;
  if (!state.approvalQuest.prepared) {
    return withQuest(state, { ...state.approvalQuest, view: 'send' }, { shopFeedback: null });
  }
  const quest: ApprovalQuest = dirtyAfterInspect({
    ...state.approvalQuest,
    recipient,
    view: 'send',
  });
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceApproveSetPayload(state: GameState, payload: ApprovalPayload): GameState {
  if (!requireApprove(state)) return state;
  if (!state.approvalQuest.prepared) {
    return withQuest(state, { ...state.approvalQuest, view: 'send' }, { shopFeedback: null });
  }
  const quest: ApprovalQuest = dirtyAfterInspect({
    ...state.approvalQuest,
    payload,
    view: 'send',
  });
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceApproveInspect(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  if (!state.approvalQuest.prepared) {
    return withQuest(state, { ...state.approvalQuest, view: 'send' }, { shopFeedback: null });
  }
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    inspectedSend: true,
    needsRereview: false,
    view: 'send',
  };
  return withQuest(state, quest, { shopFeedback: null });
}

function isCorrectPair(quest: ApprovalQuest): boolean {
  return quest.recipient === 'librarian' && quest.payload === 'exact';
}

function isWrongAttempt(quest: ApprovalQuest): boolean {
  return (
    quest.recipient === 'neighbors' ||
    quest.recipient === 'payroll' ||
    quest.payload === 'extra_hour' ||
    quest.payload === 'comment'
  );
}

export function reduceApproveReject(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest = state.approvalQuest;
  if (!quest.prepared) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: null });
  }
  if (isCorrectPair(quest) && !quest.rejectedWrong) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.rejectCorrect });
  }
  if (isCorrectPair(quest)) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.rejectCorrect });
  }
  if (!isWrongAttempt(quest)) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: null });
  }
  const next: ApprovalQuest = {
    ...quest,
    rejectedWrong: true,
    view: 'send',
  };
  const events = recordEvent(state.journalEvents, 'send_rejected');
  return withQuest(
    { ...state, journalEvents: events },
    next,
    { shopFeedback: APPROVE_FEEDBACK.rejectedWrong },
  );
}

export function reduceApproveConfirm(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest = state.approvalQuest;
  if (!quest.prepared) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.inspectFirst });
  }
  if (!quest.inspectedSend) {
    const message = quest.needsRereview ? APPROVE_FEEDBACK.rereview : APPROVE_FEEDBACK.inspectFirst;
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: message });
  }
  if (quest.payload === 'extra_hour' || quest.payload === 'comment') {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.wrongPayload });
  }
  if (quest.recipient === 'neighbors' || quest.recipient === 'payroll') {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.wrongRecipient });
  }
  if (!quest.rejectedWrong) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.rejectFirst });
  }
  if (quest.needsRereview) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.rereview });
  }
  if (!isCorrectPair(quest)) {
    return withQuest(state, { ...quest, view: 'send' }, { shopFeedback: APPROVE_FEEDBACK.wrongRecipient });
  }
  const next: ApprovalQuest = {
    ...quest,
    approved: true,
    bulletinSent: true,
    receiptText: SEND_RECEIPT,
    view: 'send',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reduceApproveDelete(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  return withQuest(state, { ...state.approvalQuest, view: 'send' }, {
    shopFeedback: APPROVE_FEEDBACK.deleteDraft,
  });
}

export function reduceApprovePay(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  return withQuest(state, { ...state.approvalQuest, view: 'send' }, {
    shopFeedback: APPROVE_FEEDBACK.pay,
  });
}

export function reduceApproveRobotDone(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  return withQuest(state, { ...state.approvalQuest, view: 'send' }, {
    shopFeedback: APPROVE_FEEDBACK.robotDoneSend,
  });
}

export function reduceApproveCasePrepare(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    contextPrepared: true,
    inspectedCase: true,
    robotWaited: true,
    view: 'personal',
  };
  const events = recordEvent(state.journalEvents, 'case_context');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceApproveCaseAuto(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    autoRefused: true,
    view: 'personal',
  };
  return withQuest(state, quest, { shopFeedback: APPROVE_FEEDBACK.auto });
}

export function reduceApproveCaseMajority(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    majorityRefused: true,
    view: 'personal',
  };
  return withQuest(state, quest, { shopFeedback: APPROVE_FEEDBACK.majority });
}

export function reduceApproveCaseShare(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest: ApprovalQuest = {
    ...state.approvalQuest,
    shareRefused: true,
    view: 'personal',
  };
  return withQuest(state, quest, { shopFeedback: APPROVE_FEEDBACK.share });
}

export function reduceApproveCaseKeep(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  const quest = state.approvalQuest;
  if (!quest.contextPrepared || !quest.autoRefused || !quest.majorityRefused) {
    return withQuest(state, { ...quest, view: 'personal' }, {
      shopFeedback: APPROVE_FEEDBACK.keepWithoutRefusals,
    });
  }
  const next: ApprovalQuest = {
    ...quest,
    humanDecided: true,
    decision: 'keep_private',
    view: 'personal',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reduceApproveCaseRobotDone(state: GameState): GameState {
  if (!requireApprove(state)) return state;
  return withQuest(state, { ...state.approvalQuest, view: 'personal' }, {
    shopFeedback: APPROVE_FEEDBACK.robotDoneCase,
  });
}

export function isApproveOverlay(mode: GameState['mode']): boolean {
  return mode === 'approve';
}

export function isApproveExplain(topic: ExplainTopic | null): boolean {
  return topic === 'human_before_send' || topic === 'what_not_to_automate';
}

export function closeApproveOverlay(state: GameState): GameState {
  const pending = state.approvalQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      approvalQuest: { ...state.approvalQuest, pendingExplain: null },
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

export function skipApproveExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
