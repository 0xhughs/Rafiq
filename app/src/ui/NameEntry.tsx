import { NAME_MAX_CHARS } from '../engine/names';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  onConfirm: () => void;
  onRevise: () => void;
}

export function NameEntry({ state, onDraft, onSubmit, onConfirm, onRevise }: Props) {
  const confirming = state.mode === 'confirm_name';
  return (
    <div className="overlay" data-testid="name-overlay" role="dialog" aria-modal="true" aria-labelledby="game-title">
      <div className="panel name-panel">
        <p className="eyebrow">مغامرة عربية</p>
        <h1 id="game-title">رفيق — جواز إلى مدينة الذكاء الاصطناعي</h1>
        <p className="lead">استيقظ في شقتك، أخرج القمامة، وربما تلتقي برفيق غير متوقع.</p>
        {confirming ? (
          <div className="confirm-block">
            <p className="field-label">هل هذا اسمك؟ يمكنك تصحيحه قبل البداية.</p>
            <p className="name-preview" data-testid="name-preview">
              {state.playerName}
            </p>
            <div className="button-row">
              <button type="button" className="primary" data-testid="name-confirm" onClick={onConfirm} autoFocus>
                نعم، ابدأ
              </button>
              <button type="button" className="ghost" data-testid="name-correct" onClick={onRevise}>
                تصحيح الاسم
              </button>
            </div>
          </div>
        ) : (
          <form
            className="name-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label className="field-label" htmlFor="player-name">
              اسمك الكامل
            </label>
            <input
              id="player-name"
              data-testid="name-input"
              type="text"
              dir="auto"
              autoComplete="name"
              spellCheck={false}
              value={state.nameDraft}
              onChange={(event) => onDraft(event.target.value)}
              aria-invalid={Boolean(state.nameError)}
              aria-describedby={state.nameError ? 'name-error' : 'name-help'}
              autoFocus
            />
            <p id="name-help" className="hint-text">
              من حرفين إلى {NAME_MAX_CHARS} حرفاً. يمكن أن يكون عربياً أو مختلطاً.
            </p>
            {state.nameError ? (
              <p id="name-error" className="error" data-testid="name-error" role="alert">
                {state.nameError}
              </p>
            ) : null}
            <button type="submit" className="primary" data-testid="name-submit">
              ابدأ المغامرة
            </button>
          </form>
        )}
        <p className="dev-note" data-testid="dev-note">
          ملاحظة تطوير: تحديث الصفحة يعيد هذه الشريحة من البداية. لا يوجد حفظ بعد.
        </p>
      </div>
    </div>
  );
}
