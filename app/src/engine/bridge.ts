import { recordEvent } from './dialogue';
import { labObjective } from './lab';
import type {
  BridgeGrantId,
  BridgeQuest,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
} from './types';
import { BRIDGE_PHASES } from './types';

export const BRIDGE_HOST = 'rafiq-host';
export const BRIDGE_CLIENT = 'civic-client';
export const BRIDGE_SERVER = 'civic-hours.rafiq';
export const TOOL_LOOKUP = 'lookup_hours';
export const TOOL_SAVE = 'save_draft';
export const TOOL_REWRITE = 'rewrite_registry';
export const TOOL_PAY = 'pay_fees';
export const RESOURCE_WEEK = 'hours://neighborhood/week';
export const RESOURCE_PAYROLL = 'hours://city/payroll';
export const RECORD_NH = 'NH-1447';
export const HOUR_SAT = 'sat-10';
export const HOUR_SUN = 'sun-16';
export const HOUR_WED = 'wed-18';
export const DRAFT_EMPTY = 'المسودة فارغة';
export const DRAFT_SAVED = `مسودة إعلان القاعة: ${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}`;
export const BROWSER_TITLE = 'سجل ساعات قاعة الحي';
export const BROWSER_PATH = 'civic-hours.rafiq/hours';
export const MCP_NOTE =
  'MCP يربط تطبيقاً بخادم قدرات عبر عميل. هذه محاكاة داخل اللعبة، لا بروتوكول حي. MCP ليس مهارة ولا يمنح كل الأدوات.';

export const BRIDGE_TOOLS = [TOOL_LOOKUP, TOOL_SAVE, TOOL_REWRITE] as const;
export const BRIDGE_RESOURCES = [RESOURCE_WEEK, RESOURCE_PAYROLL] as const;

export const BRIDGE_EXPLAIN = {
  connector_roles:
    'MCP يربط تطبيقاً بخادم قدرات عبر عميل. المضيف والعميل والخادم علاقة ظاهرة، وهذه محاكاة داخل اللعبة لا بروتوكول حي.',
  limited_grant:
    'MCP يربط قدرات محدودة ولا يمنح سلطة شاملة. الأداة غير المسموحة تُرفض، والقدرة الغائبة ليست على الخادم.',
  browser_vs_connector:
    'المتصفح يعرض الصفحة للقراءة. الحفظ يتم بأداة save_draft عبر الموصل. MCP ليس مهارة تُحمَّل.',
} as const;

export const BRIDGE_FEEDBACK = {
  notConnected: 'اربط المضيف بالخادم عبر العميل أولاً.',
  notListed: 'اعرض أدوات الخادم وموارده قبل التفويض.',
  wrongGrant: `اسمح فقط بـ ${TOOL_LOOKUP} و ${TOOL_SAVE} ومورد ${RESOURCE_WEEK}.`,
  grantAll: 'MCP يربط قدرات محدودة ولا يمنح سلطة شاملة.',
  payroll: `السجل المسموح: ${RECORD_NH} من ${RESOURCE_WEEK} فقط.`,
  saveWithoutLookup: `احفظ المسودة بعد البحث في ${RECORD_NH}.`,
  robotDone: 'قول «تم» ليس قبولاً. ابحث عبر الموصل ثم احفظ المسودة.',
  deniedRewrite: `مرفوض: الأداة ${TOOL_REWRITE} غير مسموحة في الموصل.`,
  missingPay: `لا توجد هذه القدرة على الخادم: ${TOOL_PAY}`,
  loadSkill: 'MCP ليس مهارة تُحمَّل. هو جسر بين تطبيق وخادم.',
  browserSave: 'المتصفح يعرض الصفحة. الحفظ يتم بأداة save_draft عبر الموصل.',
} as const;

const PHASES = new Set<string>(BRIDGE_PHASES);

export function createBridgeQuest(): BridgeQuest {
  return {
    phase: 'unstarted',
    openedHost: false,
    openedBrowser: false,
    connected: false,
    listedTools: false,
    listedResources: false,
    grantLookup: false,
    grantDraft: false,
    grantWeek: false,
    grantRewrite: false,
    grantPayroll: false,
    grantAll: false,
    lookedUp: false,
    draftSaved: false,
    inspectedDraft: false,
    deniedRewrite: false,
    missingPay: false,
    browserSeen: false,
    browserSaveFailed: false,
    bridgeReady: false,
    pendingExplain: null,
    view: 'host',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'connector_roles' || value === 'limited_grant' || value === 'browser_vs_connector') {
    return value;
  }
  return null;
}

function parseView(value: unknown): BridgeQuest['view'] {
  if (value === 'browser') return 'browser';
  return 'host';
}

export function parseBridgeQuest(value: unknown): BridgeQuest {
  const fallback = createBridgeQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as BridgeQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedHost: onFlag(raw, 'openedHost'),
    openedBrowser: onFlag(raw, 'openedBrowser'),
    connected: onFlag(raw, 'connected'),
    listedTools: onFlag(raw, 'listedTools'),
    listedResources: onFlag(raw, 'listedResources'),
    grantLookup: onFlag(raw, 'grantLookup'),
    grantDraft: onFlag(raw, 'grantDraft'),
    grantWeek: onFlag(raw, 'grantWeek'),
    grantRewrite: onFlag(raw, 'grantRewrite'),
    grantPayroll: onFlag(raw, 'grantPayroll'),
    grantAll: onFlag(raw, 'grantAll'),
    lookedUp: onFlag(raw, 'lookedUp'),
    draftSaved: onFlag(raw, 'draftSaved'),
    inspectedDraft: onFlag(raw, 'inspectedDraft'),
    deniedRewrite: onFlag(raw, 'deniedRewrite'),
    missingPay: onFlag(raw, 'missingPay'),
    browserSeen: onFlag(raw, 'browserSeen'),
    browserSaveFailed: onFlag(raw, 'browserSaveFailed'),
    bridgeReady: onFlag(raw, 'bridgeReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function bridgeDraftText(quest: BridgeQuest): string {
  return quest.draftSaved ? DRAFT_SAVED : DRAFT_EMPTY;
}

export function grantLimited(quest: BridgeQuest): boolean {
  return (
    quest.grantLookup &&
    quest.grantDraft &&
    quest.grantWeek &&
    !quest.grantRewrite &&
    !quest.grantPayroll &&
    !quest.grantAll
  );
}

export function canAward53(quest: BridgeQuest, agentReady: boolean): boolean {
  const draft = bridgeDraftText(quest);
  return (
    agentReady &&
    quest.connected &&
    quest.listedTools &&
    quest.listedResources &&
    grantLimited(quest) &&
    quest.lookedUp &&
    quest.draftSaved &&
    quest.inspectedDraft &&
    draft.includes(HOUR_SAT) &&
    draft.includes(HOUR_SUN) &&
    draft.includes(HOUR_WED)
  );
}

export function mcpComplete(quest: BridgeQuest): boolean {
  return (
    quest.connected &&
    quest.listedTools &&
    quest.listedResources &&
    grantLimited(quest) &&
    quest.deniedRewrite &&
    quest.missingPay
  );
}

export function canCloseBridge(quest: BridgeQuest, agentReady: boolean): boolean {
  return (
    canAward53(quest, agentReady) &&
    mcpComplete(quest) &&
    quest.browserSeen &&
    quest.browserSaveFailed
  );
}

function syncPhase(quest: BridgeQuest): BridgeQuest {
  let phase: BridgeQuest['phase'] = 'unstarted';
  if (quest.bridgeReady) phase = 'ready';
  else if (
    quest.openedHost ||
    quest.openedBrowser ||
    quest.connected ||
    quest.lookedUp ||
    quest.draftSaved
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function awardBridgeEvidence(state: GameState): GameState {
  const quest = syncPhase(state.bridgeQuest);
  const ready = state.agentQuest.agentReady;
  const evidence: EvidenceMap = { ...state.evidence };
  const had53 = evidence['5.3'] === 'demonstrated';
  if (canAward53(quest, ready)) evidence['5.3'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (grantLimited(quest)) {
    events = recordEvent(events, 'grant_limited');
  }
  if (evidence['5.3'] === 'demonstrated' && !had53) {
    nextQuest = { ...nextQuest, pendingExplain: 'connector_roles' };
  }
  if (mcpComplete(nextQuest) && nextQuest.pendingExplain !== 'browser_vs_connector') {
    if (!nextQuest.bridgeReady) {
      nextQuest = { ...nextQuest, pendingExplain: 'limited_grant' };
    }
  }
  if (canCloseBridge(nextQuest, ready) && !nextQuest.bridgeReady) {
    nextQuest = { ...nextQuest, bridgeReady: true, pendingExplain: 'browser_vs_connector' };
    events = recordEvent(events, 'bridge_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    bridgeQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: BridgeQuest, extra: Partial<GameState> = {}): GameState {
  return awardBridgeEvidence({ ...state, bridgeQuest: syncPhase(quest), ...extra });
}

function requireBridge(state: GameState): boolean {
  return state.agentQuest.agentReady && state.mode === 'bridge';
}

export function openBridgeHost(state: GameState): GameState {
  if (!state.agentQuest.agentReady) return state;
  const quest: BridgeQuest = {
    ...state.bridgeQuest,
    openedHost: true,
    view: 'host',
    inspectedDraft: state.bridgeQuest.draftSaved ? true : state.bridgeQuest.inspectedDraft,
  };
  const events = recordEvent(state.journalEvents, 'bridge_opened');
  return withQuest({ ...state, mode: 'bridge', shopFeedback: null, journalEvents: events }, quest);
}

export function openBridgeBrowser(state: GameState): GameState {
  if (!state.agentQuest.agentReady) return state;
  const quest: BridgeQuest = {
    ...state.bridgeQuest,
    openedBrowser: true,
    browserSeen: true,
    view: 'browser',
  };
  const events = recordEvent(state.journalEvents, 'bridge_opened');
  return withQuest({ ...state, mode: 'bridge', shopFeedback: null, journalEvents: events }, quest);
}

export function reduceBridgeConnect(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const quest: BridgeQuest = { ...state.bridgeQuest, connected: true, view: 'host' };
  const events = recordEvent(state.journalEvents, 'server_connected');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceBridgeListTools(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const quest: BridgeQuest = { ...state.bridgeQuest, listedTools: true, view: 'host' };
  const events = recordEvent(state.journalEvents, 'tools_listed');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceBridgeListResources(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const quest: BridgeQuest = { ...state.bridgeQuest, listedResources: true, view: 'host' };
  return withQuest(state, quest, { shopFeedback: null });
}

function gateLookupOrSave(state: GameState): string | null {
  const quest = state.bridgeQuest;
  if (!quest.connected) return BRIDGE_FEEDBACK.notConnected;
  if (!quest.listedTools || !quest.listedResources) return BRIDGE_FEEDBACK.notListed;
  if (quest.grantAll) return BRIDGE_FEEDBACK.grantAll;
  if (!grantLimited(quest)) return BRIDGE_FEEDBACK.wrongGrant;
  return null;
}

export function reduceBridgeGrant(state: GameState, grant: BridgeGrantId): GameState {
  if (!requireBridge(state)) return state;
  if (grant === 'all') {
    if (!state.bridgeQuest.connected) {
      return withQuest(state, state.bridgeQuest, { shopFeedback: BRIDGE_FEEDBACK.notConnected });
    }
    const quest: BridgeQuest = {
      ...state.bridgeQuest,
      grantAll: true,
      grantLookup: true,
      grantDraft: true,
      grantWeek: true,
      grantRewrite: true,
      grantPayroll: true,
      view: 'host',
    };
    return withQuest(state, quest, { shopFeedback: BRIDGE_FEEDBACK.grantAll });
  }
  const quest: BridgeQuest = { ...state.bridgeQuest, grantAll: false, view: 'host' };
  if (grant === 'lookup') quest.grantLookup = !quest.grantLookup;
  else if (grant === 'draft') quest.grantDraft = !quest.grantDraft;
  else if (grant === 'week') quest.grantWeek = !quest.grantWeek;
  else if (grant === 'rewrite') quest.grantRewrite = !quest.grantRewrite;
  else if (grant === 'payroll') quest.grantPayroll = !quest.grantPayroll;
  else return state;
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceBridgeLookup(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const blocked = gateLookupOrSave(state);
  if (blocked) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, { shopFeedback: blocked });
  }
  const quest: BridgeQuest = { ...state.bridgeQuest, lookedUp: true, view: 'host' };
  const events = recordEvent(state.journalEvents, 'civic_lookup');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceBridgeLookupPayroll(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const blocked = gateLookupOrSave(state);
  if (blocked) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, { shopFeedback: blocked });
  }
  return withQuest(state, { ...state.bridgeQuest, view: 'host' }, { shopFeedback: BRIDGE_FEEDBACK.payroll });
}

export function reduceBridgeSaveDraft(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const blocked = gateLookupOrSave(state);
  if (blocked) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, { shopFeedback: blocked });
  }
  if (!state.bridgeQuest.lookedUp) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, {
      shopFeedback: BRIDGE_FEEDBACK.saveWithoutLookup,
    });
  }
  const quest: BridgeQuest = {
    ...state.bridgeQuest,
    draftSaved: true,
    inspectedDraft: true,
    view: 'host',
  };
  const events = recordEvent(state.journalEvents, 'draft_saved');
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: null });
}

export function reduceBridgeInvokeRewrite(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  if (!state.bridgeQuest.connected) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, {
      shopFeedback: BRIDGE_FEEDBACK.notConnected,
    });
  }
  if (!grantLimited(state.bridgeQuest) || state.bridgeQuest.grantRewrite) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, {
      shopFeedback: BRIDGE_FEEDBACK.wrongGrant,
    });
  }
  const quest: BridgeQuest = { ...state.bridgeQuest, deniedRewrite: true, view: 'host' };
  const events = recordEvent(state.journalEvents, 'capability_denied');
  return withQuest({ ...state, journalEvents: events }, quest, {
    shopFeedback: BRIDGE_FEEDBACK.deniedRewrite,
  });
}

export function reduceBridgeInvokePay(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const quest: BridgeQuest = { ...state.bridgeQuest, missingPay: true, view: 'host' };
  return withQuest(state, quest, { shopFeedback: BRIDGE_FEEDBACK.missingPay });
}

export function reduceBridgeLoadSkill(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  if (!state.bridgeQuest.connected) {
    return withQuest(state, { ...state.bridgeQuest, view: 'host' }, {
      shopFeedback: BRIDGE_FEEDBACK.notConnected,
    });
  }
  return withQuest(state, { ...state.bridgeQuest, view: 'host' }, {
    shopFeedback: BRIDGE_FEEDBACK.loadSkill,
  });
}

export function reduceBridgeRobotDone(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  return withQuest(state, state.bridgeQuest, { shopFeedback: BRIDGE_FEEDBACK.robotDone });
}

export function reduceBridgeBrowserSave(state: GameState): GameState {
  if (!requireBridge(state)) return state;
  const quest: BridgeQuest = {
    ...state.bridgeQuest,
    openedBrowser: true,
    browserSeen: true,
    browserSaveFailed: true,
    view: 'browser',
  };
  return withQuest(state, quest, { shopFeedback: BRIDGE_FEEDBACK.browserSave });
}

export function isBridgeOverlay(mode: GameState['mode']): boolean {
  return mode === 'bridge';
}

export function isBridgeExplain(topic: ExplainTopic | null): boolean {
  return topic === 'connector_roles' || topic === 'limited_grant' || topic === 'browser_vs_connector';
}

export function closeBridgeOverlay(state: GameState): GameState {
  const pending = state.bridgeQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      bridgeQuest: { ...state.bridgeQuest, pendingExplain: null },
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

export function skipBridgeExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
