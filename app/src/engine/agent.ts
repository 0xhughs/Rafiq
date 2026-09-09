import { recordEvent } from './dialogue';
import { SLOT_IDS } from './kiosk';
import { labObjective } from './lab';
import type {
  AgentGoal,
  AgentInvokeTool,
  AgentJob,
  AgentQuest,
  AgentStopRule,
  AgentSuccessTest,
  AgentToolId,
  AgentTraceStep,
  AgentView,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
} from './types';
import { AGENT_PHASES } from './types';

export const CHAT_PLAN_TEXT = 'سأكتب الفترات الآن من الدردشة.';
export const BOARD_EMPTY = 'اللوحة فارغة';
export const LIVE_HOURS_TEXT = 'ساعات حيّة';
export const GOAL_SLOTS_TEXT = 'انشر الفترات الثلاث المعلّقة على لوحة الحي';
export const SUCCESS_SLOTS_TEXT = 'اللوحة تعرض sun-pm و mon-am و tue-pm';
export const STOP_BUDGET3_TEXT = 'توقف بعد ٣ خطوات أو عند نقص المدخل';
export const JOB_SLOTS_LABEL = 'نشر فترات المعاينة';
export const JOB_SHELF_LABEL = 'تحديث بطاقة الرف';

export const AGENT_EXPLAIN = {
  chat_vs_agent: 'الدردشة تخطط. أدوات المشغّل هي التي تغيّر اللوحة.',
  job_contract: 'المهمة المحدودة لها هدف وأدوات ومعيار نجاح وشرط توقف.',
  runner_limits: 'المشغّل يوقف الحلقة عند النجاح أو نقص المدخل أو تجاوز حد الخطوات.',
} as const;

export const AGENT_FEEDBACK = {
  chatPlan: 'الخطة وحدها لا تغيّر اللوحة. راقب أدوات المشغّل.',
  robotDone: 'قول «تم» ليس قبولاً. راقب أثر الأدوات على اللوحة.',
  wrongGoal: 'اضبط الهدف: انشر الفترات الثلاث المعلّقة على لوحة الحي.',
  wrongTools: 'الأدوات المسموحة يجب أن تكون read_slots و write_notice و verify_notice فقط.',
  wrongSuccess: 'معيار النجاح: اللوحة تعرض sun-pm و mon-am و tue-pm.',
  missingConfig: 'اضبط الهدف والأدوات ومعيار النجاح وشرط التوقف أولاً.',
  missingInput: 'توقف المشغّل: المدخل ناقص — لا يوجد رقم رف',
  budget1: 'توقف المشغّل: تجاوز حد الخطوات (١)',
  budget3: 'توقف المشغّل: تجاوز حد الخطوات (٣)',
  successStop: 'توقف: معيار النجاح تحقق',
  unlimitedExtra: 'المشغّل لم يتوقف عند الحد',
  permission: 'مرفوض: الأداة غير مسموحة في المشغّل.',
} as const;

const PHASES = new Set<string>(AGENT_PHASES);
const SLOT_LINE = `${SLOT_IDS.sunday}، ${SLOT_IDS.monday}، ${SLOT_IDS.tuesday}`;

export function createAgentQuest(): AgentQuest {
  return {
    phase: 'unstarted',
    openedAgent: false,
    sawChatPlan: false,
    loadedJob: null,
    goal: null,
    toolRead: false,
    toolWrite: false,
    toolVerify: false,
    toolChat: false,
    toolHours: false,
    successTest: null,
    stopRule: null,
    boardPosted: false,
    boardPolluted: false,
    inspectedBoard: false,
    successStopped: false,
    missingStopped: false,
    stoppedExtra: false,
    stepsUsed: 0,
    trace: [],
    agentReady: false,
    pendingExplain: null,
    view: 'console',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'chat_vs_agent' || value === 'job_contract' || value === 'runner_limits') {
    return value;
  }
  return null;
}

function parseJob(value: unknown): AgentQuest['loadedJob'] {
  if (value === 'slots' || value === 'shelf') return value;
  return null;
}

function parseGoal(value: unknown): AgentQuest['goal'] {
  if (value === 'post_slots' || value === 'chat_only' || value === 'live_hours') return value;
  return null;
}

function parseSuccess(value: unknown): AgentQuest['successTest'] {
  if (value === 'slots_posted' || value === 'robot_done' || value === 'click_count') return value;
  return null;
}

function parseStop(value: unknown): AgentQuest['stopRule'] {
  if (value === 'budget_3_or_missing' || value === 'unlimited' || value === 'budget_1') return value;
  return null;
}

function parseView(value: unknown): AgentView {
  if (value === 'board') return 'board';
  return 'console';
}

function parseTrace(value: unknown): AgentTraceStep[] {
  if (!Array.isArray(value)) return [];
  const steps: AgentTraceStep[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const raw = item as Record<string, unknown>;
    const phase =
      raw.phase === 'راقب' || raw.phase === 'نفّذ' || raw.phase === 'تحقق' ? raw.phase : null;
    const tool =
      raw.tool === 'read_slots' || raw.tool === 'write_notice' || raw.tool === 'verify_notice'
        ? raw.tool
        : null;
    if (!phase || !tool || typeof raw.detail !== 'string') continue;
    steps.push({ phase, tool, detail: raw.detail });
  }
  return steps;
}

function parseSteps(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.min(99, Math.floor(value));
  }
  return 0;
}

export function parseAgentQuest(value: unknown): AgentQuest {
  const fallback = createAgentQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as AgentQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedAgent: onFlag(raw, 'openedAgent'),
    sawChatPlan: onFlag(raw, 'sawChatPlan'),
    loadedJob: parseJob(raw.loadedJob),
    goal: parseGoal(raw.goal),
    toolRead: onFlag(raw, 'toolRead'),
    toolWrite: onFlag(raw, 'toolWrite'),
    toolVerify: onFlag(raw, 'toolVerify'),
    toolChat: onFlag(raw, 'toolChat'),
    toolHours: onFlag(raw, 'toolHours'),
    successTest: parseSuccess(raw.successTest),
    stopRule: parseStop(raw.stopRule),
    boardPosted: onFlag(raw, 'boardPosted'),
    boardPolluted: onFlag(raw, 'boardPolluted'),
    inspectedBoard: onFlag(raw, 'inspectedBoard'),
    successStopped: onFlag(raw, 'successStopped'),
    missingStopped: onFlag(raw, 'missingStopped'),
    stoppedExtra: onFlag(raw, 'stoppedExtra'),
    stepsUsed: parseSteps(raw.stepsUsed),
    trace: parseTrace(raw.trace),
    agentReady: onFlag(raw, 'agentReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function neighborBoardText(quest: AgentQuest): string {
  if (!quest.boardPosted && !quest.boardPolluted) return BOARD_EMPTY;
  const slots = `${SLOT_IDS.sunday}، ${SLOT_IDS.monday}، ${SLOT_IDS.tuesday}`;
  if (quest.boardPolluted) {
    return quest.boardPosted ? `${slots}\n${LIVE_HOURS_TEXT}` : LIVE_HOURS_TEXT;
  }
  return slots;
}

export function toolsExact(quest: AgentQuest): boolean {
  return quest.toolRead && quest.toolWrite && quest.toolVerify && !quest.toolChat && !quest.toolHours;
}

function anyTool(quest: AgentQuest): boolean {
  return quest.toolRead || quest.toolWrite || quest.toolVerify || quest.toolChat || quest.toolHours;
}

export function fourPartPresent(quest: AgentQuest): boolean {
  return quest.goal !== null && anyTool(quest) && quest.successTest !== null && quest.stopRule !== null;
}

export function fieldsCorrect(quest: AgentQuest): boolean {
  return (
    quest.goal === 'post_slots' &&
    toolsExact(quest) &&
    quest.successTest === 'slots_posted' &&
    quest.stopRule === 'budget_3_or_missing'
  );
}

function traceHas(quest: AgentQuest, tool: AgentTraceStep['tool']): boolean {
  return quest.trace.some((step) => step.tool === tool);
}

export function canAward51(quest: AgentQuest, labReady: boolean): boolean {
  return (
    labReady &&
    quest.sawChatPlan &&
    traceHas(quest, 'read_slots') &&
    traceHas(quest, 'write_notice') &&
    traceHas(quest, 'verify_notice') &&
    quest.inspectedBoard &&
    quest.boardPosted &&
    !quest.boardPolluted
  );
}

export function canAward52(quest: AgentQuest, labReady: boolean): boolean {
  return labReady && fieldsCorrect(quest) && quest.successStopped && quest.missingStopped;
}

function syncPhase(quest: AgentQuest): AgentQuest {
  let phase: AgentQuest['phase'] = 'unstarted';
  if (quest.agentReady) phase = 'ready';
  else if (
    quest.openedAgent ||
    quest.sawChatPlan ||
    quest.boardPosted ||
    quest.successStopped ||
    quest.missingStopped ||
    quest.stoppedExtra
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

function allowedToolNames(quest: AgentQuest): Set<string> {
  const names = new Set<string>();
  if (quest.toolRead) names.add('read_slots');
  if (quest.toolWrite) names.add('write_notice');
  if (quest.toolVerify) names.add('verify_notice');
  if (quest.toolChat) names.add('chat_only');
  if (quest.toolHours) names.add('live_hours');
  return names;
}

export function awardAgentEvidence(state: GameState): GameState {
  const quest = syncPhase(state.agentQuest);
  const ready = state.labQuest.labReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had51 = evidence['5.1'] === 'demonstrated';
  const had52 = evidence['5.2'] === 'demonstrated';
  if (canAward51(quest, ready)) evidence['5.1'] = 'demonstrated';
  if (canAward52(quest, ready)) evidence['5.2'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (fieldsCorrect(quest) && !quest.agentReady) {
    events = recordEvent(events, 'job_configured');
  }
  if (evidence['5.1'] === 'demonstrated' && !had51) {
    nextQuest = { ...nextQuest, pendingExplain: 'chat_vs_agent' };
  }
  if (evidence['5.2'] === 'demonstrated' && !had52) {
    nextQuest = { ...nextQuest, pendingExplain: 'job_contract' };
  }
  if (
    evidence['5.1'] === 'demonstrated' &&
    evidence['5.2'] === 'demonstrated' &&
    nextQuest.stoppedExtra &&
    !nextQuest.agentReady
  ) {
    nextQuest = { ...nextQuest, agentReady: true, pendingExplain: 'runner_limits' };
    events = recordEvent(events, 'agent_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    agentQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: AgentQuest, extra: Partial<GameState> = {}): GameState {
  return awardAgentEvidence({ ...state, agentQuest: syncPhase(quest), ...extra });
}

function requireAgent(state: GameState): boolean {
  return state.labQuest.labReady && state.mode === 'agent';
}

export function openAgentConsole(state: GameState): GameState {
  if (!state.labQuest.labReady) return state;
  const quest: AgentQuest = { ...state.agentQuest, openedAgent: true, view: 'console' };
  const events = recordEvent(state.journalEvents, 'agent_opened');
  return withQuest({ ...state, mode: 'agent', shopFeedback: null, journalEvents: events }, quest);
}

export function openAgentBoard(state: GameState): GameState {
  if (!state.labQuest.labReady) return state;
  const quest: AgentQuest = {
    ...state.agentQuest,
    openedAgent: true,
    inspectedBoard: true,
    view: 'board',
  };
  const events = recordEvent(state.journalEvents, 'agent_opened');
  return withQuest({ ...state, mode: 'agent', shopFeedback: null, journalEvents: events }, quest);
}

export function reduceAgentChatPlan(state: GameState): GameState {
  if (!requireAgent(state)) return state;
  const quest: AgentQuest = { ...state.agentQuest, sawChatPlan: true };
  const events = recordEvent(state.journalEvents, 'chat_plan_seen');
  return withQuest(
    { ...state, journalEvents: events },
    quest,
    { shopFeedback: AGENT_FEEDBACK.chatPlan },
  );
}

export function reduceAgentLoadJob(state: GameState, job: AgentJob): GameState {
  if (!requireAgent(state)) return state;
  if (job !== 'slots' && job !== 'shelf') return state;
  return withQuest(state, { ...state.agentQuest, loadedJob: job }, { shopFeedback: null });
}

export function reduceAgentSetGoal(state: GameState, goal: AgentGoal): GameState {
  if (!requireAgent(state)) return state;
  if (goal !== 'post_slots' && goal !== 'chat_only' && goal !== 'live_hours') return state;
  return withQuest(state, { ...state.agentQuest, goal }, { shopFeedback: null });
}

export function reduceAgentToggleTool(state: GameState, tool: AgentToolId): GameState {
  if (!requireAgent(state)) return state;
  const quest = { ...state.agentQuest };
  if (tool === 'read') quest.toolRead = !quest.toolRead;
  else if (tool === 'write') quest.toolWrite = !quest.toolWrite;
  else if (tool === 'verify') quest.toolVerify = !quest.toolVerify;
  else if (tool === 'chat') quest.toolChat = !quest.toolChat;
  else if (tool === 'hours') quest.toolHours = !quest.toolHours;
  else return state;
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceAgentSetSuccess(state: GameState, test: AgentSuccessTest): GameState {
  if (!requireAgent(state)) return state;
  if (test !== 'slots_posted' && test !== 'robot_done' && test !== 'click_count') return state;
  return withQuest(state, { ...state.agentQuest, successTest: test }, { shopFeedback: null });
}

export function reduceAgentSetStop(state: GameState, rule: AgentStopRule): GameState {
  if (!requireAgent(state)) return state;
  if (rule !== 'budget_3_or_missing' && rule !== 'unlimited' && rule !== 'budget_1') return state;
  return withQuest(state, { ...state.agentQuest, stopRule: rule }, { shopFeedback: null });
}

function budgetOf(rule: AgentStopRule): number {
  if (rule === 'budget_1') return 1;
  if (rule === 'unlimited') return Number.POSITIVE_INFINITY;
  return 3;
}

function pushStep(
  quest: AgentQuest,
  phase: AgentTraceStep['phase'],
  tool: AgentTraceStep['tool'],
  detail: string,
): AgentQuest {
  return {
    ...quest,
    stepsUsed: quest.stepsUsed + 1,
    trace: [...quest.trace, { phase, tool, detail }],
  };
}

function runSlotsJob(quest: AgentQuest): { quest: AgentQuest; feedback: string } {
  const budget = budgetOf(quest.stopRule ?? 'budget_3_or_missing');
  let next = { ...quest, stepsUsed: 0, trace: [] as AgentTraceStep[] };

  if (next.stepsUsed + 1 > budget) {
    return { quest: next, feedback: AGENT_FEEDBACK.budget1 };
  }
  next = pushStep(next, 'راقب', 'read_slots', SLOT_LINE);
  if (next.stepsUsed >= budget && budget === 1) {
    return { quest: next, feedback: AGENT_FEEDBACK.budget1 };
  }

  if (next.stepsUsed + 1 > budget) {
    return { quest: next, feedback: AGENT_FEEDBACK.budget3 };
  }
  next = pushStep(next, 'نفّذ', 'write_notice', SLOT_LINE);
  next = {
    ...next,
    boardPosted: true,
    boardPolluted: false,
    inspectedBoard: false,
  };

  if (next.stepsUsed + 1 > budget) {
    return { quest: next, feedback: AGENT_FEEDBACK.budget3 };
  }
  next = pushStep(next, 'تحقق', 'verify_notice', SUCCESS_SLOTS_TEXT);
  next = { ...next, successStopped: true };
  return { quest: next, feedback: AGENT_FEEDBACK.successStop };
}

export function reduceAgentRun(state: GameState): GameState {
  if (!requireAgent(state)) return state;
  const quest = state.agentQuest;
  if (!fourPartPresent(quest) || quest.loadedJob === null) {
    return withQuest(state, quest, { shopFeedback: AGENT_FEEDBACK.missingConfig });
  }
  if (quest.goal !== 'post_slots') {
    return withQuest(state, quest, { shopFeedback: AGENT_FEEDBACK.wrongGoal });
  }
  if (!toolsExact(quest)) {
    return withQuest(state, quest, { shopFeedback: AGENT_FEEDBACK.wrongTools });
  }
  if (quest.successTest !== 'slots_posted') {
    return withQuest(state, quest, { shopFeedback: AGENT_FEEDBACK.wrongSuccess });
  }
  if (quest.loadedJob === 'shelf') {
    const next: AgentQuest = { ...quest, missingStopped: true };
    const events = recordEvent(state.journalEvents, 'missing_stopped');
    return withQuest(
      { ...state, journalEvents: events },
      next,
      { shopFeedback: AGENT_FEEDBACK.missingInput },
    );
  }
  const result = runSlotsJob(quest);
  let events = state.journalEvents;
  if (result.quest.boardPosted && !quest.boardPosted) {
    events = recordEvent(events, 'board_posted');
  }
  return withQuest({ ...state, journalEvents: events }, result.quest, {
    shopFeedback: result.feedback,
  });
}

export function reduceAgentExtraStep(state: GameState): GameState {
  if (!requireAgent(state)) return state;
  const quest = state.agentQuest;
  if (quest.stepsUsed < 3) {
    return withQuest(state, quest, { shopFeedback: AGENT_FEEDBACK.missingConfig });
  }
  const stop = quest.stopRule ?? 'budget_3_or_missing';
  const budget = budgetOf(stop);
  if (quest.stepsUsed + 1 > budget) {
    const next: AgentQuest = { ...quest, stoppedExtra: true };
    const events = recordEvent(state.journalEvents, 'extra_stopped');
    return withQuest(
      { ...state, journalEvents: events },
      next,
      { shopFeedback: AGENT_FEEDBACK.budget3 },
    );
  }
  const next: AgentQuest = {
    ...quest,
    stepsUsed: quest.stepsUsed + 1,
    boardPolluted: true,
    inspectedBoard: false,
    stoppedExtra: false,
    trace: [
      ...quest.trace,
      { phase: 'نفّذ', tool: 'write_notice', detail: LIVE_HOURS_TEXT },
    ],
  };
  return withQuest(state, next, { shopFeedback: AGENT_FEEDBACK.unlimitedExtra });
}

export function reduceAgentInvoke(state: GameState, tool: AgentInvokeTool): GameState {
  if (!requireAgent(state)) return state;
  const allowed = allowedToolNames(state.agentQuest);
  if (!allowed.has(tool)) {
    return withQuest(state, state.agentQuest, { shopFeedback: AGENT_FEEDBACK.permission });
  }
  return state;
}

export function reduceAgentRobotDone(state: GameState): GameState {
  if (!requireAgent(state)) return state;
  return withQuest(state, state.agentQuest, { shopFeedback: AGENT_FEEDBACK.robotDone });
}

export function isAgentOverlay(mode: GameState['mode']): boolean {
  return mode === 'agent';
}

export function isAgentExplain(topic: ExplainTopic | null): boolean {
  return topic === 'chat_vs_agent' || topic === 'job_contract' || topic === 'runner_limits';
}

export function closeAgentOverlay(state: GameState): GameState {
  const pending = state.agentQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      agentQuest: { ...state.agentQuest, pendingExplain: null },
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

export function skipAgentExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
