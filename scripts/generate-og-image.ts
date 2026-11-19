import sharp from 'sharp'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const ICON_SOURCE = join(ROOT, 'src/assets/logo-dark.png')
const OUTPUT = join(ROOT, 'public/og-image.png')

const WIDTH = 1200
const HEIGHT = 630
const ICON_SIZE = 220

const icon = await sharp(ICON_SOURCE)
  .resize(ICON_SIZE, ICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer()

const title = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}">
  <style>
    .title { fill: #f1f5f9; font-size: 52px; font-weight: 700; font-family: sans-serif; }
    .subtitle { fill: #94a3b8; font-size: 28px; font-weight: 400; font-family: sans-serif; }
  </style>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + ICON_SIZE / 2 + 20}" text-anchor="middle" class="title">혼천의(渾天儀)</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + ICON_SIZE / 2 + 60}" text-anchor="middle" class="subtitle">사주팔자 · 자미두수 계산기</text>
</svg>
`)

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 255 },  // slate-900
  },
})
  .composite([
    {
      input: icon,
      left: Math.round((WIDTH - ICON_SIZE) / 2),
      top: Math.round((HEIGHT - ICON_SIZE) / 2 - 70),
    },
    {
      input: title,
      left: 0,
      top: 0,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT)

console.log(`Generated ${OUTPUT} (${WIDTH}x${HEIGHT})`)
