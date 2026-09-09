interface Props {
  visible: boolean;
  shopHelped: boolean;
  parcelDone: boolean;
  moduleReady: boolean;
  workshopLead: boolean;
}

export function CheckpointNote({ visible, shopHelped, parcelDone, moduleReady, workshopLead }: Props) {
  if (!visible) return null;
  let text =
    'رفيق أصبح رفيقك في الحي. البقالة عند الزاوية مفتوحة الآن، وبعدها واجهة المكتبة. بقية ألغاز المغامرة ما زالت قيد التطوير.';
  if (workshopLead) {
    text = 'المحررة شكرتك. خيط المعاينة يقود إلى ورشة الإصلاح. داخل الورشة لم يُفتح بعد.';
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
