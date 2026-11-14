import { describe, expect, it } from 'vitest'
import { createInitialMission } from '../initialState'
import { advanceSimulation, applyPlayerDecision, planOxygenGeneration, resetMission } from '../simulation'
import type { PlayerAction } from '../types'

const enable = () => applyPlayerDecision(createInitialMission(), { id: 'oxygen-on', type: 'toggleOxygenGeneration', enabled: true })

describe('oxygen electrolysis and connected life support', () => {
  it('requires a player choice and elapsed time, with no instant resource creation', () => {
    const initial = createInitialMission()
    const enabled = enable()
    expect(initial.lifeSupport.oxygenGenerationEnabled).toBe(false)
    expect(enabled.lifeSupport.oxygenGameUnits).toBe(initial.lifeSupport.oxygenGameUnits)
    expect(enabled.lifeSupport.waterGameUnits).toBe(initial.lifeSupport.waterGameUnits)
    expect(enabled.power.storedEnergyKwh).toBe(initial.power.storedEnergyKwh)
    expect(enabled.mission.eventHistory[0].title).toBe('Oxygen maker enabled')
  })

  it('makes oxygen while consuming water and energy and deducting crew oxygen use once', () => {
    const baseline = advanceSimulation(createInitialMission(), 2)
    const produced = advanceSimulation(enable(), 2)
    expect(produced.lifeSupport.oxygenGeneratedLastStep).toBe(3)
    expect(produced.lifeSupport.oxygenGameUnits).toBe(79) // 78 + 3 - 4 crew × .25 × 2 h
    expect(produced.lifeSupport.waterGameUnits).toBeCloseTo(baseline.lifeSupport.waterGameUnits - 1)
    expect(produced.power.storedEnergyKwh).toBeCloseTo(baseline.power.storedEnergyKwh - 1.2)
    expect(produced.mission.eventHistory.some(event => event.title === 'Oxygen made from water' && event.detail.includes('1.20 kWh'))).toBe(true)
  })

  it('does not spend generator resources when crew and crops need all remaining water', () => {
    const dry = enable()
    dry.lifeSupport.waterGameUnits = 1
    dry.lifeSupport.waterRecoveryCondition = 0
    const plan = planOxygenGeneration(dry, 2)
    expect(plan.status).toBe('Waiting for water')
    expect(plan.energyUsedKwh).toBe(0)
    const advanced = advanceSimulation(dry, 2)
    expect(advanced.lifeSupport.oxygenGeneratedLastStep).toBe(0)
    expect(advanced.lifeSupport.waterGameUnits).toBe(0)
    expect(advanced.mission.status).toBe('failed')
  })

  it('does not generate when existing electrical loads exceed available energy', () => {
    const depleted = enable()
    depleted.power.storedEnergyKwh = 0.1
    depleted.power.solarGenerationKw = 0
    expect(planOxygenGeneration(depleted, 2).status).toBe('Waiting for power')
    const advanced = advanceSimulation(depleted, 2)
    expect(advanced.lifeSupport.oxygenGeneratedLastStep).toBe(0)
    expect(advanced.power.storedEnergyKwh).toBe(0)
    expect(advanced.mission.status).toBe('failed')
    expect(advanced.mission.eventHistory.some(event => event.title === 'Oxygen maker paused')).toBe(true)
  })

  it('can run on sufficient solar power without a charged battery', () => {
    const solar = enable()
    solar.power.storedEnergyKwh = 0
    solar.power.dustStormMultiplier = 1
    solar.power.solarGenerationKw = 10
    const advanced = advanceSimulation(solar, 2)
    expect(advanced.lifeSupport.oxygenGeneratedLastStep).toBe(3)
    expect(advanced.lifeSupport.oxygenGameUnits).toBe(79)
    expect(advanced.power.storedEnergyKwh).toBeGreaterThan(0)
  })

  it('limits production to available water without creating negative reserves', () => {
    const limited = enable()
    limited.lifeSupport.waterGameUnits = 1.9
    limited.lifeSupport.waterRecoveryCondition = 0
    const plan = planOxygenGeneration(limited, 2)
    expect(plan.waterUsed).toBeCloseTo(0.14)
    expect(plan.oxygenProduced).toBeCloseTo(0.42)
    expect(plan.energyUsedKwh).toBeCloseTo(0.168)
    const advanced = advanceSimulation(limited, 2)
    expect(advanced.lifeSupport.waterGameUnits).toBeGreaterThanOrEqual(0)
    expect(advanced.lifeSupport.oxygenGameUnits).toBeGreaterThanOrEqual(0)
  })

  it('limits production to electrical energy remaining after existing loads', () => {
    const limited = enable()
    limited.power.solarGenerationKw = 0
    limited.power.storedEnergyKwh = 9.6 // 9.3 kWh for existing loads, 0.3 kWh left
    const plan = planOxygenGeneration(limited, 2)
    expect(plan.energyUsedKwh).toBeCloseTo(0.3)
    expect(plan.oxygenProduced).toBeCloseTo(0.75)
    expect(advanceSimulation(limited, 2).power.storedEnergyKwh).toBeCloseTo(0)
  })

  it('stays within oxygen and battery capacity and pauses at a full oxygen store', () => {
    const nearlyFull = enable()
    nearlyFull.lifeSupport.oxygenGameUnits = 99
    nearlyFull.power.solarGenerationKw = 100
    const filled = advanceSimulation(nearlyFull, 2)
    expect(filled.lifeSupport.oxygenGameUnits).toBe(100)
    expect(filled.power.storedEnergyKwh).toBe(filled.power.batteryCapacityKwh)
    expect(planOxygenGeneration(filled, 2).status).toBe('Oxygen storage full')
    expect(planOxygenGeneration(filled, 2).waterUsed).toBe(0)
  })

  it('ignores duplicate or malformed activation and cannot alter an ended mission', () => {
    const enabled = enable()
    expect(applyPlayerDecision(enabled, { id: 'oxygen-on', type: 'toggleOxygenGeneration', enabled: true })).toBe(enabled)
    expect(applyPlayerDecision(enabled, { id: 'bad', type: 'toggleOxygenGeneration' } as PlayerAction)).toBe(enabled)
    enabled.mission.status = 'failed'
    expect(applyPlayerDecision(enabled, { id: 'retry', type: 'toggleOxygenGeneration', enabled: false })).toBe(enabled)
    expect(advanceSimulation(enabled, 2)).toBe(enabled)
  })

  it('switches off and resets production on replay', () => {
    const enabled = advanceSimulation(enable(), 2)
    const off = applyPlayerDecision(enabled, { id: 'off', type: 'toggleOxygenGeneration', enabled: false })
    const next = advanceSimulation(off, 2)
    expect(next.lifeSupport.oxygenGeneratedLastStep).toBe(0)
    expect(next.lifeSupport.oxygenGameUnits).toBe(77)
    expect(resetMission()).toEqual(createInitialMission())
    expect(resetMission().lifeSupport.oxygenGenerationEnabled).toBe(false)
  })

  it('does not hide oxygen exhaustion when generation is starved of power', () => {
    const state = enable()
    state.lifeSupport.oxygenGameUnits = 1
    state.power.storedEnergyKwh = 0
    state.power.solarGenerationKw = 0
    const advanced = advanceSimulation(state, 2)
    expect(advanced.lifeSupport.oxygenGameUnits).toBe(0)
    expect(advanced.mission.status).toBe('failed')
  })

  it('makes poor cabin air affect life support and ends the mission when air condition is exhausted', () => {
    const lowAir = createInitialMission()
    lowAir.lifeSupport.co2ConditionIndex = 16
    expect(advanceSimulation(lowAir, 2).lifeSupport.systemHealthIndex).toBe(72)
    lowAir.lifeSupport.co2ConditionIndex = 1
    const failed = advanceSimulation(lowAir, 2)
    expect(failed.lifeSupport.co2ConditionIndex).toBe(0)
    expect(failed.mission.status).toBe('failed')
  })
})
