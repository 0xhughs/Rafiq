import {
  ACCEPTED_TEXT,
  CRIT_ACCURACY_FAIL,
  CRIT_ACCURACY_OK,
  CRIT_COMPLETE,
  CRIT_RISK,
  CRIT_SOURCE,
  CRIT_TONE,
  DRAFT_CONFLICT_SOURCE,
  DRAFT_EVIDENCE_SOURCE,
  HALL_NOTICE,
  HALL_NOTICE_FLAW,
  HANDOFF_TEXT,
  QUALITY_EMPTY,
  ROLES_EMPTY,
  ROLES_LINE,
  SOURCE_TEXT,
  outputDraft,
  versionText,
} from '../engine/crew';
import type { CrewOwner, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onAssignResearcher: () => void;
  onAssignBuilder: () => void;
  onAssignReviewer: () => void;
  onMerge: () => void;
  onOwner: (owner: CrewOwner) => void;
  onHandoff: () => void;
  onInspectSource: () => void;
  onMajority: () => void;
  onPickEvidence: () => void;
  onPickConflict: () => void;
  onRobotDone: () => void;
  onResend: () => void;
  onOpenCriteria: () => void;
  onRepairAccuracy: () => void;
  onRepairTone: () => void;
  onAccept: () => void;
  onQualityMajority: () => void;
  onQualityRobotDone: () => void;
  onQualityResend: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

const FRAGMENT = /(sat-10|sun-16|wed-18|thu-09|NH-1447|v1|v2)/g;
const FRAGMENT_EXACT = /^(sat-10|sun-16|wed-18|thu-09|NH-1447|v1|v2)$/;

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

export function CrewOverlay({
  state,
  onAssignResearcher,
  onAssignBuilder,
  onAssignReviewer,
  onMerge,
  onOwner,
  onHandoff,
  onInspectSource,
  onMajority,
  onPickEvidence,
  onPickConflict,
  onRobotDone,
  onResend,
  onOpenCriteria,
  onRepairAccuracy,
  onRepairTone,
  onAccept,
  onQualityMajority,
  onQualityRobotDone,
  onQualityResend,
  onClose,
}: Props) {
  const quest = state.crewQuest;
  const output = state.shopFeedback ?? '';

  if (quest.view === 'quality') {
    return (
      <div className="overlay" data-testid="crew-quality" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">منضدة الجودة</p>
          <p className="card-note">مراجعة ناتج القاعة على الورق. ليست إرسالاً جديداً ولا شبكة حيّة.</p>
          {quest.criteriaOpened ? (
            <>
              <p className="card-note" data-testid="crew-output-draft">
                <HourCopy text={outputDraft(quest)} />
              </p>
              <p className="card-note" data-testid="crew-crit-accuracy">
                {quest.accuracyOk ? CRIT_ACCURACY_OK : CRIT_ACCURACY_FAIL}
              </p>
              <p className="card-note" data-testid="crew-crit-source">
                {CRIT_SOURCE}
              </p>
              <p className="card-note" data-testid="crew-crit-tone">
                {CRIT_TONE}
              </p>
              <p className="card-note" data-testid="crew-crit-complete">
                {CRIT_COMPLETE}
              </p>
              <p className="card-note" data-testid="crew-crit-risk">
                {CRIT_RISK}
              </p>
            </>
          ) : (
            <p className="card-note" data-testid="crew-quality-empty">
              {QUALITY_EMPTY}
            </p>
          )}
          <div className="button-row wrap-choices">
            <button
              type="button"
              className="primary"
              data-testid="crew-open-criteria"
              onClick={onOpenCriteria}
            >
              اعرض معايير الجودة
            </button>
            <button type="button" className="ghost" data-testid="crew-repair-accuracy" onClick={onRepairAccuracy}>
              أصلح معيار الدقة
            </button>
            <button type="button" className="ghost" data-testid="crew-repair-tone" onClick={onRepairTone}>
              أصلح النبرة
            </button>
            <button type="button" className="ghost" data-testid="crew-accept" onClick={onAccept}>
              اقبل الناتج
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="crew-quality-majority"
              onClick={onQualityMajority}
            >
              صوّت الطاقم على الجودة
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="crew-quality-robot-done"
              onClick={onQualityRobotDone}
            >
              تم
            </button>
            <button
              type="button"
              className="ghost"
              data-testid="crew-quality-resend"
              onClick={onQualityResend}
            >
              أرسل النشرة من جديد
            </button>
          </div>
          {quest.accepted ? (
            <p className="card-note" data-testid="crew-accepted">
              <HourCopy text={ACCEPTED_TEXT} />
            </p>
          ) : null}
          {output ? (
            <p className="parcel-fail" data-testid="crew-feedback">
              {output}
            </p>
          ) : null}
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="crew-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  const rolesReady = quest.roleResearcher && quest.roleBuilder && quest.roleReviewer;

  return (
    <div className="overlay" data-testid="crew-desk" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة الطاقم</p>
        <p className="card-note">تنسيق أدوار الناتج داخل الورشة. ليست موافقة إرسال ولا شبكة حيّة.</p>
        {rolesReady ? (
          <p className="card-note" data-testid="crew-roles">
            {ROLES_LINE}
          </p>
        ) : (
          <p className="card-note" data-testid="crew-empty">
            {ROLES_EMPTY}
          </p>
        )}
        <p className="card-note" data-testid="crew-version">
          <HourCopy text={versionText(quest)} />
        </p>
        {quest.handoffShown ? (
          <>
            <p className="card-note" data-testid="crew-handoff">
              {HANDOFF_TEXT}
            </p>
            <p className="card-note" data-testid="crew-draft-evidence">
              <HourCopy text={`${HALL_NOTICE} ${DRAFT_EVIDENCE_SOURCE}`} />
            </p>
            <p className="card-note" data-testid="crew-draft-conflict">
              <HourCopy text={`${HALL_NOTICE_FLAW} ${DRAFT_CONFLICT_SOURCE}`} />
            </p>
          </>
        ) : null}
        {quest.sourceInspected ? (
          <p className="card-note" data-testid="crew-source">
            <HourCopy text={SOURCE_TEXT} />
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button
            type="button"
            className="primary"
            data-testid="crew-assign-researcher"
            onClick={onAssignResearcher}
          >
            عيّن دور الباحث
          </button>
          <button type="button" className="ghost" data-testid="crew-assign-builder" onClick={onAssignBuilder}>
            عيّن دور البنّاء
          </button>
          <button type="button" className="ghost" data-testid="crew-assign-reviewer" onClick={onAssignReviewer}>
            عيّن دور المراجع
          </button>
          <button type="button" className="ghost" data-testid="crew-roles-merge" onClick={onMerge}>
            اجعل الروبوت الأدوار الثلاثة
          </button>
          <button
            type="button"
            className={quest.owner === 'librarian' ? 'primary' : 'ghost'}
            data-testid="crew-owner-librarian"
            onClick={() => onOwner('librarian')}
          >
            أمينة القاعة مالكة الناتج
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="crew-owner-majority"
            onClick={() => onOwner('majority')}
          >
            أغلبية الطاقم مالكة الناتج
          </button>
          <button type="button" className="ghost" data-testid="crew-owner-robot" onClick={() => onOwner('robot')}>
            الروبوت مالك الناتج
          </button>
          <button type="button" className="ghost" data-testid="crew-handoff-btn" onClick={onHandoff}>
            اعرض تسليم الأدوار
          </button>
          <button type="button" className="ghost" data-testid="crew-inspect-source" onClick={onInspectSource}>
            اقرأ سند NH-1447
          </button>
          <button type="button" className="ghost" data-testid="crew-majority" onClick={onMajority}>
            اعتمد أغلبية الطاقم
          </button>
          <button type="button" className="ghost" data-testid="crew-pick-evidence" onClick={onPickEvidence}>
            اعتمد مسودة الباحث المسنودة
          </button>
          <button type="button" className="ghost" data-testid="crew-pick-conflict" onClick={onPickConflict}>
            اعتمد مسودة البنّاء
          </button>
          <button type="button" className="ghost" data-testid="crew-resend" onClick={onResend}>
            أرسل النشرة من جديد
          </button>
          <button type="button" className="ghost" data-testid="crew-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {output ? (
          <p className="parcel-fail" data-testid="crew-feedback">
            <HourCopy text={output} />
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="crew-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
