import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const SOURCE = join(ROOT, 'icon-1024.png')

const icons = [
  { size: 512, output: 'src/assets/icon-512.png' },
  { size: 256, output: 'src/assets/icon-256.png' },
  { size: 180, output: 'public/apple-touch-icon.png' },
  { size: 32, output: 'public/favicon-32.png' },
  { size: 16, output: 'public/favicon-16.png' },
] as const

await mkdir(join(ROOT, 'src/assets'), { recursive: true })
await mkdir(join(ROOT, 'public'), { recursive: true })

for (const { size, output } of icons) {
  const dest = join(ROOT, output)
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log(`${output} (${size}x${size})`)
}

console.log('Done.')
