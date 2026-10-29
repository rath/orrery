[한국어](./README.md) | [English](./README.en.md) | **中文** | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

基于浏览器的命理学工具。无需后端，直接在客户端计算四柱八字、紫微斗数和西方占星出生星盘（Natal Chart）。

**[在线演示 →](https://sky.told.me/)**

## 致谢

- **四柱万年历** — 고영창（Ko Young-chang）用 Perl 编写了[真万年历](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)，김정균（Kim Jeong-gyun）将其[移植到 PHP](https://github.com/OOPS-ORG-PHP/Lunar)；2018年11月，황장호（Hwang Jang-ho）又将其移植到 Java 和 Python 自用，2026年2月借助 Claude Code（Opus 4.6）移植到 TypeScript
- **紫微斗数命盘** — 由 Claude（Opus 4.5）参考中文文献，基于 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 库实现
- **占星出生星盘** — 将 [Swiss Ephemeris](https://www.astro.com/swisseph/) 的 Moshier 星历移植为纯 TypeScript

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
- 基于 Swiss Ephemeris Moshier 星历的行星位置计算（纯 TypeScript）
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

[AGPL-3.0](LICENSE)

<details>
<summary>什么是 AGPL-3.0？（简单说明）</summary>

### 你可以自由地

- **个人使用** — 在自己的电脑上随意运行和修改。
- **阅读和学习源代码** — 随时欢迎通过阅读代码来学习。
- **修改、改进后再分发** — 你可以修改代码后重新分发，但必须遵守以下条件。

### 你必须做到

- **保持相同许可证（AGPL-3.0）** — 分发修改过或包含此代码的作品时，该作品也必须以 AGPL-3.0 公开。
- **公开源代码** — 与普通 GPL 不同，AGPL 要求**即使作为网络服务提供时也必须公开源代码**。例如，如果你修改此代码并用于运营网站，就必须为网站用户提供获取修改后源代码的途径。
- **标明变更内容** — 必须明确标注你对原始代码做了哪些修改。
- **保留版权声明** — 不得删除原始的版权声明和许可证文本。

### 你不可以

- **在不公开源代码的情况下运营服务** — 修改此代码用于运营网络服务却不公开源代码，即违反许可证。
- **更换许可证** — 不能将 AGPL 代码以 MIT、Apache 等更宽松的许可证重新分发。

### 一句话总结

> 可以随意使用，但如果分发修改版本或将其作为服务提供，请以 AGPL-3.0 公开源代码。

</details>
