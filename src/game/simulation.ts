import { createInitialMission } from './initialState'
import { MARTIAN_SOL_HOURS, type CommunicationsState, type MissionEvent, type MissionState, type PlayerAction, type PowerState } from './types'

const GAME_BALANCE = {
  oxygenUsePerCrewHour: 0.25,
  waterUsePerCrewHour: 0.18,
  foodUsePerCrewHour: 1 / 24,
  cropGrowthPerHour: 1.5,
  cropHarvestCrewDays: 8,
  repairDurationHours: 4,
} as const

function clamp(value: number, minimum = 0, maximum = 100) {
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : minimum
}

function addEvent(state: MissionState, title: string, detail: string): MissionState {
  const event: MissionEvent = {
    id: `event-${state.mission.eventHistory.length + 1}`,
    atHours: state.time.elapsedHours,
    title,
    detail,
  }
  return { ...state, mission: { ...state.mission, eventHistory: [event, ...state.mission.eventHistory] } }
}

function markActionProcessed(state: MissionState, actionId: string) {
  return { ...state, mission: { ...state.mission, processedActionIds: [...state.mission.processedActionIds, actionId] } }
}

export function getPowerConsumptionKw(power: PowerState, repairingWaterRecovery: boolean) {
  return power.loads.lifeSupportKw
    + power.loads.waterRecoveryKw
    + (power.greenhouseLightingEnabled ? power.loads.greenhouseLightingKw : 0)
    + (power.nonCriticalLoadsReduced ? 0.2 : power.loads.nonCriticalKw)
    + (repairingWaterRecovery ? power.loads.repairKw : 0)
}

export function updatePower(state: MissionState, elapsedHours: number) {
  const generationKw = state.power.solarGenerationKw * state.power.dustStormMultiplier
  const consumptionKw = getPowerConsumptionKw(state.power, state.lifeSupport.repairHoursRemaining > 0)
  // kWh changes by net kW multiplied by elapsed hours; storage is always physically bounded.
  const storedEnergyKwh = clamp(
    state.power.storedEnergyKwh + (generationKw - consumptionKw) * elapsedHours,
    0,
    state.power.batteryCapacityKwh,
  )
  const criticalShortfall = storedEnergyKwh === 0 && generationKw < state.power.loads.lifeSupportKw
  return { ...state.power, storedEnergyKwh, generationKw, consumptionKw, criticalShortfall }
}

export function updateLifeSupport(state: MissionState, elapsedHours: number, criticalShortfall: boolean) {
  const { crew, lifeSupport, food, power } = state
  const waterRecovery = crew.count * 0.14 * (lifeSupport.waterRecoveryCondition / 100) * elapsedHours
  // Paused greenhouse lighting also pauses active crop growth and its water draw.
  const greenhouseWaterUse = food.greenhouseLightingEnabled ? food.greenhouseWaterUnitsPerHour : 0
  const waterUsed = (crew.count * GAME_BALANCE.waterUsePerCrewHour + greenhouseWaterUse) * elapsedHours
  const oxygenUsed = crew.count * GAME_BALANCE.oxygenUsePerCrewHour * elapsedHours
  // A sheltered crew stays safe, but cannot perform the externalized repair work.
  const repairHoursRemaining = Math.max(0, lifeSupport.repairHoursRemaining - (state.radiation.sheltered ? 0 : elapsedHours))
  const repairCompleted = lifeSupport.repairHoursRemaining > 0 && repairHoursRemaining === 0
  const recoveryCondition = repairCompleted ? 88 : lifeSupport.waterRecoveryCondition
  const waterGameUnits = clamp(lifeSupport.waterGameUnits + waterRecovery - waterUsed)
  const oxygenGameUnits = clamp(lifeSupport.oxygenGameUnits - oxygenUsed)
  const co2ConditionIndex = clamp(lifeSupport.co2ConditionIndex - elapsedHours * (criticalShortfall ? 7 : 1.2))
  const healthPenalty = (waterGameUnits < 15 ? 7 : 0) + (oxygenGameUnits < 15 ? 8 : 0) + (criticalShortfall ? 10 : 0)
  const systemHealthIndex = clamp(lifeSupport.systemHealthIndex - healthPenalty + (repairCompleted ? 10 : 0))
  return {
    ...lifeSupport,
    waterRecoveryCondition: recoveryCondition,
    waterGameUnits,
    oxygenGameUnits,
    co2ConditionIndex,
    systemHealthIndex,
    repairHoursRemaining,
  }
}

export function updateFood(state: MissionState, elapsedHours: number) {
  const foodUsed = state.crew.count * GAME_BALANCE.foodUsePerCrewHour * elapsedHours
  const grows = state.food.greenhouseLightingEnabled
    && state.power.storedEnergyKwh > 0
    && state.lifeSupport.waterGameUnits > 0
    && state.food.nutrientConditionIndex > 20
  const progress = state.food.cropGrowthProgress + (grows ? GAME_BALANCE.cropGrowthPerHour * elapsedHours : 0)
  const harvests = Math.floor(progress / 100)
  return {
    ...state.food,
    storedFoodCrewDays: clamp(state.food.storedFoodCrewDays - foodUsed + harvests * GAME_BALANCE.cropHarvestCrewDays, 0, 999),
    cropGrowthProgress: progress % 100,
    cropHarvests: state.food.cropHarvests + harvests,
    nutrientConditionIndex: clamp(state.food.nutrientConditionIndex - (grows ? elapsedHours * 0.08 : 0)),
  }
}

export function updateRadiation(state: MissionState, elapsedHours: number) {
  const warningIncrease = state.radiation.spaceWeatherWarning ? 2.4 * elapsedHours : 0.5 * elapsedHours
  const shelterFactor = state.radiation.sheltered ? 0.3 : 1
  const hazardIndex = clamp(state.radiation.hazardIndex + warningIncrease * shelterFactor)
  // These are intentionally unitless game indices, never physical radiation measurements.
  const cumulativeExposureIndex = clamp(state.radiation.cumulativeExposureIndex + hazardIndex * elapsedHours * 0.08 * shelterFactor, 0, 999)
  return { ...state.radiation, hazardIndex, cumulativeExposureIndex }
}

export function updateCrew(state: MissionState, elapsedHours: number) {
  const repairWork = state.lifeSupport.repairHoursRemaining > 0 ? 1.4 : 0.7
  const fatigueIndex = clamp(state.crew.fatigueIndex + elapsedHours * repairWork - state.crew.restHours * 0.1)
  const conditionPenalty = (100 - state.lifeSupport.systemHealthIndex) * 0.03 + state.radiation.hazardIndex * 0.015
  return {
    ...state.crew,
    fatigueIndex,
    conditionIndex: clamp(state.crew.conditionIndex - conditionPenalty * elapsedHours),
    workloadIndex: clamp(state.crew.workloadIndex + elapsedHours * repairWork),
    restHours: state.crew.restHours + elapsedHours,
  }
}

export function processCommunications(state: MissionState): CommunicationsState {
  const now = state.time.elapsedHours
  const deliveredNow = state.communications.pendingIncoming.filter((message) => message.deliveredAtHours <= now)
  return {
    ...state.communications,
    pendingOutgoing: state.communications.pendingOutgoing.filter((message) => message.deliveredAtHours > now),
    pendingIncoming: state.communications.pendingIncoming.filter((message) => message.deliveredAtHours > now),
    deliveredMessages: [...state.communications.deliveredMessages, ...deliveredNow],
  }
}

export function checkMissionStatus(state: MissionState): MissionState {
  const failed = state.lifeSupport.oxygenGameUnits <= 0
    || state.lifeSupport.waterGameUnits <= 0
    || state.crew.conditionIndex <= 0
    || (state.power.storedEnergyKwh <= 0 && state.power.solarGenerationKw * state.power.dustStormMultiplier < state.power.loads.lifeSupportKw)
  const objectivesMet = state.time.elapsedHours >= MARTIAN_SOL_HOURS
    && state.lifeSupport.systemHealthIndex >= 45
    && state.crew.conditionIndex >= 45
    && state.food.storedFoodCrewDays > 0
  const status = failed ? 'failed' : objectivesMet ? 'success' : 'active'
  return status === state.mission.status ? state : { ...state, mission: { ...state.mission, status } }
}

export function advanceSimulation(state: MissionState, elapsedHours: number): MissionState {
  if (!Number.isFinite(elapsedHours) || elapsedHours <= 0 || state.mission.status !== 'active') return state
  const power = updatePower(state, elapsedHours)
  const lifeSupport = updateLifeSupport(state, elapsedHours, power.criticalShortfall)
  let next: MissionState = { ...state, power, lifeSupport }
  next = { ...next, food: updateFood(next, elapsedHours) }
  next = { ...next, radiation: updateRadiation(next, elapsedHours) }
  next = { ...next, crew: updateCrew(next, elapsedHours) }
  const elapsed = state.time.elapsedHours + elapsedHours
  const totalSolHours = state.time.solHours + elapsedHours
  const solAdvance = Math.floor(totalSolHours / MARTIAN_SOL_HOURS)
  next = {
    ...next,
    time: {
      elapsedHours: elapsed,
      sol: state.time.sol + solAdvance,
      missionDay: Math.floor(elapsed / MARTIAN_SOL_HOURS) + 1,
      solHours: totalSolHours % MARTIAN_SOL_HOURS,
    },
  }
  next = { ...next, communications: processCommunications(next) }
  next = addEvent(next, 'Simulation time advanced', `${elapsedHours} simplified simulation hour${elapsedHours === 1 ? '' : 's'} passed. Power, life support, food, crew, radiation, and messages were updated.`)
  if (lifeSupport.repairHoursRemaining === 0 && state.lifeSupport.repairHoursRemaining > 0) {
    next = addEvent(next, 'Water recovery repaired', 'Crew effort and electricity restored water-recovery condition in this game model.')
  }
  return checkMissionStatus(next)
}

export function applyPlayerDecision(state: MissionState, action: PlayerAction): MissionState {
  if (state.mission.status !== 'active' || state.mission.processedActionIds.includes(action.id)) return state
  if (action.type === 'advanceTime') {
    if (!Number.isFinite(action.hours) || action.hours <= 0 || action.hours > 24) return state
    return markActionProcessed(advanceSimulation(state, action.hours), action.id)
  }

  let next = markActionProcessed(state, action.id)
  switch (action.type) {
    case 'reduceNonCriticalLoads':
      if (next.power.nonCriticalLoadsReduced) return state
      next = { ...next, power: { ...next.power, nonCriticalLoadsReduced: true, greenhouseLightingEnabled: false }, food: { ...next.food, greenhouseLightingEnabled: false } }
      return addEvent(next, 'Noncritical loads reduced', 'Greenhouse lighting paused to protect battery energy. Crop growth will slow until lighting is restored.')
    case 'toggleGreenhouseLighting':
      next = { ...next, power: { ...next.power, greenhouseLightingEnabled: action.enabled }, food: { ...next.food, greenhouseLightingEnabled: action.enabled } }
      return addEvent(next, action.enabled ? 'Greenhouse lighting restored' : 'Greenhouse lighting paused', action.enabled ? 'Crop growth can resume when power is available.' : 'Crop growth pauses; stored food must cover the delay.')
    case 'startWaterRecoveryRepair':
      if (next.lifeSupport.repairHoursRemaining > 0 || next.lifeSupport.waterRecoveryCondition >= 85) return state
      next = { ...next, lifeSupport: { ...next.lifeSupport, repairHoursRemaining: GAME_BALANCE.repairDurationHours } }
      return addEvent(next, 'Water-recovery repair started', 'Repair work takes four simulation hours, adds electrical load, and increases crew workload.')
    case 'useStoredWater':
      if (next.lifeSupport.storedWaterAllocated || next.lifeSupport.waterGameUnits < 8) return state
      next = { ...next, lifeSupport: { ...next.lifeSupport, waterGameUnits: clamp(next.lifeSupport.waterGameUnits - 8), storedWaterAllocated: true, systemHealthIndex: clamp(next.lifeSupport.systemHealthIndex + 4) } }
      return addEvent(next, 'Stored water allocated', 'The crew used reserve water instead of repairing immediately. Reserves are lower, but life support is steadier for now.')
    case 'toggleShelter':
      next = { ...next, radiation: { ...next.radiation, sheltered: action.sheltered } }
      return addEvent(next, action.sheltered ? 'Crew entered the shielded room' : 'Crew left the shielded room', action.sheltered ? 'The simulation radiation-risk and exposure indices will rise more slowly, but water-recovery repairs pause.' : 'The crew can resume repairs, but the simulation radiation-risk index rises faster.')
    case 'sendMessage': {
      const delayHours = next.communications.oneWayDelayMinutes / 60
      const number = next.communications.nextMessageNumber
      const outgoing = { id: `outgoing-${number}`, text: action.text, sentAtHours: next.time.elapsedHours, deliveredAtHours: next.time.elapsedHours + delayHours }
      const reply = { id: `reply-${number}`, text: 'Earth reply: prioritize life support, conserve power, and keep making safe local decisions.', sentAtHours: next.time.elapsedHours + delayHours, deliveredAtHours: next.time.elapsedHours + delayHours * 2 }
      next = { ...next, communications: { ...next.communications, pendingOutgoing: [...next.communications.pendingOutgoing, outgoing], pendingIncoming: [...next.communications.pendingIncoming, reply], nextMessageNumber: number + 1 } }
      return addEvent(next, 'Message sent to Earth', `The fictional message has an ${next.communications.oneWayDelayMinutes}-minute one-way delay. The crew must act autonomously while awaiting a reply.`)
    }
  }
}

export function resetMission() {
  return createInitialMission()
}
