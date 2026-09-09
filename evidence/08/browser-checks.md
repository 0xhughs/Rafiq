# T04 browser checks — slice 08

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5181` and **preview** `http://127.0.0.1:4180` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Port 5173 was occupied by another checkout; 5178–5180 were also occupied. Preview runs used `env -u BASE_URL PREVIEW_PORT=4180` so `playwright.config.ts` started `vite preview` on 4180. Dev runs started a fresh Vite on 5181 and set `BASE_URL=http://127.0.0.1:5181` (webServer disabled; no reuse of 5173).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (39 tests each run):

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
- `e2e/archive.spec.ts` — parcel-done through archive success. After 1.4+1.5+2.5, 06 ids stay unawarded.
- `e2e/archive-retry.spec.ts` — pin does not skip 1.4; overflow then reselect; unredacted give fails; wrong pack then correct named pack.
- `e2e/newsroom.spec.ts` — archive-success through newsroom success with physical actions. After 2.3+2.6+3.1+3.2+3.3, **3.4 and 3.5 stay unawarded** and `workshopMaterials` stays false.
- `e2e/newsroom-retry.spec.ts` — consensus, cite-before-original, unmarked draft, slogan, and circular letter all retry.
- `e2e/festival.spec.ts` — newsroom-success through festival success with physical actions. After 3.4+3.5, **4.1 and 4.2 stay unawarded** and `servicePosted` stays false. Street letter `Y` portals into map `workshop` without awarding those ids. Helper `playToFestivalDone` encodes that path.
- `e2e/festival-retry.spec.ts` — invented cups ٦/١٠, table water ١٥, robot total ٤٦, missing stamp, robot figures, and officer signature all fail then retry; 3.4 then 3.5 award only on the honest path.
- `e2e/workshop.spec.ts` — festival-success through workshop success with physical actions. Screenshots in `evidence/08/`: `interior.png` (ورشة الإصلاح with حاجة / إضافات / وصف / بنّاء / فحص / مواعيد), `need.png` (ورقة الحاجة — لوحة مواعيد المعاينة and the three posted slots), `extras.png` (دفع إلكتروني / دردشة مباشرة / ساعات استقبال حيّة / كiosk), `brief.png` (four authored parts: شاشات / قيود / استثناءات / قبول ملاحظ), `missing.png` (retryable Arabic when screens are missing), `builder.png` (hand brief then build), `board.png` (three posted slots), `booked.png` («محجوز» after booking الأحد — بعد العصر), `success.png` (manager thanks; board posted; robot still invents مفتوحة دائماً / الدفع). Overlay bounds at 1366 (brief card) and 1920 (board card): `overlays.png` is the 1920 board overlay.
- `e2e/workshop-retry.spec.ts` — extra in brief → bloated board / extra control fail 4.1 then exclude and rebuild; missing screens fail 4.2 then fill; build without brief refuses then hand a complete brief; inspect-only / robot «تم» do not award; booking a posted slot on the slim board awards 4.1 and 4.2 together with `servicePosted`.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. `MAP_IDS` includes `workshop`. `data-slice="08"`. Fail-path copy appears on the paper cards via `shopFeedback` (`builder-feedback` / `board-feedback`).

Console errors observed in those viewport tests: **none**.

The workshop overlays are paper sheets, not a quiz. After 4.1+4.2 the HUD objective is لوحة مواعيد المعاينة معلّقة; the robot still invents hours/payment. No kiosk, API, terminal, MCP, harness, or certificate.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 09 kiosk/API (out of slice)
