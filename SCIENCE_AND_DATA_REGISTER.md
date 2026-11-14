# SCIENCE AND NASA DATA REGISTER

This register distinguishes official challenge resources, other NASA references, observed data and game assumptions. Add exact retrieval timestamps and dataset versions as soon as a record is selected.

## 1. Official challenge scope

**Official title:** Build a Junior Astronaut Mission Trainer.  
**Challenge page:** https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/

The challenge asks for an interactive game or app in which students operate a lunar or Martian outpost and balance life support, radiation shielding, power and food production. The challenge is educational and is aimed at making real mission trade-offs tangible for young learners. The supplied challenge page also lists Games, Planets & Moons, Software, Space Exploration and Sun as subjects.

The challenge page's resources tab names NASA Open APIs, DONKI, NASA OSDR, RadLab, Mars Trek and Canadian Space Agency education resources. The local handbook provided by the team is authoritative for the repository, hourly commits, AI disclosure, README and freeze rules.

## 2. Recommended project environment

Working MVP environment: **Mars outpost**.

Why this is coherent:
- Mars has dust storms that can reduce solar energy reaching a surface asset and dust can accumulate on solar panels.
- Earth–Mars communications have meaningful light-time delay.
- Martian time is commonly tracked in sols.
- NASA has measured radiation on the Martian surface with the MSL Radiation Assessment Detector (RAD).

Do not describe a conventional atmosphere-driven dust storm as a lunar weather event. If the team later selects the Moon instead, redesign the environmental scenarios around lunar lighting, thermal conditions and lunar dust rather than carrying over Mars-specific assumptions.

## 3. Core NASA data sources

### A. NASA Open APIs / DONKI
- Portal: https://api.nasa.gov/
- DONKI API: `https://api.nasa.gov/DONKI/`
- Examples: `/SEP`, `/FLR`, `/CME`, `/GST`, `/notifications`.
- Purpose: space-weather event records, observations, analysis, forecasts and notifications.
- Use in RED HORIZON: show a real event card; let a selected SEP record inform a pre-authored educational space-weather scenario.
- Limit: DONKI event metadata is not a direct radiation-dose measurement at the simulated Mars habitat. Never map an event label directly to an astronaut dose.
- API limits: NASA documents a default personal-key limit of 1,000 requests/hour and DEMO_KEY limits of 30 requests/hour per IP and 50/day. Avoid repeated polling. Never place a private API key in client-side code or commit it.
- For a static GitHub Pages deployment, use a real, small, attributed snapshot generated during development, or use a secure server-side proxy only if it is already working. Include the timestamp of the snapshot.

### B. RadLab (NASA OSDR Radiation Dosimetry Database)
- Overview: https://visualization.osdr.nasa.gov/radlab/gui/overview/
- API documentation: https://visualization.osdr.nasa.gov/radlab/gui/data-api/
- API endpoint: `https://visualization.osdr.nasa.gov/radlab/api`
- Purpose: explore dose-rate and particle-flux records from radiation instruments across different spacecraft/trajectories.
- Documented fields include `absorbed_dose_rate` (µGy/hour), `dose_equivalent_rate` (µSv/hour), `flux`, `timestamp`, `spacecraft`, `instrument`, `instrument_id`, `trajectory` and related metadata.
- The API documentation explains that `trajectory` can resolve to values such as `Mars surface`; verify that the selected query returns the expected instrument, trajectory and data before using it.
- Use in RED HORIZON: historical measurement reference and an explanation of how radiation is measured. Never mix absorbed dose rate and dose-equivalent rate or relabel one as the other.

### C. MSL Radiation Assessment Detector (RAD) Level-2 Mars-surface dataset
- NASA Open Data Portal record: https://data.nasa.gov/dataset/mars-science-laboratory-msl-radiation-assessment-detector-rad-level-2-observation-dosimetr-e2695
- Dataset description: NASA MSL RAD Level-2 observation data for Mars surface operations, including quality-filtered dose-rate products, LET spectra and neutral-particle histograms.
- Use in RED HORIZON: a particularly relevant Mars-surface historical radiation reference. If time is short, show a small sourced reference card or chart instead of attempting a complex live pipeline.
- Important: inspect the dataset's downloadable resources, variable definitions, data quality flags, time span, units and terms before making a chart. Keep quality-filtered fields distinct from all-quality fields. Do not invent or interpolate a current live Mars reading.

### D. NASA Open Science Data Repository (OSDR)
- Portal: https://osdr.nasa.gov/
- NASA OSDR API information: https://www.nasa.gov/osdr-api/
- Legacy/public API information is also linked from https://api.nasa.gov/.
- Purpose: space biology and astronaut health/biology research datasets and metadata.
- Use in RED HORIZON: cite one relevant study in an optional learning card (for example, spaceflight effects on muscle, bone, immune response or plant biology), if a relevant study is identified and read.
- Limit: do not imply that a single space biology study predicts the health of a Mars crew. A citation is more valuable than a rushed, unverified data ingestion feature.

### E. Mars Trek
- Portal: https://trek.nasa.gov/mars/
- Purpose: NASA planetary imagery, elevation and terrain visualization/data portal.
- Use in RED HORIZON: a small map or site-context panel showing the chosen Mars region, if it can be done without destabilizing the MVP.
- Limit: a static map screenshot or sourced terrain tile can be enough for the hackathon. Do not build a full GIS application.

## 4. NASA engineering/education references

### ECLSS — Environmental Control and Life Support Systems
- NASA reference: https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/
- Supports: water recovery, air revitalization, carbon dioxide removal and oxygen generation by electrolysis.
- NASA's reference states the ISS Water Recovery System can recover and recycle about 90% of water on station. Treat this as ISS performance, not a guaranteed Mars-habitat figure.
- Simplified chemistry: `2 H2O → 2 H2 + O2`.
- Implemented oxygen generation is controlled from the dashboard and advances only with mission time. Maximum rates of 1.5 oxygen game units/hour, 0.5 water game units/hour, and 0.6 kW are explicitly fictional balance settings, not NASA engineering values or mass ratios. Generation reserves water for crew/crops and energy for existing loads, then scales down to available supplies and oxygen capacity. Water recovered during a turn is available to the generator on the following turn. At full oxygen storage at turn start, the generator pauses. Water recovery remains a separate process. Hydrogen storage, thermal management, and detailed gas chemistry are not modeled.
- Cabin-air game index below 15 causes a life-support penalty; zero ends the mission. These are game thresholds, not clinical CO₂ concentrations or safety limits.

### NASA Veggie / Advanced Plant Habitat
- NASA reference: https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/
- Supports: plant growth in controlled systems; water, nutrients, air and LED lighting are important.
- Use as the basis for the crop-growth mechanic. Do not claim instantaneous growth or a specific Mars crop yield without a source.

### Mars communication delay
- NASA explainer: https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/
- NASA crewed-Mars communications study: https://www.nasa.gov/wp-content/uploads/2024/01/mars-communications-disruption-and-delay.pdf
- Support: one-way Earth–Mars signal delays vary with distance; NASA explains approximately 4–24 minutes. A request/response therefore takes roughly 8–48 minutes in signal travel alone.
- Game implementation: use a visible one-way delay per scenario and queue messages. Do not confuse signal latency with communication blackout.

### Mars dust and solar power
- NASA InSight power/dust article: https://www.nasa.gov/solar-system/nasas-insight-sees-power-levels-stabilize-after-dust-storm/
- Supports: dust storms can reduce sunlight reaching solar panels; dust can accumulate on panels; low power can force spacecraft into constrained operations.
- Use: scenario inspiration for a game parameter that reduces simulated solar generation. Do not claim the exact fictional outpost experiences the same measured power reduction as InSight.

## 5. Data-versus-model policy

Every quantity shown in the game must be classified as one of:

1. **NASA observation:** an actual sourced data record with timestamp, instrument/source and original units.
2. **Published reference value:** a value stated in a NASA publication, such as ISS water recovery performance or the communication-delay range.
3. **Derived value:** a documented calculation using observed/reference inputs.
4. **Game assumption:** a tunable value chosen to make gameplay work. Label it as an assumption or game unit.
5. **Illustrative sample:** placeholder content used only during development. It must be labeled and must not be presented as live NASA data.

Do not place these categories under one vague label such as “NASA real-time data.”

## 6. Suggested in-game data panel

For each externally sourced record, display:
- Source name and clickable link.
- Dataset/event name and event/measurement date.
- Retrieval date/time in UTC.
- Measurement field and original unit, if applicable.
- What the game uses it for.
- What it does **not** establish (limitations).

Example wording:

> NASA DONKI reports a solar energetic particle event for the selected date. RED HORIZON uses this record to introduce a space-weather decision scenario. The event record is not a direct measurement of radiation dose at this fictional Mars outpost; the displayed mission-risk meter is a simplified game model.

## 7. Source metadata template

Use this structure beside every data snapshot:

```json
{
  "sourceName": "NASA DONKI",
  "sourceUrl": "https://api.nasa.gov/DONKI/SEP",
  "retrievedAtUtc": "REPLACE_WITH_ACTUAL_ISO_TIMESTAMP",
  "recordIdentifier": "REPLACE_WITH_REAL_EVENT_ID_OR_NULL",
  "sourceFieldNames": ["REPLACE_WITH_FIELDS_USED"],
  "originalUnits": "REPLACE_WITH_UNITS_OR_NOT_APPLICABLE",
  "transformation": "Describe any normalization or mapping exactly",
  "gameUse": "Describe the game mechanic influenced by this record",
  "limitations": "State what this record does not measure"
}
```

Do not leave `REPLACE_...` placeholders in the final public demo while implying the data is live.

## 8. RED HORIZON Stage 3 cached records

### NASA DONKI SEP observation

- **Classification:** NASA observation; historical cached snapshot, not live data.
- **Source name / URL:** NASA DONKI, `https://api.nasa.gov/DONKI/SEP`.
- **Query used:** `startDate=2024-05-10`, `endDate=2024-05-10`, public `DEMO_KEY` during development only; no API key is present in the web app.
- **Retrieved at UTC:** `2026-11-14T17:19:35Z`.
- **Record identifier:** `2024-05-10T13:35:00-SEP-001`.
- **Observation date:** `2024-05-10T13:35Z`.
- **Original fields retained:** `sepID`, `eventTime`, `instruments.displayName`, linked activity IDs, alert IDs and record link.
- **Instrument/channel reported:** `GOES-P: SEISS >10 MeV`.
- **Game use:** informs the pre-authored fictional space-weather warning and shelter decision.
- **Limit:** it is not a Mars habitat radiation-dose measurement and is never converted to µSv, mGy, crew exposure, or the simulation risk index.

### NASA OSDR RadLab Mars-surface observation

- **Classification:** NASA observation; historical cached snapshot, not live data.
- **Source name / URL:** NASA OSDR RadLab, `https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Mars%20surface&timestamp%3E=2019-10-18T00%3A00&timestamp%3C2019-10-18T00%3A30&absorbed_dose_rate&dose_equivalent_rate&format=json`.
- **Retrieved at UTC:** `2026-11-14T15:56:49Z`.
- **Record identifier:** none returned for this row; instrument ID is `MSL-RAD-Surface`.
- **Observation timestamp:** `2019-10-18T00:21:47`, preserved exactly as returned.
- **Trajectory:** `Mars surface`.
- **Original field / unit:** `absorbed_dose_rate` = `8.905511 µGy/hour`.
- **Dose-equivalent field:** returned `null`; it is not inferred or substituted.
- **Quality flags:** no quality-flag field was returned by this RadLab response. The linked MSL RAD Level-2 dataset describes a `FLAGGED_DATA` indicator, but no flag is claimed for this selected record.
- **Game use:** historical science reference only; it does not drive or calibrate the game radiation hazard/exposure indices.
- **Limit:** one historical Mars-surface measurement is not a live reading or a dose at the fictional habitat.

### MSL RAD Level-2 dataset reference

- **Classification:** NASA dataset reference, not a displayed measurement.
- **Source / identifier:** NASA Open Data Portal, `https://data.nasa.gov/dataset/mars-science-laboratory-msl-radiation-assessment-detector-rad-level-2-observation-dosimetr-e2695`, DOI `https://doi.org/10.48322/20qb-4e17`.
- **Retrieved at UTC:** `2026-11-14T15:56:49Z`.
- **Use / limit:** documents that Mars-surface Level-2 products include quality-filtered variables and `FLAGGED_DATA`; RED HORIZON does not display an unparsed Level-2 value or quality flag.
