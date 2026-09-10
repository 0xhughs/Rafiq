# T04 browser checks — slice 11

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5296` and **preview** `http://127.0.0.1:4296` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Port 5173 was occupied by another checkout; 5174–5183, preview 4173–4174, and 5190 were also occupied. Preview runs used `env -u BASE_URL PREVIEW_PORT=4296` so `playwright.config.ts` started `vite preview` on 4296. Dev runs started a fresh Vite on 5296 and set `BASE_URL=http://127.0.0.1:5296` (webServer disabled; no reuse of 5173).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (48 tests each run):

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
- `e2e/lab.spec.ts` — kiosk-success through lab success with physical actions. After 4.5+4.6+5.4, **5.1 / 5.2 stay unawarded** and `agentReady` stays false. Helper `playToLabDone` encodes that path. HUD after lab success is `OBJECTIVES.agentWork`. Manager thanks still match `/النسخة المجمّدة|الإنتاج/`. `data-slice="11"`.
- `e2e/lab-retry.spec.ts` — guess-fix without log → fail 4.5 then select `production.error` and patch `production/kiosk.js`; decoy file/log → fail then correct selection; publish without repair → production still 404 then repair + publish v2 + verify; repair without publish → production still v1 then publish + verify; `format-disk` refused with files intact then `ls`/`cat` for 5.4.
- `e2e/agent.spec.ts` — lab-success through bounded job success with physical actions. Screenshots in `evidence/11/`: `interior.png` (ورشة الإصلاح after `labReady`; منصة المشغّل `h` and لوحة الحي `x` on row 8 with `w` and `l` still in place), `plan.png` (authored خطة مقترحة `سأكتب الفترات الآن من الدردشة.` on `data-testid="agent-console"`; `نفّذ الخطة فقط` fails with `الخطة وحدها لا تغيّر اللوحة. راقب أدوات المشغّل.`), `config.png` (هدف `agent-goal-slots`, tools `read_slots` / `write_notice` / `verify_notice` with decoys off, معيار نجاح `agent-success-slots`, شرط توقف `agent-stop-budget3`), `missing.png` (job `تحديث بطاقة الرف` stops `توقف المشغّل: المدخل ناقص — لا يوجد رقم رف`), `run.png` (trace راقب → نفّذ → تحقق with LTR `read_slots` / `write_notice` / `verify_notice`; stop `توقف: معيار النجاح تحقق`; 5.2), `board.png` (`agent-board-text` contains sun-pm / mon-am / tue-pm with `direction: ltr`; 5.1), `extra.png` (`حاول خطوة إضافية` stops `توقف المشغّل: تجاوز حد الخطوات (٣)`; `data-agent-ready`), `success.png` (manager thanks that لوحة الحي shows the three slots and the runner stopped the extra step and missing input; HUD chip `planning-core` «نواة التخطيط»; robot still invents `الدردشة وحدها وكالة` / `المشغّل اختياري`). Overlay bounds at 1366 (console card) and 1920 (board card): `overlays.png` is the 1920 neighborhood-board overlay.
- `e2e/agent-retry.spec.ts` — chat-plan → fail 5.1 then run tools + inspect board; wrong goal/tools/success → fail then correct fields; budget_1 → stop after observe (`تجاوز حد الخطوات (١)`) board empty then set budget 3; missing-input job → stop then load slots job; unlimited extra → pollute (`المشغّل لم يتوقف عند الحد`) then budget 3 + restore three slots + extra-step stops; inspect-only / robot «تم» → no award then complete actions.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `a` `m` `j` `k` `q` `t` `e` `d` `w` `l` stay put. Row 8 is `#..w..h...x.l..#` (`w` col 3, `h` col 6, floor col 8, `x` col 10, `l` col 12). `data-slice="11"`. Fail-path copy appears on the agent cards via `shopFeedback` (`agent-feedback` / `agent-stop-reason`). Tool names and slot-id fragments use `direction: ltr` / class `path-ltr`. Persistable GameState strings do not contain `harness`. Overlay console is `data-testid="agent-console"`.

Console errors observed in those viewport tests: **none**.

The runner is a paper overlay, not a quiz, not a live model, and not a real tool host. After 5.1+5.2 the HUD objective is نُفّذت مهمة محدودة تحت المشغّل; the robot still invents «الدردشة وحدها وكالة» or «المشغّل اختياري». No MCP, certificate, or live HTTP / `fetch`. Typed player text is never `eval`'d. Evidence union adds only `5.1` and `5.2`.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 12 civic connector / MCP (out of slice)
