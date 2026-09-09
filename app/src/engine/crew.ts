import { recordEvent } from './dialogue';
import { labObjective } from './lab';
import { HOUR_SAT, HOUR_SUN, HOUR_WED, RECORD_NH } from './bridge';
import { BULLETIN_1447 } from './skill';
import { HOUR_THU } from './approval';
import type {
  CrewDraft,
  CrewOwner,
  CrewQuest,
  CrewVersion,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
} from './types';
import { CREW_PHASES } from './types';

export { BULLETIN_1447 };

export const HALL_NOTICE = BULLETIN_1447;
export const HALL_NOTICE_FLAW = `نشرة القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}، ${HOUR_THU}. لا تعليق.`;
export const SOURCE_TEXT = `سند ${RECORD_NH}: ${BULLETIN_1447}`;
export const HANDOFF_TEXT =
  'تسليم: الباحث يأتي بالسند، البنّاء يصوغ النسخة، المراجع يطابق السجل. مالك الناتج: أمينة القاعة.';
export const VERSION_EMPTY = 'لا نسخة مشتركة';
export const VERSION_V1 = 'النسخة المشتركة: v1 — مسودتان متعارضتان';
export const VERSION_V2 = `النسخة المشتركة: v2 — ${BULLETIN_1447}`;
export const ROLES_EMPTY = 'لا طاقم معيّن';
export const QUALITY_EMPTY = 'لا تقييم معروض';
export const ACCEPTED_TEXT = `قُبلت نشرة القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}. لا تعليق.`;
export const CRIT_ACCURACY_FAIL = 'الدقة: فشل';
export const CRIT_ACCURACY_OK = 'الدقة: نجح';
export const CRIT_SOURCE = 'سند المصدر: نجح';
export const CRIT_TONE = 'النبرة: نجح';
export const CRIT_COMPLETE = 'الاكتمال: نجح';
export const CRIT_RISK = 'المخاطرة: نجح';
export const DRAFT_EVIDENCE_SOURCE = `سند: ${RECORD_NH}`;
export const DRAFT_CONFLICT_SOURCE = 'سند: أغلبية الطاقم';
export const ROLES_LINE = 'الباحث، البنّاء، المراجع';

export const CREW_EXPLAIN = {
  roles_and_owner:
    'الباحث والبنّاء والمراجع أدوار مختلفة بمالك ناتج واحد. الخلاف يُحسم بالسند لا بالأغلبية.',
  quality_before_accept:
    'الناتج يُقيَّم على الدقة وسند المصدر والنبرة والاكتمال والمخاطرة. المعيار الفاشل يُصلح قبل القبول.',
} as const;

export const CREW_FEEDBACK = {
  merge: 'الباحث والبنّاء والمراجع أدوار مختلفة. لا تدمجها.',
  ownerMajority: 'الأغلبية ليست مالكاً للناتج. مالك الناتج أمينة القاعة.',
  ownerRobot: 'الروبوت مساعد لا مالك الناتج.',
  handoffFirst: 'عيّن الأدوار الثلاثة ومالك الناتج أولاً.',
  majorityTruth: 'الأغلبية ليست دليلاً. اعتمد المسودة المسنودة.',
  pickConflict: 'هذه المسودة تخالف السجل. ليست دليلاً.',
  inspectFirst: 'اقرأ سند المصدر قبل حسم الخلاف.',
  rolesFirst: 'عيّن الباحث والبنّاء والمراجع أدواراً مختلفة أولاً.',
  ownerLibrarian: 'عيّن أمينة القاعة مالكة للناتج.',
  handoffBeforePick: 'اعرض تسليم الأدوار قبل حسم النسخة.',
  refuseMajority: 'ارفض حسم الأغلبية ثم اعتمد المسودة المسنودة.',
  resend: 'لا إرسال صامت. إرسال النشرة يبقى على منصة الموافقة.',
  robotDoneRoles: 'قول «تم» ليس تنسيقاً. عيّن الأدوار واحسم بالدليل.',
  criteriaFirst: 'اعرض معايير الجودة قبل القبول.',
  failedCriterion: 'لا تقبل ناتجاً فيه معيار فاشل. أصلح المعيار الفاشل أولاً.',
  repairTone: 'هذا المعيار ناجح. أصلح المعيار الفاشل.',
  qualityMajority: 'أغلبية الطاقم ليست معيار جودة.',
  robotDoneQuality: 'قول «تم» ليس قبولاً. راجع المعايير ثم أصلح.',
} as const;

const PHASES = new Set<string>(CREW_PHASES);

export function createCrewQuest(): CrewQuest {
  return {
    phase: 'unstarted',
    openedRoles: false,
    openedQuality: false,
    roleResearcher: false,
    roleBuilder: false,
    roleReviewer: false,
    mergeRefused: false,
    owner: null,
    handoffShown: false,
    sourceInspected: false,
    majorityRefused: false,
    pickedDraft: null,
    sharedVersion: 'v0',
    criteriaOpened: false,
    accuracyOk: false,
    sourceOk: true,
    toneOk: true,
    completeOk: true,
    riskOk: true,
    repaired: false,
    accepted: false,
    acceptedText: '',
    crewReady: false,
    pendingExplain: null,
    view: 'roles',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'roles_and_owner' || value === 'quality_before_accept') {
    return value;
  }
  return null;
}

function parseView(value: unknown): CrewQuest['view'] {
  if (value === 'quality') return 'quality';
  return 'roles';
}

function parseOwner(value: unknown): CrewOwner | null {
  if (value === 'librarian' || value === 'majority' || value === 'robot') return value;
  return null;
}

function parseDraft(value: unknown): CrewDraft | null {
  if (value === 'evidence' || value === 'conflict') return value;
  return null;
}

function parseVersion(value: unknown): CrewVersion {
  if (value === 'v1' || value === 'v2' || value === 'v0') return value;
  return 'v0';
}

function parseAccepted(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseCrewQuest(value: unknown): CrewQuest {
  const fallback = createCrewQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as CrewQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedRoles: onFlag(raw, 'openedRoles'),
    openedQuality: onFlag(raw, 'openedQuality'),
    roleResearcher: onFlag(raw, 'roleResearcher'),
    roleBuilder: onFlag(raw, 'roleBuilder'),
    roleReviewer: onFlag(raw, 'roleReviewer'),
    mergeRefused: onFlag(raw, 'mergeRefused'),
    owner: parseOwner(raw.owner),
    handoffShown: onFlag(raw, 'handoffShown'),
    sourceInspected: onFlag(raw, 'sourceInspected'),
    majorityRefused: onFlag(raw, 'majorityRefused'),
    pickedDraft: parseDraft(raw.pickedDraft),
    sharedVersion: parseVersion(raw.sharedVersion),
    criteriaOpened: onFlag(raw, 'criteriaOpened'),
    accuracyOk: onFlag(raw, 'accuracyOk'),
    sourceOk: raw.sourceOk === false ? false : true,
    toneOk: raw.toneOk === false ? false : true,
    completeOk: raw.completeOk === false ? false : true,
    riskOk: raw.riskOk === false ? false : true,
    repaired: onFlag(raw, 'repaired'),
    accepted: onFlag(raw, 'accepted'),
    acceptedText: parseAccepted(raw.acceptedText),
    crewReady: onFlag(raw, 'crewReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function versionText(quest: CrewQuest): string {
  if (quest.sharedVersion === 'v2') return VERSION_V2;
  if (quest.sharedVersion === 'v1') return VERSION_V1;
  return VERSION_EMPTY;
}

export function outputDraft(quest: CrewQuest): string {
  return quest.accuracyOk ? HALL_NOTICE : HALL_NOTICE_FLAW;
}

function hallMatches(text: string): boolean {
  return (
    text.includes(HOUR_SAT) &&
    text.includes(HOUR_SUN) &&
    text.includes(HOUR_WED) &&
    text.includes('لا تعليق.') &&
    !text.includes(HOUR_THU)
  );
}

function distinctRoles(quest: CrewQuest): boolean {
  return quest.roleResearcher && quest.roleBuilder && quest.roleReviewer;
}

export function canAward62(quest: CrewQuest, approvalReady: boolean): boolean {
  return (
    approvalReady &&
    distinctRoles(quest) &&
    quest.owner === 'librarian' &&
    quest.handoffShown &&
    quest.sourceInspected &&
    quest.majorityRefused &&
    quest.pickedDraft === 'evidence' &&
    quest.sharedVersion === 'v2' &&
    hallMatches(versionText(quest))
  );
}

export function canAward61(quest: CrewQuest, approvalReady: boolean): boolean {
  return (
    approvalReady &&
    quest.criteriaOpened &&
    quest.repaired &&
    quest.accuracyOk &&
    quest.sourceOk &&
    quest.toneOk &&
    quest.completeOk &&
    quest.riskOk &&
    quest.accepted &&
    hallMatches(quest.acceptedText)
  );
}

function syncPhase(quest: CrewQuest): CrewQuest {
  let phase: CrewQuest['phase'] = 'unstarted';
  if (quest.crewReady) phase = 'ready';
  else if (
    quest.openedRoles ||
    quest.openedQuality ||
    quest.roleResearcher ||
    quest.roleBuilder ||
    quest.roleReviewer ||
    quest.accepted ||
    quest.handoffShown
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function awardCrewEvidence(state: GameState): GameState {
  const quest = syncPhase(state.crewQuest);
  const approvalReady = state.approvalQuest.approvalReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had61 = evidence['6.1'] === 'demonstrated';
  const had62 = evidence['6.2'] === 'demonstrated';
  if (canAward61(quest, approvalReady)) evidence['6.1'] = 'demonstrated';
  if (canAward62(quest, approvalReady)) evidence['6.2'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (evidence['6.2'] === 'demonstrated' && !had62) {
    nextQuest = { ...nextQuest, pendingExplain: 'roles_and_owner' };
    events = recordEvent(events, 'conflict_resolved');
  }
  if (evidence['6.1'] === 'demonstrated' && !had61) {
    nextQuest = { ...nextQuest, pendingExplain: 'quality_before_accept' };
    events = recordEvent(events, 'quality_accepted');
  }
  if (
    evidence['6.1'] === 'demonstrated' &&
    evidence['6.2'] === 'demonstrated' &&
    !nextQuest.crewReady
  ) {
    nextQuest = { ...nextQuest, crewReady: true };
    events = recordEvent(events, 'crew_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    crewQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: CrewQuest, extra: Partial<GameState> = {}): GameState {
  return awardCrewEvidence({ ...state, crewQuest: syncPhase(quest), ...extra });
}

function requireCrew(state: GameState): boolean {
  return state.approvalQuest.approvalReady && state.mode === 'crew';
}

export function openCrewDesk(state: GameState): GameState {
  if (!state.approvalQuest.approvalReady) return state;
  const quest: CrewQuest = {
    ...state.crewQuest,
    openedRoles: true,
    view: 'roles',
  };
  const events = recordEvent(state.journalEvents, 'crew_opened');
  return withQuest({ ...state, mode: 'crew', shopFeedback: null, journalEvents: events }, quest);
}

export function openQualityDesk(state: GameState): GameState {
  if (!state.approvalQuest.approvalReady) return state;
  const quest: CrewQuest = {
    ...state.crewQuest,
    openedQuality: true,
    view: 'quality',
  };
  const events = recordEvent(state.journalEvents, 'crew_opened');
  return withQuest({ ...state, mode: 'crew', shopFeedback: null, journalEvents: events }, quest);
}

function maybeRolesAssigned(state: GameState, quest: CrewQuest): GameState {
  let events = state.journalEvents;
  if (distinctRoles(quest)) {
    events = recordEvent(events, 'roles_assigned');
  }
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceCrewAssignResearcher(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, roleResearcher: true, view: 'roles' };
  return maybeRolesAssigned(state, quest);
}

export function reduceCrewAssignBuilder(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, roleBuilder: true, view: 'roles' };
  return maybeRolesAssigned(state, quest);
}

export function reduceCrewAssignReviewer(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, roleReviewer: true, view: 'roles' };
  return maybeRolesAssigned(state, quest);
}

export function reduceCrewRolesMerge(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, mergeRefused: true, view: 'roles' };
  return withQuest(state, quest, { shopFeedback: CREW_FEEDBACK.merge });
}

export function reduceCrewSetOwner(state: GameState, owner: CrewOwner): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, owner, view: 'roles' };
  if (owner === 'majority') {
    return withQuest(state, quest, { shopFeedback: CREW_FEEDBACK.ownerMajority });
  }
  if (owner === 'robot') {
    return withQuest(state, quest, { shopFeedback: CREW_FEEDBACK.ownerRobot });
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceCrewHandoff(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest = state.crewQuest;
  if (!distinctRoles(quest) || quest.owner !== 'librarian') {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.handoffFirst });
  }
  const next: CrewQuest = {
    ...quest,
    handoffShown: true,
    sharedVersion: quest.sharedVersion === 'v2' ? 'v2' : 'v1',
    view: 'roles',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reduceCrewInspectSource(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, sourceInspected: true, view: 'roles' };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceCrewMajority(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, majorityRefused: true, view: 'roles' };
  return withQuest(state, quest, { shopFeedback: CREW_FEEDBACK.majorityTruth });
}

export function reduceCrewPickConflict(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, pickedDraft: 'conflict', view: 'roles' };
  return withQuest(state, quest, { shopFeedback: CREW_FEEDBACK.pickConflict });
}

export function reduceCrewPickEvidence(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest = state.crewQuest;
  if (!distinctRoles(quest)) {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.rolesFirst });
  }
  if (quest.owner !== 'librarian') {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.ownerLibrarian });
  }
  if (!quest.handoffShown) {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.handoffBeforePick });
  }
  if (!quest.sourceInspected) {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.inspectFirst });
  }
  if (!quest.majorityRefused) {
    return withQuest(state, { ...quest, view: 'roles' }, { shopFeedback: CREW_FEEDBACK.refuseMajority });
  }
  const next: CrewQuest = {
    ...quest,
    pickedDraft: 'evidence',
    sharedVersion: 'v2',
    view: 'roles',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reduceCrewRobotDone(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'roles' }, {
    shopFeedback: CREW_FEEDBACK.robotDoneRoles,
  });
}

export function reduceCrewResend(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'roles' }, {
    shopFeedback: CREW_FEEDBACK.resend,
  });
}

export function reduceCrewOpenCriteria(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = { ...state.crewQuest, criteriaOpened: true, view: 'quality' };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceCrewRepairAccuracy(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest: CrewQuest = {
    ...state.crewQuest,
    accuracyOk: true,
    repaired: true,
    view: 'quality',
  };
  const events = recordEvent(state.journalEvents, 'quality_repaired');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceCrewRepairTone(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'quality' }, {
    shopFeedback: CREW_FEEDBACK.repairTone,
  });
}

export function reduceCrewAccept(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  const quest = state.crewQuest;
  if (!quest.criteriaOpened) {
    return withQuest(state, { ...quest, view: 'quality' }, { shopFeedback: CREW_FEEDBACK.criteriaFirst });
  }
  if (!quest.accuracyOk || !quest.repaired) {
    return withQuest(state, { ...quest, view: 'quality' }, { shopFeedback: CREW_FEEDBACK.failedCriterion });
  }
  const next: CrewQuest = {
    ...quest,
    accepted: true,
    acceptedText: ACCEPTED_TEXT,
    view: 'quality',
  };
  return withQuest(state, next, { shopFeedback: null });
}

export function reduceCrewQualityMajority(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'quality' }, {
    shopFeedback: CREW_FEEDBACK.qualityMajority,
  });
}

export function reduceCrewQualityRobotDone(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'quality' }, {
    shopFeedback: CREW_FEEDBACK.robotDoneQuality,
  });
}

export function reduceCrewQualityResend(state: GameState): GameState {
  if (!requireCrew(state)) return state;
  return withQuest(state, { ...state.crewQuest, view: 'quality' }, {
    shopFeedback: CREW_FEEDBACK.resend,
  });
}

export function isCrewOverlay(mode: GameState['mode']): boolean {
  return mode === 'crew';
}

export function isCrewExplain(topic: ExplainTopic | null): boolean {
  return topic === 'roles_and_owner' || topic === 'quality_before_accept';
}

export function closeCrewOverlay(state: GameState): GameState {
  const pending = state.crewQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      crewQuest: { ...state.crewQuest, pendingExplain: null },
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

export function skipCrewExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
