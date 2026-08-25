[한국어](./README.md) | **English** | [中文](./README.zh.md) | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

A browser-based divination tool. Computes 사주팔자(四柱八字), 자미두수(紫微斗數), and Western astrology natal charts entirely on the client — no backend required.

**[Live Demo →](https://sky.told.me/)**

## Credits

- **Saju Perpetual Calendar** — Originally a Perl [perpetual calendar](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html) by Ko Young-chang, [ported to PHP](https://github.com/OOPS-ORG-PHP/Lunar) by Kim Jeong-gyun. In November 2018, Jang-Ho Hwang ported it to Java and Python for personal use, then ported it to TypeScript in February 2026 using Claude Code (Opus 4.6).
- **紫微斗數 Chart** — Built on the [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) library; Claude (Opus 4.5) implemented it while researching Chinese-language references.
- **Astrology Natal Chart** — The Moshier ephemeris from [Swiss Ephemeris](https://www.astro.com/swisseph/) ported to pure TypeScript.

## Features

### 四柱八字 (Four Pillars of Destiny)
- Four pillar calculation based on the 60 干支 cycle (hour, day, month, year)
- 十神 (Ten Gods), 12운성 (Twelve Stages), 지장간 (Hidden Stems)
- Interaction analysis: 合 (combinations), 沖 (clashes), 刑 (punishments), 破 (destructions), 害 (harms) — including 三合, 半合, 方合
- 神煞: 양인살, 백호살, 괴강살
- Night/early 子時 (Zi hour) support
- 10 major life periods (大運) with forward/reverse progression
- Daily/monthly transit analysis (合/沖/刑 detection)

### 紫微斗數 (Purple Star Astrology)
- Automatic lunar calendar conversion
- 命宮 (Life Palace) / 身宮 (Body Palace) calculation
- 14 major star placement (紫微 series + 天府 series)
- Auxiliary and malefic star placement
- 四化 (化祿/化權/化科/化忌)
- Star brightness (廟/旺/得/利/平/陷)
- Traditional 4×4 命盤 grid layout
- 12 大限 (major life periods)
- Annual fortune (流年): 流年命宮, 流年四化, 12 流月

### Natal Chart (Western Astrology)
- Planet position calculation based on Swiss Ephemeris Moshier theory (pure TypeScript)
- 10 planets + Chiron + North/South Node positions (sign, degree, retrograde)
- House system selection (Placidus default, 10 systems supported)
- ASC / MC / DESC / IC angles
- 5 major aspects (conjunction, sextile, square, trine, opposition)
- Birth location input (latitude/longitude, default: Seoul)

### General
- AI-agent-friendly text copy (四柱八字 + 紫微斗數 + Natal Chart combined)
- Usage guide and glossary
- Unknown birth time mode (3-pillar calculation)
- Mobile responsive

## Usage

```bash
# Install dependencies
bun install

# Development server
bun dev

# Build
bun run build

# Test
bun test
```

## Tech Stack

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript (lunar calendar conversion)
- Vitest (testing)

## `@orrery/core` Quick Start

The calculation engine is available as an npm package. → [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'

const input = { year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' as const }

// 사주팔자
const saju = calculateSaju(input)
saju.pillars.forEach(p => console.log(p.pillar.ganzi)) // 乙巳, 壬辰, 乙卯, 癸酉

// 자미두수 명반
const ziwei = createChart(1993, 3, 12, 9, 45, true)
console.log(ziwei.mingGongZhi)  // 명궁 지지
console.log(ziwei.wuXingJu.name) // 오행국

// 서양 점성술 출생차트
const natal = await calculateNatal(input)
natal.planets.forEach(p => console.log(`${p.id}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`))
console.log(`ASC: ${natal.angles.asc.sign}`)
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
- **Disclose source code** — Unlike the standard GPL, the AGPL requires source disclosure **even when the software is offered as a web service**. If you modify this code and run it as a website, you must provide the modified source code to users upon request.
- **State changes** — You must clearly indicate what you changed from the original.
- **Preserve copyright notices** — Do not remove the original copyright and license notices.

### What you CANNOT do

- **Run a service with closed source** — Using a modified version of this code to operate a web service without disclosing the source is a license violation.
- **Relicense** — You cannot redistribute AGPL code under a more permissive license such as MIT or Apache.

### TL;DR

> Use it freely, but if you modify it or offer it as a service, you must release the source code under AGPL-3.0.

</details>
