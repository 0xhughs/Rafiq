# Rafiq — completed project planning pack
**Arabic AI-learning browser adventure · prepared 8 September 2026**

This pack plans the game from the apartment opening to the restored robot and downloadable AI-city passport. It preserves the supplied Project Loop framework, maps all 34 LearnAI topics into playable activities, adds the explicitly requested MCP and harness concepts, and includes every game repository named in the earlier discussion.

**Planning is finished. Implementation has not started.** The run is deliberately **Prepared**, the first build is **Proposed**, proof is uncompleted and both review approvals are empty. These are the correct initial states, not unfilled project-planning placeholders.

## Read first
1. [SLICES.md](SLICES.md) — product, proposed release boundary, city/game design, 34-topic gameplay map, 17 build slices, future invitation and release gates.
2. [BUILD.md](BUILD.md) — the opening slice in detail: name entry, apartment, trash, robot encounter, dialogue and the decision to help.
3. [REFERENCES.md](REFERENCES.md) — eight external game references, the actual LearnAI repository, the superseded link, source paths, snapshot IDs and reuse decisions.

## Operating documents
| File | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Shared working rules and durable product constraints |
| [LOOP.md](LOOP.md) | Complete coordinator protocol: ownership, snapshots, reviews, retries, recovery and stopping |
| [BUILDER.md](BUILDER.md) | Implementation role; proposes proof and cannot self-approve |
| [REVIEWER.md](REVIEWER.md) | Independent plan, implementation and release verification |
| [HANDOFF.md](HANDOFF.md) | Unused temporary handoff, ready when needed |
| [slices/README.md](slices/README.md) | Rules for immutable accepted-slice history; no invented shipped slices |

The ZIP contains only this ten-file planning set. It does not contain application source, third-party repositories, secrets, private chat exports or generated game assets.

## What has been decided for planning
- Arabic-first desktop/laptop adventure with a connected, revisitable city and short character dialogue.
- Full 34-topic coverage earned through observable actions, plus MCP and harness experiences.
- Authored AI simulations for a complete baseline release without model subscriptions; fictional tool/browser/terminal operations remain inside the game.
- Local adventure saves and local PNG/PDF certificates, with existing LearnAI server services treated as optional reuse candidates.
- A proposed first outcome small enough to inspect and play: wake up, take out the trash, meet the robot and agree to help.
- Full proposed target: slices 01–17. The AI-city sequel invitation remains visible as outside-target slice 18.

Working names, final art, exact audience age and final browser matrix remain identified product decisions in SLICES.md. They are not silently presented as choices the user already made.

## Source and validation notes
The user-confirmed project-loop-improved.zip was unpacked and its instructions/templates read. The source hash is in REFERENCES.md. Its coordinator/builder/reviewer roles, Proposed state, snapshot-bound approvals, rejection counters, blocker recovery, archive/advance protocol and final release review are preserved.

The project-build-pack authoring skill was used as supporting guidance. Where it differs from the supplied Project Loop pack, the supplied pack takes precedence: this set includes LOOP/BUILDER/REVIEWER and starts at Proposed, not Not started.

The generated set was checked for required files/headings, unresolved template tokens, one active slice, stable IDs/dependencies, 34 unique curriculum mappings, all named repositories, valid local document links and consistent initial state. ZIP contents were compared with the source deliverables. These are document checks; they are not gameplay tests or independent approval under LOOP.

## Starting implementation later
Give the complete folder to the implementation agent in the intended project checkout and explicitly authorize the desired target. It should follow AGENTS → SLICES → BUILD → LOOP and its role document. Before first dispatch it must bind actual tools, capture the actual repository/contract identities and obtain independent plan review. The empty runtime IDs and capture commands are intentionally configured then; this planning delivery cannot know the future checkout's state.

Do not overwrite an existing repository's AGENTS.md blindly. Merge its applicable rules and preserve unrelated files/data. No external deployment or continuing background task is started by this pack.

