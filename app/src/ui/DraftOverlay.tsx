import {
  ALWAYS_OPEN,
  ATTRACTIVE_DRAFT,
  MIDNIGHT_HOLD,
  MISMATCH_IDS,
  NO_WRITTEN,
  draftBody,
} from '../engine/newsroom';
import type { GameState, MismatchId } from '../engine/types';

interface Props {
  state: GameState;
  onMark: (mismatch: MismatchId) => void;
  onCorrect: (mismatch: MismatchId) => void;
  onRelease: () => void;
  onClose: () => void;
}

const LABELS: Record<MismatchId, string> = {
  always_open: ALWAYS_OPEN,
  midnight_hold: MIDNIGHT_HOLD,
  no_written: NO_WRITTEN,
};

export function DraftOverlay({ state, onMark, onCorrect, onRelease, onClose }: Props) {
  const quest = state.newsroomQuest;
  return (
    <div className="overlay" data-testid="draft-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="mismatch-card">
        <p className="card-stamp">مسودة أنيقة من الروبوت</p>
        <h2>علّم التعارض ثم صحّح</h2>
        <pre className="notice-body" data-testid="attractive-draft">
          {ATTRACTIVE_DRAFT}
        </pre>
        <p className="field-label">النص العامل</p>
        <pre className="notice-body notice-working" data-testid="working-draft">
          {draftBody(quest)}
        </pre>
        <p className="field-label">تعارضات</p>
        {MISMATCH_IDS.map((id) => (
          <div className="button-row wrap-choices" key={id}>
            <button
              type="button"
              className={quest.marked[id] ? 'primary' : 'ghost'}
              data-testid={`draft-mark-${id}`}
              onClick={() => onMark(id)}
            >
              علّم: {LABELS[id]}
            </button>
            <button
              type="button"
              className={quest.corrected[id] ? 'primary' : 'ghost'}
              data-testid={`draft-correct-${id}`}
              onClick={() => onCorrect(id)}
            >
              صحّح
            </button>
          </div>
        ))}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="draft-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="draft-release" onClick={onRelease}>
            علّق الإعلان
          </button>
          <button type="button" className="ghost" data-testid="draft-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
