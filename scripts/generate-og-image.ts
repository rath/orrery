import sharp from 'sharp'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const ICON_SOURCE = join(ROOT, 'src/assets/logo-dark.png')
const OUTPUT = join(ROOT, 'public/og-image.png')

const WIDTH = 1200
const HEIGHT = 630
const ICON_SIZE = 220
const BACKGROUND = '#0f172a' // slate-900

/**
 * 배경에 비처럼 내리는 한자: 천간·지지, 자미두수 14주성, 십신, 12궁, 사화, 오행.
 * 중복 글자는 한 번만 쓴다.
 */
const GLYPHS = [...new Set([
  '甲乙丙丁戊己庚辛壬癸',
  '子丑寅卯辰巳午未申酉戌亥',
  '紫微天機太陽武曲天同廉貞天府太陰貪狼巨門天相天梁七殺破軍',
  '比肩劫財食神傷官偏財正財偏官正官偏印正印',
  '命宮兄弟夫妻子女財帛疾厄遷移交友官祿田宅福德父母',
  '祿權科忌',
  '木火土金水',
].join(''))]

/** 고정 시드 난수 (mulberry32) — 다시 생성해도 같은 이미지가 나오게 한다. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 원근감을 위한 세 층: 먼 층일수록 글자가 작고 흐리다. */
const LAYERS = [
  { fontSize: 15, opacity: 0.11, columnGap: 26 },
  { fontSize: 21, opacity: 0.16, columnGap: 42 },
  { fontSize: 29, opacity: 0.22, columnGap: 74 },
] as const

const TAIL_COLOR = '#64748b' // slate-500
const HEAD_COLOR = '#f1ece2' // 로고 다크 변형의 미색
const ACCENT_COLOR = '#d7391e' // 로고의 주색
const ACCENT_CHANCE = 0.04

function buildRain(random: () => number): string {
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)]
  const glyphs: string[] = []
  for (const layer of LAYERS) {
    const step = layer.fontSize * 1.15
    for (let x = random() * layer.columnGap; x < WIDTH; x += layer.columnGap * (0.75 + random() * 0.5)) {
      // 한 열에 줄기 1~2개: 맨 아래(머리)가 가장 밝고 위로 갈수록 옅어진다
      const streams = random() < 0.35 ? 2 : 1
      for (let s = 0; s < streams; s++) {
        const length = 6 + Math.floor(random() * 14)
        const headY = random() * (HEIGHT + length * step * 0.6)
        const headColor = random() < ACCENT_CHANCE ? ACCENT_COLOR : HEAD_COLOR
        for (let i = 0; i < length; i++) {
          const y = headY - i * step
          if (y < -step || y > HEIGHT + step) continue
          const fade = (1 - i / length) ** 1.6
          const opacity = layer.opacity * (i === 0 ? 1.25 : fade)
          const color = i === 0 ? headColor : TAIL_COLOR
          glyphs.push(
            `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${layer.fontSize}" fill="${color}" fill-opacity="${opacity.toFixed(3)}">${pick(GLYPHS)}</text>`,
          )
        }
      }
    }
  }
  return glyphs.join('\n')
}

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <!-- 가운데의 로고와 제목 주변은 비가 비치지 않게 배경색으로 덮는다 -->
    <radialGradient id="clear" cx="50%" cy="51%" r="50%" gradientTransform="translate(0.5 0.51) scale(0.78 1) translate(-0.5 -0.51)">
      <stop offset="0" stop-color="${BACKGROUND}" stop-opacity="0.97"/>
      <stop offset="0.6" stop-color="${BACKGROUND}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${BACKGROUND}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${BACKGROUND}"/>
  <g font-family="AppleMyungjo, 'Nanum Myeongjo', NanumMyeongjo, serif" text-anchor="middle">
${buildRain(createRandom(0x0e7e17))}
  </g>
  <rect width="100%" height="100%" fill="url(#clear)"/>
</svg>
`)

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
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + ICON_SIZE / 2 + 60}" text-anchor="middle" class="subtitle">사주팔자 · 자미두수 · 점성술 출생차트 계산기</text>
</svg>
`)

await sharp(background)
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
  .flatten({ background: BACKGROUND })
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT)

console.log(`Generated ${OUTPUT} (${WIDTH}x${HEIGHT})`)
