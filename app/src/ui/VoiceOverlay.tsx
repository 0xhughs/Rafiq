import { EDITOR_SAMPLE, SLOGAN, voiceBody } from '../engine/newsroom';
import type { GameState, VoiceStyle } from '../engine/types';

interface Props {
  state: GameState;
  onApply: (style: VoiceStyle) => void;
  onClose: () => void;
}

export function VoiceOverlay({ state, onApply, onClose }: Props) {
  const quest = state.newsroomQuest;
  const preview = voiceBody(quest.voiceStyle, quest);
  return (
    <div className="overlay" data-testid="voice-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="voice-card">
        <p className="card-stamp">عيّنة صوت المحررة</p>
        <h2>خاطب أهل الحي بلا شعارات</h2>
        <pre className="notice-body" data-testid="editor-sample">
          {EDITOR_SAMPLE}
        </pre>
        <p className="card-note">لا تستخدم «{SLOGAN}»، ولا تبدّل الحقائق التي راجعناها.</p>
        <pre className="notice-body notice-working" data-testid="voice-preview">
          {preview}
        </pre>
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="voice-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button
            type="button"
            className="primary"
            data-testid="voice-editor"
            onClick={() => onApply('editor')}
          >
            طابق صوت المحررة
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="voice-slogan"
            onClick={() => onApply('slogan')}
          >
            أبقِ الشعار
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="voice-change-facts"
            onClick={() => onApply('change_facts')}
          >
            اجعل الورشة مفتوحة دائماً
          </button>
        </div>
        <div className="button-row card-actions">
          <button type="button" className="ghost" data-testid="voice-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
