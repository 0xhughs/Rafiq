import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  AppointmentSlot,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  KioskCheckItem,
  KioskQuest,
} from './types';
import { KIOSK_PHASES } from './types';

export const DEMO_SLOT_KEY = 'demo-slot-key';
export const API_PATH = 'GET /appointments/slots';
export const API_HEADER = 'x-api-key';

export const SLOT_IDS: Record<AppointmentSlot, string> = {
  sunday: 'sun-pm',
  monday: 'mon-am',
  tuesday: 'tue-pm',
};

export const SLOT_ID_LABELS: Record<AppointmentSlot, string> = {
  sunday: 'slot-id: sun-pm',
  monday: 'slot-id: mon-am',
  tuesday: 'slot-id: tue-pm',
};

export const DOCS_TEXT = [
  'ورقة عقد الواجهة — وهمي',
  API_PATH,
  `رأس الطلب: ${API_HEADER}`,
  `شارك المسار واسم الرأس فقط. القيمة الوهمية ${DEMO_SLOT_KEY} تبقى في خزنة الخادم (وهمي — ليست مفتاحاً حقيقياً).`,
  'لا تضع المفتاح على وجه الكiosk.',
].join('\n');

export const KIOSK_TITLE = 'احجز موعد المعاينة';

export const CHECKLIST = {
  title: 'العنوان من اليمين',
  slot: 'مقطع slot-id يبقى لاتينياً',
  lookup: 'طلب الفترة يظهر التأكيد',
} as const;

export const KIOSK_EXPLAIN = {
  api_contract:
    'شارك مسار الواجهة واسم الرأس. القيمة الوهمية تبقى في الخزنة، لا على شاشة العميل.',
  arabic_rtl:
    'واجهة عربية تُقرأ من اليمين، والمقطع اللاتيني slot-id يبقى لاتينياً داخل span معزول. الاختبار اليدوي مطلوب.',
} as const;

export const KIOSK_FEEDBACK = {
  exposure: 'لا تضع المفتاح على الشاشة. انقله إلى الخزنة ثم أعد الإرسال.',
  missing: 'المفتاح غير موجود',
  ok200: '200 — الفترات الثلاث: sun-pm، mon-am، tue-pm.',
  inspectDocs: 'اقرأ ورقة عقد الواجهة أولاً.',
  inspectOnly: 'قراءة الورق لا تكفي. أظهر غياب المفتاح وتعريضه ثم أرسل طلباً صحيحاً.',
  robotDone: 'قول «تم» ليس قبولاً. أصلح الواجهة واختبر الحجز بنفسك.',
  fixRtl: 'أصلح اتجاه الواجهة أولاً',
  vaultEmpty: 'الخزنة فارغة.',
  vaultHas: `${DEMO_SLOT_KEY} (وهمي)`,
} as const;

const PHASES = new Set<string>(KIOSK_PHASES);

export function createKioskQuest(): KioskQuest {
  return {
    phase: 'unstarted',
    inspectedDocs: false,
    faceHasKey: false,
    vaultHasKey: false,
    sawMissingKey: false,
    sawExposure: false,
    requestOk: false,
    openedBroken: false,
    layoutRtl: false,
    slotIdLtr: false,
    lookupDone: false,
    manualTitleRtl: false,
    manualSlotLtr: false,
    manualLookup: false,
    kioskReady: false,
    pendingExplain: null,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (value === 'api_contract' || value === 'arabic_rtl') return value;
  return null;
}

export function parseKioskQuest(value: unknown): KioskQuest {
  const fallback = createKioskQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as KioskQuest['phase'])
      : fallback.phase;
  return {
    phase,
    inspectedDocs: onFlag(raw, 'inspectedDocs'),
    faceHasKey: onFlag(raw, 'faceHasKey'),
    vaultHasKey: onFlag(raw, 'vaultHasKey'),
    sawMissingKey: onFlag(raw, 'sawMissingKey'),
    sawExposure: onFlag(raw, 'sawExposure'),
    requestOk: onFlag(raw, 'requestOk'),
    openedBroken: onFlag(raw, 'openedBroken'),
    layoutRtl: onFlag(raw, 'layoutRtl'),
    slotIdLtr: onFlag(raw, 'slotIdLtr'),
    lookupDone: onFlag(raw, 'lookupDone'),
    manualTitleRtl: onFlag(raw, 'manualTitleRtl'),
    manualSlotLtr: onFlag(raw, 'manualSlotLtr'),
    manualLookup: onFlag(raw, 'manualLookup'),
    kioskReady: onFlag(raw, 'kioskReady'),
    pendingExplain: parsePending(raw.pendingExplain),
  };
}

export function faceLeaking(state: GameState): boolean {
  const quest = state.kioskQuest;
  if (quest.faceHasKey) return true;
  if (
    state.workshopQuest.servicePosted &&
    !quest.kioskReady &&
    !quest.openedBroken
  ) {
    return true;
  }
  return false;
}

export function canAward43(quest: KioskQuest): boolean {
  return (
    quest.inspectedDocs &&
    quest.sawMissingKey &&
    quest.sawExposure &&
    quest.vaultHasKey &&
    !quest.faceHasKey &&
    quest.requestOk
  );
}

export function canAward44(quest: KioskQuest): boolean {
  return (
    quest.openedBroken &&
    quest.layoutRtl &&
    quest.slotIdLtr &&
    quest.lookupDone &&
    quest.manualTitleRtl &&
    quest.manualSlotLtr &&
    quest.manualLookup
  );
}

function syncPhase(quest: KioskQuest): KioskQuest {
  let phase: KioskQuest['phase'] = 'unstarted';
  if (quest.kioskReady) phase = 'ready';
  else if (
    quest.inspectedDocs ||
    quest.openedBroken ||
    quest.vaultHasKey ||
    quest.sawMissingKey ||
    quest.sawExposure ||
    quest.requestOk ||
    quest.layoutRtl
  ) {
    phase = 'working';
  }
  return { ...quest, phase };
}

export function kioskObjective(state: GameState): string {
  if (state.agentQuest?.agentReady) return OBJECTIVES.agentReady;
  if (state.labQuest.labReady) return OBJECTIVES.agentWork;
  if (state.kioskQuest.kioskReady) return OBJECTIVES.labWork;
  if (state.workshopQuest.servicePosted) return OBJECTIVES.kioskWork;
  return state.storyObjective;
}

export function awardKioskEvidence(state: GameState): GameState {
  const quest = syncPhase(state.kioskQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward43(quest)) evidence['4.3'] = 'demonstrated';
  if (canAward44(quest)) evidence['4.4'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  let nextQuest = quest;
  if (evidence['4.3'] === 'demonstrated') {
    events = recordEvent(events, 'api_wired');
  }
  if (evidence['4.3'] === 'demonstrated' && evidence['4.4'] === 'demonstrated' && !quest.kioskReady) {
    nextQuest = { ...quest, kioskReady: true };
    events = recordEvent(events, 'kiosk_ready');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    kioskQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: kioskObjective(next),
  };
}

function withQuest(state: GameState, quest: KioskQuest, extra: Partial<GameState> = {}): GameState {
  return awardKioskEvidence({ ...state, kioskQuest: syncPhase(quest), ...extra });
}

function materializePostedFace(state: GameState, quest: KioskQuest): KioskQuest {
  if (!state.workshopQuest.servicePosted || quest.kioskReady) return quest;
  if (!quest.openedBroken) {
    return { ...quest, faceHasKey: true };
  }
  return quest;
}

export function inspectKioskDocs(state: GameState): GameState {
  if (!state.workshopQuest.servicePosted) return state;
  const quest = { ...state.kioskQuest, inspectedDocs: true };
  return withQuest(
    { ...state, mode: 'inspect', inspectTarget: 'kiosk_docs', shopFeedback: null },
    quest,
  );
}

export function inspectKioskVault(state: GameState): GameState {
  if (!state.workshopQuest.servicePosted) return state;
  return withQuest(
    { ...state, mode: 'inspect', inspectTarget: 'kiosk_vault', shopFeedback: null },
    state.kioskQuest,
  );
}

export function openKiosk(state: GameState): GameState {
  if (!state.workshopQuest.servicePosted) return state;
  let quest = materializePostedFace(state, { ...state.kioskQuest });
  quest = { ...quest, openedBroken: true };
  const events = recordEvent(state.journalEvents, 'kiosk_opened');
  return withQuest({ ...state, mode: 'kiosk', shopFeedback: null, journalEvents: events }, quest);
}

export function reduceKioskStrip(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(state, { ...state.kioskQuest, faceHasKey: false }, { shopFeedback: null });
}

export function reduceKioskEmbed(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(state, { ...state.kioskQuest, faceHasKey: true }, { shopFeedback: null });
}

export function reduceKioskVaultPut(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'kiosk_vault') {
    if (state.mode !== 'kiosk') return state;
  }
  return withQuest(state, { ...state.kioskQuest, vaultHasKey: true }, { shopFeedback: null });
}

export function reduceKioskVaultEmpty(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'kiosk_vault') {
    if (state.mode !== 'kiosk') return state;
  }
  return withQuest(state, { ...state.kioskQuest, vaultHasKey: false }, { shopFeedback: null });
}

export function reduceKioskMoveVault(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(
    state,
    { ...state.kioskQuest, vaultHasKey: true, faceHasKey: false },
    { shopFeedback: null },
  );
}

export function reduceKioskSend(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  const quest = materializePostedFace(state, { ...state.kioskQuest });
  if (quest.faceHasKey) {
    return withQuest(
      state,
      { ...quest, sawExposure: true },
      { shopFeedback: KIOSK_FEEDBACK.exposure },
    );
  }
  if (!quest.vaultHasKey) {
    return withQuest(
      state,
      { ...quest, sawMissingKey: true },
      { shopFeedback: KIOSK_FEEDBACK.missing },
    );
  }
  const next: KioskQuest = { ...quest, requestOk: true };
  if (canAward43(next)) next.pendingExplain = 'api_contract';
  return withQuest(state, next, { shopFeedback: KIOSK_FEEDBACK.ok200 });
}

export function reduceKioskSetRtl(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(state, { ...state.kioskQuest, layoutRtl: true }, { shopFeedback: null });
}

export function reduceKioskIsolate(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(state, { ...state.kioskQuest, slotIdLtr: true }, { shopFeedback: null });
}

export function lookupConfirm(slot: AppointmentSlot): string {
  return `تم طلب الفترة ${SLOT_ID_LABELS[slot]}`;
}

export function reduceKioskLookup(state: GameState, slot: AppointmentSlot): GameState {
  if (state.mode !== 'kiosk') return state;
  if (slot !== 'sunday' && slot !== 'monday' && slot !== 'tuesday') return state;
  if (!state.kioskQuest.layoutRtl) {
    return withQuest(state, state.kioskQuest, { shopFeedback: KIOSK_FEEDBACK.fixRtl });
  }
  const quest: KioskQuest = { ...state.kioskQuest, lookupDone: true };
  if (canAward44(quest)) quest.pendingExplain = 'arabic_rtl';
  return withQuest(state, quest, { shopFeedback: lookupConfirm(slot) });
}

export function reduceKioskCheck(state: GameState, item: KioskCheckItem): GameState {
  if (state.mode !== 'kiosk') return state;
  const quest: KioskQuest = { ...state.kioskQuest };
  if (item === 'title') quest.manualTitleRtl = true;
  if (item === 'slot') quest.manualSlotLtr = true;
  if (item === 'lookup') quest.manualLookup = true;
  if (canAward44(quest)) quest.pendingExplain = 'arabic_rtl';
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceKioskRobotDone(state: GameState): GameState {
  if (state.mode !== 'kiosk') return state;
  return withQuest(state, state.kioskQuest, { shopFeedback: KIOSK_FEEDBACK.robotDone });
}

export function isKioskOverlay(mode: GameState['mode']): boolean {
  return mode === 'kiosk';
}

export function isKioskInspect(target: GameState['inspectTarget']): boolean {
  return target === 'kiosk_docs' || target === 'kiosk_vault';
}

export function isKioskExplain(topic: ExplainTopic | null): boolean {
  return topic === 'api_contract' || topic === 'arabic_rtl';
}

export function closeKioskOverlay(state: GameState): GameState {
  const pending = state.kioskQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      kioskQuest: { ...state.kioskQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: kioskObjective(state),
  };
}

export function skipKioskExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: kioskObjective(state),
  };
}

export function managerKioskNode(state: GameState): 'manager_kiosk_thanks' | null {
  if (state.kioskQuest.kioskReady) return 'manager_kiosk_thanks';
  return null;
}
