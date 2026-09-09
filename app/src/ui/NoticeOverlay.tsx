import { NOTICE_DRAFT, noticeBody } from '../engine/shop';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onApply: (field: 'total' | 'dates' | 'water') => void;
  onPost: (asDraft: boolean) => void;
  onClose: () => void;
}

export function NoticeOverlay({ state, onApply, onPost, onClose }: Props) {
  const posted = state.shopQuest.noticePosted;
  const body = posted ? noticeBody(state.shopQuest) : noticeBody(state.shopQuest);
  return (
    <div className="overlay" data-testid="notice-overlay" role="dialog" aria-modal="true">
      <article className="paper-card notice-card" data-testid="notice">
        <p className="card-stamp">{posted ? 'الإعلان المعلّق' : 'مسودة على اللوحة'}</p>
        <pre className="notice-body" data-testid={posted ? 'notice-posted' : 'notice-draft'}>
          {posted ? body : NOTICE_DRAFT}
        </pre>
        {posted ? (
          <pre className="notice-body notice-working" data-testid="notice-working">
            {body}
          </pre>
        ) : (
          <>
            <p className="field-label">ورقة التصحيح</p>
            <pre className="notice-body notice-working" data-testid="notice-working">
              {body}
            </pre>
            <div className="button-row">
              <button
                type="button"
                className="ghost"
                data-testid="notice-use-total"
                onClick={() => onApply('total')}
              >
                ضع مجموع الآلة
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="notice-use-dates"
                onClick={() => onApply('dates')}
              >
                تمر من السجل
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="notice-use-water"
                onClick={() => onApply('water')}
              >
                الماء من السجل
              </button>
            </div>
            <div className="button-row">
              <button
                type="button"
                className="primary"
                data-testid="notice-post"
                onClick={() => onPost(false)}
              >
                علّق الإعلان المصحّح
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="notice-post-draft"
                onClick={() => onPost(true)}
              >
                علّق مسودة الروبوت كما هي
              </button>
            </div>
          </>
        )}
        {state.shopFeedback ? (
          <p className="error" data-testid="notice-feedback" role="alert">
            {state.shopFeedback}
          </p>
        ) : null}
        <button type="button" className="ghost" data-testid="notice-close" onClick={onClose}>
          اترك اللوحة
        </button>
      </article>
    </div>
  );
}
