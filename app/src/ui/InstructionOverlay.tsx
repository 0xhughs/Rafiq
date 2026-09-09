import {
  AMBIGUOUS_LINE,
  CONSTRAINT_LABEL,
  LOCATION_LABEL,
  PARCEL_LABEL,
  RETURN_LABEL,
} from '../engine/parcel';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onSet: (field: 'parcel' | 'location' | 'constraints' | 'returnFormat', value: string) => void;
  onSend: () => void;
  onAmbiguous: () => void;
  onSubmitNl: (text: string) => void;
  onClose: () => void;
}

export function InstructionOverlay({
  state,
  onSet,
  onSend,
  onAmbiguous,
  onSubmitNl,
  onClose,
}: Props) {
  const draft = state.parcelQuest.instruction;
  const understood = state.parcelQuest.understood;
  const west = state.parcelQuest.r19Staged ? 'r19' : 'r17';
  return (
    <div
      className="overlay"
      data-testid="instruction-overlay"
      role="dialog"
      aria-modal="true"
    >
      <article className="paper-card instruction-card">
        <p className="card-stamp">ورقة تعليمات الاستلام</p>
        <h2>ماذا يحضر الروبوت؟</h2>
        <p className="card-note">
          سمِّ الطرد، ومكانه، وما لا يُفعل، وكيف يُعاد الناتج. الدفع يبقى لك.
        </p>

        <p className="field-label">الطرد</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={draft.parcel === west ? 'primary' : 'ghost'}
            data-testid={`instruction-parcel-${west}`}
            onClick={() => onSet('parcel', west)}
          >
            {PARCEL_LABEL[west]}
          </button>
          <button
            type="button"
            className={draft.parcel === 'r71' ? 'primary' : 'ghost'}
            data-testid="instruction-parcel-r71"
            onClick={() => onSet('parcel', 'r71')}
          >
            {PARCEL_LABEL.r71}
          </button>
          <button
            type="button"
            className={draft.parcel === 'gray' ? 'primary' : 'ghost'}
            data-testid="instruction-parcel-gray"
            onClick={() => onSet('parcel', 'gray')}
          >
            {PARCEL_LABEL.gray}
          </button>
        </div>

        <p className="field-label">المكان</p>
        <div className="button-row wrap-choices">
          {(['west', 'east', 'any'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={draft.location === id ? 'primary' : 'ghost'}
              data-testid={`instruction-location-${id}`}
              onClick={() => onSet('location', id)}
            >
              {LOCATION_LABEL[id]}
            </button>
          ))}
        </div>

        <p className="field-label">القيود</p>
        <div className="button-row wrap-choices">
          {(['repair_no_pay', 'grab_all_pay', 'none'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={draft.constraints === id ? 'primary' : 'ghost'}
              data-testid={`instruction-constraints-${id}`}
              onClick={() => onSet('constraints', id)}
            >
              {CONSTRAINT_LABEL[id]}
            </button>
          ))}
        </div>

        <p className="field-label">شكل الإعادة</p>
        <div className="button-row wrap-choices">
          {(['tag_to_desk', 'none'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={draft.returnFormat === id ? 'primary' : 'ghost'}
              data-testid={`instruction-return-${id}`}
              onClick={() => onSet('returnFormat', id)}
            >
              {RETURN_LABEL[id]}
            </button>
          ))}
        </div>

        {understood ? (
          <div className="robot-understood" data-testid="robot-understood">
            <p data-testid="understood-parcel">الطرد: {understood.parcel}</p>
            <p data-testid="understood-location">المكان: {understood.location}</p>
            <p data-testid="understood-constraints">القيد: {understood.constraints}</p>
            <p data-testid="understood-return">شكل الإعادة: {understood.returnFormat}</p>
          </div>
        ) : null}

        {state.shopFeedback ? (
          <p className="error" data-testid="instruction-feedback" role="alert">
            {state.shopFeedback}
          </p>
        ) : null}

        {state.parcelQuest.lastOutcome === 'ambiguous_fail' ? (
          <p className="parcel-fail" data-testid="ambiguous-fail">
            أحضر الروبوت ر-٧١ (للبيع) لأنه لم يميّز الطرد الرمادي. الحجز على الرف الغربي صار ر-١٩.
          </p>
        ) : null}

        <InstructionNl onSubmitNl={onSubmitNl} />

        <div className="button-row">
          <button type="button" className="primary" data-testid="instruction-send" onClick={onSend}>
            أرسل التعليم
          </button>
          <button type="button" className="ghost" data-testid="instruction-ambiguous" onClick={onAmbiguous}>
            {AMBIGUOUS_LINE}
          </button>
          <button type="button" className="ghost" data-testid="instruction-close" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </article>
    </div>
  );
}

function InstructionNl({ onSubmitNl }: { onSubmitNl: (text: string) => void }) {
  return (
    <form
      className="nl-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.elements.namedItem('nl-instruction') as HTMLInputElement;
        onSubmitNl(input.value);
      }}
    >
      <label className="field-label" htmlFor="nl-instruction">
        أو صِغ الأمر (اختياري)
      </label>
      <input id="nl-instruction" name="nl-instruction" data-testid="nl-instruction" type="text" dir="rtl" />
      <button type="submit" className="ghost" data-testid="nl-instruction-submit">
        أرسل الصياغة
      </button>
    </form>
  );
}
