import { useState } from 'react';
import { DECOY_WARN, LAB_OK200, LAB_PATHS, lsListing } from '../engine/lab';
import type { GameState, LabFilePath, LabLogId, LabPatchTarget, LabRefuseCommand } from '../engine/types';

interface Props {
  state: GameState;
  onLs: () => void;
  onCat: (path: LabFilePath) => void;
  onSelectLog: (log: LabLogId) => void;
  onPatch: (file: LabPatchTarget) => void;
  onPublish: () => void;
  onLookup: () => void;
  onRefuse: (command: LabRefuseCommand) => void;
  onRobotDone: () => void;
  onCmd: (text: string) => void;
  onClose: () => void;
}

function Ltr({ text, testId }: { text: string; testId?: string }) {
  return (
    <span className="path-ltr" dir="ltr" data-testid={testId}>
      {text}
    </span>
  );
}

const CAT_BUTTONS: { path: LabFilePath; testId: string; label: string }[] = [
  { path: 'preview/kiosk.js', testId: 'lab-cat-preview-kiosk', label: 'cat preview/kiosk.js' },
  { path: 'production/kiosk.js', testId: 'lab-cat-production-kiosk', label: 'cat production/kiosk.js' },
  { path: 'logs/preview.log', testId: 'lab-cat-preview-log', label: 'cat logs/preview.log' },
  { path: 'logs/production.error', testId: 'lab-cat-prod-log', label: 'cat logs/production.error' },
  { path: 'notes/builder.warn', testId: 'lab-cat-decoy', label: 'cat notes/builder.warn' },
];

export function LabOverlay({
  state,
  onLs,
  onCat,
  onSelectLog,
  onPatch,
  onPublish,
  onLookup,
  onRefuse,
  onRobotDone,
  onCmd,
  onClose,
}: Props) {
  const quest = state.labQuest;
  const [typed, setTyped] = useState('');
  const output = state.shopFeedback ?? '';
  const frozenLabel = quest.publishedVersion === 2 ? 'v2' : 'v1';

  if (quest.view === 'prod') {
    return (
      <div className="overlay" data-testid="lab-overlay" role="dialog" aria-modal="true">
        <article className="paper-card instruction-card" data-testid="prod-face">
          <p className="card-stamp">وجه الإنتاج المجمّد</p>
          <p className="field-label">
            نسخة مجمّدة{' '}
            <Ltr text={frozenLabel} testId="prod-version" />
          </p>
          <p className="card-note">
            مسار الإنتاج الحالي:{' '}
            <Ltr
              text={quest.publishedVersion === 2 ? 'GET /appointments/slots' : 'GET /appointments/slot'}
              testId="prod-path"
            />
          </p>
          <div className="button-row wrap-choices">
            <button type="button" className="primary" data-testid="lab-lookup" onClick={onLookup}>
              اطلب الفترات من الإنتاج
            </button>
          </div>
          {output ? (
            <pre className="notice-body" data-testid="lab-output">
              {output.includes('GET /') ? (
                <>
                  {output.split(/(GET \/appointments\/slots?)/g).map((part, index) =>
                    part.startsWith('GET /') ? (
                      <Ltr key={index} text={part} />
                    ) : (
                      <span key={index}>{part}</span>
                    ),
                  )}
                </>
              ) : (
                output
              )}
            </pre>
          ) : null}
          {quest.verifiedProd ? (
            <p className="robot-understood" data-testid="lab-verified">
              {LAB_OK200}
            </p>
          ) : null}
          {state.shopFeedback ? (
            <p className="parcel-fail" data-testid="lab-feedback">
              {state.shopFeedback}
            </p>
          ) : null}
          <div className="button-row wrap-choices">
            <button type="button" className="ghost" data-testid="lab-robot-done" onClick={onRobotDone}>
              تم
            </button>
          </div>
          <div className="button-row card-actions">
            <button type="button" className="primary" data-testid="lab-close" onClick={onClose}>
              طي الواجهة
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="overlay" data-testid="lab-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="lab-terminal">
        <p className="card-stamp">مختبر النشر</p>
        <p className="card-note">أوامر مؤلفة فقط. المختبر وهمي ولا يشغّل صدفة حقيقية.</p>
        <p className="field-label">قراءة</p>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="lab-ls" onClick={onLs}>
            ls
          </button>
          {CAT_BUTTONS.map((item) => (
            <button
              key={item.path}
              type="button"
              className="ghost"
              data-testid={item.testId}
              onClick={() => onCat(item.path)}
            >
              <Ltr text={item.label} />
            </button>
          ))}
        </div>
        <p className="field-label">السجل ذو الصلة</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.selectedLog === 'production.error' ? 'primary' : 'ghost'}
            data-testid="lab-select-prod-log"
            onClick={() => onSelectLog('production.error')}
          >
            <Ltr text="logs/production.error" />
          </button>
          <button
            type="button"
            className={quest.selectedLog === 'preview.log' ? 'primary' : 'ghost'}
            data-testid="lab-select-preview-log"
            onClick={() => onSelectLog('preview.log')}
          >
            <Ltr text="logs/preview.log" />
          </button>
          <button
            type="button"
            className={quest.selectedLog === 'builder.warn' ? 'primary' : 'ghost'}
            data-testid="lab-select-decoy"
            onClick={() => onSelectLog('builder.warn')}
          >
            <Ltr text="notes/builder.warn" />
          </button>
        </div>
        <p className="field-label">إصلاح ونشر</p>
        <div className="button-row wrap-choices">
          <button type="button" className="primary" data-testid="lab-patch-prod" onClick={() => onPatch('production/kiosk.js')}>
            أصلح المسار إلى /appointments/slots
          </button>
          <button type="button" className="ghost" data-testid="lab-patch-preview" onClick={() => onPatch('preview/kiosk.js')}>
            أصلح preview/kiosk.js
          </button>
          <button type="button" className="ghost" data-testid="lab-patch-decoy" onClick={() => onPatch('notes/builder.warn')}>
            أصلح notes/builder.warn
          </button>
          <button type="button" className="ghost" data-testid="lab-publish" onClick={onPublish}>
            انشر نسخة ثابتة
          </button>
        </div>
        <p className="field-label">أوامر خطرة (للرفض)</p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="lab-rm" onClick={() => onRefuse('rm -rf /')}>
            rm -rf /
          </button>
          <button type="button" className="ghost" data-testid="lab-format" onClick={() => onRefuse('format-disk')}>
            format-disk
          </button>
        </div>
        <p className="field-label">أمر مسموح</p>
        <form
          className="button-row wrap-choices"
          onSubmit={(event) => {
            event.preventDefault();
            onCmd(typed);
            setTyped('');
          }}
        >
          <input
            dir="ltr"
            className="path-ltr"
            data-testid="lab-cmd-input"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            aria-label="أمر المختبر"
          />
          <button type="submit" className="ghost" data-testid="lab-cmd-run">
            نفّذ
          </button>
        </form>
        {quest.listedDir ? (
          <ul className="stock-list" data-testid="lab-ls-list">
            {LAB_PATHS.map((path) => (
              <li key={path}>
                <Ltr text={path} />
              </li>
            ))}
          </ul>
        ) : null}
        {output ? (
          <pre className="notice-body" data-testid="lab-output">
            {output}
          </pre>
        ) : null}
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="lab-feedback">
            {state.shopFeedback}
          </p>
        ) : null}
        <p className="card-note" data-testid="lab-decoy-copy">
          {DECOY_WARN}
        </p>
        <p className="card-note">
          ls يعرض:{' '}
          <Ltr text={lsListing().replace(/\n/g, ' · ')} />
        </p>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="lab-robot-done" onClick={onRobotDone}>
            تم
          </button>
        </div>
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="lab-close" onClick={onClose}>
            طي الواجهة
          </button>
        </div>
      </article>
    </div>
  );
}
