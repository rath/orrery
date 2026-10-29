[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | **English** | [中文](https://github.com/rath/orrery/blob/main/packages/core/README.zh.md) | [日本語](https://github.com/rath/orrery/blob/main/packages/core/README.ja.md)

# @orrery/core

A calculation engine for Eastern and Western divination that runs in browsers and Node.js.

- **四柱八字 (Four Pillars of Destiny)** — sexagenary (干支) cycle, 十神, 十二運星, 神殺 and 十二神殺, 空亡, 大運, stem-branch interaction analysis
- **紫微斗數 (Purple Star Astrology)** — 命盤 generation, 大限, 流年/流月 analysis
- **Western Astrology Natal Chart** — planet positions, houses, angles, aspects, Part of Fortune (pure TypeScript)

No backend required: all calculations run on the client.

**[Live Demo →](https://sky.told.me/)**

## Credits

- **Saju Perpetual Calendar** — Originally a Perl [perpetual calendar](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html) by Ko Young-chang, [ported to PHP](https://github.com/OOPS-ORG-PHP/Lunar) by Kim Jeong-gyun. In November 2018, Jang-Ho Hwang ported it to Java and Python for personal use, and in February 2026 ported it to TypeScript with Claude Code (Opus 4.6). Since October 2026, solar-term instants come from lunar-javascript's astronomical calculation.
- **紫微斗數 Chart** — Implemented by Claude (Opus 4.5) on top of the [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) library, drawing on Chinese-language sources.
- **Astrology Natal Chart** — A pure TypeScript port of the Moshier ephemeris from [Swiss Ephemeris](https://www.astro.com/swisseph/).

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
  console.log(p.unseong)          // 十二運星
}

// 大運 (Major Luck Periods)
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

- When `unknownTime: true`, `hour` and `minute` are ignored and the calculation uses noon (12:00), so the start of each 大運 may be off by several months. The Gan-Zhi, stem, and branch of `result.pillars[0]` are `'??'`, `'?'`, and `'?'`, and the hour pillar is excluded from relation, 神殺, 空亡, 坐法, and transit analysis. `calculateNatal()` skips houses, angles, and the Part of Fortune (`houses` is an empty array and `angles` is `null`).
- Omitting `timezone` falls back to `Asia/Seoul`. For births outside Korea, always provide an IANA time-zone ID and `longitude`; also provide `latitude` when calculating Western astrology houses. The 紫微斗數 `createChart()` takes positional arguments instead of a `BirthInput`, so pass `timezone` and `longitude` as its 7th and 8th arguments.
- A 大運 `startDate` holds the wall-clock date used in the calculation in its UTC fields, so it does not depend on the runtime time zone. Read its calendar fields with `getUTCFullYear()`, `getUTCMonth()`, and `getUTCDate()`.

### 紫微斗數 (Purple Star Astrology)

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// Generate 命盤 (solar year, month, day, hour, minute, isMale)
// Born abroad: createChart(1993, 3, 12, 9, 45, true, 'America/New_York', -74.006)
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

// 大限 (Major Periods)
const daxianList = getDaxianList(chart)
for (const dx of daxianList) {
  console.log(`ages ${dx.ageStart}–${dx.ageEnd}: ${dx.palaceName} ${dx.ganZhi}`)
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
  // 'Sun: Pisces 21.5°'
}

// ASC / MC (angles is null when the birth time is unknown)
if (chart.angles) {
  console.log(`ASC: ${chart.angles.asc.sign}`)
  console.log(`MC: ${chart.angles.mc.sign}`)
}

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
const [yearPillar, monthPillar, dayPillar, hourPillar] = getFourPillars(1993, 3, 12, 9, 45)
console.log(yearPillar, monthPillar, dayPillar, hourPillar) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神 relationship
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// Heavenly Stem Five Elements info
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### City Data

Data for major cities in Korea and around the world, for birth-location input:

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', region: '서울특별시', lat: 37.5665, lon: 126.978 }

// Supports Hangul initial-consonant (초성) search
const results = filterCities('ㅂㅅ')  // Matches '부산' (Busan)
console.log(formatCityName(results[0])) // '부산'
```

## Calculation Conventions

Input dates must be valid Gregorian dates from 1 to 9999 CE. Natal charts are computed only through 3003-04-29 (TT), the end of the Moshier ephemeris; after that, `calculateNatal()` throws a `RangeError`. Chiron is included only from 1900-01-01 to 2099-12-23 (UT), the span of its pre-computed table; outside it, the chart is calculated without Chiron.

### 四柱八字

The year and month pillars and the 大運 starting age are determined from astronomical solar-term instants computed by `lunar-javascript` and converted to UTC. Births in Korea (`timezone` set to `Asia/Seoul` or omitted) are first normalized to the KST wall clock, absorbing historical deviations such as daylight saving time, and then use hour-pillar boundaries shifted 30 minutes later (子時 = 23:30–01:30), following Korean convention. Births elsewhere use true solar time corrected for longitude and the equation of time, without the 30-minute shift.

### 紫微斗數

The lunar new year marks the year boundary and midnight (00:00) marks the day boundary. A leap month is treated in full as the lunar month it repeats; rules from schools that split a leap month into first and second halves are not applied. The 流月 命宮 is placed from 斗君, which reflects the birth month and hour, and 大限 ages are counted in East Asian reckoning, with the lunar birth year as age 1. Results were verified against [iztro](https://github.com/SylarLong/iztro) configured with `dayDivide: 'current'`, `yearDivide: 'normal'`, and `fixLeap: false`.

### Natal Chart

Whether the Part of Fortune uses the day or night formula is decided by the geometric altitude of the Sun's center (without atmospheric refraction), not by house number. The same horizon-based test therefore applies to Whole Sign and Morinus, whose house boundaries do not coincide with the horizon, and at polar latitudes. Where Placidus or Koch cannot be computed near the poles, Porphyrius is used instead; `chart.houseSystem` reports the system actually applied.

## Running Examples

After cloning the repository, you can run the example scripts directly (their output is in Korean):

```bash
git clone https://github.com/rath/orrery.git
cd orrery
bun install

# 四柱八字 (Four Pillars)
bun packages/core/examples/saju.ts

# 紫微斗數 (Purple Star Astrology)
bun packages/core/examples/ziwei.ts

# Western natal chart
bun packages/core/examples/natal.ts
```

## Subpath Exports

You can selectively import only the modules you need:

| Path | Description |
|------|-------------|
| `@orrery/core` | Barrel export of the public API (excluding `validation`) |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`, `HOUSE_SYSTEMS`, zodiac/planet symbols, format functions |
| `@orrery/core/timezone` | `resolveLocalDateTimeToUtc()`, `getBirthTimezone()`, and other time-zone/DST utilities |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()`, and other low-level APIs |
| `@orrery/core/types` | All TypeScript types/interfaces |
| `@orrery/core/constants` | Stems/branches, 十神, palace names, and other constant tables |
| `@orrery/core/cities` | City data, search functions |
| `@orrery/core/validation` | `assertBirthInput()` and other input validation |

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `lunar-javascript` | dependency | Lunar calendar conversion (紫微斗數), solar-term instants (四柱八字) |

All features run as pure TypeScript with no external WASM or data file dependencies.

## License

[AGPL-3.0](https://github.com/rath/orrery/blob/main/LICENSE)

<details>
<summary>What is AGPL-3.0? (Plain English)</summary>

### What you CAN do

- **Use it personally** — Run and modify it freely on your own machine.
- **Read and study the source code** — You are always welcome to learn from the code.
- **Modify, improve, and redistribute** — You can fork and redistribute the code, provided you follow the conditions below.

### What you MUST do

- **Keep the same license (AGPL-3.0)** — Any derivative work that includes or modifies this code must also be released under AGPL-3.0.
- **Disclose source code** — Unlike the standard GPL, the AGPL requires source disclosure **even when the software is offered as a web service**. If you modify this code and run it as a website, you must give the site's users a way to obtain the modified source code.
- **State changes** — You must clearly indicate what you changed from the original.
- **Preserve copyright notices** — Do not remove the original copyright and license notices.

### What you CANNOT do

- **Run a service with closed source** — Using a modified version of this code to operate a web service without disclosing the source is a license violation.
- **Relicense** — You cannot redistribute AGPL code under a more permissive license such as MIT or Apache.

### TL;DR

> Use it freely, but if you distribute a modified version or offer it as a service, you must release the source code under AGPL-3.0.

</details>
