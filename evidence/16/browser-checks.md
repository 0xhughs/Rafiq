# T04 browser checks — slice 16

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:4730` and **preview** `http://127.0.0.1:4710` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL` (the shell had `BASE_URL=http://127.0.0.1:4632` from another process). Ports 5173, 4173, and 4500 were occupied. Preview runs used `unset BASE_URL` and `PREVIEW_PORT=4710` so `playwright.config.ts` started `vite preview` on 4710 (`reuseExistingServer: false`). Dev runs started a fresh Vite on 4730 and set `BASE_URL=http://127.0.0.1:4730` (webServer disabled).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (**63 passed** each run; preview 6.4m, Vite 6.5m):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` / `e2e/shop-retry.spec.ts` — shop success and date-price retry.
- `e2e/parcel.spec.ts` / `e2e/parcel-retry.spec.ts` — parcel success and ambiguous/decoy retries.
- `e2e/archive.spec.ts` / `e2e/archive-retry.spec.ts` — archive success and pin/redact/pack retries.
- `e2e/newsroom.spec.ts` / `e2e/newsroom-retry.spec.ts` — newsroom success and consensus/cite retries.
- `e2e/festival.spec.ts` / `e2e/festival-retry.spec.ts` — festival success and invented-cups retries.
- `e2e/workshop.spec.ts` / `e2e/workshop-retry.spec.ts` — workshop success and extras retries.
- `e2e/kiosk.spec.ts` / `e2e/kiosk-retry.spec.ts` — kiosk success. `waitForGame` requires `data-slice="16"`.
- `e2e/lab.spec.ts` / `e2e/lab-retry.spec.ts` — lab success. HUD after lab is `OBJECTIVES.agentWork`. `data-slice="16"`.
- `e2e/agent.spec.ts` / `e2e/agent-retry.spec.ts` — bounded job. Agent-success `body` ↛ `MCP`. `data-slice="16"`.
- `e2e/bridge.spec.ts` / `e2e/bridge-retry.spec.ts` — civic connector. Manager `/مسودة ساعات قاعة الحي حُفظت من NH-1447/`. Companion `/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/` while `!skillReady`. Overlay after connect still contains `MCP`. `data-slice="16"`.
- `e2e/skill.spec.ts` / `e2e/skill-retry.spec.ts` — reusable skill and routine clock. HUD after skill is `OBJECTIVES.approvalWork`. `data-slice="16"`.
- `e2e/approve.spec.ts` / `e2e/approve-retry.spec.ts` — human send + clinic. HUD after approval is `OBJECTIVES.crewWork`. Helper `playToApprovalDone` does **not** award 6.1/6.2/`crewReady`. `data-slice="16"`.
- `e2e/crew.spec.ts` / `e2e/crew-retry.spec.ts` — roles + quality. HUD after crew success is `OBJECTIVES.pathWork` (no longer terminal `OBJECTIVES.crewReady`). Manager still matches `/عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/` while `!restored`. Companion still matches `/أغلبية الطاقم تقرر الحقيقة|معيار فاشل يُقبل/` while `!restored`. Helper `playToCrewDone` completes 15 and asserts `6.4` undefined and `pathQuest.restored === false`. `data-slice="16"`.
- `e2e/path.spec.ts` — crew-success through reading-night path and seal via `playToCrewDone`. Screenshots in `evidence/16/`: `interior.png` (ورشة الإصلاح after `crewReady`; منصة المسار `3` col 11 row 8 `#O1wJfhZ.vx3l2V#` and منصة الختم `4` col 11 row 6 `#k.q......t4...#`; HUD `OBJECTIVES.pathWork`; `restored-agent` absent), `source.png` (`path-desk`; اقرأ سند NH-3301 writes `سند NH-3301: سهرة القراءة: thu-19. باب القاعة فقط. لا بث.`; `fri-20` rumor; hour/record fragments `direction: ltr`), `plan.png` (هدف نشر سهرة القراءة + أدوات آمنة + توقف ثلاث خطوات writes `خطة محدودة: نشر سهرة القراءة بأدوات القراءة والكتابة والتحقق، تتوقف عند ثلاث خطوات أو نقص.`), `skill.png` (حزمة السهرة + مهارة NH-3301 + خطوة إضافية; `مسودة السهرة` has `thu-19` not `fri-20`; extra stop does not change draft; 6.4 still unawarded), `seal.png` (`path-seal` at a **different** desk `4`; جهّز إرسال السهرة fills كل الجيران; inspect shows المستلم/الحمولة with `thu-19` LTR; prepare does not send), `success.png` (reject wrong → أمينة القاعة + exact → re-review → approve writes `إيصال السهرة: إلى أمينة القاعة — سهرة القراءة: thu-19. باب القاعة فقط. لا بث.`; 6.4 + `restored`; 14 `approve-receipt` / `bulletinSent` / `SEND_RECEIPT` unchanged), `restored.png` (manager `سُهرة القراءة نُشرت بعد سند NH-3301 وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية، والروبوت صار جاهزاً تحت إشراف`; HUD chip `restored-agent` «وكيل مُشرف»; planning-core, civic-connector, skill-shelf, human-gate, and crew-output stay; HUD `OBJECTIVES.restored`; robot thanks with player name and invents `الترميم يلغي الهلوسة`). Overlay bounds at 1366 (prep card) and 1920 (seal card): `overlays.png` is the 1920 seal overlay. No `data-testid="certificate"`.
- `e2e/path-retry.spec.ts` — trust-rumor / refuse-before-inspect → no 6.4 then inspect + refuse rumor; live-goal / pay-tools / unlimited-stop → fail then reading-goal + safe-tools + budget-stop; mango/clinic → fail then load-reading; run-old / run-chat / extra-before-skill → fail then run `NH-3301` + extra stop; exam/quiz / تم → no award then complete the real desks; prepare-before-prep → fail then finish prep; neighbors/payroll/stream / confirm-without-inspect / silent edit → fail then reject-wrong + librarian + exact + re-review + confirm; resend-old → no change to 14 receipt then complete via الختم; prep-only → no `restored` then complete seal.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` `f` `v` `J` `Z` `O` `V` `1` `2` stay put. Row 8 is `#O1wJfhZ.vx3l2V#` (`O` col 1, `1` col 2, `w` col 3, `J` col 4, `f` col 5, `h` col 6, `Z` col 7, floor col 8, `v` col 9, `x` col 10, `3` col 11, `l` col 12, `2` col 13, `V` col 14). Row 6 is `#k.q......t4...#` (`k` col 1, `q` col 3, floor col 8, `t` col 10, `4` col 11). Door `d` remains col 8. `data-slice="16"`. Fail-path copy appears on the path/seal cards via `shopFeedback` (`path-feedback`). Record/hour fragments use `direction: ltr` / class `path-ltr`. Persistable GameState strings, journal text, and HUD objectives use Arabic **المسار** / **الختم** / **السهرة** / **السند** / **الخطة** / **الحزمة** / **المهارة** / **الموافقة** / **الترميم** and do not contain English `MCP` or `harness`. Path overlay copy does not call MCP a skill or a harness. After 12 connect, host overlay / skippable explain **do** still contain `MCP`. Overlay prep is `data-testid="path-desk"`; seal is `data-testid="path-seal"`. `JOURNAL_CAP === 104`. No `fetch(` / `Date.now()` / `setInterval` / `eval(` in `app/src/engine/path.ts`. Path is never `TOGGLE_PAUSE` / mode `'paused'`. 16 is a new reading-night notice, not a 14 re-send.

Console errors observed in those viewport tests: **none**.

The path and seal desks are paper overlays, not a quiz, not a live HTTP client, and not a real MCP SDK. After 6.4 the HUD objective is أُنجزت سهرة القراءة تحت إشراف، والروبوت صار جاهزاً للعمل في الحي. مدير الورشة شكرك; the robot still invents «الترميم يلغي الهلوسة». Typed player text is never `eval`'d. Evidence union adds only `6.4`. Crew success must not award that id or set `restored`. Opening `3`/`4` does not itself award. Completing prep does not award 6.4; completing seal without the wrong-reject + re-review does not award.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 17 certificate PNG/PDF / passport download, 18 live HTTP / real MCP SDK (out of slice)
