import { CHECKPOINT_AFTER_HELP, OBJECTIVES } from '../engine/dialogue';

interface Props {
  visible: boolean;
  shopHelped: boolean;
  parcelDone: boolean;
  moduleReady: boolean;
  workshopLead: boolean;
  newsroomStarted: boolean;
  festivalStarted: boolean;
  workshopMaterials: boolean;
  workshopStarted: boolean;
  servicePosted: boolean;
  kioskReady: boolean;
  labReady: boolean;
  agentReady: boolean;
  bridgeReady: boolean;
  skillReady: boolean;
  approvalReady: boolean;
  crewReady: boolean;
  restored: boolean;
  invited: boolean;
  issued: boolean;
}

export function CheckpointNote({
  visible,
  shopHelped,
  parcelDone,
  moduleReady,
  workshopLead,
  newsroomStarted,
  festivalStarted,
  workshopMaterials,
  workshopStarted,
  servicePosted,
  kioskReady,
  labReady,
  agentReady,
  bridgeReady,
  skillReady,
  approvalReady,
  crewReady,
  restored,
  invited,
  issued,
}: Props) {
  if (!visible) return null;
  let text = CHECKPOINT_AFTER_HELP;
  if (issued) {
    text = OBJECTIVES.passportIssued;
  } else if (invited) {
    text = OBJECTIVES.passportReady;
  } else if (restored) {
    text = OBJECTIVES.restored;
  } else if (crewReady) {
    text = OBJECTIVES.pathWork;
  } else if (approvalReady) {
    text = OBJECTIVES.crewWork;
  } else if (skillReady) {
    text = OBJECTIVES.approvalWork;
  } else if (bridgeReady) {
    text = OBJECTIVES.skillWork;
  } else if (agentReady) {
    text = OBJECTIVES.bridgeWork;
  } else if (labReady) {
    text = OBJECTIVES.agentWork;
  } else if (kioskReady) {
    text =
      'مختبر النشر مفتوح: أعد إنتاج عطل النسخة المجمّدة، اقرأ السجلات، أصلح المسار، انشر نسخة ثابتة، ثم تحقق.';
  } else if (servicePosted) {
    text =
      'الكiosk معلّق بجانب اللوحة: اقرأ عقد الواجهة، أبقِ المفتاح الوهمي في الخزنة، ثم أصلح اتجاه العربية واختبر الحجز.';
  } else if (workshopStarted) {
    text =
      'ورشة الإصلاح: اكتب وصف المنتج للوحة المواعيد، سلمه للبنّاء، طابق اللوحة، ثم احجز فترة معلّقة.';
  } else if (workshopMaterials) {
    text = 'وصلت مواد المعاينة. ادخل ورشة الإصلاح من الباب الجنوبي.';
  } else if (festivalStarted) {
    text =
      'مكتب المهرجان: طابق الجدول بالإيصالات، اترك الفناجين غير معروفة، ثم أرسل بيان الصرف المختوم.';
  } else if (workshopLead) {
    text = 'المحررة شكرتك. ادخل مكتب المهرجان في الواجهة الجنوبية لتحضير بيان صرف مواد المعاينة للورشة.';
  } else if (newsroomStarted) {
    text =
      'قاعة الأخبار: قارن المصدرين، اتبع القصاصة إلى أصلها، راجع المسودة، طابق صوت المحررة، ثم راجع خطاب المعاينة.';
  } else if (moduleReady) {
    text = 'وحدة السياق جاهزة. ادخل قاعة أخبار الحي بين البقالة والمكتبة.';
  } else if (parcelDone) {
    text = 'حصلت على طرد الإصلاح. باب قاعة القراءة في المكتبة صار يُفتح.';
  } else if (shopHelped) {
    text =
      'البقال أعطاك خيط الطرد. مكتب طرود الرصيف في الجانب الشرقي مفتوح. باب المكتبة الداخلي ما زال مقفلاً.';
  }
  return (
    <aside className="checkpoint" data-testid="slice-checkpoint">
      <p>{text}</p>
    </aside>
  );
}
