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

  it('rejects empty, malformed, missing-field, invalid-time, and invalid-unit snapshots', () => {
    expect(validateNasaSnapshots({})).toBe(false)
    const base = NASA_DATA_CENTER
    expect(validateNasaSnapshots({ ...base, spaceWeather: { ...base.spaceWeather, retrievedAtUtc: 'not-a-time' } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, marsRadiation: { ...base.marsRadiation, observationDate: '2019-02-30T00:21:47' } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, marsRadiation: { ...base.marsRadiation, originalUnit: 'µSv/hour' } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, marsRadiation: { ...base.marsRadiation, measurementField: 'dose_equivalent_rate' as 'absorbed_dose_rate' } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, marsRadiation: { ...base.marsRadiation, sourceUrl: undefined as unknown as string } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, spaceWeather: undefined })).toBe(false)
    expect(validateNasaSnapshots({ ...base, spaceWeather: { ...base.spaceWeather, sourceReferences: [42] as unknown as string[] } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, spaceWeather: { ...base.spaceWeather, originalUnit: undefined as unknown as string } })).toBe(false)
    expect(validateNasaSnapshots({ ...base, spaceWeather: { ...base.spaceWeather, description: undefined as unknown as string } })).toBe(false)
  })

  it('allows an old valid historical snapshot while retaining its cached status', () => {
    const old = { ...NASA_DATA_CENTER, spaceWeather: { ...DONKI_SEP_SNAPSHOT, retrievedAtUtc: '2020-01-01T00:00:00Z' } }
    expect(validateNasaSnapshots(old)).toBe(true)
    expect(old.status).toBe('Offline-ready cached snapshots')
  })
})
