import type { MissionState } from './types'
import { DONKI_SEP_SNAPSHOT, validateNasaSnapshots } from '../data/nasaSnapshots'

export function createInitialMission(): MissionState {
  const nasaSnapshotValid = validateNasaSnapshots()
  return {
    time: { elapsedHours: 0, sol: 214, missionDay: 1, solHours: 6 },
    crew: { count: 4, conditionIndex: 88, fatigueIndex: 24, restHours: 0, workloadIndex: 20 },
    power: {
      solarGenerationKw: 5.6,
      dustStormMultiplier: 0.38,
      batteryCapacityKwh: 48,
      storedEnergyKwh: 34,
      loads: { lifeSupportKw: 1.8, waterRecoveryKw: 0.55, greenhouseLightingKw: 1.2, nonCriticalKw: 1.1, repairKw: 0.7 },
      greenhouseLightingEnabled: true,
      nonCriticalLoadsReduced: false,
    },
    lifeSupport: {
      oxygenGameUnits: 78,
      waterGameUnits: 82,
      waterRecoveryCondition: 30,
      co2ConditionIndex: 82,
      systemHealthIndex: 78,
      repairHoursRemaining: 0,
      storedWaterAllocated: false,
    },
    food: {
      storedFoodCrewDays: 24,
      cropGrowthProgress: 34,
      cropHarvests: 0,
      greenhouseLightingEnabled: true,
      cropPowerKw: 1.2,
      greenhouseWaterUnitsPerHour: 0.16,
      waterConservationMode: false,
      nutrientConditionIndex: 100,
    },
    radiation: {
      hazardIndex: 52,
      cumulativeExposureIndex: 12,
      sheltered: false,
      shieldingSupplies: 1,
      shieldingAllocated: false,
      spaceWeatherWarning: true,
      scenarioReference: {
        sourceName: nasaSnapshotValid ? DONKI_SEP_SNAPSHOT.sourceName : 'Simulation data only',
        recordIdentifier: nasaSnapshotValid ? DONKI_SEP_SNAPSHOT.recordIdentifier : null,
        use: nasaSnapshotValid ? DONKI_SEP_SNAPSHOT.gameUse : 'Fictional space-weather warning for the game.',
        limitation: nasaSnapshotValid ? DONKI_SEP_SNAPSHOT.limitations : 'No validated NASA observation is used.',
      },
    },
    communications: { oneWayDelayMinutes: 18, pendingOutgoing: [], pendingIncoming: [], deliveredMessages: [], nextMessageNumber: 1 },
    mission: {
      status: 'active',
      activeEmergencies: ['dustStorm', 'waterRecoveryFailure', 'radiationAlert'],
      objectives: ['Keep the four-person crew safe for one Martian sol.', 'Protect power, water recovery, food, and cabin air through the dust storm.', 'Manage the radiation warning while Earth messages are delayed.'],
      processedActionIds: [],
      eventHistory: [
        { id: 'event-1', atHours: 0, title: 'Sol 214 mission started', detail: 'This fictional mission uses educational game units and simulation indices, not live NASA measurements.' },
        { id: 'event-2', atHours: 0, title: 'Dust storm and water-recovery fault', detail: 'Solar generation is reduced and the water-recovery system needs attention.' },
        { id: 'event-3', atHours: 0, title: 'Space-weather warning', detail: nasaSnapshotValid ? `Historical NASA DONKI SEP record ${DONKI_SEP_SNAPSHOT.recordIdentifier} informs this educational scenario. Radiation hazard remains a simulation index, not a radiation-dose measurement.` : 'This is a fictional warning with a simulation radiation-risk index; no validated NASA observation is displayed.' },
      ],
    },
  }
}
