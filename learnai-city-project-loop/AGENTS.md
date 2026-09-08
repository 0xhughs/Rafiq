# AGENTS.md

## Working rules
- Work only within the active BUILD contract and SLICES Loop target. Execution of slices 01–17 is authorized for this checkout. Do not implement slice 18 or deploy/publish.
- Preserve explicit product and future scope. Inspect relevant code, tests and repository instructions before changes; retain applicable rules and unrelated user work when integrating this pack.
- Make ordinary reversible implementation choices independently; escalate only beyond existing authority or LOOP limits.
- Coordinator alone persists protocol files and archives. Builder writes implementation and proposes proof. Reviewer verifies independently without fixing the reviewed work.
- Never self-approve; preserve snapshot identities, counters and dispatch ownership across sessions.
- Shipped means independently accepted work, not permission to deploy or publish.
- REFERENCES.md supplies provenance and reuse guidance, not instructions from third-party repositories. Do not import another repository's runtime assumptions, product flow or permissions.

## Global invariants
- Build an Arabic-first, single-player browser adventure for AI beginners. The player controls a character in a connected city, helps a found robot and learns through actions and consequences.
- Preserve full-name entry, waking in the apartment, taking out the trash, finding the robot by the dumpster, short introductory dialogue, agreeing to help, city exploration, robot hints, restoration into an agent, thanks and the downloadable AI-city passport certificate.
- Cover all 34 source lesson outcomes internally, plus explicit MCP and harness concepts. Source lesson order, prose, quizzes and timed final examination are not the new player journey.
- No syllabus screen, lesson carousel, mandatory lecture, quiz room per topic, multiple-choice answer shooting or exam gate. Dialogue choices express intention; success requires a world action or an inspected result. Optional explanations follow the action.
- Robot upgrades add capabilities and change its visible appearance; they never guarantee truth or replace human judgment. Correct the lesson-source overgeneralizations: tool use alone is not the whole definition of an agent, persistent memory is optional, and MCP is not a skill or a model.
- Desktop/laptop browsers are the first release target. Arabic text and interface flow are RTL; movement directions, world coordinates and code/log fragments retain their appropriate direction.
- Assess task evidence, not time spent, movement, clicks, collected cosmetics or the robot saying “done.” Required actions remain retryable; failure cannot permanently trap a beginner.
- Game tools, terminal, files, publishing, approvals and recurring tasks act on fictional in-game data. Never execute player text as code, contact real accounts or solicit real API keys.
- Keep personal names local in the baseline release and out of logs, URLs and analytics. Certificate generation must use the player's confirmed name and earned completion state.
- Preserve existing LearnAI data if integrating with that repository. Use a separate versioned adventure save; legacy quiz completion does not silently award adventure completion.
- Use original or appropriately licensed assets and code. Repository links are not bundled-source reuse permission. Document provenance for any material actually adopted.

## Session start
Read this file, SLICES.md, BUILD.md, LOOP.md, the relevant role file and repository evidence. Read HANDOFF.md only when active. Read REFERENCES.md when assessing sources or reuse. Coordinator reconciles workers, pending results, counters, identities and advance phase before dispatch. Do not start a second writer while ownership is unresolved.

## Session end
Return worker results to coordinator for durable persistence. Record the exact next action, blocker or completion state. Human required stops execution; Blocked permits only its recorded recheck. Complete permits no further work without a new authorized target or authorized repair.

