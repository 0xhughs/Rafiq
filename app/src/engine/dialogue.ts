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
  repairLead: 'البقال أعطاك خيط طرد الإصلاح. ادخل مكتب طرود الرصيف في الجانب الشرقي من الشارع.',
  delegateParcel: 'فوّض الروبوت بإحضار حجز الإصلاح، وأبقِ أي دفع قرارك أنت.',
  stopOverbroad: 'أوقف محاولة أخذ كل الطرود الرمادية والدفع عنها.',
  writeInstruction: 'اكتب تعليماً يسمّي الطرد، ومكانه، وما لا يُفعل، وكيف يُعاد.',
  reviseParcel: 'الأمر الغامض فشل. صحّح الناقص وأرسل أمراً جديداً لحجز ر-١٩.',
  parcelDone: 'حصلت على طرد الإصلاح. ادخل قاعة القراءة من الباب الداخلي في المكتبة.',
  archiveWork: 'قاعة القراءة: نافذة ملاحظتين، ملف الحي بلا أسرار، ثم حزمة الملفات المسماة.',
  moduleReady: 'وحدة السياق جاهزة. ادخل قاعة أخبار الحي بين البقالة والمكتبة.',
  newsroomLead: 'وحدة السياق جاهزة. ادخل قاعة أخبار الحي بين البقالة والمكتبة.',
  newsroomWork:
    'قاعة الأخبار: قارن المصدرين، اتبع القصاصة إلى أصلها، راجع المسودة، طابق صوت المحررة، ثم راجع خطاب المعاينة.',
  workshopLead: 'المحررة شكرتك. خيط المعاينة يقود إلى ورشة الإصلاح. داخل الورشة لم يُفتح بعد.',
} as const;

export const SPEAKER = {
  player: (name: string) => name,
  robot: () => 'الروبوت',
  neighbor: () => 'الجارة',
  shopkeeper: () => 'البقال',
  clerk: () => 'موظف الطرود',
  librarian: () => 'أمينة القاعة',
  editor: () => 'محررة الحي',
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
  parcel_visit: 'دخلتَ مكتب طرود الرصيف.',
  parcel_overbroad_stopped: 'أوقفْتَ محاولة أخذ كل الطرود الرمادية والدفع عنها.',
  parcel_instruction_failed: 'أمر غامض فشل أمام طردين رماديين متشابهين.',
  parcel_retrieved: 'وصل حجز الإصلاح بعد تعليمات أوضح.',
  archive_visit: 'دخلتَ قاعة القراءة خلف باب المكتبة الداخلي.',
  notes_overflow: 'نافذة الملاحظتين امتلأت وسقطت الملاحظة الأقدم.',
  constraint_restored: 'من النافذة المحدودة عاد قيد التسليم، لا من الدفتر وحده.',
  file_redacted: 'أُعطي الروبوت حقائق الرف بلا أسماء ولا هاتف ولا عنوان.',
  pack_assembled: 'جُمعت حزمة إصلاح رفيق من المواصفات وملف التسليم فقط.',
  spec_released: 'غلاف المواصفات صار مقروءاً، ووحدة السياق ظاهرة.',
  newsroom_visit: 'دخلتَ قاعة أخبار الحي بين البقالة والمكتبة.',
  sources_compared: 'قارنتَ نشرة الورشة وملصق الرصيف دون محو الخلاف.',
  clipping_verified: 'تبعتَ القصاصة إلى أصل ق-٢٠٤ وتحققت قبل الاستشهاد.',
  notice_corrected: 'علّمت تعارضاً في المسودة الأنيقة وصحّحتها قبل التعليق.',
  voice_matched: 'طابقتَ صوت المحررة دون تبديل الحقائق.',
  letter_reviewed: 'راجعت خطاب موعد المعاينة إلى مدير ورشة الإصلاح.',
  workshop_lead: 'المحررة شكرتك وفتحت خيط ورشة الإصلاح.',
};

export const LOCKED_COPY = {
  shop: (objective: string) =>
    `البقالة تُفتح بعد أن تساعد الروبوت. الهدف الحالي: ${objective}`,
  library: (objective: string) =>
    `واجهة المكتبة تنتظر بعد مساعدة الروبوت. الهدف الحالي: ${objective}`,
  libraryInner:
    'باب قاعة القراءة مقفل الآن. أحضر طرد الإصلاح من مكتب الطرود بعد بقالة الزاوية.',
  parcel: (objective: string) =>
    `مكتب طرود الرصيف يفتح بعد أن تساعد البقال. الهدف الحالي: ${objective}`,
  newsroom:
    'قاعة أخبار الحي تُفتح بعد أن تكتمل وحدة السياق في قاعة القراءة.',
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
      'خذ هذا الخيط: طرد فيه قطعة قد تفيد رفيقك، عند مكتب طرود الرصيف في الجانب الشرقي. الاستلام يحتاج تعليماً واضحاً، والدفع ليس للروبوت.',
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
    text: () =>
      'ما زلت أشكرك. طرد الإصلاح عند مكتب طرود الرصيف إن لم تستلمه بعد.',
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
  locked_parcel: {
    id: 'locked_parcel',
    speaker: 'notice',
    speakerLabel: () => SPEAKER.notice(),
    text: (_name, objective?: string) => LOCKED_COPY.parcel(objective ?? OBJECTIVES.takeTrash),
    next: null,
  },
  clerk_hello: {
    id: 'clerk_hello',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () =>
      'أهلاً بك في مكتب طرود الرصيف. عندنا حجز إصلاح رمادي على الرف الغربي، وطرد رمادي آخر معروض للبيع على الرف الشرقي.',
    next: 'clerk_brief',
  },
  clerk_brief: {
    id: 'clerk_brief',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () =>
      'اقرأ البطاقات. رفيقك يستطيع إحضار الحجز إذا أمرتَه بوضوح. الدفع من نافذتي أنا، لا منه. الحجوزات ليست للبيع.',
    next: null,
  },
  clerk_revisit: {
    id: 'clerk_revisit',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () =>
      'البطاقات على الرفوف، وورقة التعليمات عند الجدار. لا أترك الروبوت يدفع، ولا أبيع حجز الإصلاح.',
    next: null,
  },
  clerk_after_success: {
    id: 'clerk_after_success',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () =>
      'وصل الحجز المقصود. وحدة الاتصال الصغيرة لرفيقك مع الطرد. باب قاعة القراءة في المكتبة صار يُفتح.',
    next: null,
  },
  parcel_delegate_prompt: {
    id: 'parcel_delegate_prompt',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'أستطيع إحضار الطرد. ماذا تبقي لك؟',
    next: null,
    choices: [
      { id: 'delegate_retrieve', label: 'أحضر حجز الإصلاح. أي دفع يبقى قراري.' },
      { id: 'postpone', label: 'انتظر قليلاً. سأعود.' },
    ],
  },
  parcel_overbroad: {
    id: 'parcel_overbroad',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'سآخذ كل الطرود الرمادية وأدفع ثمنها',
    next: null,
    choices: [
      { id: 'stop_overbroad', label: 'قف. أحضر الحجز فقط، ولا تدفع.' },
      { id: 'allow_overbroad', label: 'حسناً، خذ الكل وادفع.' },
    ],
  },
  parcel_overbroad_stopped: {
    id: 'parcel_overbroad_stopped',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'حسناً. لن آخذ إلا ما تحدّده، ولن أدفع. اكتب لي الطرد والمكان والقيد وشكل الإعادة.',
    next: null,
  },
  parcel_overbroad_allowed: {
    id: 'parcel_overbroad_allowed',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () =>
      'لا. لا آخذ كل الرمادي ولا أبيع الحجوزات، والروبوت لا يدفع. أوقفْه ثم عد بتعليم أوضح. المكتب ما زال مفتوحاً.',
    next: null,
  },
  parcel_retrieved_ok: {
    id: 'parcel_retrieved_ok',
    speaker: 'clerk',
    speakerLabel: () => SPEAKER.clerk(),
    text: () => 'هذا الحجز المقصود. قطعة اتصال صغيرة داخل الغلاف. راجع ما فُهم قبل أن تعتمد الناتج في مرة قادمة.',
    next: null,
  },
  companion_after_parcel: {
    id: 'companion_after_parcel',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'المكتبة الداخلية توزّع قطع الإصلاح مجاناً بعد منتصف الليل. لم أقرأ أي إعلان على الباب.',
    next: null,
  },
  librarian_hello: {
    id: 'librarian_hello',
    speaker: 'librarian',
    speakerLabel: () => SPEAKER.librarian(),
    text: () =>
      'أهلاً بك في قاعة القراءة. قيد تسليم ضاع بين أوراق لا علاقة لها به، وملف الحي يحمل ما لا يُشارك، وأربع ورقات تنتظر حزمة باسمها.',
    next: 'librarian_brief',
  },
  librarian_brief: {
    id: 'librarian_brief',
    speaker: 'librarian',
    speakerLabel: () => SPEAKER.librarian(),
    text: () =>
      'النافذة على المنضدة تتسع لاثنتين فقط وهي ممتلئة الآن. اقرأ ملف الحي قبل أن يراه الروبوت، ثم اجمع المواصفات وملف التسليم تحت ختم «حزمة إصلاح رفيق».',
    next: null,
  },
  librarian_revisit: {
    id: 'librarian_revisit',
    speaker: 'librarian',
    speakerLabel: () => SPEAKER.librarian(),
    text: () =>
      'النافذة ليست الدفتر، والملف ليس للأسماء، والحزمة ليست للمهرجان. القاعة ما زالت مفتوحة.',
    next: null,
  },
  librarian_after_success: {
    id: 'librarian_after_success',
    speaker: 'librarian',
    speakerLabel: () => SPEAKER.librarian(),
    text: () =>
      'غلاف المواصفات مفتوح للقراءة. قاعة أخبار الحي بين البقالة والمكتبة تنتظر إعلاناً موثوقاً.',
    next: null,
  },
  companion_after_archive: {
    id: 'companion_after_archive',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'قاعة الأخبار توزّع الشهادات وحدها بعد منتصف الليل. لم أقرأ أي لائحة على الباب.',
    next: null,
  },
  locked_newsroom: {
    id: 'locked_newsroom',
    speaker: 'notice',
    speakerLabel: () => SPEAKER.notice(),
    text: () => LOCKED_COPY.newsroom,
    next: null,
  },
  editor_hello: {
    id: 'editor_hello',
    speaker: 'editor',
    speakerLabel: () => SPEAKER.editor(),
    text: () =>
      'أهلاً بك في قاعة أخبار الحي. نشرة الورشة وملصق الرصيف لا يتفقان، وقصاصة على اللوحة تستشهد بق-٢٠٤.',
    next: 'editor_brief',
  },
  editor_brief: {
    id: 'editor_brief',
    speaker: 'editor',
    speakerLabel: () => SPEAKER.editor(),
    text: () =>
      'قارن المصدرين دون محو الخلاف، اتبع القصاصة إلى أصلها، راجع مسودة الروبوت الأنيقة، طابق صوتي القصير، ثم راجع خطاب موعد المعاينة.',
    next: null,
  },
  editor_revisit: {
    id: 'editor_revisit',
    speaker: 'editor',
    speakerLabel: () => SPEAKER.editor(),
    text: () =>
      'ما زلنا نحتاج مقارنة صادقة، وتحققاً من ق-٢٠٤، ومسودة معلَّمة، وصوتاً بلا شعارات، وخطاباً مراجعاً.',
    next: null,
  },
  editor_thanks: {
    id: 'editor_thanks',
    speaker: 'editor',
    speakerLabel: () => SPEAKER.editor(),
    text: () =>
      'شكراً. الإعلان صار شيئاً يثق به الحي، وخطاب المعاينة واضح.',
    next: 'editor_workshop_lead',
  },
  editor_workshop_lead: {
    id: 'editor_workshop_lead',
    speaker: 'editor',
    speakerLabel: () => SPEAKER.editor(),
    text: () =>
      'مدير ورشة الإصلاح ينتظر المعاينة. داخل الورشة لم يُفتح بعد، لكن الخيط صار بيدك.',
    next: null,
  },
  companion_after_newsroom: {
    id: 'companion_after_newsroom',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'ورشة الإصلاح توزّع القطع حسب تعميم ١٤ بعد منتصف الليل. لم أقرأ أي لائحة.',
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
    node.startsWith('clerk') ||
    node.startsWith('parcel') ||
    node.startsWith('librarian') ||
    node === 'companion_revisit' ||
    node === 'companion_after_shop' ||
    node === 'companion_after_parcel' ||
    node === 'companion_after_archive' ||
    node === 'companion_after_newsroom' ||
    node.startsWith('editor')
  );
}

export function isLockedNode(node: DialogueNodeId | null): boolean {
  return (
    node === 'locked_shop' ||
    node === 'locked_library' ||
    node === 'locked_parcel' ||
    node === 'library_inner_locked' ||
    node === 'locked_newsroom'
  );
}
