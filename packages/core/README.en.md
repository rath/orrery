[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | **English** | [中文](https://github.com/rath/orrery/blob/main/packages/core/README.zh.md) | [日本語](https://github.com/rath/orrery/blob/main/packages/core/README.ja.md)

# @orrery/core

A calculation engine for Eastern and Western divination that runs in browser and Node.js environments.

- **四柱八字 (Four Pillars of Destiny)** — 60 干支 cycle, 十神, 12운성, 12신살, 大運, stem-branch interaction analysis
- **紫微斗數 (Purple Star Astrology)** — 命盤 generation, 大限, 流年/流月 analysis
- **Western Astrology Natal Chart** — Planet positions, houses, angles, aspects (pure TypeScript)

No backend required. All calculations are performed on the client.

**[Live Demo →](https://sky.told.me/)**

## Credits

- **Saju Perpetual Calendar** — Originally a Perl [perpetual calendar](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html) by Ko Young-chang, [ported to PHP](https://github.com/OOPS-ORG-PHP/Lunar) by Kim Jeong-gyun. In November 2018, Hwang Jang-ho ported it to Java and Python for personal use, then ported it to TypeScript in February 2026 using Claude Code (Opus 4.6).
- **紫微斗數 Chart** — Built on the [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) library; Claude (Opus 4.5) implemented it while researching Chinese-language references.
- **Astrology Natal Chart** — The Moshier ephemeris from [Swiss Ephemeris](https://www.astro.com/swisseph/) ported to pure TypeScript.

## Installation

```bash
npm install @orrery/core
```

## Usage

### 四柱八字 (Four Pillars of Destiny)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
}

const result = calculateSaju(input)

// Four Pillars (hour, day, month, year order)
for (const p of result.pillars) {
  console.log(p.pillar.ganzi)     // '乙巳', '壬辰', '乙卯', '癸酉'
  console.log(p.stemSipsin)       // Heavenly Stem 十神
  console.log(p.branchSipsin)     // Earthly Branch 十神
  console.log(p.unseong)          // 12운성
}

// 大運 (Major Life Periods)
for (const dw of result.daewoon) {
  const startYear = dw.startDate.getUTCFullYear()
  console.log(`${dw.ganzi} (age ${dw.age}~, starts in ${startYear})`)
}

// Stem-Branch Interactions (合, 沖, 刑, 破, 害)
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### Unknown birth times and time zones

- When `unknownTime: true`, `hour` and `minute` are ignored. The Gan-Zhi, stem, and branch of `result.pillars[0]` are `'??'`, `'?'`, and `'?'`; the hour pillar is excluded from relation, special-sal, Gongmang, Jwabeop, and transit analysis.
- Omitting `timezone` falls back to `Asia/Seoul`. For births outside Korea, always provide an IANA time-zone ID and `longitude`; also provide `latitude` when calculating Western astrology houses.
- A 大運 `startDate` stores an astrological civil date in UTC fields so that it is independent of the runtime time zone. Read its calendar fields with `getUTCFullYear()`, `getUTCMonth()`, and `getUTCDate()`.

### 紫微斗數 (Purple Star Astrology)

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// Generate 命盤
const chart = createChart(1993, 3, 12, 9, 45, true)

console.log(chart.mingGongZhi)     // 命宮 Earthly Branch
console.log(chart.shenGongZhi)     // 身宮 Earthly Branch
console.log(chart.wuXingJu.name)   // Five Elements Bureau (e.g., '水二局')

// Stars in each palace
for (const [name, palace] of Object.entries(chart.palaces)) {
  const stars = palace.stars.map(s => {
    const sihua = s.siHua ? `(${s.siHua})` : ''
    return `${s.name}${s.brightness}${sihua}`
  })
  console.log(`${name} [${palace.ganZhi}]: ${stars.join(', ')}`)
}

// 大限 (Major Life Periods)
const daxianList = getDaxianList(chart)
for (const dx of daxianList) {
  console.log(`${dx.ageStart}~${dx.ageEnd}세: ${dx.palaceName} ${dx.ganZhi}`)
}
const currentDaxianIndex = getDaxianIndex(chart, new Date().getFullYear())

// 流年 (Annual Fortune) — Fortune for a specific year
const liunian = calculateLiunian(chart, 2026)
console.log(liunian.natalPalaceAtMing) // Natal palace where 流年命宮 falls
console.log(liunian.siHua)             // 流年 四化
```

### Western Astrology (Natal Chart)

```typescript
import { calculateNatal } from '@orrery/core/natal'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
  latitude: 37.5665,   // Seoul (optional, default: Seoul)
  longitude: 126.9780,
}

const chart = await calculateNatal(input)

// Planet positions
for (const planet of chart.planets) {
  console.log(`${planet.id}: ${planet.sign} ${planet.degreeInSign.toFixed(1)}°`)
  // 'Sun: Pisces 21.6°'
}

// ASC / MC
console.log(`ASC: ${chart.angles.asc.sign}`)
console.log(`MC: ${chart.angles.mc.sign}`)

// Houses (default: Placidus)
for (const house of chart.houses) {
  console.log(`House ${house.number}: ${house.sign} ${house.degreeInSign.toFixed(1)}°`)
}

// Aspects
for (const aspect of chart.aspects) {
  console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}°)`)
}

// Change house system (Koch)
const kochChart = await calculateNatal(input, 'K')
```

### Low-Level API

You can also use individual functions directly:

```typescript
import { getFourPillars, getDaewoon, getRelation } from '@orrery/core/pillars'
import { STEM_INFO, ELEMENT_HANJA } from '@orrery/core/constants'

// Calculate only the four pillars
const [년주, 월주, 일주, 시주] = getFourPillars(1993, 3, 12, 9, 45)
console.log(년주, 월주, 일주, 시주) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神 relationship
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// Heavenly Stem Five Elements info
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### City Data

Provides Korean and world major city data for birth location input:

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', lat: 37.5665, lon: 126.9780 }

// Supports Korean initial consonant search
const results = filterCities('ㅂㅅ')  // Matches '부산'
console.log(formatCityName(results[0])) // '부산'
```

## Running Examples

After cloning the repository, you can run the example scripts directly:

```bash
git clone https://github.com/rath/orrery.git
cd orrery
bun install

# 사주팔자
bun packages/core/examples/saju.ts

# 자미두수
bun packages/core/examples/ziwei.ts

# 서양 점성술 출생차트
bun packages/core/examples/natal.ts
```

## Subpath Exports

You can selectively import only the modules you need:

| Path | Description |
|------|-------------|
| `@orrery/core` | Full barrel export |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`, zodiac/planet symbols, format functions |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()`, and other low-level APIs |
| `@orrery/core/types` | All TypeScript types/interfaces |
| `@orrery/core/constants` | Stems/branches, 十神, palace names, and other constant tables |
| `@orrery/core/cities` | City data, search functions |

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `lunar-javascript` | dependency | Lunar calendar conversion (紫微斗數) |

All features run as pure TypeScript with no external WASM or data file dependencies.

## License

[AGPL-3.0](../../LICENSE)

<details>
<summary>What is AGPL-3.0? (Plain English)</summary>

### What you CAN do

- **Use it personally** — Run and modify it freely on your own machine.
- **Read and study the source code** — You are always welcome to learn from the code.
- **Modify, improve, and redistribute** — You can fork and redistribute the code, provided you follow the conditions below.

### What you MUST do

- **Keep the same license (AGPL-3.0)** — Any derivative work that includes or modifies this code must also be released under AGPL-3.0.
- **Disclose source code** — Unlike the standard GPL, the AGPL requires source disclosure **even when the software is offered as a web service**. If you modify this code and run it as a website, you must provide the modified source code to users upon request.
- **State changes** — You must clearly indicate what you changed from the original.
- **Preserve copyright notices** — Do not remove the original copyright and license notices.

### What you CANNOT do

- **Run a service with closed source** — Using a modified version of this code to operate a web service without disclosing the source is a license violation.
- **Relicense** — You cannot redistribute AGPL code under a more permissive license such as MIT or Apache.

### TL;DR

> Use it freely, but if you modify it or offer it as a service, you must release the source code under AGPL-3.0.

</details>
