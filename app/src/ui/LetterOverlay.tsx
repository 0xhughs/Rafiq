import { CIRCULAR_14, LETTER_BODY_OK, sentenceCount } from '../engine/newsroom';
import type { GameState, LetterSigner } from '../engine/types';

interface Props {
  state: GameState;
  onSet: (field: 'recipient' | 'purpose' | 'tone' | 'body', value: string) => void;
  onReview: () => void;
  onSend: (signer: LetterSigner) => void;
  onClose: () => void;
}

export function LetterOverlay({ state, onSet, onReview, onSend, onClose }: Props) {
  const quest = state.newsroomQuest;
  return (
    <div className="overlay" data-testid="letter-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="letter-card">
        <p className="card-stamp">خطاب طلب المعاينة</p>
        <h2>راجع قبل الإرسال</h2>
        <p className="field-label">المستلم</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.letterRecipient === 'workshop_manager' ? 'primary' : 'ghost'}
            data-testid="letter-recipient-workshop_manager"
            onClick={() => onSet('recipient', 'workshop_manager')}
          >
            مدير ورشة الإصلاح
          </button>
          <button
            type="button"
            className={quest.letterRecipient === 'shopkeeper' ? 'primary' : 'ghost'}
            data-testid="letter-recipient-shopkeeper"
            onClick={() => onSet('recipient', 'shopkeeper')}
          >
            البقال
          </button>
          <button
            type="button"
            className={quest.letterRecipient === 'circular14' ? 'primary' : 'ghost'}
            data-testid="letter-recipient-circular14"
            onClick={() => onSet('recipient', 'circular14')}
          >
            {CIRCULAR_14}
          </button>
        </div>
        <p className="field-label">الغرض</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.letterPurpose === 'inspection' ? 'primary' : 'ghost'}
            data-testid="letter-purpose-inspection"
            onClick={() => onSet('purpose', 'inspection')}
          >
            موعد معاينة
          </button>
          <button
            type="button"
            className={quest.letterPurpose === 'midnight_parts' ? 'primary' : 'ghost'}
            data-testid="letter-purpose-midnight_parts"
            onClick={() => onSet('purpose', 'midnight_parts')}
          >
            حجز قطع منتصف الليل
          </button>
          <button
            type="button"
            className={quest.letterPurpose === 'circular14' ? 'primary' : 'ghost'}
            data-testid="letter-purpose-circular14"
            onClick={() => onSet('purpose', 'circular14')}
          >
            {CIRCULAR_14}
          </button>
        </div>
        <p className="field-label">النبرة</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.letterTone === 'clear_polite' ? 'primary' : 'ghost'}
            data-testid="letter-tone-clear_polite"
            onClick={() => onSet('tone', 'clear_polite')}
          >
            واضح ومهذب
          </button>
          <button
            type="button"
            className={quest.letterTone === 'slogan' ? 'primary' : 'ghost'}
            data-testid="letter-tone-slogan"
            onClick={() => onSet('tone', 'slogan')}
          >
            شعار نقلة نوعية
          </button>
          <button
            type="button"
            className={quest.letterTone === 'harsh' ? 'primary' : 'ghost'}
            data-testid="letter-tone-harsh"
            onClick={() => onSet('tone', 'harsh')}
          >
            حاد
          </button>
        </div>
        <p className="field-label">المسودة ({sentenceCount(quest.letterBody)} جمل)</p>
        <pre className="notice-body" data-testid="letter-body">
          {quest.letterBody || LETTER_BODY_OK}
        </pre>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className="ghost"
            data-testid="letter-body-ok"
            onClick={() => onSet('body', 'ok')}
          >
            أربع جمل
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="letter-body-long"
            onClick={() => onSet('body', 'long')}
          >
            أطل أكثر من أربع
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="letter-body-circular"
            onClick={() => onSet('body', 'circular')}
          >
            أضف {CIRCULAR_14}
          </button>
        </div>
        {quest.letterReviewed ? (
          <p className="robot-understood" data-testid="letter-reviewed">
            راجعت المسودة.
          </p>
        ) : null}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="letter-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="ghost" data-testid="letter-review" onClick={onReview}>
            راجعت المسودة
          </button>
          <button
            type="button"
            className="primary"
            data-testid="letter-send-player"
            onClick={() => onSend('player')}
          >
            أرسل بتوقيعي
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="letter-send-robot"
            onClick={() => onSend('robot_manager')}
          >
            وقّع باسم مدير الورشة
          </button>
          <button type="button" className="ghost" data-testid="letter-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
