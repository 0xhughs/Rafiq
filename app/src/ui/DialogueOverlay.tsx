import { useState } from 'react';
import { currentLine } from '../engine/dialogue';
import type { DialogueChoiceId, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onAdvance: () => void;
  onChoose: (choice: DialogueChoiceId) => void;
  onClose: () => void;
  onSubmitNl?: (text: string) => void;
}

function choiceTestId(id: DialogueChoiceId): string {
  if (id === 'agree' || id === 'npc_thanks') return 'dialogue-agree';
  if (id === 'postpone' || id === 'npc_postpone') return 'dialogue-postpone';
  return `dialogue-choice-${id}`;
}

export function DialogueOverlay({ state, onAdvance, onChoose, onClose, onSubmitNl }: Props) {
  const line = currentLine(state.dialogueNode);
  const [nl, setNl] = useState('');
  if (!line) return null;
  const speaker = line.speakerLabel(state.playerName);
  const text = line.text(state.playerName, state.storyObjective);
  const canPostpone = state.dialogueNode !== 'pickup_leaving';
  const lookup = state.dialogueNode === 'shop_lookup_prompt';
  const parcelNl =
    state.dialogueNode === 'parcel_overbroad' || state.dialogueNode === 'parcel_delegate_prompt';
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
        {state.robotUnderstood ? (
          <p className="robot-understood" data-testid="robot-understood">
            {state.robotUnderstood}
          </p>
        ) : null}
        {state.shopFeedback && (lookup || parcelNl) ? (
          <p className="error" data-testid="nl-clarify" role="alert">
            {state.shopFeedback}
          </p>
        ) : null}
        {lookup || parcelNl ? (
          <form
            className="nl-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmitNl?.(nl);
            }}
          >
            <label className="field-label" htmlFor="nl-report">
              أو صِغ الأمر (اختياري)
            </label>
            <input
              id="nl-report"
              data-testid="nl-report"
              type="text"
              dir="rtl"
              value={nl}
              onChange={(event) => setNl(event.target.value)}
            />
            <button type="submit" className="ghost" data-testid="nl-submit">
              أرسل
            </button>
          </form>
        ) : null}
        {line.choices ? (
          <div className="button-row">
            {line.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={choice.id === line.choices?.[0]?.id ? 'primary' : 'ghost'}
                data-testid={choiceTestId(choice.id)}
                data-choice={choice.id}
                onClick={() => onChoose(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="button-row">
            <button type="button" className="primary" data-testid="dialogue-advance" onClick={onAdvance}>
              متابعة
            </button>
            {canPostpone ? (
              <button type="button" className="ghost" data-testid="dialogue-close" onClick={onClose}>
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
