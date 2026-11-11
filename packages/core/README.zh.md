[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | [English](https://github.com/rath/orrery/blob/main/packages/core/README.en.md) | **中文** | [日本語](https://github.com/rath/orrery/blob/main/packages/core/README.ja.md)

# @orrery/core

可在浏览器和 Node.js 环境中运行的东西方命理计算引擎。

- **四柱八字** — 六十甲子、十神、十二长生、神煞与十二神煞、空亡、大运、干支关系分析
- **紫微斗数** — 命盘生成、大限、流年/流月分析
- **西方占星出生星盘（Natal Chart）** — 行星位置、宫位、四轴、相位、福点（纯 TypeScript）

无需后端，所有计算均在客户端完成。

**[在线演示 →](https://sky.told.me/)**

## 致谢

- **四柱万年历** — 고영창（Ko Young-chang）用 Perl 编写了[真万年历](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)，김정균（Kim Jeong-gyun）将其[移植到 PHP](https://github.com/OOPS-ORG-PHP/Lunar)；2018年11月，황장호（Hwang Jang-ho）又将其移植到 Java 和 Python 自用，2026年2月借助 Claude Code（Opus 4.6）移植到 TypeScript；自2026年10月起，节气交接时刻改用 lunar-javascript 的天文计算
- **紫微斗数命盘** — 由 Claude（Opus 4.5）参考中文文献，基于 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 库实现
- **占星出生星盘** — 仅依据公开发表的天文理论与公共数据独立实现的纯 TypeScript 星历。水星至火星采用 [VSOP87](https://ftp.imcce.fr/pub/ephem/planets/vsop87/)，月球采用 [ELP 2000-82B](https://ftp.imcce.fr/pub/ephem/moon/elp82b/) 理论，木星至冥王星和凯龙星则从 [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)（DE441）的状态向量出发做数值积分，结果均与 JPL Horizons 对照验证

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
  console.log(p.unseong)          // 十二长生
}

// 大运
for (const dw of result.daewoon) {
  const startYear = dw.startDate.getUTCFullYear()
  console.log(`${dw.ganzi} (${dw.age}岁起，${startYear}年开始)`)
}

// 干支关系（合、冲、刑、破、害）
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 出生时间不详与时区

- 设置 `unknownTime: true` 时，`hour` 和 `minute` 会被忽略，并按正午（12:00）计算，因此大运起运时间可能有数月误差。`result.pillars[0]` 的干支、天干、地支分别为 `'??'`、`'?'`、`'?'`，时柱不参与干支关系、神煞、空亡、坐法和流运分析。`calculateNatal()` 不计算宫位、四轴和福点（`houses` 为空数组，`angles` 为 `null`）。
- 省略 `timezone` 时默认使用 `Asia/Seoul`。出生地在韩国以外时，必须指定 IANA 时区 ID 和 `longitude`；计算西方占星宫位时还需指定 `latitude`。紫微斗数的 `createChart()` 不接收 `BirthInput`，而是接收逐个参数，请通过第 7、8 个参数传入 `timezone` 和 `longitude`。
- 大运的 `startDate` 把命理计算所用的当地日期存放在 UTC 字段中，因此不受运行环境时区的影响。读取年月日时请使用 `getUTCFullYear()`、`getUTCMonth()` 和 `getUTCDate()`。

### 紫微斗数

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// 生成命盘（公历年、月、日、时、分，是否为男性）
// 海外出生：createChart(1993, 3, 12, 9, 45, true, 'America/New_York', -74.006)
const chart = createChart(1993, 3, 12, 9, 45, true)

console.log(chart.mingGongZhi)     // 命宫地支
console.log(chart.shenGongZhi)     // 身宫地支
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
  console.log(`${dx.ageStart}~${dx.ageEnd}岁: ${dx.palaceName} ${dx.ganZhi}`)
}
const currentDaxianIndex = getDaxianIndex(chart, new Date().getFullYear())

// 流年 — 特定年份的运势
const liunian = calculateLiunian(chart, 2026)
console.log(liunian.natalPalaceAtMing) // 流年命宫所在的本命盘宫位
console.log(liunian.siHua)             // 流年四化
```

### 西方占星（Natal Chart）

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
  // 'Sun: Pisces 21.5°'
}

// ASC / MC（出生时间不详时 angles 为 null）
if (chart.angles) {
  console.log(`ASC: ${chart.angles.asc.sign}`)
  console.log(`MC: ${chart.angles.mc.sign}`)
}

// 宫位（默认：Placidus）
for (const house of chart.houses) {
  console.log(`House ${house.number}: ${house.sign} ${house.degreeInSign.toFixed(1)}°`)
}

// 相位
for (const aspect of chart.aspects) {
  console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}°)`)
}

// 更改宫位制（Koch）
const kochChart = await calculateNatal(input, 'K')
```

### 底层 API

也可以直接使用各个函数：

```typescript
import { getFourPillars, getDaewoon, getRelation } from '@orrery/core/pillars'
import { STEM_INFO, ELEMENT_HANJA } from '@orrery/core/constants'

// 仅计算四柱
const [yearPillar, monthPillar, dayPillar, hourPillar] = getFourPillars(1993, 3, 12, 9, 45)
console.log(yearPillar, monthPillar, dayPillar, hourPillar) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神关系
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// 天干五行信息
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### 城市数据

提供韩国及世界主要城市数据，可用于输入出生地点：

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', region: '서울특별시', lat: 37.5665, lon: 126.978 }

// 支持韩文初声检索
const results = filterCities('ㅂㅅ')  // 匹配 '부산'（釜山）
console.log(formatCityName(results[0])) // '부산'
```

## 计算规则

输入日期必须是公元 1–9999 年之间的有效公历日期。出生星盘只在星历覆盖的公元 1–3000 年（UT）内计算，超出范围时 `calculateNatal()` 会抛出 `RangeError`。凯龙星（Chiron）仅在其轨道足够确定的 1900–2099 年（UT）期间包含在结果中，超出此范围时不含凯龙星。

### 四柱八字

年柱、月柱的判定以及大运起运，均使用 `lunar-javascript` 计算的天文节气交接时刻（换算为 UTC）。韩国出生（`timezone` 为 `Asia/Seoul` 或省略）时，先将夏令时等韩国标准时间的历史偏差统一为 KST 钟表时间，再按韩国八字惯例把时柱边界推迟 30 分钟（子时为 23:30~01:30）。海外出生使用经过经度和均时差校正的真太阳时，不再加 30 分钟修正。

### 紫微斗数

以农历新年为年份分界，以午夜（00:00）为日期分界。闰月整月按其所闰的农历月处理，不采用将闰月分为前后两半的流派规则。流月命宫依据反映生月、生时的斗君确定，大限年龄采用以农历出生年为 1 岁的虚岁。计算结果已与设置为 `dayDivide: 'current'`、`yearDivide: 'normal'`、`fixLeap: false` 的 [iztro](https://github.com/SylarLong/iztro) 进行对照验证。

### 出生星盘

福点（Fortuna）的日夜盘判定不依据宫位编号，而依据太阳中心的几何高度（不计大气折射）。因此，对于宫位边界与地平线不一致的 Whole Sign、Morinus，以及极地地区，同样采用这一地平线标准。在无法计算 Placidus、Koch 的极地地区，会改用 Porphyrius，实际采用的宫位制记录在 `chart.houseSystem` 中。

## 运行示例

克隆仓库后可以直接运行示例脚本（输出为韩文）：

```bash
git clone https://github.com/rath/orrery.git
cd orrery
bun install

# 四柱八字
bun packages/core/examples/saju.ts

# 紫微斗数
bun packages/core/examples/ziwei.ts

# 西方占星出生星盘
bun packages/core/examples/natal.ts
```

## Subpath Exports

可以按需选择性导入模块：

| 路径 | 说明 |
|------|------|
| `@orrery/core` | 汇总导出主要 API（不含 `validation`） |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`、`HOUSE_SYSTEMS`、星座/行星符号、格式化函数 |
| `@orrery/core/timezone` | `resolveLocalDateTimeToUtc()`、`getBirthTimezone()` 等时区/夏令时工具 |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` 等底层 API |
| `@orrery/core/types` | 所有 TypeScript 类型/接口 |
| `@orrery/core/constants` | 天干/地支、十神、宫位名等常量表 |
| `@orrery/core/cities` | 城市数据、搜索函数 |
| `@orrery/core/validation` | `assertBirthInput()` 等输入校验 |

## 依赖

| 包名 | 类型 | 用途 |
|------|------|------|
| `lunar-javascript` | dependency | 农历转换（紫微斗数）、节气交接时刻（四柱八字） |

所有功能均以纯 TypeScript 运行，无需外部 WASM 或数据文件。

## 许可证

[MIT](https://github.com/rath/orrery/blob/main/LICENSE)

只要保留版权声明和许可证文本，即可自由使用、修改和分发本软件，包括商业用途。

`@orrery/core` 0.5.0 及更早版本包含从 Swiss Ephemeris 移植的星历代码，仍适用 AGPL-3.0。此后的版本已将星历替换为独立实现，并以 MIT 发布。
