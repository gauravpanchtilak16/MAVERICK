export type DataClassification = 'NASA observation' | 'NASA dataset reference' | 'Simulation data'

export interface NasaProvenance {
  classification: DataClassification
  sourceName: string
  sourceUrl: string
  retrievedAtUtc: string
  observationDate: string
  recordIdentifier: string | null
  originalFields: string[]
  originalUnit: string
  gameUse: string
  limitations: string
}

export interface DonkiSepSnapshot extends NasaProvenance {
  eventType: 'Solar Energetic Particle (SEP)'
  instruments: string[]
  linkedEventIds: string[]
  sourceReferences: string[]
  description: string
}

export interface RadLabMeasurementSnapshot extends NasaProvenance {
  instrumentId: string
  trajectory: string
  measurementField: 'absorbed_dose_rate'
  measurementValue: number
  qualityStatus: string
  doseEquivalentRate: null
}

export const DONKI_SEP_SNAPSHOT: DonkiSepSnapshot = {
  classification: 'NASA observation',
  sourceName: 'NASA DONKI',
  sourceUrl: 'https://api.nasa.gov/DONKI/SEP',
  retrievedAtUtc: '2026-11-14T17:19:35Z',
  observationDate: '2024-05-10T13:35Z',
  recordIdentifier: '2024-05-10T13:35:00-SEP-001',
  originalFields: ['sepID', 'eventTime', 'instruments.displayName', 'linkedEvents.activityID', 'sentNotifications.messageID', 'link'],
  originalUnit: 'Not applicable for DONKI event metadata; instrument display name reports a >10 MeV energy channel.',
  eventType: 'Solar Energetic Particle (SEP)',
  instruments: ['GOES-P: SEISS >10 MeV'],
  linkedEventIds: ['2024-05-08T04:20:00-FLR-001', '2024-05-08T04:37:00-FLR-001', '2024-05-08T05:36:00-CME-001', '2024-05-08T11:26:00-FLR-001', '2024-05-08T12:24:00-CME-001', '2024-05-08T21:08:00-FLR-001', '2024-05-08T22:05:00-FLR-001', '2024-05-08T22:24:00-CME-001', '2024-05-09T08:45:00-FLR-001', '2024-05-09T09:24:00-CME-001', '2024-05-09T17:23:00-FLR-001', '2024-05-09T18:23:00-CME-001', '2024-05-10T06:27:00-FLR-001', '2024-05-10T07:12:00-CME-001'],
  sourceReferences: ['https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30677/-1', 'https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30678/1', 'https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30679/1'],
  description: 'NASA DONKI records a Solar Energetic Particle event detected by GOES-P SEISS in the >10 MeV channel.',
  gameUse: 'Informs the fictional mission’s space-weather warning and shelter decision.',
  limitations: 'This historic DONKI event is not a radiation-dose measurement at Mars or at the fictional outpost. RED HORIZON does not convert it into µSv, mGy, crew exposure, or a mission-risk value.',
}

export const RADLAB_MARS_SURFACE_SNAPSHOT: RadLabMeasurementSnapshot = {
  classification: 'NASA observation',
  sourceName: 'NASA OSDR RadLab',
  sourceUrl: 'https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Mars%20surface&timestamp%3E=2019-10-18T00%3A00&timestamp%3C2019-10-18T00%3A30&absorbed_dose_rate&dose_equivalent_rate&format=json',
  retrievedAtUtc: '2026-11-14T15:56:49Z',
  observationDate: '2019-10-18T00:21:47',
  recordIdentifier: null,
  originalFields: ['timestamp', 'instrument_id', 'trajectory', 'absorbed_dose_rate', 'dose_equivalent_rate'],
  originalUnit: 'µGy/hour',
  instrumentId: 'MSL-RAD-Surface',
  trajectory: 'Mars surface',
  measurementField: 'absorbed_dose_rate',
  measurementValue: 8.905511,
  doseEquivalentRate: null,
  qualityStatus: 'No quality-flag field was returned in this selected RadLab API response. RED HORIZON does not infer one.',
  gameUse: 'A historical measurement reference in the NASA Data Center only; it does not set the simulation hazard or exposure indices.',
  limitations: 'The timestamp is preserved exactly as returned by RadLab. This is one historical MSL RAD surface record, not a live Mars reading or a habitat dose. Its null dose_equivalent_rate must not be replaced or inferred.',
}

export const MSL_RAD_LEVEL_2_REFERENCE: NasaProvenance = {
  classification: 'NASA dataset reference',
  sourceName: 'NASA MSL RAD Level 2 Observation Dosimetry dataset',
  sourceUrl: 'https://data.nasa.gov/dataset/mars-science-laboratory-msl-radiation-assessment-detector-rad-level-2-observation-dosimetr-e2695',
  retrievedAtUtc: '2026-11-14T15:56:49Z',
  observationDate: 'Dataset landing page accessed; no individual Level-2 row is displayed in this application.',
  recordIdentifier: 'https://doi.org/10.48322/20qb-4e17',
  originalFields: ['quality-filtered dose-rate products', 'all-quality variables', 'FLAGGED_DATA quality indicator'],
  originalUnit: 'Not displayed by the dataset landing page; no Level-2 value is used here.',
  gameUse: 'Provides scientific context and a quality-flag reference for the historical RadLab record.',
  limitations: 'The application does not claim a Level-2 measurement value or quality-flag value from this dataset because it has not parsed a Level-2 product file.',
}

export const NASA_DATA_CENTER = {
  status: 'Offline-ready cached snapshots' as const,
  freshness: 'Historic cached records — not live data. No browser request is made.',
  spaceWeather: DONKI_SEP_SNAPSHOT,
  marsRadiation: RADLAB_MARS_SURFACE_SNAPSHOT,
  mslRadReference: MSL_RAD_LEVEL_2_REFERENCE,
}

export function validateNasaSnapshots(data = NASA_DATA_CENTER) {
  const sep = data.spaceWeather
  const radiation = data.marsRadiation
  return Boolean(
    sep.recordIdentifier
    && sep.eventType === 'Solar Energetic Particle (SEP)'
    && sep.sourceUrl.startsWith('https://')
    && Number.isFinite(radiation.measurementValue)
    && radiation.trajectory === 'Mars surface'
    && radiation.originalUnit === 'µGy/hour'
    && radiation.doseEquivalentRate === null
    && data.status === 'Offline-ready cached snapshots',
  )
}
