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
  // Bundling strips source comments; keep the license and the sources of the ephemeris data in every file.
  banner: {
    js: '/*! @orrery/core | MIT License | Copyright (c) 2026 Jang-Ho Hwang | https://github.com/rath/orrery\n'
      + ' * Ephemeris data: VSOP87 (Bretagnon & Francou 1988), ELP 2000-82B (Chapront-Touze & Chapront 1983),\n'
      + ' * NASA/JPL Horizons (DE441), IERS Conventions 2010, USNO. */',
  },
})
