import { describe, expect, it } from 'vitest'
import { createInitialMission } from '../initialState'
import { advanceSimulation, applyPlayerDecision, checkMissionStatus, resetMission, updatePower } from '../simulation'
import { MARTIAN_SOL_HOURS } from '../types'

describe('RED HORIZON deterministic simulation engine', () => {
  it('creates a bounded, fictional initial mission state', () => {
    const state = createInitialMission()
    expect(state.time.sol).toBe(214)
    expect(state.crew.count).toBe(4)
    expect(state.power.storedEnergyKwh).toBeLessThanOrEqual(state.power.batteryCapacityKwh)
    expect(state.radiation.hazardIndex).toBe(52)
    expect(state.mission.activeEmergencies).toEqual(['dustStorm', 'waterRecoveryFailure', 'radiationAlert'])
  })

  it('uses net kW multiplied by elapsed hours and reduces battery energy during the dust storm', () => {
    const initial = createInitialMission()
    const power = updatePower(initial, 2)
    expect(power.storedEnergyKwh).toBeLessThan(initial.power.storedEnergyKwh)
    expect(power.storedEnergyKwh).toBeGreaterThanOrEqual(0)
  })

  it('clamps battery depletion at zero without producing invalid numbers', () => {
    const state = createInitialMission()
    state.power.storedEnergyKwh = 0.2
    state.power.solarGenerationKw = 0
    const advanced = advanceSimulation(state, 10)
    expect(advanced.power.storedEnergyKwh).toBe(0)
    expect(Number.isFinite(advanced.power.storedEnergyKwh)).toBe(true)
    expect(advanced.power.storedEnergyKwh).toBeLessThanOrEqual(advanced.power.batteryCapacityKwh)
  })

  it('clamps power surplus at battery capacity', () => {
    const state = createInitialMission()
    state.power.dustStormMultiplier = 1
    state.power.solarGenerationKw = 20
    state.power.storedEnergyKwh = 47
    const advanced = advanceSimulation(state, 5)
    expect(advanced.power.storedEnergyKwh).toBe(advanced.power.batteryCapacityKwh)
  })

  it('makes greenhouse crop growth delayed and pauses it when lighting is reduced', () => {
    const initial = createInitialMission()
    const paused = applyPlayerDecision(initial, { id: 'reduce-loads', type: 'reduceNonCriticalLoads' })
    const afterPausedTime = advanceSimulation(paused, 8)
    const afterLitTime = advanceSimulation(initial, 8)
    expect(afterPausedTime.food.cropGrowthProgress).toBe(initial.food.cropGrowthProgress)
    expect(afterPausedTime.lifeSupport.waterGameUnits).toBeGreaterThan(afterLitTime.lifeSupport.waterGameUnits)

    const lit = applyPlayerDecision(initial, { id: 'lights-on', type: 'toggleGreenhouseLighting', enabled: true })
    const afterRestoredLighting = advanceSimulation(lit, 8)
    expect(afterRestoredLighting.food.cropGrowthProgress).toBeGreaterThan(initial.food.cropGrowthProgress)
    expect(afterRestoredLighting.food.cropHarvests).toBe(0)
  })

  it('pauses crop growth when greenhouse water is unavailable', () => {
    const dry = createInitialMission()
    dry.lifeSupport.waterGameUnits = 0
    const advanced = advanceSimulation(dry, 8)
    expect(advanced.food.cropGrowthProgress).toBe(dry.food.cropGrowthProgress)
  })

  it('repairs water recovery only after time, power use, and crew effort', () => {
    const initial = createInitialMission()
    const repairing = applyPlayerDecision(initial, { id: 'repair', type: 'startWaterRecoveryRepair' })
    expect(repairing.lifeSupport.repairHoursRemaining).toBe(4)
    const incomplete = advanceSimulation(repairing, 2)
    expect(incomplete.lifeSupport.waterRecoveryCondition).toBe(30)
    const completed = advanceSimulation(incomplete, 2)
    expect(completed.lifeSupport.waterRecoveryCondition).toBe(88)
    expect(completed.crew.workloadIndex).toBeGreaterThan(initial.crew.workloadIndex)
  })

  it('reduces the simulation radiation-risk increase when the crew shelters', () => {
    const initial = createInitialMission()
    const outside = advanceSimulation(initial, 4)
    const sheltered = applyPlayerDecision(initial, { id: 'shelter', type: 'toggleShelter', sheltered: true })
    const protectedState = advanceSimulation(sheltered, 4)
    expect(protectedState.radiation.hazardIndex).toBeLessThan(outside.radiation.hazardIndex)
    expect(protectedState.radiation.cumulativeExposureIndex).toBeLessThan(outside.radiation.cumulativeExposureIndex)
  })

  it('delays Earth messages until both one-way light-time intervals pass', () => {
    const initial = createInitialMission()
    const sent = applyPlayerDecision(initial, { id: 'ask-earth', type: 'sendMessage', text: 'What should we do?' })
    const beforeReply = advanceSimulation(sent, 0.5)
    expect(beforeReply.communications.deliveredMessages).toHaveLength(0)
    const afterReply = advanceSimulation(sent, 0.7)
    expect(afterReply.communications.deliveredMessages).toHaveLength(1)
  })

  it('checks mission success and failure conditions', () => {
    const successful = createInitialMission()
    successful.time.elapsedHours = MARTIAN_SOL_HOURS
    successful.lifeSupport.systemHealthIndex = 70
    successful.crew.conditionIndex = 70
    expect(checkMissionStatus(successful).mission.status).toBe('success')

    const failed = createInitialMission()
    failed.lifeSupport.oxygenGameUnits = 0
    expect(checkMissionStatus(failed).mission.status).toBe('failed')
  })

  it('resets and replays an identical starting mission', () => {
    const changed = advanceSimulation(createInitialMission(), 2)
    const replay = resetMission()
    expect(replay).toEqual(createInitialMission())
    expect(replay).not.toEqual(changed)
  })

  it('is deterministic and ignores duplicate, invalid, and extreme actions', () => {
    const first = createInitialMission()
    const action = { id: 'same-action', type: 'reduceNonCriticalLoads' } as const
    const once = applyPlayerDecision(first, action)
    expect(applyPlayerDecision(once, action)).toEqual(once)
    expect(applyPlayerDecision(first, { id: 'invalid-hours', type: 'advanceTime', hours: Number.POSITIVE_INFINITY })).toEqual(first)
    expect(applyPlayerDecision(first, { id: 'extreme-hours', type: 'advanceTime', hours: 25 })).toEqual(first)
    expect(advanceSimulation(createInitialMission(), 2)).toEqual(advanceSimulation(createInitialMission(), 2))
  })
})
