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
  },
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['swisseph-wasm'],
  noExternal: ['lunar-javascript'],
})
