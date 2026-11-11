/**
 * Source data access for the ephemeris table generators.
 *
 * Every published data set the tables are derived from is downloaded once into
 * `.cache/` (git-ignored) and read from there afterwards, so regenerating the
 * tables is reproducible and does not hammer the upstream servers.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export const CACHE_DIR = process.env.ORRERY_EPHEMERIS_CACHE
  ?? join(import.meta.dirname, '..', '.cache')

/** Published data sets, keyed by the cache sub-directory they are stored in. */
const BASE_URLS = {
  /** Bretagnon & Francou (1988), A&A 202, 309 — distributed by IMCCE. */
  vsop87: 'https://ftp.imcce.fr/pub/ephem/planets/vsop87/',
  /** Chapront-Touzé & Chapront (1983, 1988) — distributed by IMCCE. */
  elp82b: 'https://ftp.imcce.fr/pub/ephem/moon/elp82b/',
  /** IERS Conventions (2010), Chapter 5, Tables 5.3a/5.3b. */
  iers: 'https://iers-conventions.obspm.fr/content/chapter5/additional_info/',
  /** U.S. Naval Observatory Earth Orientation: observed TT − UT1. */
  deltat: 'https://maia.usno.navy.mil/ser7/',
} as const

export type SourceGroup = keyof typeof BASE_URLS

/** Fetch a URL, backing off when the server is busy (Horizons serves one request at a time). */
async function download(url: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url)
    if (response.ok) return Buffer.from(await response.arrayBuffer())
    if (response.status !== 503 || attempt === 4) throw new Error(`${url.slice(0, 200)}: HTTP ${response.status}`)
    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
  }
}

/** Read one upstream file as text (latin-1: the files are ASCII with a few stray bytes). */
export async function readSource(group: SourceGroup, file: string): Promise<string> {
  const path = join(CACHE_DIR, group, file)
  if (!existsSync(path)) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, await download(BASE_URLS[group] + file))
  }
  return (await readFile(path)).toString('latin1')
}

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

/**
 * Query the JPL Horizons API (NASA/JPL, DE441) and cache the raw text response.
 * Parameter values are passed verbatim, so string values need their own quotes.
 */
export async function horizons(parameters: Record<string, string>): Promise<string> {
  const query = new URLSearchParams({ format: 'text', OBJ_DATA: 'NO', MAKE_EPHEM: 'YES', ...parameters })
  const key = createHash('sha256').update(query.toString()).digest('hex').slice(0, 24)
  const path = join(CACHE_DIR, 'horizons', `${key}.txt`)
  if (existsSync(path)) return readFile(path, 'utf8')

  const text = (await download(`${HORIZONS_API}?${query}`)).toString('utf8')
  if (!text.includes('$$SOE')) throw new Error(`Horizons returned no table:\n${text.slice(0, 2000)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text)
  return text
}

/** Rows between the $$SOE/$$EOE markers of a CSV-formatted Horizons table. */
export function horizonsRows(text: string): string[][] {
  const body = text.slice(text.indexOf('$$SOE') + 5, text.indexOf('$$EOE'))
  return body.split('\n').map(line => line.trim()).filter(Boolean)
    .map(line => line.split(',').map(cell => cell.trim()))
}

/** Split a list into chunks so a time list stays within the Horizons URL limit. */
export function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size))
  return result
}
