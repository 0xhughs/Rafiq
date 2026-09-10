import {
  INPUT_ALL,
  INPUT_RECORD,
  INPUT_SECRET,
  OUTPUT_DRAFT,
  OUTPUT_SEND,
  RUN_COUNT_LABEL,
  SKILL_CARD_EMPTY,
  SKILL_FEEDBACK,
  SKILL_NAME,
  STANDING_LINE,
  STEPS_LOOKUP,
  STEPS_OPINION,
  STOP_INVENT,
  STOP_UNKNOWN,
  TRAY_EMPTY,
  TRIGGER_ANYTIME,
  TRIGGER_CHAT,
  TRIGGER_HOURS,
  CLOCK_TIME_SUN,
  RECORD_SECOND,
  oneshotText,
  trialText,
  triggerLogText,
} from '../engine/skill';
import { RECORD_NH } from '../engine/bridge';
import type {
  GameState,
  SkillInput,
  SkillOutput,
  SkillSchedule,
  SkillSteps,
  SkillStop,
  SkillTrigger,
} from '../engine/types';

interface Props {
  state: GameState;
  onOneshot: () => void;
  onCorrect: () => void;
  onSave: () => void;
  onStanding: () => void;
  onLoadConnector: () => void;
  onEmbedSecret: () => void;
  onTrialSecond: () => void;
  onTrialSame: () => void;
  onRobotDone: () => void;
  onTrigger: (trigger: SkillTrigger) => void;
  onInput: (input: SkillInput) => void;
  onSteps: (steps: SkillSteps) => void;
  onOutput: (output: SkillOutput) => void;
  onStop: (stop: SkillStop) => void;
  onSchedule: (schedule: SkillSchedule) => void;
  onArm: () => void;
  onTickSun8: () => void;
  onTickEmpty: () => void;
  onPause: () => void;
  onCancel: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

const FRAGMENT =
  /(sat-10|sun-16|wed-18|fri-14|mon-11|NH-1447|NH-2208|NH-xxxx|16:00|08:00|demo-slot-key)/g;
const FRAGMENT_EXACT =
  /^(sat-10|sun-16|wed-18|fri-14|mon-11|NH-1447|NH-2208|NH-xxxx|16:00|08:00|demo-slot-key)$/;

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

export function SkillOverlay({
  state,
  onOneshot,
  onCorrect,
  onSave,
  onStanding,
  onLoadConnector,
  onEmbedSecret,
  onTrialSecond,
  onTrialSame,
  onRobotDone,
  onTrigger,
  onInput,
  onSteps,
  onOutput,
  onStop,
  onSchedule,
  onArm,
  onTickSun8,
  onTickEmpty,
  onPause,
  onCancel,
  onClose,
}: Props) {
  const quest = state.skillQuest;
  const output = state.shopFeedback ?? '';
  const draft = oneshotText(quest);
  const trial = trialText(quest);
  const log = triggerLogText(quest);

  if (quest.view === 'clock') {
    return (
      <div className="overlay" data-testid="skill-clock" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">ساعة الحي</p>
          <p className="card-note">ساعة مؤلّفة داخل الورشة. ليست ساعة الحائط ولا مؤقّتاً حيّاً.</p>
          <p className="field-label">الوجه</p>
          <p className="card-note" data-testid="skill-clock-time">
            <HourCopy text={quest.clockLabel} />
          </p>
          <p className="field-label">الدرج</p>
          <pre className="notice-body" data-testid="skill-tray">
            {quest.trayText === TRAY_EMPTY ? quest.trayText : <HourCopy text={quest.trayText} />}
          </pre>
          <p className="card-note" data-testid="skill-run-count">
            {RUN_COUNT_LABEL(quest.runCount)}
          </p>
          {log ? (
            <p className="card-note" data-testid="skill-trigger-log">
              <HourCopy text={log} />
            </p>
          ) : null}
          <p className="field-label">الجدول</p>
          <div className="button-row wrap-choices">
            <button
              type="button"
              className={quest.schedule === 'sun8' ? 'primary' : 'ghost'}
              data-testid="skill-schedule-sun8"
              onClick={() => onSchedule('sun8')}
            >
              كل أحد <Ltr text={CLOCK_TIME_SUN} /> بتوقيت الحي
            </button>
            <button
              type="button"
              className={quest.schedule === 'every_event' ? 'primary' : 'ghost'}
              data-testid="skill-schedule-event"
              onClick={() => onSchedule('every_event')}
            >
              عند كل إشعار
            </button>
            <button
              type="button"
              className={quest.schedule === 'send_dawn' ? 'primary' : 'ghost'}
              data-testid="skill-schedule-send"
              onClick={() => onSchedule('send_dawn')}
            >
              أرسل فجراً بلا عين
            </button>
          </div>
          <div className="button-row wrap-choices">
            <button type="button" className="primary" data-testid="skill-arm" onClick={onArm}>
              شغّل الجدول
            </button>
            <button type="button" className="ghost" data-testid="skill-tick-sun8" onClick={onTickSun8}>
              تقدّم إلى الأحد <Ltr text={CLOCK_TIME_SUN} />
            </button>
            <button type="button" className="ghost" data-testid="skill-tick-empty" onClick={onTickEmpty}>
              تقدّم والصدر فارغ
            </button>
            <button type="button" className="ghost" data-testid="skill-pause" onClick={onPause}>
              ألبث الروتين
            </button>
            <button type="button" className="ghost" data-testid="skill-cancel" onClick={onCancel}>
              ألغِ الجدول
            </button>
          </div>
          {output ? (
            <p className="parcel-fail" data-testid="skill-feedback">
              <HourCopy text={output} />
            </p>
          ) : null}
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="skill-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="overlay" data-testid="skill-bench" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة المهارة</p>
        <p className="card-note">أزرار مؤلّفة. المهارة إجراء محفوظ بعد تصحيح، ليست دستوراً دائماً ولا موصلاً.</p>
        {quest.skillSaved ? (
          <div className="paper-slip" data-testid="skill-card">
            <p className="field-label">{SKILL_NAME}</p>
            <p className="card-note">
              محفّز: <HourCopy text={TRIGGER_HOURS} />
            </p>
            <p className="card-note">
              مدخلات: <HourCopy text={INPUT_RECORD} />
            </p>
            <p className="card-note">خطوات: {STEPS_LOOKUP}</p>
            <p className="card-note">ناتج: {OUTPUT_DRAFT}</p>
            <p className="card-note">توقف: {STOP_UNKNOWN}</p>
          </div>
        ) : (
          <p className="card-note" data-testid="skill-card-empty">
            {SKILL_CARD_EMPTY}
          </p>
        )}
        {quest.standingRefused ? (
          <div className="paper-slip" data-testid="skill-standing-card">
            <p className="card-note">{STANDING_LINE}</p>
            <p className="card-note">هذا الدستور ليس المهارة.</p>
          </div>
        ) : null}
        <p className="field-label">أمر واحد</p>
        <pre className="notice-body" data-testid="skill-oneshot-text">
          {draft ? <HourCopy text={draft} /> : null}
        </pre>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="skill-oneshot" onClick={onOneshot}>
            لخّص <Ltr text={RECORD_NH} /> الآن
          </button>
          <button type="button" className="ghost" data-testid="skill-correct" onClick={onCorrect}>
            افصل الساعات عن التعليق ولا تخترع دقيقة
          </button>
        </div>
        <p className="field-label">محفّز</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.trigger === 'hours_record' ? 'primary' : 'ghost'}
            data-testid="skill-trigger-hours"
            onClick={() => onTrigger('hours_record')}
          >
            {TRIGGER_HOURS}
          </button>
          <button
            type="button"
            className={quest.trigger === 'anytime' ? 'primary' : 'ghost'}
            data-testid="skill-trigger-anytime"
            onClick={() => onTrigger('anytime')}
          >
            {TRIGGER_ANYTIME}
          </button>
          <button
            type="button"
            className={quest.trigger === 'every_chat' ? 'primary' : 'ghost'}
            data-testid="skill-trigger-chat"
            onClick={() => onTrigger('every_chat')}
          >
            {TRIGGER_CHAT}
          </button>
        </div>
        <p className="field-label">مدخلات</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.inputKind === 'record_id' ? 'primary' : 'ghost'}
            data-testid="skill-input-record"
            onClick={() => onInput('record_id')}
          >
            <HourCopy text={INPUT_RECORD} />
          </button>
          <button
            type="button"
            className={quest.inputKind === 'secret' ? 'primary' : 'ghost'}
            data-testid="skill-input-secret"
            onClick={() => onInput('secret')}
          >
            <HourCopy text={INPUT_SECRET} />
          </button>
          <button
            type="button"
            className={quest.inputKind === 'all_files' ? 'primary' : 'ghost'}
            data-testid="skill-input-all"
            onClick={() => onInput('all_files')}
          >
            {INPUT_ALL}
          </button>
        </div>
        <p className="field-label">خطوات</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.steps === 'lookup_format' ? 'primary' : 'ghost'}
            data-testid="skill-steps-lookup-format"
            onClick={() => onSteps('lookup_format')}
          >
            {STEPS_LOOKUP}
          </button>
          <button
            type="button"
            className={quest.steps === 'mix_opinion' ? 'primary' : 'ghost'}
            data-testid="skill-steps-opinion"
            onClick={() => onSteps('mix_opinion')}
          >
            {STEPS_OPINION}
          </button>
        </div>
        <p className="field-label">ناتج</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.outputKind === 'tray_draft' ? 'primary' : 'ghost'}
            data-testid="skill-output-draft"
            onClick={() => onOutput('tray_draft')}
          >
            {OUTPUT_DRAFT}
          </button>
          <button
            type="button"
            className={quest.outputKind === 'send_now' ? 'primary' : 'ghost'}
            data-testid="skill-output-send"
            onClick={() => onOutput('send_now')}
          >
            {OUTPUT_SEND}
          </button>
        </div>
        <p className="field-label">توقف</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.stopRule === 'unknown_stop' ? 'primary' : 'ghost'}
            data-testid="skill-stop-unknown"
            onClick={() => onStop('unknown_stop')}
          >
            {STOP_UNKNOWN}
          </button>
          <button
            type="button"
            className={quest.stopRule === 'always_invent' ? 'primary' : 'ghost'}
            data-testid="skill-stop-invent"
            onClick={() => onStop('always_invent')}
          >
            {STOP_INVENT}
          </button>
        </div>
        <p className="field-label">ليس مهارة</p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="skill-standing" onClick={onStanding}>
            احفظ الدستور مهارة
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="skill-load-connector"
            onClick={onLoadConnector}
          >
            حمّل الموصل كمهارة
          </button>
          <button type="button" className="ghost" data-testid="skill-embed-secret" onClick={onEmbedSecret}>
            ضع المفتاح في المهارة
          </button>
        </div>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="skill-save" onClick={onSave}>
            احفظ المهارة
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="skill-trial-second"
            onClick={onTrialSecond}
          >
            جرّب على <Ltr text={RECORD_SECOND} />
          </button>
          <button type="button" className="ghost" data-testid="skill-trial-same" onClick={onTrialSame}>
            جرّب على <Ltr text={RECORD_NH} />
          </button>
          <button type="button" className="ghost" data-testid="skill-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {trial ? (
          <pre className="notice-body" data-testid="skill-trial-text">
            <HourCopy text={trial} />
          </pre>
        ) : null}
        {output ? (
          <p className="parcel-fail" data-testid="skill-feedback">
            <HourCopy text={output} />
          </p>
        ) : null}
        <p className="card-note">{SKILL_FEEDBACK.robotDone}</p>
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="skill-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
