interface Props {
  visible: boolean;
  shopHelped: boolean;
  parcelDone: boolean;
}

export function CheckpointNote({ visible, shopHelped, parcelDone }: Props) {
  if (!visible) return null;
  let text =
    'رفيق أصبح رفيقك في الحي. البقالة عند الزاوية مفتوحة الآن، وبعدها واجهة المكتبة. بقية ألغاز المغامرة ما زالت قيد التطوير.';
  if (parcelDone) {
    text = 'حصلت على طرد الإصلاح. باب المكتبة الداخلي ما زال مقفلاً.';
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
