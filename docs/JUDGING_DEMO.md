# RED HORIZON — judging and submission preparation

**Live app:** https://red-horizon-sandy.vercel.app/  
**Repository:** https://github.com/gauravpanchtilak16/RED-HORIZON  
**Team:** Maverick — Ashwin Pal and Gaurav Panchtilak  
**Challenge:** Build a Junior Astronaut Mission Trainer  
**Freeze:** 15 November 2026, 14:00 IST. No repository edits, commits, merges, or pushes after the freeze.

Student-built hackathon project. Not an official NASA product and not endorsed by NASA.

## Target 90-second live demonstration

The exact action path below reached success in a headless browser check. The timings are a rehearsal target, not a measured human presentation result. Wait for each state update; rapid double-clicks are not a substitute for distinct turns. Start from a fresh mission.

| Time target | Action | Suggested narration / evidence |
|---|---|---|
| 0–10 s | Start the mission briefing, then open the dashboard. | “RED HORIZON lets children aged 7–12 command a fictional Mars outpost. Every choice affects another system.” Show initial battery, oxygen, water, food, and risk. |
| 10–25 s | Switch on the oxygen maker, advance two mission hours, then switch it off. | “Making oxygen uses water and electricity. The crew is still breathing.” Oxygen rises 78→79 after crew use; water and battery decrease. These are game values. |
| 25–45 s | Open Choose. Select **Use low-power mode**, **Repair the recycler**, **Use emergency shielding**, **Save greenhouse water**, **Ask Earth for advice**, then **Enter the shelter**. Advance two hours. | “Saving power pauses plant lights. Shelter slows the radiation-risk bar, but repairs must wait. We can act while Earth's reply travels.” These choices are compatible controls, not exclusive answers to a quiz. |
| 45–60 s | Open Mission log. Return to Choose, leave the shelter, then advance twice. | Show the delayed Earth reply and repair consequences. Four working repair hours restore the recycler. The radiation index rises faster outside shelter. |
| 60–78 s | Enter the shelter. Advance **nine more two-hour turns**, then open Debrief. | This path reaches 26 elapsed hours and a successful one-sol objective. Read the actual remaining power and crew condition; do not promise fixed values for other strategies. |
| 78–90 s | Show Play again and, if time permits, the briefing's Science details. | “Try a different plan and compare the consequences. NASA's historical records give scientific context; our risk meter is a game index, not a measured astronaut dose.” |

If the presenter loses their place, show the current log and explain the result honestly. Do not claim an unfinished mission is complete. A static screenshot is a fallback illustration, not proof of live interaction. The scenario delay is a fictional 18 minutes each way; replies appear at the next processed time step after arrival is due.

## Evidence for the five judging pillars

| Pillar | Demonstrable evidence | Limitations to disclose |
|---|---|---|
| Problem Alignment & Impact | Intended audience 7–12; connected Mars-outpost decisions across five systems. | Educational impact and use by children have not been measured. |
| Technical Execution & Functionality | Separate typed simulation engine; working mission outcomes/replay; tests, type checks, production build and browser checks. | Use actual results in the final report. Lint is not configured; no formal accessibility certification. |
| Innovation & Creativity | Combining source-transparent historical NASA context with visible resource trade-offs and delayed consequences. | Do not claim that no other game uses these concepts or that the model predicts a real Mars habitat. |
| GitHub Discipline & Documentation | Public repository, six README sections, genuine source history, screenshots, and AI disclosure. | Hourly push history is incomplete; no eligibility ruling is known. Commit author timestamps are not push timestamps. |
| Presentation & Live Q&A | The working action path above and the ten questions below. | Both members need to rehearse and understand the implementation. No judging weights are published in the supplied checklist. |

## Ten technical questions and evidence-based answers

1. **How is battery energy calculated?** `src/game/simulation.ts` integrates net kW over elapsed hours and deducts electrolysis energy, then clamps storage between zero and capacity. Rates are game assumptions.
2. **Does oxygen generation really use resources?** Yes. At full operation it makes 1.5 oxygen game units/hour using 0.5 water game units/hour and 0.6 kW. It reserves water for crew/crops and energy for existing loads, scales to available supplies/capacity, and logs production. These are fictional rates, not physical mass ratios or NASA efficiency figures.
3. **What NASA observations are included?** Bundled historical DONKI SEP `2024-05-10T13:35:00-SEP-001` and RadLab `MSL-RAD-Surface` at `2019-10-18T00:21:47`. Source URLs, original retrieval times, units, and limits are displayed. The MSL Level-2 landing page is a dataset reference, not an extracted Level-2 row.
4. **Does DONKI give the habitat's radiation dose?** No. It supplies historical space-weather event context for a fictional warning. The code does not convert that event into a Mars dose or the radiation game index.
5. **Why distinguish µGy/hour and µSv/hour?** The stored `absorbed_dose_rate` is 8.905511 µGy/hour. Dose-equivalent rate was null and is not inferred. These are different scientific quantities, as documented by NASA RadLab.
6. **Which values are simulated?** Resource inventories/rates, power settings, crop growth, repair duration, crew/cabin indices, shielding effects and the scenario's 18-minute delay. kWh changes are derived calculations from those game settings. Historical NASA observations remain separate.
7. **What cascading effects can a judge observe?** Low-power mode pauses greenhouse lighting and crop growth; water conservation slows growth; shelter pauses repair while reducing risk growth; repair uses time, electricity, and crew effort; oxygen generation competes for water and power.
8. **What happens if NASA or the network is unavailable?** The application does not call NASA at runtime. It labels bundled records as historical cached snapshots and shows simulation-only attribution if validation fails. Gameplay continues after loading without network access. A first-ever offline launch is not provided by a service worker.
9. **How were architecture, testing, and accessibility checked?** React displays state and dispatches actions into deterministic TypeScript functions. Vitest covers resources, boundaries, timing, replay, validation, and oxygen supply constraints. Headless Chromium checks the built app, keyboard focus/activation, distinct decision names, mission outcomes, network errors and responsive layouts. Water starvation was tested in the engine, not forced through the public mission UI.
10. **How was AI used and what did the people do?** The team reports ChatGPT for planning, research, and prompts. Codex generated/revised code, tests, copy, source labels, tooling and documentation and ran automated checks. Both members confirm reviewing and testing the app; individual manual procedures and further handwritten modules were not specified. The README discloses authorized agent-executed Git operations and does not claim organizer approval of them.

Scientific details and links: [science register](../SCIENCE_AND_DATA_REGISTER.md). Gameplay screenshots and setup: [README](../README.md).

## Final human submission checklist

- [ ] Open the public URL from the judging machine and confirm the final release.
- [ ] Use the project title and team details recorded in README; confirm them against registration.
- [ ] Confirm each member's GitHub Contributors entry and required personal-account activity.
- [ ] Obtain the organizer's official submission link; **[ORGANIZER SUBMISSION LINK REQUIRED]**.
- [ ] Ask the organizer to resolve missing hourly-push evidence; do not manufacture historical activity.
- [ ] Confirm whether the authorized Codex Git workflow is acceptable under the local handbook.
- [ ] Rehearse the target 90-second path with both members; confirm any required video/media format with the organizer.
- [ ] Use the README's six genuine screenshots and honest AI disclosure; do not claim measured educational outcomes.
- [ ] Complete the official form and retain its receipt. No submission is performed by this document or the agent.
- [ ] Before 14:00 IST, finish only permitted genuine work and verify the final release. At the freeze, stop repository edits and Git writes.
