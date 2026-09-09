import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onClose: () => void;
}

export function InspectOverlay({ state, onClose }: Props) {
  const target = state.inspectTarget;
  if (!target) return null;
  return (
    <div
      className="overlay"
      data-testid="inspect-overlay"
      role="dialog"
      aria-modal="true"
    >
      {target === 'west' ? (
        <article className="paper-card" data-testid="shelf-record-west">
          <p className="card-stamp">بطاقة الرف الغربي</p>
          <h2>مخزون الرف الأيسر</h2>
          <ul className="stock-list">
            <li>خبز — ٣</li>
            <li>لبن — ٤</li>
            <li>ماء — ٢ متوفر</li>
          </ul>
          <p className="card-note">لا يوجد عصير مانجو على هذه البطاقة.</p>
        </article>
      ) : null}
      {target === 'east' ? (
        <article className="paper-card" data-testid="shelf-record-east">
          <p className="card-stamp">بطاقة الرف الشرقي</p>
          <h2>مخزون الرف الأيمن</h2>
          <ul className="stock-list">
            <li>تمر الخلاص — ٩</li>
          </ul>
          <p className="card-note">لا يوجد مانجو في هذا السجل.</p>
        </article>
      ) : null}
      {target === 'price' ? (
        <article className="paper-card" data-testid="price-list">
          <p className="card-stamp">قائمة الأسعار</p>
          <h2>بقالة الزاوية</h2>
          <ul className="stock-list">
            <li>خبز — ٣</li>
            <li>لبن — ٤</li>
            <li>ماء — ٢ متوفر</li>
            <li>تمر الخلاص — ٩</li>
          </ul>
          <p className="card-hours">مفتوح حتى المغرب</p>
          <p className="card-note">لا يوجد مانجو في القائمة.</p>
        </article>
      ) : null}
      <div className="button-row card-actions">
        <button type="button" className="primary" data-testid="inspect-close" onClick={onClose}>
          إعادة البطاقة
        </button>
      </div>
    </div>
  );
}
