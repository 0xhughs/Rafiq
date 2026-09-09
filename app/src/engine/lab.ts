import { OBJECTIVES, recordEvent } from './dialogue';
import { API_PATH, SLOT_IDS } from './kiosk';
import type {
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  LabFilePath,
  LabLogId,
  LabPatchTarget,
  LabQuest,
  LabRefuseCommand,
  LabView,
} from './types';
import { LAB_PHASES } from './types';

export const LAB_BROKEN_PATH = 'GET /appointments/slot';
export const LAB_OK_PATH = API_PATH;

export const LAB_PATHS: readonly LabFilePath[] = [
  'preview/kiosk.js',
  'production/kiosk.js',
  'logs/preview.log',
  'logs/production.error',
  'notes/builder.warn',
];

export const PREVIEW_KIOSK_JS = `${LAB_OK_PATH}\n// preview/kiosk.js — معاينة الورشة`;
export const PROD_KIOSK_JS_BROKEN = `${LAB_BROKEN_PATH}\n// production/kiosk.js — نسخة العمل`;
export const PROD_KIOSK_JS_FIXED = `${LAB_OK_PATH}\n// production/kiosk.js — نسخة العمل`;
export const PREVIEW_LOG = `200 ${LAB_OK_PATH}`;
export const PROD_ERROR_LOG = `404 ${LAB_BROKEN_PATH} — المسار لا يطابق العقد ${LAB_OK_PATH}`;
export const DECOY_WARN = 'الجيران يرون المعاينة. لا تلمس الإنتاج.';

export const LAB_EXPLAIN = {
  debug_logs:
    'السجل ذو الصلة يشرح عطل الإنتاج. التخمين أو إصلاح ملف المعاينة لا يكفي.',
  frozen_publish:
    'النشر يجمّد نسخة. إصلاح المعاينة دون نشر يترك الإنتاج على النسخة القديمة.',
  shell_limits:
    'المختبر وهمي: أوامر القراءة مسموحة، والأوامر الهدّامة تُرفض دون حذف ملفات حقيقية.',
} as const;

export const LAB_FEEDBACK = {
  needLog: 'اختر السجل ذو الصلة أولاً',
  decoyFile: 'هذا الملف ليس مصدر العطل في الإنتاج',
  decoyLog: 'هذا السجل لا يشرح عطل الإنتاج',
  frozenWrong: 'النسخة المجمّدة ما زالت على المسار الخاطئ',
  prodDown: 'تعطل الإنتاج — راجع السجلات',
  refused: 'مرفوض: أمر خارج النطاق وخطر. المختبر وهمي ولا يحذف ملفات حقيقية.',
  unknown: 'أمر غير مسموح في المختبر الوهمي.',
  patched: 'أُصلح المسار في production/kiosk.js إلى /appointments/slots.',
  publishedV2: 'نُشرت نسخة ثابتة v2 من النسخة المصلحة.',
  robotDone: 'قول «تم» ليس قبولاً. أعد إنتاج العطل من الإنتاج وأصلح من السجل.',
  inspectOnly: 'فتح المختبر لا يكفي. أعد الإنتاج، اقرأ السجلات، أصلح، انشر، وتحقق.',
} as const;

export const LAB_OK200 = `200 ${LAB_OK_PATH} — ${SLOT_IDS.sunday}، ${SLOT_IDS.monday}، ${SLOT_IDS.tuesday}`;
export const LAB_NOT_FOUND = `404 ${LAB_BROKEN_PATH}`;

const PHASES = new Set<string>(LAB_PHASES);

export function createLabQuest(): LabQuest {
  return {
    phase: 'unstarted',
    openedLab: false,
    listedDir: false,
    readPreviewFile: false,
    readProdFile: false,
    readPreviewLog: false,
    readProdLog: false,
    readDecoy: false,
    selectedLog: null,
    reproducedBroken: false,
    fileRepaired: false,
    publishedVersion: 1,
    verifiedProd: false,
    refusedDestructive: false,
    labReady: false,
    pendingExplain: null,
    view: 'terminal',
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'debug_logs' || value === 'frozen_publish' || value === 'shell_limits') {
    return value;
  }
  return null;
}

function parseSelected(value: unknown): LabQuest['selectedLog'] {
  if (value === 'production.error' || value === 'preview.log' || value === 'builder.warn') {
    return value;
  }
  return null;
}

function parseView(value: unknown): LabView {
  if (value === 'prod') return 'prod';
  return 'terminal';
}

function parseVersion(value: unknown): 1 | 2 {
  if (value === 2 || value === '2') return 2;
  return 1;
}

export function parseLabQuest(value: unknown): LabQuest {
  const fallback = createLabQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as LabQuest['phase'])
      : fallback.phase;
  return {
    phase,
    openedLab: onFlag(raw, 'openedLab'),
    listedDir: onFlag(raw, 'listedDir'),
    readPreviewFile: onFlag(raw, 'readPreviewFile'),
    readProdFile: onFlag(raw, 'readProdFile'),
    readPreviewLog: onFlag(raw, 'readPreviewLog'),
    readProdLog: onFlag(raw, 'readProdLog'),
    readDecoy: onFlag(raw, 'readDecoy'),
    selectedLog: parseSelected(raw.selectedLog),
    reproducedBroken: onFlag(raw, 'reproducedBroken'),
    fileRepaired: onFlag(raw, 'fileRepaired'),
    publishedVersion: parseVersion(raw.publishedVersion),
    verifiedProd: onFlag(raw, 'verifiedProd'),
    refusedDestructive: onFlag(raw, 'refusedDestructive'),
    labReady: onFlag(raw, 'labReady'),
    pendingExplain: parsePending(raw.pendingExplain),
    view: parseView(raw.view),
  };
}

export function labFileContents(quest: LabQuest, path: LabFilePath): string {
  switch (path) {
    case 'preview/kiosk.js':
      return PREVIEW_KIOSK_JS;
    case 'production/kiosk.js':
      return quest.fileRepaired ? PROD_KIOSK_JS_FIXED : PROD_KIOSK_JS_BROKEN;
    case 'logs/preview.log':
      return PREVIEW_LOG;
    case 'logs/production.error':
      return PROD_ERROR_LOG;
    case 'notes/builder.warn':
      return DECOY_WARN;
  }
}

export function lsListing(): string {
  return LAB_PATHS.join('\n');
}

export function canAward45(quest: LabQuest, kioskReady: boolean): boolean {
  return (
    kioskReady &&
    quest.reproducedBroken &&
    quest.selectedLog === 'production.error' &&
    quest.fileRepaired
  );
}

export function canAward46(quest: LabQuest, kioskReady: boolean): boolean {
  return (
    kioskReady &&
    quest.readPreviewLog &&
    quest.readProdLog &&
    quest.publishedVersion === 2 &&
    quest.verifiedProd
  );
}

export function catDone(quest: LabQuest): boolean {
  return (
    quest.readPreviewFile ||
    quest.readProdFile ||
    quest.readPreviewLog ||
    quest.readProdLog ||
    quest.readDecoy
  );
}

export function canAward54(quest: LabQuest, kioskReady: boolean): boolean {
  return kioskReady && quest.listedDir && catDone(quest) && quest.refusedDestructive;
}

function syncPhase(quest: LabQuest): LabQuest {
  let phase: LabQuest['phase'] = 'unstarted';
  if (quest.labReady) phase = 'ready';
  else if (
    quest.openedLab ||
    quest.listedDir ||
    quest.reproducedBroken ||
    quest.fileRepaired ||
    quest.publishedVersion === 2 ||
    quest.refusedDestructive
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function labObjective(state: GameState): string {
  if (state.agentQuest?.agentReady) return OBJECTIVES.agentReady;
  if (state.labQuest.labReady) return OBJECTIVES.agentWork;
  if (state.kioskQuest.kioskReady) return OBJECTIVES.labWork;
  if (state.workshopQuest.servicePosted) return OBJECTIVES.kioskWork;
  return state.storyObjective;
}

export function awardLabEvidence(state: GameState): GameState {
  const quest = syncPhase(state.labQuest);
  const ready = state.kioskQuest.kioskReady;
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward45(quest, ready)) evidence['4.5'] = 'demonstrated';
  if (canAward46(quest, ready)) evidence['4.6'] = 'demonstrated';
  if (canAward54(quest, ready)) evidence['5.4'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (
    evidence['4.5'] === 'demonstrated' &&
    evidence['4.6'] === 'demonstrated' &&
    evidence['5.4'] === 'demonstrated' &&
    !quest.labReady
  ) {
    nextQuest = { ...quest, labReady: true };
    events = recordEvent(events, 'lab_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    labQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: labObjective(next),
  };
}

function withQuest(state: GameState, quest: LabQuest, extra: Partial<GameState> = {}): GameState {
  return awardLabEvidence({ ...state, labQuest: syncPhase(quest), ...extra });
}

function requireLab(state: GameState): boolean {
  return state.kioskQuest.kioskReady && state.mode === 'lab';
}

function markRead(quest: LabQuest, path: LabFilePath): LabQuest {
  const next = { ...quest };
  if (path === 'preview/kiosk.js') next.readPreviewFile = true;
  if (path === 'production/kiosk.js') next.readProdFile = true;
  if (path === 'logs/preview.log') next.readPreviewLog = true;
  if (path === 'logs/production.error') next.readProdLog = true;
  if (path === 'notes/builder.warn') next.readDecoy = true;
  return next;
}

export function openLabTerminal(state: GameState): GameState {
  if (!state.kioskQuest.kioskReady) return state;
  const quest: LabQuest = { ...state.labQuest, openedLab: true, view: 'terminal' };
  const events = recordEvent(state.journalEvents, 'lab_opened');
  return withQuest({ ...state, mode: 'lab', shopFeedback: null, journalEvents: events }, quest);
}

export function openLabProd(state: GameState): GameState {
  if (!state.kioskQuest.kioskReady) return state;
  const quest: LabQuest = { ...state.labQuest, openedLab: true, view: 'prod' };
  const events = recordEvent(state.journalEvents, 'lab_opened');
  return withQuest({ ...state, mode: 'lab', shopFeedback: null, journalEvents: events }, quest);
}

export function reduceLabLs(state: GameState): GameState {
  if (!requireLab(state)) return state;
  let quest: LabQuest = { ...state.labQuest, listedDir: true };
  const ready = state.kioskQuest.kioskReady;
  if (canAward54(quest, ready) && !canAward54(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'shell_limits' };
  }
  return withQuest(state, quest, { shopFeedback: lsListing() });
}

export function reduceLabCat(state: GameState, path: LabFilePath): GameState {
  if (!requireLab(state)) return state;
  if (!LAB_PATHS.includes(path)) return state;
  let quest = markRead(state.labQuest, path);
  const ready = state.kioskQuest.kioskReady;
  if (canAward54(quest, ready) && !canAward54(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'shell_limits' };
  }
  if (canAward46(quest, ready) && !canAward46(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'frozen_publish' };
  }
  return withQuest(state, quest, { shopFeedback: labFileContents(quest, path) });
}

export function reduceLabSelectLog(state: GameState, log: LabLogId): GameState {
  if (!requireLab(state)) return state;
  if (log !== 'production.error' && log !== 'preview.log' && log !== 'builder.warn') {
    return state;
  }
  let quest: LabQuest = { ...state.labQuest, selectedLog: log };
  let events = state.journalEvents;
  let feedback: string = LAB_FEEDBACK.decoyLog;
  if (log === 'production.error') {
    quest = { ...quest, readProdLog: true };
    events = recordEvent(events, 'log_selected');
    feedback = labFileContents(quest, 'logs/production.error');
  } else if (log === 'preview.log') {
    quest = { ...quest, readPreviewLog: true };
  } else {
    quest = { ...quest, readDecoy: true };
  }
  const ready = state.kioskQuest.kioskReady;
  if (canAward46(quest, ready) && !canAward46(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'frozen_publish' };
  }
  if (canAward54(quest, ready) && !canAward54(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'shell_limits' };
  }
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: feedback });
}

export function reduceLabPatch(state: GameState, file: LabPatchTarget): GameState {
  if (!requireLab(state)) return state;
  if (file === 'preview/kiosk.js' || file === 'notes/builder.warn') {
    return withQuest(state, state.labQuest, { shopFeedback: LAB_FEEDBACK.decoyFile });
  }
  if (file !== 'production/kiosk.js') return state;
  if (state.labQuest.selectedLog !== 'production.error') {
    return withQuest(state, state.labQuest, { shopFeedback: LAB_FEEDBACK.needLog });
  }
  let quest: LabQuest = { ...state.labQuest, fileRepaired: true };
  const ready = state.kioskQuest.kioskReady;
  if (canAward45(quest, ready)) quest = { ...quest, pendingExplain: 'debug_logs' };
  return withQuest(state, quest, { shopFeedback: LAB_FEEDBACK.patched });
}

export function reduceLabPublish(state: GameState): GameState {
  if (!requireLab(state)) return state;
  if (!state.labQuest.fileRepaired) {
    return withQuest(state, state.labQuest, { shopFeedback: LAB_FEEDBACK.frozenWrong });
  }
  let quest: LabQuest = { ...state.labQuest, publishedVersion: 2 };
  const events = recordEvent(state.journalEvents, 'frozen_published');
  const ready = state.kioskQuest.kioskReady;
  if (canAward46(quest, ready) && !canAward46(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'frozen_publish' };
  }
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: LAB_FEEDBACK.publishedV2 });
}

export function reduceLabLookup(state: GameState): GameState {
  if (!requireLab(state)) return state;
  if (state.labQuest.publishedVersion === 2) {
    let quest: LabQuest = { ...state.labQuest, verifiedProd: true };
    const ready = state.kioskQuest.kioskReady;
    if (canAward46(quest, ready)) quest = { ...quest, pendingExplain: 'frozen_publish' };
    return withQuest(state, quest, { shopFeedback: LAB_OK200 });
  }
  let quest: LabQuest = { ...state.labQuest, reproducedBroken: true };
  const events = recordEvent(state.journalEvents, 'prod_reproduced');
  const ready = state.kioskQuest.kioskReady;
  if (canAward45(quest, ready) && !canAward45(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'debug_logs' };
  }
  const feedback = `${LAB_NOT_FOUND}\n${LAB_FEEDBACK.prodDown}`;
  return withQuest({ ...state, journalEvents: events }, quest, { shopFeedback: feedback });
}

export function reduceLabRefuse(state: GameState, command: LabRefuseCommand): GameState {
  if (!requireLab(state)) return state;
  if (command !== 'rm -rf /' && command !== 'format-disk') return state;
  const snapshot = {
    fileRepaired: state.labQuest.fileRepaired,
    publishedVersion: state.labQuest.publishedVersion,
    readPreviewFile: state.labQuest.readPreviewFile,
    readProdFile: state.labQuest.readProdFile,
    readPreviewLog: state.labQuest.readPreviewLog,
    readProdLog: state.labQuest.readProdLog,
    readDecoy: state.labQuest.readDecoy,
  };
  let quest: LabQuest = { ...state.labQuest, refusedDestructive: true, ...snapshot };
  const ready = state.kioskQuest.kioskReady;
  if (canAward54(quest, ready) && !canAward54(state.labQuest, ready)) {
    quest = { ...quest, pendingExplain: 'shell_limits' };
  }
  return withQuest(state, quest, { shopFeedback: LAB_FEEDBACK.refused });
}

export function reduceLabRobotDone(state: GameState): GameState {
  if (!requireLab(state)) return state;
  return withQuest(state, state.labQuest, { shopFeedback: LAB_FEEDBACK.robotDone });
}

const CAT_PREFIX = 'cat ';

export function reduceLabCmd(state: GameState, text: string): GameState {
  if (!requireLab(state)) return state;
  const cmd = text.trim();
  if (cmd === 'ls') return reduceLabLs(state);
  if (cmd === 'rm -rf /') return reduceLabRefuse(state, 'rm -rf /');
  if (cmd === 'format-disk') return reduceLabRefuse(state, 'format-disk');
  if (cmd.startsWith(CAT_PREFIX)) {
    const path = cmd.slice(CAT_PREFIX.length).trim() as LabFilePath;
    if ((LAB_PATHS as readonly string[]).includes(path)) {
      return reduceLabCat(state, path);
    }
  }
  return withQuest(state, state.labQuest, { shopFeedback: LAB_FEEDBACK.unknown });
}

export function isLabOverlay(mode: GameState['mode']): boolean {
  return mode === 'lab';
}

export function isLabExplain(topic: ExplainTopic | null): boolean {
  return topic === 'debug_logs' || topic === 'frozen_publish' || topic === 'shell_limits';
}

export function closeLabOverlay(state: GameState): GameState {
  const pending = state.labQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      labQuest: { ...state.labQuest, pendingExplain: null },
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

export function skipLabExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: labObjective(state),
  };
}
