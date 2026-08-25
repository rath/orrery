[한국어](./README.md) | [English](./README.en.md) | **中文** | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

基于浏览器的命理学工具。无需后端，在客户端直接计算四柱八字、紫微斗數以及西方占星术出生星盘（Natal Chart）。

**[在线演示 →](https://sky.told.me/)**

## 致谢

- **四柱万年历** — 由고영창（Ko Young-chang）编写的 Perl [真万年历](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)，经김정균（Kim Jeong-gyun）[移植为 PHP](https://github.com/OOPS-ORG-PHP/Lunar)，2018年11月황장호（Hwang Jang-ho）将其移植为 Java 和 Python 并一直使用，2026年2月使用 Claude Code（Opus 4.6）移植为 TypeScript
- **紫微斗數命盤** — 基于 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 库，由 Claude（Opus 4.5）研究中文文献后实现
- **占星术出生星盘** — 将 [Swiss Ephemeris](https://www.astro.com/swisseph/) 的 Moshier 星历表移植为纯 TypeScript

## 功能

### 四柱八字
- 基于六十甲子的四柱计算（时柱、日柱、月柱、年柱）
- 十神、十二运星、地藏干
- 合冲刑破害关系分析（含三合、半合、方合）
- 神煞（羊刃煞、白虎煞、魁罡煞）
- 夜子时/早子时（子時法）支持
- 10步大運（顺行/逆行判断）
- 日运/月运过境分析（合/冲/刑检测）

### 紫微斗數
- 自动阴历转换
- 命宮/身宮计算
- 十四主星排盘（紫微系 + 天府系）
- 辅星/煞星排盘
- 四化（化祿/化權/化科/化忌）
- 星曜亮度（廟/旺/得/利/平/陷）
- 传统 4×4 命盤网格布局
- 12步大限
- 流年运势（流年命宫、流年四化、12流月）

### 出生星盘（Natal Chart）
- 基于 Swiss Ephemeris Moshier 理论的行星位置计算（纯 TypeScript）
- 10颗行星 + 凯龙星 + 南/北交点位置（星座、度数、逆行）
- 宫位系统选择（默认 Placidus，支持10种）
- ASC / MC / DESC / IC 四轴
- 5大主要相位（合相、六合、四分、三合、对冲）
- 出生地点输入（纬度/经度，默认：首尔）

### 通用功能
- 面向 AI 代理的文本复制（四柱八字 + 紫微斗數 + 出生星盘一键复制）
- 使用指南与术语说明
- 出生时间未知模式（三柱计算）
- 移动端自适应

## 使用方法

```bash
# 安装依赖
bun install

# 开发服务器
bun dev

# 构建
bun run build

# 测试
bun test
```

## 技术栈

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript（阴历转换）
- Vitest（测试）

## `@orrery/core` 快速体验

计算引擎可作为 npm 包使用。→ [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

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

## 许可证

[AGPL-3.0](LICENSE)

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
