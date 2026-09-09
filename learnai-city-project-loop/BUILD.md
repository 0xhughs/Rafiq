# BUILD.md

Slice: 08 — One small service
Archive: slices/08-one-small-service.md

## Goal
Help the workshop build a narrowly scoped service for one neighborhood need: after festival success (`workshopMaterials`) street door `Y` becomes a portal to map `workshop`. The manager’s need is a tiny **لوحة مواعيد المعاينة** with one flow (pick a posted slot → the board shows **محجوز**). The player writes a product brief with screens, constraints, exclusions and observable acceptance, hands it to the workshop builder (the robot), excludes extra requests, inspects the built board against that brief, then runs the one flow. Covers 4.1, 4.2.

## Done when
- AC01 — **4.1 demonstrated only.** One user need: لوحة مواعيد المعاينة for neighbors who need a written inspection slot. Posted slots (authored, paper, not live hours): **الأحد — بعد العصر**، **الاثنين — ضحى**، **الثلاثاء — عصراً**. The working flow is: choose any one posted slot and confirm; the board shows «محجوز» on that slot. Extra feature in the brief (دفع إلكتروني، دردشة مباشرة، ساعات استقبال حيّة، كiosk / مفتاح API) fails 4.1 with visible board/builder feedback; the player then excludes those requests and rebuilds. Running an extra control on a bloated board (ادفع الآن / ساعات حيّة / دردشة / كiosk) fails visibly and does not award. Inspect-need-only, manager-talk-only, or robot saying «تم» does not award. `4.1` only after inspect need + need is appointments (not extras) + extras excluded + one posted slot booked on the slim board.
- AC02 — **4.2 demonstrated only.** Paper **وصف المنتج** for the workshop builder must include all four parts, from authored choices, not free text: **شاشات** = لوحة الفترات الثلاث المعلّقة + شاشة تأكيد الحجز؛ **قيود** = فترات معلّقة على الورق فقط، حجز واحد، بلا دفع وبلا دردشة؛ **استثناءات** = لا دفع، لا دردشة، لا ساعات حيّة (ما زالت غير متفق عليها من قاعة الأخبار)، لا كiosk ولا مفتاح API؛ **قبول ملاحظ** = اختيار فترة معلّقة ثم ظهور «محجوز» على تلك الفترة — not «الروبوت قال تم» and not click-count. Player must inspect the need slip, fill the four parts, **hand the brief to the builder**, then **inspect the built board against that contract** (match screens / constraints / exclusions / acceptance on a paper check). Missing screens, constraints, exclusions, or acceptance fails 4.2 with a specific retryable message. Robot building without a brief fails (builder refuses; no board). Inspect-brief-only (read empty/partial paper, or look at the board without the four-part check) does not award. `4.2` only after inspect need + four brief parts + handoff + inspect-result match.
- AC03 — Both ids demonstrated → manager thanks; board stays posted (`servicePosted`). Evidence only adds `4.1` and `4.2`. No kiosk, no API/secrets, no terminal, no publish, no MCP, no harness, no certificate. Robot still unsupported after success (may still invent «مفتوحة دائماً» or a payment feature). No 09–18 content.
- AC04 — No syllabus/quiz/exam. Physical paper UI sufficient. Dialogue choices express intent; awards require the paper/board actions above.
- AC05 — No live model, no eval of player free text against an LLM, no real API keys. Need slip, extras, brief options, builder output and board slots are authored. Names stay local.
- AC06 — Saves/journal/privacy/01–07 still work. `saveVersion` 1. After festival success, `Y` enters `workshop` without awarding 4.1/4.2. Festival success must not award 4.1/4.2 or set `servicePosted`. Chrome 1366×768 and 1920×1080, `npm run dev` and `npm run preview`. Keep WORLD_POS landmarks (apartment door, dumpster, robot at `12*TILE+24` / `5*TILE+24`, shop `P`, parcel `R`, library `I`, inner `F`, newsroom `E`, festival `G`). Do not shift those cells. Street letter `Y` stays `WORLD_POS.workshopDoor`.

## Out
- Slice 09 kiosk RTL, fictional API, dummy secrets; slice 10 logs/publish/terminal; MCP; harness; certificate; live AI; remaining ids.
- Awarding 4.1 when extras remain in the brief, when an extra control is the “success”, on inspect-only, or because the robot said done. Awarding 4.2 when any of screens/constraints/exclusions/acceptance is missing, when the builder ran with no brief, or on inspect-only. Implementing a second service (hours notice, payment, chat) as a working flow.

## Constraints
- Implement in `app/`. New map `workshop` after `festivalQuest.workshopMaterials`. Convert street `Y` from dialogue-only (`workshop_door_open`) into a portal `street Y ↔ workshop d`, locked with existing `locked_workshop` until materials; after materials the interior opens. Paper-card overlays (need slip, extras slip, product brief, builder bench, result-check, appointment board). New interior letters must not collide with street `P` `E` `I` `R` `F` `D` `G` `Y`. Never weaken 01–07 evidence predicates. Update the 07 street-door assertion that currently expects `workshop_door_open` copy so 07 e2e still passes: after materials, `Y` portals into `workshop` without awarding 4.1/4.2. Arabic RTL overlays; WASD/arrows by `event.code`. Optional skippable explanations after awards only.

## Data / state impact
MapId `workshop`. Evidence union adds `'4.1' | '4.2'`. `workshopQuest` flags for inspect need/extras, brief parts (screens, constraints, exclusions, acceptance), handoff, extra-in-brief, build-without-brief, inspect-result, booked slot, `servicePosted`. Modes `brief` and `board` (inspect reused for need, extras, built board). JOURNAL_CAP raised from 32 to **40** so 08 events do not drop 07 leads. Hydrate missing `workshopQuest` as unstarted; missing manager greeting `unmet`; drop unknown evidence keys; `saveVersion` remains 1.

## Tests
- T01 — Vitest `evidence/08/state-tests.txt` for AC01–AC03 predicates, hydrate, portal lock/open, and fail paths.
- T02 — Playwright festival-success → workshop success. Screenshots `evidence/08/interior.png`, `need.png`, `extras.png`, `brief.png`, `missing.png`, `builder.png`, `board.png`, `booked.png`, `success.png`.
- T03 — Retry paths; no trap: extra in brief → fail 4.1 then exclude and rebuild; missing screens/constraints/exclusions/acceptance → fail 4.2 then fill the missing part; build without brief → refuse then hand a complete brief; inspect-only → no award then complete the paper actions; bloated-board extra control → fail then book a posted slot.
- T04 — Viewports 1366 and 1920; `evidence/08/browser-checks.md`, `overlays.png`; run against `npm run dev` and `npm run preview`.
- T05 — typecheck, lint, test, build; `evidence/08/project-checks.txt`.
- T06 — Keep 01–07 e2e; festival success must not award 4.1/4.2 or set `servicePosted`. Entering `workshop` after materials must not itself award.
- Reviewer maps AC01–AC06 and verifies snapshot.

## Proof
Builder claims for d-20260908-030-impl-08 (not independently accepted):
- Candidate (coordinator recomputed): `a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d` (168 files).
- Contract unchanged: `efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411`.
- Claimed checks: tsc/lint/build exit 0; vitest 92; Playwright 39/39 on preview :4180 and Vite :5181.
- Claimed artifacts: `evidence/08/interior.png`, `need.png`, `extras.png`, `brief.png`, `missing.png`, `builder.png`, `board.png`, `booked.png`, `success.png`, `overlays.png`, `state-tests.txt`, `project-checks.txt`, `browser-checks.md`.
- Claimed: festival success does not award 4.1/4.2; Y portals to workshop without those ids; WORLD_POS.robot unchanged.
Reviewer must re-run checks in an isolated copy and map AC01–AC06.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-13bec108-4dfa-5f6d-9b24-1e59d91d52a9 on dispatch d-20260908-029-plan-08. Contract `efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411`. Snapshot `b21f3762b9f113adc83d93718a92addde8524c443862bcddba68f664a168c650`. Blockers: none.
Implementation approval: none
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Reviewer / implementation
Dispatch ID / launch state / input identity: d-20260908-031-implrev-08 / pending launch / contract:efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411 candidate:a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d
Pending result / last consumed dispatch: none / d-20260908-030-impl-08
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 07 `b21f3762b9f113adc83d93718a92addde8524c443862bcddba68f664a168c650` (149 covered files)
Contract identity: `efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411` (`.loop/contract/hashes.json`)
Candidate snapshot: `a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d` (168 files)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-029-plan-08 / plan / APPROVE_PLAN / contract:efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411 snapshot:b21f3762b9f113adc83d93718a92addde8524c443862bcddba68f664a168c650 / gaps: none / identities matched / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: none
Next slice ID / draft: none
Prior shipped receipt: slice 07 archive `slices/07-the-missing-festival-numbers.md`

## Status
Ready for review

## Next
Independent implementation review of slice 08 under dispatch d-20260908-031-implrev-08.
