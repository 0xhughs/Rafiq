# BUILD.md

Slice: 04 — The wrong parcel
Archive: slices/04-the-wrong-parcel.md

## Goal
Guide the robot to retrieve the intended repair component through clear, revisable instructions: after slice 03 `shop_helped`, the player reaches a parcel office, delegates retrieval while keeping purchase approval, stops an overbroad grab-or-pay attempt, writes instructions that name parcel, location, constraints and return format, watches an ambiguous command fail on two similar gray boxes, revises only the missing information, and succeeds on a fresh hold.

## Done when
- AC01 — **2.1 demonstrated only.** After shop helped, مكتب طرود الرصيف is enterable. Player delegates retrieval to the robot. Overbroad «سآخذ كل الطرود الرمادية وأدفع ثمنها» must be stopped; allowing it fails recoverably. `2.1` only after delegated retrieval **and** stopping the overbroad attempt. Inspect/enter/talk do not award.
- AC02 — **2.2 demonstrated only.** Instruction specifies parcel, location, constraints, return format. `robot-understood` shows those four. Robot retrieves the intended hold. Incomplete spec or decoy ر-٧١ does not award.
- AC03 — **2.4 demonstrated only.** «هات الطرد الرمادي» is ambiguous (ر-١٧ vs ر-٧١). Fail is observable (decoy or cannot tell). Player revises missing info. Fresh hold **ر-١٩** is staged; failed attempt must not flip to success. `2.4` only after recorded fail **and** new send retrieving ر-١٩.
- AC04 — Robot cannot buy/pay. Player-only confirmation. Repair holds are not for sale. Paying decoy does not award evidence.
- AC05 — New map `parcel` without moving slice 01–03 landmarks. Locked until `shop_helped`. Visible communication repair. Library inner stays locked. Robot still unsupported after success. Evidence ids only add 2.1, 2.2, 2.4.
- AC06 — No syllabus/quiz/exam. Optional explanations after actions only.
- AC07 — No live model, no eval. Domain NL with understood/clarify. Physical/UI actions sufficient.
- AC08 — Saves/journal/privacy/companion and 01–03 still work. `saveVersion` 1. Hydrate missing parcelQuest. Chrome 1366 and 1920, dev and preview.

## Out
- Slice 05 library context pack / redaction / inner unlock.
- Certificate, live AI, MCP, harness, remaining curriculum ids, robot restoration, real payments.
- Awarding 2.4 by flipping the failed retrieval.

## Constraints
- Implement in `app/`. Replace the “instructions later” stall so this work starts. Never weaken 1.1–1.6. Keep WORLD_POS landmarks.

## Data / state impact
Evidence union adds `'2.1' | '2.2' | '2.4'`. MapId `parcel`. `parcelQuest` phases and flags as in the draft (overbroad, failedParcelId r71, intended r17 then r19). Journal events parcel_visit, parcel_overbroad_stopped, parcel_instruction_failed, parcel_retrieved. JOURNAL_CAP 16. Optional inventory `repair_parcel` after success. Unknown evidence keys dropped.

## Tests
- T01 — Vitest `evidence/04/state-tests.txt` for all predicates above.
- T02 — Playwright shop_helped → parcel success. Screenshots `evidence/04/office.png`, `parcel-tags.png`, `overbroad-stop.png`, `ambiguous-fail.png`, `instruction-repair.png`, `success.png`.
- T03 — Ambiguous fail, revise missing field, fresh ر-١٩; no trap.
- T04 — Viewports; `evidence/04/browser-checks.md`, `overlays.png`.
- T05 — typecheck, lint, test, build; `evidence/04/project-checks.txt`.
- T06 — 01–03 e2e still pass; shop success does not award 2.x; library inner locked.
- Reviewer maps AC01–AC08 and verifies snapshot.

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
Dispatch ID / launch state / input identity: d-20260908-013-plan-04 / pending launch / contract:14ded8bd2eba6ee19c51093e7a790df7feb1bec1ce8718d1a15d7104d4a4e63d baseline:92f284d762df78170e148633ff3eb9e82626225306a9b4807463de7380c89257
Pending result / last consumed dispatch: none / d-20260908-012-draft-04
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 03 `92f284d762df78170e148633ff3eb9e82626225306a9b4807463de7380c89257` (76 covered files)
Contract identity: none
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
Prior shipped receipt: slice 03 archive `slices/03-the-price-that-was-never-checked.md`

## Status
Proposed

## Next
Independent plan review of slice 04. Do not implement before APPROVE_PLAN.
