interface Props {
  visible: boolean;
}

export function CheckpointNote({ visible }: Props) {
  if (!visible) return null;
  return (
    <aside className="checkpoint" data-testid="slice-checkpoint">
      <p>
        رفيق أصبح رفيقك في الحي. البقالة عند الزاوية مفتوحة الآن، وبعدها واجهة المكتبة. بقية ألغاز
        المغامرة ما زالت قيد التطوير.
      </p>
    </aside>
  );
}
