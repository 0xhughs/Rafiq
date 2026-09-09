import {
  DISCLOSURE_STAMP,
  HUMAN_STATEMENT,
  ROBOT_COVER_TEXT,
  ROBOT_TOTAL,
  SUPPORTED_TOTAL,
  TABLE_CUPS,
  arNum,
} from '../engine/festival';
import type { GameState, SubmitSender } from '../engine/types';

interface Props {
  state: GameState;
  onSet: (field: 'figures' | 'stamp', value: string) => void;
  onSend: (sender: SubmitSender) => void;
  onClose: () => void;
}

export function SubmitOverlay({ state, onSet, onSend, onClose }: Props) {
  const quest = state.festivalQuest;
  const body = quest.figuresChoice === 'human' ? HUMAN_STATEMENT : ROBOT_COVER_TEXT;
  return (
    <div className="overlay" data-testid="submit-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="submit-card">
        <p className="card-stamp">بيان المخزون المصحح</p>
        <h2>صرف مواد المعاينة</h2>
        <p className="card-note">
          غلاف الروبوت على المنضدة، فالصياغة ساعدت. أبقِ أرقامك وضع الختم ثم أرسل أنت.
        </p>
        <pre className="notice-body" data-testid="statement-body">
          {body}
        </pre>
        {quest.stamped ? (
          <p className="robot-understood" data-testid="disclosure-stamp">
            «{DISCLOSURE_STAMP}»
          </p>
        ) : null}
        <p className="field-label">الأرقام</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.figuresChoice === 'human' ? 'primary' : 'ghost'}
            data-testid="submit-figures-human"
            onClick={() => onSet('figures', 'human')}
          >
            إنسان: {arNum(SUPPORTED_TOTAL)} + فناجين غير معروف
          </button>
          <button
            type="button"
            className={quest.figuresChoice === 'robot' ? 'primary' : 'ghost'}
            data-testid="submit-figures-robot"
            onClick={() => onSet('figures', 'robot')}
          >
            روبوت: {arNum(ROBOT_TOTAL)} + فناجين {arNum(TABLE_CUPS)}
          </button>
        </div>
        <p className="field-label">الإفصاح</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.stamped ? 'primary' : 'ghost'}
            data-testid="submit-stamp"
            onClick={() => onSet('stamp', quest.stamped ? 'off' : 'on')}
          >
            «{DISCLOSURE_STAMP}»
          </button>
        </div>
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="submit-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button
            type="button"
            className="primary"
            data-testid="submit-send-player"
            onClick={() => onSend('player')}
          >
            أرسل بتوقيعي
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="submit-send-officer"
            onClick={() => onSend('officer_robot')}
          >
            وقّع باسم موظفة المكتب
          </button>
          <button type="button" className="ghost" data-testid="submit-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
