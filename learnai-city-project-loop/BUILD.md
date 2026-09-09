# BUILD.md

Slice: 02 — Return to a living neighborhood
Archive: slices/02-return-to-a-living-neighborhood.md

## Goal
Continue a saved adventure reliably and navigate its shared city spaces: after the slice 01 robot checkpoint the player can walk the connected street into additional real maps, restore from a versioned local save, and use a readable Arabic journal without bricking a postponed conversation.

## Done when
- AC01 — After `encounter === 'help_accepted'` (slice 01 checkpoint), the connected outdoor street remains a real walkable map that still contains the apartment door, dumpster, robot meeting point and corner-store facade. From that street the player can (1) enter **بقالة الزاوية** through a working door into a distinct interior map `shop` (a light shell: floor, walls, a counter or closed-shelf placeholder, exit back to the street; no price tags, calculator, shelf-record inspection or topic 1.1 mastery) and (2) reach a distinct civic exterior map `library` (واجهة المكتبة). Both new spaces exist as `MapId`s in `maps.ts`, not as HUD-only labels. The street legend may grow **east or south** so slice 01 landmarks stay in place. A locked inner library door, if present, states a story reason in Arabic and points back to the store lead.
- AC02 — Doors and collisions work on `apartment`, `street`, `shop` and `library`. Each portal pair is bidirectional and drops the player on a walkable safe spawn (not inside a solid). Interaction hints appear only when an actionable portal/NPC/object is in range. After `help_accepted`, the robot companion is drawn on every of those maps using the existing follow offset (visual only; not a collision solid) and is not left stranded at the dumpster. Before `help_accepted`, shop and library portals may stay locked with a short Arabic reason and the current objective; that interaction is idempotent and does not skip the trash chore or force help. Street has more than one portal.
- AC03 — The adventure writes a **versioned** local save under key `rafiq.adventure.v1`, plus last-valid backup `rafiq.adventure.v1.prev`. Never read or write LearnAI/course keys (no `learnai*` / quiz-completion keys). Envelope includes `saveVersion: 1` and: confirmed `playerName`; `map`; validated `position`/`facing`; `trash`; `encounter`; `conversationSeen`; `checkpointReached`; `storyObjective`; `inventory` (unique item ids, including `trash_bag` while carried); NPC greeting flags; `journalEvents`; `evidence` (empty object this slice — no demonstrated curriculum ids); `robot.companion` equivalent to `help_accepted`; `endingState: 'in_progress'`; `mapsVisited`. Persist at safe checkpoints only (not every movement frame): name confirmed, trash pickup, disposal, robot postpone/agree/`help_accepted`, successful portal transit, NPC postpone/close/complete, journal “new adventure” confirm. Do not persist `nameDraft`/`nameError`, mid-bubble `dialogueNode`, or `mode: 'dialogue'` as the resume surface — conversations stay reopenable from flags.
- AC04 — Reload/refresh with a valid save **resumes** at the last checkpoint: `NameEntry` does not reappear; `data-mode` is `playing` (or journal/pause, then resumable); map, inventory, encounter, companion and objective match the save. If the stored pixel sits in a solid or off-map, snap to that map’s safe spawn. Corrupt/unreadable primary JSON loads the last valid backup, resumes from it, and shows a recoverable Arabic notice («تعذر قراءة الحفظ الأخير. أعدنا النسخة السليمة السابقة.»). If no valid save exists, fall back to slice 01 name entry without crashing. When `localStorage` throws or quota fails, play continues and a visible warning appears (testid `storage-warning`, copy: «تعذر حفظ المغامرة على هذا المتصفح. يمكنك اللعب الآن، لكن التحديث قد يعيد البداية.»). Replaying a checkpoint cannot duplicate `trash_bag`, spawn a second robot, re-grant `help_accepted`, or append duplicate NPC “first meeting” rewards; `grantItem` is a no-op if the id is already held. Journal offers **بداية جديدة** with confirmation that clears only the Rafiq keys and returns to name entry.
- AC05 — The existing دفتر / مساعدة control (HUD button, `H` / `J`) opens a journal overlay that lists (1) the current lead, (2) recent story events in Arabic (at least pickup, disposal, help accepted, neighbor greeting, shop visit, library visit — when those have happened), and (3) the movement/interact/Esc controls already shown in slice 01. Layout is RTL and readable; events do not appear as a syllabus or lesson list. Replace PauseHelp’s slice 01 note «تحديث الصفحة يعيد هذه الشريحة من البداية. لا يوجد حفظ بعد.» with save status (saved / unavailable / recovered). Keep existing testids `pause-overlay`, `help-objective`, `help-controls`, `help-button`, `resume-button` and add `journal-events` and `journal-lead`. Escape closes the journal and returns focus to the game. Update `CheckpointNote` / `OBJECTIVES.cornerStore` so they no longer claim the corner store is still closed once it is enterable.
- AC06 — At least one reusable street NPC (**الجارة** near the path between dumpster and shop/library) uses a shared NPC interaction helper (not a one-off robot-only branch). First visit: short Arabic greeting and a useful pointer to the shop and library. Postpone/close leaves `encounter`/`trash` unchanged, writes a valid save, and lets the player reopen the NPC. A later visit is an idempotent already-met line, not a second first-meeting grant. Proposed lines (adjustable for natural Arabic, meaning preserved):
  - الجارة: «صباح الخير. أنت جارنا الجديد؟»
  - اللاعب: «نعم. أبحث عن المتجر عند الزاوية.»
  - الجارة: «البقالة هناك، والمكتبة أبعد قليلاً في الشارع.»
  - خيارات: «شكراً، سأمر عليهما.» / «انتظر قليلاً. سأعود.»
  A shopkeeper greeting inside `shop` may use the same helper; it must not invent prices or start the slice 03 verification puzzle.
- AC07 — The confirmed name appears only in local UI (dialogue, name confirm, in-memory state, journal if it quotes the player) and inside the Rafiq save payload. It must not appear in `location.href`, query, hash, `document.title` (title stays the generic product name), network request URLs, or `console.log`/`info`/`debug` of game code. Markup-like names still render as text. No analytics SDK and no LearnAI remote identity write.
- AC08 — With Rafiq keys cleared, the slice 01 opening still works on a fresh session: Arabic title, name field, confirm, apartment spawn, trash chore, street, dumpster once, robot conversation, postpone/reopen, agree, unseen-local-fact beat, no lesson/exam/quiz chrome, no topic 1.1 demonstrated evidence. Playable in the Vite dev server and production preview at **1366×768** and **1920×1080**. No required sound, pixel-perfect click, timed reaction, mobile layout or production art.

## Out
- Store hallucination / price-verification puzzle, shelf-record comparison, calculator routing and topic 1.1–1.3 / 1.6 demonstrated evidence (slice 03).
- Remaining 33-topic mastery, MCP, harness, robot upgrades beyond the damaged companion, certificate PNG/PDF, live models, accounts, cloud sync, public hosting and mobile controls.
- Remaining civic interiors as puzzle spaces (library interior context-pack, newsroom, festival office, workshop, civic lab).
- Overwriting or migrating LearnAI course saves; a generic reusable engine framework; final production art.

## Constraints
- Implement in the existing Vite + React + TypeScript app under `app/`. Keep Canvas world + HTML overlays. Inspect current code before editing.
- Generalize portals, map drawing and interactable ids enough for four maps; do not relocate slice 01 apartment/dumpster/robot coordinates in a way that silently invalidates `WORLD_POS` used by `e2e/journey.spec.ts` unless those tests are updated in the same change and AC08 still passes.
- No fork of external educational games. Original placeholder art may prove this slice. Do not execute player text, call real APIs or solicit keys.
- Source topic 1.1 stays **introduced** by the slice 01 robot behavior only. Visiting the shop shell must not award demonstrated evidence. Dialogue choices still express intention; entering a map is not mastery.
- Desktop Chrome on this VM is the required browser evidence for this slice. Firefox/Edge/Safari/Windows/macOS remain RG03, not this slice.

## Data / state impact
Extend `GameState` / `SerializedTestState` (and the save envelope) with: `MapId` union `'apartment' | 'street' | 'shop' | 'library'`; `inventory: ItemId[]` (`ItemId` includes `'trash_bag'`); NPC flag for the street neighbor (`'unmet' | 'talking' | 'greeted'` or equivalent); `journalEvents` (bounded recent list, proposed cap 12); `evidence: Record<string, never>` or empty record; `mapsVisited`; `saveStatus: 'absent' | 'ok' | 'unavailable' | 'recovered'`; `endingState: 'in_progress'`. Keep slice 01 fields (`trash`, `encounter`, `conversationSeen`, `checkpointReached`, `storyObjective`, `playerName`) and keep their transitions idempotent. Restore path: boot → read `rafiq.adventure.v1` → validate version/shape/name/map/spawn → if invalid try `.prev` → hydrate `playing` at last checkpoint or `name_entry` if none. New-adventure confirm deletes only those Rafiq keys. No production database, no remote profile, no LearnAI migration.

## Tests
- T01 — Vitest: legal portal pairs and walkable spawns on all four maps; shop/library locks before `help_accepted`; companion follow flag after; inventory grant/dispose idempotence; NPC postpone/reopen without changing `encounter`; save serialize/validate/round-trip; corrupt primary → backup; missing `saveVersion` rejected; LearnAI-like keys ignored. Capture under `evidence/02/state-tests.txt`.
- T02 — Playwright journey from slice 01 checkpoint: walk/teleport-to-door into `shop` and `library`, exit back to `street`, companion present (`encounter=help_accepted` on those maps), collisions block a wall on each new map, no lesson UI. Screenshots `evidence/02/shop.png` and `evidence/02/library.png`.
- T03 — Browser save/restore: agree to help (and optionally enter shop) → reload same context → resume without name overlay; NPC postpone → reload still valid; duplicate interact does not duplicate bag/robot; inject corrupt `rafiq.adventure.v1` while `.prev` is valid → recovered notice; simulated `setItem` failure → `storage-warning` and session still playable. Screenshot `evidence/02/resume.png`.
- T04 — Journal + viewports: open دفتر at 1366×768 and 1920×1080 in **dev and preview**; current lead, `journal-events`, controls, RTL; overlay panel stays inside the viewport; long and mixed-script names readable; no `pageerror` / console `error`. Screenshot `evidence/02/journal.png`. Record browser/OS/version in `evidence/02/browser-checks.md`; missing engines explicitly untested.
- T05 — Privacy and isolation: after play, `page.url()` has no player name; `document.title` has no player name; `localStorage` has `rafiq.adventure.v1` (or documented key) and **no** `learnai*` keys; game `console` listeners do not record the name. `evidence/02/privacy-checks.txt`.
- T06 — Regression: existing `app/e2e/journey.spec.ts`, `negative.spec.ts` and `viewports.spec.ts` still pass on a fresh storage context (update selectors only if this slice renamed UI, and keep AC08). Run `npm run typecheck`, `lint`, `test`, `build`, and Playwright against preview (and dev for viewport/journey as in slice 01). `evidence/02/project-checks.txt`. Never point a test run at a production database.
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
Dispatch ID / launch state / input identity: d-20260908-005-plan-02 / pending launch / contract:b7f85a536ef8ae535e3892b6636b0a0a7cad70f3bdd2d27ae67590c14fa442d9 baseline:84a55200ef09c2d1ab29df0892a002ef291488986cc14560efa95647d94d0b1d
Pending result / last consumed dispatch: none / d-20260908-004-draft-02
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 01 `84a55200ef09c2d1ab29df0892a002ef291488986cc14560efa95647d94d0b1d` (45 covered files)
Contract identity: `b7f85a536ef8ae535e3892b6636b0a0a7cad70f3bdd2d27ae67590c14fa442d9` (`.loop/contract/hashes.json`)
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
Prior shipped receipt: slice 01 archive `slices/01-wake-up-and-meet-the-robot.md`

## Status
Proposed

## Next
Independent plan review of slice 02. Do not begin implementation before a matching APPROVE_PLAN.
