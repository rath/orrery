/**
 * Regenerates the data tables under `src/ephemeris/data/` from their published
 * sources. See `README.md` in this directory for provenance and method.
 *
 * Usage: bun packages/core/scripts/ephemeris/build-tables.ts [table ...]
 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATA_DIR = join(import.meta.dirname, '..', '..', 'src', 'ephemeris', 'data')

/**
 * Listed in dependency order: a generator uses the run-time code, and through
 * it the tables before its own. They are therefore imported one at a time,
 * each only after the tables it depends on have been written.
 */
const TABLES: Record<string, () => Promise<string>> = {
  'delta-t': async () => (await import('./tables/delta-t.ts')).buildDeltaT(),
  nutation: async () => (await import('./tables/nutation.ts')).buildNutation(),
  vsop87: async () => (await import('./tables/vsop87.ts')).buildVsop87(),
  elp2000: async () => (await import('./tables/elp2000.ts')).buildElp2000(),
  checkpoints: async () => (await import('./tables/checkpoints.ts')).buildCheckpoints(),
}

const requested = process.argv.slice(2)
for (const name of requested.length > 0 ? requested : Object.keys(TABLES)) {
  const build = TABLES[name]
  if (!build) throw new Error(`unknown table "${name}" (known: ${Object.keys(TABLES).join(', ')})`)
  const source = await build()
  await writeFile(join(DATA_DIR, `${name}.ts`), source)
  console.log(`${name}.ts: ${(source.length / 1024).toFixed(1)} KB`)
}
