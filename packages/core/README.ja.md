[한국어](https://github.com/rath/orrery/blob/main/packages/core/README.md) | [English](https://github.com/rath/orrery/blob/main/packages/core/README.en.md) | [中文](https://github.com/rath/orrery/blob/main/packages/core/README.zh.md) | **日本語**

# @orrery/core

ブラウザとNode.jsで動作する、東洋・西洋占術の計算エンジンです。

- **四柱八字** — 六十干支、十神、十二運星、神殺・十二神殺、空亡、大運、干支関係分析
- **紫微斗数** — 命盤生成、大限、流年/流月分析
- **西洋占星術の出生チャート（Natal Chart）** — 惑星位置、ハウス、アングル、アスペクト、パート・オブ・フォーチュン（純粋なTypeScript）

バックエンドは不要で、すべての計算をクライアント上で行います。

**[ライブデモ →](https://sky.told.me/)**

## クレジット

- **四柱万年暦** — 고영창（Ko Young-chang）氏のPerl製[真万年暦](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)を김정균（Kim Jeong-gyun）氏が[PHPに移植](https://github.com/OOPS-ORG-PHP/Lunar)。2018年11月に황장호（Hwang Jang-ho）がJavaとPythonに移植して使い続け、2026年2月にClaude Code（Opus 4.6）でTypeScriptに移植。2026年10月からは節入り時刻にlunar-javascriptの天文計算を使用
- **紫微斗数命盤** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript)ライブラリをベースに、Claude（Opus 4.5）が中国語文献を調べながら実装
- **占星術の出生チャート** — [Swiss Ephemeris](https://www.astro.com/swisseph/)のMoshier天体暦を純粋なTypeScriptに移植

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
  console.log(p.stemSipsin)       // 天干の十神
  console.log(p.branchSipsin)     // 地支の十神
  console.log(p.unseong)          // 十二運星
}

// 大運
for (const dw of result.daewoon) {
  const startYear = dw.startDate.getUTCFullYear()
  console.log(`${dw.ganzi} (${dw.age}歳〜、${startYear}年開始)`)
}

// 干支関係（合、冲、刑、破、害）
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 出生時刻不明とタイムゾーン

- `unknownTime: true` の場合、`hour` と `minute` は無視され、正午（12:00）を基準に計算するため、大運の開始時期に数か月の誤差が生じることがあります。`result.pillars[0]` の干支・天干・地支はそれぞれ `'??'`・`'?'`・`'?'` となり、時柱は干支関係・神殺・空亡・坐法・トランジット分析から除外されます。`calculateNatal()` はハウス・アングル・パート・オブ・フォーチュンを計算しません（`houses` は空配列、`angles` は `null`）。
- `timezone` を省略すると `Asia/Seoul` として扱います。韓国以外の出生地では IANA タイムゾーン ID と `longitude` を必ず指定し、西洋占星術のハウス計算では `latitude` も指定してください。紫微斗数の `createChart()` は `BirthInput` ではなく個別の引数を受け取るため、7・8番目の引数に `timezone` と `longitude` を渡します。
- 大運の `startDate` は、命理計算に用いた現地の日付を UTC フィールドに保持しているため、実行環境のタイムゾーンに左右されません。年月日の取得には `getUTCFullYear()`・`getUTCMonth()`・`getUTCDate()` を使用してください。

### 紫微斗数

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// 命盤を生成（新暦の年・月・日・時・分、男性かどうか）
// 海外出生：createChart(1993, 3, 12, 9, 45, true, 'America/New_York', -74.006)
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
  console.log(`${dx.ageStart}〜${dx.ageEnd}歳: ${dx.palaceName} ${dx.ganZhi}`)
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
  // 'Sun: Pisces 21.5°'
}

// ASC / MC（出生時刻が不明な場合、anglesはnull）
if (chart.angles) {
  console.log(`ASC: ${chart.angles.asc.sign}`)
  console.log(`MC: ${chart.angles.mc.sign}`)
}

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
const [yearPillar, monthPillar, dayPillar, hourPillar] = getFourPillars(1993, 3, 12, 9, 45)
console.log(yearPillar, monthPillar, dayPillar, hourPillar) // '癸酉', '乙卯', '壬辰', '乙巳'

// 十神関係
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// 天干の五行情報
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### 都市データ

出生地の入力に使える、韓国と世界の主要都市データを提供しています：

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', region: '서울특별시', lat: 37.5665, lon: 126.978 }

// ハングルの初声検索に対応
const results = filterCities('ㅂㅅ')  // '부산'（釜山）にマッチ
console.log(formatCityName(results[0])) // '부산'
```

## 計算の基準

入力日付は西暦1〜9999年の有効なグレゴリオ暦の日付である必要があります。出生チャートはMoshier天体暦が収録する3003-04-29（TT）までしか計算できず、それ以降は `calculateNatal()` が `RangeError` を投げます。キロンは事前計算表がある1900-01-01〜2099-12-23（UT）の間だけ結果に含まれ、範囲外ではキロンなしで計算します。

### 四柱八字

年柱・月柱の判定と大運の起算には、`lunar-javascript` が計算した天文学的な節入り時刻をUTCに変換して使用します。韓国での出生（`timezone` が `Asia/Seoul` または省略）では、サマータイムなど韓国標準時の歴史的なずれをKSTの時計時刻に正規化したうえで、韓国の四柱の慣例に従い時柱の境界を30分遅らせて（子時は23:30〜01:30）計算します。海外での出生は経度と均時差で補正した真太陽時を使用し、30分の補正は適用しません。

### 紫微斗数

旧正月を年の境界、午前0時を日付の境界とします。閏月はその月全体を元の旧暦月として扱い、閏月を前半・後半に分ける流派の規則は適用しません。流月の命宮は生月・生時を反映した斗君によって定め、大限の年齢は旧暦の出生年を1歳とする数え年です。結果は `dayDivide: 'current'`、`yearDivide: 'normal'`、`fixLeap: false` に設定した [iztro](https://github.com/SylarLong/iztro) の値と照合して検証しています。

### 出生チャート

パート・オブ・フォーチュン（Fortuna）の昼夜判定には、ハウス番号ではなく太陽中心の幾何学的な高度（大気差は考慮しない）を用います。そのため、ハウスの境界が地平線と一致しないWhole Sign・Morinusや極地でも、同じ地平線基準が適用されます。PlacidusやKochを計算できない極地ではPorphyriusで代替し、実際に適用された方式は `chart.houseSystem` に格納されます。

## サンプルの実行

リポジトリをクローンすると、すぐに実行できるサンプルスクリプトがあります（出力は韓国語）：

```bash
git clone https://github.com/rath/orrery.git
cd orrery
bun install

# 四柱八字
bun packages/core/examples/saju.ts

# 紫微斗数
bun packages/core/examples/ziwei.ts

# 西洋占星術の出生チャート
bun packages/core/examples/natal.ts
```

## Subpath Exports

必要なモジュールだけを選んでインポートできます：

| パス | 説明 |
|------|------|
| `@orrery/core` | 主要APIの一括export（`validation` を除く） |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`、`HOUSE_SYSTEMS`、星座/惑星シンボル、フォーマット関数 |
| `@orrery/core/timezone` | `resolveLocalDateTimeToUtc()`、`getBirthTimezone()` などのタイムゾーン・夏時間ユーティリティ |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` などの低レベルAPI |
| `@orrery/core/types` | すべてのTypeScript型/インターフェース |
| `@orrery/core/constants` | 天干/地支、十神、宮位名などの定数テーブル |
| `@orrery/core/cities` | 都市データ、検索関数 |
| `@orrery/core/validation` | `assertBirthInput()` などの入力検証 |

## 依存関係

| パッケージ | タイプ | 用途 |
|------------|--------|------|
| `lunar-javascript` | dependency | 旧暦変換（紫微斗数）、節入り時刻（四柱八字） |

外部のWASMやデータファイルに依存せず、すべての機能が純粋なTypeScriptで動作します。

## ライセンス

[AGPL-3.0](https://github.com/rath/orrery/blob/main/LICENSE)

<details>
<summary>AGPL-3.0とは？（わかりやすい説明）</summary>

### 自由にできること

- **個人的に使用** — 自分のコンピュータで自由に実行・修正できます。
- **ソースコードを読んで学ぶ** — コードを見て学ぶことはいつでも歓迎です。
- **修正・改善して再配布** — コードを修正して再配布できます。ただし、以下の条件を守る必要があります。

### 必ず守ること

- **同じライセンス（AGPL-3.0）を維持** — このコードを修正したもの、またはこのコードを含むものを配布する場合、その成果物も必ずAGPL-3.0で公開しなければなりません。
- **ソースコードの公開義務** — 通常のGPLと異なり、AGPLは**Webサービスとして提供する場合にも**ソースコードを公開する必要があります。例えば、このコードを修正してWebサイトとして運営する場合、サイトの利用者が修正後のソースコードを入手できる手段を提供しなければなりません。
- **変更内容の明示** — 元のコードから何を変更したかが分かるように表示する必要があります。
- **著作権表示の維持** — 元の著作権表示とライセンス文言を削除してはいけません。

### できないこと

- **ソース非公開でサービス運営** — このコードを修正してWebサービスを運営しながらソースを公開しないことはライセンス違反です。
- **ライセンスの変更** — AGPLコードをMIT、Apacheなどのより寛容なライセンスに変更して配布することはできません。

### 一言まとめ

> 自由に使えますが、修正版を配布したりサービスとして提供したりする場合は、ソースコードをAGPL-3.0で公開してください。

</details>
