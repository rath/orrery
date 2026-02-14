import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * swisseph-wasm의 locateFile이 브라우저에서 '../wsam/swisseph.wasm' 경로를 참조.
 * 빌드 시 import.meta.url 기준 ../wsam/ = /orrery/wsam/ 이므로
 * public/wsam/에 WASM+DATA 파일을 복사하여 프로덕션에서도 로딩되도록 함.
 */
function copySwissephWasm() {
  const src = resolve(__dirname, 'node_modules/swisseph-wasm/wsam')
  const dest = resolve(__dirname, 'public/wsam')
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  for (const file of ['swisseph.wasm', 'swisseph.data']) {
    copyFileSync(resolve(src, file), resolve(dest, file))
  }
}

export default defineConfig({
  base: '/orrery/',
  plugins: [
    {
      name: 'copy-swisseph-wasm',
      buildStart() { copySwissephWasm() },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@orrery/core': resolve(__dirname, 'packages/core/src'),
    },
  },
  optimizeDeps: { exclude: ['swisseph-wasm'] },
  assetsInclude: ['**/*.wasm'],
})
