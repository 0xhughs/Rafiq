import {
  DRAFT_TEXT,
  NIGHT_RECEIPT,
  PACK_TEXT,
  PATH_EMPTY,
  PAYLOAD_EXACT,
  PAYLOAD_STREAM,
  PLAN_EMPTY,
  PLAN_BOUNDED,
  RECIPIENT_LIBRARIAN,
  RECIPIENT_NEIGHBORS,
  RECIPIENT_PAYROLL,
  RUMOR_TEXT,
  SEAL_EMPTY,
  SOURCE_TEXT,
  draftText,
  planReady,
  reviewText,
} from '../engine/path';
import type { PathGoal, PathPayload, PathRecipient, PathStop, PathTools, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onInspectSource: () => void;
  onTrustRumor: () => void;
  onRefuseRumor: () => void;
  onGoal: (goal: PathGoal) => void;
  onTools: (tools: PathTools) => void;
  onStop: (stop: PathStop) => void;
  onLoadReading: () => void;
  onLoadMango: () => void;
  onLoadClinic: () => void;
  onRunSkill: () => void;
  onRunOld: () => void;
  onRunChat: () => void;
  onExtraStep: () => void;
  onExam: () => void;
  onQuiz: () => void;
  onRobotDone: () => void;
  onPrepare: () => void;
  onRecipient: (recipient: PathRecipient) => void;
  onPayload: (payload: PathPayload) => void;
  onInspectSend: () => void;
  onReject: () => void;
  onConfirm: () => void;
  onResendOld: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

const FRAGMENT = /(thu-19|fri-20|NH-3301|NH-1447)/g;
const FRAGMENT_EXACT = /^(thu-19|fri-20|NH-3301|NH-1447)$/;

function HourCopy({ text }: { text: string }) {
  return (
    <>
      {text.split(FRAGMENT).map((part, index) =>
        FRAGMENT_EXACT.test(part) ? (
          <Ltr key={index} text={part} />
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function PathOverlay({
  state,
  onInspectSource,
  onTrustRumor,
  onRefuseRumor,
  onGoal,
  onTools,
  onStop,
  onLoadReading,
  onLoadMango,
  onLoadClinic,
  onRunSkill,
  onRunOld,
  onRunChat,
  onExtraStep,
  onExam,
  onQuiz,
  onRobotDone,
  onPrepare,
  onRecipient,
  onPayload,
  onInspectSend,
  onReject,
  onConfirm,
  onResendOld,
  onClose,
}: Props) {
  const quest = state.pathQuest;
  const output = state.shopFeedback ?? '';

  if (quest.view === 'seal') {
    return (
      <div className="overlay" data-testid="path-seal" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">منصة الختم</p>
          <p className="card-note">موافقة بشرية على سهرة قراءة جديدة. ليست إعادة إرسال للنشرة السابقة.</p>
          {quest.prepared ? (
            <div className="paper-slip">
              <p className="field-label">المستلم</p>
              <div className="button-row wrap-choices">
                <button
                  type="button"
                  className={quest.recipient === 'neighbors' ? 'primary' : 'ghost'}
                  data-testid="path-recipient-neighbors"
                  onClick={() => onRecipient('neighbors')}
                >
                  {RECIPIENT_NEIGHBORS}
                </button>
                <button
                  type="button"
                  className={quest.recipient === 'payroll' ? 'primary' : 'ghost'}
                  data-testid="path-recipient-payroll"
                  onClick={() => onRecipient('payroll')}
                >
                  {RECIPIENT_PAYROLL}
                </button>
                <button
                  type="button"
                  className={quest.recipient === 'librarian' ? 'primary' : 'ghost'}
                  data-testid="path-recipient-librarian"
                  onClick={() => onRecipient('librarian')}
                >
                  {RECIPIENT_LIBRARIAN}
                </button>
              </div>
              <p className="field-label">الحمولة</p>
              <div className="button-row wrap-choices">
                <button
                  type="button"
                  className={quest.payload === 'exact' ? 'primary' : 'ghost'}
                  data-testid="path-payload-exact"
                  onClick={() => onPayload('exact')}
                >
                  <HourCopy text={PAYLOAD_EXACT} />
                </button>
                <button
                  type="button"
                  className={quest.payload === 'stream' ? 'primary' : 'ghost'}
                  data-testid="path-payload-stream"
                  onClick={() => onPayload('stream')}
                >
                  <HourCopy text={PAYLOAD_STREAM} />
                </button>
              </div>
            </div>
          ) : (
            <p className="card-note" data-testid="path-seal-empty">
              {SEAL_EMPTY}
            </p>
          )}
          <div className="button-row wrap-choices">
            <button type="button" className="primary" data-testid="path-prepare" onClick={onPrepare}>
              جهّز إرسال السهرة
            </button>
            <button type="button" className="ghost" data-testid="path-inspect-send" onClick={onInspectSend}>
              راجع المستلم والحمولة
            </button>
            <button type="button" className="ghost" data-testid="path-reject" onClick={onReject}>
              ارفض هذا الإرسال
            </button>
            <button type="button" className="ghost" data-testid="path-confirm" onClick={onConfirm}>
              وافق على الإرسال
            </button>
            <button type="button" className="ghost" data-testid="path-resend-old" onClick={onResendOld}>
              أرسل نشرة القاعة من جديد
            </button>
          </div>
          {quest.inspectedSend ? (
            <pre className="notice-body" data-testid="path-review">
              <HourCopy text={reviewText(quest)} />
            </pre>
          ) : null}
          {quest.nightSent && quest.receiptText ? (
            <p className="card-note" data-testid="path-receipt">
              <HourCopy text={NIGHT_RECEIPT} />
            </p>
          ) : null}
          {output ? (
            <p className="parcel-fail" data-testid="path-feedback">
              <HourCopy text={output} />
            </p>
          ) : null}
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="path-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  const started = quest.sourceInspected;
  const bounded = planReady(quest);
  const draft = draftText(quest);

  return (
    <div className="overlay" data-testid="path-desk" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة المسار</p>
        <p className="card-note">تحقق من سند السهرة، اضبط خطة محدودة، جهّز الحزمة، ثم شغّل المهارة. ليست منصة الختم.</p>
        {started ? null : (
          <p className="card-note" data-testid="path-empty">
            {PATH_EMPTY}
          </p>
        )}
        <p className="card-note" data-testid="path-rumor">
          <HourCopy text={RUMOR_TEXT} />
        </p>
        {quest.sourceInspected ? (
          <p className="card-note" data-testid="path-source">
            <HourCopy text={SOURCE_TEXT} />
          </p>
        ) : null}
        <p className="card-note" data-testid="path-plan">
          {bounded ? PLAN_BOUNDED : PLAN_EMPTY}
        </p>
        {quest.packReady ? (
          <p className="card-note" data-testid="path-pack">
            <HourCopy text={PACK_TEXT} />
          </p>
        ) : null}
        {quest.skillRan ? (
          <p className="card-note" data-testid="path-draft">
            <HourCopy text={draft || DRAFT_TEXT} />
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="path-inspect-source" onClick={onInspectSource}>
            اقرأ سند NH-3301
          </button>
          <button type="button" className="ghost" data-testid="path-trust-rumor" onClick={onTrustRumor}>
            اعتمد ادعاء الروبوت
          </button>
          <button type="button" className="ghost" data-testid="path-refuse-rumor" onClick={onRefuseRumor}>
            ارفض ادعاء الروبوت
          </button>
          <button
            type="button"
            className={quest.goal === 'reading' ? 'primary' : 'ghost'}
            data-testid="path-goal-reading"
            onClick={() => onGoal('reading')}
          >
            هدف: نشر سهرة القراءة
          </button>
          <button type="button" className="ghost" data-testid="path-goal-live" onClick={() => onGoal('live')}>
            هدف: ساعات حيّة بلا حد
          </button>
          <button
            type="button"
            className={quest.tools === 'safe' ? 'primary' : 'ghost'}
            data-testid="path-tools-safe"
            onClick={() => onTools('safe')}
          >
            أدوات: قراءة وكتابة وتحقق
          </button>
          <button type="button" className="ghost" data-testid="path-tools-pay" onClick={() => onTools('pay')}>
            أدوات: دفع وبث
          </button>
          <button
            type="button"
            className={quest.stop === 'budget' ? 'primary' : 'ghost'}
            data-testid="path-stop-budget"
            onClick={() => onStop('budget')}
          >
            توقف: ثلاث خطوات أو نقص
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="path-stop-unlimited"
            onClick={() => onStop('unlimited')}
          >
            توقف: بلا حد
          </button>
          <button type="button" className="ghost" data-testid="path-load-reading" onClick={onLoadReading}>
            حمّل ملاحظة السهرة
          </button>
          <button type="button" className="ghost" data-testid="path-load-mango" onClick={onLoadMango}>
            حمّل ملاحظة المانجو
          </button>
          <button type="button" className="ghost" data-testid="path-load-clinic" onClick={onLoadClinic}>
            حمّل ملف عيادة ليان
          </button>
          <button type="button" className="ghost" data-testid="path-run-skill" onClick={onRunSkill}>
            شغّل مهارة التلخيص على NH-3301
          </button>
          <button type="button" className="ghost" data-testid="path-run-old" onClick={onRunOld}>
            شغّل المهارة على NH-1447
          </button>
          <button type="button" className="ghost" data-testid="path-run-chat" onClick={onRunChat}>
            نفّذ بلا مهارة من الدردشة
          </button>
          <button type="button" className="ghost" data-testid="path-extra-step" onClick={onExtraStep}>
            خطوة إضافية بعد النجاح
          </button>
          <button type="button" className="ghost" data-testid="path-exam" onClick={onExam}>
            ابدأ الامتحان الموقوت
          </button>
          <button type="button" className="ghost" data-testid="path-quiz" onClick={onQuiz}>
            اختر الإجابة الصحيحة
          </button>
          <button type="button" className="ghost" data-testid="path-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {output ? (
          <p className="parcel-fail" data-testid="path-feedback">
            <HourCopy text={output} />
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="path-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
