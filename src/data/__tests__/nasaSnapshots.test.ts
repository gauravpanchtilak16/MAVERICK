import { describe, expect, it } from 'vitest'
import { DONKI_SEP_SNAPSHOT, NASA_DATA_CENTER, RADLAB_MARS_SURFACE_SNAPSHOT, validateNasaSnapshots } from '../nasaSnapshots'

describe('NASA cached snapshot provenance', () => {
  it('keeps the selected DONKI SEP record attributable and clearly separate from simulation values', () => {
    expect(DONKI_SEP_SNAPSHOT.recordIdentifier).toBe('2024-05-10T13:35:00-SEP-001')
    expect(DONKI_SEP_SNAPSHOT.observationDate).toBe('2024-05-10T13:35Z')
    expect(DONKI_SEP_SNAPSHOT.instruments).toContain('GOES-P: SEISS >10 MeV')
    expect(DONKI_SEP_SNAPSHOT.limitations).toMatch(/not a radiation-dose measurement/i)
  })

  it('preserves the RadLab field, unit, surface trajectory, null dose-equivalent field, and quality limitation', () => {
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.instrumentId).toBe('MSL-RAD-Surface')
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.trajectory).toBe('Mars surface')
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.measurementField).toBe('absorbed_dose_rate')
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.originalUnit).toBe('µGy/hour')
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.doseEquivalentRate).toBeNull()
    expect(RADLAB_MARS_SURFACE_SNAPSHOT.qualityStatus).toMatch(/No quality-flag field was returned/i)
  })

  it('uses an offline-ready cache and validates all displayed records', () => {
    expect(NASA_DATA_CENTER.status).toBe('Offline-ready cached snapshots')
    expect(NASA_DATA_CENTER.freshness).toMatch(/not live/i)
    expect(validateNasaSnapshots()).toBe(true)
  })
})
