# RED HORIZON — Stage 10 final submission report

Review date: **15 November 2026 IST**. Source release: [`7e0dd4381049721c173165d96d3e477c81c80246`](https://github.com/gauravpanchtilak16/RED-HORIZON/commit/7e0dd4381049721c173165d96d3e477c81c80246). This report and its README link are a subsequent documentation-only update.

**Public application:** https://red-horizon-sandy.vercel.app/

Technical checks passed for the scope below. This is not an official submission receipt, scientific certification, accessibility certification, or organizer eligibility decision. No submission was made on the team's behalf.

## 1. Initial Stage 9 findings

The Stage 9 evidence was inspected, and current tests, source, dependencies, GitHub state, and public assets were checked again.

| Priority | Finding | Stage 10 disposition |
|---|---|---|
| P0 — administrative | Official submission link/receipt and a ruling on missing hourly pushes were unavailable. | Still unresolved; requires the organizer and team. |
| P1 — development security | Six dependency advisories in the Vite 5/Vitest 2 toolchain: three moderate, one high, two critical. Production-only audit had no findings. | Targeted toolchain upgrade; final full dependency audit reports zero. |
| P2 — accessibility | Eight decision controls shared the accessible name “Choose this plan.” | Each now includes its decision title in its accessible name. |
| P2 — documentation | Individual human review and separate ChatGPT use were unconfirmed. | Team confirmed both members reviewed/tested, and ChatGPT assisted planning, research, and prompts. README now distinguishes those reports from agent-executed checks. |
| Verification limit | Private Vercel alias metadata/settings/logs were inaccessible. | GitHub deployment success and exact public asset comparisons established; private metadata remains unverified. |

Stage 9 reported working mission outcomes, 41 passing tests, and a successful production build. Those results were not accepted as substitutes for the reruns below. No new critical gameplay or scientific labeling failure was found in the exercised paths.

## 2. Problems fixed

- `DecisionCard` retains its visible text and behavior, with `aria-label="Choose this plan: <decision title>"`. The deployed browser accessibility tree contains eight distinct decision names.
- Pinned **Vite 6.4.6** and **Vitest 4.1.12**, regenerated the lockfile, and installed from it. An intermediate Vite 6.4.4 audit still showed one moderate advisory; 6.4.6 resolved it. No forced blanket upgrade, simulation rewrite, or weakened test assertion was used.
- Updated team/AI disclosure, the verified tool versions, a stale repository-access sentence, and the judge demonstration materials. No scientific observations or game parameters were changed.

## 3. Files changed

| File | Change |
|---|---|
| `src/App.tsx` | Distinct accessible names for decision buttons. |
| `package.json` | Vite/Vitest remediation. Existing scripts preserved. |
| `package-lock.json` | Exact dependency resolution for the updated tools. |
| `README.md` | Confirmed team/AI information, setup/tool versions, judging guide and final-report links, current validation summary. |
| `docs/JUDGING_DEMO.md` | Tested target 90-second action path, five-pillar evidence, ten technical answers, human submission checklist. |
| `STAGE_10_FINAL_SUBMISSION_REPORT.md` | This report. |

The simulation engine, NASA snapshots/register, styles, and screenshot assets are unchanged in Stage 10. A pre-edit backup was retained outside the repository.

## 4. Tests executed and actual results

Environment: **Windows, Node.js v24.19.0, npm 11.17.0**. Commands ran from the repository directory containing `package.json`.

| Actual command | Result |
|---|---|
| `npm.cmd ci` | Exit 0; added 97 packages, audited 98 packages in 4 seconds; found 0 vulnerabilities. npm printed a pending esbuild install-script notice; subsequent type checks/builds succeeded. |
| `npm.cmd run test` | Exit 0; Vitest 4.1.12, **4 test files passed, 41 tests passed**, 0 failed. Final run started 06:13:03 IST and took 1.81 s. |
| `npx.cmd --no-install tsc --noEmit -p tsconfig.app.json` | Exit 0, no diagnostics. |
| `npx.cmd --no-install tsc --noEmit -p tsconfig.node.json` | Exit 0, no diagnostics. |
| `npm.cmd audit --json` | Final network-enabled run exit 0; empty vulnerabilities object, total 0 across all severity categories. The preceding sandbox run failed with `getaddrinfo ENOTFOUND registry.npmjs.org`; it was retried, not treated as a clean audit. |
| `npm.cmd ls vite vitest esbuild --depth=1` | Exit 0; Vite 6.4.6, Vitest 4.1.12, esbuild 0.25.12; plugin-react 4.7.0 uses the same Vite. |

Lint is **not configured**, so no lint result is claimed. A zero advisory count is a point-in-time registry result, not a guarantee of security.

The 41 tests exercise battery integration/clamping, crop delays and lighting/water dependence, delayed repair and shelter interactions, radiation game indices, communication timing and single delivery, success/failure, food/oxygen/water exhaustion, zero generation, failed recovery, finite bounded values, malformed/duplicate actions, replay, oxygen supply/energy constraints, cabin-air failure, and NASA validation/fallback. NASA cases include empty/malformed records, missing fields, invalid dates/units, and old snapshots retaining cached status. These are deterministic tests, not validation of real habitat performance.

Fresh headless Chromium checks ran against both the locally served production bundle and the public release. Desktop control was not used. Each run completed with exit 0. The public run verified:

- Intro → briefing → dashboard → decisions → consequence log → debrief; success, failure, and replay; an early debrief says the mission is still running and replay can reset an active mission.
- Normal two-hour turn: oxygen 78→76; displayed battery 34→29 kWh; crop progress 34→37%. Low-power turn: displayed battery 34→33 kWh; crops remain 34%.
- Oxygen on, then elapsed time: 3.0 game units produced, 1.0 water game unit and 1.20 kWh logged, net oxygen 78→79 after crew use. Switching off and advancing gives 77. No oxygen appears merely from toggling the control.
- Natural battery depletion reaches 0 kWh; oxygen maker says “Waiting for power” and reports 0.0 production. Water-starvation behavior was tested in the engine, not forced through the public mission interface.
- Recycler stays at 30 before repair completion and reaches 88 after four working hours. Shelter reduces risk growth and pauses repairs; the delayed Earth reply is absent before advancing and appears later in the log.
- Repeated greenhouse/shelter/water-setting toggles, one-use stored-water disabling/logging, distinct decision names, visible keyboard focus and native Enter activation.
- Gameplay continues while the browser is explicitly offline after loading; oxygen production and replay still work. No runtime NASA call is required.
- Six screens at **1440×900, 768×1024, and 390×844**: **18 layout checks**, no document overflow or clipped panel/card bounds. Dashboard buttons were at least 44×44 CSS pixels at those widths. Desktop/mobile dashboard captures were visually inspected. Mobile navigation scrolls within its own bar.

Browser evidence is retained locally outside Git in `red-horizon-stage10-local/results.json` and `red-horizon-stage10-live/results.json`, beneath `C:\Users\LOQ\.codex\visualizations\2026\11\14\01a1da8e-341b-7fa2-b690-1845952d6a6e`. The helper there is `red-horizon-stage10-check.mjs`; it was run with `node`, the repository path, output directory, and either `http://127.0.0.1:5188/` or the public URL. This external helper is not part of `npm run test` or a checked-in CI suite.

## 5. Production build result

`npm.cmd run build` exited 0. Actual final output, with terminal formatting removed:

```text
> red-horizon@0.1.0 build
> tsc -b && vite build

vite v6.4.6 building for production...
transforming...
✓ 31 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.63 kB │ gzip:  0.38 kB
dist/assets/index-BZv9xMdh.css    8.31 kB │ gzip:  2.70 kB
dist/assets/index-D9UBImE6.js   187.04 kB │ gzip: 58.50 kB
✓ built in 545ms
```

No build warning or error was emitted. Git's LF/CRLF notices concern working-copy line endings, not failed compilation. Markdown hard-break trailing spaces in the demo guide were removed in the documentation follow-up.

## 6. Public deployment verification

At **2026-11-15T00:42:22Z (06:12:22 IST)**, GitHub reported Vercel **success** for source release `7e0dd4381049721c173165d96d3e477c81c80246`, updated at `00:42:10Z`. Deployment status target: [existing Vercel deployment](https://vercel.com/red-horizon2/red-horizon/DuUjuXNBrKBdZztQgUWeHqmBQseF).

The public HTML returned HTTP 200. `/assets/index-D9UBImE6.js`, `/assets/index-BZv9xMdh.css`, and `/favicon.svg` each returned 200 and matched local build bytes exactly. The subsequent fresh public browser run loaded all four resources over TLS 1.3, with **zero browser errors, zero console warnings, zero failed requests, and zero redirects**. It completed the gameplay checks above and found the new accessible names, which were absent from the older release.

This is direct evidence that the public application serves the tested source build. Exact private production-alias SHA, project settings, and deployment logs remain **NOT VERIFIED**: private Vercel metadata returned 403 and no Vercel account connection was available to the agent. No new project was created and no credentials were requested or exposed.

## 7. GitHub synchronization status

Before publication, `git fetch origin` and `git rev-list --left-right --count HEAD...origin/main` returned `0 0`. Source release `7e0dd43` was committed and pushed normally; `git ls-remote origin refs/heads/main` returned the identical full SHA. Existing history was preserved. The final documentation update is intended for a subsequent genuine commit and deployment check; this report does not predict its SHA or claim an unobserved future push.

The configured identity remained `ash242222-beep <ash242222@gmail.com>`. No identity changes, force pushes, fabricated activity, backdating, empty commits, AI author names, or AI co-author tags were introduced. The user expressly authorized agent-executed commits/pushes in the recovery and Stage 10 instructions. The authenticated push account is the invited collaborator `practiceprojects365-oss`; this is disclosed and does not establish compliance with the handbook's human-only/personal-account execution rules.

## 8. Scientific accuracy status

The deployed science panel preserves the following distinctions; Stage 10 did not replace or refresh the stored observations:

| Item | Classification and result |
|---|---|
| DONKI SEP `2024-05-10T13:35:00-SEP-001` | Historical NASA event metadata, observed `2024-05-10T13:35Z`, retrieved `2026-11-14T17:19:35Z`; GOES-P SEISS >10 MeV channel, no dose unit. Informs a fictional warning, never a Mars habitat dose. |
| RadLab `MSL-RAD-Surface` | Historical NASA Mars-surface observation at `2019-10-18T00:21:47`, retrieved `2026-11-14T15:56:49Z`; `absorbed_dose_rate = 8.905511 µGy/hour`. Dose equivalent is null; no row ID or quality flag is invented. |
| MSL RAD Level-2 | Published dataset reference, not a parsed measurement or quality flag. |
| Energy and time | kW is power, kWh energy. Energy is derived from fictional rates and elapsed hours. A sol is approximately 24 h 39 m 35 s; two-hour turns evaluate the one-sol objective at 26 elapsed hours. |
| Remaining mission values | Fictional resource/risk/crew/crop/repair settings. Crop growth requires elapsed time. Electrolysis is separate from water recycling. ISS references do not guarantee Mars performance. Fixed solar generation omits day/night. |
| Communication | Fictional 18-minute one-way setting within the documented variable Earth–Mars range; replies require both signal legs, processed on a game step. Delay is not blackout. |

Primary source URLs, original units, retrieval timestamps, game use, and limits remain in [README](README.md), [science register](SCIENCE_AND_DATA_REGISTER.md), and the optional in-app panel. The Stage 9 source evidence returned the exact RadLab row again; DONKI's linked page loaded but its text did not independently confirm the stored event identifier, and an API recheck during recovery returned 429. Mars24 timed out in that source-link check. These limits are retained rather than represented as fresh NASA verification. A passing test checks stored provenance/handling, not scientific authenticity.

## 9. README and screenshot status

All six mandatory sections exist. The live link is the first README line. The architecture matches the typed simulation/React UI and bundled snapshots; no server proxy or live NASA feed is claimed. Setup commands match `package.json`, need no secret/environment file, and use the verified Node/npm versions. The final README check found nine local links and all existed.

All six README PNG screenshot paths exist and show real rendered application screens. They remain valid because Stage 10 changes no visible layout or game mechanics. The 90-second guide includes oxygen/power decisions, radiation, water repair, delayed/cascading effects, debrief and replay, plus five judging pillars and ten technical questions. Its exact action path reached success in local and public browser runs; its human presentation duration has **not** been measured. No demo video is available or claimed.

## 10. Team information and human confirmation

**Maverick:** Ashwin Pal (`ash242222-beep`) and Gaurav Panchtilak (`gauravpanchtilak16`), both at G.H. Raisoni College of Engineering, Nagpur. The team confirmed both reviewed and tested the application. Exact individual manual test procedures and additional separately handwritten modules were not supplied; none were invented.

The team confirms ChatGPT helped with **planning, research, and prompts**. Codex's generated/revised code, tests, copy, design, documentation, assets, automated checks and authorized Git operations are disclosed. No other generative AI use was reported. Human review of the newest Stage 10 changes and understanding of the final code must still be completed by the team before submission.

## 11. Hackathon compliance gaps

GitHub's API confirmed a **public** repository, default branch **main**, created `2026-11-14T10:27:44Z` (**15:57:44 IST**, after the noon cutoff). Both registered members appear in Contributors; Ashwin has write access and Gaurav admin access. This does not independently prove account email verification or each required personal-account push.

The available GitHub push events show 16:08:46 and 20:11:25 IST on 14 November, and 04:02:46 IST on 15 November. Additional local remote-reflog entries exist, but neither evidence set establishes an unbroken hourly schedule starting at noon. Missed or unverified hours cannot be repaired with artificial commits. No organizer ruling was supplied.

The supplied handbook checklist also requires human-executed commits/pushes from registered members. The user's explicit authorization allowed this agent workflow, but it is **not organizer approval**. The team must disclose it and obtain a ruling. The original handbook/form, official submission URL, registration match, and submission receipt remain unavailable. Compliance is not certified.

## 12. Remaining risks and hard-freeze status

The clock was checked at `2026-11-15T00:44:21Z` (**06:14:21 IST**), before **15 November 14:00 IST / 08:30 UTC**. All Stage 10 edits/publication must finish before that freeze. No automatic commit/push schedule was created.

No confirmed critical/high gameplay defect remains in the tested scope. Limits: simplified non-predictive science, no initial offline installation/service worker, no Safari/Firefox or physical-device checks in Stage 10, no full screen-reader/WCAG certification or children user study, no lint configuration, inaccessible private Vercel metadata, and point-in-time security/API evidence. Administrative eligibility and actual submission remain the main blockers to claiming final submission readiness.

## 13. Exact next actions

1. Team reviews the final Stage 10 diff and live release, confirms registration details and contributions, and rehearses the tested demonstration with both members.
2. Ask the organizer for the official submission URL and written decisions on hourly-push gaps and the disclosed agent Git workflow. Do not manufacture evidence or assume eligibility.
3. Human team completes the official submission and retains the receipt; include the live URL, public repository, genuine screenshots, source register and AI disclosure. Confirm any required video/media format with the organizer.
4. Finish only permitted genuine work before **14:00 IST**. At freeze, stop repository edits, commits, merges and pushes. Follow organizer instructions for later judging/submission channels.

**SUBMISSION STATUS UNVERIFIED**
