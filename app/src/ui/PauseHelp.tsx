import { useState } from 'react';
import { SAVE_STATUS_COPY } from '../engine/dialogue';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onResume: () => void;
  onNewAdventure: () => void;
}

export function PauseHelp({ state, onResume, onNewAdventure }: Props) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      className="overlay"
      data-testid="pause-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      dir="rtl"
    >
      <div className="panel journal-panel">
        <h2 id="pause-title">دفتر الحي</h2>
        <p className="field-label">الخيط الحالي</p>
        <p data-testid="journal-lead">{state.storyObjective}</p>
        <p className="field-label">الهدف الحالي</p>
        <p data-testid="help-objective">{state.storyObjective}</p>
        <p className="field-label">أحداث القصة</p>
        <ul className="journal-events" data-testid="journal-events">
          {state.journalEvents.length === 0 ? (
            <li>لم تُسجَّل أحداث بعد. ابدأ من الشقة واخرج إلى الشارع.</li>
          ) : (
            state.journalEvents.map((event) => (
              <li key={event.id}>{event.text}</li>
            ))
          )}
        </ul>
        <p className="field-label">التحكم</p>
        <ul className="controls-list" data-testid="help-controls">
          <li>
            الحركة: الأسهم أو <span dir="ltr">WASD</span> حسب الاتجاه على الشاشة
          </li>
          <li>
            التفاعل: <span dir="ltr">E</span> أو مسافة، يظهر التلميح قرب الشيء فقط
          </li>
          <li>
            إيقاف أو إغلاق: <span dir="ltr">Esc</span>
          </li>
          <li>
            هذا الدفتر: <span dir="ltr">H</span> أو <span dir="ltr">J</span> أو الزر أعلاه
          </li>
        </ul>
        <p className="save-status" data-testid="save-status">
          {SAVE_STATUS_COPY[state.saveStatus]}
        </p>
        {confirming ? (
          <div className="confirm-block">
            <p>تبدأ مغامرة جديدة وتمحى حفظ رفيق على هذا المتصفح فقط. هل تريد ذلك؟</p>
            <div className="button-row">
              <button
                type="button"
                className="primary"
                data-testid="new-adventure-confirm"
                onClick={onNewAdventure}
              >
                نعم، بداية جديدة
              </button>
              <button type="button" className="ghost" onClick={() => setConfirming(false)}>
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="button-row">
            <button type="button" className="primary" data-testid="resume-button" onClick={onResume}>
              متابعة
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="new-adventure-button"
              onClick={() => setConfirming(true)}
            >
              بداية جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
