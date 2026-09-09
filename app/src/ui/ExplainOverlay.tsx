import { EXPLAIN } from '../engine/shop';
import { PARCEL_EXPLAIN } from '../engine/parcel';
import { LIBRARY_EXPLAIN } from '../engine/library';
import { NEWSROOM_EXPLAIN } from '../engine/newsroom';
import { FESTIVAL_EXPLAIN } from '../engine/festival';
import { WORKSHOP_EXPLAIN } from '../engine/workshop';
import { KIOSK_EXPLAIN } from '../engine/kiosk';
import { LAB_EXPLAIN } from '../engine/lab';
import { AGENT_EXPLAIN } from '../engine/agent';
import { BRIDGE_EXPLAIN } from '../engine/bridge';
import { SKILL_EXPLAIN } from '../engine/skill';
import { APPROVE_EXPLAIN } from '../engine/approval';
import { CREW_EXPLAIN } from '../engine/crew';
import { PATH_EXPLAIN } from '../engine/path';
import { PASSPORT_EXPLAIN } from '../engine/passport';
import type { GameState } from '../engine/types';

const NOTES = {
  ...EXPLAIN,
  ...PARCEL_EXPLAIN,
  ...LIBRARY_EXPLAIN,
  ...NEWSROOM_EXPLAIN,
  ...FESTIVAL_EXPLAIN,
  ...WORKSHOP_EXPLAIN,
  ...KIOSK_EXPLAIN,
  ...LAB_EXPLAIN,
  ...AGENT_EXPLAIN,
  ...BRIDGE_EXPLAIN,
  ...SKILL_EXPLAIN,
  ...APPROVE_EXPLAIN,
  ...CREW_EXPLAIN,
  ...PATH_EXPLAIN,
  ...PASSPORT_EXPLAIN,
};

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
          {topic ? NOTES[topic] : ''}
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
