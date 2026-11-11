[한국어](./README.md) | [English](./README.en.md) | [中文](./README.zh.md) | **日本語**

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

ブラウザベースの命理学ツール。四柱八字（四柱推命）、紫微斗数、西洋占星術の出生チャート（Natal Chart）を、バックエンドを使わずクライアント側だけで計算します。

**[ライブデモ →](https://sky.told.me/)**

## クレジット

- **四柱万年暦** — 고영창（Ko Young-chang）氏のPerl製[真万年暦](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)を김정균（Kim Jeong-gyun）氏が[PHPに移植](https://github.com/OOPS-ORG-PHP/Lunar)。2018年11月に황장호（Hwang Jang-ho）がJavaとPythonに移植して使い続け、2026年2月にClaude Code（Opus 4.6）でTypeScriptに移植。2026年10月からは節入り時刻にlunar-javascriptの天文計算を使用
- **紫微斗数命盤** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript)ライブラリをベースに、Claude（Opus 4.5）が中国語文献を調べながら実装
- **占星術の出生チャート** — 公開された天文理論とデータだけで独自に実装した純粋なTypeScript天体暦。水星〜火星は[VSOP87](https://ftp.imcce.fr/pub/ephem/planets/vsop87/)、月は[ELP 2000-82B](https://ftp.imcce.fr/pub/ephem/moon/elp82b/)の理論で、木星〜冥王星とキロンは[JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)（DE441）の状態ベクトルから出発する数値積分で計算し、結果をJPL Horizonsと照合して検証

## 機能

### 四柱八字
- 六十干支に基づく四柱計算（時柱、日柱、月柱、年柱）
- 十神、十二運星、蔵干
- 十二神殺、空亡
- 神殺：吉神（天乙貴人、天徳貴人、月徳貴人、文昌貴人、金輿禄）と凶殺（羊刃殺、桃花殺、白虎殺、魁罡殺、紅艶殺）
- 合冲刑破害の関係分析（三合、半合、方合を含む）
- 坐法、引従法
- 子時法の選択：統子時（デフォルト）または夜子時
- 大運10期（順行・逆行を判定）
- 日運・月運のトランジット（合・冲・刑を検出）

### 紫微斗数
- 旧暦への自動変換
- 命宮・身宮の算出
- 十四主星の配置（紫微系 + 天府系）
- 補星・殺星の配置
- 四化（化禄・化権・化科・化忌）
- 星曜の輝度（廟・旺・得・利・平・陥）
- 伝統的な4×4命盤グリッドレイアウト
- 大限12期
- 流年運勢（流年命宮、流年四化、12の流月）

### 出生チャート（Natal Chart）
- VSOP87・ELP 2000-82B理論と数値積分で実装した独自天体暦による惑星位置計算（純粋なTypeScript、1800〜2200年はJPL DE441との差0.3″以内）
- 10天体・キロン・南北の交点・パート・オブ・フォーチュンの位置（星座、度数、逆行、ハウス）
- 10種類のハウスシステム（デフォルトはPlacidus）
- ASC / MC / DESC / IC アングル
- 5つのメジャーアスペクト（コンジャンクション、セクスタイル、スクエア、トライン、オポジション）
- 出生チャートのホイール表示

### 共通
- AI鑑定用に全結果をテキストで一括コピー（四柱八字 + 紫微斗数 + 出生チャート）
- 出生地：韓国・世界の主要都市を検索（ハングルの初声検索に対応）するか、緯度・経度を直接入力（デフォルトはソウル）。座標からタイムゾーンを自動推定
- サマータイムやUTC+8:30時代など、韓国標準時の変更履歴を自動反映
- 出生時刻不明モード（四柱八字は三柱のみ計算、紫微斗数は省略、出生チャートはハウス・アングルなし）
- プロフィール保存（ブラウザに保存、JSONでインポート/エクスポート）
- 6言語のUI（韓国語、英語、中国語、日本語、ドイツ語、スペイン語）
- ライト/ダークテーマ（システム設定に連動）
- 使い方ガイドと用語説明
- モバイル対応のレスポンシブデザイン

## 使い方

```bash
# 依存関係のインストール
bun install

# 開発サーバー
bun dev

# ビルド
bun run build

# リント
bun run lint

# 型チェック
bun run typecheck

# テスト
bun run test
```

## 技術スタック

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript（旧暦変換、節入り時刻）
- @photostructure/tz-lookup（座標からタイムゾーンを推定）
- Vitest（テスト）

## `@orrery/core` クイックスタート

計算エンジンをnpmパッケージとして利用できます。→ [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'

// timezoneを省略するとAsia/Seoul基準で計算
const input = { year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' as const }

// 四柱八字
const saju = calculateSaju(input)
saju.pillars.forEach(p => console.log(p.pillar.ganzi)) // 乙巳, 壬辰, 乙卯, 癸酉（時・日・月・年の順）

// 紫微斗数の命盤（最後の引数：男性かどうか）
const ziwei = createChart(1993, 3, 12, 9, 45, true)
console.log(ziwei.mingGongZhi)   // 命宮の地支（戌）
console.log(ziwei.wuXingJu.name) // 五行局（水二局）

// 西洋占星術の出生チャート
const natal = await calculateNatal(input)
natal.planets.forEach(p => console.log(`${p.id}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`))
console.log(`ASC: ${natal.angles?.asc.sign}`) // 出生時刻が不明な場合、anglesはnull
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
