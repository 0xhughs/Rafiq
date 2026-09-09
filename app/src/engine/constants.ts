export const TILE = 48;
export const PLAYER_HALF_W = 13;
export const PLAYER_HALF_H = 14;
export const PLAYER_SPEED = 150;
export const INTERACT_RANGE = 58;
export const MAX_STEP = 8;
export const JOURNAL_CAP = 12;
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
} as const;

export const STORAGE_WARNING =
  'تعذر حفظ المغامرة على هذا المتصفح. يمكنك اللعب الآن، لكن التحديث قد يعيد البداية.';

export const RESTORE_NOTICE = 'تعذر قراءة الحفظ الأخير. أعدنا النسخة السليمة السابقة.';
