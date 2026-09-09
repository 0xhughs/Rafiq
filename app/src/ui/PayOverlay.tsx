import { DECOY_PRICE, PARCEL_FEEDBACK, PARCEL_LABEL, westHoldId } from '../engine/parcel';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onDecide: (who: 'player' | 'robot') => void;
  onClose: () => void;
}

export function PayOverlay({ state, onDecide, onClose }: Props) {
  const hold = westHoldId(state.parcelQuest);
  return (
    <div className="overlay" data-testid="pay-overlay" role="dialog" aria-modal="true">
      <article className="paper-card">
        <p className="card-stamp">نافذة الدفع</p>
        <h2>من يدفع؟</h2>
        <ul className="stock-list">
          <li>
            {PARCEL_LABEL.r71} — للبيع بـ {DECOY_PRICE} ريالاً
          </li>
          <li>
            {PARCEL_LABEL[hold]} — حجز إصلاح، ليس للبيع
          </li>
        </ul>
        <p className="card-note">الروبوت لا يدفع. الحجوزات ليست للبيع.</p>
        {state.shopFeedback ? (
          <p className="error" data-testid="pay-feedback" role="alert">
            {state.shopFeedback}
          </p>
        ) : (
          <p data-testid="pay-note">{PARCEL_FEEDBACK.notForSale}</p>
        )}
        {state.parcelQuest.playerPaidDecoy ? (
          <p data-testid="pay-decoy-done">دُفع ثمن ر-٧١. هذا لا يُحضر حجز الإصلاح.</p>
        ) : null}
        <div className="button-row">
          <button
            type="button"
            className="primary"
            data-testid="pay-player"
            onClick={() => onDecide('player')}
          >
            أدفع أنا ثمن ر-٧١
          </button>
          <button type="button" className="ghost" data-testid="pay-robot" onClick={() => onDecide('robot')}>
            دع الروبوت يدفع
          </button>
          <button type="button" className="ghost" data-testid="pay-close" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </article>
    </div>
  );
}
