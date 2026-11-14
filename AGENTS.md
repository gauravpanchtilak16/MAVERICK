# PROJECT INSTRUCTIONS — RED HORIZON

Paste this document into the project's AI coding-agent instructions/context. Keep this file in the repository root.

## 1. Project identity

- Working title: **RED HORIZON — Junior Astronaut Mission Trainer**.
- Official NASA Space Apps Challenge 2026 challenge: **Build a Junior Astronaut Mission Trainer**.
- Team name: `[TEAM NAME — do not invent; replace when confirmed]`.
- Audience: children aged 7–12.
- Primary setting for the MVP: a **Mars research outpost**. The official problem allows a lunar or Martian outpost. Keep Mars-specific assumptions consistent; do not mix lunar daylight, lunar dust, Martian dust storms and Martian communication delay into one environment.
- Product type: browser-based interactive resource-management and decision simulation.
- Core promise: players command an outpost, make difficult choices under limited resources, watch immediate and delayed consequences, and learn the science behind those outcomes.

## 2. Non-negotiable challenge alignment

This must be a working interactive simulation, not a quiz, static slideshow, landing page, or decorative dashboard.

The game must make the following systems matter through player actions and consequences:
1. Power management.
2. Life support: oxygen supply/generation, water recovery, cabin air / CO2 management.
3. Radiation risk and shielding decisions.
4. Food reserves and crop production.
5. Communication delay and crew autonomy.

A player decision must change the game state. At least some consequences must be delayed and cascade into another system. There must not be a universally free or always-correct choice.

## 3. Time-critical MVP scope

The code freeze is 2:00 PM on 15 November 2026. Optimize for a tested vertical slice, not feature count.

MVP target:
- One complete Mars-outpost mission that can be started, played, completed/failed, and replayed.
- Three or more connected incidents inside that mission, such as a dust-storm power reduction, a space-weather/radiation alert, and a water-recovery fault.
- Five challenge systems visible and functionally linked.
- A mission briefing, command dashboard, actionable decision panel, time advancement, consequences log, and science debrief.
- NASA source attribution and a data-status/provenance panel.
- Responsive browser interface, accessible basic controls, and no required account.

Only add a second mission if the complete first mission is already stable, tested and deployed.

## 4. Recommended architecture

Prefer the simplest maintainable stack that the current team can finish quickly:
- Vite + React + TypeScript.
- CSS or Tailwind only if already configured and productive.
- Deterministic TypeScript simulation engine, separated from UI components.
- Browser local storage for optional progress persistence; the game must still work without it.
- Static NASA data snapshots with metadata for the safest GitHub Pages MVP. Add a serverless proxy only if it is already working and does not endanger the deadline.
- GitHub Pages or another host permitted by the local handbook.

Suggested structure (adapt to the existing repository rather than overwriting it):

```text
src/
  app/
  components/
  game/
    types.ts
    initialState.ts
    simulation.ts
    systems/
      power.ts
      lifeSupport.ts
      radiation.ts
      food.ts
      communications.ts
    scenarios/
  data/
    adapters/
    snapshots/
  content/
    glossary.ts
    debriefs.ts
  styles/
  tests/
public/
  data/
  images/
README.md
PROJECT_INSTRUCTIONS.md
SCIENCE_AND_DATA_REGISTER.md
```

Keep game rules in pure functions where practical. UI components should display state and dispatch player actions; they should not duplicate scientific calculations.

## 5. Simulation design rules

### 5.1 Time and units
- Track simulation time explicitly. A Martian sol is approximately 24 hours, 39 minutes and 35 seconds. If the game uses simplified turns, disclose that as a gameplay simplification.
- Power: keep energy and power distinct. Energy is kWh; power is kW. Over a time step, energy change is `(generation_kW - load_kW) * elapsed_hours`.
- For children, UI bars may be normalized, but the science panel must state whether a value is a physical unit, a game unit, or a normalized index.
- Never label a made-up game value as a measured NASA value.

### 5.2 Power
- Model solar generation, battery capacity/state of charge, and loads by subsystem.
- Provide critical / high / optional loads or an equivalent understandable prioritization.
- A dust storm scenario may reduce incoming solar energy and/or add dust-related panel losses, with the effect clearly labeled as a scenario parameter.
- Never allow battery energy to exceed capacity or become negative.

### 5.3 Life support
- Represent at least oxygen availability, water reserves/recovery, and air/CO2 management.
- Make oxygen generation dependent on water and electrical power in the simplified model.
- Explain electrolysis accurately: water can be split into hydrogen and oxygen.
- Make water recycling a distinct process from oxygen generation.
- Do not claim ISS ECLSS performance is a proven Mars-base design. If using NASA's approximately 90% ISS water-recovery figure, show it as an ISS reference, not an assumed Mars outpost performance guarantee.
- Unless the team has a defensible cited engineering source, use transparently labeled `game units` or `crew-days` for resource rates rather than inventing real astronaut consumption or medical safety thresholds.

### 5.4 Radiation
- Separate **observed NASA data** from the game's **radiation hazard / exposure simulation**.
- DONKI records space-weather events. A DONKI SEP event can inform or trigger an educational scenario, but it does not by itself provide the radiation dose at the simulated Mars habitat.
- RadLab contains radiation dosimetry records and its API documentation includes trajectories such as Mars surface. The NASA MSL RAD Level-2 dataset is a directly relevant historical Mars-surface radiation resource. Confirm the specific fields, units, time interval, quality flags and licensing before integrating a file.
- Never convert an event label directly into a claimed astronaut dose.
- If the game uses a simplified `risk index` or `exposure points`, call it a **simulation index**, document the formula and assumptions, and do not label it µSv or mGy.
- If displaying physical measurements, preserve units and distinguish absorbed dose rate (µGy/hour) from dose-equivalent rate (µSv/hour). They are not interchangeable.

### 5.5 Food
- Model stored food and crop growth separately.
- Crop production takes simulated time and depends on water, nutrients and suitable lighting/environmental conditions.
- Do not make crops grow instantly after a button press.
- Use NASA Veggie / Advanced Plant Habitat as educational references, not proof that a specific crop yield is guaranteed for a Mars outpost.

### 5.6 Communications
- Simulate messages as delayed events, not immediate chat.
- Mars one-way signal delay varies with Earth–Mars distance; NASA references describe approximately 4–24 minutes one way. Round-trip time is approximately twice the one-way delay, before any operational processing delay.
- Make the selected scenario delay visible. Include the possibility of an autonomous crew decision before the Earth reply arrives.
- Keep light-time delay separate from communications blackout or equipment failure.

## 6. Data integrity and NASA attribution

- Use primary NASA/CSA sources wherever possible.
- Every downloaded or copied dataset snapshot must have: source name, direct source URL, retrieval date/time (UTC), original units, selected fields, any transformation applied, and a limitation note.
- Put this metadata beside the snapshot, for example in `public/data/metadata.json` or the source register.
- Keep raw/observed data separate from transformed game parameters.
- Do not fabricate observations, timestamps, event IDs, measurements, NASA endorsements or citations.
- If an API is unavailable, show a cached NASA snapshot with its real retrieval timestamp or clearly labeled sample/simulation data. Never silently fall back to fake live data.
- NASA Open APIs `DEMO_KEY` has lower published limits than a personal key. Never commit a private API key or expose a private key in browser code. For GitHub Pages, prefer a committed, attributed snapshot or a properly secured serverless proxy.
- The product is a student hackathon project and is not an official NASA product. Do not imply NASA endorsement.

## 7. UX and education requirements

- Use child-friendly plain language suitable for ages 7–12.
- Show a small number of clear resources; put detailed units and sources behind an optional `Science details` panel.
- Explain acronyms on first use.
- Make cause and effect visible: show what changed, why it changed, and which other systems were affected.
- Include a mission debrief with at least one learning outcome after each incident or mission.
- Support keyboard navigation, visible focus, readable contrast, touch-sized controls and responsive layouts.
- Avoid fear-based or graphic failure screens. Explain failure as a learning opportunity.
- No mandatory signup, personal-data collection or external account requirement for the MVP.

## 8. Engineering quality requirements

- TypeScript types for mission state, player actions, events, data records and source metadata.
- Validate every external data response before using it.
- Clamp bounded quantities; prevent negative resources, battery above capacity, NaN, Infinity and undefined UI states.
- Use pure simulation functions where practical so they can be tested without rendering the UI.
- Add tests for normal turns, resource exhaustion, no generation, failed recovery, delayed messages, replay/reset and end-state conditions.
- Add a safe fallback when external data is unavailable.
- Run the project's build and tests before each important human push.
- Do not add dependencies unless they directly support a required feature.
- Do not rewrite working files or replace the project structure without first inspecting it and explaining why.
- Do not leave dead controls, fake charts or buttons that do nothing.

## 9. GitHub and hackathon integrity rules

The local event handbook is binding:
- A new public GitHub repository must be created after 12:00 PM on 14 November 2026.
- Genuine incremental work must be pushed at least once every hour from 12:00 PM on 14 November through the 2:00 PM code freeze on 15 November, including overnight.
- Every registered human team member must appear in GitHub Contributors through commits pushed from their own personal GitHub account.
- Each human must verify their local `git config user.email` matches an email associated with their own GitHub account before committing.
- AI tools, bots, automated commit scripts and AI co-author tags must not appear as commit authors or repository contributors.
- AI coding assistants must not run `git commit`, `git push`, `git merge`, edit GitHub history, change Git identity, or generate artificial/backdated/no-op commits. Human team members own all Git actions.
- Do not fabricate missed hourly commits. Ask the on-site organizer how to handle a missed window.
- Host the web app on GitHub Pages or a comparable host, and put the live URL at the very top of README.md.
- Hard freeze: no commits, merges or repository edits after 2:00 PM on 15 November 2026.

## 10. AI assistance and disclosure

AI tools may assist brainstorming, research, debugging, code, documentation and design, subject to the team's handbook. Be fully transparent.

Maintain a contribution log with:
- AI tool name.
- Date/use.
- Exact files/modules/scripts/assets it helped with.
- Whether output was generated, edited or merely reviewed.
- Human changes, integrations and tests performed.

README must include a dedicated `AI Usage Disclosure` heading. Disclose all tools actually used. Do not claim humans wrote code that was generated by AI. Do not add AI co-author tags to Git commits. The human team must review, understand, test and own every submitted code path.

## 11. AI coding-agent working protocol

For every task:
1. Inspect the current repository and report the existing structure before editing.
2. State the smallest concrete change you plan to make.
3. Implement only the requested stage; do not jump ahead or add speculative features.
4. List each file created/changed and explain the change.
5. Run relevant tests/build and report exact results. Never claim a test passed unless it ran.
6. Identify any unverified assumptions, scientific limitations or TODOs.
7. Stop before all Git commit/push operations. A registered human team member performs and verifies those actions.
8. Keep `README.md`, source attribution and AI disclosure synchronized with actual implementation.

If a requirement conflicts with the supplied local handbook, stop and flag the conflict rather than silently choosing a path.
