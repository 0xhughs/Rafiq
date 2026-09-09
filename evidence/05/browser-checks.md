# T04 browser checks — slice 05

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4180` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL` (a reviewer checkout was bound to `127.0.0.1:5277`). Preview runs used `env -u BASE_URL`; dev runs set `BASE_URL=http://127.0.0.1:5173`.

## Results

All of the following Playwright files passed on **both** the development server and the production preview (30 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` — help-accepted through shop success. Shop success evidence remains `1.1,1.2,1.3,1.6`. No 1.4 / 1.5 / 2.5. Inner door still locked until parcel success.
- `e2e/shop-retry.spec.ts` — trusting robot date price 18 fails; retry succeeds.
- `e2e/parcel.spec.ts` — shop_helped through parcel success, then inner door `F` enters map `archive`. Parcel success does not award 1.4 / 1.5 / 2.5.
- `e2e/parcel-retry.spec.ts` — overbroad / ambiguous / decoy-pay retries still recover without awarding archive ids.
- `e2e/archive.spec.ts` — parcel-done through archive success with physical actions. Screenshots: `interior.png` (reading room with نافذة / أوراق / ملف / حزمة / غلاف), `community-file.png` (نورة الشمري / خالد العتيبي / ٠٥٥٠٠٠١١٢٢ / بيت ١٢ الزقاق الغربي plus م-٤ / بعد العصر / المواصفات في القاعة فقط; player name absent), `overflow.png` (FIFO drop of ورقة المهرجان, slots mango+constraint), `reselect.png` (constraint+hold recitation), `redact.png` (private fields gone, needed facts remain), `pack.png` (spec+delivery in pack, festival/news out, stamp «حزمة إصلاح رفيق»), `success.png` (spec readable with م-٤ and بعد العصر, HUD `وحدة السياق`). Overlay bounds at 1366 (context card) and 1920 (community file): `overlays.png` is the 1920 redact overlay, distinct from the context sheet.
- `e2e/archive-retry.spec.ts` — pin does not skip 1.4; overflow then reselect awards; unredacted give fails then redact succeeds and hiding م-٤ fails; wrong pack (festival stamp / unnamed) then correct named pack.

Console errors observed in those viewport tests: **none**.

The context overlay is a paper sheet with a 2-slot working window, not a quiz. The community file is a paper record. The pack table is a paper record. After 1.4+1.5+2.5 the HUD shows `data-testid="context-module"` and the robot cassette is `contextModule`. The robot still invents an unsupported newsroom rumor; no newsroom map opens.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
