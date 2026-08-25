[한국어](./README.md) | [English](./README.en.md) | [中文](./README.zh.md) | **日本語**

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

ブラウザベースの命理学ツール。四柱八字、紫微斗數、西洋占星術の出生チャート（Natal Chart）をバックエンド不要でクライアント上で計算します。

**[ライブデモ →](https://sky.told.me/)**

## クレジット

- **四柱万年暦** — 고영창（Ko Young-chang）氏のPerl [真万年暦](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)を김정균（Kim Jeong-gyun）氏が[PHPに移植](https://github.com/OOPS-ORG-PHP/Lunar)したものを、2018年11月に황장호（Hwang Jang-ho）がJavaとPythonに移植して使用、2026年2月にClaude Code（Opus 4.6）でTypeScriptに移植
- **紫微斗數命盤** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript)ライブラリをベースに、Claude（Opus 4.5）が中国語文献を調査しながら実装
- **占星術出生チャート** — [Swiss Ephemeris](https://www.astro.com/swisseph/)のMoshier理論を純粋なTypeScriptに移植

## 機能

### 四柱八字
- 六十干支に基づく四柱計算（時柱、日柱、月柱、年柱）
- 十神、十二運星、地蔵干
- 合冲刑破害の関係分析（三合、半合、方合を含む）
- 神殺（羊刃殺、白虎殺、魁罡殺）
- 夜子時/早子時（子時法）対応
- 大運10個（順行/逆行判断）
- 日運/月運トランジット（合/冲/刑検出）

### 紫微斗數
- 旧暦自動変換
- 命宮/身宮計算
- 十四主星配置（紫微系 + 天府系）
- 補星/殺星配置
- 四化（化祿/化權/化科/化忌）
- 星曜輝度（廟/旺/得/利/平/陷）
- 伝統的な4×4命盤グリッドレイアウト
- 大限12個
- 流年運勢（流年命宮、流年四化、12流月）

### 出生チャート（Natal Chart）
- Swiss Ephemeris Moshier理論に基づく惑星位置計算（純粋TypeScript）
- 10惑星 + キロン + 南/北交点の位置（星座、度数、逆行）
- ハウスシステム選択（デフォルトPlacidus、10種対応）
- ASC / MC / DESC / IC アングル
- 5大メジャーアスペクト（コンジャンクション、セクスタイル、スクエア、トライン、オポジション）
- 出生地入力（緯度/経度、デフォルト：ソウル）

### 共通
- AIエージェント向けテキストコピー（四柱八字 + 紫微斗數 + 出生チャート一括コピー）
- 使い方ガイドと用語説明
- 出生時刻不明モード（三柱計算）
- モバイルレスポンシブ

## 使い方

```bash
# 依存関係のインストール
bun install

# 開発サーバー
bun dev

# ビルド
bun run build

# テスト
bun test
```

## 技術スタック

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript（旧暦変換）
- Vitest（テスト）

## `@orrery/core` クイックスタート

計算エンジンをnpmパッケージとして利用できます。→ [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

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

## ライセンス

[AGPL-3.0](LICENSE)

<details>
<summary>AGPL-3.0とは？（わかりやすい説明）</summary>

### 自由にできること

- **個人的に使用** — 自分のコンピュータで自由に実行・修正できます。
- **ソースコードを読んで学ぶ** — コードを見て学ぶことはいつでも歓迎です。
- **修正・改善して再配布** — コードを修正して再配布できます。ただし、以下の条件を守る必要があります。

### 必ず守ること

- **同じライセンス（AGPL-3.0）を維持** — このコードを修正または含めて配布する場合、その成果物も必ずAGPL-3.0で公開しなければなりません。
- **ソースコードの公開義務** — 通常のGPLと異なり、AGPLは**Webサービスとして提供する場合にも**ソースコードを公開する必要があります。例えば、このコードを修正してウェブサイトとして運営する場合、ユーザーの要求に応じて修正されたソースコードを提供しなければなりません。
- **変更内容の明示** — 元のコードから何を変更したかわかるように表示する必要があります。
- **著作権表示の維持** — 元の著作権表示とライセンス文言を削除してはいけません。

### できないこと

- **ソース非公開でサービス運営** — このコードを修正してWebサービスを運営しながらソースを公開しないことはライセンス違反です。
- **ライセンスの変更** — AGPLコードをMIT、Apacheなどのより寛容なライセンスに変更して配布することはできません。

### 一言まとめ

> 自由に使えますが、修正したりサービスとして提供する場合は、ソースコードをAGPL-3.0で公開してください。

</details>
