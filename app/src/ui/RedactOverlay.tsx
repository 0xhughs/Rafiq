import {
  LIBRARY_FEEDBACK,
  NEEDED_STRINGS,
  PRIVATE_STRINGS,
  buildFilePayload,
  communityFileSource,
} from '../engine/library';
import type { GameState, NeededFactId, PrivateFieldId } from '../engine/types';

interface Props {
  state: GameState;
  onRedact: (field: PrivateFieldId) => void;
  onFact: (field: NeededFactId) => void;
  onGive: () => void;
  onClose: () => void;
}

export function RedactOverlay({ state, onRedact, onFact, onGive, onClose }: Props) {
  const quest = state.libraryQuest;
  const payload = buildFilePayload(quest);
  return (
    <div className="overlay" data-testid="redact-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="community-file">
        <p className="card-stamp">ملف حيّ — قبل المشاركة</p>
        <h2>ماذا يُحذف قبل أن يراه الروبوت؟</h2>
        <pre className="notice-body" data-testid="community-file-source">
          {communityFileSource()}
        </pre>
        <p className="field-label">حقول خاصة — احذفها</p>
        <div className="button-row wrap-choices">
          {(
            [
              ['name_noura', PRIVATE_STRINGS.name_noura],
              ['name_khalid', PRIVATE_STRINGS.name_khalid],
              ['phone', PRIVATE_STRINGS.phone],
              ['address', PRIVATE_STRINGS.address],
            ] as const
          ).map(([field, label]) => (
            <button
              key={field}
              type="button"
              className={quest.redacted[field] ? 'primary' : 'ghost'}
              data-testid={`redact-${field}`}
              onClick={() => onRedact(field)}
            >
              {quest.redacted[field] ? `محذوف: ${label}` : `احذف ${label}`}
            </button>
          ))}
        </div>
        <p className="field-label">حقائق مطلوبة — لا تخفِها</p>
        <div className="button-row wrap-choices">
          {(
            [
              ['shelf', NEEDED_STRINGS.shelf],
              ['time', NEEDED_STRINGS.time],
              ['spec_location', NEEDED_STRINGS.spec_location],
            ] as const
          ).map(([field, label]) => (
            <button
              key={field}
              type="button"
              className={quest.hiddenFacts[field] ? 'ghost' : 'primary'}
              data-testid={`fact-${field}`}
              onClick={() => onFact(field)}
            >
              {quest.hiddenFacts[field] ? `مخفي: ${label}` : label}
            </button>
          ))}
        </div>
        <p className="field-label">ما سيُعطى للروبوت</p>
        <pre className="notice-body notice-working" data-testid="redact-payload">
          {payload}
        </pre>
        {state.shopFeedback ? (
          <p
            className={quest.fileGiven ? 'robot-understood' : 'parcel-fail'}
            data-testid="redact-feedback"
          >
            {state.shopFeedback}
          </p>
        ) : (
          <p className="card-note">{LIBRARY_FEEDBACK.unredacted}</p>
        )}
        <div className="button-row card-actions">
          <button type="button" className="primary" data-testid="redact-give" onClick={onGive}>
            أعطِ الملف للروبوت
          </button>
          <button type="button" className="ghost" data-testid="redact-close" onClick={onClose}>
            طي الملف
          </button>
        </div>
      </article>
    </div>
  );
}
