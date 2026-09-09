# BUILD.md

Slice: 05 — A place for the right memories
Archive: slices/05-a-place-for-the-right-memories.md

## Goal
Carry the relevant information forward without sharing private data: after parcel success the player opens the inner library into a reading room, restores a lost delivery constraint through a 2-slot working-context window (overflow and reselection, distinct from a persistent note), redacts names and private fields from a fictional community file before the robot sees them, and assembles a named context pack from specification plus delivery file while excluding irrelevant documents. Covers 1.4, 1.5, 2.5.

## Done when
- AC01 — **1.4 demonstrated only.** Inner door `F` becomes portal to map `archive`. 2-slot window. Relevant notes `constraint` and `hold`; decoys `festival` and `mango`. Bench starts full with decoys. Overflow (FIFO) must be seen. Reselect constraint+hold; recitation becomes the constraint. Pinning to persistent notes alone does not award 1.4. `1.4` only after overflowSeen **and** restored recitation from the limited pack.
- AC02 — **1.5 demonstrated only.** Fictional community file with private names نورة الشمري / خالد العتيبي, phone ٠٥٥٠٠٠١١٢٢, address بيت ١٢ الزقاق الغربي. Needed facts: shelf م-٤, بعد العصر, المواصفات في القاعة فقط. Unredacted give fails. Hiding needed facts fails. `1.5` only when robot gets needed facts and payload has none of the four private strings. File never contains the player's confirmed name.
- AC03 — **2.5 demonstrated only.** Four documents: spec, delivery, festival, news_draft. Named pack stamp «حزمة إصلاح رفيق» must include spec+delivery and exclude decoys. Unnamed or festival stamp or decoy files fail. 1.4 window is not the 2.5 path.
- AC04 — After 1.4+1.5+2.5: specification readable, visible HUD `context-module`, robot cassette `contextModule`. Newsroom not opened. Optional skippable explanations after awards.
- AC05 — New map `archive` without moving 01–04 landmarks. Evidence only adds 1.4, 1.5, 2.5. Robot still unsupported after success. No MCP/harness/certificate.
- AC06 — No syllabus/quiz/exam. World actions award.
- AC07 — No live model, no eval. Physical UI sufficient.
- AC08 — Saves/journal/privacy/01–04 still work. `saveVersion` 1. Chrome 1366 and 1920, dev and preview. Update parcel e2e inner-door: after parcel success `F` enters `archive`.

## Out
- Slice 06 newsroom. Certificate, live AI, MCP, harness, remaining ids.
- Awarding 1.4 on pin/journal alone; 1.5 on inspect-only; 2.5 with decoys or unnamed pack.
- Auto-loading persistent notes into the working window.

## Constraints
- Implement in `app/`. After `commsRepaired`, inner door uses portal `archive`. Never weaken prior evidence. Overlay cards look like papers.

## Data / state impact
MapId `archive`. Evidence union adds `'1.4' | '1.5' | '2.5'`. `libraryQuest` with slots cap 2, redacted fields, pack files/name, flags. Modes redact/context/pack. Journal events archive_visit, notes_overflow, constraint_restored, file_redacted, pack_assembled, spec_released. Hydrate missing libraryQuest as unstarted.

## Tests
- T01 — Vitest `evidence/05/state-tests.txt` for all predicates.
- T02 — Playwright parcel-done → archive success. Screenshots `evidence/05/interior.png`, `community-file.png`, `overflow.png`, `reselect.png`, `redact.png`, `pack.png`, `success.png`.
- T03 — Overflow/reselect; pin does not skip 1.4; unredacted then redact; wrong pack then correct.
- T04 — Viewports; `evidence/05/browser-checks.md`, `overlays.png`.
- T05 — typecheck, lint, test, build; `evidence/05/project-checks.txt`.
- T06 — 01–04 e2e with inner-door update; shop/parcel do not award 1.4/1.5/2.5; privacy still green.
- Reviewer maps AC01–AC08 and verifies snapshot.

## Proof
Builder proposed (d-20260908-018-impl-05). Not independently accepted.
- Candidate: `158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d` (110 files; coordinator matched).
- Evidence: `evidence/05/`.
Reviewer must re-run checks.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-fe28aef8-84bb-5d6b-b3d8-06962ad608b7 on dispatch d-20260908-017-plan-05. Contract `4e7db2744f2ffb8738c9dcd015e207bef0313ef2df5e40618018f4451ed3b45a`. Snapshot `7cba3a83b9f8733ca19d79f67624b3b477a53b9819a90e009d2c923ae719695f`. Blockers: none.
Implementation approval: none
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Reviewer / implementation
Dispatch ID / launch state / input identity: d-20260908-019-implrev-05 / pending launch / contract:4e7db2744f2ffb8738c9dcd015e207bef0313ef2df5e40618018f4451ed3b45a candidate:158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d
Pending result / last consumed dispatch: builder d-20260908-018-impl-05 / d-20260908-017-plan-05
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 04 `7cba3a83b9f8733ca19d79f67624b3b477a53b9819a90e009d2c923ae719695f` (92 covered files)
Contract identity: `4e7db2744f2ffb8738c9dcd015e207bef0313ef2df5e40618018f4451ed3b45a` (`.loop/contract/hashes.json`)
Candidate snapshot: `158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d` (110 files)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-017-plan-05 / plan / APPROVE_PLAN / contract:4e7db2744f2ffb8738c9dcd015e207bef0313ef2df5e40618018f4451ed3b45a snapshot:7cba3a83b9f8733ca19d79f67624b3b477a53b9819a90e009d2c923ae719695f / gaps: none / identities matched / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: none
Next slice ID / draft: none
Prior shipped receipt: slice 04 archive `slices/04-the-wrong-parcel.md`

## Status
Ready for review

## Next
Independent implementation review d-20260908-019-implrev-05.
