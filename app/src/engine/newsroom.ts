import { OBJECTIVES, recordEvent } from './dialogue';
import type {
  CompareFlag,
  DialogueNodeId,
  EvidenceMap,
  ExplainTopic,
  GameState,
  JournalEvent,
  LetterPurpose,
  LetterRecipient,
  LetterSigner,
  LetterTone,
  MismatchId,
  NewsroomQuest,
  VoiceStyle,
} from './types';
import { NEWSROOM_PHASES } from './types';
import { festivalObjective } from './festival';

export const SOURCE_A_NAME = 'نشرة الورشة';
export const SOURCE_B_NAME = 'ملصق الرصيف';

export const PASSAGE_A_HOURS = 'بعد العصر حتى المغرب';
export const PASSAGE_B_HOURS = 'من الضحى حتى العصر';
export const PASSAGE_A_ACCESS = 'الدخول بموعد مكتوب';
export const PASSAGE_B_ACCESS = 'الدخول مفتوح بلا موعد';

export const SOURCE_A = [
  `${SOURCE_A_NAME} — العدد الصباحي`,
  `ساعات الاستقبال: ${PASSAGE_A_HOURS}.`,
  `${PASSAGE_A_ACCESS} عند المنضدة.`,
  'لا يُستقبل زائر بلا ورقة.',
].join('\n');

export const SOURCE_B = [
  `${SOURCE_B_NAME} — دعوة عابرة`,
  `الورشة تستقبل ${PASSAGE_B_HOURS}.`,
  `${PASSAGE_B_ACCESS}.`,
  'مرّوا متى شئتم.',
].join('\n');

export const CIRCULAR_14 = 'تعميم ١٤';
export const SLOGAN = 'نقلة نوعية';
export const DOC_ID = 'ق-٢٠٤';

export const CLIPPING_TEXT = [
  'قصاصة على لوحة الأخبار',
  `حسب ${DOC_ID}: حجز قطع منتصف الليل في الورشة حتى إشعار آخر.`,
].join('\n');

export const ORIGINAL_TEXT = [
  `وثيقة ${DOC_ID} الأصلية`,
  'موضوع: حراسة ليلية لمهرجان الحي.',
  'الحراس يمرّون على الورشة ليلاً أثناء المهرجان.',
  'ليست حجز قطع، وليست إغلاقاً للورشة.',
].join('\n');

export const ATTRACTIVE_DRAFT = [
  'إعلان أنيق لورشة الإصلاح',
  'الورشة مفتوحة دائماً لراحتكم.',
  `حسب ${DOC_ID} هناك حجز قطع منتصف الليل.`,
  `لا حاجة لطلب مكتوب — ${SLOGAN} في الخدمة.`,
].join('\n');

export const ALWAYS_OPEN = 'مفتوحة دائماً';
export const MIDNIGHT_HOLD = 'حجز قطع منتصف الليل';
export const NO_WRITTEN = 'لا حاجة لطلب مكتوب';

export const EDITOR_SAMPLE = [
  'يا أهل الحي،',
  'ورشة الإصلاح ليست مفتوحة دائماً.',
  `${SOURCE_A_NAME} و${SOURCE_B_NAME} يختلفان في الساعات وفي الدخول.`,
  `${DOC_ID} تتحدث عن حراسة ليلية للمهرجان، لا عن حجز قطع.`,
].join('\n');

export const CORRECT_HOURS = 'الساعات غير متفق عليها بين المصدرين';
export const CORRECT_HOLD = `${DOC_ID} حراسة ليلية للمهرجان وليست حجز قطع`;
export const CORRECT_ACCESS = 'طلب مكتوب غير محسوم بين المصدرين';

export const LETTER_BODY_OK = [
  'إلى مدير ورشة الإصلاح.',
  'أطلب موعد معاينة لقطعة الإصلاح وفق ما راجعناه في قاعة الأخبار.',
  'الساعات والدخول غير متفق عليهما بين المصدرين، وق-٢٠٤ حراسة ليلية للمهرجان.',
  'أرجو تحديد وقت مناسب للمعاينة.',
].join('\n');

export const LETTER_BODY_LONG = [
  LETTER_BODY_OK,
  'هذه جملة خامسة لا تلزم.',
  'وهذه سادسة تزيد الطول بلا حاجة.',
].join('\n');

export const MISMATCH_IDS: readonly MismatchId[] = ['always_open', 'midnight_hold', 'no_written'];

export const NEWSROOM_EXPLAIN = {
  compare:
    'المصدران يختلفان. لا تدمج الخلاف في خلاصة واحدة. سمِّ الورقتين، واحفظ الخلاف، وأرفق جملة من كل ورقة.',
  verify:
    'القصاصة تشير إلى ق-٢٠٤. اقرأ الأصل قبل الاستشهاد. الحراسة الليلية ليست حجز قطع.',
  review:
    'المسودة الأنيقة قد تحمل خطأ واضحاً. علّم التعارض ثم صحّحه قبل أن تعلّق الإعلان.',
  voice:
    'صوت المحررة قصير وموجّه لأهل الحي، بلا شعارات مثل نقلة نوعية، ومن غير تبديل الحقائق.',
  letter:
    'الخطاب إلى مدير ورشة الإصلاح لموعد معاينة، واضح ومهذب، في أربع جمل أو أقل، ويُراجع قبل الإرسال. الروبوت لا يوقّع باسم المدير.',
} as const;

export const NEWSROOM_FEEDBACK = {
  inspectOnly: 'قراءة الورقتين لا تكفي. اكتب المقارنة على المنضدة.',
  needBothNames: 'سمِّ نشرة الورشة وملصق الرصيف كليهما.',
  needHours: 'سجّل خلاف الساعات من الورقتين.',
  needAccess: 'سجّل خلاف الدخول من الورقتين.',
  needPassages: 'أرفق جملة حقيقية من كل مصدر.',
  consensus: 'لا تمحُ الخلاف. المصدران لا يتفقان على الساعات ولا على الدخول.',
  citeEarly: 'لا تستشهد بالقصاصة قبل قراءة الأصل.',
  needFollow: 'اتبع القصاصة إلى أصل ق-٢٠٤ ثم تحقّق.',
  verifyOk: 'الأصل يقول حراسة ليلية للمهرجان، لا حجز قطع.',
  unmarked: 'علّم تعارضاً واحداً على الأقل قبل التعليق.',
  uncorrected: 'ما زالت المسودة تحمل ادّعاء غير مؤيَّد. صحّحه قبل التعليق.',
  releaseOk: 'الإعلان صار يحتفظ بالخلاف ولا يدّعي حجز منتصف الليل.',
  slogan: 'صوت المحررة لا يستخدم شعار نقلة نوعية.',
  factsChanged: 'لا تغيّر الحقائق التي راجعناها من المصدرين والأصل.',
  voiceOk: 'النص صار يخاطب أهل الحي بصوت المحررة دون تبديل الحقائق.',
  needRecipient: 'المستلم هو مدير ورشة الإصلاح.',
  needPurpose: 'الغرض موعد معاينة، لا حجز قطع ولا تعميم ١٤.',
  needTone: 'النبرة واضحة ومهذبة.',
  tooLong: 'أربع جمل أو أقل.',
  circular: 'لا يوجد تعميم ١٤ في هذه الأوراق.',
  robotManager: 'الروبوت لا يرسل ولا يوقّع باسم مدير الورشة.',
  needReview: 'راجع المسودة صراحة قبل الإرسال.',
  letterOk: 'الخطاب راجع ومستعد لموعد المعاينة.',
} as const;

const PHASES = new Set<string>(NEWSROOM_PHASES);
const COMPARE_FLAGS: readonly CompareFlag[] = [
  'namedBulletin',
  'namedPoster',
  'hoursA',
  'hoursB',
  'accessA',
  'accessB',
];

function emptyMarked(): Record<MismatchId, boolean> {
  return { always_open: false, midnight_hold: false, no_written: false };
}

export function createNewsroomQuest(): NewsroomQuest {
  return {
    phase: 'unstarted',
    briefed: false,
    inspectedBulletin: false,
    inspectedPoster: false,
    namedBulletin: false,
    namedPoster: false,
    hoursA: false,
    hoursB: false,
    accessA: false,
    accessB: false,
    passageA: '',
    passageB: '',
    compared: false,
    consensusAttempted: false,
    inspectedClipping: false,
    followedToOriginal: false,
    inspectedOriginal: false,
    citedBeforeOriginal: false,
    verifiedCite: false,
    inspectedDraft: false,
    marked: emptyMarked(),
    corrected: emptyMarked(),
    releasedUnchecked: false,
    noticeReleased: false,
    inspectedSample: false,
    voiceStyle: null,
    voiceMatched: false,
    factsChanged: false,
    letterRecipient: null,
    letterPurpose: null,
    letterTone: null,
    letterBody: LETTER_BODY_OK,
    letterReviewed: false,
    letterSignedBy: null,
    letterSent: false,
    workshopLead: false,
    pendingExplain: null,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parseMarked(value: unknown): Record<MismatchId, boolean> {
  const fallback = emptyMarked();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  return {
    always_open: raw.always_open === true,
    midnight_hold: raw.midnight_hold === true,
    no_written: raw.no_written === true,
  };
}

function parseRecipient(value: unknown): LetterRecipient {
  if (
    value === 'workshop_manager' ||
    value === 'shopkeeper' ||
    value === 'robot_manager' ||
    value === 'circular14'
  ) {
    return value;
  }
  return null;
}

function parsePurpose(value: unknown): LetterPurpose {
  if (value === 'inspection' || value === 'midnight_parts' || value === 'circular14') {
    return value;
  }
  return null;
}

function parseTone(value: unknown): LetterTone {
  if (value === 'clear_polite' || value === 'slogan' || value === 'harsh') return value;
  return null;
}

function parseSigner(value: unknown): LetterSigner | null {
  if (value === 'player' || value === 'robot_manager') return value;
  return null;
}

function parseVoice(value: unknown): VoiceStyle | null {
  if (value === 'editor' || value === 'slogan' || value === 'change_facts') return value;
  return null;
}

function parsePending(value: unknown): ExplainTopic | null {
  if (
    value === 'compare' ||
    value === 'verify' ||
    value === 'review' ||
    value === 'voice' ||
    value === 'letter'
  ) {
    return value;
  }
  return null;
}

export function parseNewsroomQuest(value: unknown): NewsroomQuest {
  const fallback = createNewsroomQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as NewsroomQuest['phase'])
      : fallback.phase;
  return {
    phase,
    briefed: onFlag(raw, 'briefed'),
    inspectedBulletin: onFlag(raw, 'inspectedBulletin'),
    inspectedPoster: onFlag(raw, 'inspectedPoster'),
    namedBulletin: onFlag(raw, 'namedBulletin'),
    namedPoster: onFlag(raw, 'namedPoster'),
    hoursA: onFlag(raw, 'hoursA'),
    hoursB: onFlag(raw, 'hoursB'),
    accessA: onFlag(raw, 'accessA'),
    accessB: onFlag(raw, 'accessB'),
    passageA: typeof raw.passageA === 'string' ? raw.passageA : '',
    passageB: typeof raw.passageB === 'string' ? raw.passageB : '',
    compared: onFlag(raw, 'compared'),
    consensusAttempted: onFlag(raw, 'consensusAttempted'),
    inspectedClipping: onFlag(raw, 'inspectedClipping'),
    followedToOriginal: onFlag(raw, 'followedToOriginal'),
    inspectedOriginal: onFlag(raw, 'inspectedOriginal'),
    citedBeforeOriginal: onFlag(raw, 'citedBeforeOriginal'),
    verifiedCite: onFlag(raw, 'verifiedCite'),
    inspectedDraft: onFlag(raw, 'inspectedDraft'),
    marked: parseMarked(raw.marked),
    corrected: parseMarked(raw.corrected),
    releasedUnchecked: onFlag(raw, 'releasedUnchecked'),
    noticeReleased: onFlag(raw, 'noticeReleased'),
    inspectedSample: onFlag(raw, 'inspectedSample'),
    voiceStyle: parseVoice(raw.voiceStyle),
    voiceMatched: onFlag(raw, 'voiceMatched'),
    factsChanged: onFlag(raw, 'factsChanged'),
    letterRecipient: parseRecipient(raw.letterRecipient),
    letterPurpose: parsePurpose(raw.letterPurpose),
    letterTone: parseTone(raw.letterTone),
    letterBody: typeof raw.letterBody === 'string' ? raw.letterBody : fallback.letterBody,
    letterReviewed: onFlag(raw, 'letterReviewed'),
    letterSignedBy: parseSigner(raw.letterSignedBy),
    letterSent: onFlag(raw, 'letterSent'),
    workshopLead: onFlag(raw, 'workshopLead'),
    pendingExplain: parsePending(raw.pendingExplain),
  };
}

export function isNewsroomOpen(state: GameState): boolean {
  return state.libraryQuest.contextModule && state.libraryQuest.specReleased;
}

export function realPassage(source: string, passage: string): boolean {
  return passage.length > 0 && source.includes(passage);
}

export function comparisonPassages(quest: NewsroomQuest): { passageA: string; passageB: string } {
  const passageA = quest.hoursA ? PASSAGE_A_HOURS : quest.accessA ? PASSAGE_A_ACCESS : '';
  const passageB = quest.hoursB ? PASSAGE_B_HOURS : quest.accessB ? PASSAGE_B_ACCESS : '';
  return { passageA, passageB };
}

export function selectedPassagesReal(quest: NewsroomQuest): boolean {
  if (quest.hoursA && !realPassage(SOURCE_A, PASSAGE_A_HOURS)) return false;
  if (quest.accessA && !realPassage(SOURCE_A, PASSAGE_A_ACCESS)) return false;
  if (quest.hoursB && !realPassage(SOURCE_B, PASSAGE_B_HOURS)) return false;
  if (quest.accessB && !realPassage(SOURCE_B, PASSAGE_B_ACCESS)) return false;
  return Boolean(
    (quest.hoursA || quest.accessA) && (quest.hoursB || quest.accessB),
  );
}

export function canAward31(quest: NewsroomQuest): boolean {
  const passages = comparisonPassages(quest);
  return (
    quest.inspectedBulletin &&
    quest.inspectedPoster &&
    quest.namedBulletin &&
    quest.namedPoster &&
    quest.hoursA &&
    quest.hoursB &&
    quest.accessA &&
    quest.accessB &&
    quest.compared &&
    selectedPassagesReal(quest) &&
    realPassage(SOURCE_A, passages.passageA) &&
    realPassage(SOURCE_B, passages.passageB)
  );
}

export function canAward33(quest: NewsroomQuest): boolean {
  return quest.followedToOriginal && quest.inspectedOriginal && quest.verifiedCite;
}

export function anyMarked(quest: NewsroomQuest): boolean {
  return MISMATCH_IDS.some((id) => quest.marked[id]);
}

export function allCorrected(quest: NewsroomQuest): boolean {
  return MISMATCH_IDS.every((id) => quest.corrected[id]);
}

export function draftBody(quest: NewsroomQuest): string {
  const lines = ['إعلان ورشة الإصلاح'];
  lines.push(quest.corrected.always_open ? CORRECT_HOURS : `الورشة ${ALWAYS_OPEN} لراحتكم.`);
  lines.push(
    quest.corrected.midnight_hold
      ? CORRECT_HOLD
      : `حسب ${DOC_ID} هناك ${MIDNIGHT_HOLD}.`,
  );
  lines.push(
    quest.corrected.no_written
      ? CORRECT_ACCESS
      : `${NO_WRITTEN} — ${SLOGAN} في الخدمة.`,
  );
  return lines.join('\n');
}

export function canAward23(quest: NewsroomQuest): boolean {
  const body = draftBody(quest);
  return (
    quest.inspectedDraft &&
    anyMarked(quest) &&
    allCorrected(quest) &&
    quest.noticeReleased &&
    !body.includes(ALWAYS_OPEN) &&
    !body.includes(MIDNIGHT_HOLD) &&
    !body.includes(NO_WRITTEN)
  );
}

export function voiceBody(style: VoiceStyle | null, quest: NewsroomQuest): string {
  if (style === 'slogan') {
    return `يا أهل الحي، ${SLOGAN} تجعل الورشة أفضل للجميع.`;
  }
  if (style === 'change_facts') {
    return `يا أهل الحي، الورشة ${ALWAYS_OPEN} وفيها ${MIDNIGHT_HOLD} حسب ${CIRCULAR_14}.`;
  }
  if (style === 'editor') {
    const hours = quest.corrected.always_open ? CORRECT_HOURS : EDITOR_SAMPLE.split('\n')[2];
    return [
      'يا أهل الحي،',
      'ورشة الإصلاح ليست مفتوحة دائماً.',
      hours.includes(SOURCE_A_NAME)
        ? hours
        : `${SOURCE_A_NAME} و${SOURCE_B_NAME} يختلفان في الساعات وفي الدخول.`,
      `${DOC_ID} تتحدث عن حراسة ليلية للمهرجان، لا عن حجز قطع.`,
    ].join('\n');
  }
  return EDITOR_SAMPLE;
}

export function factsPreserved(text: string): boolean {
  const withoutNegatedHours = text.replace(/ليست مفتوحة دائماً/g, '');
  if (
    withoutNegatedHours.includes(ALWAYS_OPEN) ||
    text.includes(MIDNIGHT_HOLD) ||
    text.includes(CIRCULAR_14)
  ) {
    return false;
  }
  return (
    (text.includes(SOURCE_A_NAME) || text.includes('يختلفان')) &&
    (text.includes('حراسة ليلية') || text.includes(DOC_ID))
  );
}

export function canAward26(quest: NewsroomQuest): boolean {
  const text = voiceBody(quest.voiceStyle, quest);
  return (
    quest.inspectedSample &&
    quest.voiceMatched &&
    quest.voiceStyle === 'editor' &&
    !quest.factsChanged &&
    text.includes('يا أهل الحي') &&
    !text.includes(SLOGAN) &&
    factsPreserved(text)
  );
}

export function sentenceCount(text: string): number {
  const parts = text
    .split(/[.؟!]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length;
}

export function letterHasCircular(quest: NewsroomQuest): boolean {
  return (
    quest.letterRecipient === 'circular14' ||
    quest.letterPurpose === 'circular14' ||
    quest.letterBody.includes(CIRCULAR_14)
  );
}

export function canAward32(quest: NewsroomQuest): boolean {
  return (
    quest.letterRecipient === 'workshop_manager' &&
    quest.letterPurpose === 'inspection' &&
    quest.letterTone === 'clear_polite' &&
    sentenceCount(quest.letterBody) > 0 &&
    sentenceCount(quest.letterBody) <= 4 &&
    !letterHasCircular(quest) &&
    quest.letterReviewed &&
    quest.letterSent &&
    quest.letterSignedBy === 'player'
  );
}

export function allNewsroomIds(quest: NewsroomQuest): boolean {
  return canAward31(quest) && canAward33(quest) && canAward23(quest) && canAward26(quest) && canAward32(quest);
}

function syncPhase(quest: NewsroomQuest): NewsroomQuest {
  let phase: NewsroomQuest['phase'] = 'unstarted';
  if (quest.workshopLead) phase = 'published';
  else if (
    quest.compared ||
    quest.verifiedCite ||
    quest.noticeReleased ||
    quest.voiceMatched ||
    quest.letterSent ||
    quest.inspectedBulletin
  ) {
    phase = 'working';
  } else if (quest.briefed) phase = 'briefed';
  return { ...quest, phase };
}

export function newsroomObjective(state: GameState): string {
  const quest = state.newsroomQuest;
  if (state.festivalQuest.workshopMaterials || state.festivalQuest.briefed || state.map === 'festival') {
    return festivalObjective(state);
  }
  if (quest.workshopLead) return OBJECTIVES.workshopLead;
  if (state.map === 'newsroom' || quest.briefed) return OBJECTIVES.newsroomWork;
  if (isNewsroomOpen(state)) return OBJECTIVES.newsroomLead;
  return state.storyObjective;
}

export function awardNewsroomEvidence(state: GameState): GameState {
  const quest = syncPhase(state.newsroomQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (canAward31(quest)) evidence['3.1'] = 'demonstrated';
  if (canAward33(quest)) evidence['3.3'] = 'demonstrated';
  if (canAward23(quest)) evidence['2.3'] = 'demonstrated';
  if (canAward26(quest)) evidence['2.6'] = 'demonstrated';
  if (canAward32(quest)) evidence['3.2'] = 'demonstrated';
  let events: JournalEvent[] = state.journalEvents;
  if (canAward31(quest)) events = recordEvent(events, 'sources_compared');
  if (canAward33(quest)) events = recordEvent(events, 'clipping_verified');
  if (canAward23(quest)) events = recordEvent(events, 'notice_corrected');
  if (canAward26(quest)) events = recordEvent(events, 'voice_matched');
  if (canAward32(quest)) events = recordEvent(events, 'letter_reviewed');
  let nextQuest = quest;
  if (
    evidence['2.3'] === 'demonstrated' &&
    evidence['2.6'] === 'demonstrated' &&
    evidence['3.1'] === 'demonstrated' &&
    evidence['3.2'] === 'demonstrated' &&
    evidence['3.3'] === 'demonstrated'
  ) {
    nextQuest = { ...quest, workshopLead: true };
    events = recordEvent(events, 'workshop_lead');
  }
  nextQuest = syncPhase(nextQuest);
  const next: GameState = {
    ...state,
    evidence,
    newsroomQuest: nextQuest,
    journalEvents: events,
  };
  return {
    ...next,
    storyObjective: newsroomObjective(next),
  };
}

export function editorNode(state: GameState): DialogueNodeId {
  const quest = state.newsroomQuest;
  if (quest.workshopLead) return 'editor_thanks';
  if (quest.briefed) return 'editor_revisit';
  return 'editor_hello';
}

export function finishEditorBrief(state: GameState): GameState {
  const quest = syncPhase({ ...state.newsroomQuest, briefed: true });
  const next = { ...state, newsroomQuest: quest, editor: 'greeted' as const };
  return {
    ...next,
    mode: 'playing',
    dialogueNode: null,
    storyObjective: newsroomObjective(next),
  };
}

export function closeNewsroomDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node) return null;
  if (node === 'editor_hello' || node === 'editor_brief') {
    return finishEditorBrief(state);
  }
  if (node.startsWith('editor') || node === 'companion_after_newsroom' || node === 'locked_newsroom') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      editor: node.startsWith('editor') ? 'greeted' : state.editor,
    };
  }
  return null;
}

export function isNewsroomOverlay(mode: GameState['mode']): boolean {
  return mode === 'compare' || mode === 'draft' || mode === 'voice' || mode === 'letter';
}

export function isNewsroomExplain(topic: ExplainTopic | null): boolean {
  return (
    topic === 'compare' ||
    topic === 'verify' ||
    topic === 'review' ||
    topic === 'voice' ||
    topic === 'letter'
  );
}

export function closeNewsroomOverlay(state: GameState): GameState {
  const pending = state.newsroomQuest.pendingExplain;
  if (pending) {
    return {
      ...state,
      mode: 'explain',
      explainTopic: pending,
      newsroomQuest: { ...state.newsroomQuest, pendingExplain: null },
      inspectTarget: null,
    };
  }
  return {
    ...state,
    mode: 'playing',
    inspectTarget: null,
    explainTopic: null,
    shopFeedback: null,
    storyObjective: newsroomObjective(state),
  };
}

export function skipNewsroomExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    shopFeedback: null,
    storyObjective: newsroomObjective(state),
  };
}

function withQuest(state: GameState, quest: NewsroomQuest, extra: Partial<GameState> = {}): GameState {
  return awardNewsroomEvidence({ ...state, newsroomQuest: syncPhase(quest), ...extra });
}

type InspectTargetNews = 'source_a' | 'source_b' | 'clipping' | 'original' | 'editor_sample';

export function inspectNewsroom(state: GameState, target: InspectTargetNews): GameState {
  const quest = { ...state.newsroomQuest };
  if (target === 'source_a') quest.inspectedBulletin = true;
  if (target === 'source_b') quest.inspectedPoster = true;
  if (target === 'clipping') quest.inspectedClipping = true;
  if (target === 'original') {
    quest.inspectedOriginal = true;
    if (quest.inspectedClipping) quest.followedToOriginal = true;
  }
  if (target === 'editor_sample') quest.inspectedSample = true;
  return withQuest(
    { ...state, mode: 'inspect', inspectTarget: target, shopFeedback: null },
    quest,
  );
}

export function openDraft(state: GameState): GameState {
  const quest = { ...state.newsroomQuest, inspectedDraft: true };
  return withQuest({ ...state, mode: 'draft', shopFeedback: null }, quest);
}

export function openVoice(state: GameState): GameState {
  const quest = { ...state.newsroomQuest, inspectedSample: true };
  return withQuest({ ...state, mode: 'voice', shopFeedback: null }, quest);
}

export function reduceCompareToggle(state: GameState, field: CompareFlag): GameState {
  if (state.mode !== 'compare') return state;
  if (!COMPARE_FLAGS.includes(field)) return state;
  const quest: NewsroomQuest = { ...state.newsroomQuest, [field]: !state.newsroomQuest[field] };
  const passages = comparisonPassages(quest);
  quest.passageA = passages.passageA;
  quest.passageB = passages.passageB;
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceCompareSubmit(state: GameState, style: 'split' | 'consensus'): GameState {
  if (state.mode !== 'compare') return state;
  if (style === 'consensus') {
    const quest: NewsroomQuest = {
      ...state.newsroomQuest,
      consensusAttempted: true,
      compared: false,
    };
    return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.consensus });
  }
  if (!state.newsroomQuest.inspectedBulletin || !state.newsroomQuest.inspectedPoster) {
    return withQuest(state, state.newsroomQuest, { shopFeedback: NEWSROOM_FEEDBACK.inspectOnly });
  }
  if (!state.newsroomQuest.namedBulletin || !state.newsroomQuest.namedPoster) {
    return withQuest(state, { ...state.newsroomQuest, compared: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needBothNames,
    });
  }
  if (!state.newsroomQuest.hoursA || !state.newsroomQuest.hoursB) {
    return withQuest(state, { ...state.newsroomQuest, compared: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needHours,
    });
  }
  if (!state.newsroomQuest.accessA || !state.newsroomQuest.accessB) {
    return withQuest(state, { ...state.newsroomQuest, compared: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needAccess,
    });
  }
  const passages = comparisonPassages(state.newsroomQuest);
  if (!selectedPassagesReal(state.newsroomQuest) || !realPassage(SOURCE_A, passages.passageA) || !realPassage(SOURCE_B, passages.passageB)) {
    return withQuest(state, { ...state.newsroomQuest, compared: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needPassages,
    });
  }
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    passageA: passages.passageA,
    passageB: passages.passageB,
    compared: true,
    pendingExplain: 'compare',
  };
  return withQuest(state, quest, {
    shopFeedback: null,
    robotUnderstood: `${SOURCE_A_NAME} و${SOURCE_B_NAME} يختلفان في الساعات وفي الدخول.`,
  });
}

export function reduceCiteClipping(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'clipping') return state;
  if (!state.newsroomQuest.inspectedOriginal) {
    const quest: NewsroomQuest = { ...state.newsroomQuest, citedBeforeOriginal: true };
    return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.citeEarly });
  }
  return withQuest(state, state.newsroomQuest, { shopFeedback: NEWSROOM_FEEDBACK.needFollow });
}

export function reduceVerifyOriginal(state: GameState): GameState {
  if (state.mode !== 'inspect' || state.inspectTarget !== 'original') return state;
  if (!state.newsroomQuest.followedToOriginal || !state.newsroomQuest.inspectedOriginal) {
    return withQuest(state, state.newsroomQuest, { shopFeedback: NEWSROOM_FEEDBACK.needFollow });
  }
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    verifiedCite: true,
    pendingExplain: null,
  };
  return withQuest(state, quest, {
    shopFeedback: NEWSROOM_FEEDBACK.verifyOk,
    mode: 'explain',
    explainTopic: 'verify',
    inspectTarget: null,
  });
}

export function reduceDraftMark(state: GameState, mismatch: MismatchId): GameState {
  if (state.mode !== 'draft') return state;
  if (!MISMATCH_IDS.includes(mismatch)) return state;
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    inspectedDraft: true,
    marked: { ...state.newsroomQuest.marked, [mismatch]: !state.newsroomQuest.marked[mismatch] },
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceDraftCorrect(state: GameState, mismatch: MismatchId): GameState {
  if (state.mode !== 'draft') return state;
  if (!MISMATCH_IDS.includes(mismatch)) return state;
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    corrected: { ...state.newsroomQuest.corrected, [mismatch]: true },
  };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceDraftRelease(state: GameState): GameState {
  if (state.mode !== 'draft') return state;
  if (!anyMarked(state.newsroomQuest)) {
    const quest: NewsroomQuest = {
      ...state.newsroomQuest,
      releasedUnchecked: true,
      noticeReleased: false,
    };
    return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.unmarked });
  }
  if (!allCorrected(state.newsroomQuest)) {
    return withQuest(state, { ...state.newsroomQuest, noticeReleased: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.uncorrected,
    });
  }
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    noticeReleased: true,
    pendingExplain: 'review',
  };
  return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.releaseOk });
}

export function reduceVoiceApply(state: GameState, style: VoiceStyle): GameState {
  if (state.mode !== 'voice') return state;
  if (style === 'slogan') {
    const quest: NewsroomQuest = {
      ...state.newsroomQuest,
      voiceStyle: style,
      voiceMatched: false,
    };
    return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.slogan, robotUnderstood: voiceBody(style, quest) });
  }
  if (style === 'change_facts') {
    const quest: NewsroomQuest = {
      ...state.newsroomQuest,
      voiceStyle: style,
      voiceMatched: false,
      factsChanged: true,
    };
    return withQuest(state, quest, {
      shopFeedback: NEWSROOM_FEEDBACK.factsChanged,
      robotUnderstood: voiceBody(style, quest),
    });
  }
  const text = voiceBody('editor', state.newsroomQuest);
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    voiceStyle: 'editor',
    voiceMatched: true,
    factsChanged: false,
    pendingExplain: 'voice',
  };
  return withQuest(state, quest, {
    shopFeedback: NEWSROOM_FEEDBACK.voiceOk,
    robotUnderstood: text,
  });
}

export function reduceLetterSet(
  state: GameState,
  field: 'recipient' | 'purpose' | 'tone' | 'body',
  value: string,
): GameState {
  if (state.mode !== 'letter') return state;
  const quest: NewsroomQuest = { ...state.newsroomQuest, letterReviewed: false, letterSent: false };
  if (field === 'recipient') quest.letterRecipient = parseRecipient(value);
  if (field === 'purpose') quest.letterPurpose = parsePurpose(value);
  if (field === 'tone') quest.letterTone = parseTone(value);
  if (field === 'body') {
    quest.letterBody = value === 'long' ? LETTER_BODY_LONG : value === 'circular' ? `${LETTER_BODY_OK} ${CIRCULAR_14}.` : LETTER_BODY_OK;
  }
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceLetterReview(state: GameState): GameState {
  if (state.mode !== 'letter') return state;
  const quest: NewsroomQuest = { ...state.newsroomQuest, letterReviewed: true };
  return withQuest(state, quest, { shopFeedback: null });
}

export function reduceLetterSend(state: GameState, signer: LetterSigner): GameState {
  if (state.mode !== 'letter') return state;
  if (signer === 'robot_manager') {
    const quest: NewsroomQuest = {
      ...state.newsroomQuest,
      letterSignedBy: 'robot_manager',
      letterSent: false,
    };
    return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.robotManager });
  }
  if (letterHasCircular(state.newsroomQuest)) {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false, letterSignedBy: 'player' }, {
      shopFeedback: NEWSROOM_FEEDBACK.circular,
    });
  }
  if (state.newsroomQuest.letterRecipient !== 'workshop_manager') {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needRecipient,
    });
  }
  if (state.newsroomQuest.letterPurpose !== 'inspection') {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needPurpose,
    });
  }
  if (state.newsroomQuest.letterTone !== 'clear_polite') {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needTone,
    });
  }
  if (sentenceCount(state.newsroomQuest.letterBody) > 4) {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.tooLong,
    });
  }
  if (!state.newsroomQuest.letterReviewed) {
    return withQuest(state, { ...state.newsroomQuest, letterSent: false }, {
      shopFeedback: NEWSROOM_FEEDBACK.needReview,
    });
  }
  const quest: NewsroomQuest = {
    ...state.newsroomQuest,
    letterSignedBy: 'player',
    letterSent: true,
    pendingExplain: 'letter',
  };
  return withQuest(state, quest, { shopFeedback: NEWSROOM_FEEDBACK.letterOk });
}
