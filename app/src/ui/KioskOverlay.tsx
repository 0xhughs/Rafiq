import {
  CHECKLIST,
  DEMO_SLOT_KEY,
  KIOSK_FEEDBACK,
  KIOSK_TITLE,
  SLOT_ID_LABELS,
} from '../engine/kiosk';
import type { AppointmentSlot, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onStrip: () => void;
  onEmbed: () => void;
  onMoveVault: () => void;
  onSend: () => void;
  onSetRtl: () => void;
  onIsolate: () => void;
  onLookup: (slot: AppointmentSlot) => void;
  onCheck: (item: 'title' | 'slot' | 'lookup') => void;
  onRobotDone: () => void;
  onClose: () => void;
}

const SLOTS: AppointmentSlot[] = ['sunday', 'monday', 'tuesday'];

export function KioskOverlay({
  state,
  onStrip,
  onEmbed,
  onMoveVault,
  onSend,
  onSetRtl,
  onIsolate,
  onLookup,
  onCheck,
  onRobotDone,
  onClose,
}: Props) {
  const quest = state.kioskQuest;
  const dir = quest.layoutRtl ? 'rtl' : 'ltr';
  const faceKeyLine = quest.faceHasKey ? `${'x-api-key'}: ${DEMO_SLOT_KEY}` : 'x-api-key: —';
  return (
    <div className="overlay" data-testid="kiosk-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="kiosk-card">
        <p className="card-stamp">كiosk الحي</p>
        <div
          className="kiosk-face"
          data-testid="kiosk-face"
          dir={dir}
          style={{ direction: dir }}
        >
          <h2 data-testid="kiosk-title">{KIOSK_TITLE}</h2>
          <p data-testid="kiosk-header-line">{faceKeyLine}</p>
          <ul className="stock-list" data-testid="kiosk-slots">
            {SLOTS.map((slot) => (
              <li key={slot} data-testid={`kiosk-slot-${slot}`}>
                {quest.slotIdLtr ? (
                  <span className="slot-id-ltr" dir="ltr" data-testid={`slot-id-${slot}`}>
                    {SLOT_ID_LABELS[slot]}
                  </span>
                ) : (
                  SLOT_ID_LABELS[slot]
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="field-label">عقد الإرسال</p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="kiosk-strip" onClick={onStrip}>
            انزع المفتاح من الوجه
          </button>
          <button type="button" className="ghost" data-testid="kiosk-embed" onClick={onEmbed}>
            أعد المفتاح إلى الوجه
          </button>
          <button type="button" className="ghost" data-testid="kiosk-move-vault" onClick={onMoveVault}>
            انقل المفتاح الوهمي إلى الخزنة
          </button>
          <button type="button" className="primary" data-testid="kiosk-send" onClick={onSend}>
            أرسل الطلب
          </button>
        </div>
        <p className="field-label">اتجاه الواجهة</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.layoutRtl ? 'primary' : 'ghost'}
            data-testid="kiosk-set-rtl"
            onClick={onSetRtl}
          >
            اجعل الاتجاه من اليمين
          </button>
          <button
            type="button"
            className={quest.slotIdLtr ? 'primary' : 'ghost'}
            data-testid="kiosk-isolate"
            onClick={onIsolate}
          >
            اعزل مقطع slot-id
          </button>
        </div>
        <p className="field-label">اختبار يدوي</p>
        <div className="button-row wrap-choices">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className="ghost"
              data-testid={`kiosk-lookup-${slot}`}
              onClick={() => onLookup(slot)}
            >
              اطلب {SLOT_ID_LABELS[slot]}
            </button>
          ))}
        </div>
        <p className="field-label">قائمة التحقق</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.manualTitleRtl ? 'primary' : 'ghost'}
            data-testid="kiosk-check-title"
            onClick={() => onCheck('title')}
          >
            {CHECKLIST.title}
          </button>
          <button
            type="button"
            className={quest.manualSlotLtr ? 'primary' : 'ghost'}
            data-testid="kiosk-check-slot"
            onClick={() => onCheck('slot')}
          >
            {CHECKLIST.slot}
          </button>
          <button
            type="button"
            className={quest.manualLookup ? 'primary' : 'ghost'}
            data-testid="kiosk-check-lookup"
            onClick={() => onCheck('lookup')}
          >
            {CHECKLIST.lookup}
          </button>
        </div>
        {quest.requestOk ? (
          <p className="robot-understood" data-testid="kiosk-response">
            {KIOSK_FEEDBACK.ok200}
          </p>
        ) : null}
        {quest.lookupDone && state.shopFeedback && state.shopFeedback.startsWith('تم طلب') ? (
          <p className="robot-understood" data-testid="kiosk-confirm">
            {quest.slotIdLtr ? (
              <>
                تم طلب الفترة{' '}
                <span className="slot-id-ltr" dir="ltr">
                  {state.shopFeedback.replace('تم طلب الفترة ', '')}
                </span>
              </>
            ) : (
              state.shopFeedback
            )}
          </p>
        ) : null}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="kiosk-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="kiosk-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="kiosk-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
