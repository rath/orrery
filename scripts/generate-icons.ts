// 로고 원본(scripts/logo-master.png)에서 앱 로고·파비콘·홈 화면 아이콘을 만든다.
// 원본의 모양(알파)만 쓰고 색은 아래 상수로 평탄화한다. 다크 테마용은 먹색만 미색으로 바꾼다.
import sharp, { type Sharp } from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const MASTER = join(import.meta.dirname, 'logo-master.png')

interface Rgb { r: number, g: number, b: number }

/** 먹색 획과 주색 점 (원본에서 측정한 중앙값) */
const INK: Rgb = { r: 0x15, g: 0x16, b: 0x1c }
const ACCENT: Rgb = { r: 0xd7, g: 0x39, b: 0x1e }
/** 다크 테마에서 먹색 획을 대신할 미색 */
const DARK_INK: Rgb = { r: 0xf1, g: 0xec, b: 0xe2 }
/** 불투명 아이콘(홈 화면, PWA)의 바탕색 — 라이트 테마 페이지 배경(gray-50)에 맞춤 */
const TILE_BACKGROUND = '#f9fafb'

type Variant = 'light' | 'dark'

/** 주색 점은 R이 B보다 뚜렷이 큰 픽셀이고, 그 밖의 픽셀은 모두 먹색 획이다. */
function isAccent(r: number, b: number): boolean {
  return r - b > 64
}

async function loadVariant(variant: Variant): Promise<Sharp> {
  const ink = variant === 'light' ? INK : DARK_INK
  const { data, info } = await sharp(MASTER).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const color = isAccent(data[i], data[i + 2]) ? ACCENT : ink
    data[i] = color.r
    data[i + 1] = color.g
    data[i + 2] = color.b
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
}

/**
 * 마크를 정사각형 캔버스 가운데에 놓는다.
 * @param scale 캔버스 한 변 대비 마크 긴 변의 비율
 */
async function renderSquare(
  variant: Variant,
  size: number,
  scale: number,
  background?: string,
): Promise<Buffer> {
  const inner = Math.round(size * scale)
  const mark = await (await loadVariant(variant))
    .trim({ threshold: 0 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: mark, gravity: 'center' }])
  // sharp는 composite를 파이프라인 마지막에 적용하므로 flatten은 한 번 더 거쳐야 한다.
  const composed = sharp(await canvas.png().toBuffer())
  // 불투명 아이콘은 알파 채널을 빼서 iOS가 투명 영역을 검게 칠하지 않게 한다.
  const output = background ? composed.flatten({ background }) : composed
  return output.png({ compressionLevel: 9 }).toBuffer()
}

async function save(output: string, buffer: Buffer): Promise<void> {
  const dest = join(ROOT, output)
  await mkdir(dirname(dest), { recursive: true })
  await writeFile(dest, buffer)
  const { width, height } = await sharp(buffer).metadata()
  console.log(`${output} (${width}x${height}, ${(buffer.length / 1024).toFixed(1)} KiB)`)
}

// 앱 화면·README용 로고
await save('src/assets/logo.png', await renderSquare('light', 512, 0.96))
await save('src/assets/logo-dark.png', await renderSquare('dark', 512, 0.96))

// 파비콘: 작은 칸을 최대한 채운다
await save('public/favicon-32.png', await renderSquare('light', 32, 1))
await save('public/favicon-16.png', await renderSquare('light', 16, 1))

// SVG 파비콘: 브라우저 색 구성표에 따라 라이트·다크 변형을 고른다
const FAVICON_SIZE = 128
const favicon = {
  light: (await renderSquare('light', FAVICON_SIZE, 1)).toString('base64'),
  dark: (await renderSquare('dark', FAVICON_SIZE, 1)).toString('base64'),
}
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" viewBox="0 0 ${FAVICON_SIZE} ${FAVICON_SIZE}">
  <style>
    .dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .light { display: none; }
      .dark { display: inline; }
    }
  </style>
  <image class="light" width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" href="data:image/png;base64,${favicon.light}"/>
  <image class="dark" width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" href="data:image/png;base64,${favicon.dark}"/>
</svg>
`
await save('public/favicon.svg', Buffer.from(faviconSvg))

// 홈 화면·PWA 아이콘: OS가 모서리를 깎으므로 여백을 두고 불투명 바탕에 놓는다
await save('public/apple-touch-icon.png', await renderSquare('light', 180, 0.72, TILE_BACKGROUND))
await save('public/icon-512.png', await renderSquare('light', 512, 0.72, TILE_BACKGROUND))

console.log('Done.')
