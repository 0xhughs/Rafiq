# T04 browser checks — slice 14

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:4417` and **preview** `http://127.0.0.1:4416` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Ports 5173–5183, 4173–4174, and other listed ranges were treated as occupied. Preview runs used `unset BASE_URL` and `PREVIEW_PORT=4416` so `playwright.config.ts` started `vite preview` on 4416 (`reuseExistingServer: false`). Dev runs started a fresh Vite on 4417 and set `BASE_URL=http://127.0.0.1:4417` (webServer disabled).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (**57 passed** each run):

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
- `e2e/lab.spec.ts` — kiosk-success through lab success with physical actions. After 4.5+4.6+5.4, **5.1 / 5.2 stay unawarded** and `agentReady` stays false. Helper `playToLabDone` encodes that path. HUD after lab success is `OBJECTIVES.agentWork`. Manager thanks still match `/النسخة المجمّدة|الإنتاج/`. `data-slice="14"`.
- `e2e/lab-retry.spec.ts` — guess-fix without log → fail 4.5 then select `production.error` and patch `production/kiosk.js`; decoy file/log → fail then correct selection; publish without repair → production still 404 then repair + publish v2 + verify; repair without publish → production still v1 then publish + verify; `format-disk` refused with files intact then `ls`/`cat` for 5.4.
- `e2e/agent.spec.ts` — lab-success through bounded job success with physical actions. After 5.1+5.2, **5.3 stays unawarded** and `bridgeReady` stays false. Helper `playToAgentDone` encodes that path. HUD after agent success is `OBJECTIVES.bridgeWork`. Manager thanks still match `/لوحة الحي تعرض الفترات الثلاث/`. Companion still matches `/الدردشة وحدها وكالة|المشغّل اختياري/`. `agent.spec.ts` `body` ↛ `MCP` on the agent-success path (connector overlay not open). `data-slice="14"`.
- `e2e/agent-retry.spec.ts` — chat-plan → fail 5.1 then run tools + inspect board; wrong goal/tools/success → fail then correct fields; budget_1 → stop after observe (`تجاوز حد الخطوات (١)`) board empty then set budget 3; missing-input job → stop then load slots job; unlimited extra → pollute (`المشغّل لم يتوقف عند الحد`) then budget 3 + restore three slots + extra-step stops; inspect-only / robot «تم» → no award then complete actions.
- `e2e/bridge.spec.ts` — agent-success through civic-connector success with physical actions. After 5.3, **5.5 / 5.6 stay unawarded** and `skillReady` stays false. Helper `playToBridgeDone` encodes that path. HUD after bridge success is `OBJECTIVES.skillWork`. Manager thanks still match `/مسودة ساعات قاعة الحي حُفظت من NH-1447/`. Companion still matches `/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/` while `!skillReady`. HUD chips `planning-core` and `civic-connector` stay; `skill-shelf` is absent until skill success. Overlay after connect (`bridge-mcp-note`) still contains `MCP`. `data-slice="14"`.
- `e2e/bridge-retry.spec.ts` — connect-only / list-only → no 5.3 then grant + lookup + save; grant-all → limited grant; payroll lookup → fail then `NH-1447`; save-without-lookup → fail then lookup + save; browser-save → fail then `save_draft` on host; rewrite / pay_fees → denied/missing then continue; load-as-skill / robot تم / inspect-only → no award then complete actions.
- `e2e/skill.spec.ts` — bridge-success through reusable-skill and routine-clock success via `playToBridgeDone`. After 5.5+5.6, **5.7 / 6.3 stay unawarded** and `approvalReady` stays false. HUD after skill success is `OBJECTIVES.approvalWork` (no longer the terminal `OBJECTIVES.skillReady`). Manager thanks still match `/حُفظت مهارة تلخيص ساعات القاعة وجُرّبت على NH-2208، والروتين المجدول توقف بعد الإلبات/` while `!approvalReady`. Companion still matches `/الدستور الدائم مهارة|الروتين المتوقف ما زال يعمل/` while `!approvalReady`. HUD chips `planning-core`, `civic-connector`, and `skill-shelf` stay; `human-gate` is absent until 14 ready. `data-slice="14"`.
- `e2e/skill-retry.spec.ts` — one-shot invent → no 5.5 then correct; save-before-correct / missing config / wrong trigger/input/steps/output/stop → fail then correct five fields; standing-as-skill / connector-as-skill / secret-embed / same-record trial → no award then NH-2208; arm-before-skill / event/send schedule / empty-source tick → fail then sun-8; cancel-without-fire → no 5.6 then re-arm + fire; fire-without-pause → no 5.6 then pause + silent tick; inspect-only / robot تم → no award then complete actions.
- `e2e/approve.spec.ts` — skill-success through human send approval and personal clinic decision via `playToSkillDone`. Screenshots in `evidence/14/`: `interior.png` (ورشة الإصلاح after `skillReady`; منصة الموافقة `O` col 1 and مكتب القرار `V` col 14 on row 8 `#O.wJfhZ.vx.l.V#` with `w` `J` `f` `h` `Z` `v` `x` `l` still in place and col 8 floor; HUD `OBJECTIVES.approvalWork`; `human-gate` absent), `prepare.png` (`approve-desk`; جهّز إرسال النشرة fills recipient **كل الجيران** and exact Sunday bulletin; `approve-receipt` absent; source tray on ساعة الحي remains `مسودة الأحد في الدرج: نشرة القاعة: sat-10، sun-16، wed-18. لا تعليق.`; overlay copy does not contain `MCP` / `harness`), `reject.png` (راجع then ارفض هذا الإرسال on كل الجيران writes `رُفض الإرسال الخاطئ. عدّل المستلم والحمولة ثم راجع من جديد.`; no receipt; 5.7 unawarded), `receipt.png` (أمينة القاعة + exact payload after edit requires re-review; then `إيصال الإرسال: إلى أمينة القاعة — نشرة القاعة: sat-10، sun-16، wed-18. لا تعليق.` with hour ids `direction: ltr`; 5.7; 6.3 still unawarded), `case.png` (`approve-case` at a **different** desk `V`; اعرض سياق القرار writes CL-19 context + wait line `الروبوت جهّز السياق وينتظر. لم يقرر.`; context-only does not award 6.3), `decide.png` (دع الروبوت يقرر and صوّت الجيران بالأغلبية refuse; لا تُشارك ملاحظة العيادة writes `بقيت ملاحظة العيادة عند نورة. الروبوت لم يقرر.`; 6.3 + `approvalReady`), `success.png` (manager `رُفض إرسال خاطئ ثم وُوفق على نشرة القاعة إلى أمينة القاعة، وقرار عيادة ليان بقي عند إنسان`; HUD chip `human-gate` «موافقة بشرية»; planning-core, civic-connector, and skill-shelf stay; HUD `OBJECTIVES.approvalReady`; robot invents `الموافقة الآلية تكفي` / `أغلبية الجيران تقرر عيادة الطفل`). Overlay bounds at 1366 (send card) and 1920 (case card): `overlays.png` is the 1920 personal-case overlay.
- `e2e/approve-retry.spec.ts` — prepare send-to-all → no 5.7 then inspect + reject + librarian + exact + re-review + approve; approve-without-inspect / wrong recipient / extra hour / payroll / commentary → fail then correct path; edit after inspect → no silent send then re-review + approve; delete/pay / robot تم → no award then complete 5.7; auto-decide / majority / تم / share → no 6.3 then refuse auto+majority + keep-private; context-only / keep-without-refusals → no award then complete actions. Completing 5.7 does not award 6.3; completing 6.3 after 5.7 sets `approvalReady`.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` `f` `v` `J` `Z` stay put. Row 8 is `#O.wJfhZ.vx.l.V#` (`O` col 1, `w` col 3, `J` col 4, `f` col 5, `h` col 6, `Z` col 7, floor col 8, `v` col 9, `x` col 10, `l` col 12, `V` col 14). Door `d` remains col 8. `data-slice="14"`. Fail-path copy appears on the send/case cards via `shopFeedback` (`approve-feedback`). Record/hour/note fragments use `direction: ltr` / class `path-ltr`. Persistable GameState strings, journal text, and HUD objectives use Arabic **الموافقة** / **القرار** / **الإرسال** / **المهارة** / **الروتين** and do not contain English `MCP` or `harness`. Approval overlay copy does not call MCP a skill or a harness. After 12 connect, host overlay / skippable explain **do** still contain `MCP`. Overlay send is `data-testid="approve-desk"`; personal is `data-testid="approve-case"`. `JOURNAL_CAP === 88`. No `fetch(` / `Date.now()` / `setInterval` / `eval(` in `app/src/engine/approval.ts`. Approval is never `TOGGLE_PAUSE` / mode `'paused'`. Send is an in-game receipt, not HTTP.

Console errors observed in those viewport tests: **none**.

The send desk and personal case are paper overlays, not a quiz, not a live HTTP client, and not a real MCP SDK. After 5.7 + 6.3 the HUD objective is وُوفق على إرسال النشرة المصحح، وبقي قرار العيادة عند إنسان; the robot still invents «الموافقة الآلية تكفي» or «أغلبية الجيران تقرر عيادة الطفل». Typed player text is never `eval`'d. Evidence union adds only `5.7` and `6.3`. Skill success must not award those ids or set `approvalReady`. Opening `O`/`V` does not itself award. Completing the bulletin send does not award 6.3; completing the clinic case does not award 5.7.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 15 multi-agent, 16 capstone, 17 certificate, 18 live HTTP / real MCP SDK (out of slice)
