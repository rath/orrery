import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    saju: 'src/saju.ts',
    ziwei: 'src/ziwei.ts',
    natal: 'src/natal.ts',
    pillars: 'src/pillars.ts',
    types: 'src/types.ts',
    constants: 'src/constants.ts',
    cities: 'src/cities.ts',
    timezone: 'src/timezone.ts',
    validation: 'src/validation.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  // Bundling strips source comments; keep the license and upstream copyright in every file.
  banner: {
    js: '/*! @orrery/core | AGPL-3.0-only | https://github.com/rath/orrery\n'
      + ' * Includes code ported from Swiss Ephemeris, Copyright (C) 1997-2021 Astrodienst AG, Switzerland. */',
  },
})
