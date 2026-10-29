import type { BirthInput, Gender, JasiMethod } from '@orrery/core/types'
import type { City } from '@orrery/core/cities'
import { assertBirthInput, assertCoordinate } from '@orrery/core/validation'

export interface SavedFormState {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
  unknownTime: boolean
  jasiMethod: JasiMethod
  city: City | null
  manualCoords: boolean
  latitude: number
  longitude: number
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cityText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 120
}

/** Validate untrusted storage/JSON and copy only known fields. */
export function parseSavedFormState(value: unknown): SavedFormState | null {
  if (!isRecord(value)) return null
  try {
    assertBirthInput(value as unknown as BirthInput)
    assertCoordinate(value.latitude as number, 90)
    assertCoordinate(value.longitude as number, 180)
    if (typeof value.manualCoords !== 'boolean') return null

    let city: City | null = null
    if (value.city != null) {
      if (!isRecord(value.city) || !cityText(value.city.name)) return null
      if (value.city.country !== undefined && !cityText(value.city.country)) return null
      if (value.city.region !== undefined && !cityText(value.city.region)) return null
      assertCoordinate(value.city.lat as number, 90)
      assertCoordinate(value.city.lon as number, 180)
      city = {
        name: value.city.name,
        lat: value.city.lat as number,
        lon: value.city.lon as number,
        ...(value.city.country !== undefined ? { country: value.city.country as string } : {}),
        ...(value.city.region !== undefined ? { region: value.city.region as string } : {}),
      }
    }
    return {
      year: value.year as number, month: value.month as number, day: value.day as number,
      hour: value.hour as number, minute: value.minute as number, gender: value.gender as Gender,
      unknownTime: (value.unknownTime as boolean | undefined) ?? false,
      jasiMethod: (value.jasiMethod as JasiMethod | undefined) ?? 'unified',
      city, manualCoords: value.manualCoords,
      latitude: value.latitude as number, longitude: value.longitude as number,
    }
  } catch {
    return null
  }
}
