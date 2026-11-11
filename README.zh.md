[한국어](./README.md) | [English](./README.en.md) | **中文** | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

基于浏览器的命理学工具。无需后端，直接在客户端计算四柱八字、紫微斗数和西方占星出生星盘（Natal Chart）。

**[在线演示 →](https://sky.told.me/)**

## 致谢

- **四柱万年历** — 고영창（Ko Young-chang）用 Perl 编写了[真万年历](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)，김정균（Kim Jeong-gyun）将其[移植到 PHP](https://github.com/OOPS-ORG-PHP/Lunar)；2018年11月，황장호（Hwang Jang-ho）又将其移植到 Java 和 Python 自用，2026年2月借助 Claude Code（Opus 4.6）移植到 TypeScript；自2026年10月起，节气交接时刻改用 lunar-javascript 的天文计算
- **紫微斗数命盘** — 由 Claude（Opus 4.5）参考中文文献，基于 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 库实现
- **占星出生星盘** — 仅依据公开发表的天文理论与公共数据独立实现的纯 TypeScript 星历。水星至火星采用 [VSOP87](https://ftp.imcce.fr/pub/ephem/planets/vsop87/)，月球采用 [ELP 2000-82B](https://ftp.imcce.fr/pub/ephem/moon/elp82b/) 理论，木星至冥王星和凯龙星则从 [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)（DE441）的状态向量出发做数值积分，结果均与 JPL Horizons 对照验证

## 功能

### 四柱八字
- 基于六十甲子的四柱计算（时柱、日柱、月柱、年柱）
- 十神、十二长生、藏干
- 十二神煞、空亡
- 神煞：吉神（天乙贵人、天德贵人、月德贵人、文昌贵人、金舆禄）与凶煞（羊刃煞、桃花煞、白虎煞、魁罡煞、红艳煞）
- 合冲刑破害关系分析（含三合、半合、方合）
- 坐法、引从法
- 子时法选择：统子时（默认）或夜子时
- 10步大运（判断顺行/逆行）
- 日运/月运分析（检测合/冲/刑）

### 紫微斗数
- 公历自动转换为农历
- 命宫/身宫计算
- 十四主星安星（紫微星系 + 天府星系）
- 辅星/煞星安星
- 四化（化禄/化权/化科/化忌）
- 星曜亮度（庙/旺/得/利/平/陷）
- 传统 4×4 命盘网格布局
- 12个大限
- 流年运势（流年命宫、流年四化、12个流月）

### 出生星盘（Natal Chart）
- 基于 VSOP87、ELP 2000-82B 理论和数值积分自行实现的星历计算行星位置（纯 TypeScript，1800–2200 年与 JPL DE441 相差不超过 0.3″）
- 10颗行星、凯龙星、南/北交点及福点的位置（星座、度数、逆行、宫位）
- 支持10种宫位制（默认 Placidus）
- ASC / MC / DESC / IC 四轴
- 5种主要相位（合相、六分相、四分相、三分相、对分相）
- 星盘轮盘图

### 通用功能
- 一键复制全部结果文本，便于交给 AI 解读（四柱八字 + 紫微斗数 + 出生星盘）
- 出生地点：可搜索韩国及世界主要城市（支持韩文初声检索），也可直接输入纬度/经度（默认：首尔）；根据坐标自动推断时区
- 自动处理韩国标准时间的历史变更（夏令时、UTC+8:30 时期等）
- 出生时间不详模式（八字只排三柱，不排紫微斗数，出生星盘不含宫位和四轴）
- 档案保存（保存在浏览器中，支持 JSON 导入/导出）
- 6种界面语言（韩语、英语、中文、日语、德语、西班牙语）
- 浅色/深色主题（可跟随系统设置）
- 使用指南与术语说明
- 移动端自适应

## 使用方法

```bash
# 安装依赖
bun install

# 开发服务器
bun dev

# 构建
bun run build

# 代码检查
bun run lint

# 类型检查
bun run typecheck

# 测试
bun run test
```

## 技术栈

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript（农历转换、节气交接时刻）
- @photostructure/tz-lookup（根据坐标推断时区）
- Vitest（测试）

## `@orrery/core` 快速体验

计算引擎可作为 npm 包使用。→ [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'

// 省略 timezone 时按 Asia/Seoul 计算
const input = { year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' as const }

// 四柱八字
const saju = calculateSaju(input)
saju.pillars.forEach(p => console.log(p.pillar.ganzi)) // 乙巳, 壬辰, 乙卯, 癸酉（时、日、月、年顺序）

// 紫微斗数命盘（最后一个参数：是否为男性）
const ziwei = createChart(1993, 3, 12, 9, 45, true)
console.log(ziwei.mingGongZhi)   // 命宫地支（戌）
console.log(ziwei.wuXingJu.name) // 五行局（水二局）

// 西方占星出生星盘
const natal = await calculateNatal(input)
natal.planets.forEach(p => console.log(`${p.id}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`))
console.log(`ASC: ${natal.angles?.asc.sign}`) // 出生时间不详时 angles 为 null
```

## 许可证

[MIT](LICENSE)

只要保留版权声明和许可证文本，即可自由使用、修改和分发本软件，包括商业用途。

`@orrery/core` 0.5.0 及更早版本包含从 Swiss Ephemeris 移植的星历代码，仍适用 AGPL-3.0。此后的版本已将星历替换为独立实现，并以 MIT 发布。
