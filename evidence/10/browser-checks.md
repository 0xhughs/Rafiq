# T04 browser checks — slice 10

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5192` and **preview** `http://127.0.0.1:4188` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Port 5173 was occupied by another checkout; 5174–5183, preview 4173–4174, and 5190 were also occupied. Preview runs used `env -u BASE_URL PREVIEW_PORT=4188` so `playwright.config.ts` started `vite preview` on 4188. Dev runs started a fresh Vite on 5192 and set `BASE_URL=http://127.0.0.1:5192` (webServer disabled; no reuse of 5173).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (45 tests each run):

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
- `e2e/workshop.spec.ts` — festival-success through workshop success with physical actions. After 4.1+4.2, **4.3 and 4.4 stay unawarded** and `kioskReady` stays false. Helper `playToWorkshopDone` encodes that path.
- `e2e/workshop-retry.spec.ts` — extra in brief → bloated board / extra control fail 4.1 then exclude and rebuild; missing screens fail 4.2 then fill; build without brief refuses then hand a complete brief; inspect-only / robot «تم» do not award; booking a posted slot on the slim board awards 4.1 and 4.2 together with `servicePosted`.
- `e2e/kiosk.spec.ts` — workshop-success through kiosk success with physical actions. After 4.3+4.4, **4.5 / 4.6 / 5.4 stay unawarded** and `labReady` stays false. Helper `playToKioskDone` encodes that path. Preview kiosk `q` still works.
- `e2e/kiosk-retry.spec.ts` — missing key → fail 4.3 then vault and resend; exposed key on face → fail 4.3 then move to vault and strip face; LTR-broken lookup → fail 4.4 (`أصلح اتجاه الواجهة أولاً`) then set RTL + isolate `slot-id`; skip/close manual test → no 4.4 then complete checklist + lookup.
- `e2e/lab.spec.ts` — kiosk-success through lab success with physical actions. Screenshots in `evidence/10/`: `interior.png` (ورشة الإصلاح after kioskReady; مختبر النشر `w` and frozen production `l` visible on row 8), `preview.png` (preview kiosk `q` lookup still succeeds with `sun-pm`), `prod-broken.png` (frozen v1 `404 GET /appointments/slot` / `تعطل الإنتاج — راجع السجلات` on `data-testid="prod-face"`; path fragment `direction: ltr`), `guess.png` (patch without `production.error` selected → `اختر السجل ذو الصلة أولاً`; 4.5 not awarded), `ls.png` (authored `ls` lists `preview/kiosk.js`, `production/kiosk.js`, `logs/preview.log`, `logs/production.error`, `notes/builder.warn` with path spans `direction: ltr`), `logs.png` (`cat logs/preview.log` 200 slots and `logs/production.error` 404 slot; select relevant log), `fixed.png` (targeted `أصلح المسار إلى /appointments/slots` on `production/kiosk.js` awards 4.5), `refuse.png` (`rm -rf /` refused; files unchanged; 5.4), `published.png` (`انشر نسخة ثابتة` frozen v2), `verified.png` (production lookup 200 with sun-pm / mon-am / tue-pm; 4.6; `labReady`), `success.png` (manager thanks for the frozen production copy; robot still invents `rm -rf يصلح العطل` / `الجيران يرون المعاينة`). Overlay bounds at 1366 (lab terminal card) and 1920 (prod face card): `overlays.png` is the 1920 production-face overlay.
- `e2e/lab-retry.spec.ts` — guess-fix without log → fail 4.5 then select `production.error` and patch `production/kiosk.js`; decoy file/log → fail then correct selection; publish without repair → production still 404 (`النسخة المجمّدة ما زالت على المسار الخاطئ`) then repair + publish v2 + verify; repair without publish → production still v1 then publish + verify; `format-disk` refused with files intact then `ls`/`cat` for 5.4.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `a` `m` `j` `k` `q` `t` `e` `d` stay put. `data-slice="10"`. Fail-path copy appears on the lab cards via `shopFeedback` (`lab-feedback`). Path/log fragments use `direction: ltr` / class `path-ltr`.

Console errors observed in those viewport tests: **none**.

The lab is a paper/terminal overlay, not a quiz or a real shell. After 4.5+4.6+5.4 the HUD objective is نُشرت نسخة الإنتاج المصلحة; the robot still invents «rm -rf يصلح العطل» or «الجيران يرون المعاينة». No MCP, harness, or certificate. No live HTTP / `fetch`. Typed player text is never `eval`'d.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 11 harness / bounded agent loop (out of slice)
