# T04 browser checks — slice 07

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5179` and **preview** `http://127.0.0.1:4180` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Port 5173 was occupied by another checkout; 5178 was also occupied. Preview runs used `env -u BASE_URL` so `playwright.config.ts` started `vite preview` on 4180. Dev runs started a fresh Vite on 5179 and set `BASE_URL=http://127.0.0.1:5179` (webServer disabled; no reuse of 5173).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (36 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` — help-accepted through shop success. Shop success evidence remains `1.1,1.2,1.3,1.6`.
- `e2e/shop-retry.spec.ts` — trusting robot date price 18 fails; retry succeeds.
- `e2e/parcel.spec.ts` — shop_helped through parcel success, then inner door `F` enters map `archive`.
- `e2e/parcel-retry.spec.ts` — overbroad / ambiguous / decoy-pay retries still recover without awarding archive ids.
- `e2e/archive.spec.ts` — parcel-done through archive success. After 1.4+1.5+2.5, 06 ids stay unawarded. Entering قاعة أخبار الحي after archive success does not award 2.3 / 2.6 / 3.1 / 3.2 / 3.3.
- `e2e/archive-retry.spec.ts` — pin does not skip 1.4; overflow then reselect; unredacted give fails; wrong pack then correct named pack.
- `e2e/newsroom.spec.ts` — archive-success through newsroom success with physical actions. After 2.3+2.6+3.1+3.2+3.3, **3.4 and 3.5 stay unawarded** and `workshopMaterials` stays false. Entering مكتب المهرجان is not required here; `playToNewsroomDone` asserts those ids stay empty.
- `e2e/newsroom-retry.spec.ts` — consensus, cite-before-original, unmarked draft, slogan, and circular letter all retry.
- `e2e/festival.spec.ts` — newsroom-success through festival success with physical actions. Screenshots in `evidence/07/`: `interior.png` (مكتب المهرجان with جدول / إيصالات / سياسة / مطابقة / بيان / غلاف), `table.png` (أعلام ١٢ / أقمشة ٨ / فناجين ٦ / ماء ١٥), `receipts.png` (أعلام ١٢ / أقمشة ٨ / ماء ٢٠ / لا إيصال), `reconcile.png` + `missing.png` (مطابق flags+cloth, water ٢٠ from receipt, cups غير معروف, then اجمع المؤيَّد = ٤٠), `policy.png` (سياسة العمل والدراسة + «صيغ بمساعدة الروبوت»), `submission.png` (human ٤٠ + unknown cups + stamp), `success.png` (officer thanks + مواد المعاينة; street workshop door open copy; no workshop map). Overlay bounds at 1366 (reconcile card) and 1920 (submit card): `overlays.png` is the 1920 submit overlay.
- `e2e/festival-retry.spec.ts` — invented cups ٦/١٠, table water ١٥, robot total ٤٦, missing stamp, robot figures, and officer signature all fail then retry; 3.4 then 3.5 award only on the honest path.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. `MAP_IDS` does not include `workshop`. Fail-path copy appears on the paper cards via `shopFeedback` (`reconcile-feedback` / `submit-feedback`).

Console errors observed in those viewport tests: **none**.

The festival overlays are paper sheets, not a quiz. After 3.4+3.5 the HUD objective is مواد المعاينة; the workshop interior is not implemented. The robot still invents فناجين عشرة / مجموع ستة وأربعون.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Workshop interior (out of slice; 4.1–4.2)
