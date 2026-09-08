import { currentLine } from '../engine/dialogue';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onAdvance: () => void;
  onAgree: () => void;
  onPostpone: () => void;
}

export function DialogueOverlay({ state, onAdvance, onAgree, onPostpone }: Props) {
  const line = currentLine(state.dialogueNode);
  if (!line) return null;
  const speaker = line.speakerLabel(state.playerName);
  const text = line.text(state.playerName);
  const canPostpone = state.dialogueNode !== 'pickup_leaving' && state.encounter !== 'unseen';
  return (
    <div
      className="overlay dialogue-overlay"
      data-testid="dialogue-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-speaker"
      aria-describedby="dialogue-text"
    >
      <div className="panel speech-panel">
        <p id="dialogue-speaker" className="speaker" data-testid="dialogue-speaker">
          {speaker}
        </p>
        <p id="dialogue-text" className="speech" data-testid="dialogue-text">
          {text}
        </p>
        {line.choices ? (
          <div className="button-row">
            <button type="button" className="primary" data-testid="dialogue-agree" onClick={onAgree}>
              {line.choices[0]?.label}
            </button>
            <button type="button" className="ghost" data-testid="dialogue-postpone" onClick={onPostpone}>
              {line.choices[1]?.label}
            </button>
          </div>
        ) : (
          <div className="button-row">
            <button type="button" className="primary" data-testid="dialogue-advance" onClick={onAdvance}>
              متابعة
            </button>
            {canPostpone ? (
              <button type="button" className="ghost" data-testid="dialogue-close" onClick={onPostpone}>
                إغلاق
              </button>
            ) : null}
          </div>
        )}
        <p className="hint-text">
          مفتاح واحد في كل مرة: <span dir="ltr">E</span> أو مسافة للمتابعة. الضغط المستمر لا يتخطى الحوار.
        </p>
      </div>
    </div>
  );
}
