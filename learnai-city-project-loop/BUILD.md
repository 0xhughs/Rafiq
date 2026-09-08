# BUILD.md

Slice: 01 — Wake up and meet the robot
Archive: slices/01-wake-up-and-meet-the-robot.md

## Goal
A player can enter their full name and personally play the opening from waking in their apartment to agreeing to help the robot found beside the dumpster.

## Done when
- AC01 — Opening the game presents an Arabic title, a labelled full-name field and “ابدأ المغامرة”. Show the entered name for correction before starting; trim outer whitespace, preserve Arabic and mixed-script names, reject blank/overlong input with an inline message, and render input as text. Proposed bound: 2–80 Unicode characters, without an arbitrary two-word-name rule.
- AC02 — Starting places the controllable character beside their bed inside a furnished apartment. A short cue asks them to take the trash outside. Arrow keys and WASD move in the expected screen direction; walls/furniture block movement. Show the interaction key only near an actionable object.
- AC03 — The player picks up the trash bag, reaches the apartment exit and enters the adjoining street. Both locations are rendered spaces with doors and collisions. Exiting without the bag remains recoverable: the player can return; leaving alone does not complete the chore.
- AC04 — Interacting at the dumpster while carrying the bag disposes of it once and reveals the damaged robot. The player can approach and inspect it. Attempting disposal again cannot create a duplicate robot, bag or reward.
- AC05 — Short Arabic speech bubbles with explicit speaker names establish who the player is, what the robot is and why it needs help. The player's chosen name appears safely. The robot can speak but cannot answer an unseen local fact reliably. No definition quiz or lesson screen interrupts the scene.
- AC06 — The player agrees to help through dialogue. The robot changes to companion state and gives a concrete neighborhood lead; a small story objective records that lead. If the player closes or postpones the conversation, they can reopen it and agree later. The slice ends at this playable story checkpoint, with a clear note that further adventure content is still being developed.
- AC07 — Dialogue pauses world input; typing the name never moves the player, holding an interaction key never skips several bubbles, Escape closes/pauses safely, and focus returns to the game after the overlay closes. The player can reread the current objective and see controls without restarting.
- AC08 — The opening is playable from start to checkpoint in the development and production build previews at 1366×768 and 1920×1080. Arabic shaping, punctuation, a long name and a mixed Arabic/Latin name remain readable; no blocking overlay is clipped. No required sound, pixel-perfect click or timed reaction is needed.

## Out
- Store hallucination puzzle, the full city, remaining 33-topic coverage, free-text instruction puzzles and robot upgrades beyond the damaged companion state.
- Persistent save/resume, certificate issuance, live AI, account creation, cloud storage, public hosting and mobile controls.
- A generic engine framework, final character customization or a finished campaign art library.

## Constraints
- Target this coherent opening only. Use React + TypeScript with a Canvas world and accessible HTML dialogue/input overlays as the planning baseline; inspect the target checkout before choosing precise dependencies.
- No fork of the external educational games is assumed. Study the architecture references and implement original game behavior. When integrating with LearnAI, isolate the adventure entry and merge applicable repository rules; do not replace the running course or overwrite saves as an incidental change.
- Proposed art direction: a warm contemporary Arabic-speaking neighborhood, clear top-down silhouettes, a visibly damaged small robot and a restrained palette. Original placeholder art may prove this slice; final production art is a release gate.
- Proposed scene dialogue, adjustable for natural Arabic while preserving meaning:
  - Player: “سأخرج كيس القمامة، ثم أعود.”
  - Player, at the dumpster: “ما هذا؟ روبوت؟”
  - Robot: “مرحباً… من أنت؟”
  - Player: “اسمي {playerName}. هل تحتاج إلى مساعدة؟”
  - Robot: “أستطيع الكلام، لكن بعض أجزائي لا تعمل. هل تساعدني في العثور عليها؟”
  - Player: “سأساعدك. من أين نبدأ؟”
  - Robot: “لنبدأ بالمتجر عند الزاوية. ربما يعرف صاحبه أين نجد قطعة مناسبة.”
- Source topic 1.1 is introduced here through the robot's behavior; the deeper observable model-versus-source distinction is completed in slice 03. Do not prematurely award its full mastery evidence in this slice.

## Data / state impact
Introduce transient session state only: player display name; current map and safe spawn; position/facing; movement/overlay mode; trash bag state (at home/carried/disposed); encounter state (unseen/available/talking/help accepted); current dialogue node; current story objective.
Transitions must be explicit and idempotent. Refresh resets this first slice and the development preview states that limitation. Slice 02 adds the versioned persistent save and resumes from safe checkpoints. No production data migration or remote identity record is introduced.

## Tests
- T01 — Unit/state tests prove the legal chore/encounter transitions, disposal idempotence, conversation re-entry and that help acceptance requires the encounter. Capture results under evidence/01/state-tests.txt.
- T02 — Browser journey: valid name → bag → exit → dumpster → inspect → conversation → agree. Assert visible state changes and absent lesson/exam UI; retain screenshots at the apartment and robot checkpoint under evidence/01/.
- T03 — Negative interaction checks: blank/overlong names; markup-like name rendered as text; exit without bag; blocked wall; repeated held interaction; postpone/reopen dialogue; typing versus world-input focus.
- T04 — Browser render/play checks at both required viewport sizes with Arabic and mixed-script names in development and built output. Record actual browser/OS/version, console errors and results in evidence/01/browser-checks.md; missing environments are explicitly untested.
- T05 — Run the inspected project's type, build and relevant lint/test checks. In the current LearnAI source, the production build script also runs a database migration: use an isolated disposable environment or an inspected build-only preview path. Never aim a planning or test run at a production database.
- Reviewer maps AC01–AC08 to actual evidence, independently verifies the snapshot and checks that the candidate remains within this slice. Evidence paths are proposed destinations, not files already created.

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
Dispatch ID / launch state / input identity: d-20260908-001-plan-01 / pending launch / contract:4db465f5267ec9d6deda0bfce6ef8277091d3e84d1d936736a7c90e1eed0ddc2 baseline:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945
Pending result / last consumed dispatch: none
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: empty-app `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` (0 covered files) recorded at `.loop/snapshots/baseline.json`
Contract identity: `4db465f5267ec9d6deda0bfce6ef8277091d3e84d1d936736a7c90e1eed0ddc2` (`.loop/contract/hashes.json`)
Candidate snapshot: none (plan review; no implementation candidate)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events: none
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: none
Next slice ID / draft: none

## Status
Proposed

## Next
Coordinator configured tools and identities. Next: independent plan review of slice 01. Do not begin implementation or mark Not started before a matching APPROVE_PLAN.

