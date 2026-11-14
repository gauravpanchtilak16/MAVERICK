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

  it('pauses repair power and crew effort while the crew shelters', () => {
    const repairing = applyPlayerDecision(createInitialMission(), { id: 'repair', type: 'startWaterRecoveryRepair' })
    const working = advanceSimulation(repairing, 2)
    const sheltered = applyPlayerDecision(repairing, { id: 'shelter', type: 'toggleShelter', sheltered: true })
    const paused = advanceSimulation(sheltered, 2)

    expect(paused.lifeSupport.repairHoursRemaining).toBe(4)
    expect(paused.power.storedEnergyKwh).toBeGreaterThan(working.power.storedEnergyKwh)
    expect(paused.crew.workloadIndex).toBeLessThan(working.crew.workloadIndex)
  })

  it('stops water recovery when depleted power cannot support it', () => {
    const noPower = createInitialMission()
    noPower.power.storedEnergyKwh = 0
    noPower.power.solarGenerationKw = 0
    noPower.lifeSupport.waterGameUnits = 80

    const advanced = advanceSimulation(noPower, 2)
    const expectedWaterAfterUse = 80 - (noPower.crew.count * 0.18 + noPower.food.greenhouseWaterUnitsPerHour) * 2
    expect(advanced.lifeSupport.waterGameUnits).toBeCloseTo(expectedWaterAfterUse)
  })

  it('reduces the simulation radiation-risk increase when the crew shelters', () => {
    const initial = createInitialMission()
    const outside = advanceSimulation(initial, 4)
    const sheltered = applyPlayerDecision(initial, { id: 'shelter', type: 'toggleShelter', sheltered: true })
    const protectedState = advanceSimulation(sheltered, 4)
    expect(protectedState.radiation.hazardIndex).toBeLessThan(outside.radiation.hazardIndex)
    expect(protectedState.radiation.cumulativeExposureIndex).toBeLessThan(outside.radiation.cumulativeExposureIndex)
  })

  it('makes shielding and greenhouse water conservation create real trade-offs', () => {
    const initial = createInitialMission()
    const shielded = applyPlayerDecision(initial, { id: 'allocate-shielding', type: 'allocateShielding' })
    const protectedState = advanceSimulation(shielded, 4)
    const outside = advanceSimulation(initial, 4)
    expect(shielded.radiation.shieldingSupplies).toBe(0)
    expect(protectedState.radiation.hazardIndex).toBeLessThan(outside.radiation.hazardIndex)

    const conserving = applyPlayerDecision(initial, { id: 'save-greenhouse-water', type: 'toggleGreenhouseWaterConservation', enabled: true })
    const afterConservation = advanceSimulation(conserving, 4)
    expect(afterConservation.food.cropGrowthProgress).toBeLessThan(outside.food.cropGrowthProgress)
    expect(afterConservation.lifeSupport.waterGameUnits).toBeGreaterThan(outside.lifeSupport.waterGameUnits)
  })

  it('delays Earth messages until both one-way light-time intervals pass', () => {
    const initial = createInitialMission()
    const sent = applyPlayerDecision(initial, { id: 'ask-earth', type: 'sendMessage', text: 'What should we do?' })
    const beforeReply = advanceSimulation(sent, 0.5)
    expect(beforeReply.communications.deliveredMessages).toHaveLength(0)
    const afterReply = advanceSimulation(sent, 0.7)
    expect(afterReply.communications.deliveredMessages).toHaveLength(1)
    expect(afterReply.mission.eventHistory.some((event) => event.title === 'Earth reply arrived')).toBe(true)
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

    const missedDeadline = createInitialMission()
    missedDeadline.time.elapsedHours = MARTIAN_SOL_HOURS
    missedDeadline.crew.conditionIndex = 40
    expect(checkMissionStatus(missedDeadline).mission.status).toBe('failed')
  })

  it('ends an active mission when stored food is exhausted', () => {
    const starving = createInitialMission()
    starving.food.storedFoodCrewDays = 0
    expect(checkMissionStatus(starving).mission.status).toBe('failed')
  })

  it('keeps extreme resource states bounded and terminal after depletion', () => {
    const depleted = createInitialMission()
    depleted.power.storedEnergyKwh = 0
    depleted.power.solarGenerationKw = 0
    depleted.lifeSupport.waterRecoveryCondition = 0
    depleted.lifeSupport.oxygenGameUnits = 1
    depleted.lifeSupport.waterGameUnits = 1
    depleted.food.storedFoodCrewDays = 0.1
    const result = advanceSimulation(depleted, 2)
    for (const value of [result.power.storedEnergyKwh, result.lifeSupport.oxygenGameUnits, result.lifeSupport.waterGameUnits, result.food.storedFoodCrewDays, result.radiation.hazardIndex, result.crew.conditionIndex]) {
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
    }
    expect(result.power.storedEnergyKwh).toBeLessThanOrEqual(result.power.batteryCapacityKwh)
    expect(result.mission.status).toBe('failed')
    expect(advanceSimulation(result, 2)).toBe(result)
  })

  it('fails predictably at zero water and zero solar generation', () => {
    const noWater = createInitialMission()
    noWater.lifeSupport.waterGameUnits = 0
    expect(checkMissionStatus(noWater).mission.status).toBe('failed')

    const noSolar = createInitialMission()
    noSolar.power.solarGenerationKw = 0
    noSolar.power.storedEnergyKwh = 0
    const result = advanceSimulation(noSolar, 2)
    expect(result.power.storedEnergyKwh).toBe(0)
    expect(result.mission.status).toBe('failed')
  })

  it('keeps low oxygen finite and treats zero as terminal', () => {
    const low = createInitialMission()
    low.lifeSupport.oxygenGameUnits = 24
    const next = advanceSimulation(low, 2)
    expect(next.lifeSupport.oxygenGameUnits).toBe(22)
    expect(next.mission.status).toBe('active')
    low.lifeSupport.oxygenGameUnits = 1
    const empty = advanceSimulation(low, 2)
    expect(empty.lifeSupport.oxygenGameUnits).toBe(0)
    expect(empty.mission.status).toBe('failed')
  })

  it('does not recover water from a failed recycler or grow crops with lights off', () => {
    const failedRecycler = createInitialMission()
    failedRecycler.lifeSupport.waterRecoveryCondition = 0
    const noRecovery = advanceSimulation(failedRecycler, 12)
    expect(noRecovery.lifeSupport.waterGameUnits).toBeLessThan(failedRecycler.lifeSupport.waterGameUnits)

    const lightsOff = applyPlayerDecision(createInitialMission(), { id: 'lights-off', type: 'toggleGreenhouseLighting', enabled: false })
    const delayed = advanceSimulation(lightsOff, 12)
    expect(delayed.food.cropGrowthProgress).toBe(lightsOff.food.cropGrowthProgress)
    expect(delayed.food.cropHarvests).toBe(0)
  })

  it('delivers each Earth reply once after both signal legs', () => {
    const sent = applyPlayerDecision(createInitialMission(), { id: 'message', type: 'sendMessage', text: 'Status?' })
    const before = advanceSimulation(sent, 0.4)
    expect(before.communications.deliveredMessages).toHaveLength(0)
    const after = advanceSimulation(before, 0.3)
    const later = advanceSimulation(after, 0.3)
    expect(after.communications.deliveredMessages).toHaveLength(1)
    expect(later.communications.deliveredMessages).toHaveLength(1)
    expect(later.mission.eventHistory.filter((entry) => entry.title === 'Earth reply arrived')).toHaveLength(1)
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

  it('keeps mission state unchanged for missing or malformed decisions', () => {
    const initial = createInitialMission()
    const invalid = [
      undefined,
      null,
      { id: 'unknown', type: 'unknown' },
      { id: 'missing-time', type: 'advanceTime' },
      { id: 'missing-message', type: 'sendMessage' },
      { id: 'missing-light-flag', type: 'toggleGreenhouseLighting' },
      { id: 'missing-shelter-flag', type: 'toggleShelter' },
    ]
    for (const action of invalid) {
      expect(applyPlayerDecision(initial, action as unknown as Parameters<typeof applyPlayerDecision>[1])).toBe(initial)
    }
  })
})
