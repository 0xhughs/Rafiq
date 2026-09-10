# T04 browser checks — slice 12

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5304` and **preview** `http://127.0.0.1:4304` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL`. Port 5173 was occupied by another checkout; preview 4173 was also occupied. Preview runs used `env -u BASE_URL PREVIEW_PORT=4304` so `playwright.config.ts` started `vite preview` on 4304. Dev runs started a fresh Vite on 5304 and set `BASE_URL=http://127.0.0.1:5304` (webServer disabled; no reuse of 5173).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (51 tests each run):

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
- `e2e/lab.spec.ts` — kiosk-success through lab success with physical actions. After 4.5+4.6+5.4, **5.1 / 5.2 stay unawarded** and `agentReady` stays false. Helper `playToLabDone` encodes that path. HUD after lab success is `OBJECTIVES.agentWork`. Manager thanks still match `/النسخة المجمّدة|الإنتاج/`. `data-slice="12"`.
- `e2e/lab-retry.spec.ts` — guess-fix without log → fail 4.5 then select `production.error` and patch `production/kiosk.js`; decoy file/log → fail then correct selection; publish without repair → production still 404 then repair + publish v2 + verify; repair without publish → production still v1 then publish + verify; `format-disk` refused with files intact then `ls`/`cat` for 5.4.
- `e2e/agent.spec.ts` — lab-success through bounded job success with physical actions. After 5.1+5.2, **5.3 stays unawarded** and `bridgeReady` stays false. Helper `playToAgentDone` encodes that path. HUD after agent success is `OBJECTIVES.bridgeWork`. Manager thanks still match `/لوحة الحي تعرض الفترات الثلاث/`. Companion still matches `/الدردشة وحدها وكالة|المشغّل اختياري/`. `agent.spec.ts` `body` ↛ `MCP` on the agent-success path (connector overlay not open). `data-slice="12"`.
- `e2e/agent-retry.spec.ts` — chat-plan → fail 5.1 then run tools + inspect board; wrong goal/tools/success → fail then correct fields; budget_1 → stop after observe (`تجاوز حد الخطوات (١)`) board empty then set budget 3; missing-input job → stop then load slots job; unlimited extra → pollute (`المشغّل لم يتوقف عند الحد`) then budget 3 + restore three slots + extra-step stops; inspect-only / robot «تم» → no award then complete actions.
- `e2e/bridge.spec.ts` — agent-success through civic-connector success with physical actions. Screenshots in `evidence/12/`: `interior.png` (ورشة الإصلاح after `agentReady`; منصة الموصل `f` and متصفح السجل `v` on row 8 with `w` `h` `x` `l` still in place), `connect.png` (اربط الخادم shows LTR `rafiq-host` / `civic-client` / `civic-hours.rafiq` and `bridge-mcp-note` teaching MCP as a simulated bridge), `tools.png` (اعرض الأدوات lists LTR `lookup_hours` / `save_draft` / `rewrite_registry`), `grant.png` (limited grant: lookup+draft+week on; rewrite+payroll off), `lookup.png` (ابحث في NH-1447 returns sat-10 / sun-16 / wed-18 with `direction: ltr`), `draft.png` (`bridge-draft-text` is `مسودة إعلان القاعة: sat-10، sun-16، wed-18`; 5.3), `browser.png` (`bridge-browser` paper page `سجل ساعات قاعة الحي` at `civic-hours.rafiq/hours`; حفظ من المتصفح fails `المتصفح يعرض الصفحة. الحفظ يتم بأداة save_draft عبر الموصل.`), `denied.png` (استدع rewrite_registry fails `مرفوض: الأداة rewrite_registry غير مسموحة في الموصل.`; draft unchanged), `success.png` (manager thanks that the hall-hours draft was saved from NH-1447 through a limited connector and the disallowed tool was refused; HUD chip `civic-connector` «موصل السجل»; planning-core stays; robot invents `MCP مهارة تُحمَّل` / `الربط يفتح كل الأدوات`). Overlay bounds at 1366 (host card) and 1920 (browser card): `overlays.png` is the 1920 civic-browser overlay.
- `e2e/bridge-retry.spec.ts` — connect-only / list-only → no 5.3 then grant + lookup + save; grant-all → `MCP يربط قدرات محدودة ولا يمنح سلطة شاملة.` then limited grant; payroll lookup → fail then `NH-1447`; save-without-lookup → fail then lookup + save; browser-save → fail then `save_draft` on host; rewrite / pay_fees → denied/missing then continue; load-as-skill / robot تم / inspect-only → no award then complete actions.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` stay put. Row 8 is `#..w.fh..vx.l..#` (`w` col 3, `f` col 5, `h` col 6, floor col 8, `v` col 9, `x` col 10, `l` col 12). `data-slice="12"`. Fail-path copy appears on the host/browser cards via `shopFeedback` (`bridge-feedback`). Server/tool/resource/record/hour/`MCP` fragments use `direction: ltr` / class `path-ltr`. Persistable GameState strings, journal text, and HUD objectives use Arabic **الموصل** and do not contain English `MCP`. Overlay after connect (`bridge-mcp-note`) and skippable explain **do** contain `MCP`. Overlay host is `data-testid="bridge-host"`; browser is `data-testid="bridge-browser"`. `JOURNAL_CAP === 72`. No `fetch(` in `app/src/engine/bridge.ts`.

Console errors observed in those viewport tests: **none**.

The connector is a paper overlay, not a quiz, not a live protocol, and not a real MCP SDK. After 5.3 + MCP-complete + browser-save refusal the HUD objective is حُفظت مسودة من سجل الحي عبر موصل محدود; the robot still invents «MCP مهارة تُحمَّل» or «الربط يفتح كل الأدوات». Typed player text is never `eval`'d. Evidence union adds only `5.3` (MCP is the named connector, not a curriculum id).

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 13 skills/routines (out of slice)
