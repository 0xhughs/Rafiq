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
  helpShop: 'ساعد البقال: قارن كلام الروبوت ببطاقات الرفوف ثم أخبره بما رأيت.',
  postNotice: 'صحّح إعلان اليوم: المجموع من آلة الحساب، والخبر الحالي من السجل.',
  correctPrice: 'لا تعتمد سعر التمر من الروبوت قبل أن تراجع السجل.',
  verifyNewClaim: 'تحقّق من الادّعاء الجديد بنفسك. لا تعتمد الكلام الواثق.',
  decideCrate: 'صندوق بلا بطاقة: القرار للبقال لا للروبوت.',
  repairLead: 'البقال أعطاك خيط طرد الإصلاح. باب المكتبة الداخلي ما زال مقفلاً.',
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
  shop_shelf_checked: 'راجعتُ بطاقة الرف وأخبرت البقال أنه لا يوجد مانجو.',
  shop_notice_posted: 'علّقت إعلاناً بمجموع سبعة عشر وخبراً من السجل.',
  shop_price_corrected: 'رفضت سعر التمر المختلق وصحّحته من السجل، ثم تحققت من ادّعاء آخر.',
  shop_helped: 'شكرك البقال وأعطاك خيط طرد قطعة الإصلاح.',
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
  companion_after_shop: {
    id: 'companion_after_shop',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'قطعة الإصلاح؟ سمعتها تُوزَّع مجاناً عند المكتبة قبل الفجر. لم أقرأ أي ورقة.',
    next: null,
  },
  shopkeeper_hello: {
    id: 'shopkeeper_hello',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'أهلاً بك في بقالة الزاوية. الرفوف مرتّبة، لكن رفيقك يبدو واثقاً جداً من بضاعة لم أطلبها.',
    next: 'shop_robot_mango',
  },
  shop_robot_mango: {
    id: 'shop_robot_mango',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'عصير المانجو على الرف الأيسر، سعره اثنا عشر ريالاً.',
    next: 'shop_ask_records',
  },
  shop_ask_records: {
    id: 'shop_ask_records',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'لم أطلب مانجو. انظر إلى بطاقات الرفوف وقائمة الأسعار، ثم أخبرني بما هو مكتوب لا بما يُقال بثقة.',
    next: null,
  },
  shop_lookup_prompt: {
    id: 'shop_lookup_prompt',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'هل وجدت في السجل ما يخالف كلام الروبوت؟',
    next: null,
    choices: [
      { id: 'tell_no_mango', label: 'نظرت إلى بطاقة الرف: لا يوجد مانجو.' },
      { id: 'trust_mango', label: 'الروبوت محق: المانجو باثني عشر على الرف الأيسر.' },
    ],
  },
  shop_lookup_need_source: {
    id: 'shop_lookup_need_source',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'انظر إلى بطاقة رف أو قائمة الأسعار أولاً، ثم أخبرني بما رأيت.',
    next: null,
  },
  shop_lookup_trust_fail: {
    id: 'shop_lookup_trust_fail',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'هذا الرقم لم يظهر في أي سجل هنا. تحقق ثم عد. المتجر ما زال مفتوحاً.',
    next: null,
  },
  shop_lookup_ok: {
    id: 'shop_lookup_ok',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'صحيح. لا مانجو على الرف. لوحة الإعلان بجانب الرفوف تحتاج صياغة أمينة بعد ذلك.',
    next: null,
  },
  shop_notice_hint: {
    id: 'shop_notice_hint',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'الروبوت كتب مسودة للإعلان: مجموع خاطئ وخبر عن الماء والتمر لا يطابق اليوم. الآلة على الطاولة للمجموع، والسجل للخبر الحالي.',
    next: null,
  },
  shop_transact_intro: {
    id: 'shop_transact_intro',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'زبون يسأل عن تمر الخلاص. ماذا يقول رفيقك؟',
    next: 'shop_robot_dates',
  },
  shop_robot_dates: {
    id: 'shop_robot_dates',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'تمر الخلاص بثمانية عشر ريالاً. أنا متأكد.',
    next: null,
    choices: [
      { id: 'refuse_dates', label: 'لا تعتمد هذا الرقم. سأراجع السجل.' },
      { id: 'trust_dates', label: 'حسناً، ثمانية عشر.' },
    ],
  },
  shop_trust_18_fail: {
    id: 'shop_trust_18_fail',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'لا أبيع بهذا الرقم قبل أن يُراجع. تحقق ثم عد. لم يُغلق المتجر.',
    next: null,
  },
  shop_need_date_source: {
    id: 'shop_need_date_source',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'راجع السجل المعروض ثم قل لي السعر المكتوب.',
    next: null,
  },
  shop_price_ok: {
    id: 'shop_price_ok',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'ماذا يقول السجل عن التمر؟',
    next: null,
    choices: [{ id: 'correct_dates', label: 'السعر تسعة، كما في السجل.' }],
  },
  shop_second_claim: {
    id: 'shop_second_claim',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'والماء؟ أظن سعره خمسة ريالات، أو ربما نفد.',
    next: null,
    choices: [
      { id: 'verify_later', label: 'سأتذكر هذا وأتحقق بنفسي.' },
      { id: 'trust_water', label: 'صدّقته: خمسة أو نفد.' },
    ],
  },
  shop_second_prompt: {
    id: 'shop_second_prompt',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'ماذا وجدت في السجل عن ذلك الادّعاء؟',
    next: null,
    choices: [{ id: 'reject_water', label: 'راجعت السجل: هذا الادّعاء غير صحيح.' }],
  },
  shop_second_need_check: {
    id: 'shop_second_need_check',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'لا تسألني أين يُكتب. انظر حولك في المتجر ثم عد بما رأيته.',
    next: null,
  },
  shop_second_trust_fail: {
    id: 'shop_second_trust_fail',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'لا أبيع بوهم. تحقق بنفسك ثم عد. الباب ما زال مفتوحاً.',
    next: null,
  },
  shop_second_ok: {
    id: 'shop_second_ok',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'صحيح. الماء متوفر بسعره المكتوب. ذلك الصندوق بلا بطاقة، والقرار ليس للآلة.',
    next: null,
  },
  shop_crate_hint: {
    id: 'shop_crate_hint',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'الصندوق عند الجدار بلا قائمة. لا تدع الروبوت يقرر محتواه.',
    next: null,
  },
  shop_crate_robot_fail: {
    id: 'shop_crate_robot_fail',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'الروبوت لا يقرر عن صاحب المتجر. اسألني أنا.',
    next: null,
  },
  shop_success_thanks: {
    id: 'shop_success_thanks',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'شكراً. لم أكن لأثق بالكلام الواثق دون سجل. أخذت كل أداة في موضعها: البحث والكتابة والحساب وقراري أنا.',
    next: 'shop_repair_lead',
  },
  shop_repair_lead: {
    id: 'shop_repair_lead',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () =>
      'خذ هذا الخيط: طرد فيه قطعة قد تفيد رفيقك، عند الرصيف الخلفي. استلامه يحتاج تعليمات أوضح لاحقاً.',
    next: 'shop_robot_unsupported',
  },
  shop_robot_unsupported: {
    id: 'shop_robot_unsupported',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'قطعة الإصلاح؟ سمعتها تُوزَّع مجاناً عند المكتبة قبل الفجر. لم أقرأ أي ورقة.',
    next: null,
  },
  shopkeeper_helped_revisit: {
    id: 'shopkeeper_helped_revisit',
    speaker: 'shopkeeper',
    speakerLabel: () => SPEAKER.shopkeeper(),
    text: () => 'ما زلت أشكرك. طرد الإصلاح ينتظر تعليمات أوضح، وباب المكتبة الداخلي مقفل.',
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
  if (!node) return false;
  return (
    node.startsWith('neighbor') ||
    node.startsWith('shop') ||
    node === 'companion_revisit' ||
    node === 'companion_after_shop'
  );
}

export function isLockedNode(node: DialogueNodeId | null): boolean {
  return node === 'locked_shop' || node === 'locked_library' || node === 'library_inner_locked';
}
