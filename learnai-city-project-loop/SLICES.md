# SLICES.md

## Product
Working title: **Rafiq — Passport to AI City / رفيق — جواز إلى مدينة الذكاء الاصطناعي**. This is an Arabic-first browser adventure for people new to AI. The player enters their full name, wakes in an apartment, takes out the trash and finds a damaged robot beside a dumpster. Helping it recover useful parts draws the player into a connected neighborhood. The robot offers hints, makes believable mistakes and gradually gains context, tools, skills and supervised agency. The player learns by investigating, instructing, testing and deciding. At the end, the restored robot thanks the player and presents a downloadable certificate as a passport to AI City.

Current release boundary: one complete desktop/laptop campaign from the apartment through all 34 mapped source outcomes, explicit MCP and harness experiences, the final agent transformation and certificate download. A small playable opening is the first implementation slice, not a substitute for this full release.

## Users
Arabic-speaking AI beginners, including people without programming or game experience. No account, email address, external AI subscription or technical setup is required to play the baseline release. The protagonist follows the user's boy-and-robot concept; the player's name is independent of avatar appearance.

## Product principles
- Exploration, relationships and useful city work drive progression. Do not display lesson numbers or turn 34 topics into 34 rooms.
- Core loop: explore → encounter a problem → try an action → observe the result → revise or verify → help someone → gain a robot capability or story access.
- The city stays connected and revisitable. Locations recur with new problems as abilities change. A locked destination explains its story reason and offers a useful next lead.
- Keep dialogue brief, conversational and in clear Arabic. Put terms into context after the player experiences them; optional explanations can be reread without becoming mandatory reading gates.
- Mistakes create recoverable consequences and specific feedback. A hint points toward evidence or an action; it does not silently complete the task.
- Show progress through the robot's visible restoration, new usable abilities and changed relationships. A story journal contains current leads; internal curriculum coverage is not a player-facing syllabus.
- Game completion demonstrates practiced actions, not comprehensive professional mastery. The certificate remains an educational completion certificate, without official-accreditation claims.

## Planning baseline and city structure
These are explicit design proposals chosen to make the pack usable. They can be changed through plan review without pretending the user previously selected them.
- Platform: a 2D top-down Canvas world with React/TypeScript overlays. Keep map, dialogue, inventory, quest rules, source evidence and save data separate from rendering. Exact packages and renderer details remain reversible choices after checkout inspection.
- Arabic UI uses RTL layout with isolated LTR technical fragments. Arrow keys work on Arabic keyboards; WASD is an additional physical-key option. Interact, journal and pause have visible Arabic labels.
- Baseline robot responses and tools are authored simulations. Evidence and task success are deterministic. Natural-language puzzles accept meaning-preserving Arabic variants within a declared task domain, show what the robot understood and request clarification on unsupported phrasing; no exact hidden “magic prompt” string.
- No live model is required for the planned release. Teach MCP, browser work, terminal actions and harness limits with safe fictional systems. This is simulation of AI use, not a claim that a real model is running. A real-model mode would require a separately authorized scope change and is not implied future work.
- Save locally at safe quest/dialogue checkpoints under a new versioned key. Store identity, map/spawn, inventory, quest flags, evidence records, robot capabilities and ending state. Validate restores, keep the last valid save on failure, warn when saving is unavailable, and never award duplicate upgrades on replay. No promise of cross-device recovery.
- Suggested world route: apartment ↔ dumpster/street ↔ corner store. The same streets connect a library, community newsroom, festival office, repair workshop and civic technology lab. These are proposed settings, not real businesses or integrations.
- Story arcs: help the found robot obtain a repair lead; gather trustworthy repair information; help neighbors to obtain parts and access; make a small useful city service; teach the robot to work within permissions; coordinate a final city task; receive the passport. No combat, leaderboard, classroom administration or 3D city is required.
- Robot capability arc: damaged conversational unit → better instructions and verification habits → context pack → tools/connector interface → reusable skills and routines → bounded planning and human approval → supervised agent. Cosmetic repair never removes hallucination risk.
- Reference projects inform design; they do not replace this product. See REFERENCES.md for the eight related game repositories, corrected LearnAI source, historical wrong-repo pointer and per-source reuse decisions.

## Loop target
Authorized target for this run: complete and independently accept slices **01–17**, then satisfy the release gates below and stop.
Current authorization: On 8 September 2026 the user asked to read the project files, start the loop, and complete each loop until the full website is fully built. That request adopts slices 01–17. Slice 18 remains outside the target. This checkout (`github.com/0xhughs/Rafiq`) is the implementation repository. The adventure is a separate Vite + React + TypeScript app under `app/`; joufbot/LearnAI is curriculum/reference only and is not modified.

## Run status
Running

## Open decisions
- Product name, robot name and final art treatment: working title and visual baseline are provisional; settle before production-art approval. They do not block the opening prototype.
- Exact intended age range and reading level: beginners are specified, ages are not. Use clear Arabic without adult-only assumptions; resolve before broad user testing.
- Runtime destination: resolved 8 September 2026 under existing authority. Implement in this Rafiq checkout as `app/`. Do not integrate into joufbot/LearnAI. Do not replace any running LearnAI course.
- Optional legacy services: public certificate verification, a locked server-side name registry and remote analytics exist in LearnAI, but are not requirements in the user's game concept. Baseline v1 uses local saves and local certificate downloads. Any retained public registry or new personal-data collection needs an explicit product decision before that service is implemented.
- Browser release matrix proposed: current stable Chrome and Edge on Windows, Firefox on Windows, and Safari on macOS, with tested versions recorded at release. If a test environment is unavailable, retain the untested gap or obtain an explicit release-scope decision; do not claim support from code inspection alone.

## Release gates
- RG01 — Complete a fresh-player journey from full-name entry to certificate through normal gameplay, with no developer skips, legacy quizzes or hidden prerequisites. Independently verify all 34 evidence records plus MCP and harness coverage.
- RG02 — Resume the campaign at each major arc, including interrupted dialogue, an unfinished puzzle and the ending. Corrupt/old saves and denied browser storage produce a clear recoverable outcome. No duplicate item, upgrade, progression credit or premature certificate.
- RG03 — Every planned browser in the resolved matrix passes the full critical path and Arabic text/input/export checks at 1366×768 and 1920×1080. Verify keyboard-only operation, visible focus, pause, readable contrast, reduced motion and optional sound. Record real environments and limitations.
- RG04 — Final art and Arabic writing form a coherent game: distinguish player/robot/NPC silhouettes, visible walkable paths, consistent scale and palette, expressive robot changes, readable dialogue and no untranslated scaffolding. At least five representative Arabic-speaking beginners should test the proposed usability milestone; at least four should finish the opening without facilitator navigation and independently verify a fresh unsupported robot claim later. Record observed failures and repairs; this small pilot is a usability gate, not proof of long-term educational effectiveness.
- RG05 — All required learning behaviors are executable and meaningfully different: evidence inspection, instruction revision, context selection, output correction, constrained tool use and human decisions. No “press Next to earn mastery.” Technical concepts receive factual review; maintain the distinctions below.
- RG06 — The scoped production artifact builds and loads without a blocking error, accidental database migration against production, real secrets, external game actions or personal-name telemetry. Save and download failures are handled; no live-model availability/cost dependency. Record asset/code provenance before adopting third-party material.
- RG07 — Certificate is inaccessible before earned completion; after completion the correct confirmed name appears legibly in downloadable PNG and PDF, including long Arabic and mixed-script names. The download contains the educational-completion wording, campaign version and completion date; no fabricated examination percentage or misleading public verification mark.
- RG08 — LOOP finalization independently verifies accepted archives, current identities, an empty Now section, preserved outside-target work and no unresolved blockers. “Complete” is acceptance of the implementation target, not publication permission.

## Release evidence
Pending finalization.
Failed release reviews for this target: 0
Pending release result: none
Release review events / last consumed dispatch: none
No game build, playtest, independent plan review or release review has occurred in preparing this pack.

## Curriculum translation
The 34 IDs and Arabic titles below are taken from the actual [LearnAI curriculum](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/lib/curriculum.ts). The corresponding 34 Markdown lesson files were retrieved; their topics and teaching/exercise sections informed this map. This is a redesigned learning plan, not endorsement of every claim or product-specific statement in those lessons.

Each row names the **primary earning action** and slice that owns its evidence. Later missions revisit earlier skills. For every concept, authored quest content must define an observable evidence predicate and a retry/hint path before its slice is approved. Introduced, practiced and demonstrated are distinct internal states. Completion requires demonstrated evidence; assistance is recorded separately and followed by a fresh transfer action when a hint reveals the solution.

| Source ID / title | In-world action and evidence of understanding | Primary slice |
|---|---|---|
| 1.1 — ما النموذج اللغوي وما ليس هو | At the store, compare the robot's fluent description with a real shelf record; use the source for the unseen fact. Introduced in the opening. | 03 |
| 1.2 — ماذا يحسن وماذا يفشل | Let the robot rewrite a shop notice, then route an exact total to the calculator and a current fact to a source. | 03 |
| 1.3 — الهلوسة والتحقق من المصادر | Catch the robot's invented price, inspect the shelf evidence, correct the transaction and verify a second claim without being told where. | 03 |
| 1.4 — السياق والذاكرة المؤقتة وحدود النافذة | Restore a lost delivery constraint by selecting the relevant note for a limited context pack; distinguish it from a persistent journal entry. | 05 |
| 1.5 — الخصوصية: لا تُدخل أسراراً أو بيانات أشخاص | Redact names and private fields from a fictional community file before giving the robot the needed facts. | 05 |
| 1.6 — اختيار الأداة المناسبة للمهمة | Complete different store errands with writing, lookup, calculation or a human decision, based on the task's needs. | 03 |
| 2.1 — تفويض المهمة: ماذا تطلب وماذا تُبقي لك | Delegate retrieval of a repair parcel while keeping purchase approval with the player; stop an overbroad attempt. | 04 |
| 2.2 — وصف المطلوب: الدور والقيود وشكل الناتج | Write instructions specifying the parcel, location, constraints and return format; the robot retrieves the intended item. | 04 |
| 2.3 — التمحيص: كيف تراجع جواباً قبل استخدامه | Inspect an attractive draft against its source, mark a concrete mismatch and correct it before release. | 06 |
| 2.4 — التحسين على جولات بدل أمر واحد سحري | Observe an ambiguous instruction fail, revise only the missing information, and succeed on a new parcel. | 04 |
| 2.5 — الملفات والمشاريع والسياق الطويل | Assemble the relevant specification and delivery file into a named context pack; exclude irrelevant documents. | 05 |
| 2.6 — أسلوبك: اجعل الناتج يشبه كتابتك | Give a sample of an NPC's writing and revise the robot's notice to match its voice without changing facts. | 06 |
| 3.1 — تلخيص ومقارنة مصادر | Produce a short comparison from two supplied sources, preserving disagreement and attaching supporting passages. | 06 |
| 3.2 — صياغة خطابات وتقارير | Assemble a usable repair-request letter with recipient, purpose, tone and length, then review its draft. | 06 |
| 3.3 — بحث أولي ثم تحقق بشري | Follow a candidate source in the fictional archive, find the original document and verify the claim before citing it. | 06 |
| 3.4 — جداول وبيانات صغيرة بدون اختراع أرقام | Reconcile a festival stock table with receipts, compute a supported total and leave a missing value explicitly unknown. | 07 |
| 3.5 — الاستخدام المسؤول في الدراسة والعمل | Prepare a permitted community submission, disclose AI assistance where the fictional policy requires it and retain the human's work. | 07 |
| 4.1 — من فكرة إلى تطبيق صغير | Choose one user need and build a tiny functioning in-game service prototype; leave unrelated requests out of scope. | 08 |
| 4.2 — وصف المنتج للوكيل الباني | Give the workshop builder a brief with screens, constraints, exclusions and observable acceptance; use that contract to inspect its result. | 08 |
| 4.3 — ماذا تشارك من الواجهة والمفتاح وماذا تبقي | Wire a fictional documented API request while keeping its dummy secret in the server-side vault; demonstrate the missing-key and exposure cases. | 09 |
| 4.4 — واجهة عربية واتجاه اليمين واختبار يدوي | Repair a small Arabic kiosk's RTL flow and mixed-direction text, then manually test its intended interaction. | 09 |
| 4.5 — إصلاح الأخطاء بالتيرمنال والسجلات | Reproduce a broken workshop service, select the relevant error log and apply a targeted fix instead of guessing. | 10 |
| 4.6 — نشر نسخة ثابتة وقراءة ما تعطل | Publish a frozen version inside the game sandbox, detect a preview/production difference from logs and verify the repaired version. | 10 |
| 5.1 — الفرق بين دردشة ووكيل ينفّذ | Move from a suggested plan to observed tool actions and verified changes under a bounded agent loop. | 11 |
| 5.2 — اكتب للوكيل هدفاً وأدوات ومعيار توقف | Set a goal, allowed tools, success test and stop condition; demonstrate both successful stopping and stopping for missing information. | 11 |
| 5.3 — العمل عبر التطبيقات والمتصفح بتفويض واضح | Complete a civic lookup and save a draft through a named connector or browser surface, restricted to specified fictional records. | 12 |
| 5.4 — التيرمنال أوامر وملفات وحدود الخطر | Inspect a fictional working directory with safe read commands, then reject an out-of-scope destructive command. | 10 |
| 5.5 — المهارة والتعليمات الدائمة مقابل الأمر الواحد | Turn a corrected workflow into a reusable skill with trigger, inputs, steps, output and stop rules; test it on a second case. | 13 |
| 5.6 — الروتينات والمهام المتكررة | Schedule the tested skill on the in-game clock, observe its trigger, then pause it and verify it no longer runs. | 13 |
| 5.7 — الموافقة البشرية قبل أفعال لا تُرجع | Prepare a specific consequential action, inspect its recipient/payload, reject one attempt and approve only the corrected action. | 14 |
| 6.1 — تقييم الناتج ومعايير الجودة | Evaluate a city output for accuracy, source support, tone, completeness and risk; repair failed criteria before acceptance. | 15 |
| 6.2 — العمل مع أكثر من وكيل دون فوضى | Assign researcher, builder and reviewer roles with one output owner; resolve a conflicting draft and verify the approved version. | 15 |
| 6.3 — ماذا لا تؤتمت | Route a fictional high-stakes personal decision to a responsible human; let the robot prepare context without making the final decision. | 14 |
| 6.4 — مراجعة المسار والاستعداد للاختبار النهائي | Complete a new integrated city task using verification, a constrained plan, tools, reusable work and human approval; no timed examination. | 16 |

### Additional named concepts and accuracy constraints
- **MCP (interpreting the spoken “MCB” as Model Context Protocol):** slice 12 lets the player connect the robot's application to a fictional server, inspect its tools/resources, grant limited access and handle a denied or missing capability. Evidence requires a successful bounded lookup and refusal of an unsupported action. MCP connects applications to capabilities; it is not a skill cartridge and does not grant blanket authority. See the official source in REFERENCES.md.
- **Harness:** slice 11 introduces the surrounding runner that supplies context, exposes tools, checks permissions, records steps and enforces stop/retry limits. The player configures these limits and watches an attempted extra step stop. This is a broad engineering term, not one universal protocol or a compulsory physical component.
- **Memory:** temporary context and separately stored notes differ; saving a note does not mean every future response includes it. Tools, context and memory can improve a response without guaranteeing correctness.
- **Agent:** present goal-directed observation/action/review within a controlled environment. A single tool call, persistence or a particular product name alone does not define agency. “Fully restored” means ready to work under supervision, not sentience or infallibility.
- Existing lesson 6.4's review intent is preserved as a capstone. Its legacy 25-question/25-minute exam and percentage thresholds are deliberately replaced by game evidence under the user's new concept.

## Shipped
### 01 Wake up and meet the robot
Goal: Play the complete opening and choose to help the robot.
Provides:
- Full-name start, controllable apartment/street, trash chore, robot encounter and short Arabic dialogue.
- A coherent first story checkpoint with the next neighborhood lead.
Depends on: none
Target membership: inside
Out: persistent saves, store puzzle, full campaign, live AI and certificate.
Archive: `slices/01-wake-up-and-meet-the-robot.md`
Approved contract: `4db465f5267ec9d6deda0bfce6ef8277091d3e84d1d936736a7c90e1eed0ddc2`
Approved candidate: `84a55200ef09c2d1ab29df0892a002ef291488986cc14560efa95647d94d0b1d`
Implementation approval dispatch: `d-20260908-003-implrev-01`

### 02 Return to a living neighborhood
Goal: Continue a saved adventure reliably and navigate its shared city spaces.
Provides:
- Versioned save/restore, safe spawns, inventory, quest/evidence state and a readable journal with recoverable failed saves.
- Reusable NPC interactions, doors, companion presence and idempotent story gates; original course saves remain separate.
Depends on: 01
Target membership: inside
Archive: `slices/02-return-to-a-living-neighborhood.md`
Approved contract: `b7f85a536ef8ae535e3892b6636b0a0a7cad70f3bdd2d27ae67590c14fa442d9`
Approved candidate: `f1feab0147e6f41f01c86f58a8d05e136cce7c84a706e1508b3d8bfcb424eb4f`
Implementation approval dispatch: `d-20260908-007-implrev-02`

### 03 The price that was never checked
Goal: Help the shopkeeper using supported information instead of the robot's confidence.
Provides:
- A fabricated price with inspectable contradictory evidence, a second transfer problem, and task-appropriate writing/lookup/calculation choices.
- A repair lead and verification habit; the robot can still make unsupported claims later. Covers 1.1, 1.2, 1.3, 1.6.
Depends on: 02
Target membership: inside
Archive: `slices/03-the-price-that-was-never-checked.md`
Approved contract: `a609b8b90a350d89b672c4a997de338b496688cb8440d5428e23518b304ee8ca`
Approved candidate: `92f284d762df78170e148633ff3eb9e82626225306a9b4807463de7380c89257`
Implementation approval dispatch: `d-20260908-011-implrev-03`

### 04 The wrong parcel
Goal: Guide the robot to retrieve the intended repair component through clear, revisable instructions.
Provides:
- A constrained Arabic instruction interaction, observable ambiguity/failure, clarification and a fresh successful retrieval.
- Player-retained purchase approval and a visible communication repair. Covers 2.1, 2.2, 2.4.
Depends on: 03
Target membership: inside
Archive: `slices/04-the-wrong-parcel.md`
Approved contract: `14ded8bd2eba6ee19c51093e7a790df7feb1bec1ce8718d1a15d7104d4a4e63d`
Approved candidate: `7cba3a83b9f8733ca19d79f67624b3b477a53b9819a90e009d2c923ae719695f`
Implementation approval dispatch: `d-20260908-015-implrev-04`

### 05 A place for the right memories
Goal: Carry the relevant information forward without sharing private data.
Provides:
- Library context-pack puzzle, context overflow/reselection, persistent notes and a fictional-file redaction task.
- A visible context module and renewed access to a repair specification. Covers 1.4, 1.5, 2.5.
Depends on: 04
Target membership: inside
Archive: `slices/05-a-place-for-the-right-memories.md`
Approved contract: `4e7db2744f2ffb8738c9dcd015e207bef0313ef2df5e40618018f4451ed3b45a`
Approved candidate: `158b856de69c486c49559dc92c27ab91a1822a0e132aba2d003448de648d0a8d`
Implementation approval dispatch: `d-20260908-019-implrev-05`

### 06 A notice the neighborhood can trust
Goal: Produce a useful, sourced community notice and repair-request draft.
Provides:
- Source comparison, original-document lookup, targeted review and controlled writing-style adaptation across one newsroom story.
- A reviewed notice/request that changes an NPC response and opens the workshop lead. Covers 2.3, 2.6, 3.1, 3.2, 3.3.
Depends on: 05
Target membership: inside
Archive: `slices/06-a-notice-the-neighborhood-can-trust.md`
Approved contract: `a192c6eca98845b4ee79ec30489bd0d17c2f1d89f829c344f8c44b173410a8b2`
Approved candidate: `51ee56d805700a58f3377f812c7ed404b861844bed62ca4ede71ba30f150c957`
Implementation approval dispatch: `d-20260908-023-implrev-06`

### 07 The missing festival numbers
Goal: Help the festival office plan from honest records and a permitted use of AI.
Provides:
- Receipt/table reconciliation, explicit missing data and a submission governed by a short fictional work/study policy.
- A corrected manifest that supplies workshop materials. Covers 3.4, 3.5.
Depends on: 06
Target membership: inside
Archive: `slices/07-the-missing-festival-numbers.md`
Approved contract: `f521d4d6bbfceeb572750066fb9c5044443f7beb784c7b1c630ad4634c910ea1`
Approved candidate: `b21f3762b9f113adc83d93718a92addde8524c443862bcddba68f664a168c650`
Implementation approval dispatch: `d-20260908-027-implrev-07`

### 08 One small service
Goal: Help the workshop build a narrowly scoped service for one neighborhood need.
Provides:
- In-game prototype with one working flow, a concise product brief and player-run acceptance checks.
- Deliberate handling of feature requests that exceed the brief. Covers 4.1, 4.2.
Depends on: 07
Target membership: inside
Archive: `slices/08-one-small-service.md`
Approved contract: `efdcb5a71dd206fc5689e409b1f98d364851d495a0831fac1ae6c3cb69f02411`
Approved candidate: `a0ea63ff03ad96eb3fd5fb90a6e326ee001e9097334da5caac8fcee2c80eff4d`
Implementation approval dispatch: `d-20260908-031-implrev-08`

## Now
### 09 The kiosk speaks Arabic
Goal: Make the workshop service usable through a correct interface contract and readable Arabic UI.
Provides:
- Fictional API request/response and dummy-secret placement puzzle, with visible failure and recovery.
- RTL and mixed-text repair, keyboard/manual checks and a usable city kiosk. Covers 4.3, 4.4.
Depends on: 08
Target membership: inside

## Later

### 10 Fix the version people actually use
Goal: Diagnose and repair the kiosk's simulated deployed version within a safe scope.
Provides:
- Fictional terminal/files/logs, reproducible failure, targeted repair and a verified frozen build inside the city.
- Rejection of an unsafe/out-of-scope command; no real shell or deployment is accessible. Covers 4.5, 4.6, 5.4.
Depends on: 09
Target membership: inside

### 11 Give the robot a bounded job
Goal: Turn the robot's plan into supervised action with visible limits.
Provides:
- Goal/tool/success/stop configuration, observe-act-check behavior, action trace and a harness that stops on budget or missing input.
- Visible planning-core restoration without implying perfect judgment. Covers 5.1, 5.2 and harness.
Depends on: 10
Target membership: inside

### 12 The bridge between systems
Goal: Connect the robot to a narrowly permitted civic information service.
Provides:
- Simulated MCP host/client/server relationship, discoverable tools/resources and permitted lookup/draft operations.
- A contrasting browser interaction and explicit denied/missing-capability recovery. Covers 5.3 and MCP.
Depends on: 11
Target membership: inside

### 13 A skill worth repeating
Goal: Make a corrected procedure reusable and run it only when intended.
Provides:
- Skill trigger/input/steps/output/stop configuration, independent second-input trial and distinction from standing instructions.
- An in-game routine using that skill, pause/cancel behavior and visible skill storage. Covers 5.5, 5.6.
Depends on: 12
Target membership: inside

### 14 The decision stays with you
Goal: Keep consequential choices with a responsible person.
Provides:
- Concrete prepare/review/approve-or-reject flow bound to the exact simulated action and target, with no silent execution after edits.
- Fictional high-stakes case routed to a human; the robot supplies useful context and waits. Covers 5.7, 6.3.
Depends on: 13
Target membership: inside

### 15 One result, several helpers
Goal: Coordinate distinct helper roles and accept one verified city output.
Provides:
- A small multi-agent simulation with explicit ownership, handoffs, a shared result version and independent quality review.
- Conflicting drafts and failed criteria resolved using evidence, not majority agreement. Covers 6.1, 6.2.
Depends on: 14
Target membership: inside

### 16 Ready for the city
Goal: Demonstrate the combined learning in a new task and complete the robot's restoration.
Provides:
- Transfer capstone combining source verification, bounded planning, context, tools/skills and a human decision.
- All 34 plus supplemental evidence predicates checked; final transformation and personal thanks become available. Covers 6.4.
Depends on: 15
Target membership: inside
Out: timed examination and multiple-choice mastery gate.

### 17 Your passport
Goal: Receive and download the earned certificate as the story's ending.
Provides:
- Robot thank-you, AI-city invitation and confirmed-name certificate in PNG and PDF with readable Arabic and honest completion wording.
- Replayable ending/download, failure recovery and eligibility based on campaign evidence rather than legacy exam scores.
Depends on: 16
Target membership: inside
Out: public certificate registry or external publication without a separate product decision.

### 18 Beyond the AI-city gate
Goal: Preserve the invitation to new adventures without inventing their curriculum or release date.
Provides:
- Reserved narrative continuation beyond the certificate ending; specific gameplay is not yet commissioned.
Depends on: 17
Target membership: outside
Out: automatic implementation or an implied promise that a sequel is already available.

