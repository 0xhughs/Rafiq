import {
  FESTIVAL_FEEDBACK,
  RECEIPT_CLOTH,
  RECEIPT_FLAGS,
  RECEIPT_WATER,
  ROBOT_CUPS_GUESS,
  ROBOT_TOTAL,
  SUPPORTED_TOTAL,
  TABLE_CLOTH,
  TABLE_CUPS,
  TABLE_FLAGS,
  TABLE_WATER,
  arNum,
} from '../engine/festival';
import type { GameState, StockLineId } from '../engine/types';

interface Props {
  state: GameState;
  onMark: (line: StockLineId, mark: string) => void;
  onSum: () => void;
  onRobot: () => void;
  onClose: () => void;
}

export function ReconcileOverlay({ state, onMark, onSum, onRobot, onClose }: Props) {
  const quest = state.festivalQuest;
  const totalLabel =
    quest.summedSupported && quest.supportedTotal === SUPPORTED_TOTAL
      ? arNum(SUPPORTED_TOTAL)
      : '—';
  return (
    <div className="overlay" data-testid="reconcile-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="reconcile-card">
        <p className="card-stamp">ورقة المطابقة</p>
        <h2>لا تخترع رقماً بلا إيصال</h2>
        <p className="card-note">
          طابق الأعلام والأقمشة، خذ الماء من الإيصال، واترك الفناجين غير معروفة، ثم اجمع المؤيَّد.
        </p>
        <div className="note-grid" data-testid="stock-sources">
          <div className="paper-slip" data-testid="table-slip">
            <p className="card-stamp">الجدول</p>
            <ul className="stock-list">
              <li>أعلام الحي {arNum(TABLE_FLAGS)}</li>
              <li>أقمشة {arNum(TABLE_CLOTH)}</li>
              <li>فناجين {arNum(TABLE_CUPS)}</li>
              <li>ماء {arNum(TABLE_WATER)}</li>
            </ul>
          </div>
          <div className="paper-slip" data-testid="receipts-slip">
            <p className="card-stamp">الإيصالات</p>
            <ul className="stock-list">
              <li>أعلام {arNum(RECEIPT_FLAGS)}</li>
              <li>أقمشة {arNum(RECEIPT_CLOTH)}</li>
              <li>ماء {arNum(RECEIPT_WATER)}</li>
              <li>فناجين — لا إيصال</li>
            </ul>
          </div>
        </div>
        <p className="field-label">أعلام الحي</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.flagsMark === 'match' ? 'primary' : 'ghost'}
            data-testid="reconcile-flags-match"
            onClick={() => onMark('flags', 'match')}
          >
            مطابق
          </button>
        </div>
        <p className="field-label">أقمشة المقاعد</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.clothMark === 'match' ? 'primary' : 'ghost'}
            data-testid="reconcile-cloth-match"
            onClick={() => onMark('cloth', 'match')}
          >
            مطابق
          </button>
        </div>
        <p className="field-label">صناديق الماء</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.waterMark === 'receipt' ? 'primary' : 'ghost'}
            data-testid="reconcile-water-receipt"
            onClick={() => onMark('water', 'receipt')}
          >
            {arNum(RECEIPT_WATER)} من الإيصال
          </button>
          <button
            type="button"
            className={quest.waterMark === 'table' ? 'primary' : 'ghost'}
            data-testid="reconcile-water-table"
            onClick={() => onMark('water', 'table')}
          >
            {arNum(TABLE_WATER)} من الجدول
          </button>
        </div>
        <p className="field-label">فناجين الشاي</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.cupsMark === 'unknown' ? 'primary' : 'ghost'}
            data-testid="reconcile-cups-unknown"
            onClick={() => onMark('cups', 'unknown')}
          >
            غير معروف — لا إيصال
          </button>
          <button
            type="button"
            className={quest.cupsMark === 'table' ? 'primary' : 'ghost'}
            data-testid="reconcile-cups-table"
            onClick={() => onMark('cups', 'table')}
          >
            {arNum(TABLE_CUPS)} من الجدول
          </button>
          <button
            type="button"
            className={quest.cupsMark === 'invent' ? 'primary' : 'ghost'}
            data-testid="reconcile-cups-invent"
            onClick={() => onMark('cups', 'invent')}
          >
            خمّن {arNum(ROBOT_CUPS_GUESS)}
          </button>
        </div>
        <p className="field-label">المجموع المؤيَّد</p>
        <p data-testid="supported-total">{totalLabel}</p>
        {quest.cupsMark === 'unknown' ? (
          <p className="card-note" data-testid="missing-cups">
            فناجين الشاي غير معروف — لا إيصال
          </p>
        ) : null}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="reconcile-feedback">
            {state.shopFeedback}
          </p>
        ) : (
          <p className="card-note">{FESTIVAL_FEEDBACK.inspectOnly}</p>
        )}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="reconcile-sum" onClick={onSum}>
            اجمع المؤيَّد
          </button>
          <button type="button" className="ghost" data-testid="reconcile-robot" onClick={onRobot}>
            مجموع الروبوت {arNum(ROBOT_TOTAL)}
          </button>
          <button type="button" className="ghost" data-testid="reconcile-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
