import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onResume: () => void;
}

export function PauseHelp({ state, onResume }: Props) {
  return (
    <div
      className="overlay"
      data-testid="pause-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="panel">
        <h2 id="pause-title">دفتر الحي</h2>
        <p className="field-label">الهدف الحالي</p>
        <p data-testid="help-objective">{state.storyObjective}</p>
        <p className="field-label">التحكم</p>
        <ul className="controls-list" data-testid="help-controls">
          <li>
            الحركة: الأسهم أو <span dir="ltr">WASD</span> حسب الاتجاه على الشاشة
          </li>
          <li>
            التفاعل: <span dir="ltr">E</span> أو مسافة، يظهر التلميح قرب الشيء فقط
          </li>
          <li>
            إيقاف أو إغلاق: <span dir="ltr">Esc</span>
          </li>
          <li>
            هذا الدفتر: <span dir="ltr">H</span> أو الزر أعلاه
          </li>
        </ul>
        <p className="dev-note">
          ملاحظة تطوير: تحديث الصفحة يعيد هذه الشريحة من البداية. لا يوجد حفظ بعد.
        </p>
        <button type="button" className="primary" data-testid="resume-button" onClick={onResume}>
          متابعة
        </button>
      </div>
    </div>
  );
}
