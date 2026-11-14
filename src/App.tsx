import { useState, type ReactNode } from 'react'
import { NASA_DATA_CENTER } from './data/nasaSnapshots'
import { createInitialMission } from './game/initialState'
import { applyPlayerDecision, resetMission } from './game/simulation'
import type { PlayerAction } from './game/types'

type Screen = 'intro' | 'briefing' | 'dashboard' | 'decisions' | 'log' | 'debrief'

const screens: { id: Screen; label: string; number: string }[] = [
  { id: 'intro', label: 'Start', number: '1' },
  { id: 'briefing', label: 'Briefing', number: '2' },
  { id: 'dashboard', label: 'Dashboard', number: '3' },
  { id: 'decisions', label: 'Choose', number: '4' },
  { id: 'log', label: 'Mission log', number: '5' },
  { id: 'debrief', label: 'Debrief', number: '6' },
]

function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [mission, setMission] = useState(createInitialMission)
  const dispatch = (action: PlayerAction) => setMission((current) => applyPlayerDecision(current, action))
  const advanceTime = () => dispatch({ id: `advance-${mission.time.elapsedHours + 2}`, type: 'advanceTime', hours: 2 })
  const requestEarth = () => dispatch({ id: `earth-${mission.communications.nextMessageNumber}`, type: 'sendMessage', text: 'Requesting safe next-step advice.' })
  const replayMission = () => { setMission(resetMission()); setScreen('intro') }
  const currentTime = `Sol ${mission.time.sol} | ${mission.time.solHours.toFixed(1)} Earth hours into this sol`
  const messageQueued = mission.communications.pendingIncoming.length > 0
  const missionActive = mission.mission.status === 'active'
  const status = mission.mission.status === 'failed'
    ? 'Mission needs a restart'
    : mission.mission.status === 'success'
      ? 'Mission objectives complete'
      : mission.radiation.hazardIndex > 65 || mission.lifeSupport.systemHealthIndex < 45 || mission.power.storedEnergyKwh < 10
        ? 'Needs attention'
        : 'Stable for now'

  const powerStatus = statusForLowValue(mission.power.storedEnergyKwh, 10, 24, 'Low power - save energy', 'Power is getting low', 'Power looks good')
  const oxygenStatus = statusForLowValue(mission.lifeSupport.oxygenGameUnits, 25, 50, 'Low oxygen - protect life support', 'Oxygen is getting low', 'Oxygen supply is okay')
  const waterStatus = statusForLowValue(mission.lifeSupport.waterGameUnits, 25, 50, 'Low water - protect reserves', 'Water is getting low', 'Water supply is okay')
  const lifeStatus = statusForLowValue(mission.lifeSupport.systemHealthIndex, 45, 65, 'Life support needs help', 'Life support needs watching', 'Life support is okay')
  const foodStatus = statusForLowValue(mission.food.storedFoodCrewDays, 6, 12, 'Food is running low', 'Food needs watching', 'Food stores are okay')
  const radiationStatus = mission.radiation.hazardIndex > 85 ? { label: 'High risk - use shelter', tone: 'alert' } : mission.radiation.hazardIndex > 65 ? { label: 'Risk is rising', tone: 'watch' } : { label: 'Risk is lower for now', tone: 'good' }
  const crewStatus = statusForLowValue(mission.crew.conditionIndex, 45, 65, 'Crew needs rest and support', 'Crew needs watching', 'Crew is doing okay')

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('intro')} aria-label="Return to mission start"><span className="brand-mark" aria-hidden="true">RH</span><span>RED HORIZON <small>Junior Astronaut Mission Trainer</small></span></button>
      <div className="mission-chip">Fictional Mars mission | Sol {mission.time.sol}</div>
    </header>
    <nav className="screen-nav" aria-label="Mission screens">
      {screens.map((item) => <button key={item.id} className={screen === item.id ? 'nav-button active' : 'nav-button'} onClick={() => setScreen(item.id)} aria-current={screen === item.id ? 'page' : undefined}><span aria-hidden="true">{item.number}</span>{item.label}</button>)}
    </nav>

    <main>
      {screen === 'intro' && <section className="hero panel">
        <p className="eyebrow">Mission trainer for ages 7 to 12</p><h1>Sol 214: Outpost Survival</h1><p className="lead">You are the outpost commander. Help four astronauts make safe choices for one Martian day.</p>
        <div className="fact-row"><div><strong>Your crew</strong><span>{mission.crew.count} astronauts are counting on you.</span></div><div><strong>Your time</strong><span>One sol is one day on Mars: about 24 hours and 40 minutes.</span></div><div><strong>Your job</strong><span>Keep supplies and crew condition safely above zero.</span></div></div>
        <button className="primary-button" onClick={() => setScreen('briefing')}>Start the mission briefing</button>
      </section>}

      {screen === 'briefing' && <section className="content-grid">
        <article className="panel story-panel"><p className="eyebrow">Mission briefing</p><h1>A dusty day on Mars</h1><p><strong>This is a fictional game mission.</strong> Dust makes less solar power. The water recycler is weak. A space-weather warning means the crew must be careful.</p><ul><li><strong>Power:</strong> solar panels charge the battery.</li><li><strong>Life support:</strong> oxygen game units, water recovery, and clean cabin air help the crew.</li><li><strong>Greenhouse:</strong> plants need light, water, nutrients, and time to grow.</li><li><strong>Message delay:</strong> Earth&apos;s advice arrives later, so your crew must still make choices.</li></ul><p className="fine-print">Game bars are simulation values. The NASA facts on this page are historical learning references, not live mission readings.</p><button className="primary-button" onClick={() => setScreen('dashboard')}>Open my dashboard</button></article>
        <aside className="panel data-status">
          <p className="eyebrow">NASA Data Center</p>
          <h2>History, not live data</h2>
          <div className="data-badges" aria-label="Data status"><span className="data-badge cached">Cached NASA snapshot</span><span className="data-badge">Offline-ready</span></div>
          <p><strong>Freshness:</strong> {NASA_DATA_CENTER.freshness}</p>
          <p className="fine-print">NASA observations help explain the story. They never set this game&apos;s radiation-risk bar.</p>
          <details className="science-details">
            <summary>Science details for curious commanders</summary>
            <div className="science-detail-grid">
              <section>
                <h3>Space-weather event</h3>
                <p><strong>Concept:</strong> a Solar Energetic Particle (SEP) event is a burst of energetic particles from the Sun.</p>
                <p><strong>Data class:</strong> NASA observation (historical cached record).<br /><strong>Source:</strong> NASA DONKI<br />Record: {NASA_DATA_CENTER.spaceWeather.recordIdentifier}<br />Observed: {NASA_DATA_CENTER.spaceWeather.observationDate}<br />Retrieved: {NASA_DATA_CENTER.spaceWeather.retrievedAtUtc}<br />Instrument/channel: {NASA_DATA_CENTER.spaceWeather.instruments[0]}</p>
                <p><strong>Original unit:</strong> {NASA_DATA_CENTER.spaceWeather.originalUnit}</p>
                <p className="fine-print"><strong>Source note:</strong> {NASA_DATA_CENTER.spaceWeather.description} <strong>Game use:</strong> {NASA_DATA_CENTER.spaceWeather.gameUse} <strong>Limit:</strong> {NASA_DATA_CENTER.spaceWeather.limitations}</p>
                <a className="source-link" href={NASA_DATA_CENTER.spaceWeather.sourceReferences[0]} target="_blank" rel="noreferrer">Open NASA DONKI record</a>
              </section>
              <section>
                <h3>Mars radiation reference</h3>
                <p><strong>Concept:</strong> absorbed dose rate measures energy deposited in material over time.</p>
                <p><strong>Data class:</strong> NASA observation (historical cached record).<br /><strong>Source:</strong> NASA OSDR RadLab<br />Instrument: {NASA_DATA_CENTER.marsRadiation.instrumentId}<br />Trajectory: {NASA_DATA_CENTER.marsRadiation.trajectory}<br />Observed: {NASA_DATA_CENTER.marsRadiation.observationDate}<br />Retrieved: {NASA_DATA_CENTER.marsRadiation.retrievedAtUtc}</p>
                <p><strong>Original measurement:</strong> {NASA_DATA_CENTER.marsRadiation.measurementField} = {NASA_DATA_CENTER.marsRadiation.measurementValue} {NASA_DATA_CENTER.marsRadiation.originalUnit}<br /><strong>Unit check:</strong> this is absorbed dose rate (µGy/hour), not dose-equivalent rate (µSv/hour). No dose-equivalent value was returned.</p>
                <p className="fine-print"><strong>Quality status:</strong> {NASA_DATA_CENTER.marsRadiation.qualityStatus} <strong>Game use:</strong> {NASA_DATA_CENTER.marsRadiation.gameUse} <strong>Limit:</strong> {NASA_DATA_CENTER.marsRadiation.limitations}</p>
                <a className="source-link" href={NASA_DATA_CENTER.marsRadiation.sourceUrl} target="_blank" rel="noreferrer">Open NASA RadLab record</a>
              </section>
            </div>
            <p className="fine-print"><strong>Data class:</strong> published NASA dataset reference, not an observation used by this game. <a className="source-link" href={NASA_DATA_CENTER.mslRadReference.sourceUrl} target="_blank" rel="noreferrer">MSL RAD Level 2 dataset</a> — retrieved {NASA_DATA_CENTER.mslRadReference.retrievedAtUtc}. No Level-2 measurement or quality flag is shown or invented here; {NASA_DATA_CENTER.mslRadReference.limitations}</p>
            <p className="fine-print"><strong>Background references:</strong> <a className="source-link" href="https://www.giss.nasa.gov/tools/mars24/help/notes.html" target="_blank" rel="noreferrer">Mars sol</a>, <a className="source-link" href="https://www.nasa.gov/solar-system/nasas-insight-sees-power-levels-stabilize-after-dust-storm/" target="_blank" rel="noreferrer">dust and solar power</a>, <a className="source-link" href="https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/" target="_blank" rel="noreferrer">plant growth</a>, <a className="source-link" href="https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/" target="_blank" rel="noreferrer">Mars message delay</a>, and <a className="source-link" href="https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/" target="_blank" rel="noreferrer">ISS life-support concepts</a>. These references support the concepts, not this fictional outpost&apos;s performance or numerical game settings.</p>
          </details>
        </aside>
      </section>}

      {screen === 'dashboard' && <section><div className="section-heading"><div><p className="eyebrow">Command dashboard</p><h1>{status}</h1><p>{currentTime} | {mission.time.elapsedHours} simplified mission hours passed</p></div><button className="primary-button" onClick={advanceTime} disabled={!missionActive}>Advance 2 mission hours</button></div><p className="dashboard-helper">Resource readings are calculated from game assumptions; warning thresholds are game choices. The solar model uses a fixed game rate and omits day and night. Read the words beside each bar, not only the color.</p><div className="resource-grid">
        <ResourceCard icon="POWER" name="Battery power" value={`${Math.round(mission.power.storedEnergyKwh)} kWh`} meterValue={(mission.power.storedEnergyKwh / mission.power.batteryCapacityKwh) * 100} description={`${(mission.power.solarGenerationKw * mission.power.dustStormMultiplier).toFixed(1)} kW modeled solar power`} status={powerStatus.label} statusTone={powerStatus.tone} tone="gold" />
        <ResourceCard icon="O2" name="Oxygen" value={`${Math.round(mission.lifeSupport.oxygenGameUnits)} game units`} meterValue={mission.lifeSupport.oxygenGameUnits} description="A game supply, not a medical reading." status={oxygenStatus.label} statusTone={oxygenStatus.tone} tone="blue" />
        <ResourceCard icon="H2O" name="Water" value={`${Math.round(mission.lifeSupport.waterGameUnits)} game units`} meterValue={mission.lifeSupport.waterGameUnits} description={`Recycler condition: ${Math.round(mission.lifeSupport.waterRecoveryCondition)} / 100 game index`} status={waterStatus.label} statusTone={waterStatus.tone} tone="blue" />
        <ResourceCard icon="AIR" name="Life support" value={`${Math.round(mission.lifeSupport.systemHealthIndex)} / 100 game index`} meterValue={mission.lifeSupport.systemHealthIndex} description={`Cabin-air condition: ${Math.round(mission.lifeSupport.co2ConditionIndex)} / 100 game index`} status={lifeStatus.label} statusTone={lifeStatus.tone} tone="blue" />
        <ResourceCard icon="PLANT" name="Food and greenhouse" value={`${mission.food.storedFoodCrewDays.toFixed(1)} crew-days`} meterValue={Math.min(100, mission.food.storedFoodCrewDays * 4)} description={`Plants: ${Math.round(mission.food.cropGrowthProgress)}% grown | lights ${mission.food.greenhouseLightingEnabled ? 'on' : 'off'}`} status={foodStatus.label} statusTone={foodStatus.tone} tone="green" />
        <ResourceCard icon="RAD" name="Radiation risk" value={`${Math.round(mission.radiation.hazardIndex)} / 100`} meterValue={mission.radiation.hazardIndex} description="Simulation index - not NASA dose data." status={radiationStatus.label} statusTone={radiationStatus.tone} tone="red" />
        <ResourceCard icon="CREW" name="Crew condition" value={`${Math.round(mission.crew.conditionIndex)} / 100 game index`} meterValue={mission.crew.conditionIndex} description={`Fatigue ${Math.round(mission.crew.fatigueIndex)} | workload ${Math.round(mission.crew.workloadIndex)} (game indices)`} status={crewStatus.label} statusTone={crewStatus.tone} tone="green" />
        <article className="resource-card communications-card"><div className="resource-card-top"><span className="resource-icon" aria-hidden="true">COMMS</span><div><p className="card-label">Communication</p><p className="status-label good">{messageQueued ? 'Reply pending' : 'Ready to call Earth'}</p></div></div><h2>{messageQueued ? 'Waiting for Earth' : `${mission.communications.oneWayDelayMinutes} min one way`}</h2><p>Fictional signal delay. Your crew can act while they wait.</p><button className="text-button" onClick={requestEarth} disabled={messageQueued || !missionActive}>{messageQueued ? 'Waiting for reply' : 'Ask Earth for advice'}</button></article>
      </div><div className="action-row"><button className="secondary-button" onClick={() => setScreen('decisions')}>Choose a crew plan</button><button className="text-button" onClick={() => setScreen('log')}>See what changed</button></div></section>}

      {screen === 'decisions' && <section><div className="section-heading"><div><p className="eyebrow">Choose a crew plan</p><h1>Three connected problems</h1><p>Pick a plan, then advance time to see what changes.</p></div><button className="primary-button" onClick={advanceTime} disabled={!missionActive}>Advance 2 mission hours</button></div><div className="incident-stack">
        <IncidentSection label="Problem one" title="Dust storm" text="Dust blocks sunlight. Save battery power, but remember that greenhouse lights help plants grow."><DecisionCard title="Use low-power mode" text="Turn off noncritical loads. Life support stays on, but plant lights pause." effect="Battery lasts longer | crops pause" disabled={!missionActive || mission.power.nonCriticalLoadsReduced} onChoose={() => dispatch({ id: `loads-${mission.time.elapsedHours}`, type: 'reduceNonCriticalLoads' })} /><DecisionCard title={mission.food.greenhouseLightingEnabled ? 'Pause greenhouse lights' : 'Restore greenhouse lights'} text="Plants need light, water, nutrients, and time." effect="Save power now | protect future food" disabled={!missionActive} onChoose={() => dispatch({ id: `greenhouse-${mission.time.elapsedHours}-${!mission.food.greenhouseLightingEnabled}`, type: 'toggleGreenhouseLighting', enabled: !mission.food.greenhouseLightingEnabled })} /></IncidentSection>
        <IncidentSection label="Problem two" title="Radiation warning" text={`NASA DONKI record ${mission.radiation.scenarioReference.recordIdentifier ?? 'unavailable'} inspired this warning. It is not a Mars dose measurement.`}><DecisionCard title={mission.radiation.sheltered ? 'Leave the shelter' : 'Enter the shelter'} text="Shelter slows the game risk bar, but the crew cannot repair water recovery while sheltered." effect="Lower risk | repair waits" disabled={!missionActive} onChoose={() => dispatch({ id: `shelter-${mission.time.elapsedHours}-${!mission.radiation.sheltered}`, type: 'toggleShelter', sheltered: !mission.radiation.sheltered })} /><DecisionCard title={mission.radiation.shieldingAllocated ? 'Shielding is in place' : 'Use emergency shielding'} text="Use the one shielding supply in the crew area." effect="Supply -1 | risk rises more slowly" disabled={!missionActive || mission.radiation.shieldingAllocated} onChoose={() => dispatch({ id: `shielding-${mission.time.elapsedHours}`, type: 'allocateShielding' })} /></IncidentSection>
        <IncidentSection label="Problem three" title="Water recovery" text="The recycler is weak. Repair it, use reserves, or help water last longer in the greenhouse."><DecisionCard title="Repair the recycler" text="The crew needs four mission hours, energy, and effort." effect="Better recovery later | crew work rises" disabled={!missionActive || mission.lifeSupport.repairHoursRemaining > 0 || mission.lifeSupport.waterRecoveryCondition >= 85} onChoose={() => dispatch({ id: `repair-${mission.time.elapsedHours}`, type: 'startWaterRecoveryRepair' })} /><DecisionCard title="Use stored water" text="Use the one reserve water supply." effect="Reserve -8 units | life support steadies" disabled={!missionActive || mission.lifeSupport.storedWaterAllocated} onChoose={() => dispatch({ id: `stored-water-${mission.time.elapsedHours}`, type: 'useStoredWater' })} /><DecisionCard title={mission.food.waterConservationMode ? 'Use normal greenhouse water' : 'Save greenhouse water'} text="Water-saving mode helps reserves, but plants grow more slowly." effect="Water use falls | crop growth slows" disabled={!missionActive} onChoose={() => dispatch({ id: `greenhouse-water-${mission.time.elapsedHours}-${!mission.food.waterConservationMode}`, type: 'toggleGreenhouseWaterConservation', enabled: !mission.food.waterConservationMode })} /></IncidentSection>
        <section className="incident-section comms-section"><div><p className="eyebrow">Crew autonomy</p><h2>Ask Earth, then keep acting</h2><p>Earth&apos;s fictional reply takes two signal trips. Your crew cannot pause the mission while waiting.</p></div><DecisionCard title={messageQueued ? 'Earth reply pending' : 'Ask Earth for advice'} text="Send a message, then keep choosing safe local actions." effect={`${mission.communications.oneWayDelayMinutes} min each way | reply appears in the log`} disabled={!missionActive || messageQueued} onChoose={requestEarth} /></section>
      </div><div className="action-row"><button className="secondary-button" onClick={() => setScreen('dashboard')}>Check the dashboard</button></div></section>}

      {screen === 'log' && <section className="content-grid log-layout"><article className="panel"><p className="eyebrow">Mission log</p><h1>What changed?</h1><p className="dashboard-helper">New events appear at the top. Each one tells you what happened and why.</p><div className="log-list" aria-live="polite">{mission.mission.eventHistory.map((entry) => <div className="log-entry" key={entry.id}><span>T+{entry.atHours.toFixed(1)} mission hours</span><h2>{entry.title}</h2><p>{entry.detail}</p></div>)}</div></article><aside className="panel log-help"><p className="eyebrow">Cause and effect</p><h2>Systems work together</h2><p>Power runs the water recycler and plant lights. Water supports crew and crops. Shelter changes what the crew can do.</p><button className="primary-button" onClick={() => setScreen('debrief')}>Open my debrief</button></aside></section>}

      {screen === 'debrief' && <section className="hero panel"><p className="eyebrow">Mission debrief</p><h1>{mission.mission.status === 'active' ? 'Your mission is still running.' : mission.mission.status === 'success' ? 'Great work - your crew made it through a sol of mission time.' : 'This mission needs another try.'}</h1><p className="lead">Your outpost is <strong>{status.toLowerCase()}</strong>. You made {mission.mission.processedActionIds.length} choice{mission.mission.processedActionIds.length === 1 ? '' : 's'} over {mission.time.elapsedHours} simplified mission hours.</p><div className="fact-row"><div><strong>Power</strong><span>{Math.round(mission.power.storedEnergyKwh)} kWh remains. Your power choices affected water and food.</span></div><div><strong>Crew and safety</strong><span>Crew condition: {Math.round(mission.crew.conditionIndex)} / 100 game index. Radiation remains a game index, not a dose.</span></div><div><strong>Try a new plan</strong><span>Compare saving power early, protecting water, sheltering, and acting before Earth replies.</span></div></div>{missionActive && <p className="fine-print">Advance time from the dashboard to reach an outcome. Your choices have no shortcut around consequences.</p>}<div className="action-row"><button className="primary-button" onClick={replayMission}>Play again</button><button className="secondary-button" onClick={() => setScreen('dashboard')}>Return to dashboard</button></div></section>}
    </main>
    <footer>RED HORIZON is a student project, not an official NASA product. NASA facts are clearly labeled historical references.</footer>
  </div>
}

function statusForLowValue(value: number, critical: number, watch: number, criticalLabel: string, watchLabel: string, goodLabel: string) {
  if (value < critical) return { label: criticalLabel, tone: 'alert' }
  if (value < watch) return { label: watchLabel, tone: 'watch' }
  return { label: goodLabel, tone: 'good' }
}

function IncidentSection({ label, title, text, children }: { label: string; title: string; text: string; children: ReactNode }) {
  return <section className="incident-section"><div><p className="eyebrow">{label}</p><h2>{title}</h2><p>{text}</p></div><div className="decision-grid">{children}</div></section>
}

function ResourceCard({ icon, name, value, meterValue, description, status, statusTone, tone }: { icon: string; name: string; value: string; meterValue: number; description: string; status: string; statusTone: string; tone: string }) {
  const boundedMeter = Math.max(0, Math.min(100, meterValue))
  return <article className={`resource-card ${tone}`}><div className="resource-card-top"><span className="resource-icon" aria-hidden="true">{icon}</span><div><p className="card-label">{name}</p><p className={`status-label ${statusTone}`}>{status}</p></div></div><h2>{value}</h2><div className="meter" role="progressbar" aria-label={`${name}: ${value}. ${status}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(boundedMeter)}><span style={{ width: `${boundedMeter}%` }} /></div><p>{description}</p></article>
}

function DecisionCard({ title, text, effect, onChoose, disabled = false }: { title: string; text: string; effect: string; onChoose: () => void; disabled?: boolean }) {
  return <article className="decision-card"><h2>{title}</h2><p>{text}</p><strong>{effect}</strong><button className="primary-button" onClick={onChoose} disabled={disabled}>Choose this plan</button></article>
}

export default App
