import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  ContextNoteId,
  DialogueNodeId,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  LibraryQuest,
  NeededFactId,
  PackFileId,
  PackStampId,
  PrivateFieldId,
} from './types';
import { LIBRARY_PHASES } from './types';

export const WINDOW_CAP = 2;

export const CONTEXT_NOTES = ['constraint', 'hold', 'festival', 'mango'] as const;
export const PACK_FILES = ['spec', 'delivery', 'festival', 'news_draft'] as const;
export const PRIVATE_FIELDS = ['name_noura', 'name_khalid', 'phone', 'address'] as const;
export const NEEDED_FACTS = ['shelf', 'time', 'spec_location'] as const;

export const PRIVATE_STRINGS = {
  name_noura: 'نورة الشمري',
  name_khalid: 'خالد العتيبي',
  phone: '٠٥٥٠٠٠١١٢٢',
  address: 'بيت ١٢ الزقاق الغربي',
} as const;

export const PRIVATE_STRING_LIST = [
  PRIVATE_STRINGS.name_noura,
  PRIVATE_STRINGS.name_khalid,
  PRIVATE_STRINGS.phone,
  PRIVATE_STRINGS.address,
] as const;

export const NEEDED_STRINGS = {
  shelf: 'م-٤',
  time: 'بعد العصر',
  spec_location: 'المواصفات في القاعة فقط',
} as const;

export const NEEDED_STRING_LIST = [
  NEEDED_STRINGS.shelf,
  NEEDED_STRINGS.time,
  NEEDED_STRINGS.spec_location,
] as const;

export const NOTE_TITLE: Record<ContextNoteId, string> = {
  constraint: 'قيد التسليم',
  hold: 'بطاقة الحجز',
  festival: 'ورقة المهرجان',
  mango: 'ملاحظة المانجو',
};

export const NOTE_TEXT: Record<ContextNoteId, string> = {
  constraint: 'قيد التسليم: لا تدفع؛ خذ حجز الإصلاح فقط من الرف الغربي.',
  hold: 'الحجز المقصود على الرف الغربي، وليس للبيع.',
  festival: 'مهرجان الحي يبدأ عند الفجر ويوزّع الحلويات مجاناً.',
  mango: 'عصير المانجو على الرف الأيسر باثني عشر ريالاً.',
};

export const PACK_TITLE: Record<PackFileId, string> = {
  spec: 'مواصفات قطعة الإصلاح',
  delivery: 'ملف التسليم',
  festival: 'برنامج المهرجان',
  news_draft: 'مسودة خبر الحي',
};

export const PACK_BODY: Record<PackFileId, string> = {
  spec: 'قطعة الاتصال تُركَّب في وحدة السياق. القراءة من القاعة فقط، لا من الشائعات.',
  delivery: 'التسليم: حجز الإصلاح من الرف الغربي، بلا دفع، مع رقم الحجز إلى المنضدة.',
  festival: 'المهرجان يحتاج متطوعين للحلويات عند الفجر.',
  news_draft: 'خبر غير منشور: المكتبة ستوزّع شهادات قبل اكتمال العمل.',
};

export const PACK_STAMP_LABEL: Record<PackStampId, string> = {
  rafiq_repair: 'حزمة إصلاح رفيق',
  festival: 'حزمة المهرجان',
  unnamed: 'بلا اسم',
};

export const PACK_STAMP_RAFIQ = PACK_STAMP_LABEL.rafiq_repair;

export const SPEC_TEXT = [
  'مواصفات قطعة الإصلاح',
  'الرف: م-٤',
  'الوقت المناسب للقراءة: بعد العصر',
  'المواصفات في القاعة فقط.',
  'لا تخلط ملف المهرجان أو مسودة الخبر مع هذه الحزمة.',
].join('\n');

export const LIBRARY_EXPLAIN = {
  context:
    'النافذة العاملة تتسع لملاحظتين فقط. ما يسقط منها لا يبقى في ذهن الروبوت. تثبيتها في الدفتر لا يضعها تلقائياً في النافذة.',
  privacy:
    'الروبوت لا يحتاج أسماء الجيران ولا الهاتف ولا عنوان البيت. احذف الخاص، وأبقِ الرف والوقت ومكان المواصفات.',
  pack:
    'الحزمة المسماة «حزمة إصلاح رفيق» تحمل المواصفات وملف التسليم فقط. أوراق المهرجان ومسودة الخبر تُترك خارجها.',
} as const;

export const LIBRARY_FEEDBACK = {
  overflow: 'النافذة ممتلئة. سقطت الملاحظة الأقدم.',
  reciteDecoy: 'من النافذة الحالية أردد ورق المهرجان أو المانجو، لا قيد التسليم.',
  reciteNeedBoth: 'النافذة لا تحمل قيد التسليم وبطاقة الحجز معاً.',
  pinOnly: 'ثُبِّتت في الدفتر. الدفتر لا يملأ النافذة العاملة.',
  unredacted: 'ما زالت أسماء أو هاتف أو عنوان في الملف. لا أعطيه هكذا.',
  hiddenFacts: 'حُذفت حقيقة مطلوبة: الرف أو الوقت أو أن المواصفات في القاعة فقط.',
  giveOk: 'وصلت الحقائق المطلوبة بلا أسماء ولا هاتف ولا عنوان.',
  unnamedPack: 'الحزمة بلا اسم. سمِّها قبل التسليم.',
  festivalStamp: 'ختم المهرجان لا يفتح مواصفات الإصلاح.',
  decoyFiles: 'أوراق المهرجان أو مسودة الخبر لا تدخل حزمة الإصلاح.',
  missingFiles: 'الحزمة تحتاج المواصفات وملف التسليم معاً.',
  packOk: 'حزمة إصلاح رفيق جاهزة: المواصفات وملف التسليم فقط.',
  specSealed: 'الغلاف ما زال مقفلاً حتى تكتمل النافذة والملف الآمن والحزمة المسماة.',
  windowNotPack: 'نافذة الملاحظات ليست طاولة الحزمة.',
} as const;

const PHASES = new Set<string>(LIBRARY_PHASES);

function emptyRedacted(): Record<PrivateFieldId, boolean> {
  return {
    name_noura: false,
    name_khalid: false,
    phone: false,
    address: false,
  };
}

function emptyHidden(): Record<NeededFactId, boolean> {
  return { shelf: false, time: false, spec_location: false };
}

export function createLibraryQuest(): LibraryQuest {
  return {
    phase: 'unstarted',
    briefed: false,
    overflowSeen: false,
    constraintRestored: false,
    recitedConstraint: false,
    windowSlots: ['festival', 'mango'],
    pinnedNotes: [],
    lastDroppedNote: null,
    lastRecitation: '',
    redacted: emptyRedacted(),
    hiddenFacts: emptyHidden(),
    fileGiven: false,
    lastPayload: '',
    packFiles: [],
    packStamp: 'unnamed',
    packAssembled: false,
    specReleased: false,
    contextModule: false,
    pendingExplain: null,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parseNote(value: unknown): ContextNoteId | null {
  return typeof value === 'string' && (CONTEXT_NOTES as readonly string[]).includes(value)
    ? (value as ContextNoteId)
    : null;
}

function parseNotes(value: unknown): ContextNoteId[] {
  if (!Array.isArray(value)) return [];
  const out: ContextNoteId[] = [];
  for (const item of value) {
    const note = parseNote(item);
    if (note && !out.includes(note)) out.push(note);
  }
  return out;
}

function parseFiles(value: unknown): PackFileId[] {
  if (!Array.isArray(value)) return [];
  const out: PackFileId[] = [];
  for (const item of value) {
    if (typeof item === 'string' && (PACK_FILES as readonly string[]).includes(item)) {
      const id = item as PackFileId;
      if (!out.includes(id)) out.push(id);
    }
  }
  return out;
}

export function parseLibraryQuest(value: unknown): LibraryQuest {
  const fallback = createLibraryQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as LibraryQuest['phase'])
      : fallback.phase;
  const windowSlots = parseNotes(raw.windowSlots);
  const slots = windowSlots.length > 0 ? windowSlots.slice(0, WINDOW_CAP) : fallback.windowSlots;
  const stamp =
    raw.packStamp === 'rafiq_repair' || raw.packStamp === 'festival' || raw.packStamp === 'unnamed'
      ? raw.packStamp
      : fallback.packStamp;
  const redactedRaw =
    typeof raw.redacted === 'object' && raw.redacted !== null
      ? (raw.redacted as Record<string, unknown>)
      : {};
  const hiddenRaw =
    typeof raw.hiddenFacts === 'object' && raw.hiddenFacts !== null
      ? (raw.hiddenFacts as Record<string, unknown>)
      : {};
  const pending =
    raw.pendingExplain === 'context' ||
    raw.pendingExplain === 'privacy' ||
    raw.pendingExplain === 'pack'
      ? raw.pendingExplain
      : null;
  return {
    phase,
    briefed: onFlag(raw, 'briefed'),
    overflowSeen: onFlag(raw, 'overflowSeen'),
    constraintRestored: onFlag(raw, 'constraintRestored'),
    recitedConstraint: onFlag(raw, 'recitedConstraint'),
    windowSlots: slots,
    pinnedNotes: parseNotes(raw.pinnedNotes),
    lastDroppedNote: parseNote(raw.lastDroppedNote),
    lastRecitation: typeof raw.lastRecitation === 'string' ? raw.lastRecitation : '',
    redacted: {
      name_noura: redactedRaw.name_noura === true,
      name_khalid: redactedRaw.name_khalid === true,
      phone: redactedRaw.phone === true,
      address: redactedRaw.address === true,
    },
    hiddenFacts: {
      shelf: hiddenRaw.shelf === true,
      time: hiddenRaw.time === true,
      spec_location: hiddenRaw.spec_location === true,
    },
    fileGiven: onFlag(raw, 'fileGiven'),
    lastPayload: typeof raw.lastPayload === 'string' ? raw.lastPayload : '',
    packFiles: parseFiles(raw.packFiles),
    packStamp: stamp,
    packAssembled: onFlag(raw, 'packAssembled'),
    specReleased: onFlag(raw, 'specReleased'),
    contextModule: onFlag(raw, 'contextModule'),
    pendingExplain: pending,
  };
}

export function windowHasConstraintAndHold(slots: ContextNoteId[]): boolean {
  return slots.includes('constraint') && slots.includes('hold') && slots.length === WINDOW_CAP;
}

export function loadNote(
  slots: ContextNoteId[],
  note: ContextNoteId,
): { slots: ContextNoteId[]; dropped: ContextNoteId | null } {
  if (slots.includes(note)) return { slots: [...slots], dropped: null };
  if (slots.length < WINDOW_CAP) {
    return { slots: [...slots, note], dropped: null };
  }
  const dropped = slots[0];
  return { slots: [...slots.slice(1), note], dropped };
}

export function communityFileSource(): string {
  return [
    'ملف حيّ: طلب رفوف القراءة',
    `المستلم: ${PRIVATE_STRINGS.name_noura}`,
    `المرافق: ${PRIVATE_STRINGS.name_khalid}`,
    `الهاتف: ${PRIVATE_STRINGS.phone}`,
    `العنوان: ${PRIVATE_STRINGS.address}`,
    `الرف المطلوب: ${NEEDED_STRINGS.shelf}`,
    `الوقت: ${NEEDED_STRINGS.time}`,
    `ملاحظة: ${NEEDED_STRINGS.spec_location}`,
  ].join('\n');
}

export function communityFileHasPlayerName(playerName: string): boolean {
  const source = communityFileSource();
  const trimmed = playerName.trim();
  if (!trimmed) return false;
  return source.includes(trimmed);
}

export function buildFilePayload(quest: LibraryQuest): string {
  const lines: string[] = ['ملف حيّ بعد المراجعة'];
  if (!quest.redacted.name_noura) lines.push(`المستلم: ${PRIVATE_STRINGS.name_noura}`);
  if (!quest.redacted.name_khalid) lines.push(`المرافق: ${PRIVATE_STRINGS.name_khalid}`);
  if (!quest.redacted.phone) lines.push(`الهاتف: ${PRIVATE_STRINGS.phone}`);
  if (!quest.redacted.address) lines.push(`العنوان: ${PRIVATE_STRINGS.address}`);
  if (!quest.hiddenFacts.shelf) lines.push(`الرف المطلوب: ${NEEDED_STRINGS.shelf}`);
  if (!quest.hiddenFacts.time) lines.push(`الوقت: ${NEEDED_STRINGS.time}`);
  if (!quest.hiddenFacts.spec_location) lines.push(`ملاحظة: ${NEEDED_STRINGS.spec_location}`);
  return lines.join('\n');
}

export function payloadHasPrivate(payload: string): boolean {
  return PRIVATE_STRING_LIST.some((item) => payload.includes(item));
}

export function payloadHasNeededFacts(payload: string): boolean {
  return NEEDED_STRING_LIST.every((item) => payload.includes(item));
}

export function allPrivateRedacted(quest: LibraryQuest): boolean {
  return PRIVATE_FIELDS.every((field) => quest.redacted[field]);
}

export function neededFactsVisible(quest: LibraryQuest): boolean {
  return NEEDED_FACTS.every((field) => !quest.hiddenFacts[field]);
}

export function packIsCorrect(quest: LibraryQuest): boolean {
  const files = quest.packFiles;
  return (
    quest.packStamp === 'rafiq_repair' &&
    files.includes('spec') &&
    files.includes('delivery') &&
    !files.includes('festival') &&
    !files.includes('news_draft') &&
    files.length === 2
  );
}

export function recitationFrom(slots: ContextNoteId[]): string {
  if (windowHasConstraintAndHold(slots)) return NOTE_TEXT.constraint;
  return slots.map((id) => NOTE_TEXT[id]).join(' ');
}

export function canAward14(quest: LibraryQuest): boolean {
  return (
    quest.overflowSeen &&
    windowHasConstraintAndHold(quest.windowSlots) &&
    quest.recitedConstraint
  );
}

export function canAward15(quest: LibraryQuest): boolean {
  return (
    quest.fileGiven &&
    !payloadHasPrivate(quest.lastPayload) &&
    payloadHasNeededFacts(quest.lastPayload)
  );
}

export function canAward25(quest: LibraryQuest): boolean {
  return quest.packAssembled && packIsCorrect(quest);
}

function syncPhase(quest: LibraryQuest): LibraryQuest {
  let phase: LibraryQuest['phase'] = 'unstarted';
  if (quest.contextModule && quest.specReleased) phase = 'module_ready';
  else if (quest.overflowSeen || quest.fileGiven || quest.packAssembled || quest.constraintRestored) {
    phase = 'working';
  } else if (quest.briefed) phase = 'briefed';
  return { ...quest, phase };
}

export function libraryObjective(state: GameState): string {
  const quest = state.libraryQuest;
  if (state.approvalQuest?.approvalReady) return OBJECTIVES.approvalReady;
  if (state.skillQuest?.skillReady) return OBJECTIVES.approvalWork;
  if (state.bridgeQuest?.bridgeReady) return OBJECTIVES.skillWork;
  if (state.agentQuest?.agentReady) return OBJECTIVES.bridgeWork;
  if (state.labQuest?.labReady) return OBJECTIVES.agentWork;
  if (state.kioskQuest?.kioskReady) return OBJECTIVES.labWork;
  if (state.workshopQuest?.servicePosted) return OBJECTIVES.kioskWork;
  if (state.map === 'workshop' || state.workshopQuest?.briefed || state.festivalQuest?.workshopMaterials) {
    return OBJECTIVES.workshopWork;
  }
  if (state.map === 'festival' || state.festivalQuest?.briefed) return OBJECTIVES.festivalWork;
  if (state.newsroomQuest?.workshopLead) return OBJECTIVES.workshopLead;
  if (quest.contextModule && quest.specReleased) return OBJECTIVES.newsroomLead;
  if (state.map === 'archive' || quest.briefed) return OBJECTIVES.archiveWork;
  if (state.parcelQuest.commsRepaired) return OBJECTIVES.parcelDone;
  return state.storyObjective;
}

export function awardLibraryEvidence(state: GameState): GameState {
  const quest = syncPhase(state.libraryQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward14(quest)) evidence['1.4'] = 'demonstrated';
  if (canAward15(quest)) evidence['1.5'] = 'demonstrated';
  if (canAward25(quest)) evidence['2.5'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  if (quest.overflowSeen) events = recordEvent(events, 'notes_overflow');
  if (quest.constraintRestored) events = recordEvent(events, 'constraint_restored');
  if (canAward15(quest)) events = recordEvent(events, 'file_redacted');
  if (canAward25(quest)) events = recordEvent(events, 'pack_assembled');
  let nextQuest = quest;
  if (
    evidence['1.4'] === 'demonstrated' &&
    evidence['1.5'] === 'demonstrated' &&
    evidence['2.5'] === 'demonstrated'
  ) {
    nextQuest = {
      ...quest,
      specReleased: true,
      contextModule: true,
    };
    events = recordEvent(events, 'spec_released');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    libraryQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: libraryObjective(next),
  };
}

export function librarianNode(state: GameState): DialogueNodeId {
  const quest = state.libraryQuest;
  if (quest.contextModule && quest.specReleased) return 'librarian_after_success';
  if (quest.briefed) return 'librarian_revisit';
  return 'librarian_hello';
}

export function finishLibrarianBrief(state: GameState): GameState {
  const quest = syncPhase({ ...state.libraryQuest, briefed: true });
  const next = { ...state, libraryQuest: quest, librarian: 'greeted' as const };
  return {
    ...next,
    mode: 'playing',
    dialogueNode: null,
    storyObjective: libraryObjective(next),
  };
}

export function closeLibraryDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node) return null;
  if (node === 'librarian_hello' || node === 'librarian_brief') {
    return finishLibrarianBrief(state);
  }
  if (node.startsWith('librarian')) {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      librarian: 'greeted',
    };
  }
  if (node === 'companion_after_archive') {
    return { ...state, mode: 'playing', dialogueNode: null };
  }
  return null;
}

export function isLibraryOverlay(mode: GameState['mode']): boolean {
  return mode === 'context' || mode === 'redact' || mode === 'pack';
}

export function closeLibraryOverlay(state: GameState): GameState {
  const pending = state.libraryQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      libraryQuest: { ...state.libraryQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: libraryObjective(state),
  };
}

export function skipLibraryExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: libraryObjective(state),
  };
}

function withQuest(state: GameState, quest: LibraryQuest, extra: Partial<GameState> = {}): GameState {
  return awardLibraryEvidence({ ...state, libraryQuest: syncPhase(quest), ...extra });
}

export function reduceContextLoad(state: GameState, note: ContextNoteId): GameState {
  if (state.mode !== 'context') return state;
  if (!(CONTEXT_NOTES as readonly string[]).includes(note)) return state;
  const loaded = loadNote(state.libraryQuest.windowSlots, note);
  const overflowSeen = state.libraryQuest.overflowSeen || loaded.dropped !== null;
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    windowSlots: loaded.slots,
    overflowSeen,
    lastDroppedNote: loaded.dropped ?? state.libraryQuest.lastDroppedNote,
  };
  return withQuest(state, quest, {
    shopFeedback: loaded.dropped ? LIBRARY_FEEDBACK.overflow : null,
  });
}

export function reduceContextEject(state: GameState, note: ContextNoteId): GameState {
  if (state.mode !== 'context') return state;
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    windowSlots: state.libraryQuest.windowSlots.filter((item) => item !== note),
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceContextPin(state: GameState, note: ContextNoteId): GameState {
  if (state.mode !== 'context') return state;
  if (!(CONTEXT_NOTES as readonly string[]).includes(note)) return state;
  const pinned = state.libraryQuest.pinnedNotes.includes(note)
    ? state.libraryQuest.pinnedNotes
    : [...state.libraryQuest.pinnedNotes, note];
  const quest: LibraryQuest = { ...state.libraryQuest, pinnedNotes: pinned };
  return withQuest(state, quest, { shopFeedback: LIBRARY_FEEDBACK.pinOnly });
}

export function reduceContextRecite(state: GameState): GameState {
  if (state.mode !== 'context') return state;
  const recitation = recitationFrom(state.libraryQuest.windowSlots);
  const restored =
    state.libraryQuest.overflowSeen && windowHasConstraintAndHold(state.libraryQuest.windowSlots);
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    lastRecitation: recitation,
    recitedConstraint: state.libraryQuest.recitedConstraint || restored,
    constraintRestored: state.libraryQuest.constraintRestored || restored,
    pendingExplain: restored ? 'context' : state.libraryQuest.pendingExplain,
  };
  let feedback: string = LIBRARY_FEEDBACK.reciteDecoy;
  if (restored) feedback = NOTE_TEXT.constraint;
  else if (!windowHasConstraintAndHold(state.libraryQuest.windowSlots)) {
    feedback = LIBRARY_FEEDBACK.reciteNeedBoth;
  }
  return withQuest(state, quest, {
    robotUnderstood: recitation,
    shopFeedback: feedback,
  });
}

export function reduceRedactToggle(state: GameState, field: PrivateFieldId): GameState {
  if (state.mode !== 'redact') return state;
  if (!(PRIVATE_FIELDS as readonly string[]).includes(field)) return state;
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    redacted: { ...state.libraryQuest.redacted, [field]: !state.libraryQuest.redacted[field] },
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceFactToggle(state: GameState, field: NeededFactId): GameState {
  if (state.mode !== 'redact') return state;
  if (!(NEEDED_FACTS as readonly string[]).includes(field)) return state;
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    hiddenFacts: {
      ...state.libraryQuest.hiddenFacts,
      [field]: !state.libraryQuest.hiddenFacts[field],
    },
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceRedactGive(state: GameState): GameState {
  if (state.mode !== 'redact') return state;
  const payload = buildFilePayload(state.libraryQuest);
  if (payloadHasPrivate(payload)) {
    const quest: LibraryQuest = { ...state.libraryQuest, lastPayload: payload, fileGiven: false };
    return withQuest(state, quest, { shopFeedback: LIBRARY_FEEDBACK.unredacted });
  }
  if (!payloadHasNeededFacts(payload)) {
    const quest: LibraryQuest = { ...state.libraryQuest, lastPayload: payload, fileGiven: false };
    return withQuest(state, quest, { shopFeedback: LIBRARY_FEEDBACK.hiddenFacts });
  }
  const quest: LibraryQuest = {
    ...state.libraryQuest,
    lastPayload: payload,
    fileGiven: true,
    pendingExplain: 'privacy',
  };
  return withQuest(state, quest, {
    shopFeedback: LIBRARY_FEEDBACK.giveOk,
    robotUnderstood: payload,
  });
}

export function reducePackToggle(state: GameState, file: PackFileId): GameState {
  if (state.mode !== 'pack') return state;
  if (!(PACK_FILES as readonly string[]).includes(file)) return state;
  const has = state.libraryQuest.packFiles.includes(file);
  const packFiles = has
    ? state.libraryQuest.packFiles.filter((item) => item !== file)
    : [...state.libraryQuest.packFiles, file];
  const quest: LibraryQuest = { ...state.libraryQuest, packFiles };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePackStamp(state: GameState, stamp: PackStampId): GameState {
  if (state.mode !== 'pack') return state;
  if (stamp !== 'rafiq_repair' && stamp !== 'festival' && stamp !== 'unnamed') return state;
  const quest: LibraryQuest = { ...state.libraryQuest, packStamp: stamp };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reducePackAssemble(state: GameState): GameState {
  if (state.mode !== 'pack') return state;
  const questBase = state.libraryQuest;
  if (questBase.packStamp === 'unnamed') {
    return withQuest(state, { ...questBase, packAssembled: false }, {
      shopFeedback: LIBRARY_FEEDBACK.unnamedPack,
    });
  }
  if (questBase.packStamp === 'festival') {
    return withQuest(state, { ...questBase, packAssembled: false }, {
      shopFeedback: LIBRARY_FEEDBACK.festivalStamp,
    });
  }
  if (questBase.packFiles.includes('festival') || questBase.packFiles.includes('news_draft')) {
    return withQuest(state, { ...questBase, packAssembled: false }, {
      shopFeedback: LIBRARY_FEEDBACK.decoyFiles,
    });
  }
  if (!questBase.packFiles.includes('spec') || !questBase.packFiles.includes('delivery')) {
    return withQuest(state, { ...questBase, packAssembled: false }, {
      shopFeedback: LIBRARY_FEEDBACK.missingFiles,
    });
  }
  const quest: LibraryQuest = {
    ...questBase,
    packAssembled: true,
    pendingExplain: 'pack',
  };
  return withQuest(state, quest, { shopFeedback: LIBRARY_FEEDBACK.packOk });
}

export function isLibraryExplain(topic: ExplainTopic | null): boolean {
  return topic === 'context' || topic === 'privacy' || topic === 'pack';
}
