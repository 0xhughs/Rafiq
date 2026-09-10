# T04 browser checks — slice 15

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:4510` and **preview** `http://127.0.0.1:4410` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Ports 5173, 4173, and 4500 were treated as occupied. Preview runs used `unset BASE_URL` and `PREVIEW_PORT=4410` so `playwright.config.ts` started `vite preview` on 4410 (`reuseExistingServer: false`). Dev runs started a fresh Vite on 4510 and set `BASE_URL=http://127.0.0.1:4510` (webServer disabled).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (**60 passed** each run):

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
- `e2e/festival.spec.ts` — newsroom-success through festival success with physical actions. After 3.4+3.5, **4.1 and 4.2 stay unawarded** and `servicePosted` stays false.
- `e2e/festival-retry.spec.ts` — invented cups, robot total, missing stamp, and robot figures all retry.
- `e2e/workshop.spec.ts` — festival-success through workshop success with physical actions. After 4.1+4.2, **4.3 and 4.4 stay unawarded** and `kioskReady` stays false.
- `e2e/workshop-retry.spec.ts` — extra in brief → bloated board; missing screens; build without brief; inspect-only / robot «تم» do not award.
- `e2e/kiosk.spec.ts` — workshop-success through kiosk success. After 4.3+4.4, **4.5 / 4.6 / 5.4 stay unawarded** and `labReady` stays false. `data-slice="15"`.
- `e2e/kiosk-retry.spec.ts` — missing key / exposure / LTR lookup / skipped checklist retry.
- `e2e/lab.spec.ts` — kiosk-success through lab success. After 4.5+4.6+5.4, **5.1 / 5.2 stay unawarded** and `agentReady` stays false. HUD after lab success is `OBJECTIVES.agentWork`. `data-slice="15"`.
- `e2e/lab-retry.spec.ts` — guess-fix, decoy, publish-without-repair, repair-without-publish, and refuse all retry.
- `e2e/agent.spec.ts` — lab-success through bounded job success. After 5.1+5.2, **5.3 stays unawarded** and `bridgeReady` stays false. `agent.spec.ts` `body` ↛ `MCP` on the agent-success path. `data-slice="15"`.
- `e2e/agent-retry.spec.ts` — chat-plan, wrong config, budget_1, unlimited extra, and robot تم all retry.
- `e2e/bridge.spec.ts` — agent-success through civic-connector success. After 5.3, **5.5 / 5.6 stay unawarded** and `skillReady` stays false. Manager thanks still match `/مسودة ساعات قاعة الحي حُفظت من NH-1447/`. Companion still matches `/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/` while `!skillReady`. Overlay after connect still contains `MCP`. `data-slice="15"`.
- `e2e/bridge-retry.spec.ts` — connect-only, wrong grant, payroll, save-without-lookup, browser-save, and robot تم all retry.
- `e2e/skill.spec.ts` — bridge-success through reusable-skill and routine-clock via `playToBridgeDone`. After 5.5+5.6, **5.7 / 6.3 stay unawarded** and `approvalReady` stays false. HUD after skill success is `OBJECTIVES.approvalWork`. Manager thanks still match `/حُفظت مهارة تلخيص ساعات القاعة وجُرّبت على NH-2208، والروتين المجدول توقف بعد الإلبات/` while `!approvalReady`. Companion still matches `/الدستور الدائم مهارة|الروتين المتوقف ما زال يعمل/` while `!approvalReady`. `data-slice="15"`.
- `e2e/skill-retry.spec.ts` — oneshot, wrong fields, standing, schedules, empty tick, cancel, and pause all retry.
- `e2e/approve.spec.ts` — skill-success through human send approval and personal clinic decision via `playToSkillDone`. After 5.7+6.3, **6.1 / 6.2 stay unawarded** and `crewReady` stays false. HUD after approval success is `OBJECTIVES.crewWork` (no longer the terminal `OBJECTIVES.approvalReady`). Manager thanks still match `/رُفض إرسال خاطئ ثم وُوفق على نشرة القاعة إلى أمينة القاعة، وقرار عيادة ليان بقي عند إنسان/` while `!crewReady` (plus pointing sentence ` منصة الطاقم ومنضدة الجودة في الورشة تنتظران تنسيق الأدوار ومراجعة الناتج.`). Companion still matches `/الموافقة الآلية تكفي|أغلبية الجيران تقرر/` while `!crewReady`. HUD chips planning-core, civic-connector, skill-shelf, and human-gate stay; `crew-output` is absent until 15 ready. `data-slice="15"`. Helper `playToApprovalDone` encodes the 14 happy path and asserts those predicates.
- `e2e/approve-retry.spec.ts` — wrong send, silent edit, delete/pay/تم, and clinic auto paths all retry. Completing 5.7 does not award 6.3; completing 6.3 after 5.7 sets `approvalReady` without awarding 6.1/6.2.
- `e2e/crew.spec.ts` — approval-success through crew roles and quality review via `playToApprovalDone`. Screenshots in `evidence/15/`: `interior.png` (ورشة الإصلاح after `approvalReady`; منصة الطاقم `1` col 2 and منضدة الجودة `2` col 13 on row 8 `#O1wJfhZ.vx.l2V#` with `O` `w` `J` `f` `h` `Z` `v` `x` `l` `V` still in place, col 8 and col 11 floor; HUD `OBJECTIVES.crewWork`; `crew-output` absent), `roles.png` (`crew-desk`; عيّن الباحث والبنّاء والمراجع writes `الباحث` / `البنّاء` / `المراجع`; `لا نسخة مشتركة` until handoff; overlay copy does not contain `MCP` / `harness`), `conflict.png` (أمينة القاعة مالكة الناتج + اعرض تسليم الأدوار writes `تسليم: الباحث يأتي بالسند…` and `النسخة المشتركة: v1 — مسودتان متعارضتان`; evidence draft `نشرة القاعة: sat-10، sun-16، wed-18. لا تعليق.` plus `سند: NH-1447`; conflicting draft includes `thu-09` and `سند: أغلبية الطاقم`; hour/record fragments `direction: ltr`), `version.png` (اقرأ سند NH-1447 then ارفض majority then اعتمد مسودة الباحث المسنودة writes `النسخة المشتركة: v2 — نشرة القاعة: sat-10، sun-16، wed-18. لا تعليق.` without `thu-09`; 6.2; 6.1 still unawarded; 14 `approve-receipt` / `bulletinSent` unchanged), `criteria.png` (`crew-quality` at a **different** desk `2`; اعرض معايير الجودة writes flawed notice with `thu-09` and `الدقة: فشل`; other four `نجح`; criteria-only does not award 6.1), `repair.png` (أصلح معيار الدقة removes `thu-09`, sets `الدقة: نجح`, rewrites the hall notice without `thu-09`; repair-only does not award), `success.png` (اقبل الناتج writes `قُبلت نشرة القاعة: sat-10، sun-16، wed-18. لا تعليق.`; 6.1+6.2 + `crewReady`; manager `عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة`; HUD chip `crew-output` «ناتج مُراجع»; planning-core, civic-connector, skill-shelf, and human-gate stay; HUD `OBJECTIVES.crewReady`; robot invents `أغلبية الطاقم تقرر الحقيقة` / `معيار فاشل يُقبل`). Overlay bounds at 1366 (roles card) and 1920 (quality card): `overlays.png` is the 1920 quality overlay.
- `e2e/crew-retry.spec.ts` — merge-roles / majority-owner / robot-owner → no 6.2 then distinct roles + أمينة القاعة + handoff; majority-as-truth / pick-conflict / pick-without-inspect → fail then inspect + refuse majority + evidence `v2`; accept-without-repair / criteria-only / tone-repair / quality-majority / تم → no 6.1 then repair accuracy + accept; resend on either desk → no new send (`SEND_RECEIPT` unchanged) then complete via the real desks; 6.2-only → no `crewReady` then complete 6.1.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` `f` `v` `J` `Z` `O` `V` stay put. Row 8 is `#O1wJfhZ.vx.l2V#` (`O` col 1, `1` col 2, `w` col 3, `J` col 4, `f` col 5, `h` col 6, `Z` col 7, floor col 8, `v` col 9, `x` col 10, floor col 11, `l` col 12, `2` col 13, `V` col 14). Door `d` remains col 8. `data-slice="15"`. Fail-path copy appears on the roles/quality cards via `shopFeedback` (`crew-feedback`). Record/hour/version fragments use `direction: ltr` / class `path-ltr`. Persistable GameState strings, journal text, and HUD objectives use Arabic **الطاقم** / **الأدوار** / **الناتج** / **المعايير** / **الجودة** / **الموافقة** / **القرار** and do not contain English `MCP` or `harness`. Crew overlay copy does not call MCP a skill or a harness. After 12 connect, host overlay / skippable explain **do** still contain `MCP`. Overlay roles is `data-testid="crew-desk"`; quality is `data-testid="crew-quality"`. `JOURNAL_CAP === 96`. No `fetch(` / `Date.now()` / `setInterval` / `eval(` in `app/src/engine/crew.ts`. Crew is never `TOGGLE_PAUSE` / mode `'paused'`. 15 acceptance is a hall-notice card, not a second HTTP send.

Console errors observed in those viewport tests: **none**.

The crew desks are paper overlays, not a quiz, not a live HTTP client, and not a real MCP SDK. After 6.1 + 6.2 the HUD objective is نُسّق طاقم الناتج وقُبلت نشرة القاعة بعد إصلاح معيار فاشل; the robot still invents «أغلبية الطاقم تقرر الحقيقة» or «معيار فاشل يُقبل». Typed player text is never `eval`'d. Evidence union adds only `6.1` and `6.2`. Approval success must not award those ids or set `crewReady`. Opening `1`/`2` does not itself award. Completing the roles desk does not award 6.1; completing quality does not award 6.2.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 16 capstone, 17 certificate, 18 live HTTP / real MCP SDK (out of slice)
