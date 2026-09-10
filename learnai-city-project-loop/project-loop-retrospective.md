# Project Loop retrospective (Rafiq)

**Author:** Coordinator `bc-6380229a-c83f-493f-af1c-47e5f2b00c70`  
**Date:** 10 September 2026  
**Scope:** Coordinator/builder/reviewer workflow used to implement Rafiq, not a playtest. Report only; no LOOP or application edits.

Sources: live role files, `slices/` archives, `REFERENCES.md`, `.loop/identity.py`, dispatch log. Time, token, and flake rates were not measured (no execution budget).

## Workflow version actually followed

**Fact.** `REFERENCES.md` names `project-loop-improved.zip` (SHA-256 `E7DADF57AA82F5D84785E79584612E4DFD8F9A2076D3053D172C50955C8F8DCA`) as the protocol source. Runtime order was `AGENTS.md` → `SLICES.md` → `BUILD.md` → `LOOP.md` plus `BUILDER.md` / `REVIEWER.md`. Snapshot/contract capture: `python3 .loop/identity.py`. `LOOP.md` defaults (3 rejections per slice; 2 consecutive no-progress repairs; 3 failed release reviews) were recorded and not overridden. Adapter: one Cursor Cloud Agent as Coordinator; `Task(generalPurpose)` for Builder and Reviewer; mutating checks in isolated trees under `/tmp/rafiq-review-*` and `/tmp/rafiq-release*`. `HANDOFF.md` stayed `Status: unused` and still names slice 01.

**Interpretation.** This was that ZIP’s loop bound to a Vite/React checkout, not a later unnamed pack revision.

## 1. What actually happened

**Fact.** Target: independently accept slices **01–17**, then release gates, then stop. Slice **18** stayed Later. Coordinator alone wrote protocol files and `slices/*.md`. Builder workers drafted Proposed contracts (no code) then implemented under `app/` and `evidence/`. Fresh Reviewer workers ran plan review, implementation review, and two release reviews. Coordinator recomputed hashes, archived BUILD pages, added Shipped rows, and advanced Now.

Typical sequence: draft-proposal → `APPROVE_PLAN` → Building → isolated `APPROVE_IMPLEMENTATION` → archive → next draft. Dispatch IDs ran `d-20260908-001-plan-01` through `d-20260909-074-release`.

**Slice 10.** `d-20260908-039-implrev-10` returned `CONTROL_IDENTITY_MISMATCH` after Playwright rewrote `evidence/01`–`09`. Coordinator restored git HEAD and did not increment rejection count. Second review `d-20260909-040-implrev-10` approved `4849c5ae…` (207 files). Vitest 105; Playwright 45/45.

**Release.** After 17, `d-20260909-069-release` was `HUMAN_REQUIRED` (RG02/RG03/RG04 fail). After Continue, repair **R1** shipped (`c3abdf14…`, 336 files). `d-20260909-074-release` was again `HUMAN_REQUIRED` (RG02 pass; RG03/RG04 still fail). Failed release reviews: **2 / 3**. Run status: **Human required**. PRs #1 and #2 merged by the human; that is not LOOP Complete.

**Where execution differed from the written text.** `LOOP.md` says a gate failure should set `Needs repair` and draft one repair **or** set `Human required`. The first release used one `HUMAN_REQUIRED` even though leftover opening copy and missing later-arc reload tests were in-authority; R1 waited for Continue. Slice **03** Review names `APPROVE_PLAN` on `d-20260908-009-plan-03`, but Review events list only `ev-002` (cause not reconstructed). Archives **04–17** still say “Plan approved. Implementation not started.” next to later approvals. `identity.py` claims to drop `## Release evidence`, but after 074 that section still changed the combined hash while BUILD Goal–Tests stayed `1907bbfb…` (the extractor clears `skipping` for non-Now/Later/Shipped headings; Shipped `###` catalog text is also hashed). Continuation git sometimes needed `commit-tree` because `git add`/`status` disagreed with the worktree (cwd `/tmp/rafiq-release`) — tooling, not LOOP text. `HANDOFF.md` was never used.

## 2. What helped

- **Independent Reviewer + isolated copy.** Slice 10 stopped a false Shipped on a dirty evidence tree. Later reviews restored `evidence/` after Playwright so snapshot-after matched snapshot-before.
- **Immutable archives + snapshot IDs.** After PR #1 squash-merged, continuation rebased onto `origin/main` and did not rebuild 01–09.
- **Pinned ACs and Out lists.** Arabic strings, `data-testid`s, `JOURNAL_CAP`, `data-slice`, and “do not award earlier ids” were mapped by review instead of “tests passed.”
- **No self-approve.** R1 review re-ran tsc/lint/vitest **145** and Playwright **70/70** on preview `:4700` and Vite `:4701`.
- **Release gates as a stop.** Two HUMAN_REQUIRED verdicts blocked Complete despite merged PRs.

## 3. What caused friction

**Workflow.** Four worker hops per slice plus Coordinator protocol edits. Archives for 01–17 and R1 contain **zero** `REJECT_PLAN` or `REJECT_IMPLEMENTATION`. Every recorded plan event is `APPROVE_PLAN` with “gaps: none.” Cost is unmeasured. Full Playwright on every implementation review rewrote PNG trees and caused the slice 10 identity incident; early archives (01–09) say “isolated re-run all 0” without listing counts — do not reconstruct them. Reviewers had to be told not to treat a SLICES bookkeeping hash change as a failed identity. RG03/RG04 sit on the same Complete bit as 01–17; both release reviews failed them. Complete is unreachable in this VM without a human scope decision or external evidence.

**Slice 01 AC06 vs R1.** 01 required “a clear note that further adventure content is still being developed.” Release RG04 then treated leftover «قيد التطوير» as a defect. That is a **cross-slice requirements conflict**, not a Builder miss on 01.

**Implementation difficulty (not LOOP).** Growing workshop overlays, `JOURNAL_CAP` 48→112, and helper chains such as `playToPathDone`.

**Tooling.** Port contention, `BASE_URL` leaking between previews, Playwright mutating `evidence/`, isolated copies needing their own `npm install`, and Coordinator git/index confusion.

## 4. Planning and review

**Fact.** Every archive that records a plan event shows `APPROVE_PLAN` with matching identities and blockers none. No `REJECT_PLAN`. No archive records a plan Reviewer changing Goal–Tests after dispatch.

**Interpretation.** Plan review confirmed Now/Out/invariants. It did not reopen settled choices (local saves, no live model, no civic-lab map). Whether it would catch a bad plan is untested. Draft-proposal plus Coordinator persistence likely tightened contracts *before* Reviewer saw them; that would not appear as REJECT_PLAN.

**Implementation reviews** caught a real process defect (slice 10 identity). For 01–09, 11–17, and R1, archives claim AC pass after isolated re-runs. This Coordinator did **not** re-execute those suites for this report.

**Repairs.** R1 was the only repair. Plan `d-20260909-071-plan-r1` stayed on leftover copy + unfinished path-desk reload + issued-ending reload and did not pull RG03/RG04 into R1. Implementation review did not add unrelated slices.

**Builder challenge of a wrong finding.** Not observed (no REJECT to contest). LOOP/BUILDER define no compact “appeal with evidence” artifact. Coordinator can refuse a stale control event (slice 10); that is not contesting an incorrect gap.

## 5. Testing and confidence

**Fact.** Builders wrote Vitest and Playwright under `app/` and `evidence/`. Reviewers re-ran typecheck, lint, vitest, build, and full Playwright on preview **and** Vite in isolated clones with their own `node_modules`. Listed counts: vitest 105 (10) → 140 (17) → 145 (R1); Playwright 45 → 67 → 70.

**Intended behavior.** Specs assert authored overlays, fail buttons, no syllabus UI, and `waitForGame` `data-slice`. RG01 (069/074) recorded that e2e **teleports** via `__RAFIQ_TEST__`; production still mounts that hook. That is a **pass with limits**.

**Unverified.** Edge/Firefox/Safari; Windows; macOS (RG03). Five-beginner Arabic pilot (RG04). Keyboard-only path, contrast, `prefers-reduced-motion`, sound toggle. Human play of a fresh install from `main` by this Coordinator. Flake rates.

**Misleading-pass risk.** Green Playwright can coexist with RG01 teleports and overlay mode not persisted across reload (R1 required reopen). Slice 01’s WIP copy passed 01 then failed RG04 until R1.

## 6. Retries, interruptions, completion

**Fact.** Rejection counts on shipped archives are **0**, frozen at approval. No-progress was never incremented. Slice 10’s control event was not counted as a rejection, matching LOOP. Failed release reviews **2 / 3**. Limits were clear and correctly copied into SLICES.

The workflow did not stop too early on 01–17 (archives + Shipped rows exist). It did not Complete after two HUMAN_REQUIRED releases. It did not start slice 18. It **did** delay an in-authority repair until Continue (§1).

**Interruptions.** Conversation compaction; PR #1 squash-merge during continuation (rebase onto `main`); uncommitted HUMAN_REQUIRED protocol after 069 until Continue. Recovery used archives and dispatch IDs, not `HANDOFF.md`.

**Stopping condition.** Reliable as “do not Complete/publish.” Unreliable as “fully released”: RG03 and RG04 remain.

## 7. Recommendations (by expected benefit)

1. **Split campaign acceptance from human-only gates.**  
   *Problem:* 069/074 cannot Complete in this VM; mixed failures became one stop.  
   *Change:* Allow `Finalizing: campaign accepted; release incomplete` when only RG03/RG04 remain; auto-draft RG02-class repairs. Keep `Complete` for full RG.  
   *Tradeoff:* campaign-accepted may be treated as shippable without a pilot.  
   *Test:* a same-VM run reaches that named status without a fake RG03 pass, and drafts R1-class repairs without Continue.

2. **Exclude Playwright PNG bytes from candidate identity, or restore them before snapshot.**  
   *Problem:* slice 10 mismatch; every review rewrites `evidence/**/*.png`.  
   *Change:* exclude those PNGs **or** require `git checkout -- evidence` before snapshot.  
   *Tradeoff:* screenshots can rot unseen. Keep a small named set or hash non-PNG evidence.  
   *Test:* regenerated PNGs do not fail identity if code and `.txt` match.

3. **Make contract identity match the documented extract.**  
   *Problem:* Release-evidence and Shipped archive fields changed combined hash.  
   *Change:* Fix `extract_slices_contract` so run status / Release evidence never enter the hash; hash mapped Goal–Tests, not Shipped receipts. Add a fixture.  
   *Tradeoff:* none if that was the written intent.  
   *Test:* edit only Release evidence; combined hash unchanged.

4. **Skip a full plan-review worker when the draft is a mechanical next slice.**  
   *Problem:* 17+ plans all APPROVE_PLAN with no recorded blockers.  
   *Change:* Keep plan review for the first slice, Goal–Tests changes, and repairs. If Now already exists and the draft matches it, skip the extra hop (still require impl review).  
   *Tradeoff:* a bad draft could reach Building. Keep impl review and Out lists.  
   *Test:* count plan-review verdicts that change Goal–Tests; if still ~0, skip is cheaper.

5. **One restore helper for isolated Playwright.**  
   *Problem:* duplicated “checkout evidence 01–NN; rm test-results” in every review prompt.  
   *Change:* a single script the Reviewer invokes; do not add agents.  
   *Tradeoff:* another file.  
   *Test:* a slice-10-style PNG rewrite leaves snapshot-after == before.

**Preserve:** no self-approve; isolated copies with their own install; Out/AC strings; Shipped ≠ publish; slice 18 outside; control events ≠ rejections; freeze counters on approval.

**Simplify/remove:** unused `HANDOFF.md` until a real handoff; leftover “Implementation not started” on shipped receipts (04–17). Do not add more agents.

## Judgment

**Make targeted improvements; do not redesign.** The loop produced a complete 01–17 campaign plus a focused R1 repair, with independent hashes and an honest Human-required stop. Isolated implementation review and identity mismatch handling paid for themselves. Universal plan reviews with no rejections, screenshot-in-identity, and putting VM-impossible RG03/RG04 on the same Complete bit as the campaign did not. Fix those; keep the roles.
