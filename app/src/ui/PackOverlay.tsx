import { PACK_BODY, PACK_FILES, PACK_STAMP_LABEL, PACK_TITLE } from '../engine/library';
import type { GameState, PackFileId, PackStampId } from '../engine/types';

interface Props {
  state: GameState;
  onToggle: (file: PackFileId) => void;
  onStamp: (stamp: PackStampId) => void;
  onAssemble: () => void;
  onClose: () => void;
}

export function PackOverlay({ state, onToggle, onStamp, onAssemble, onClose }: Props) {
  const quest = state.libraryQuest;
  return (
    <div className="overlay" data-testid="pack-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="pack-card">
        <p className="card-stamp">طاولة الحزمة</p>
        <h2>أي الملفات تدخل الحزمة المسماة؟</h2>
        <p className="card-note">
          نافذة الملاحظتين ليست هذه الطاولة. اختر المواصفات وملف التسليم، ثم اختم «حزمة إصلاح رفيق».
        </p>
        <p className="field-label">الوثائق الأربع</p>
        {PACK_FILES.map((file) => (
          <div className="paper-slip" key={file} data-testid={`pack-file-${file}`}>
            <p className="card-stamp">{PACK_TITLE[file]}</p>
            <p>{PACK_BODY[file]}</p>
            <button
              type="button"
              className={quest.packFiles.includes(file) ? 'primary' : 'ghost'}
              data-testid={`pack-toggle-${file}`}
              onClick={() => onToggle(file)}
            >
              {quest.packFiles.includes(file) ? 'في الحزمة' : 'أضف إلى الحزمة'}
            </button>
          </div>
        ))}
        <p className="field-label">ختم الاسم</p>
        <div className="button-row wrap-choices">
          {(['unnamed', 'festival', 'rafiq_repair'] as const).map((stamp) => (
            <button
              key={stamp}
              type="button"
              className={quest.packStamp === stamp ? 'primary' : 'ghost'}
              data-testid={`pack-stamp-${stamp}`}
              onClick={() => onStamp(stamp)}
            >
              {PACK_STAMP_LABEL[stamp]}
            </button>
          ))}
        </div>
        {state.shopFeedback ? (
          <p
            className={quest.packAssembled ? 'robot-understood' : 'parcel-fail'}
            data-testid="pack-feedback"
          >
            {state.shopFeedback}
          </p>
        ) : null}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="pack-assemble" onClick={onAssemble}>
            اجمع الحزمة
          </button>
          <button type="button" className="ghost" data-testid="pack-close" onClick={onClose}>
            طي الأوراق
          </button>
        </div>
      </article>
    </div>
  );
}
