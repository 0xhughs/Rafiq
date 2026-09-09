import type {
  DialogueLine,
  DialogueNodeId,
  JournalEvent,
  JournalEventId,
  MapId,
} from './types';
import { JOURNAL_CAP } from './constants';

export const OBJECTIVES = {
  takeTrash: 'أخرج كيس القمامة إلى الحاوية في الشارع.',
  carryOut: 'احمل الكيس عبر الباب وألقه في الحاوية.',
  inspectRobot: 'اقترب من الروبوت المعطوب وتحدّث إليه.',
  talkRobot: 'أكمل الحديث مع الروبوت بجانب الحاوية.',
  cornerStore: 'لنبدأ بالمتجر عند الزاوية: ادخل بقالة الزاوية، ثم سر إلى واجهة المكتبة.',
} as const;

export const SPEAKER = {
  player: (name: string) => name,
  robot: () => 'الروبوت',
  neighbor: () => 'الجارة',
  shopkeeper: () => 'البقال',
  notice: () => 'ملاحظة',
};

export const JOURNAL_TEXT: Record<JournalEventId, string> = {
  pickup: 'التقطتَ كيس القمامة من الشقة.',
  disposal: 'ألقيتَ الكيس في الحاوية بجانب الشارع.',
  help_accepted: 'وافقتَ على مساعدة الروبوت، وأصبح رفيقك في الحي.',
  neighbor_greeting: 'سلّمت على الجارة، ودلّتك على البقالة والمكتبة.',
  shop_visit: 'دخلتَ بقالة الزاوية.',
  library_visit: 'وصلتَ إلى واجهة المكتبة.',
};

export const LOCKED_COPY = {
  shop: (objective: string) =>
    `البقالة تُفتح بعد أن تساعد الروبوت. الهدف الحالي: ${objective}`,
  library: (objective: string) =>
    `واجهة المكتبة تنتظر بعد مساعدة الروبوت. الهدف الحالي: ${objective}`,
  libraryInner:
    'باب القاعة الداخلية مقفل الآن. ابدأ من بقالة الزاوية كما أشار الروبوت.',
} as const;

export const SAVE_STATUS_COPY = {
  absent: 'لم يُحفظ بعد.',
  ok: 'الحفظ محدّث على هذا المتصفح.',
  unavailable: 'الحفظ غير متاح على هذا المتصفح.',
  recovered: 'استُعيدت نسخة حفظ سابقة.',
} as const;

export const DIALOGUE: Record<DialogueNodeId, DialogueLine> = {
  pickup_leaving: {
    id: 'pickup_leaving',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'سأخرج كيس القمامة، ثم أعود.',
    next: null,
  },
  discover: {
    id: 'discover',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'ما هذا؟ روبوت؟',
    next: 'hello',
  },
  hello: {
    id: 'hello',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'مرحباً… من أنت؟',
    next: 'introduce',
  },
  introduce: {
    id: 'introduce',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: (name) => `اسمي ${name}. هل تحتاج إلى مساعدة؟`,
    next: 'broken',
  },
  broken: {
    id: 'broken',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'أستطيع الكلام، لكن بعض أجزائي لا تعمل. هل تساعدني في العثور عليها؟',
    next: 'wrong_fact',
  },
  wrong_fact: {
    id: 'wrong_fact',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'الجدران في شقتك زرقاء، وعلى الطاولة كتاب ضخم… هذا ما أتخيّله.',
    next: 'fact_admission',
  },
  fact_admission: {
    id: 'fact_admission',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'انتظر. لم أدخل الشقة، ولم أرَ الطاولة. الكلام بطلاقة لا يعني أنني أعرف ما لم أره.',
    next: 'ask_help',
  },
  ask_help: {
    id: 'ask_help',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'إذن… هل تساعدني؟',
    next: null,
    choices: [
      { id: 'agree', label: 'سأساعدك. من أين نبدأ؟' },
      { id: 'postpone', label: 'انتظر قليلاً. سأعود.' },
    ],
  },
  agree: {
    id: 'agree',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'سأساعدك. من أين نبدأ؟',
    next: 'lead',
  },
  lead: {
    id: 'lead',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'لنبدأ بالمتجر عند الزاوية. ربما يعرف صاحبه أين نجد قطعة مناسبة.',
    next: null,
  },
  companion_revisit: {
    id: 'companion_revisit',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'البقالة عند الزاوية مفتوحة. نستطيع دخولها الآن، ثم ننظر إلى المكتبة.',
    next: null,
  },
  neighbor_hello: {
    id: 'neighbor_hello',
    speaker: 'neighbor',
    speakerLabel: () => SPEAKER.neighbor(),
    text: () => 'صباح الخير. أنت جارنا الجديد؟',
    next: 'neighbor_reply',
  },
  neighbor_reply: {
    id: 'neighbor_reply',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'نعم. أبحث عن المتجر عند الزاوية.',
    next: 'neighbor_pointer',
  },
  neighbor_pointer: {
    id: 'neighbor_pointer',
    speaker: 'neighbor',
    speakerLabel: () => SPEAKER.neighbor(),
    text: () => 'البقالة هناك، والمكتبة أبعد قليلاً في الشارع.',
    next: null,
    choices: [
      { id: 'npc_thanks', label: 'شكراً، سأمر عليهما.' },
      { id: 'npc_postpone', label: 'انتظر قليلاً. سأعود.' },
    ],
  },
  neighbor_thanks: {
    id: 'neighbor_thanks',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'شكراً، سأمر عليهما.',
    next: null,
  },
  neighbor_revisit: {
    id: 'neighbor_revisit',
    speaker: 'neighbor',
    speakerLabel: () => SPEAKER.neighbor(),
    text: () => 'أهلاً من جديد. البقالة هناك، والمكتبة أبعد قليلاً في الشارع.',
    next: null,
  },
  shopkeeper_hello: {
    id: 'shopkeeper_hello',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'أهلاً بك في بقالة الزاوية. الرفوف ما زالت تُرتَّب، فتفضّل انظر ثم اخرج إلى الشارع.',
    next: null,
  },
  shopkeeper_revisit: {
    id: 'shopkeeper_revisit',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'ما زلنا نرتّب الرفوف. تجوّل كما تشاء، والحساب ليس جاهزاً بعد.',
    next: null,
  },
  locked_shop: {
    id: 'locked_shop',
    speaker: 'notice',
    speakerLabel: () => SPEAKER.notice(),
    text: (_name, objective?: string) => LOCKED_COPY.shop(objective ?? OBJECTIVES.takeTrash),
    next: null,
  },
  locked_library: {
    id: 'locked_library',
    speaker: 'notice',
    speakerLabel: () => SPEAKER.notice(),
    text: (_name, objective?: string) => LOCKED_COPY.library(objective ?? OBJECTIVES.takeTrash),
    next: null,
  },
  library_inner_locked: {
    id: 'library_inner_locked',
    speaker: 'notice',
    speakerLabel: () => SPEAKER.notice(),
    text: () => LOCKED_COPY.libraryInner,
    next: null,
  },
};

export function currentLine(node: DialogueNodeId | null): DialogueLine | null {
  if (!node) return null;
  return DIALOGUE[node];
}

export function recordEvent(events: JournalEvent[], id: JournalEventId): JournalEvent[] {
  if (events.some((event) => event.id === id)) return events;
  return [...events, { id, text: JOURNAL_TEXT[id] }].slice(-JOURNAL_CAP);
}

export function visitMap(visited: MapId[], id: MapId): MapId[] {
  if (visited.includes(id)) return visited;
  return [...visited, id];
}

export function isNpcNode(node: DialogueNodeId | null): boolean {
  return (
    node === 'neighbor_hello' ||
    node === 'neighbor_reply' ||
    node === 'neighbor_pointer' ||
    node === 'neighbor_thanks' ||
    node === 'neighbor_revisit' ||
    node === 'shopkeeper_hello' ||
    node === 'shopkeeper_revisit'
  );
}

export function isLockedNode(node: DialogueNodeId | null): boolean {
  return node === 'locked_shop' || node === 'locked_library' || node === 'library_inner_locked';
}
