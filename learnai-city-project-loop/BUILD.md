# BUILD.md

Slice: 03 — The price that was never checked
Archive: slices/03-the-price-that-was-never-checked.md

## Goal
Help the shopkeeper using supported information instead of the robot's confidence: after the slice 02 neighborhood is reachable, the player works one connected corner-store visit where a fluent invented price or product fact is checked against inspectable shop records, exact totals go through a fictional calculator, a second claim is verified without a pointer, and writing / lookup / calculation / a human decision stay distinct tools. Success changes البقال and yields a repair-parcel lead; the robot is not cured of unsupported claims.

## Done when
- AC01 — **1.1 demonstrated only.** After `help_accepted`, بقالة الزاوية is a furnished interior. Inspectable world objects: west shelf record, east shelf record, posted price list. Overlays look like physical cards, not quizzes. Fixed stock: west خبز 3، لبن 4، ماء 2 (متوفر); east تمر الخلاص 9 and **no** عصير مانجو; price list same numbers plus «مفتوح حتى المغرب». Robot invents: «عصير المانجو على الرف الأيسر، سعره اثنا عشر ريالاً.» Inspecting alone does not award. `evidence['1.1'] === 'demonstrated'` only after opening a source **and** telling البقال a sourced fact (proposed: «نظرت إلى بطاقة الرف: لا يوجد مانجو.»). Robot mango/12 or sourced line without inspect fails recoverably. No player-facing topic IDs. Optional explanation after success is skippable.
- AC02 — **1.2 demonstrated only.** Notice board world object. Robot rewrite is a mixed draft with a wrong total and a wrong current fact. Exact total **17** (3×3 + 2×4) must come from the fictional counter calculator. Current fact (تمر 9 and/or الماء متوفر) from an inspected source. Posting the unchecked draft fails. `1.2` only when posted notice contains 17 and a source-backed fact and does not present 20 / تمر 18 / ماء نفد as true.
- AC03 — **1.3 demonstrated only.** Transaction: robot says تمر is 18; player must refuse, inspect east shelf/list (9), correct to **9**. Trusting 18 is recoverable. Then a **second** claim without naming where to look (proposed: water 5 or نفد). `1.3` only after catch + inspect + correct **and** independent inspect of ماء 2 متوفر used to reject the second claim. Hints must not name the second object; if they do, require a further unaided verification.
- AC04 — **1.6 demonstrated only.** Four non-interchangeable errands: lookup (AC01), writing (notice), calculation (calculator), human decision (crate: البقال decides, not the robot). `1.6` only when all four succeed.
- AC05 — When 1.1–1.3 and 1.6 are demonstrated, البقال thanks the player and gives a repair-parcel **lead** (parcel puzzle is slice 04, not implemented). Journal `shop_helped`. Robot remains damaged companion and still makes at least one unsupported claim. No other curriculum ids. Library inner door stays locked.
- AC06 — No syllabus, quiz, exam, or player-facing lesson numbers. `assertNoLessonUi` stays green. Awards require world actions. Optional explanations only after the action.
- AC07 — If natural language is present, accept meaning-preserving Arabic variants in a declared domain; show `robot-understood`; clarify unsupported phrasing. Physical actions remain sufficient. Never eval player text or call a live model.
- AC08 — Saves, journal, privacy, companion, and slices 01–02 still work. Persist shop quest + evidence at checkpoints. Old `evidence: {}` hydrates as shop unstarted. Playable Chrome 1366×768 and 1920×1080 on dev and preview.

## Out
- Slice 04 parcel retrieval and purchase-approval puzzle.
- Slice 05 library context pack / redaction.
- Certificate, live AI, MCP, harness, remaining curriculum ids, robot restoration, accounts, cloud, mobile.
- Curing hallucination; syllabus; executing player text; real API keys.

## Constraints
- Implement in `app/`. Replace slice 02 shopkeeper “shelves still being arranged” copy so this verification work actually starts.
- Keep portal id `shop` and slice 01 `WORLD_POS` unless tests update in the same change.
- Authored simulation only. `saveVersion` stays 1 with backward-compatible hydration. Never weaken predicates.

## Data / state impact
Typed `evidence` for `'1.1' | '1.2' | '1.3' | '1.6'` as `'demonstrated'` only. `shopQuest` phases and inspect flags. Journal events `shop_shelf_checked`, `shop_notice_posted`, `shop_price_corrected`, `shop_helped`. Interactables: shelves, price list, notice, calculator, optional crate. Unknown evidence keys dropped on validate. No production DB.

## Tests
- T01 — Vitest `evidence/03/state-tests.txt`: predicates in the draft (inspect-only no award; wrong tool; four ids only; hydrate old saves; robot still unsupported after helped; 02 portal/companion regressions).
- T02 — Playwright from help-accepted through shop success. Screenshots `evidence/03/shelf-record.png`, `calculator.png`, `notice.png`, `success.png`.
- T03 — Trusting robot price fails; retry succeeds; second claim UI does not name the object; no trap.
- T04 — Viewports 1366 and 1920, dev and preview; `evidence/03/browser-checks.md`, `overlays.png`.
- T05 — typecheck, lint, test, build; `evidence/03/project-checks.txt`.
- T06 — Existing 01–02 e2e still pass on fresh storage; opening does not demonstrate 1.1.
- Reviewer maps AC01–AC08 to evidence and verifies snapshot.

## Proof
Not completed yet.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-95b79bcd-aacc-54f5-a1be-f8081e34edad on dispatch d-20260908-009-plan-03. Contract `a609b8b90a350d89b672c4a997de338b496688cb8440d5428e23518b304ee8ca`. Snapshot `f1feab0147e6f41f01c86f58a8d05e136cce7c84a706e1508b3d8bfcb424eb4f`. Blockers: none.
Implementation approval: none
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Builder / implementation
Dispatch ID / launch state / input identity: d-20260908-010-impl-03 / pending launch / contract:a609b8b90a350d89b672c4a997de338b496688cb8440d5428e23518b304ee8ca baseline:f1feab0147e6f41f01c86f58a8d05e136cce7c84a706e1508b3d8bfcb424eb4f
Pending result / last consumed dispatch: none / d-20260908-009-plan-03
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 02 `f1feab0147e6f41f01c86f58a8d05e136cce7c84a706e1508b3d8bfcb424eb4f` (59 covered files)
Contract identity: `a609b8b90a350d89b672c4a997de338b496688cb8440d5428e23518b304ee8ca` (`.loop/contract/hashes.json`)
Candidate snapshot: none
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-009-plan-03 / plan / APPROVE_PLAN / contract:a609b8b90a350d89b672c4a997de338b496688cb8440d5428e23518b304ee8ca snapshot:f1feab0147e6f41f01c86f58a8d05e136cce7c84a706e1508b3d8bfcb424eb4f / gaps: none / identities matched / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: none
Next slice ID / draft: none
Prior shipped receipt: slice 02 archive `slices/02-return-to-a-living-neighborhood.md`

## Status
Building

## Next
Builder implements slice 03 under dispatch d-20260908-010-impl-03.
