import {
  CASE_CONTEXT,
  CASE_EMPTY,
  CASE_RESULT,
  CASE_WAIT,
  PAYLOAD_COMMENT,
  PAYLOAD_EXACT,
  PAYLOAD_EXTRA,
  RECIPIENT_LIBRARIAN,
  RECIPIENT_NEIGHBORS,
  RECIPIENT_PAYROLL,
  SEND_EMPTY,
  reviewText,
} from '../engine/approval';
import type { ApprovalPayload, ApprovalRecipient, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onPrepare: () => void;
  onRecipient: (recipient: ApprovalRecipient) => void;
  onPayload: (payload: ApprovalPayload) => void;
  onInspect: () => void;
  onReject: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onPay: () => void;
  onRobotDone: () => void;
  onCasePrepare: () => void;
  onCaseAuto: () => void;
  onCaseMajority: () => void;
  onCaseShare: () => void;
  onCaseKeep: () => void;
  onCaseRobotDone: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

const FRAGMENT = /(sat-10|sun-16|wed-18|thu-09|CL-19)/g;
const FRAGMENT_EXACT = /^(sat-10|sun-16|wed-18|thu-09|CL-19)$/;

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

export function ApproveOverlay({
  state,
  onPrepare,
  onRecipient,
  onPayload,
  onInspect,
  onReject,
  onConfirm,
  onDelete,
  onPay,
  onRobotDone,
  onCasePrepare,
  onCaseAuto,
  onCaseMajority,
  onCaseShare,
  onCaseKeep,
  onCaseRobotDone,
  onClose,
}: Props) {
  const quest = state.approvalQuest;
  const output = state.shopFeedback ?? '';

  if (quest.view === 'personal') {
    return (
      <div className="overlay" data-testid="approve-case" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">مكتب القرار</p>
          <p className="card-note">القرار شخصي. الروبوت يجهّز السياق وينتظر. ليست منصة الإرسال.</p>
          {quest.contextPrepared ? (
            <>
              <p className="card-note" data-testid="approve-case-context">
                <HourCopy text={CASE_CONTEXT} />
              </p>
              <p className="card-note" data-testid="approve-case-wait">
                {CASE_WAIT}
              </p>
            </>
          ) : (
            <p className="card-note" data-testid="approve-case-empty">
              {CASE_EMPTY}
            </p>
          )}
          <div className="button-row wrap-choices">
            <button
              type="button"
              className="primary"
              data-testid="approve-case-prepare"
              onClick={onCasePrepare}
            >
              اعرض سياق القرار
            </button>
            <button type="button" className="ghost" data-testid="approve-case-auto" onClick={onCaseAuto}>
              دع الروبوت يقرر
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="approve-case-majority"
              onClick={onCaseMajority}
            >
              صوّت الجيران بالأغلبية
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="approve-case-share"
              onClick={onCaseShare}
            >
              انشر الملاحظة على اللوحة
            </button>
            <button type="button" className="ghost" data-testid="approve-case-keep" onClick={onCaseKeep}>
              لا تُشارك ملاحظة العيادة
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="approve-case-robot-done"
              onClick={onCaseRobotDone}
            >
              تم
            </button>
          </div>
          {quest.humanDecided && quest.decision === 'keep_private' ? (
            <p className="card-note" data-testid="approve-case-result">
              {CASE_RESULT}
            </p>
          ) : null}
          {output ? (
            <p className="parcel-fail" data-testid="approve-feedback">
              {output}
            </p>
          ) : null}
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="approve-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="overlay" data-testid="approve-desk" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة الموافقة</p>
        <p className="card-note">إرسال مؤلّف داخل الورشة. ليست شبكة حيّة ولا موافقة آلية.</p>
        {quest.prepared ? (
          <div className="paper-slip">
            <p className="field-label">المستلم</p>
            <div className="button-row wrap-choices">
              <button
                type="button"
                className={quest.recipient === 'neighbors' ? 'primary' : 'ghost'}
                data-testid="approve-recipient-neighbors"
                onClick={() => onRecipient('neighbors')}
              >
                {RECIPIENT_NEIGHBORS}
              </button>
              <button
                type="button"
                className={quest.recipient === 'payroll' ? 'primary' : 'ghost'}
                data-testid="approve-recipient-payroll"
                onClick={() => onRecipient('payroll')}
              >
                {RECIPIENT_PAYROLL}
              </button>
              <button
                type="button"
                className={quest.recipient === 'librarian' ? 'primary' : 'ghost'}
                data-testid="approve-recipient-librarian"
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
                data-testid="approve-payload-exact"
                onClick={() => onPayload('exact')}
              >
                <HourCopy text={PAYLOAD_EXACT} />
              </button>
              <button
                type="button"
                className={quest.payload === 'extra_hour' ? 'primary' : 'ghost'}
                data-testid="approve-payload-extra"
                onClick={() => onPayload('extra_hour')}
              >
                <HourCopy text={PAYLOAD_EXTRA} />
              </button>
              <button
                type="button"
                className={quest.payload === 'comment' ? 'primary' : 'ghost'}
                data-testid="approve-payload-comment"
                onClick={() => onPayload('comment')}
              >
                <HourCopy text={PAYLOAD_COMMENT} />
              </button>
            </div>
          </div>
        ) : (
          <p className="card-note" data-testid="approve-prepared">
            {SEND_EMPTY}
          </p>
        )}
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="approve-prepare" onClick={onPrepare}>
            جهّز إرسال النشرة
          </button>
          <button type="button" className="ghost" data-testid="approve-inspect" onClick={onInspect}>
            راجع المستلم والحمولة
          </button>
          <button type="button" className="ghost" data-testid="approve-reject" onClick={onReject}>
            ارفض هذا الإرسال
          </button>
          <button type="button" className="ghost" data-testid="approve-confirm" onClick={onConfirm}>
            وافق على الإرسال
          </button>
          <button type="button" className="ghost" data-testid="approve-delete" onClick={onDelete}>
            احذف المسودة
          </button>
          <button type="button" className="ghost" data-testid="approve-pay" onClick={onPay}>
            ادفع من الخزنة
          </button>
          <button type="button" className="ghost" data-testid="approve-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {quest.inspectedSend ? (
          <pre className="notice-body" data-testid="approve-review">
            <HourCopy text={reviewText(quest)} />
          </pre>
        ) : null}
        {quest.bulletinSent && quest.receiptText ? (
          <p className="card-note" data-testid="approve-receipt">
            <HourCopy text={quest.receiptText} />
          </p>
        ) : null}
        {output ? (
          <p className="parcel-fail" data-testid="approve-feedback">
            <HourCopy text={output} />
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="approve-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
