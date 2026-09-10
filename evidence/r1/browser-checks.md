# T04 browser checks — slice R1

Recorded 2026-09-10 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:4601` and **preview** `http://127.0.0.1:4600` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL` (other agents occupy 5173/4173/4500). Ports 5173, 4173, and 4500 were treated as busy. Preview runs used `unset BASE_URL` and `PREVIEW_PORT=4600` so `playwright.config.ts` started `vite preview` on 4600 (`reuseExistingServer: false`). Dev runs started a fresh Vite on 4601 and set `BASE_URL=http://127.0.0.1:4601` (webServer disabled).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (**70 passed** each run; preview 7.8m, Vite 8.0m):

- `e2e/journey.spec.ts` — slice 01 opening still works; after help accepted `slice-checkpoint` is `CHECKPOINT_AFTER_HELP` and ↛ `/قيد التطوير/`; HUD is `OBJECTIVES.cornerStore`.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة. Shop-enter after `help_accepted` and neighbor postpone remain passing; they are not this slice’s unfinished-puzzle AC.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` / `e2e/shop-retry.spec.ts` — shop success and date-price retry.
- `e2e/parcel.spec.ts` / `e2e/parcel-retry.spec.ts` — parcel success and ambiguous/decoy retries.
- `e2e/archive.spec.ts` / `e2e/archive-retry.spec.ts` — archive success and pin/redact/pack retries.
- `e2e/newsroom.spec.ts` / `e2e/newsroom-retry.spec.ts` — newsroom success and consensus/cite retries.
- `e2e/festival.spec.ts` / `e2e/festival-retry.spec.ts` — festival success and invented-cups retries.
- `e2e/workshop.spec.ts` / `e2e/workshop-retry.spec.ts` — workshop success and extras retries.
- `e2e/kiosk.spec.ts` / `e2e/kiosk-retry.spec.ts` — kiosk success. `waitForGame` requires `data-slice="17"`.
- `e2e/lab.spec.ts` / `e2e/lab-retry.spec.ts` — lab success. HUD after lab is `OBJECTIVES.agentWork`. `data-slice="17"`.
- `e2e/agent.spec.ts` / `e2e/agent-retry.spec.ts` — bounded job. Agent-success `body` ↛ `MCP`. `data-slice="17"`.
- `e2e/bridge.spec.ts` / `e2e/bridge-retry.spec.ts` — civic connector. Manager `/مسودة ساعات قاعة الحي حُفظت من NH-1447/`. Companion `/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/` while `!skillReady`. Overlay after connect still contains `MCP`. `data-slice="17"`.
- `e2e/skill.spec.ts` / `e2e/skill-retry.spec.ts` — reusable skill and routine clock. HUD after skill is `OBJECTIVES.approvalWork`. `data-slice="17"`.
- `e2e/approve.spec.ts` / `e2e/approve-retry.spec.ts` — human send + clinic. HUD after approval is `OBJECTIVES.crewWork`. Helper `playToApprovalDone` does **not** award 6.1/6.2/`crewReady`. `data-slice="17"`.
- `e2e/crew.spec.ts` / `e2e/crew-retry.spec.ts` — roles + quality. HUD after crew success is `OBJECTIVES.pathWork`. Manager still matches `/عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/` while `!restored`. Companion still matches `/أغلبية الطاقم تقرر الحقيقة|معيار فاشل يُقبل/` while `!restored`. Helper `playToCrewDone` completes 15 and asserts `pathQuest.restored === false`. `data-slice="17"`.
- `e2e/path.spec.ts` — crew-success through reading-night path and seal via `playToCrewDone`. After 16 close: HUD `OBJECTIVES.restored`, `endingState === 'in_progress'`, `JSON.stringify` ↛ `/شهادة/`, `certificate` count 0. First robot talk still matches `/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/` and does not mount `certificate`. Manager still matches `/سُهرة القراءة نُشرت بعد سند NH-3301 وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية، والروبوت صار جاهزاً تحت إشراف/`. Helper `playToPathDone` completes 16 and asserts all 34 evidence ids, `endingState === 'in_progress'`, `issued === false`, no overlay, no download. `data-slice="17"`.
- `e2e/path-retry.spec.ts` — trust-rumor / wrong plan / mango/clinic / old skill / exam / silent edit all retry.
- `e2e/passport.spec.ts` — `playToPathDone` → first robot thanks (no `certificate`) → second talk opens `data-testid="certificate"` (no download) → confirm name → PNG `rafiq-passport.png` + PDF `rafiq-passport.pdf` (filenames have no player name).
- `e2e/passport-retry.spec.ts` — second talk before restored → no overlay then finish 16 + thanks + second talk; missing-id fixture → ineligible then eligible open; download-before-confirm; exam/percent/verify/registry/legacy/network/تم → no issue; `certificate-fail` then retry PNG; close overlay before download → `invited` then reopen; replay download after issued still works.
- `e2e/resume-r1.spec.ts` — leftover checkpoint copy; unfinished منصة المسار after `playToCrewDone` (inspect source + refuse rumor + reading-goal only) save/reload/reopen with hydrate `data-mode="playing"` then `completePathQuest` awards 6.4 once and no certificate; issued ending save/reload with overlay reopenable, `passport_issued` length 1, filenames `rafiq-passport.png` / `rafiq-passport.pdf`. Screenshots in `evidence/r1/`: `checkpoint.png`, `unfinished.png`, `resume-puzzle.png`, `overlays.png` (path-desk at 1920 after inspect/refuse/reading-goal; `path-source` NH-3301 / thu-19 in `.path-ltr` `direction: ltr`), `issued-reload.png` (HUD and `slice-checkpoint` are `OBJECTIVES.passportIssued`; HUD button `الجواز`). Path-desk and certificate cards stayed inside 1366×768 and 1920×1080. Version/record/hour digits use `direction: ltr`.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` `f` `v` `J` `Z` `O` `V` `1` `2` `3` `4` stay put. Row 8 is `#O1wJfhZ.vx3l2V#` (`3` col 11, floor col 8). Row 6 is `#k.q......t4...#` (`4` col 11, floor col 8). Door `d` remains col 8. No new map, portal, civic-lab, or workshop desk. `data-slice="17"`. `JOURNAL_CAP === 112`. `EVIDENCE_IDS.length === 34`. Hydrate stays `mode: 'playing'` (overlay mode is not persisted). Persistable GameState strings, journal text, and HUD objectives do not contain English `MCP` or `harness` or persistable `شهادة`. After 12 connect, host overlay / skippable explain **do** still contain `MCP`. Path exam/quiz/«تم» stay fail-only. Passport exam/percent/registry/verify/legacy/network/«تم» stay fail-only. No `fetch(` / `Date.now()` / `setInterval` awards in R1 edits. Download filenames remain `rafiq-passport.png` / `rafiq-passport.pdf` (no player name).

Console errors observed in those viewport tests: **none**.

R1 does not award a 35th evidence key and does not bump `JOURNAL_CAP`. The unfinished later-arc puzzle is منصة المسار, not shop-enter-after-help and not neighbor postpone.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 18 sequel map / next-campaign start, RG03 other browsers, RG04 five-beginner pilot (out of this repair)
