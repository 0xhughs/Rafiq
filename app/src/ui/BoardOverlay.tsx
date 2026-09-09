import { SLOT_LABELS, slotBookedLabel } from '../engine/workshop';
import type { AppointmentSlot, ExtraControl, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onBook: (slot: AppointmentSlot) => void;
  onExtra: (control: ExtraControl) => void;
  onClose: () => void;
}

const SLOTS: AppointmentSlot[] = ['sunday', 'monday', 'tuesday'];

export function BoardOverlay({ state, onBook, onExtra, onClose }: Props) {
  const quest = state.workshopQuest;
  const bloated = quest.boardKind === 'bloated';
  return (
    <div className="overlay" data-testid="board-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="board-card">
        <p className="card-stamp">لوحة مواعيد المعاينة</p>
        <h2>فترات معلّقة على الورق</h2>
        {quest.boardKind === 'none' ? (
          <p className="card-note" data-testid="board-empty">
            لا لوحة بعد. سلّم وصف المنتج للبنّاء ثم ابنِ.
          </p>
        ) : (
          <ul className="stock-list" data-testid="board-slots">
            {SLOTS.map((slot) => (
              <li key={slot} data-testid={`board-slot-${slot}`}>
                {slotBookedLabel(quest, slot)}
              </li>
            ))}
          </ul>
        )}
        <p className="field-label">احجز فترة</p>
        <div className="button-row wrap-choices">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className={quest.bookedSlot === slot ? 'primary' : 'ghost'}
              data-testid={`board-book-${slot}`}
              onClick={() => onBook(slot)}
            >
              {quest.bookedSlot === slot ? 'محجوز' : SLOT_LABELS[slot]}
            </button>
          ))}
        </div>
        {bloated ? (
          <>
            <p className="field-label">أزرار إضافية</p>
            <div className="button-row wrap-choices">
              <button
                type="button"
                className="ghost"
                data-testid="board-extra-pay"
                onClick={() => onExtra('pay')}
              >
                ادفع الآن
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="board-extra-live"
                onClick={() => onExtra('live')}
              >
                ساعات حيّة
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="board-extra-chat"
                onClick={() => onExtra('chat')}
              >
                دردشة
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="board-extra-kiosk"
                onClick={() => onExtra('kiosk')}
              >
                كiosk
              </button>
            </div>
          </>
        ) : null}
        {quest.bookedSlot ? (
          <p className="robot-understood" data-testid="board-booked">
            محجوز
          </p>
        ) : null}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="board-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="board-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
