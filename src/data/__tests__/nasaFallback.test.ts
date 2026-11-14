import { describe, expect, it } from 'vitest'
import { DONKI_SEP_SNAPSHOT } from '../nasaSnapshots'
import { createInitialMission } from '../../game/initialState'

describe('bundled NASA data failure handling', () => {
  it('continues the fictional game without displaying an invalid observation', () => {
    const originalTimestamp = DONKI_SEP_SNAPSHOT.retrievedAtUtc
    try {
      DONKI_SEP_SNAPSHOT.retrievedAtUtc = 'invalid timestamp'
      const mission = createInitialMission()
      expect(mission.radiation.scenarioReference.recordIdentifier).toBeNull()
      expect(mission.mission.eventHistory[2].detail).toMatch(/no validated NASA observation/i)

      expect(mission.radiation.scenarioReference.sourceName).toBe('Simulation data only')
    } finally {
      DONKI_SEP_SNAPSHOT.retrievedAtUtc = originalTimestamp
    }
  })

  it('starts with simulation-only attribution when a bundled NASA link is malformed', () => {
    const originalLink = DONKI_SEP_SNAPSHOT.sourceReferences[0]
    try {
      DONKI_SEP_SNAPSHOT.sourceReferences[0] = 42 as unknown as string
      const mission = createInitialMission()
      expect(mission.radiation.scenarioReference.sourceName).toBe('Simulation data only')
      expect(mission.radiation.scenarioReference.recordIdentifier).toBeNull()
      expect(mission.mission.eventHistory[2].detail).toMatch(/no validated NASA observation/i)
    } finally {
      DONKI_SEP_SNAPSHOT.sourceReferences[0] = originalLink
    }
  })
})
