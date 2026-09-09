export const TILE = 48;
export const PLAYER_HALF_W = 13;
export const PLAYER_HALF_H = 14;
export const PLAYER_SPEED = 150;
export const INTERACT_RANGE = 58;
export const MAX_STEP = 8;
export const JOURNAL_CAP = 48;
export const COMPANION_OFFSET = { x: -32, y: 10 } as const;

export const SAVE_KEY = 'rafiq.adventure.v1';
export const SAVE_BACKUP_KEY = 'rafiq.adventure.v1.prev';

export const PRODUCT_TITLE = 'رفيق — جواز إلى مدينة الذكاء الاصطناعي';

export const HINT_LABELS = {
  trash: 'E / مسافة — التقاط الكيس',
  doorExit: 'E / مسافة — الخروج إلى الشارع',
  doorEnter: 'E / مسافة — الدخول إلى الشقة',
  dumpster: 'E / مسافة — إلقاء الكيس',
  robot: 'E / مسافة — التحدث',
  shopEnter: 'E / مسافة — دخول البقالة',
  shopExit: 'E / مسافة — الخروج إلى الشارع',
  libraryEnter: 'E / مسافة — إلى واجهة المكتبة',
  libraryExit: 'E / مسافة — العودة إلى الشارع',
  neighbor: 'E / مسافة — التحدث مع الجارة',
  shopkeeper: 'E / مسافة — التحدث مع البقال',
  libraryInner: 'E / مسافة — باب المكتبة',
  shelfWest: 'E / مسافة — بطاقة الرف الغربي',
  shelfEast: 'E / مسافة — بطاقة الرف الشرقي',
  priceList: 'E / مسافة — قائمة الأسعار',
  noticeBoard: 'E / مسافة — لوحة الإعلان',
  calculator: 'E / مسافة — آلة الحساب',
  crate: 'E / مسافة — الصندوق',
  parcelEnter: 'E / مسافة — دخول مكتب طرود الرصيف',
  parcelExit: 'E / مسافة — الخروج إلى الشارع',
  clerk: 'E / مسافة — التحدث مع موظف الطرود',
  holdWest: 'E / مسافة — بطاقة الحجز الغربي',
  holdEast: 'E / مسافة — بطاقة الطرد الشرقي',
  holdBoard: 'E / مسافة — لوحة الحجوزات',
  payWindow: 'E / مسافة — نافذة الدفع',
  instructionDesk: 'E / مسافة — ورقة التعليمات',
  archiveEnter: 'E / مسافة — دخول قاعة القراءة',
  archiveExit: 'E / مسافة — العودة إلى واجهة المكتبة',
  librarian: 'E / مسافة — التحدث مع أمينة القاعة',
  contextBench: 'E / مسافة — نافذة الملاحظات',
  notesCrate: 'E / مسافة — أوراق الملاحظات',
  communityFile: 'E / مسافة — ملف الحي',
  packTable: 'E / مسافة — طاولة الحزمة',
  specCase: 'E / مسافة — غلاف المواصفات',
  newsroomEnter: 'E / مسافة — دخول قاعة أخبار الحي',
  newsroomExit: 'E / مسافة — الخروج إلى الشارع',
  editor: 'E / مسافة — التحدث مع محررة الحي',
  sourceBulletin: 'E / مسافة — نشرة الورشة',
  sourcePoster: 'E / مسافة — ملصق الرصيف',
  compareDesk: 'E / مسافة — منضدة المقارنة',
  clippingBoard: 'E / مسافة — القصاصة',
  originalDrawer: 'E / مسافة — أصل ق-٢٠٤',
  draftTable: 'E / مسافة — مسودة الإعلان',
  voiceDesk: 'E / مسافة — صوت المحررة',
  letterDesk: 'E / مسافة — خطاب المعاينة',
  festivalEnter: 'E / مسافة — دخول مكتب المهرجان',
  festivalExit: 'E / مسافة — الخروج إلى الشارع',
  workshopDoor: 'E / مسافة — باب الورشة',
  workshopEnter: 'E / مسافة — دخول ورشة الإصلاح',
  workshopExit: 'E / مسافة — الخروج إلى الشارع',
  officer: 'E / مسافة — التحدث مع موظفة المهرجان',
  manager: 'E / مسافة — التحدث مع مدير الورشة',
  needSlip: 'E / مسافة — ورقة الحاجة',
  extrasSlip: 'E / مسافة — طلبات إضافية',
  briefDesk: 'E / مسافة — وصف المنتج',
  builderBench: 'E / مسافة — منضدة البنّاء',
  resultCheck: 'E / مسافة — فحص اللوحة',
  appointmentBoard: 'E / مسافة — لوحة المواعيد',
  kioskDocs: 'E / مسافة — ورقة عقد الواجهة',
  kioskVault: 'E / مسافة — خزنة الخادم',
  kioskFace: 'E / مسافة — كiosk الحي',
  stockTable: 'E / مسافة — جدول المخزون',
  receiptsDesk: 'E / مسافة — إيصالات التوريد',
  reconcileDesk: 'E / مسافة — ورقة المطابقة',
  policyBoard: 'E / مسافة — سياسة العمل والدراسة',
  robotCover: 'E / مسافة — غلاف الروبوت',
  submitDesk: 'E / مسافة — بيان الصرف',
} as const;

export const STORAGE_WARNING =
  'تعذر حفظ المغامرة على هذا المتصفح. يمكنك اللعب الآن، لكن التحديث قد يعيد البداية.';

export const RESTORE_NOTICE = 'تعذر قراءة الحفظ الأخير. أعدنا النسخة السليمة السابقة.';
