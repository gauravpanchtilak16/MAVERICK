import { useState } from 'react'

type Screen = 'intro' | 'briefing' | 'dashboard' | 'decisions' | 'log' | 'debrief'
type ResourceName = 'power' | 'lifeSupport' | 'food' | 'radiation'

type Resources = Record<ResourceName, number>

type LogEntry = {
  id: number
  title: string
  detail: string
  time: string
}

const initialResources: Resources = {
  power: 72,
  lifeSupport: 80,
  food: 65,
  radiation: 35,
}

const initialLog: LogEntry[] = [
  {
    id: 0,
    title: 'Mission started',
    detail: 'Sol 214 begins. These are fictional simulation values, not live NASA readings.',
    time: 'Sol 214 · 06:00',
  },
]

const screens: { id: Screen; label: string }[] = [
  { id: 'intro', label: 'Mission intro' },
  { id: 'briefing', label: 'Briefing' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'log', label: 'Consequence log' },
  { id: 'debrief', label: 'Debrief' },
]

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [resources, setResources] = useState<Resources>(initialResources)
  const [turn, setTurn] = useState(0)
  const [messageQueued, setMessageQueued] = useState(false)
  const [log, setLog] = useState<LogEntry[]>(initialLog)

  const currentTime = `Sol 214 · ${String(6 + turn * 2).padStart(2, '0')}:00`
  const addLog = (title: string, detail: string) => {
    setLog((entries) => [{ id: Date.now(), title, detail, time: currentTime }, ...entries])
  }

  const applyDecision = (title: string, detail: string, changes: Partial<Resources>) => {
    setResources((current) => {
      const next = { ...current }
      for (const [key, amount] of Object.entries(changes)) {
        const resource = key as ResourceName
        next[resource] = clamp(next[resource] + (amount ?? 0))
      }
      return next
    })
    addLog(title, detail)
  }

  const advanceTime = () => {
    const nextTurn = turn + 1
    setTurn(nextTurn)
    setResources((current) => ({
      power: clamp(current.power - 6),
      lifeSupport: clamp(current.lifeSupport - 4),
      food: clamp(current.food - 2),
      radiation: clamp(current.radiation + 3),
    }))
    addLog('Time advanced', 'A simplified 2-Martian-hour gameplay turn passed. Outpost systems used supplies.')
    if (messageQueued) {
      setMessageQueued(false)
      addLog('Earth reply arrived', 'Mission Control confirms: keep the crew ready to make safe local choices while messages travel.')
    }
  }

  const requestEarth = () => {
    if (messageQueued) return
    setMessageQueued(true)
    addLog('Message sent to Earth', 'A fictional advice request is travelling. The scenario delay is 18 minutes one way.')
  }

  const resetMission = () => {
    setResources(initialResources)
    setTurn(0)
    setMessageQueued(false)
    setLog(initialLog)
    setScreen('intro')
  }

  const status = resources.radiation > 65 || resources.lifeSupport < 35 || resources.power < 25
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
                <p>{currentTime} · Turn {turn} of this simplified mission</p>
              </div>
              <button className="secondary-button" onClick={advanceTime}>Advance 2 Martian hours</button>
            </div>
            <div className="resource-grid">
              <ResourceCard name="Power" value={resources.power} description="Battery and solar energy available" tone="gold" />
              <ResourceCard name="Life Support" value={resources.lifeSupport} description="Oxygen, water recovery, and cabin air" tone="blue" />
              <ResourceCard name="Food" value={resources.food} description="Stored meals and growing crops" tone="green" />
              <ResourceCard name="Radiation Risk" value={resources.radiation} description="A simulation risk index — not dose data" tone="red" inverse />
              <article className="resource-card communications-card">
                <p className="card-label">Communications</p>
                <h2>{messageQueued ? 'Message travelling' : '18 min one way'}</h2>
                <p>Earth–Mars light-time delay in this fictional scenario.</p>
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
              <DecisionCard title="Save power" text="Pause non-essential plant lights to protect the battery." effect="Power +10 · Food −5" onChoose={() => applyDecision('Power saved', 'Non-essential plant lights were paused. The battery recovered, but crop growth slowed.', { power: 10, food: -5 })} />
              <DecisionCard title="Run water recovery" text="Use power to clean and recycle more water for the crew." effect="Life Support +12 · Power −10" onChoose={() => applyDecision('Water recovery started', 'Water recovery improved life support and used electrical power.', { lifeSupport: 12, power: -10 })} />
              <DecisionCard title="Use the shielded room" text="Move the crew into extra shielding during the alert." effect="Radiation Risk −14 · Food −3" onChoose={() => applyDecision('Crew sheltered', 'The crew used the shielded room. Radiation risk fell, but food supplies were used sooner.', { radiation: -14, food: -3 })} />
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
                {log.map((entry) => <div className="log-entry" key={entry.id}><span>{entry.time}</span><h2>{entry.title}</h2><p>{entry.detail}</p></div>)}
              </div>
            </article>
            <aside className="panel"><p className="eyebrow">Cause and effect</p><h2>Systems are connected</h2><p>Power can help water recovery. Water recovery helps life support. Time changes every system.</p><button className="primary-button" onClick={() => setScreen('debrief')}>See mission debrief</button></aside>
          </section>
        )}

        {screen === 'debrief' && (
          <section className="hero panel">
            <p className="eyebrow">Mission debrief</p>
            <h1>Every choice teaches a systems lesson.</h1>
            <p className="lead">Your outpost is currently <strong>{status.toLowerCase()}</strong>. You made {Math.max(0, log.length - 1)} logged choice{log.length === 2 ? '' : 's'} over {turn} simplified time step{turn === 1 ? '' : 's'}.</p>
            <div className="fact-row"><div><strong>Power</strong><span>Energy choices can affect water and food.</span></div><div><strong>Radiation</strong><span>Shielding lowers a game risk index; it is not a dose reading.</span></div><div><strong>Autonomy</strong><span>Crews may need safe choices before an Earth reply arrives.</span></div></div>
            <div className="action-row"><button className="primary-button" onClick={resetMission}>Replay mission</button><button className="secondary-button" onClick={() => setScreen('dashboard')}>Return to dashboard</button></div>
          </section>
        )}
      </main>

      <footer>RED HORIZON is a student hackathon project and is not an official NASA product.</footer>
    </div>
  )
}

function ResourceCard({ name, value, description, tone, inverse = false }: { name: string; value: number; description: string; tone: string; inverse?: boolean }) {
  const label = inverse ? `${value} / 100` : `${value}%`
  return <article className={`resource-card ${tone}`}><p className="card-label">{name}</p><h2>{label}</h2><div className="meter" aria-label={`${name}: ${label}`}><span style={{ width: `${value}%` }} /></div><p>{description}</p></article>
}

function DecisionCard({ title, text, effect, onChoose }: { title: string; text: string; effect: string; onChoose: () => void }) {
  return <article className="decision-card"><h2>{title}</h2><p>{text}</p><strong>{effect}</strong><button className="primary-button" onClick={onChoose}>Choose this plan</button></article>
}

export default App
