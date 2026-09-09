import {
  NEWSROOM_FEEDBACK,
  PASSAGE_A_ACCESS,
  PASSAGE_A_HOURS,
  PASSAGE_B_ACCESS,
  PASSAGE_B_HOURS,
  SOURCE_A,
  SOURCE_A_NAME,
  SOURCE_B,
  SOURCE_B_NAME,
} from '../engine/newsroom';
import type { CompareFlag, GameState } from '../engine/types';

interface Props {
  state: GameState;
  onToggle: (field: CompareFlag) => void;
  onSubmit: (style: 'split' | 'consensus') => void;
  onClose: () => void;
}

export function CompareOverlay({ state, onToggle, onSubmit, onClose }: Props) {
  const quest = state.newsroomQuest;
  return (
    <div className="overlay" data-testid="compare-overlay" role="dialog" aria-modal="true">
      <article className="paper-card instruction-card" data-testid="comparison-card">
        <p className="card-stamp">منضدة المقارنة</p>
        <h2>لا تمحُ الخلاف</h2>
        <p className="card-note">
          سمِّ الورقتين، سجّل خلاف الساعات وخلاف الدخول، وأرفق جملة من كل مصدر.
        </p>
        <div className="note-grid" data-testid="sources">
          <div className="paper-slip" data-testid="source-bulletin">
            <p className="card-stamp">{SOURCE_A_NAME}</p>
            <pre className="notice-body">{SOURCE_A}</pre>
          </div>
          <div className="paper-slip" data-testid="source-poster">
            <p className="card-stamp">{SOURCE_B_NAME}</p>
            <pre className="notice-body">{SOURCE_B}</pre>
          </div>
        </div>
        <p className="field-label">سمِّ المصدرين</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.namedBulletin ? 'primary' : 'ghost'}
            data-testid="compare-namedBulletin"
            onClick={() => onToggle('namedBulletin')}
          >
            {SOURCE_A_NAME}
          </button>
          <button
            type="button"
            className={quest.namedPoster ? 'primary' : 'ghost'}
            data-testid="compare-namedPoster"
            onClick={() => onToggle('namedPoster')}
          >
            {SOURCE_B_NAME}
          </button>
        </div>
        <p className="field-label">خلاف الساعات</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.hoursA ? 'primary' : 'ghost'}
            data-testid="compare-hoursA"
            onClick={() => onToggle('hoursA')}
          >
            {PASSAGE_A_HOURS}
          </button>
          <button
            type="button"
            className={quest.hoursB ? 'primary' : 'ghost'}
            data-testid="compare-hoursB"
            onClick={() => onToggle('hoursB')}
          >
            {PASSAGE_B_HOURS}
          </button>
        </div>
        <p className="field-label">خلاف الدخول</p>
        <div className="button-row wrap-choices">
          <button
            type="button"
            className={quest.accessA ? 'primary' : 'ghost'}
            data-testid="compare-accessA"
            onClick={() => onToggle('accessA')}
          >
            {PASSAGE_A_ACCESS}
          </button>
          <button
            type="button"
            className={quest.accessB ? 'primary' : 'ghost'}
            data-testid="compare-accessB"
            onClick={() => onToggle('accessB')}
          >
            {PASSAGE_B_ACCESS}
          </button>
        </div>
        <p className="field-label">الجمل المرفقة</p>
        <p data-testid="passage-a">
          {[quest.hoursA ? PASSAGE_A_HOURS : '', quest.accessA ? PASSAGE_A_ACCESS : '']
            .filter(Boolean)
            .join(' · ') || 'لا جملة من النشرة بعد.'}
        </p>
        <p data-testid="passage-b">
          {[quest.hoursB ? PASSAGE_B_HOURS : '', quest.accessB ? PASSAGE_B_ACCESS : '']
            .filter(Boolean)
            .join(' · ') || 'لا جملة من الملصق بعد.'}
        </p>
        {state.shopFeedback ? (
          <p className="parcel-fail" data-testid="compare-feedback">
            {state.shopFeedback}
          </p>
        ) : (
          <p className="card-note">{NEWSROOM_FEEDBACK.inspectOnly}</p>
        )}
        <div className="button-row card-actions">
          <button
            type="button"
            className="primary"
            data-testid="compare-submit"
            onClick={() => onSubmit('split')}
          >
            احفظ المقارنة مع الخلاف
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="compare-consensus"
            onClick={() => onSubmit('consensus')}
          >
            اكتب خلاصة متفقة
          </button>
          <button type="button" className="ghost" data-testid="compare-close" onClick={onClose}>
            طي الورقة
          </button>
        </div>
      </article>
    </div>
  );
}
