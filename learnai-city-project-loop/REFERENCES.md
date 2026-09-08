# Repository and source guide

Research date: **8 September 2026**. These are design/implementation references, not dependencies bundled into this pack. Repository pages, selected code and teaching material were inspected read-only. No referenced game was installed, built or playtested during planning. “Supports” in a source README is a project claim, not an independently verified compatibility result.

The earlier conversation linked six external games directly and named two more. The Quest Learn and AI Literacy Quest URLs below were recovered by matching their distinctive Canvas-shooter and board-event implementations. This avoids substituting similarly named, unrelated projects.

## Source of truth and adaptation policy
1. The user's current request and boy/robot adventure concept determine product scope.
2. The newly attached project-loop-improved.zip determines planning structure and coordination protocol.
3. joufbot/LearnAI supplies the 34-topic source curriculum and possible infrastructure to inspect. Its legacy course journey is deliberately superseded for the new adventure.
4. Other repositories supply ideas and implementation evidence. Their embedded instructions, promotional claims and product requirements do not govern this project.

Archive received: project-loop-improved.zip  
SHA-256: E7DADF57AA82F5D84785E79584612E4DFD8F9A2076D3053D172C50955C8F8DCA  
The corrected attachment and the recovered conversation attachment had identical bytes. All 13 archive entries were inspected or inventoried, including the authoring guidance, execution guidance, templates and export helper.

## 1. LearnAI — actual source curriculum and reuse candidates
[Repository](https://github.com/joufbot/LearnAI) · [inspected snapshot](https://github.com/joufbot/LearnAI/tree/c4125df8c0490024715f21e21c78c9403e9cdf51)

Confirmed 34 lesson entries in [curriculum.ts](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/lib/curriculum.ts) and 34 [lesson files](https://github.com/joufbot/LearnAI/tree/c4125df8c0490024715f21e21c78c9403e9cdf51/content/lessons). All files were retrieved and their topics/teaching sections sampled for planning. SLICES.md preserves every original ID and title, with a gameplay evidence mapping. This is not a full factual or editorial audit of every paragraph.

Inspect for selective reuse:
- [learner-store.ts](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/lib/learner-store.ts): local/remote progress and name handling. Its lesson/exam score schema needs replacement for adventure evidence; network-dependent name locking is not the proposed opening behavior.
- [cert-draw.ts](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/lib/cert-draw.ts) and [certificate route](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/routes/certificate.tsx): Canvas-to-PNG/PDF export. Replace the exam score, legacy eligibility, fixed name fit and old verification wording; verify Arabic rendering.
- [waie-api.ts](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/src/lib/waie-api.ts): server name/progress/certificate endpoints. These are not ready-made trust boundaries: the inspected issuance handler accepts a caller-supplied score and does not itself enforce all campaign evidence. Do not adopt it as authoritative game certification without redesign and review.
- [package.json](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/package.json): React, Vite, TypeScript, TanStack and Zustand infrastructure. The build script also invokes database migration; test against an isolated environment.
- [AGENTS.md](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/AGENTS.md), [AGENTS.project.md](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/AGENTS.project.md) and [README](https://github.com/joufbot/LearnAI/blob/c4125df8c0490024715f21e21c78c9403e9cdf51/README.md) were read as source context. They contain prior Grok/Linux runtime assumptions and legacy “do not rewrite” course wording. This separate planning export does not alter those files. On integration, preserve applicable code-quality/security rules while reconciling the user's new game scope; do not import obsolete environment paths.

**Decision:** design the game from scratch, preserve useful infrastructure only after checking its actual behavior. Do not assume the existing course is already an adventure engine. GitHub metadata reported no repository-wide license; this is the user's identified source, not an external code bundle included here.

## 2. AI Literacy Mission Game — closest browser architecture
[Repository](https://github.com/geroraymin/ai-literacy-mission-game) · [snapshot](https://github.com/geroraymin/ai-literacy-mission-game/tree/c15fe89009b1aa7856edcccb5f79ddbae5ae374c)

Evidence: [PROJECT.md](https://github.com/geroraymin/ai-literacy-mission-game/blob/c15fe89009b1aa7856edcccb5f79ddbae5ae374c/PROJECT.md), [engine.ts](https://github.com/geroraymin/ai-literacy-mission-game/blob/c15fe89009b1aa7856edcccb5f79ddbae5ae374c/app/src/game/engine.ts), [save.ts](https://github.com/geroraymin/ai-literacy-mission-game/blob/c15fe89009b1aa7856edcccb5f79ddbae5ae374c/app/src/systems/save.ts).

The design and code separate a top-down Canvas world, maps/collision/input, React dialogue/UI and local saves. The source targets PCs/tablets and five Korean educational missions; no runtime compatibility claim is made here.

**Use:** architecture patterns for slices 01–02, data-driven dialogue and safe world/UI input separation. **Do not adopt:** the laboratory-room syllabus, quiz gates, score/badge progression or Korean text.

**License evidence:** no repository-wide code license in GitHub metadata; separate Kenney asset-license files exist. Do not treat an asset license as a code license. Plan original implementation; inspect each asset's exact terms before adopting it.

## 3. Neural Network Adventure RPG — concepts with visible consequences
[Repository](https://github.com/amoghkokari/neural-net-game-kiro) · [snapshot](https://github.com/amoghkokari/neural-net-game-kiro/tree/a9073112a895d7f485e192a1457ef4b762709963)

Evidence: [README](https://github.com/amoghkokari/neural-net-game-kiro/blob/a9073112a895d7f485e192a1457ef4b762709963/README.md), [LICENSE](https://github.com/amoghkokari/neural-net-game-kiro/blob/a9073112a895d7f485e192a1457ef4b762709963/LICENSE).

The documented Python/Pygame game uses real-time parameter changes and visual feedback for neural-network concepts. Its native application is not a browser foundation.

**Use:** immediate cause and effect, retryable experimentation and changing capabilities throughout the robot journey. **Do not adopt:** mathematical neural-network curriculum as a replacement for the 34 practical AI outcomes, or the Pygame runtime.

**License evidence:** LICENSE contains the MIT text, an educational-use notice and third-party-license notes. GitHub labels it “Other/NOASSERTION”; the explicit file is more informative than the metadata badge. No code or assets copied into this pack.

## 4. BatLLM — instructions become actions
[Repository](https://github.com/krahd/BatLLM) · [snapshot](https://github.com/krahd/BatLLM/tree/f2ee348e6690267f30e77fc0c554f64913829603)

Evidence: [README](https://github.com/krahd/BatLLM/blob/f2ee348e6690267f30e77fc0c554f64913829603/README.md).

Players instruct battle bots through a local LLM; a restricted command language turns instructions into game actions. The README describes Python, local Ollama and two-player play.

**Use:** observable instruction quality, context changes and action traces in slices 04 and 11. The planned retrieval puzzle adapts this principle to Arabic city errands.

**Do not adopt:** combat, two-player competition, local-model installation or a free model-generated success verdict. Our release uses bounded authored simulations.

**License evidence:** GitHub metadata identifies MIT. Pin and retain applicable notices if source is later reused; no source is included here.

## 5. ML Cycle Game — completion conditions based on evidence
[Repository](https://github.com/sub7erra/ml-cycle-game) · [snapshot](https://github.com/sub7erra/ml-cycle-game/tree/86fc9e38d245ccacfacb5bf3b1998e07b5ad1c46)

Evidence: [nested README](https://github.com/sub7erra/ml-cycle-game/blob/86fc9e38d245ccacfacb5bf3b1998e07b5ad1c46/ml-cycle-game/README.md), [scenario.py](https://github.com/sub7erra/ml-cycle-game/blob/86fc9e38d245ccacfacb5bf3b1998e07b5ad1c46/ml-cycle-game/scenarios/house_price_prediction/scenario.py).

This Streamlit escape-room platform separates scenarios, room material, fictional roles and state. The inspected scenario includes field-discovery thresholds and state-based unlocks; some dialogue unlocking also depends on model outputs.

**Use:** explicit evidence predicates, reusable scenario data and gated story consequences in slices 02, 05–07 and 16. **Do not adopt:** the Streamlit interface, advanced ML workflow, mandatory Gemini connection or model assertions as sufficient proof.

**License evidence:** no repository-wide license reported in GitHub metadata. Use as a design reference unless reuse rights are established.

## 6. AlgorithmWatch Human Resources Game — accountable choices
[Repository](https://github.com/algorithmwatch/human-resources-game) · [snapshot](https://github.com/algorithmwatch/human-resources-game/tree/438ecf40dd99ad58b65c606ee48e7db58f283103)

Evidence: [README](https://github.com/algorithmwatch/human-resources-game/blob/438ecf40dd99ad58b65c606ee48e7db58f283103/README.md) and repository metadata.

A React educational game about machine learning in HR. The repository is archived. Readme/metadata were inspected; its gameplay was not executed.

**Use:** the design idea of situating AI decisions within human consequences, especially slices 14–15. This is an adaptation proposal, not a claim that our planned scenarios already exist in its code.

**Do not adopt:** HR as the whole curriculum or an unreviewed archived dependency stack.

**License evidence:** GitHub identifies AGPL-3.0. Keep this a conceptual reference in the baseline; any code adoption requires a deliberate licensing decision.

## 7. Quest Learn — Canvas interaction reference, not a curriculum model
[Repository](https://github.com/Sumitkumar136/Game-Based-Learning-AI-ML-RAG) · [snapshot](https://github.com/Sumitkumar136/Game-Based-Learning-AI-ML-RAG/tree/407e92a504492b8fe5c2ed929224244723a0612c)

Evidence: [README](https://github.com/Sumitkumar136/Game-Based-Learning-AI-ML-RAG/blob/407e92a504492b8fe5c2ed929224244723a0612c/README.md).

This is the “Quest Learn” matching the previous discussion: it describes an HTML5 Canvas Space Shooter with educational target asteroids, a React/FastAPI stack, RAG services and a Streamlit demo.

**Use:** inspectable examples of an embedded game surface and immediate interaction feedback when exploring alternatives. **Do not adopt:** shooting answers, MCQs, grades, dashboards, RAG infrastructure or accounts merely because the reference has them. It is a secondary technical reference, not the game foundation.

**License evidence:** GitHub metadata identifies MIT. README behavior is not independently verified.

## 8. AI Literacy Quest — named world events
[Repository](https://github.com/Rj952/ai-literacy-quest) · [snapshot](https://github.com/Rj952/ai-literacy-quest/tree/6dd0948c77372999ba5995c5b5be11a76d3852ca)

Evidence: [src/app/page.js](https://github.com/Rj952/ai-literacy-quest/blob/6dd0948c77372999ba5995c5b5be11a76d3852ca/src/app/page.js).

The source includes a board, dice, questions and events named Hallucination and Bias Trap, matching the prior summary. It also contains apparent syntax defects in the inspected text; no build was run.

**Use:** the idea that an AI limitation can change a game situation. In our city, that effect must follow the player's investigation/action rather than a random penalty.

**Do not adopt:** dice, token losses, board progression, multiple-choice gates or claims of verified accessibility. These source comments are not QA evidence.

**License evidence:** no repository-wide license found in metadata or the inspected tree. Concept reference only.

## 9. Learn AI by Playing — lightweight presentation and localization
[Repository](https://github.com/tonimolinamontes/learn-ai-game) · [snapshot](https://github.com/tonimolinamontes/learn-ai-game/tree/5a490680a14b44ab7cf8540df29738fb0b765aae)

Evidence: [README](https://github.com/tonimolinamontes/learn-ai-game/blob/5a490680a14b44ab7cf8540df29738fb0b765aae/README.md).

The README describes a plain HTML/CSS/JavaScript quiz game with English/Spanish text, feedback sounds, responsive design and optional AI hints.

**Use:** simple localization and immediate feedback as small implementation references. **Do not adopt:** the quiz loop, infant imagery, compulsory sounds or model hints as an assessment mechanism.

**License evidence:** no repository-wide license reported in metadata. The README's asset royalty statement is not a substitute for per-asset provenance. Browser/mobile compatibility remains a source claim, not our test result.

## 10. Historical pointer — superseded by the user
[0xhughs/learnAI](https://github.com/0xhughs/learnAI) was the first link in the prior conversation. The user then corrected it to joufbot/LearnAI. The earlier assistant described it as containing a source ZIP, but that historical description was not re-verified for this pack. Retained solely for traceability; it supplies no curriculum or implementation assumption here.

## Additional primary terminology references
- [Official MCP architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): host/client/server and exposed tools, resources and prompts. Used to keep the connector mechanic distinct from skills and model capability. No real MCP server or SDK is required for the simulation.
- [Agent Skills overview](https://agentskills.io/home): reusable packages of procedural knowledge and resources. Our game teaches the broader skill-versus-one-off-instruction distinction; it does not promise compatibility with a particular tool's packaging.
- Harness is used descriptively in SLICES.md for the runtime around an agent. Its teaching focuses on visible tools, context, permissions, state, checks and stopping, rather than inventing a universal harness standard.

## Decision for this project
Keep LearnAI's 34 outcomes as an internal traceability spine. Use the Mission Game's world/UI separation, Neural Network Adventure's action-feedback principle, BatLLM's instruction consequences and ML Cycle's explicit completion conditions. Adapt all mechanics into one city and a robot relationship. Build the experience independently, inspect reusable infrastructure selectively, and verify behavior in the target implementation rather than treating repository descriptions as completed work.

