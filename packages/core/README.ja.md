[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | [English](https://github.com/rath/orrery/blob/main/packages/core/README.en.md) | [中文](https://github.com/rath/orrery/blob/main/packages/core/README.zh.md) | **日本語**

# @orrery/core

ブラウザおよびNode.js環境で動作する東洋・西洋占術計算エンジンです。

- **四柱八字** — 六十干支、十神、十二運星、十二神殺、大運、干支関係分析
- **紫微斗數** — 命盤生成、大限、流年/流月分析
- **西洋占星術出生チャート（Natal Chart）** — 惑星位置、ハウス、アングル、アスペクト（純粋TypeScript）

バックエンド不要。すべての計算がクライアント上で実行されます。

**[ライブデモ →](https://sky.told.me/)**

## クレジット

- **四柱万年暦** — 고영창（Ko Young-chang）氏のPerl [真万年暦](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)を김정균（Kim Jeong-gyun）氏が[PHPに移植](https://github.com/OOPS-ORG-PHP/Lunar)したものを、2018年11月に황장호（Hwang Jang-ho）がJavaとPythonに移植して使用、2026年2月にClaude Code（Opus 4.6）でTypeScriptに移植
- **紫微斗數命盤** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript)ライブラリをベースに、Claude（Opus 4.5）が中国語文献を調査しながら実装
- **占星術出生チャート** — [Swiss Ephemeris](https://www.astro.com/swisseph/)のMoshier理論を純粋なTypeScriptに移植

## インストール

```bash
npm install @orrery/core
```

## 使い方

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

// 四柱（時、日、月、年の順）
for (const p of result.pillars) {
  console.log(p.pillar.ganzi)     // '乙巳', '壬辰', '乙卯', '癸酉'
  console.log(p.stemSipsin)       // 天干十神
  console.log(p.branchSipsin)     // 地支十神
  console.log(p.unseong)          // 十二運星
}

// 大運
for (const dw of result.daewoon) {
  const startYear = dw.startDate.getUTCFullYear()
  console.log(`${dw.ganzi} (${dw.age}歳〜、${startYear}年開始)`)
}

// 干支関係（合、沖、刑、破、害）
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 出生時刻不明とタイムゾーン

- `unknownTime: true` の場合、`hour` と `minute` は無視されます。`result.pillars[0]` の干支・天干・地支はそれぞれ `'??'`・`'?'`・`'?'` となり、時柱は干支関係・神煞・空亡・坐法・トランジット分析から除外されます。
- `timezone` を省略すると `Asia/Seoul` が使用されます。韓国以外の出生地では IANA タイムゾーン ID と `longitude` を必ず指定し、西洋占星術のハウス計算では `latitude` も指定してください。
- 大運の `startDate` は、実行環境のタイムゾーンに依存しない命理上の壁時計日付を UTC フィールドに保存します。年月日の取得には `getUTCFullYear()`・`getUTCMonth()`・`getUTCDate()` を使用してください。

### 紫微斗數

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// 命盤を生成
const chart = createChart(1993, 3, 12, 9, 45, true)

console.log(chart.mingGongZhi)     // 命宮の地支
console.log(chart.shenGongZhi)     // 身宮の地支
console.log(chart.wuXingJu.name)   // 五行局（例：'水二局'）

// 各宮位の星曜を確認
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

// 流年 — 特定の年の運勢
const liunian = calculateLiunian(chart, 2026)
console.log(liunian.natalPalaceAtMing) // 流年命宮が位置する本命盤の宮位
console.log(liunian.siHua)             // 流年四化
```

### 西洋占星術（Natal Chart）

```typescript
import { calculateNatal } from '@orrery/core/natal'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
  latitude: 37.5665,   // ソウル（任意、デフォルト：ソウル）
  longitude: 126.9780,
}

const chart = await calculateNatal(input)

// 惑星位置
for (const planet of chart.planets) {
  console.log(`${planet.id}: ${planet.sign} ${planet.degreeInSign.toFixed(1)}°`)
  // 'Sun: Pisces 21.6°'
}

// ASC / MC
console.log(`ASC: ${chart.angles.asc.sign}`)
console.log(`MC: ${chart.angles.mc.sign}`)

// ハウス（デフォルト：Placidus）
for (const house of chart.houses) {
  console.log(`House ${house.number}: ${house.sign} ${house.degreeInSign.toFixed(1)}°`)
}

// アスペクト
for (const aspect of chart.aspects) {
  console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}°)`)
}

// ハウスシステムの変更（Koch）
const kochChart = await calculateNatal(input, 'K')
```

### 低レベルAPI

個別の関数を直接使用することもできます：

```typescript
import { getFourPillars, getDaewoon, getRelation } from '@orrery/core/pillars'
import { STEM_INFO, ELEMENT_HANJA } from '@orrery/core/constants'

// 四柱のみ計算
const [년주, 월주, 일주, 시주] = getFourPillars(1993, 3, 12, 9, 45)
console.log(년주, 월주, 일주, 시주) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神関係
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// 天干五行情報
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### 都市データ

出生地入力に活用できる韓国・世界の主要都市データを提供しています：

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', lat: 37.5665, lon: 126.9780 }

// 韓国語の初声検索対応
const results = filterCities('ㅂㅅ')  // '부산'にマッチ
console.log(formatCityName(results[0])) // '부산'
```

## サンプルの実行

リポジトリをクローンした後、すぐに実行できるサンプルスクリプトがあります：

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

必要なモジュールのみを選択的にインポートできます：

| パス | 説明 |
|------|------|
| `@orrery/core` | 全体のbarrel export |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`、星座/惑星シンボル、フォーマット関数 |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` 等の低レベルAPI |
| `@orrery/core/types` | すべてのTypeScript型/インターフェース |
| `@orrery/core/constants` | 天干/地支、十神、宮位名などの定数テーブル |
| `@orrery/core/cities` | 都市データ、検索関数 |

## 依存関係

| パッケージ | タイプ | 用途 |
|------------|--------|------|
| `lunar-javascript` | dependency | 旧暦変換（紫微斗數） |

外部のWASMやデータファイルへの依存なく、すべての機能が純粋なTypeScriptで動作します。

## ライセンス

[AGPL-3.0](../../LICENSE)

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
