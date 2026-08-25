[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | [English](https://github.com/rath/orrery/blob/main/packages/core/README.en.md) | **中文** | [日本語](https://github.com/rath/orrery/blob/main/packages/core/README.ja.md)

# @orrery/core

可在浏览器和 Node.js 环境下运行的东方与西方命理计算引擎。

- **四柱八字** — 六十甲子、十神、十二运星、十二神煞、大運、干支关系分析
- **紫微斗數** — 命盤生成、大限、流年/流月分析
- **西方占星术出生星盘（Natal Chart）** — 行星位置、宫位、四轴、相位（纯 TypeScript）

无需后端。所有计算均在客户端完成。

**[在线演示 →](https://rath.github.io/orrery/)**

## 致谢

- **四柱万年历** — 由고영창（Ko Young-chang）编写的 Perl [真万年历](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)，经김정균（Kim Jeong-gyun）[移植为 PHP](https://github.com/OOPS-ORG-PHP/Lunar)，2018年11月황장호（Hwang Jang-ho）将其移植为 Java 和 Python 并一直使用，2026年2月使用 Claude Code（Opus 4.6）移植为 TypeScript
- **紫微斗數命盤** — 基于 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 库，由 Claude（Opus 4.5）研究中文文献后实现
- **占星术出生星盘** — 将 [Swiss Ephemeris](https://www.astro.com/swisseph/) 的 Moshier 星历表移植为纯 TypeScript

## 安装

```bash
npm install @orrery/core
```

## 使用方法

### 四柱八字

```typescript
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
}

const result = calculateSaju(input)

// 四柱（时、日、月、年顺序）
for (const p of result.pillars) {
  console.log(p.pillar.ganzi)     // '乙巳', '壬辰', '乙卯', '癸酉'
  console.log(p.stemSipsin)       // 天干十神
  console.log(p.branchSipsin)     // 地支十神
  console.log(p.unseong)          // 十二运星
}

// 大運
for (const dw of result.daewoon) {
  console.log(`${dw.ganzi} (${dw.age}세~)`)
}

// 干支关系（合、冲、刑、破、害）
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 紫微斗數

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// 生成命盤
const chart = createChart(1993, 3, 12, 9, 45, true)

console.log(chart.mingGongZhi)     // 命宮地支
console.log(chart.shenGongZhi)     // 身宮地支
console.log(chart.wuXingJu.name)   // 五行局（例：'水二局'）

// 查看各宫位的星曜
for (const [name, palace] of Object.entries(chart.palaces)) {
  const stars = palace.stars.map(s => {
    const sihua = s.siHua ? `(${s.siHua})` : ''
    return `${s.name}${s.brightness}${sihua}`
  })
  console.log(`${name} [${palace.ganZhi}]: ${stars.join(', ')}`)
}

// 大限
const daxianList = getDaxianList(chart)
for (const dx of daxianList) {
  console.log(`${dx.ageStart}~${dx.ageEnd}세: ${dx.palaceName} ${dx.ganZhi}`)
}
const currentDaxianIndex = getDaxianIndex(chart, new Date().getFullYear())

// 流年 — 特定年份的运势
const liunian = calculateLiunian(chart, 2026)
console.log(liunian.natalPalaceAtMing) // 流年命宮所在的本命盤宫位
console.log(liunian.siHua)             // 流年四化
```

### 西方占星术（Natal Chart）

```typescript
import { calculateNatal } from '@orrery/core/natal'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
  latitude: 37.5665,   // 首尔（可选，默认：首尔）
  longitude: 126.9780,
}

const chart = await calculateNatal(input)

// 行星位置
for (const planet of chart.planets) {
  console.log(`${planet.id}: ${planet.sign} ${planet.degreeInSign.toFixed(1)}°`)
  // 'Sun: Pisces 21.6°'
}

// ASC / MC
console.log(`ASC: ${chart.angles.asc.sign}`)
console.log(`MC: ${chart.angles.mc.sign}`)

// 宫位（默认：Placidus）
for (const house of chart.houses) {
  console.log(`House ${house.number}: ${house.sign} ${house.degreeInSign.toFixed(1)}°`)
}

// 相位
for (const aspect of chart.aspects) {
  console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}°)`)
}

// 更改宫位系统（Koch）
const kochChart = await calculateNatal(input, 'K')
```

### 底层 API

也可以直接使用各个函数：

```typescript
import { getFourPillars, getDaewoon, getRelation } from '@orrery/core/pillars'
import { STEM_INFO, ELEMENT_HANJA } from '@orrery/core/constants'

// 仅计算四柱
const [년주, 월주, 일주, 시주] = getFourPillars(1993, 3, 12, 9, 45)
console.log(년주, 월주, 일주, 시주) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神关系
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// 天干五行信息
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### 城市数据

提供韩国及世界主要城市数据，可用于出生地点输入：

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', lat: 37.5665, lon: 126.9780 }

// 支持韩语初声搜索
const results = filterCities('ㅂㅅ')  // 匹配 '부산'
console.log(formatCityName(results[0])) // '부산'
```

## 运行示例

克隆仓库后可以直接运行示例脚本：

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

可以按需选择性导入模块：

| 路径 | 说明 |
|------|------|
| `@orrery/core` | 完整 barrel export |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`、星座/行星符号、格式化函数 |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` 等底层 API |
| `@orrery/core/types` | 所有 TypeScript 类型/接口 |
| `@orrery/core/constants` | 天干/地支、十神、宫位名等常量表 |
| `@orrery/core/cities` | 城市数据、搜索函数 |

## 依赖

| 包名 | 类型 | 用途 |
|------|------|------|
| `lunar-javascript` | dependency | 阴历转换（紫微斗數） |

所有功能均以纯 TypeScript 运行，无需外部 WASM 或数据文件依赖。

## 许可证

[AGPL-3.0](../../LICENSE)

<details>
<summary>什么是 AGPL-3.0？（简单说明）</summary>

### 你可以自由地

- **个人使用** — 在自己的电脑上随意运行和修改。
- **阅读和学习源代码** — 随时欢迎通过阅读代码来学习。
- **修改、改进后再分发** — 你可以修改代码后重新分发，但必须遵守以下条件。

### 你必须遵守的

- **保持相同许可证（AGPL-3.0）** — 修改或包含此代码进行分发时，衍生作品也必须以 AGPL-3.0 公开。
- **公开源代码** — 与普通 GPL 不同，AGPL 要求**即使作为网络服务提供时也必须公开源代码**。例如，如果你修改此代码并作为网站运营，当用户请求时必须提供修改后的源代码。
- **标明变更内容** — 必须明确标注你对原始代码做了哪些修改。
- **保留版权声明** — 不得删除原始的版权声明和许可证文本。

### 你不可以

- **在不公开源代码的情况下运营服务** — 修改此代码用于运营网络服务却不公开源代码，属于违反许可证。
- **更换许可证** — 不能将 AGPL 代码以 MIT、Apache 等更宽松的许可证重新分发。

### 一句话总结

> 尽管使用，但如果你修改了代码或将其作为服务提供，请以 AGPL-3.0 公开源代码。

</details>
