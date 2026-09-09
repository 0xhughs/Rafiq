# BUILD.md

Slice: 06 — A notice the neighborhood can trust
Archive: slices/06-a-notice-the-neighborhood-can-trust.md

## Goal
Produce a useful, sourced community notice and repair-request draft: after archive success the player enters قاعة أخبار الحي, compares two sources without erasing disagreement, follows a clipping to its original before citing, inspects an attractive robot notice and marks a mismatch, matches the editor’s voice without changing facts, and reviews a repair-request letter. Success changes the editor and opens a workshop lead. Covers 2.3, 2.6, 3.1, 3.2, 3.3.

## Done when
- AC01 — **3.1 demonstrated only.** Two papers disagree on workshop hours and access. Comparison must name both, record both disagreements, and attach a real substring from each. Robot false-consensus fails. Inspect-only does not award.
- AC02 — **3.3 demonstrated only.** Clipping claims a midnight parts hold citing ق-٢٠٤. Original says festival night watch, not a parts hold. Cite-before-original fails. `3.3` after follow + original + verify-before-cite.
- AC03 — **2.3 demonstrated only.** Attractive draft claims always-open, midnight hold, no written request. Player marks at least one real mismatch and corrects before release. Unchecked release fails.
- AC04 — **2.6 demonstrated only.** Match editor sample voice (short neighborhood address, no slogans مثل نقلة نوعية) without changing verified facts.
- AC05 — **3.2 demonstrated only.** Letter: recipient مدير ورشة الإصلاح, purpose inspection appointment, tone واضح ومهذب, length ≤ four sentences. Explicit review required. Invented circular 14 fails. Robot must not send/sign as the workshop manager.
- AC06 — All five ids demonstrated → editor thanks, workshop lead (interior not implemented), robot still unsupported. Evidence only adds 2.3, 2.6, 3.1, 3.2, 3.3.
- AC07 — No syllabus/quiz/exam. Physical UI sufficient. No live model, no eval.
- AC08 — Saves/journal/privacy/01–05 still work. `saveVersion` 1. After archive success, newsroom is enterable without awarding 06 ids. Chrome 1366 and 1920, dev and preview. Keep WORLD_POS landmarks.

## Out
- Slice 07 festival numbers. Workshop interior. Certificate, live AI, MCP, harness.
- Awarding 3.1 on blended consensus; 3.3 without original; 2.3 unmarked; 2.6 that changes facts; 3.2 without review.

## Constraints
- Implement in `app/`. New map `newsroom` after `contextModule && specReleased`. Unused street cells between shop and library if possible. Paper-card overlays. Never weaken prior evidence.

## Data / state impact
MapId `newsroom`. Evidence union adds `'2.3' | '2.6' | '3.1' | '3.2' | '3.3'`. `newsroomQuest` flags for compare/verify/mark/voice/letter. JOURNAL_CAP 24. Hydrate missing newsroomQuest as unstarted.

## Tests
- T01 — Vitest `evidence/06/state-tests.txt`.
- T02 — Playwright archive-success → newsroom success. Screenshots `evidence/06/interior.png`, `sources.png`, `comparison.png`, `clipping.png`, `original.png`, `mismatch.png`, `voice.png`, `letter.png`, `success.png`.
- T03 — Retry paths; no trap.
- T04 — Viewports; `evidence/06/browser-checks.md`, `overlays.png`.
- T05 — typecheck, lint, test, build; `evidence/06/project-checks.txt`.
- T06 — 01–05 e2e; archive success does not award 06 ids.
- Reviewer maps AC01–AC08 and verifies snapshot.

## Proof
Independently accepted by d-20260908-023-implrev-06.
- Approved candidate: `51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957` (131 files).
- Approved contract: `a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2`.
- Isolated checks all 0. AC01–AC08 pass.
- Evidence: `evidence/06/`.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-6da368b5-cbde-537a-9c55-32559891f757 on dispatch d-20260908-021-plan-06. Contract `a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2`. Snapshot `158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d`. Blockers: none.
Implementation approval: APPROVE_IMPLEMENTATION by reviewer bc-09b18c6c-7729-5fe5-b25d-b5a5eced413e on dispatch d-20260908-023-implrev-06. Contract `a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2`. Snapshot `51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957`. Blockers: none.
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Builder / draft-proposal
Dispatch ID / launch state / input identity: d-20260908-024-draft-07 / pending launch / contract:d3a9e76b57aa9558bf52ec3f82ceb360acd512a6a0197bf3b0d232ad71943fd0 baseline:51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957
Pending result / last consumed dispatch: none / d-20260908-023-implrev-06
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 05 `158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d` (110 covered files)
Contract identity: `a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2` (`.loop/contract/hashes.json`)
Candidate snapshot: `51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957` (131 files)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-021-plan-06 / plan / APPROVE_PLAN / contract:a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2 snapshot:158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d / gaps: none / identities matched / rejection count 0 / no-progress 0
- ev-002 / d-20260908-023-implrev-06 / implementation / APPROVE_IMPLEMENTATION / contract:a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2 snapshot:51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957 / gaps: none / isolated re-run all 0 / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: archive written; next selected
Next slice ID / draft: 07 / pending
Prior shipped receipt: slice 06 archive `slices/06-a-notice-the-neighborhood-can-trust.md`

## Status
Shipped

## Next
Builder draft-proposes slice 07 under dispatch d-20260908-024-draft-07. No code edits.
