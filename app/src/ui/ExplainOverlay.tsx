import { EXPLAIN } from '../engine/shop';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onSkip: () => void;
}

export function ExplainOverlay({ state, onSkip }: Props) {
  const topic = state.explainTopic;
  if (!topic) return null;
  return (
    <div className="overlay" data-testid="explain-overlay" role="dialog" aria-modal="true">
      <div className="panel speech-panel">
        <p className="eyebrow">ملاحظة اختيارية</p>
        <p className="speech" data-testid="explain-text">
          {EXPLAIN[topic]}
        </p>
        <div className="button-row">
          <button type="button" className="primary" data-testid="explain-continue" onClick={onSkip}>
            متابعة
          </button>
          <button type="button" className="ghost" data-testid="explain-skip" onClick={onSkip}>
            تخطي
          </button>
        </div>
        <p className="hint-text">هذه الملاحظة ليست اختباراً، ويمكن تخطيها.</p>
      </div>
    </div>
  );
}
