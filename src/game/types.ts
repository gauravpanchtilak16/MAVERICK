export const MARTIAN_SOL_HOURS = 24 + 39 / 60 + 35 / 3600

export type MissionStatus = 'active' | 'success' | 'failed'
export type EmergencyType = 'dustStorm' | 'waterRecoveryFailure' | 'radiationAlert'

export interface SimulationTime {
  elapsedHours: number
  sol: number
  missionDay: number
  solHours: number
}

export interface CrewState {
  count: number
  conditionIndex: number
  fatigueIndex: number
  restHours: number
  workloadIndex: number
}

export interface PowerState {
  solarGenerationKw: number
  dustStormMultiplier: number
  batteryCapacityKwh: number
  storedEnergyKwh: number
  loads: {
    lifeSupportKw: number
    waterRecoveryKw: number
    greenhouseLightingKw: number
    nonCriticalKw: number
    repairKw: number
  }
  greenhouseLightingEnabled: boolean
  nonCriticalLoadsReduced: boolean
}

export interface LifeSupportState {
  oxygenGameUnits: number
  waterGameUnits: number
  waterRecoveryCondition: number
  co2ConditionIndex: number
  systemHealthIndex: number
  repairHoursRemaining: number
  storedWaterAllocated: boolean
}

export interface FoodState {
  storedFoodCrewDays: number
  cropGrowthProgress: number
  cropHarvests: number
  greenhouseLightingEnabled: boolean
  cropPowerKw: number
  greenhouseWaterUnitsPerHour: number
  waterConservationMode: boolean
  nutrientConditionIndex: number
}

export interface RadiationState {
  hazardIndex: number
  cumulativeExposureIndex: number
  sheltered: boolean
  shieldingSupplies: number
  shieldingAllocated: boolean
  spaceWeatherWarning: boolean
  scenarioReference: {
    sourceName: string
    recordIdentifier: string | null
    use: string
    limitation: string
  }
}

export interface MissionMessage {
  id: string
  text: string
  sentAtHours: number
  deliveredAtHours: number
}

export interface CommunicationsState {
  oneWayDelayMinutes: number
  pendingOutgoing: MissionMessage[]
  pendingIncoming: MissionMessage[]
  deliveredMessages: MissionMessage[]
  nextMessageNumber: number
}

export interface MissionEvent {
  id: string
  atHours: number
  title: string
  detail: string
}

export interface MissionState {
  time: SimulationTime
  crew: CrewState
  power: PowerState
  lifeSupport: LifeSupportState
  food: FoodState
  radiation: RadiationState
  communications: CommunicationsState
  mission: {
    status: MissionStatus
    activeEmergencies: EmergencyType[]
    eventHistory: MissionEvent[]
    objectives: string[]
    processedActionIds: string[]
  }
}

export type PlayerAction =
  | { id: string; type: 'advanceTime'; hours: number }
  | { id: string; type: 'reduceNonCriticalLoads' }
  | { id: string; type: 'toggleGreenhouseLighting'; enabled: boolean }
  | { id: string; type: 'toggleGreenhouseWaterConservation'; enabled: boolean }
  | { id: string; type: 'startWaterRecoveryRepair' }
  | { id: string; type: 'useStoredWater' }
  | { id: string; type: 'toggleShelter'; sheltered: boolean }
  | { id: string; type: 'allocateShielding' }
  | { id: string; type: 'sendMessage'; text: string }
