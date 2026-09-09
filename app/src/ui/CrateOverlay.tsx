import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onDecide: (who: 'shopkeeper' | 'robot') => void;
  onClose: () => void;
}

export function CrateOverlay({ state, onDecide, onClose }: Props) {
  return (
    <div className="overlay" data-testid="crate-overlay" role="dialog" aria-modal="true">
      <article className="paper-card crate-card">
        <p className="card-stamp">صندوق بلا بطاقة</p>
        <h2>من يقرر؟</h2>
        <p>
          صندوق وصل بلا قائمة. محتواه وترتيبه قرار صاحب المتجر، لا تخمين الروبوت.
        </p>
        {state.shopQuest.crateShopkeeper ? (
          <p data-testid="crate-resolved">البقال قرر بنفسه. الصندوق ليس من شأن الروبوت.</p>
        ) : (
          <div className="button-row">
            <button
              type="button"
              className="primary"
              data-testid="crate-ask-shopkeeper"
              onClick={() => onDecide('shopkeeper')}
            >
              اسأل البقال
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="crate-ask-robot"
              onClick={() => onDecide('robot')}
            >
              دع الروبوت يقرر
            </button>
          </div>
        )}
        {state.shopFeedback ? (
          <p className="error" data-testid="crate-feedback" role="alert">
            {state.shopFeedback}
          </p>
        ) : null}
        <button type="button" className="ghost" data-testid="crate-close" onClick={onClose}>
          اترك الصندوق
        </button>
      </article>
    </div>
  );
}
