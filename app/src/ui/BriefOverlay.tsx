import {
  ACCEPTANCE_OK,
  CONSTRAINTS_OK,
  EXCLUSIONS_OK,
  SCREENS_OK,
  WORKSHOP_FEEDBACK,
} from '../engine/workshop';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onSet: (field: 'screens' | 'constraints' | 'exclusions' | 'acceptance' | 'extra', value: string) => void;
  onClose: () => void;
}

export function BriefOverlay({ state, onSet, onClose }: Props) {
  const quest = state.workshopQuest;
  return (
    <div className="overlay" data-testid="brief-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="brief-card">
        <p className="card-stamp">وصف المنتج</p>
        <h2>عقد البنّاء</h2>
        <p className="card-note">أربعة أجزاء من الخيارات المكتوبة، لا نص حر.</p>
        <p className="field-label">شاشات</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.screens === 'board_and_confirm' ? 'primary' : 'ghost'}
            data-testid="brief-screens-ok"
            onClick={() => onSet('screens', 'board_and_confirm')}
          >
            {SCREENS_OK}
          </button>
          <button
            type="button"
            className={quest.screens === 'kiosk_api' ? 'primary' : 'ghost'}
            data-testid="brief-screens-kiosk"
            onClick={() => onSet('screens', 'kiosk_api')}
          >
            كiosk / مفتاح API
          </button>
        </div>
        <p className="field-label">قيود</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.constraints === 'paper_one_no_pay_chat' ? 'primary' : 'ghost'}
            data-testid="brief-constraints-ok"
            onClick={() => onSet('constraints', 'paper_one_no_pay_chat')}
          >
            {CONSTRAINTS_OK}
          </button>
          <button
            type="button"
            className={quest.constraints === 'live_hours' ? 'primary' : 'ghost'}
            data-testid="brief-constraints-live"
            onClick={() => onSet('constraints', 'live_hours')}
          >
            ساعات استقبال حيّة
          </button>
        </div>
        <p className="field-label">استثناءات</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.exclusions === 'no_extras' ? 'primary' : 'ghost'}
            data-testid="brief-exclusions-ok"
            onClick={() => onSet('exclusions', 'no_extras')}
          >
            {EXCLUSIONS_OK}
          </button>
          <button
            type="button"
            className={quest.exclusions === 'include_pay' ? 'primary' : 'ghost'}
            data-testid="brief-exclusions-pay"
            onClick={() => onSet('exclusions', 'include_pay')}
          >
            أبقِ الدفع الإلكتروني
          </button>
        </div>
        <p className="field-label">قبول ملاحظ</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.acceptance === 'slot_shows_booked' ? 'primary' : 'ghost'}
            data-testid="brief-acceptance-ok"
            onClick={() => onSet('acceptance', 'slot_shows_booked')}
          >
            {ACCEPTANCE_OK}
          </button>
          <button
            type="button"
            className={quest.acceptance === 'robot_said_done' ? 'primary' : 'ghost'}
            data-testid="brief-acceptance-done"
            onClick={() => onSet('acceptance', 'robot_said_done')}
          >
            الروبوت قال تم
          </button>
          <button
            type="button"
            className={quest.acceptance === 'click_count' ? 'primary' : 'ghost'}
            data-testid="brief-acceptance-clicks"
            onClick={() => onSet('acceptance', 'click_count')}
          >
            عدد النقرات
          </button>
        </div>
        <p className="field-label">طلبات إضافية</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.extraPay ? 'primary' : 'ghost'}
            data-testid="brief-extra-pay"
            onClick={() => onSet('extra', 'pay')}
          >
            دفع إلكتروني
          </button>
          <button
            type="button"
            className={quest.extraChat ? 'primary' : 'ghost'}
            data-testid="brief-extra-chat"
            onClick={() => onSet('extra', 'chat')}
          >
            دردشة مباشرة
          </button>
          <button
            type="button"
            className={quest.extraLive ? 'primary' : 'ghost'}
            data-testid="brief-extra-live"
            onClick={() => onSet('extra', 'live')}
          >
            ساعات استقبال حيّة
          </button>
          <button
            type="button"
            className={quest.extraKiosk ? 'primary' : 'ghost'}
            data-testid="brief-extra-kiosk"
            onClick={() => onSet('extra', 'kiosk')}
          >
            كiosk / مفتاح API
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="brief-extra-none"
            onClick={() => onSet('extra', 'none')}
          >
            أخرج الإضافات
          </button>
        </div>
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="brief-feedback">
            {state.shopFeedback}
          </p>
        ) : (
          <p className="card-note" data-testid="brief-hint">
            {WORKSHOP_FEEDBACK.inspectOnly}
          </p>
        )}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="brief-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
