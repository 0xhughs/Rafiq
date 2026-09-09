# T04 browser checks — slice 17

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:4831` and **preview** `http://127.0.0.1:4830` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL` (other agents occupy 5173/4173/4500/4730 and nearby ports). Ports 5173, 4173, 4500, 4710, 4730, 4816, and 4817 were treated as busy. Preview runs used `unset BASE_URL` and `PREVIEW_PORT=4830` so `playwright.config.ts` started `vite preview` on 4830 (`reuseExistingServer: false`). Dev runs started a fresh Vite on 4831 and set `BASE_URL=http://127.0.0.1:4831` (webServer disabled).

## Results

All of the following Playwright files passed on **both** the development server and the production preview (**67 passed** each run; preview 7.3m, Vite 7.4m):

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
- `e2e/kiosk.spec.ts` / `e2e/kiosk-retry.spec.ts` — kiosk success. `waitForGame` requires `data-slice="17"`.
- `e2e/lab.spec.ts` / `e2e/lab-retry.spec.ts` — lab success. HUD after lab is `OBJECTIVES.agentWork`. `data-slice="17"`.
- `e2e/agent.spec.ts` / `e2e/agent-retry.spec.ts` — bounded job. Agent-success `body` ↛ `MCP`. `data-slice="17"`.
- `e2e/bridge.spec.ts` / `e2e/bridge-retry.spec.ts` — civic connector. Manager `/مسودة ساعات قاعة الحي حُفظت من NH-1447/`. Companion `/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/` while `!skillReady`. Overlay after connect still contains `MCP`. `data-slice="17"`.
- `e2e/skill.spec.ts` / `e2e/skill-retry.spec.ts` — reusable skill and routine clock. HUD after skill is `OBJECTIVES.approvalWork`. `data-slice="17"`.
- `e2e/approve.spec.ts` / `e2e/approve-retry.spec.ts` — human send + clinic. HUD after approval is `OBJECTIVES.crewWork`. Helper `playToApprovalDone` does **not** award 6.1/6.2/`crewReady`. `data-slice="17"`.
- `e2e/crew.spec.ts` / `e2e/crew-retry.spec.ts` — roles + quality. HUD after crew success is `OBJECTIVES.pathWork`. Manager still matches `/عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/` while `!restored`. Companion still matches `/أغلبية الطاقم تقرر الحقيقة|معيار فاشل يُقبل/` while `!restored`. Helper `playToCrewDone` completes 15 and asserts `pathQuest.restored === false`. `data-slice="17"`.
- `e2e/path.spec.ts` — crew-success through reading-night path and seal via `playToCrewDone`. After 16 close: HUD `OBJECTIVES.restored`, `endingState === 'in_progress'`, `JSON.stringify` ↛ `/شهادة/`, `certificate` count 0. First robot talk still matches `/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/` and does not mount `certificate`. Manager still matches `/سُهرة القراءة نُشرت بعد سند NH-3301 وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية، والروبوت صار جاهزاً تحت إشراف/`. Helper `playToPathDone` completes 16 and asserts all 34 evidence ids, `endingState === 'in_progress'`, `issued === false`, no overlay, no download. `data-slice="17"`.
- `e2e/path-retry.spec.ts` — trust-rumor / wrong plan / mango/clinic / old skill / exam / silent edit all retry.
- `e2e/passport.spec.ts` — `playToPathDone` → first robot thanks (no `certificate`) → second talk opens `data-testid="certificate"` (no download) → confirm name → PNG `rafiq-passport.png` + PDF `rafiq-passport.pdf` (filenames have no player name). Screenshots in `evidence/17/`: `interior.png` (workshop after path done; HUD `OBJECTIVES.restored`; `data-ending="in_progress"`; `open-passport` absent), `thanks.png` (companion thanks with long Arabic name; invents `الترميم يلغي الهلوسة`; no overlay), `overlay.png` / `name-ar.png` (RTL invitation `الروبوت: أدعوك إلى مدينة الذكاء الاصطناعي. هذا جواز إتمام تعليمي، لا اعتماد رسمي.`; title `شهادة إتمام تعليمية`; name `عبد الرحمن بن محمد بن عبد الله الأندلسي` as HTML text with `unicode-bidi: plaintext`; version `رفيق ١` in `.path-ltr` `direction: ltr`; date `٩ أيلول ٢٠٢٦`), `name-mixed.png` (`Sara علي-Khan` on the overlay), `png.png` / `pdf.png` (local downloads), `success.png` (HUD `OBJECTIVES.passportIssued`; HUD button `الجواز`). Downloaded files: `evidence/17/rafiq-passport.png` (magic `89 50 4E 47`) and `evidence/17/rafiq-passport.pdf` (`%PDF-` and contains the PNG signature). Overlay bounds at 1366 and 1920: `overlays.png` is the 1920 certificate card.
- `e2e/passport-retry.spec.ts` — second talk before restored → no overlay then finish 16 + thanks + second talk; missing-id fixture → `الجواز يُمنح بعد دليل الحملة الكامل.` then eligible open; download-before-confirm → `أكّد الاسم الظاهر قبل التنزيل.`; exam/percent/verify/registry/legacy/network/تم → no issue; `certificate-fail` → `تعذّر التنزيل. أعد المحاولة من هذه الشاشة.` overlay stays, retry PNG succeeds; close overlay before download → `invited` not `issued` then reopen + confirm + download; replay download after issued still works.

WORLD_POS.robot remains `{ x: 12*48+24, y: 5*48+24 }`. Street letter `Y` is `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` `w` `l` `h` `x` `f` `v` `J` `Z` `O` `V` `1` `2` `3` `4` stay put. Row 8 is `#O1wJfhZ.vx3l2V#` (`3` col 11, floor col 8). Row 6 is `#k.q......t4...#` (`4` col 11, floor col 8). Door `d` remains col 8. No new map, portal, civic-lab, or workshop desk. `data-slice="17"`. `data-ending` mirrors `endingState`. `JOURNAL_CAP === 112`. `EVIDENCE_IDS.length === 34`. Fail-path copy appears on the certificate via `certificate-feedback`. Version digit uses `direction: ltr` / class `path-ltr`. Persistable GameState strings, journal text, and HUD objectives use Arabic **الجواز** / **الوداع** / **الإتمام** / **الحملة** and do not contain English `MCP` or `harness` or persistable `شهادة`. Overlay title may show `شهادة إتمام تعليمية`. After 12 connect, host overlay / skippable explain **do** still contain `MCP`. Overlay is `data-testid="certificate"`, mode `'ending'`, never `TOGGLE_PAUSE`. No `fetch(` / `Date.now()` / `setInterval` awards in `passport.ts` / `pdf.ts`. Download filenames are `rafiq-passport.png` / `rafiq-passport.pdf` (no player name). Authored date `٩ أيلول ٢٠٢٦`, version `رفيق ١`.

Console errors observed in those viewport tests: **none**.

The certificate is a paper overlay, not a quiz, not a live HTTP client, and not a public registry. After 16 success the HUD objective stays أُنجزت سهرة القراءة تحت إشراف، والروبوت صار جاهزاً للعمل في الحي. مدير الورشة شكرك until a second robot talk. Issuance requires eligibility + overlay + name confirm + at least one successful local PNG or PDF. Typed player text is never `eval`'d. Completing 17 does not re-award 1.1–6.4 or add a 35th evidence key.

No sound, pixel-perfect click, or timed reaction is required. Long Arabic and mixed-script names stayed readable at 1366×768 and 1920×1080.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Slice 18 sequel map / next-campaign start, RG01–RG08 release review (out of slice; RG03 other browsers stay untested)
