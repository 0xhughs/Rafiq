# BUILD.md

Slice: 09 — The kiosk speaks Arabic
Archive: slices/09-the-kiosk-speaks-arabic.md

## Goal
Make the workshop service usable through a correct interface contract and readable Arabic UI: after the appointment board is posted (`workshopQuest.servicePosted`), three new workshop stations unlock — a documented fictional API slip, a server-side vault, and a neighborhood **كiosk** whose client wrongly embeds `x-api-key` and whose Arabic chrome is LTR-broken. The player keeps the dummy secret in the vault (not on the kiosk face), demonstrates missing-key and exposure failures, then repairs RTL plus the mixed `slot-id` fragment and manually tests the kiosk lookup. Covers 4.3, 4.4.

## Done when
- AC01 — **4.3 demonstrated only.** Authored fictional contract (inspect slip): **`GET /appointments/slots`** with header name **`x-api-key`**. Share path + header name; keep the dummy value in the server vault. Dummy secret is the constant **`demo-slot-key`** (labeled وهمي — not a real key, never solicited). After `servicePosted`, the kiosk **face starts with the key embedded** (`x-api-key: demo-slot-key` visible on `data-testid="kiosk-face"`); vault starts empty. **Exposure send** (key still on the face) fails visibly and does not award. **Missing-key send** (face stripped, vault empty) fails visibly (`المفتاح غير موجود`) and does not award. **Correct send:** inspect docs + dummy in vault + face does not contain `demo-slot-key` + simulated `200` with the three posted slots. No `fetch` / live HTTP. Inspect-docs-only, vault-without-send, manager-talk-only, or robot «تم» does not award. `4.3` only after inspect docs + saw missing-key + saw exposure + vault holds dummy + face clean + successful simulated request.
- AC02 — **4.4 demonstrated only.** Kiosk chrome starts **`dir="ltr"`** so Arabic title **احجز موعد المعاينة** is LTR-broken despite page `dir="rtl"`. Mixed fragment **`slot-id: sun-pm`** (and `mon-am` / `tue-pm` for the other posted slots) is not isolated. Player must open the broken face, set layout to **RTL**, isolate `slot-id` with an LTR span, then **manually test** the intended lookup: choose a posted slot on the kiosk and see Arabic confirmation with the isolated `slot-id`. Authored checklist (not free text): العنوان من اليمين؛ مقطع `slot-id` يبقى لاتينياً؛ طلب الفترة يظهر التأكيد. Lookup while still LTR-broken fails 4.4 (`أصلح اتجاه الواجهة أولاً`). Close/skip without completing the checklist does not award. Inspect-broken-only or robot «تم» does not award. `4.4` only after observed broken LTR + RTL repair + `slot-id` LTR isolation + completed manual lookup/checklist.
- AC03 — Both ids demonstrated → manager thanks for the usable kiosk; kiosk stays wired (`kioskReady`). Evidence only adds `4.3` and `4.4`. No terminal, logs, publish, real shell, MCP, harness, or certificate. Robot still unsupported after success (may still invent English-only UI or «ضع المفتاح على الشاشة»). No 10–18 content. `servicePosted` / 4.1 / 4.2 must not award 4.3/4.4.
- AC04 — No syllabus/quiz/exam. Physical paper/kiosk UI sufficient. Dialogue choices express intent; awards require the paper/kiosk actions above.
- AC05 — Authored simulation only. No live model, no eval of player text against an LLM, no live HTTP, no real API keys. Dummy `demo-slot-key` never treated as a production secret. Names stay local.
- AC06 — Saves/journal/privacy/01–08 still work. `saveVersion` 1. After workshop success, kiosk stations become usable **without awarding 4.3/4.4**. Workshop success must not set `kioskReady`. Chrome 1366×768 and 1920×1080, `npm run dev` and `npm run preview`. Keep WORLD_POS landmarks (apartment door, dumpster, robot at `12*TILE+24` / `5*TILE+24`, shop `P`, parcel `R`, library `I`, inner `F`, newsroom `E`, festival `G`, workshop `Y`). Do not shift those cells. Street letter `Y` stays `WORLD_POS.workshopDoor`. Existing workshop letters `u` `z` `m` `j` `k` `t` `d` stay put. New interior letters must not be street `P` `E` `I` `R` `F` `D` `G` `Y`.

## Out
- Slice 10 logs/publish/terminal/frozen deploy/real shell; MCP; harness; certificate; live AI; remaining ids.
- Awarding 4.3 when the dummy is on the kiosk face, when the request never demonstrated missing-key or exposure, on inspect-only, or because the robot said done. Awarding 4.4 while chrome is still LTR, without isolating `slot-id`, or if the player skips the manual test. A second live service, real HTTP, or evaluating typed player text.

## Constraints
- Implement in `app/`. No new map and no new portal: reuse `workshop` after `workshopQuest.servicePosted`. Add three interior solids on **empty** cells, spawn cell (row 6 col 7, north of `d`) kept floor: **`q`** kiosk face beside board `k` (`#k.q......t....#`); **`a`** API docs on the brief row (`#u.z...a..m.j..#`); **`e`** vault behind the counter, not on the manager cell (col 6 row 4) — e.g. `#...........e..#` on the empty row-4 walkway. Add `q` `a` `e` to `SOLID_LETTERS`. Interactables listed only when `servicePosted` so 08’s pre-post path is unchanged. Paper/kiosk overlays: docs inspect, vault inspect, kiosk face (`mode: 'kiosk'`). Never weaken 01–08 evidence predicates. Update the 08 success assertion that currently treats `OBJECTIVES.servicePosted` as the terminal objective, and bump `data-slice` `08` → `09` in `App.tsx` plus `e2e/helpers.ts` `waitForGame`, so 01–08 e2e still pass: posting the board must not award 4.3/4.4. Arabic RTL page; kiosk face **overrides** to `dir="ltr"` while broken. WASD/arrows by `event.code`. Optional skippable explanations after awards only.

## Data / state impact
No new `MapId`. Evidence union adds `'4.3' | '4.4'`. New persistable **`kioskQuest`** (do not overload 08 `workshopQuest` predicates): `phase` `unstarted | working | ready`; `inspectedDocs`; `faceHasKey` (default true once posted); `vaultHasKey` (default false); `sawMissingKey`; `sawExposure`; `requestOk`; `openedBroken`; `layoutRtl`; `slotIdLtr`; `lookupDone`; `manualTitleRtl`; `manualSlotLtr`; `manualLookup`; `kioskReady`; `pendingExplain`. Modes: add `'kiosk'` (inspect reused for docs + vault). Inspect targets: `kiosk_docs`, `kiosk_vault`. Explain topics: `api_contract`, `arabic_rtl`. Journal events: `kiosk_opened`, `api_wired`, `kiosk_ready`. **JOURNAL_CAP 40 → 48** so 09 events do not drop `service_posted`. Hydrate missing `kioskQuest` as unstarted (`faceHasKey` false until posted, then engine treats posted+unstarted as face-leaking); drop unknown evidence keys; `saveVersion` remains 1. Portal: existing `street Y ↔ workshop d` only.

## Tests
- T01 — Vitest `evidence/09/state-tests.txt` for AC01–AC03 predicates, hydrate, `servicePosted` gate, WORLD_POS landmarks unchanged, and fail paths.
- T02 — Playwright workshop-success → kiosk success. Screenshots `evidence/09/interior.png`, `docs.png`, `vault.png`, `missing.png`, `exposed.png`, `wired.png`, `ltr.png`, `rtl.png`, `manual.png`, `success.png`.
- T03 — Retry paths; no trap: missing key → fail 4.3 then vault and resend; exposed key on face → fail 4.3 then move to vault and strip face; LTR-broken lookup → fail 4.4 then set RTL + isolate `slot-id`; skip/close manual test → no 4.4 then complete checklist + lookup.
- T04 — Viewports 1366 and 1920; `evidence/09/browser-checks.md`, `overlays.png`; kiosk face `direction` ltr-before / rtl-after; `slot-id` span `direction: ltr`; run against `npm run dev` and `npm run preview`.
- T05 — typecheck, lint, test, build; `evidence/09/project-checks.txt`.
- T06 — Keep 01–08 e2e; workshop success must not award 4.3/4.4 or set `kioskReady`. Entering `workshop` / posting the board must not itself award 4.3/4.4.
- Reviewer maps AC01–AC06 and verifies snapshot.

## Proof
Independently accepted by d-20260908-035-implrev-09.
- Approved candidate: `a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6` (187 files).
- Approved contract: `45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601`.
- Isolated checks all 0. AC01–AC06 pass.
- Evidence: `evidence/09/`.

## Review
Plan approved. Implementation not started.
Plan approval: APPROVE_PLAN by reviewer bc-5ff0ba5f-0f80-5783-b279-91d0260fbba3 on dispatch d-20260908-033-plan-09. Contract `45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601`. Snapshot `a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d`. Blockers: none.
Implementation approval: APPROVE_IMPLEMENTATION by reviewer bc-7e4a860c-43bb-5f8a-a5ee-0b9b5c07455d on dispatch d-20260908-035-implrev-09. Contract `45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601`. Snapshot `a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6`. Blockers: none.
Each result records dispatch ID, reviewer identity, verdict, contract identity, snapshot identity, evidence and criterion-specific blockers.

## Loop state
Execution mode / tool adapter: Cursor Cloud Agent coordinator with Task-spawned Builder and Reviewer subagents. Spawn = Task(generalPurpose). Send = Task resume. Wait = blocking Task completion. Stop = subagent completion; coordinator does not start a second writer in this checkout. Reviewer contexts are fresh and do not receive Builder reasoning. Mutating Reviewer checks, if needed, run on an isolated copy.
Coordinator: cloud agent bc-6380229a-c83f-493f-af1c-47e5f2b00c70 (https://cursor.com/agents/bc-6380229a-c83f-493f-af1c-47e5f2b00c70), role Coordinator, checkout /workspace on branch cursor/rafiq-ai-city-adventure-0c70
Worker / role / phase: pending launch / Builder / draft-proposal
Dispatch ID / launch state / input identity: d-20260908-036-draft-10 / pending launch / baseline:a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6
Pending result / last consumed dispatch: none / d-20260908-035-implrev-09
Snapshot capture and recheck commands / coverage / exclusions: Capture = `python3 .loop/identity.py snapshot --label <label>` from repository root. Recheck = same command; compare `.loop/snapshots/<label>.digest` and the JSON `digest` field. Contract = `python3 .loop/identity.py contract`; identity is `.loop/contract/hashes.json` field `contract`. Combined = `python3 .loop/identity.py both --label <label>`.
Coverage: `app`, `evidence`, root `package.json`/`package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `playwright.config.ts`, `vitest.config.ts`, `README.md`, `public`. Missing paths are skipped. Detect add/delete by regenerating the covered file list.
Exclusions: `.git`, `.loop`, `learnai-city-project-loop`, `node_modules`, `app/node_modules`, `app/dist`, `dist`, `coverage`, `test-results`, `playwright-report`, `.vite`, `app/.vite`. Protocol files are identified by contract hash, not candidate snapshot.
Baseline snapshot: shipped slice 08 `a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d` (168 covered files)
Contract identity: `45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601` (`.loop/contract/hashes.json`)
Candidate snapshot: `a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6` (187 files)
Rejection count: 0
Consecutive no-progress repairs: 0
Open acceptance gaps / prior failing evidence: none
Repair awaiting review: false
Review events:
- ev-001 / d-20260908-033-plan-09 / plan / APPROVE_PLAN / contract:45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601 snapshot:a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d / gaps: none / identities matched / rejection count 0 / no-progress 0
- ev-002 / d-20260908-035-implrev-09 / implementation / APPROVE_IMPLEMENTATION / contract:45f68f8987d184ba72f15970270aa506737e5bd37ec2b7efdc3123d0bfc57601 snapshot:a6c3018582acd8bf0737ff9e684ed063eeb4a9ed32a8d3362184e1af3bc248b6 / gaps: none / isolated re-run all 0 / rejection count 0 / no-progress 0
Budget limit / consumed / measurement: Not configured; no execution budget was supplied.
Blocker / resume status / resume action / recheck condition / deadline: none
Advance phase: archive written; next selected
Next slice ID / draft: 10 / pending
Prior shipped receipt: slice 09 archive `slices/09-the-kiosk-speaks-arabic.md`

## Status
Shipped

## Next
Builder draft-proposes slice 10 under dispatch d-20260908-036-draft-10. No code edits.
