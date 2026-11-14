import { useState } from 'react'
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
  const currentTime = `Sol ${mission.time.sol} · ${String(Math.floor(mission.time.solHours)).padStart(2, '0')}:${String(Math.round((mission.time.solHours % 1) * 60)).padStart(2, '0')}`
  const messageQueued = mission.communications.pendingIncoming.length > 0
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
        <button className="brand" onClick={() => setScreen('intro')} aria-label="Return to mission intro">
          <span className="brand-mark">RH</span>
          <span>RED HORIZON <small>Junior Astronaut Mission Trainer</small></span>
        </button>
        <div className="mission-chip">Fictional scenario · Sol 214</div>
      </header>

      <nav className="screen-nav" aria-label="Mission screens">
        {screens.map((item) => (
          <button
            key={item.id}
            className={screen === item.id ? 'nav-button active' : 'nav-button'}
            onClick={() => setScreen(item.id)}
            aria-current={screen === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main>
        {screen === 'intro' && (
          <section className="hero panel">
            <p className="eyebrow">Mission trainer · ages 7–12</p>
            <h1>Sol 214: Outpost Survival</h1>
            <p className="lead">You are in charge of a Mars research outpost. Keep the crew safe, share limited supplies, and choose what to do next.</p>
            <div className="fact-row">
              <div><strong>Where?</strong><span>Fictional Mars outpost</span></div>
              <div><strong>What is a sol?</strong><span>A Martian day: about 24 h 39 min 35 s</span></div>
              <div><strong>How do turns work?</strong><span>Each turn is a simplified 2-Martian-hour step</span></div>
            </div>
            <button className="primary-button" onClick={() => setScreen('briefing')}>Read mission briefing</button>
          </section>
        )}

        {screen === 'briefing' && (
          <section className="content-grid">
            <article className="panel story-panel">
              <p className="eyebrow">Mission briefing</p>
              <h1>A dusty day, a busy crew</h1>
              <p>Dust has reduced solar power. The crew must decide when to run water recovery, protect plants, and use the shielded room during a space-weather alert.</p>
              <ul>
                <li>Power runs every outpost system.</li>
                <li>Life support means oxygen, water recovery, and clean cabin air.</li>
                <li>Messages to Earth take time, so crew choices matter.</li>
              </ul>
              <button className="primary-button" onClick={() => setScreen('dashboard')}>Open command dashboard</button>
            </article>
            <aside className="panel data-status">
              <p className="eyebrow">NASA data status</p>
              <h2>Simulation Data</h2>
              <p>All displayed mission values are fictional demo values for this scaffold. No NASA live data or NASA snapshot is loaded.</p>
              <p className="fine-print">When a real, attributed NASA snapshot with source metadata is integrated, this area may state “NASA Snapshot Loaded.”</p>
            </aside>
          </section>
        )}

        {screen === 'dashboard' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Command dashboard</p>
                <h1>{status}</h1>
                <p>{currentTime} · {mission.time.elapsedHours} elapsed simulation hours</p>
              </div>
              <button className="secondary-button" onClick={advanceTime}>Advance 2 Martian hours</button>
            </div>
            <div className="resource-grid">
              <ResourceCard name="Power" value={`${Math.round(mission.power.storedEnergyKwh)} kWh`} meterValue={(mission.power.storedEnergyKwh / mission.power.batteryCapacityKwh) * 100} description={`${(mission.power.solarGenerationKw * mission.power.dustStormMultiplier).toFixed(1)} kW solar generation in this fictional model`} tone="gold" />
              <ResourceCard name="Life Support" value={`${Math.round(mission.lifeSupport.systemHealthIndex)}%`} meterValue={mission.lifeSupport.systemHealthIndex} description={`${Math.round(mission.lifeSupport.waterGameUnits)} water game units · recovery ${Math.round(mission.lifeSupport.waterRecoveryCondition)}%`} tone="blue" />
              <ResourceCard name="Food" value={`${mission.food.storedFoodCrewDays.toFixed(1)} crew-days`} meterValue={Math.min(100, mission.food.storedFoodCrewDays * 4)} description={`Crop progress ${Math.round(mission.food.cropGrowthProgress)}% · lighting ${mission.food.greenhouseLightingEnabled ? 'on' : 'off'}`} tone="green" />
              <ResourceCard name="Radiation Risk" value={`${Math.round(mission.radiation.hazardIndex)} / 100`} meterValue={mission.radiation.hazardIndex} description="A simulation hazard index — not dose data" tone="red" />
              <article className="resource-card communications-card">
                <p className="card-label">Communications</p>
                <h2>{messageQueued ? 'Reply travelling' : `${mission.communications.oneWayDelayMinutes} min one way`}</h2>
                <p>Fictional Earth–Mars light-time delay. Autonomous crew choices remain available.</p>
                <button className="text-button" onClick={requestEarth} disabled={messageQueued}>
                  {messageQueued ? 'Awaiting reply' : 'Ask Earth for advice'}
                </button>
              </article>
            </div>
            <div className="action-row">
              <button className="primary-button" onClick={() => setScreen('decisions')}>Make a crew decision</button>
              <button className="secondary-button" onClick={() => setScreen('log')}>View what changed</button>
            </div>
          </section>
        )}

        {screen === 'decisions' && (
          <section>
            <div className="section-heading"><div><p className="eyebrow">Decision panel</p><h1>Pick one helpful trade-off</h1><p>No choice is free. Watch the dashboard after each choice.</p></div></div>
            <div className="decision-grid">
              <DecisionCard title="Save power" text="Reduce noncritical loads. Life support stays prioritized, but greenhouse lighting pauses." effect="Battery drain slows · crop growth pauses" onChoose={() => dispatch({ id: `loads-${mission.time.elapsedHours}`, type: 'reduceNonCriticalLoads' })} />
              <DecisionCard title="Repair water recovery" text="Send crew to repair the malfunction. It takes four simulation hours, electricity, and effort." effect="Water recovery improves later · workload rises" onChoose={() => dispatch({ id: `repair-${mission.time.elapsedHours}`, type: 'startWaterRecoveryRepair' })} />
              <DecisionCard title={mission.radiation.sheltered ? 'Leave shielded room' : 'Use shielded room'} text="Choose shelter during the space-weather warning. Shelter slows the simulation risk increase." effect="Lower risk growth · less crew freedom" onChoose={() => dispatch({ id: `shelter-${mission.time.elapsedHours}-${!mission.radiation.sheltered}`, type: 'toggleShelter', sheltered: !mission.radiation.sheltered })} />
              <DecisionCard title={mission.food.greenhouseLightingEnabled ? 'Pause greenhouse lights' : 'Restore greenhouse lights'} text="Crops only grow over simulated time with lighting, water, nutrients, and available power." effect="Save power now or protect future food" onChoose={() => dispatch({ id: `greenhouse-${mission.time.elapsedHours}-${!mission.food.greenhouseLightingEnabled}`, type: 'toggleGreenhouseLighting', enabled: !mission.food.greenhouseLightingEnabled })} />
              <DecisionCard title="Use stored water" text="Use reserve water instead of waiting for the repair. This can only happen once." effect="Reserves −8 game units · life support steadies" onChoose={() => dispatch({ id: `stored-water-${mission.time.elapsedHours}`, type: 'useStoredWater' })} />
            </div>
            <div className="action-row"><button className="secondary-button" onClick={advanceTime}>Advance 2 Martian hours</button><button className="primary-button" onClick={() => setScreen('dashboard')}>Check dashboard</button></div>
          </section>
        )}

        {screen === 'log' && (
          <section className="content-grid log-layout">
            <article className="panel">
              <p className="eyebrow">Consequence log</p>
              <h1>What changed, and why?</h1>
              <div className="log-list" aria-live="polite">
                {mission.mission.eventHistory.map((entry) => <div className="log-entry" key={entry.id}><span>T+{entry.atHours.toFixed(1)} simulation hours</span><h2>{entry.title}</h2><p>{entry.detail}</p></div>)}
              </div>
            </article>
            <aside className="panel"><p className="eyebrow">Cause and effect</p><h2>Systems are connected</h2><p>Power can help water recovery. Water recovery helps life support. Time changes every system.</p><button className="primary-button" onClick={() => setScreen('debrief')}>See mission debrief</button></aside>
          </section>
        )}

        {screen === 'debrief' && (
          <section className="hero panel">
            <p className="eyebrow">Mission debrief</p>
            <h1>Every choice teaches a systems lesson.</h1>
            <p className="lead">Your outpost is currently <strong>{status.toLowerCase()}</strong>. You made {mission.mission.processedActionIds.length} decision{mission.mission.processedActionIds.length === 1 ? '' : 's'} over {mission.time.elapsedHours} simplified simulation hours.</p>
            <div className="fact-row"><div><strong>Power</strong><span>Energy choices can affect water and food.</span></div><div><strong>Radiation</strong><span>Shielding lowers a game risk index; it is not a dose reading.</span></div><div><strong>Autonomy</strong><span>Crews may need safe choices before an Earth reply arrives.</span></div></div>
            <div className="action-row"><button className="primary-button" onClick={replayMission}>Replay mission</button><button className="secondary-button" onClick={() => setScreen('dashboard')}>Return to dashboard</button></div>
          </section>
        )}
      </main>

      <footer>RED HORIZON is a student hackathon project and is not an official NASA product.</footer>
    </div>
  )
}

function ResourceCard({ name, value, meterValue, description, tone }: { name: string; value: string; meterValue: number; description: string; tone: string }) {
  const boundedMeter = Math.max(0, Math.min(100, meterValue))
  return <article className={`resource-card ${tone}`}><p className="card-label">{name}</p><h2>{value}</h2><div className="meter" aria-label={`${name}: ${value}`}><span style={{ width: `${boundedMeter}%` }} /></div><p>{description}</p></article>
}

function DecisionCard({ title, text, effect, onChoose }: { title: string; text: string; effect: string; onChoose: () => void }) {
  return <article className="decision-card"><h2>{title}</h2><p>{text}</p><strong>{effect}</strong><button className="primary-button" onClick={onChoose}>Choose this plan</button></article>
}

export default App
