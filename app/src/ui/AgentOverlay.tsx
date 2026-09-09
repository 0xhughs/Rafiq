import {
  AGENT_FEEDBACK,
  BOARD_EMPTY,
  CHAT_PLAN_TEXT,
  GOAL_SLOTS_TEXT,
  JOB_SHELF_LABEL,
  JOB_SLOTS_LABEL,
  LIVE_HOURS_TEXT,
  STOP_BUDGET3_TEXT,
  SUCCESS_SLOTS_TEXT,
  neighborBoardText,
} from '../engine/agent';
import { SLOT_IDS } from '../engine/kiosk';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onChatPlan: () => void;
  onRun: () => void;
  onExtra: () => void;
  onLoadJob: (job: 'slots' | 'shelf') => void;
  onGoal: (goal: 'post_slots' | 'chat_only' | 'live_hours') => void;
  onTool: (tool: 'read' | 'write' | 'verify' | 'chat' | 'hours') => void;
  onSuccess: (test: 'slots_posted' | 'robot_done' | 'click_count') => void;
  onStop: (rule: 'budget_3_or_missing' | 'unlimited' | 'budget_1') => void;
  onRobotDone: () => void;
  onInvokeHours: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

function isStopCopy(text: string): boolean {
  return text.startsWith('توقف') || text.startsWith('المشغّل لم يتوقف');
}

function SlotCopy({ text }: { text: string }) {
  return (
    <>
      {text.split(/(sun-pm|mon-am|tue-pm)/g).map((part, index) =>
        part === SLOT_IDS.sunday || part === SLOT_IDS.monday || part === SLOT_IDS.tuesday ? (
          <Ltr key={index} text={part} />
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function AgentOverlay({
  state,
  onChatPlan,
  onRun,
  onExtra,
  onLoadJob,
  onGoal,
  onTool,
  onSuccess,
  onStop,
  onRobotDone,
  onInvokeHours,
  onClose,
}: Props) {
  const quest = state.agentQuest;
  const output = state.shopFeedback ?? '';
  const board = neighborBoardText(quest);

  if (quest.view === 'board') {
    return (
      <div className="overlay" data-testid="agent-board" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">لوحة الحي</p>
          <p className="card-note">لوحة عامة للجيران. الكتابة تتم عبر أدوات المشغّل فقط.</p>
          <pre className="notice-body" data-testid="agent-board-text">
            {board === BOARD_EMPTY ? board : <SlotCopy text={board} />}
          </pre>
          {output ? (
            <p className="parcel-fail" data-testid="agent-feedback">
              {output}
            </p>
          ) : null}
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="agent-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="overlay" data-testid="agent-console" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة المشغّل</p>
        <p className="card-note">حلقة راقب → نفّذ → تحقق داخل المشغّل. لا صدفة حقيقية ولا تقييم لنص حر.</p>
        <p className="field-label">خطة مقترحة</p>
        <p className="card-note" data-testid="agent-chat-plan-text">
          {CHAT_PLAN_TEXT}
        </p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="agent-chat-plan" onClick={onChatPlan}>
            نفّذ الخطة فقط
          </button>
        </div>
        <p className="field-label">المهمة</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.loadedJob === 'slots' ? 'primary' : 'ghost'}
            data-testid="agent-job-slots"
            onClick={() => onLoadJob('slots')}
          >
            {JOB_SLOTS_LABEL}
          </button>
          <button
            type="button"
            className={quest.loadedJob === 'shelf' ? 'primary' : 'ghost'}
            data-testid="agent-job-shelf"
            onClick={() => onLoadJob('shelf')}
          >
            {JOB_SHELF_LABEL}
          </button>
        </div>
        <p className="field-label">هدف</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.goal === 'post_slots' ? 'primary' : 'ghost'}
            data-testid="agent-goal-slots"
            onClick={() => onGoal('post_slots')}
          >
            {GOAL_SLOTS_TEXT}
          </button>
          <button
            type="button"
            className={quest.goal === 'chat_only' ? 'primary' : 'ghost'}
            data-testid="agent-goal-chat"
            onClick={() => onGoal('chat_only')}
          >
            من الدردشة فقط
          </button>
          <button
            type="button"
            className={quest.goal === 'live_hours' ? 'primary' : 'ghost'}
            data-testid="agent-goal-hours"
            onClick={() => onGoal('live_hours')}
          >
            ساعات حيّة على اللوحة
          </button>
        </div>
        <p className="field-label">أدوات مسموحة</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.toolRead ? 'primary' : 'ghost'}
            data-testid="agent-tool-read"
            onClick={() => onTool('read')}
          >
            <Ltr text="read_slots" />
          </button>
          <button
            type="button"
            className={quest.toolWrite ? 'primary' : 'ghost'}
            data-testid="agent-tool-write"
            onClick={() => onTool('write')}
          >
            <Ltr text="write_notice" />
          </button>
          <button
            type="button"
            className={quest.toolVerify ? 'primary' : 'ghost'}
            data-testid="agent-tool-verify"
            onClick={() => onTool('verify')}
          >
            <Ltr text="verify_notice" />
          </button>
          <button
            type="button"
            className={quest.toolChat ? 'primary' : 'ghost'}
            data-testid="agent-tool-chat"
            onClick={() => onTool('chat')}
          >
            <Ltr text="chat_only" />
          </button>
          <button
            type="button"
            className={quest.toolHours ? 'primary' : 'ghost'}
            data-testid="agent-tool-hours"
            onClick={() => onTool('hours')}
          >
            <Ltr text="live_hours" />
          </button>
        </div>
        <p className="field-label">معيار نجاح</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.successTest === 'slots_posted' ? 'primary' : 'ghost'}
            data-testid="agent-success-slots"
            onClick={() => onSuccess('slots_posted')}
          >
            {SUCCESS_SLOTS_TEXT}
          </button>
          <button
            type="button"
            className={quest.successTest === 'robot_done' ? 'primary' : 'ghost'}
            data-testid="agent-success-robot"
            onClick={() => onSuccess('robot_done')}
          >
            الروبوت قال تم
          </button>
          <button
            type="button"
            className={quest.successTest === 'click_count' ? 'primary' : 'ghost'}
            data-testid="agent-success-clicks"
            onClick={() => onSuccess('click_count')}
          >
            عدد النقرات
          </button>
        </div>
        <p className="field-label">شرط توقف</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.stopRule === 'budget_3_or_missing' ? 'primary' : 'ghost'}
            data-testid="agent-stop-budget3"
            onClick={() => onStop('budget_3_or_missing')}
          >
            {STOP_BUDGET3_TEXT}
          </button>
          <button
            type="button"
            className={quest.stopRule === 'budget_1' ? 'primary' : 'ghost'}
            data-testid="agent-stop-1"
            onClick={() => onStop('budget_1')}
          >
            توقف بعد خطوة واحدة
          </button>
          <button
            type="button"
            className={quest.stopRule === 'unlimited' ? 'primary' : 'ghost'}
            data-testid="agent-stop-unlimited"
            onClick={() => onStop('unlimited')}
          >
            لا تتوقف أبداً
          </button>
        </div>
        <p className="field-label">تشغيل</p>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="agent-run" onClick={onRun}>
            شغّل الحلقة
          </button>
          <button type="button" className="ghost" data-testid="agent-extra-step" onClick={onExtra}>
            حاول خطوة إضافية
          </button>
          <button type="button" className="ghost" data-testid="agent-invoke-hours" onClick={onInvokeHours}>
            <Ltr text="live_hours" />
          </button>
          <button type="button" className="ghost" data-testid="agent-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {quest.trace.length > 0 ? (
          <ol className="stock-list" data-testid="agent-trace">
            {quest.trace.map((step, index) => (
              <li key={`${step.tool}-${index}`}>
                {step.phase} — <Ltr text={step.tool} /> — <SlotCopy text={step.detail} />
              </li>
            ))}
          </ol>
        ) : null}
        {output && isStopCopy(output) ? (
          <p className="robot-understood" data-testid="agent-stop-reason">
            {output}
          </p>
        ) : null}
        {output ? (
          <p className="parcel-fail" data-testid="agent-feedback">
            {output}
          </p>
        ) : null}
        <p className="card-note">
          {LIVE_HOURS_TEXT} تُرفض إن لم تُسمح. {AGENT_FEEDBACK.permission}
        </p>
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="agent-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
