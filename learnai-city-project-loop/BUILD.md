# BUILD.md

Slice: 07 — The missing festival numbers
Archive: slices/07-the-missing-festival-numbers.md

## Goal
Help the festival office plan from honest records and a permitted use of AI: after newsroom success (`workshopLead`) the player enters مكتب المهرجان on the south street, reconciles جدول مخزون المهرجان with paper receipts, computes a supported total and leaves the receipt-less cell explicitly unknown, then prepares a permitted بيان المخزون المصحح under the posted work/study policy—disclosing robot wording help and keeping the human’s figures. Success supplies workshop materials and opens the street workshop door. Covers 3.4, 3.5.

## Done when
- AC01 — **3.4 demonstrated only.** Paper table vs three receipts. Table: أعلام الحي ١٢، أقمشة المقاعد ٨، فناجين الشاي ٦، صناديق الماء ١٥. Receipts: أعلام ١٢، أقمشة ٨، ماء ٢٠؛ no cups receipt. Player must inspect table and receipts, mark flags+cloth مطابق, take water from the receipt (٢٠) not the table (١٥), mark cups غير معروف — لا إيصال, and produce supported total ٤٠ as the visible sum of the three receipt amounts on the reconciliation paper (`اجمع المؤيَّد`). Inspect-only does not award. Filling cups with ٦ (table) or ١٠ (robot guess) fails. Accepting table water ١٥ fails. `3.4` only after inspect table + inspect receipts + unknown cups + receipt water + computed total ٤٠.
- AC02 — **3.5 demonstrated only.** Posted سياسة العمل والدراسة (short fictional office policy): robot may help wording; if it helped, the paper must carry stamp «صيغ بمساعدة الروبوت»; human figures (including unknown) stay; no value without a receipt. Submission desk already holds a robot-drafted cover, so wording help occurred. Permitted بيان to ورشة الإصلاح for صرف مواد المعاينة must carry the human 3.4 figures (٤٠ + cups unknown), the disclosure stamp, and a human sender—not the officer’s signature by the robot. Inspect-policy-only does not award. Submit without the stamp fails. Submit with disclosure but robot figures (٤٦ / cups ٦) fails (human work not retained). `3.5` only after inspect policy + human figures on the form + disclosure stamp + human send.
- AC03 — Both ids demonstrated → officer thanks, workshop materials supplied (`workshopMaterials`), street workshop door opens (`workshopDoorOpen`). No workshop map and no 4.1–4.2 interior/service. Evidence only adds `3.4`, `3.5`. Robot still unsupported after success.
- AC04 — No syllabus/quiz/exam. Physical paper UI sufficient. Dialogue choices express intent; awards require the paper actions above.
- AC05 — No live model, no eval of player free text against an LLM, no real API keys. Robot table-fill and cover draft are authored. Names stay local.
- AC06 — Saves/journal/privacy/01–06 still work. `saveVersion` 1. After newsroom success, festival office is enterable without awarding 3.4/3.5. Newsroom success must not award 3.4/3.5 or release materials. Chrome 1366×768 and 1920×1080, `npm run dev` and `npm run preview`. Keep WORLD_POS landmarks (apartment door, dumpster, robot at `12*TILE+24` / `5*TILE+24`, shop `P`, parcel `R`, library `I`, inner `F`, newsroom `E`). Grow street south (unused south walkway may stay); do not shift those landmarks.

## Out
- Slice 08 workshop interior, product brief, kiosk, API/secrets, terminal/deploy, MCP, harness, certificate, live AI, remaining ids.
- Awarding 3.4 on an invented cups number, table water ١٥, inspect-only, or a robot-invented total (٤٦). Awarding 3.5 without required disclosure, without inspecting the policy, or on a form that replaced the human unknown/total. Opening a playable workshop map.

## Constraints
- Implement in `app/`. New map `festival` after `newsroomQuest.workshopLead`. Paper-card overlays (table, receipts, reconciliation tally, policy slip, submission/manifest). New street door letter must not reuse `P` `E` `I` `R` `F` `D`. Place a visible workshop door on the new south frontage; it stays a street interactable in this slice (locked copy before materials; open copy after—no `workshop` mapId). Never weaken 01–06 evidence predicates or e2e. Arabic RTL overlays; WASD/arrows by `event.code`. Optional skippable explanations after awards only.

## Data / state impact
MapId `festival`. Evidence union adds `'3.4' | '3.5'`. `festivalQuest` flags for inspect/reconcile/policy/submit/materials. Modes `reconcile` and `submit` (inspect reused for table, receipts, policy, robot cover). JOURNAL_CAP raised to 32 so 07 events do not drop 06 leads. Hydrate missing `festivalQuest` as unstarted; missing officer greeting `unmet`; drop unknown evidence keys; `saveVersion` remains 1.

## Tests
- T01 — Vitest `evidence/07/state-tests.txt` for AC01–AC03 predicates, hydrate, and fail paths.
- T02 — Playwright newsroom-success → festival success. Screenshots `evidence/07/interior.png`, `table.png`, `receipts.png`, `reconcile.png`, `missing.png`, `policy.png`, `submission.png`, `success.png`.
- T03 — Retry paths; no trap: invent cups → fail 3.4 then mark unknown; robot total ٤٦ → fail then sum receipts; submit without stamp → fail 3.5 then stamp; robot figures on the form → fail then restore human ٤٠ + unknown.
- T04 — Viewports 1366 and 1920; `evidence/07/browser-checks.md`, `overlays.png`; run against `npm run dev` and `npm run preview`.
- T05 — typecheck, lint, test, build; `evidence/07/project-checks.txt`.
- T06 — Keep 01–06 e2e; newsroom success must not award 3.4/3.5 or set `workshopMaterials` / `workshopDoorOpen`.
- Reviewer maps AC01–AC06 and verifies snapshot.

## Proof
Not completed yet.

## Review
Pending plan review.
Plan approval: none
Implementation approval: none
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Reviewer / plan
Dispatch ID / launch state / input identity: d-20260908-025-plan-07 / pending launch / contract:f521d4d6bbfceeb572750066fb9c5044443f7beb784c7b1c630ad4634c910ea1 baseline:51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957
Pending result / last consumed dispatch: none / d-20260908-024-draft-07
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 06 `51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957` (131 covered files)
Contract identity: `f521d4d6bbfceeb572750066fb9c5044443f7beb784c7b1c630ad4634c910ea1` (`.loop/contract/hashes.json`)
Candidate snapshot: none
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events: none
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: none
Next slice ID / draft: none
Prior shipped receipt: slice 06 archive `slices/06-a-notice-the-neighborhood-can-trust.md`

## Status
Proposed

## Next
Independent plan review of slice 07. Do not implement before APPROVE_PLAN.
