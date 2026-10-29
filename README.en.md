[한국어](./README.md) | **English** | [中文](./README.zh.md) | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

A browser-based divination tool. It computes Saju (四柱八字, Four Pillars of Destiny), Ziwei Doushu (紫微斗數, Purple Star Astrology), and Western astrology natal charts entirely on the client — no backend required.

**[Live Demo →](https://sky.told.me/)**

## Credits

- **Saju Perpetual Calendar** — Originally a Perl [perpetual calendar](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html) by Ko Young-chang, [ported to PHP](https://github.com/OOPS-ORG-PHP/Lunar) by Kim Jeong-gyun. In November 2018, Jang-Ho Hwang ported it to Java and Python for personal use, and in February 2026 ported it to TypeScript with Claude Code (Opus 4.6). Since October 2026, solar-term instants come from lunar-javascript's astronomical calculation.
- **紫微斗數 Chart** — Implemented by Claude (Opus 4.5) on top of the [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) library, drawing on Chinese-language sources.
- **Astrology Natal Chart** — A pure TypeScript port of the Moshier ephemeris from [Swiss Ephemeris](https://www.astro.com/swisseph/).

## Features

### 四柱八字 (Four Pillars of Destiny)
- Four pillars (hour, day, month, year) from the sexagenary (干支) cycle
- 十神 (Ten Gods), 十二運星 (Twelve Life Stages), 藏干 (Hidden Stems)
- 十二神殺 (Twelve Spirits), 空亡 (Void)
- 神殺: auspicious (天乙貴人, 天德貴人, 月德貴人, 文昌貴人, 金輿祿) and inauspicious (羊刃殺, 桃花殺, 白虎殺, 魁罡殺, 紅艶殺)
- Interaction analysis: 合 (combinations), 沖 (clashes), 刑 (punishments), 破 (destructions), 害 (harms) — including 三合, 半合, and 方合
- 坐法 and 引從法
- Choice of 子時 (Zi hour) method: unified (default) or split (night 子時)
- 10 major luck periods (大運) with forward/reverse direction
- Daily/monthly transit analysis (合/沖/刑 detection)

### 紫微斗數 (Purple Star Astrology)
- Automatic lunar calendar conversion
- 命宮 (Life Palace) / 身宮 (Body Palace) calculation
- Placement of the 14 major stars (紫微 group + 天府 group)
- Auxiliary and malefic star placement
- 四化 (化祿/化權/化科/化忌)
- Star brightness (廟/旺/得/利/平/陷)
- Traditional 4×4 命盤 grid layout
- 12 大限 (major periods)
- Annual fortune (流年): 流年命宮, 流年四化, 12 流月

### Natal Chart (Western Astrology)
- Planetary positions from the Swiss Ephemeris Moshier ephemeris (pure TypeScript)
- Positions of the 10 planets, Chiron, the North/South Nodes, and the Part of Fortune (sign, degree, retrograde, house)
- 10 house systems (Placidus by default)
- ASC / MC / DESC / IC angles
- 5 major aspects (conjunction, sextile, square, trine, opposition)
- Chart wheel

### General
- Copy everything as text for AI interpretation (四柱八字 + 紫微斗數 + natal chart in one go)
- Birth place: search major Korean and world cities (Hangul initial-consonant search supported) or enter latitude/longitude directly (default: Seoul); the time zone is inferred from the coordinates
- Historical changes to Korean standard time (daylight saving time, the UTC+8:30 era) handled automatically
- Unknown birth time mode (three pillars for 四柱八字, no 紫微斗數 chart, natal chart without houses or angles)
- Saved profiles (kept in the browser, with JSON import/export)
- UI in 6 languages (Korean, English, Chinese, Japanese, German, Spanish)
- Light/dark theme (follows the system setting)
- Usage guide and glossary
- Mobile-friendly layout

## Usage

```bash
# Install dependencies
bun install

# Development server
bun dev

# Build
bun run build

# Lint
bun run lint

# Type check
bun run typecheck

# Test
bun run test
```

## Tech Stack

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript (lunar calendar conversion, solar term times)
- @photostructure/tz-lookup (time zone lookup from coordinates)
- Vitest (testing)

## `@orrery/core` Quick Start

The calculation engine is available as an npm package. → [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'

// Without a timezone, the calculation uses Asia/Seoul
const input = { year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' as const }

// 四柱八字 (Four Pillars)
const saju = calculateSaju(input)
saju.pillars.forEach(p => console.log(p.pillar.ganzi)) // 乙巳, 壬辰, 乙卯, 癸酉 (hour, day, month, year)

// 紫微斗數 chart (last argument: isMale)
const ziwei = createChart(1993, 3, 12, 9, 45, true)
console.log(ziwei.mingGongZhi)   // 命宮 Earthly Branch (戌)
console.log(ziwei.wuXingJu.name) // Five Elements Bureau (水二局)

// Western natal chart
const natal = await calculateNatal(input)
natal.planets.forEach(p => console.log(`${p.id}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`))
console.log(`ASC: ${natal.angles?.asc.sign}`) // angles is null when the birth time is unknown
```

## License

[AGPL-3.0](LICENSE)

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
