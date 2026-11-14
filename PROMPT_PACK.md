# STAGED AI CODING PROMPT PACK

Use one prompt at a time. Paste the full `PROJECT_INSTRUCTIONS.md` into the coding agent's project context first. Replace bracketed placeholders. The coding agent must not commit or push.

## Prompt 0 — Repository inspection and execution plan

```text
You are the technical implementation assistant for RED HORIZON, a NASA Space Apps Challenge 2026 Junior Astronaut Mission Trainer project.

First read PROJECT_INSTRUCTIONS.md, HANDBOOK_COMPLIANCE_CHECKLIST.md and SCIENCE_AND_DATA_REGISTER.md in full. Then inspect the existing repository without modifying anything.

Report:
1. Current file/folder structure.
2. Existing framework, scripts and dependencies.
3. Whether the project currently builds.
4. Existing code that should be preserved.
5. Missing pieces relative to the MVP.
6. The smallest implementation sequence that can reach a stable, deployable MVP before the 2:00 PM 15-Nov-2026 code freeze.

Do not create or modify files in this step. Do not run git commit, git push, git merge, change Git identity, add co-author tags, or create automated commit scripts. Registered human team members perform every Git operation.

Do not invent NASA measurements, sources, team members or completed functionality. Clearly label every assumption.
```

## Prompt 1 — Scaffold the smallest working application

```text
Using the inspected repository and PROJECT_INSTRUCTIONS.md, implement only the smallest deployable application scaffold for RED HORIZON.

Requirements:
- Use the existing framework if it is already working. Otherwise use Vite + React + TypeScript.
- Create a responsive application shell with these routes/views or equivalent screen states: title/mission intro, mission briefing, command dashboard, decision panel, consequence log, mission debrief.
- Add one mission called "Sol 214: Outpost Survival". Treat this as a fictional scenario. Ensure a Sol is represented correctly or label any simplified time step.
- Make the dashboard child-friendly and readable, with visible power, life support, food, radiation-risk and communications panels.
- All controls must work, even if the simulation is initially simple.
- Do not add fake NASA live data. Use clearly labeled demo values until real data is integrated.
- Add a clear `NASA data status` area that can say `Simulation data` or `NASA snapshot loaded` accurately.

Before editing, state the files you intend to create/change. After editing, list files changed, run the build and report the actual output. Do not commit or push.
```

## Prompt 2 — Build the deterministic simulation engine first

```text
Implement the RED HORIZON simulation engine in isolated, testable TypeScript modules. Do not redesign the UI in this task.

Create typed state and action models for:
- simulation time (elapsed hours and Sol counter)
- crew condition/fatigue (educational game index only)
- power (solar generation kW, load kW by subsystem, battery energy/capacity kWh)
- life support (oxygen supply, water reserve/recovery, air/CO2 condition as labeled game units)
- food reserve (crew-days or clearly labeled game units) and crop-growth progress
- radiation hazard and cumulative exposure as a clearly labeled simulation index, not µSv or mGy
- communication delay and queued messages
- event log and mission status

Implement pure functions for advancing time and applying player actions. Resource use and system dependencies must be deterministic and documented. Include at least these cascading effects:
1. Dust-storm scenario modifier reduces solar generation.
2. The player chooses which loads to reduce; critical life-support loads cannot be disabled without an explicit high-risk warning.
3. Reduced greenhouse lighting delays crop growth; crop harvest must take time.
4. A water-recovery fault forces the player to choose between a repair that costs power/crew time and using stored water.
5. A space-weather event triggers a radiation-shelter decision, but do not convert DONKI event labels into a real dose value.
6. Earth communication replies arrive only after the configured one-way delay; an autonomous choice may be needed first.

Use kW and kWh consistently. For a time step, energy change must use (generation kW - load kW) multiplied by elapsed hours. Clamp battery between zero and capacity. Prevent negative inventory, NaN and Infinity. Distinguish physical units from game units in names and comments.

Add automated tests for normal operation, battery depletion, power surplus, water fault, crop delay, radiation decision, delayed messages, reset/replay and mission success/failure. Do not invent medical safety thresholds or real astronaut consumption figures. State which parameters are game-balance assumptions.

Run tests and build. Report actual test results and every changed file. Do not commit or push.
```

## Prompt 3 — Add NASA source adapters and provenance (do this only after the engine works)

```text
Implement the smallest reliable NASA-data integration for RED HORIZON. Read SCIENCE_AND_DATA_REGISTER.md first.

Priority:
1. NASA DONKI SEP/space-weather event record for a sourced event card or a space-weather scenario seed.
2. NASA RadLab or the NASA MSL RAD Level-2 dataset for a radiation measurement reference, after verifying the exact record, unit, date, instrument and quality status.
3. Use OSDR/Veggie/Mars Trek as cited learning references if time permits; do not build a large data pipeline for them.

Rules:
- Inspect official endpoint documentation and actual response fields before coding.
- Save a small, genuine data snapshot with source URL and actual retrievedAtUtc metadata if the deployment is static.
- Validate incoming data at runtime and handle empty/error responses.
- Never commit a private API key. Never expose a private API key in Vite client code. Respect NASA DEMO_KEY limits.
- Keep source data separate from game-model transformations.
- Distinguish actual records from derived game risk indices. DONKI is not a Mars surface dosimeter. RadLab measurements must preserve original units. MSL RAD is a historical Mars-surface reference, not a live fictional-base sensor.
- Add a provenance panel: source, record date, retrieval time, field/unit, game use and limitations.
- If a source cannot be validated in the time remaining, do not fake the integration. Add a cited educational reference card and label it as such.

Do not change unrelated gameplay or visual design. Run build/tests and report exact results. Do not commit or push.
```

## Prompt 4 — Implement the player-facing mission flow

```text
Implement the playable mission flow for one complete Mars-outpost scenario using the existing deterministic simulation engine.

Required flow:
1. Intro and mission objective.
2. Briefing with environmental conditions and available resources.
3. Command dashboard showing power, life support, food, radiation simulation index and communications status.
4. Event alert with at least two or three meaningful actions. Show costs/trade-offs in child-friendly language.
5. Advance simulated time and apply deterministic consequences.
6. Consequence log that shows what changed and why, including delayed effects.
7. Mission debrief explaining the scientific principle, the player's trade-off and what to try on replay.
8. Restart/replay with a clean initial state.

Make at least three incidents connected in one mission: (a) Martian dust-storm power reduction, (b) a space-weather/radiation decision informed by a real NASA source or clearly labeled scenario, and (c) a water-recovery fault. The incidents must be solvable through different strategies; do not hard-code one winning choice.

Do not introduce new systems, AI chat, accounts, multiplayer, complex 3D or nonessential features. Ensure mobile layout and keyboard usability. Test that every button works and that the player cannot skip consequences accidentally.

Run build and tests. Report changed files and actual test output. Do not commit or push.
```

## Prompt 5 — Child-friendly UI and visual polish

```text
Review the current RED HORIZON interface against the ages 7–12 audience and the working game flow.

Improve only clarity and usability:
- obvious hierarchy and one primary action per screen
- short plain-language explanations; define every acronym on first use
- simple resource bars with labels and status text (do not rely on color alone)
- readable typography and strong contrast
- keyboard focus and touch-sized buttons
- responsive layout for laptop and mobile
- accessible warning language without graphic/fear-based effects
- a compact optional Science Details panel with sources, units and limitations
- visible data freshness/status

Do not add decorative elements that obscure gameplay. Do not use NASA logos, mission patches or official branding in a way that suggests endorsement. Do not generate or insert AI imagery without the team's approval and appropriate disclosure. Ensure there are no dead buttons or fake controls.

Run build and tests. Report exact results. Do not commit or push.
```

## Prompt 6 — Scientific accuracy and data integrity audit

```text
Conduct a skeptical science/data audit of RED HORIZON using SCIENCE_AND_DATA_REGISTER.md and the primary source links it contains.

For every visible metric, chart, scenario and explanatory sentence, classify it as:
- NASA observation
- published reference value
- derived value
- game assumption
- illustrative sample

Flag:
- invented or unsupported measurements
- unit mismatches (especially µGy/hour versus µSv/hour)
- claims that DONKI gives a Mars-habitat dose
- claims that ISS ECLSS performance guarantees Mars performance
- crop-growth behavior without a time delay
- communication delay used as if it were blackout
- incompatible lunar and Martian environmental assumptions
- incorrect Martian Sol time handling
- missing source dates, retrieval timestamps or limitations

Fix only factual/labeling errors that can be supported by the source. For unresolved items, label them as game assumptions or remove the claim. Do not invent values to fill gaps.

Produce a concise list of findings and changes. Run tests/build and report actual results. Do not commit or push.
```

## Prompt 7 — QA and failure-mode testing

```text
Act as a strict QA engineer. Test RED HORIZON from a fresh browser session.

Check:
- app loads without console-breaking errors
- mission starts and resets cleanly
- all controls produce visible effects
- resource state updates only once per action/time step
- no negative resources, battery above capacity, NaN or Infinity
- all five challenge systems affect the mission
- delayed messages arrive at the intended simulation time
- source data errors do not crash the game
- cached fallback is correctly labeled
- every source/data card links to its actual source
- no fake NASA live-data claim appears
- mobile and desktop layout is usable
- build and tests succeed

Try edge cases: depleted battery, failed water recovery, no selected option, repeated clicks, zero elapsed time, max battery, missing/empty NASA snapshot, invalid record and replay after mission end.

Fix high-severity blockers only. Do not add features. Report blockers, fixes, remaining known limitations and actual test output. Do not commit or push.
```

## Prompt 8 — README and AI disclosure

```text
Finalize README.md using the exact six required sections in README_TEMPLATE.md and the local handbook.

Requirements:
- Put the actual live demo URL on the first line or immediately at the top.
- Use the official challenge title exactly.
- Fill real team names, institutions, GitHub usernames and roles only from details supplied by the team. Leave explicit TODO placeholders where details are missing; never invent them.
- Include a system architecture diagram and actual technology stack.
- Include tested installation/run commands from package.json.
- Add actual screenshots and a demo link only if they exist.
- Add a dedicated AI Usage Disclosure. List each AI tool actually used, the exact files/components/assets it assisted with, and the human review/integration/testing performed. Do not hide code or copy generation.
- Explain NASA data sources, record dates, retrieval timestamps, original units, transformations and limitations.
- State that this is a student project, not an official NASA product or NASA-endorsed system.

Do not claim the application is deployed, tested, live-data-connected or used by students unless this has actually been verified. Do not commit or push.
```

## Prompt 9 — Final submission and live-demo rehearsal

```text
Prepare RED HORIZON for the live judging session under the local handbook.

Do not change product scope. Create:
1. A 60–90 second live demo run-of-show (the supplied handbook's own presentation/video constraints take priority if different).
2. A five-pillar evidence table: problem alignment & impact; technical execution & functionality; innovation & creativity; GitHub discipline & documentation; presentation & Q&A.
3. Ten likely technical judge questions with concise evidence-based answers, including questions about the simulation model, NASA data provenance, units, limitations, API failure fallback, accessibility, testing, and AI disclosure.
4. A final checklist of deployed URL, README top link, screenshots, setup instructions, source register, team contributor list and actual hourly push log.

Clearly separate implemented features from future work. Do not invent testing results or judge weights. Do not commit, push or edit the repository after the 2:00 PM 15-Nov-2026 code freeze.
```

## Prompt 10 — One-feature-at-a-time issue template

```text
Implement only this issue: [DESCRIBE ONE SMALL FEATURE OR BUG].

Acceptance criteria:
- [ACCEPTANCE CRITERION 1]
- [ACCEPTANCE CRITERION 2]
- [ACCEPTANCE CRITERION 3]

Before coding, inspect relevant files and identify the smallest safe change. Preserve existing working behavior. Do not add unrelated features. Do not invent NASA data or scientific values. Keep source provenance and AI disclosure accurate. Add/update tests for this change. Run relevant tests/build and report actual results. List changed files. Stop before any Git operation; a registered human member will commit and push.
```
