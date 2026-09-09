import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onClose: () => void;
}

export function InspectOverlay({ state, onClose }: Props) {
  const target = state.inspectTarget;
  if (!target) return null;
  return (
    <div
      className="overlay"
      data-testid="inspect-overlay"
      role="dialog"
      aria-modal="true"
    >
      {target === 'west' ? (
        <article className="paper-card" data-testid="shelf-record-west">
          <p className="card-stamp">بطاقة الرف الغربي</p>
          <h2>مخزون الرف الأيسر</h2>
          <ul className="stock-list">
            <li>خبز — ٣</li>
            <li>لبن — ٤</li>
            <li>ماء — ٢ متوفر</li>
          </ul>
          <p className="card-note">لا يوجد عصير مانجو على هذه البطاقة.</p>
        </article>
      ) : null}
      {target === 'east' ? (
        <article className="paper-card" data-testid="shelf-record-east">
          <p className="card-stamp">بطاقة الرف الشرقي</p>
          <h2>مخزون الرف الأيمن</h2>
          <ul className="stock-list">
            <li>تمر الخلاص — ٩</li>
          </ul>
          <p className="card-note">لا يوجد مانجو في هذا السجل.</p>
        </article>
      ) : null}
      {target === 'price' ? (
        <article className="paper-card" data-testid="price-list">
          <p className="card-stamp">قائمة الأسعار</p>
          <h2>بقالة الزاوية</h2>
          <ul className="stock-list">
            <li>خبز — ٣</li>
            <li>لبن — ٤</li>
            <li>ماء — ٢ متوفر</li>
            <li>تمر الخلاص — ٩</li>
          </ul>
          <p className="card-hours">مفتوح حتى المغرب</p>
          <p className="card-note">لا يوجد مانجو في القائمة.</p>
        </article>
      ) : null}
      {target === 'hold_west' ? (
        <article className="paper-card" data-testid="parcel-tag-west">
          <p className="card-stamp">بطاقة الرف الغربي</p>
          <h2>{state.parcelQuest.r19Staged ? 'ر-١٩' : 'ر-١٧'}</h2>
          <ul className="stock-list">
            <li>حجز إصلاح — ليس للبيع</li>
            <li>اللون: رمادي</li>
            <li>الموقع: الرف الغربي</li>
          </ul>
          <p className="card-note">هذا الحجز يُستلم بتعليمات واضحة، لا يُشترى.</p>
        </article>
      ) : null}
      {target === 'hold_east' ? (
        <article className="paper-card" data-testid="parcel-tag-east">
          <p className="card-stamp">بطاقة الرف الشرقي</p>
          <h2>ر-٧١</h2>
          <ul className="stock-list">
            <li>للبيع — ١٢ ريالاً</li>
            <li>اللون: رمادي</li>
            <li>الموقع: الرف الشرقي</li>
          </ul>
          <p className="card-note">طرد رمادي معروض للبيع، ليس حجز الإصلاح.</p>
        </article>
      ) : null}
      {target === 'hold_board' ? (
        <article className="paper-card" data-testid="parcel-board">
          <p className="card-stamp">لوحة الحجوزات</p>
          <h2>مكتب طرود الرصيف</h2>
          <ul className="stock-list">
            <li>غربي: {state.parcelQuest.r19Staged ? 'ر-١٩' : 'ر-١٧'} حجز إصلاح — ليس للبيع</li>
            <li>شرقي: ر-٧١ رمادي للبيع بـ ١٢</li>
          </ul>
          <p className="card-note">الدفع من النافذة لصاحب الطلب. الروبوت لا يدفع.</p>
        </article>
      ) : null}
      {target === 'notes' ? (
        <article className="paper-card" data-testid="notes-crate">
          <p className="card-stamp">أوراق على الصندوق</p>
          <h2>أربع ملاحظات</h2>
          <ul className="stock-list">
            <li>قيد التسليم — الرف الغربي، بلا دفع</li>
            <li>بطاقة الحجز — الحجز ليس للبيع</li>
            <li>ورقة المهرجان — فجر وحلويات</li>
            <li>ملاحظة المانجو — رف أيسر واثنا عشر</li>
          </ul>
          <p className="card-note">حمّلها في نافذة المنضدة. النافذة تتسع لاثنتين فقط.</p>
        </article>
      ) : null}
      {target === 'spec' ? (
        <article className="paper-card" data-testid="spec-case">
          <p className="card-stamp">غلاف المواصفات</p>
          <h2>قطعة الإصلاح</h2>
          {state.libraryQuest.specReleased ? (
            <pre className="notice-body" data-testid="spec-text">
              {`مواصفات قطعة الإصلاح
الرف: م-٤
الوقت المناسب للقراءة: بعد العصر
المواصفات في القاعة فقط.
لا تخلط ملف المهرجان أو مسودة الخبر مع هذه الحزمة.`}
            </pre>
          ) : (
            <p className="card-note" data-testid="spec-sealed">
              الغلاف ما زال مقفلاً حتى تكتمل النافذة والملف الآمن والحزمة المسماة.
            </p>
          )}
        </article>
      ) : null}
      <div className="button-row card-actions">
        <button type="button" className="primary" data-testid="inspect-close" onClick={onClose}>
          إعادة البطاقة
        </button>
      </div>
    </div>
  );
}
