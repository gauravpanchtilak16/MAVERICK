import { useState, type ReactNode } from 'react'
import { NASA_DATA_CENTER } from './data/nasaSnapshots'
import { createInitialMission } from './game/initialState'
import { applyPlayerDecision, resetMission } from './game/simulation'
import type { PlayerAction } from './game/types'

type Screen = 'intro' | 'briefing' | 'dashboard' | 'decisions' | 'log' | 'debrief'

const screens: { id: Screen; label: string }[] = [
  { id: 'intro', label: 'Mission intro' },
  { id: 'briefing', label: 'Briefing' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'log', label: 'Consequence log' },
  { id: 'debrief', label: 'Debrief' },
]

function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [mission, setMission] = useState(createInitialMission)
  const dispatch = (action: PlayerAction) => setMission((current) => applyPlayerDecision(current, action))
  const advanceTime = () => dispatch({ id: `advance-${mission.time.elapsedHours + 2}`, type: 'advanceTime', hours: 2 })
  const requestEarth = () => dispatch({ id: `earth-${mission.communications.nextMessageNumber}`, type: 'sendMessage', text: 'Requesting safe next-step advice.' })
  const replayMission = () => {
    setMission(resetMission())
    setScreen('intro')
  }

  const currentTime = `Sol ${mission.time.sol} at ${String(Math.floor(mission.time.solHours)).padStart(2, '0')}:${String(Math.round((mission.time.solHours % 1) * 60)).padStart(2, '0')}`
  const messageQueued = mission.communications.pendingIncoming.length > 0
  const missionActive = mission.mission.status === 'active'
  const status = mission.mission.status === 'failed'
    ? 'Mission needs a restart'
    : mission.mission.status === 'success'
      ? 'Mission objectives complete'
      : mission.radiation.hazardIndex > 65 || mission.lifeSupport.systemHealthIndex < 45 || mission.power.storedEnergyKwh < 10
        ? 'Needs attention'
        : 'Stable for now'

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('intro')} aria-label="Return to mission intro"><span className="brand-mark">RH</span><span>RED HORIZON <small>Junior Astronaut Mission Trainer</small></span></button>
        <div className="mission-chip">Fictional scenario - Sol 214</div>
      </header>

      <nav className="screen-nav" aria-label="Mission screens">
        {screens.map((item) => <button key={item.id} className={screen === item.id ? 'nav-button active' : 'nav-button'} onClick={() => setScreen(item.id)} aria-current={screen === item.id ? 'page' : undefined}>{item.label}</button>)}
      </nav>

      <main>
        {screen === 'intro' && <section className="hero panel">
          <p className="eyebrow">Mission trainer - ages 7 to 12</p><h1>Sol 214: Outpost Survival</h1>
          <p className="lead">You are the Mars outpost commander. Guide four astronauts through one Martian sol by protecting power, life support, food, radiation safety, and messages to Earth.</p>
          <div className="fact-row"><div><strong>Commander&apos;s crew</strong><span>{mission.crew.count} astronauts depend on your choices.</span></div><div><strong>Mission duration</strong><span>Survive one sol: about 24 hours, 39 minutes, and 35 seconds.</span></div><div><strong>Mission objective</strong><span>Keep resources above zero and crew condition high enough to finish.</span></div></div>
          <button className="primary-button" onClick={() => setScreen('briefing')}>Read mission briefing</button>
        </section>}

        {screen === 'briefing' && <section className="content-grid">
          <article className="panel story-panel"><p className="eyebrow">Mission briefing</p><h1>A dusty day, a busy crew</h1><p><strong>Fictional mission conditions:</strong> a dust storm reduces solar generation, water recovery is weak, and the crew has a space-weather warning.</p><ul><li><strong>Solar energy:</strong> panels collect sunlight to charge the battery.</li><li><strong>Life support:</strong> oxygen game units, water recovery, and clean cabin air help the crew.</li><li><strong>Plant growth:</strong> crops need time, light, water, nutrients, and power.</li><li><strong>Communication delay:</strong> Earth&apos;s advice arrives later, so the crew must make safe local choices.</li></ul><p className="fine-print">Mission values are game assumptions. NASA observations in the Data Center are separate historical learning references.</p><button className="primary-button" onClick={() => setScreen('dashboard')}>Open command dashboard</button></article>
          <aside className="panel data-status"><p className="eyebrow">NASA Data Center</p><h2>{NASA_DATA_CENTER.status}</h2><p><strong>Connected sources:</strong> NASA DONKI, NASA OSDR RadLab, and the MSL RAD Level-2 dataset reference.</p><p><strong>Data freshness:</strong> {NASA_DATA_CENTER.freshness}</p><h3>Latest verified cached space-weather record</h3><p><strong>{NASA_DATA_CENTER.spaceWeather.eventType}</strong><br />{NASA_DATA_CENTER.spaceWeather.recordIdentifier}<br />Observed: {NASA_DATA_CENTER.spaceWeather.observationDate}<br />Retrieved: {NASA_DATA_CENTER.spaceWeather.retrievedAtUtc}</p><p className="fine-print">{NASA_DATA_CENTER.spaceWeather.description} This informs the fictional alert only; it does not set the game risk index.</p><a className="source-link" href={NASA_DATA_CENTER.spaceWeather.sourceReferences[0]} target="_blank" rel="noreferrer">Open NASA DONKI record</a><h3>Mars radiation reference</h3><p><strong>{NASA_DATA_CENTER.marsRadiation.measurementField}</strong>: {NASA_DATA_CENTER.marsRadiation.measurementValue} {NASA_DATA_CENTER.marsRadiation.originalUnit}<br />{NASA_DATA_CENTER.marsRadiation.instrumentId} - {NASA_DATA_CENTER.marsRadiation.trajectory}<br />Observed: {NASA_DATA_CENTER.marsRadiation.observationDate}<br />Retrieved: {NASA_DATA_CENTER.marsRadiation.retrievedAtUtc}</p><p className="fine-print">{NASA_DATA_CENTER.marsRadiation.qualityStatus} {NASA_DATA_CENTER.marsRadiation.limitations}</p><a className="source-link" href={NASA_DATA_CENTER.marsRadiation.sourceUrl} target="_blank" rel="noreferrer">Open NASA RadLab query</a><p className="fine-print">Dataset context: <a className="source-link" href={NASA_DATA_CENTER.mslRadReference.sourceUrl} target="_blank" rel="noreferrer">MSL RAD Level 2 reference</a>. No Level-2 row is displayed or inferred.</p></aside>
        </section>}

        {screen === 'dashboard' && <section>
          <div className="section-heading"><div><p className="eyebrow">Command dashboard</p><h1>{status}</h1><p>{currentTime} - {mission.time.elapsedHours} elapsed simulation hours</p></div><button className="secondary-button" onClick={advanceTime} disabled={!missionActive}>Advance 2 Martian hours</button></div>
          <div className="resource-grid">
            <ResourceCard name="Battery power" value={`${Math.round(mission.power.storedEnergyKwh)} kWh`} meterValue={(mission.power.storedEnergyKwh / mission.power.batteryCapacityKwh) * 100} description={`${(mission.power.solarGenerationKw * mission.power.dustStormMultiplier).toFixed(1)} kW fictional solar generation`} tone="gold" />
            <ResourceCard name="Oxygen" value={`${Math.round(mission.lifeSupport.oxygenGameUnits)} game units`} meterValue={mission.lifeSupport.oxygenGameUnits} description="A simplified supply indicator, not a medical threshold." tone="blue" />
            <ResourceCard name="Water" value={`${Math.round(mission.lifeSupport.waterGameUnits)} game units`} meterValue={mission.lifeSupport.waterGameUnits} description={`Recovery condition: ${Math.round(mission.lifeSupport.waterRecoveryCondition)}%`} tone="blue" />
            <ResourceCard name="Life support" value={`${Math.round(mission.lifeSupport.systemHealthIndex)}%`} meterValue={mission.lifeSupport.systemHealthIndex} description={`Cabin-air condition: ${Math.round(mission.lifeSupport.co2ConditionIndex)}%`} tone="blue" />
            <ResourceCard name="Food" value={`${mission.food.storedFoodCrewDays.toFixed(1)} crew-days`} meterValue={Math.min(100, mission.food.storedFoodCrewDays * 4)} description={`Crop progress ${Math.round(mission.food.cropGrowthProgress)}% - lights ${mission.food.greenhouseLightingEnabled ? 'on' : 'off'}`} tone="green" />
            <ResourceCard name="Radiation risk" value={`${Math.round(mission.radiation.hazardIndex)} / 100`} meterValue={mission.radiation.hazardIndex} description="A simulation index, not NASA dose data." tone="red" />
            <ResourceCard name="Crew condition" value={`${Math.round(mission.crew.conditionIndex)}%`} meterValue={mission.crew.conditionIndex} description={`Fatigue ${Math.round(mission.crew.fatigueIndex)} / 100 - workload ${Math.round(mission.crew.workloadIndex)} / 100`} tone="green" />
            <article className="resource-card communications-card"><p className="card-label">Communications</p><h2>{messageQueued ? 'Reply travelling' : `${mission.communications.oneWayDelayMinutes} min one way`}</h2><p>Fictional Earth-Mars light-time delay. Autonomous crew choices remain available.</p><button className="text-button" onClick={requestEarth} disabled={messageQueued || !missionActive}>{messageQueued ? 'Awaiting reply' : 'Ask Earth for advice'}</button></article>
          </div>
          <div className="action-row"><button className="primary-button" onClick={() => setScreen('decisions')}>Make a crew decision</button><button className="secondary-button" onClick={() => setScreen('log')}>View what changed</button></div>
        </section>}

        {screen === 'decisions' && <section>
          <div className="section-heading"><div><p className="eyebrow">Decision panel</p><h1>Three connected incidents</h1><p>Every decision changes the mission state. Advance time to reveal delayed effects.</p></div></div>
          <div className="incident-stack">
            <IncidentSection label="Incident one" title="Martian dust storm" text="Solar generation is reduced. Keep critical life support powered, even if other systems must wait."><DecisionCard title="Activate low-power mode" text="Reduce noncritical loads. Life support stays prioritized, but greenhouse lighting pauses." effect="Battery drain slows - crop growth pauses" disabled={!missionActive || mission.power.nonCriticalLoadsReduced} onChoose={() => dispatch({ id: `loads-${mission.time.elapsedHours}`, type: 'reduceNonCriticalLoads' })} /><DecisionCard title={mission.food.greenhouseLightingEnabled ? 'Pause greenhouse lights' : 'Restore greenhouse lights'} text="Plants need light, water, nutrients, and power over time." effect="Save power now or protect future food" disabled={!missionActive} onChoose={() => dispatch({ id: `greenhouse-${mission.time.elapsedHours}-${!mission.food.greenhouseLightingEnabled}`, type: 'toggleGreenhouseLighting', enabled: !mission.food.greenhouseLightingEnabled })} /></IncidentSection>
            <IncidentSection label="Incident two" title="Radiation emergency" text={`NASA DONKI record ${mission.radiation.scenarioReference.recordIdentifier ?? 'unavailable'} informs this educational warning. It is not a Mars dose reading.`}><DecisionCard title={mission.radiation.sheltered ? 'Continue operations outside shelter' : 'Enter radiation shelter'} text="Sheltering slows the simulation risk increase but pauses water-recovery repair work." effect="Lower simulation risk - delayed repairs" disabled={!missionActive} onChoose={() => dispatch({ id: `shelter-${mission.time.elapsedHours}-${!mission.radiation.sheltered}`, type: 'toggleShelter', sheltered: !mission.radiation.sheltered })} /><DecisionCard title={mission.radiation.shieldingAllocated ? 'Shielding allocated' : 'Allocate emergency shielding'} text="Commit the one available shielding supply to the crew area." effect="Shielding supplies -1 - slower risk growth" disabled={!missionActive || mission.radiation.shieldingAllocated} onChoose={() => dispatch({ id: `shielding-${mission.time.elapsedHours}`, type: 'allocateShielding' })} /></IncidentSection>
            <IncidentSection label="Incident three" title="Water recovery failure" text="Choose a repair, use stored reserves, or protect water by changing greenhouse operations."><DecisionCard title="Repair water recovery" text="Crew repair takes four simulation hours, electricity, and effort." effect="Water recovery improves later - workload rises" disabled={!missionActive || mission.lifeSupport.repairHoursRemaining > 0 || mission.lifeSupport.waterRecoveryCondition >= 85} onChoose={() => dispatch({ id: `repair-${mission.time.elapsedHours}`, type: 'startWaterRecoveryRepair' })} /><DecisionCard title="Use stored water" text="Use reserve water instead of waiting for repair. This can only happen once." effect="Reserves -8 game units - life support steadies" disabled={!missionActive || mission.lifeSupport.storedWaterAllocated} onChoose={() => dispatch({ id: `stored-water-${mission.time.elapsedHours}`, type: 'useStoredWater' })} /><DecisionCard title={mission.food.waterConservationMode ? 'Return greenhouse to normal water use' : 'Reduce greenhouse water use'} text="Water-saving mode protects reserves but makes crops grow more slowly." effect="Water use falls - crop growth slows" disabled={!missionActive} onChoose={() => dispatch({ id: `greenhouse-water-${mission.time.elapsedHours}-${!mission.food.waterConservationMode}`, type: 'toggleGreenhouseWaterConservation', enabled: !mission.food.waterConservationMode })} /></IncidentSection>
            <section className="incident-section comms-section"><div><p className="eyebrow">Crew autonomy</p><h2>Ask Earth, then act safely anyway</h2><p>Earth&apos;s fictional reply needs two one-way signal delays. The crew cannot pause the mission while waiting.</p></div><DecisionCard title={messageQueued ? 'Earth reply is travelling' : 'Ask Earth for advice'} text="Send a message, then keep making safe local choices while the response travels." effect={`${mission.communications.oneWayDelayMinutes} min each way - delayed consequence in the log`} disabled={!missionActive || messageQueued} onChoose={requestEarth} /></section>
          </div>
          <div className="action-row"><button className="secondary-button" onClick={advanceTime} disabled={!missionActive}>Advance 2 Martian hours</button><button className="primary-button" onClick={() => setScreen('dashboard')}>Check dashboard</button></div>
        </section>}

        {screen === 'log' && <section className="content-grid log-layout"><article className="panel"><p className="eyebrow">Consequence log</p><h1>What changed, and why?</h1><div className="log-list" aria-live="polite">{mission.mission.eventHistory.map((entry) => <div className="log-entry" key={entry.id}><span>T+{entry.atHours.toFixed(1)} simulation hours</span><h2>{entry.title}</h2><p>{entry.detail}</p></div>)}</div></article><aside className="panel"><p className="eyebrow">Cause and effect</p><h2>Systems are connected</h2><p>Each entry explains an immediate change. Advance time to see delayed crop growth, repairs, battery drain, and an Earth reply.</p><p className="fine-print">Power runs water recovery and greenhouse lights. Water supports crew and crops. Shelter changes operations during the fictional warning.</p><button className="primary-button" onClick={() => setScreen('debrief')}>Check mission debrief</button></aside></section>}

        {screen === 'debrief' && <section className="hero panel"><p className="eyebrow">Mission debrief</p><h1>{mission.mission.status === 'active' ? 'Mission still in progress.' : mission.mission.status === 'success' ? 'Mission complete: crew made it through Sol 214.' : 'Mission paused: use what you learned for the next attempt.'}</h1><p className="lead">Your outpost is currently <strong>{status.toLowerCase()}</strong>. You made {mission.mission.processedActionIds.length} decision{mission.mission.processedActionIds.length === 1 ? '' : 's'} over {mission.time.elapsedHours} simplified simulation hours.</p><div className="fact-row"><div><strong>Power efficiency</strong><span>{Math.round(mission.power.storedEnergyKwh)} kWh remains. Energy choices affected water and food.</span></div><div><strong>Crew and safety</strong><span>Crew condition: {Math.round(mission.crew.conditionIndex)}%. Radiation remains a simulation index, not a dose.</span></div><div><strong>Try another strategy</strong><span>Compare early power saving, water conservation, sheltering, and independent crew choices.</span></div></div>{missionActive && <p className="fine-print">Advance time on the dashboard to reach a mission outcome. There is no shortcut past the consequences.</p>}<div className="action-row"><button className="primary-button" onClick={replayMission}>Replay mission</button><button className="secondary-button" onClick={() => setScreen('dashboard')}>Return to dashboard</button></div></section>}
      </main>

      <footer>RED HORIZON is a student hackathon project and is not an official NASA product.</footer>
    </div>
  )
}

function IncidentSection({ label, title, text, children }: { label: string; title: string; text: string; children: ReactNode }) {
  return <section className="incident-section"><div><p className="eyebrow">{label}</p><h2>{title}</h2><p>{text}</p></div><div className="decision-grid">{children}</div></section>
}

function ResourceCard({ name, value, meterValue, description, tone }: { name: string; value: string; meterValue: number; description: string; tone: string }) {
  const boundedMeter = Math.max(0, Math.min(100, meterValue))
  return <article className={`resource-card ${tone}`}><p className="card-label">{name}</p><h2>{value}</h2><div className="meter" aria-label={`${name}: ${value}`}><span style={{ width: `${boundedMeter}%` }} /></div><p>{description}</p></article>
}

function DecisionCard({ title, text, effect, onChoose, disabled = false }: { title: string; text: string; effect: string; onChoose: () => void; disabled?: boolean }) {
  return <article className="decision-card"><h2>{title}</h2><p>{text}</p><strong>{effect}</strong><button className="primary-button" onClick={onChoose} disabled={disabled}>Choose this plan</button></article>
}

export default App
