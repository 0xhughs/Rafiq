import {
  BRIDGE_CLIENT,
  BRIDGE_FEEDBACK,
  BRIDGE_HOST,
  BRIDGE_RESOURCES,
  BRIDGE_SERVER,
  BRIDGE_TOOLS,
  BROWSER_PATH,
  BROWSER_TITLE,
  DRAFT_EMPTY,
  HOUR_SAT,
  HOUR_SUN,
  HOUR_WED,
  MCP_NOTE,
  RECORD_NH,
  RESOURCE_PAYROLL,
  RESOURCE_WEEK,
  TOOL_LOOKUP,
  TOOL_PAY,
  TOOL_REWRITE,
  TOOL_SAVE,
  bridgeDraftText,
} from '../engine/bridge';
import type { BridgeGrantId, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onConnect: () => void;
  onListTools: () => void;
  onListResources: () => void;
  onGrant: (grant: BridgeGrantId) => void;
  onLookup: () => void;
  onLookupPayroll: () => void;
  onSaveDraft: () => void;
  onInvokeRewrite: () => void;
  onInvokePay: () => void;
  onLoadSkill: () => void;
  onRobotDone: () => void;
  onBrowserSave: () => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

function HourCopy({ text }: { text: string }) {
  return (
    <>
      {text.split(/(sat-10|sun-16|wed-18|NH-1447|lookup_hours|save_draft|rewrite_registry|pay_fees|hours:\/\/neighborhood\/week|hours:\/\/city\/payroll|rafiq-host|civic-client|civic-hours\.rafiq|MCP)/g).map(
        (part, index) =>
          /^(sat-10|sun-16|wed-18|NH-1447|lookup_hours|save_draft|rewrite_registry|pay_fees|hours:\/\/neighborhood\/week|hours:\/\/city\/payroll|rafiq-host|civic-client|civic-hours\.rafiq|MCP)$/.test(
            part,
          ) ? (
            <Ltr key={index} text={part} />
          ) : (
            <span key={index}>{part}</span>
          ),
      )}
    </>
  );
}

export function BridgeOverlay({
  state,
  onConnect,
  onListTools,
  onListResources,
  onGrant,
  onLookup,
  onLookupPayroll,
  onSaveDraft,
  onInvokeRewrite,
  onInvokePay,
  onLoadSkill,
  onRobotDone,
  onBrowserSave,
  onClose,
}: Props) {
  const quest = state.bridgeQuest;
  const output = state.shopFeedback ?? '';
  const draft = bridgeDraftText(quest);

  if (quest.view === 'browser') {
    return (
      <div className="overlay" data-testid="bridge-browser" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card">
          <p className="card-stamp">{BROWSER_TITLE}</p>
          <p className="card-note">
            مسار الصفحة:{' '}
            <Ltr text={BROWSER_PATH} />
          </p>
          <pre className="notice-body" data-testid="bridge-browser-page">
            <HourCopy
              text={`${BROWSER_TITLE}\n${HOUR_SAT}، ${HOUR_SUN}، ${HOUR_WED}`}
            />
          </pre>
          <p className="card-note">صفحة للقراءة فقط. ليست استدعاء أداة.</p>
          {output ? (
            <p className="parcel-fail" data-testid="bridge-feedback">
              <HourCopy text={output} />
            </p>
          ) : null}
          <div className="button-row wrap-choices">
            <button type="button" className="ghost" data-testid="bridge-browser-save" onClick={onBrowserSave}>
              حفظ من المتصفح
            </button>
          </div>
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="bridge-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="overlay" data-testid="bridge-host" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card">
        <p className="card-stamp">منصة الموصل</p>
        <p className="card-note">المضيف يتحدث إلى خادم ساعات الحي عبر العميل. أزرار مؤلّفة، بلا نص حر.</p>
        {quest.connected ? (
          <>
            <p className="field-label">العلاقة</p>
            <p className="card-note">
              <strong>المضيف</strong> <Ltr text={BRIDGE_HOST} testId="bridge-host-name" />
            </p>
            <p className="card-note">
              <strong>العميل</strong> <Ltr text={BRIDGE_CLIENT} testId="bridge-client-name" />
            </p>
            <p className="card-note">
              <strong>الخادم</strong> <Ltr text={BRIDGE_SERVER} testId="bridge-server-name" />
            </p>
            <p className="card-note" data-testid="bridge-mcp-note">
              <HourCopy text={MCP_NOTE} />
            </p>
          </>
        ) : (
          <p className="card-note">اربط الموصل حتى تظهر أسماء المضيف والعميل والخادم.</p>
        )}
        <p className="field-label">المسودة</p>
        <pre className="notice-body" data-testid="bridge-draft-text">
          {draft === DRAFT_EMPTY ? draft : <HourCopy text={draft} />}
        </pre>
        {quest.lookedUp ? (
          <p className="card-note" data-testid="bridge-lookup-result">
            <Ltr text={HOUR_SAT} />، <Ltr text={HOUR_SUN} />، <Ltr text={HOUR_WED} />
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="bridge-connect" onClick={onConnect}>
            اربط الخادم
          </button>
          <button type="button" className="ghost" data-testid="bridge-list-tools" onClick={onListTools}>
            اعرض الأدوات
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="bridge-list-resources"
            onClick={onListResources}
          >
            اعرض الموارد
          </button>
        </div>
        {quest.listedTools ? (
          <ul className="stock-list" data-testid="bridge-tools-list">
            {BRIDGE_TOOLS.map((tool) => (
              <li key={tool}>
                <Ltr text={tool} />
              </li>
            ))}
          </ul>
        ) : null}
        {quest.listedResources ? (
          <ul className="stock-list" data-testid="bridge-resources-list">
            {BRIDGE_RESOURCES.map((resource) => (
              <li key={resource}>
                <Ltr text={resource} />
              </li>
            ))}
          </ul>
        ) : null}
        <p className="field-label">تفويض محدود</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.grantLookup ? 'primary' : 'ghost'}
            data-testid="bridge-grant-lookup"
            onClick={() => onGrant('lookup')}
          >
            <Ltr text={TOOL_LOOKUP} />
          </button>
          <button
            type="button"
            className={quest.grantDraft ? 'primary' : 'ghost'}
            data-testid="bridge-grant-draft"
            onClick={() => onGrant('draft')}
          >
            <Ltr text={TOOL_SAVE} />
          </button>
          <button
            type="button"
            className={quest.grantWeek ? 'primary' : 'ghost'}
            data-testid="bridge-grant-week"
            onClick={() => onGrant('week')}
          >
            <Ltr text={RESOURCE_WEEK} />
          </button>
          <button
            type="button"
            className={quest.grantRewrite ? 'primary' : 'ghost'}
            data-testid="bridge-grant-rewrite"
            onClick={() => onGrant('rewrite')}
          >
            <Ltr text={TOOL_REWRITE} />
          </button>
          <button
            type="button"
            className={quest.grantPayroll ? 'primary' : 'ghost'}
            data-testid="bridge-grant-payroll"
            onClick={() => onGrant('payroll')}
          >
            <Ltr text={RESOURCE_PAYROLL} />
          </button>
          <button
            type="button"
            className={quest.grantAll ? 'primary' : 'ghost'}
            data-testid="bridge-grant-all"
            onClick={() => onGrant('all')}
          >
            اسمح بكل القدرات
          </button>
        </div>
        <p className="field-label">بحث وحفظ</p>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="bridge-lookup" onClick={onLookup}>
            ابحث في <Ltr text={RECORD_NH} />
          </button>
          <button type="button" className="ghost" data-testid="bridge-lookup-payroll" onClick={onLookupPayroll}>
            سجل الرواتب
          </button>
          <button type="button" className="primary" data-testid="bridge-save-draft" onClick={onSaveDraft}>
            احفظ المسودة
          </button>
        </div>
        <p className="field-label">قدرات</p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="bridge-invoke-rewrite" onClick={onInvokeRewrite}>
            استدع <Ltr text={TOOL_REWRITE} />
          </button>
          <button type="button" className="ghost" data-testid="bridge-invoke-pay" onClick={onInvokePay}>
            استدع <Ltr text={TOOL_PAY} />
          </button>
          {quest.connected ? (
            <button type="button" className="ghost" data-testid="bridge-load-skill" onClick={onLoadSkill}>
              حمّل <Ltr text="MCP" /> كمهارة
            </button>
          ) : null}
          <button type="button" className="ghost" data-testid="bridge-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        {output ? (
          <p className="parcel-fail" data-testid="bridge-feedback">
            <HourCopy text={output} />
          </p>
        ) : null}
        <p className="card-note">{BRIDGE_FEEDBACK.robotDone}</p>
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="bridge-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
