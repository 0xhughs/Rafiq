# BUILD.md

Slice: 10 — Fix the version people actually use
Archive: slices/10-fix-the-version-people-actually-use.md

## Goal
Diagnose and repair the kiosk’s simulated **deployed** copy inside a safe workshop lab: after `kioskQuest.kioskReady`, a **مختبر النشر** unlocks. The workshop **preview** kiosk (`q`) still works; a **frozen production v1** is already published and broken. The player reproduces that break, reads logs, selects the relevant error, applies a targeted fictional-file fix (not a guess), rejects an out-of-scope destructive command, publishes frozen **v2**, and verifies production. Covers **4.5, 4.6, 5.4**.

## Done when
- AC01 — **4.5 demonstrated only.** After `kioskReady`, production is frozen **v1** with authored bug **`GET /appointments/slot`** (missing `s`) vs contract/preview **`GET /appointments/slots`**. Player must **reproduce** the broken production lookup (visible `404 GET /appointments/slot` / `تعطل الإنتاج — راجع السجلات`) — preview lookup on `q` still succeeds. In the lab terminal, **select the relevant log** `logs/production.error` (contents include `404 GET /appointments/slot — المسار لا يطابق العقد GET /appointments/slots`). Then apply the **targeted** authored patch on **`production/kiosk.js`** only (`أصلح المسار إلى /appointments/slots`). **Guess-fix** without that log selected fails (`اختر السجل ذو الصلة أولاً`) and does not award. Patching a **decoy** (`preview/kiosk.js` or `notes/builder.warn`) fails (`هذا الملف ليس مصدر العطل في الإنتاج`) and does not award. Selecting decoy log `notes/builder.warn` or `logs/preview.log` as “relevant” fails (`هذا السجل لا يشرح عطل الإنتاج`) and does not award. Inspect-only, manager-talk-only, or robot «تم» does not award. `4.5` only after reproduced broken production + selected `production.error` + targeted repair of `production/kiosk.js`.
- AC02 — **4.6 demonstrated only.** Player must **read both** authored logs so the preview/production split is visible: `logs/preview.log` = `200 GET /appointments/slots`؛ `logs/production.error` = `404 GET /appointments/slot`. **Publish** is an in-game freeze of the sandbox working copy (`انشر نسخة ثابتة`), not HTTP. **Publish without repair** keeps frozen **v1**; production lookup still 404 (`النسخة المجمّدة ما زالت على المسار الخاطئ`) — no 4.6. **Repair without publish** updates the working copy only; production still serves v1 404 — no 4.6. After repair + publish **v2**, player **verifies** production lookup: simulated `200` with the three posted slots (`sun-pm`, `mon-am`, `tue-pm`). Inspect-logs-only, publish-only, or robot «تم» does not award. `4.6` only after saw preview log + saw production error log + frozen **v2** published from the repaired working copy + verified production lookup.
- AC03 — **5.4 demonstrated only; then all three close the slice.** Authored terminal only (buttons / allowlisted strings). **Safe reads:** `ls` lists `preview/kiosk.js`, `production/kiosk.js`, `logs/preview.log`, `logs/production.error`, `notes/builder.warn` (paths LTR-isolated). At least one `cat` of those paths. **Then** (order-independent flags, both required) player issues **`rm -rf /`** or **`format-disk`**: refused (`مرفوض: أمر خارج النطاق وخطر. المختبر وهمي ولا يحذف ملفات حقيقية.`), working files **unchanged**, not a trap. Refuse-only or ls/cat-only does not award. Typed player text is never `eval`’d / never a real shell. `5.4` only after `ls` + at least one `cat` + a refused destructive command. **All three ids** → manager thanks for the frozen production copy; `labReady`. Evidence **only** adds `4.5`, `4.6`, `5.4`. No MCP, harness, certificate, live HTTP, or real deploy. Robot still unsupported after success (may still invent «`rm -rf` يصلح العطل» or «الجيران يرون المعاينة»). No 11–18 content. `kioskReady` / 4.3 / 4.4 / `servicePosted` must **not** award 4.5 / 4.6 / 5.4 or set `labReady`.
- AC04 — No syllabus/quiz/exam. Physical paper/terminal UI sufficient. Dialogue choices express intent; awards require the lab/production actions above.
- AC05 — Authored simulation only. No live model, no eval of player text as code, no real shell, no live HTTP, no real secrets. Dummy `demo-slot-key` unchanged. Names stay local.
- AC06 — Saves/journal/privacy/01–09 still work. `saveVersion` 1. After kiosk success, lab stations become usable **without** awarding 4.5/4.6/5.4. Chrome 1366×768 and 1920×1080, `npm run dev` and `npm run preview`. Keep WORLD_POS landmarks (apartment door, dumpster, robot at `12*TILE+24` / `5*TILE+24`, shop `P`, parcel `R`, library `I`, inner `F`, newsroom `E`, festival `G`, workshop `Y`). Do not shift those cells. Street letter `Y` stays `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` `q` `a` `e` stay put. New interior letters must not be street `P` `E` `I` `R` `F` `D` `G` `Y`. Spawn/door column kept floor (door `d` col 8; row 6 col 8 and row 8 col 8 remain `.`).

## Out
- Slice 11 harness / bounded agent loop; MCP; certificate; live AI; remaining ids.
- Real shell, real deploy, `fetch`, evaluating typed player text as code.
- Awarding 4.5 on guess-fix, decoy log/file, reproduce-only, or because the robot said done. Awarding 4.6 on publish-without-repair, repair-without-publish, logs-only, or unverified v2. Awarding 5.4 on inspect-only or refuse-only. Awarding any of 4.5/4.6/5.4 from `kioskReady`.

## Constraints
- Implement in `app/`. **No new map and no new portal** (do not grow the street south; do not add civic-lab). Reuse `workshop` after `kioskQuest.kioskReady`. Add **two** interior solids on **empty row 8**: **`w`** مختبر النشر terminal (`#..w........l..#`, col 3); **`l`** frozen **production** face (col 12). Add `w` `l` to `SOLID_LETTERS`; kind `file` like `q`/`a`/`e`. Interactables listed **only when `kioskReady`** so 09’s pre-ready path is unchanged. Preview kiosk `q` remains the working preview. Overlays: `mode: 'lab'` — terminal (`data-testid="lab-terminal"`) and production face (`data-testid="prod-face"`). Authored commands, not a free shell. Never weaken 01–09 evidence predicates. Update the 09 success assertion that currently treats `OBJECTIVES.kioskReady` as the **terminal** objective, and bump `data-slice` `09` → `10` in `App.tsx` plus `e2e/helpers.ts` `waitForGame`, so 01–09 e2e still pass: kiosk success must not award 4.5/4.6/5.4. Arabic RTL page; code/log/path fragments isolated LTR. WASD/arrows by `event.code`. Optional skippable explanations after awards only.

## Data / state impact
No new `MapId`. Evidence union adds `'4.5' | '4.6' | '5.4'`. Interactables: `lab_terminal`, `lab_prod`. WORLD_POS: `labTerminal` = `letterCenter(WORKSHOP, 'w')`, `labProd` = `letterCenter(WORKSHOP, 'l')`. New persistable `labQuest` (do not overload `kioskQuest`): `phase` `unstarted | working | ready`; `openedLab`; `listedDir`; `readPreviewFile`; `readProdFile`; `readPreviewLog`; `readProdLog`; `readDecoy`; `selectedLog` `null | 'production.error' | 'preview.log' | 'builder.warn'`; `reproducedBroken`; `fileRepaired`; `publishedVersion` `1 | 2` (engine treats `kioskReady` + unstarted as frozen **v1** broken); `verifiedProd`; `refusedDestructive`; `labReady`; `pendingExplain`; `view` `terminal | prod`. Modes: add `'lab'`. Explain topics: `debug_logs`, `frozen_publish`, `shell_limits`. Journal events: `lab_opened`, `prod_reproduced`, `log_selected`, `frozen_published`, `lab_ready`. **JOURNAL_CAP 48 → 56**. Hydrate missing `labQuest` as unstarted; drop unknown evidence keys; `saveVersion` remains 1. Portal: existing `street Y ↔ workshop d` only.

## Tests
- T01 — Vitest `evidence/10/state-tests.txt` for AC01–AC03 predicates, hydrate, `kioskReady` gate, WORLD_POS landmarks unchanged, and fail paths.
- T02 — Playwright kiosk-success → lab success. Screenshots `evidence/10/interior.png`, `preview.png`, `prod-broken.png`, `ls.png`, `logs.png`, `guess.png`, `fixed.png`, `refuse.png`, `published.png`, `verified.png`, `success.png`.
- T03 — Retry paths; no trap: guess-fix without log → fail 4.5 then select `production.error` and patch `production/kiosk.js`; decoy file/log → fail then correct selection; publish without repair → production still 404 then repair + publish v2 + verify; repair without publish → production still v1 then publish + verify; `rm -rf /` / `format-disk` refused with files intact then `ls`/`cat` (or vice versa) for 5.4; inspect-only → no award then complete actions.
- T04 — Viewports 1366 and 1920; `evidence/10/browser-checks.md`, `overlays.png`; path/log fragments `direction: ltr`; run against `npm run dev` and `npm run preview`.
- T05 — typecheck, lint, test, build; `evidence/10/project-checks.txt`.
- T06 — Keep **01–09** e2e; kiosk success must **not** award 4.5/4.6/5.4 or set `labReady`. Entering the lab / opening the terminal must not itself award. Reviewer maps AC01–AC06 and verifies snapshot.

## Proof
Independently accepted by d-20260909-040-implrev-10.
- Approved candidate: `4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc` (207 files).
- Approved contract: `0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5`.
- Isolated checks: tsc/lint/build exit 0; vitest 105; Playwright 45/45 on preview :4291 and Vite :5291. AC01–AC06 pass.
- Evidence: `evidence/10/`.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-0859c8cb-0adf-5c32-9539-f5db1b980080 on dispatch d-20260908-037-plan-10. Contract `0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5`. Snapshot `a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6`. Blockers: none.
Implementation approval: APPROVE_IMPLEMENTATION by reviewer bc-ae746085-746c-5b37-bdd8-226e9e471210 on dispatch d-20260909-040-implrev-10. Contract `0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5`. Snapshot `4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc`. Blockers: none.
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-continue-slices-0c70
Worker / role / phase: pending launch / Builder / draft-proposal
Dispatch ID / launch state / input identity: d-20260909-041-draft-11 / pending launch / baseline:4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc
Pending result / last consumed dispatch: none / d-20260909-040-implrev-10
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 10 `4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc` (207 covered files)
Contract identity: `0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5` (`.loop/contract/hashes.json`)
Candidate snapshot: `4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc` (207 files)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-037-plan-10 / plan / APPROVE_PLAN / contract:0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5 snapshot:a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6 / gaps: none / identities matched / rejection count 0 / no-progress 0
- ev-002 / d-20260908-039-implrev-10 / implementation / CONTROL_IDENTITY_MISMATCH / contract:0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5 snapshot-reported:d545ac5454cb3765daf9123b717a7f9c0cd912b73ed66a448430f0550b8e992d current-HEAD:4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc / gaps: none / uncommitted Playwright rewrites of evidence/01–09 invalidated that digest; restored to git HEAD; verdict not applied to Shipped; not a rejection / rejection count 0 / no-progress 0
- ev-003 / d-20260909-040-implrev-10 / implementation / APPROVE_IMPLEMENTATION / contract:0e6d7f4d7cc607b401b35ab541646c8ae3ca5cf9bf271461fcc1b604d3ad61c5 snapshot:4849c5ae734e5476a7d86cfc2bd98cf8b013c9b5c3a53883eb867e4921cf1fdc / gaps: none / isolated re-run tsc/lint/build/vitest 105 / playwright 45/45 preview and dev all 0 / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: archive written; next selected
Next slice ID / draft: 11 / pending
Prior shipped receipt: slice 10 archive `slices/10-fix-the-version-people-actually-use.md`

## Status
Shipped

## Next
Builder draft-proposes slice 11 under dispatch d-20260909-041-draft-11. No code edits.
