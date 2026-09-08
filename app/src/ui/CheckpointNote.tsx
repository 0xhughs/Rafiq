interface Props {
  visible: boolean;
}

export function CheckpointNote({ visible }: Props) {
  if (!visible) return null;
  return (
    <aside className="checkpoint" data-testid="slice-checkpoint">
      <p>
        رفيق أصبح رفيقك في الحي. الهدف التالي: المتجر عند الزاوية. بقية أحداث المغامرة ما زالت قيد
        التطوير.
      </p>
    </aside>
  );
}
