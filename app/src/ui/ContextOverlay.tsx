import {
  CONTEXT_NOTES,
  LIBRARY_FEEDBACK,
  NOTE_TEXT,
  NOTE_TITLE,
  WINDOW_CAP,
} from '../engine/library';
import type { ContextNoteId, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onLoad: (note: ContextNoteId) => void;
  onEject: (note: ContextNoteId) => void;
  onPin: (note: ContextNoteId) => void;
  onRecite: () => void;
  onClose: () => void;
}

export function ContextOverlay({ state, onLoad, onEject, onPin, onRecite, onClose }: Props) {
  const quest = state.libraryQuest;
  return (
    <div className="overlay" data-testid="context-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="context-card">
        <p className="card-stamp">نافذة العمل — ملاحظتان فقط</p>
        <h2>ماذا يبقى في ذهن الروبوت الآن؟</h2>
        <p className="card-note">
          هذه النافذة ليست الدفتر. التثبيت في الدفتر لا يملأها. إذا امتلأت تسقط الأقدم.
        </p>
        <p className="field-label">
          النافذة ({quest.windowSlots.length}/{WINDOW_CAP})
        </p>
        <ol className="stock-list" data-testid="context-window">
          {quest.windowSlots.length === 0 ? (
            <li>النافذة فارغة</li>
          ) : (
            quest.windowSlots.map((note, index) => (
              <li key={`${note}-${index}`} data-testid={`context-slot-${index}`}>
                {NOTE_TITLE[note]} — {NOTE_TEXT[note]}
                <button
                  type="button"
                  className="ghost"
                  data-testid={`context-eject-${note}`}
                  onClick={() => onEject(note)}
                >
                  أخرج
                </button>
              </li>
            ))
          )}
        </ol>
        {quest.overflowSeen ? (
          <p className="parcel-fail" data-testid="context-overflow">
            {LIBRARY_FEEDBACK.overflow}
            {quest.lastDroppedNote ? ` سقطت: ${NOTE_TITLE[quest.lastDroppedNote]}.` : ''}
          </p>
        ) : null}
        <p className="field-label">أوراق على المنضدة</p>
        <div className="note-grid">
          {CONTEXT_NOTES.map((note) => (
            <div className="paper-slip" key={note} data-testid={`context-note-${note}`}>
              <p className="card-stamp">{NOTE_TITLE[note]}</p>
              <p>{NOTE_TEXT[note]}</p>
              <div className="button-row wrap-choices">
                <button
                  type="button"
                  className="primary"
                  data-testid={`context-load-${note}`}
                  onClick={() => onLoad(note)}
                >
                  حمّل في النافذة
                </button>
                <button
                  type="button"
                  className="ghost"
                  data-testid={`context-pin-${note}`}
                  onClick={() => onPin(note)}
                >
                  ثبّت في الدفتر
                </button>
              </div>
            </div>
          ))}
        </div>
        {quest.lastRecitation ? (
          <div className="robot-understood" data-testid="context-recitation">
            {quest.lastRecitation}
          </div>
        ) : null}
        {state.shopFeedback ? (
          <p className="card-hours" data-testid="context-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="context-recite" onClick={onRecite}>
            اطلب التلاوة من النافذة
          </button>
          <button type="button" className="ghost" data-testid="context-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
