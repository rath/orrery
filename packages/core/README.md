# @orrery/core

브라우저/Node.js 환경에서 동작하는 동양·서양 점술 계산 엔진입니다.

- **사주팔자(四柱八字)** — 60갑자, 십신, 12운성, 12신살, 대운, 간지 관계 분석
- **자미두수(紫微斗數)** — 명반(命盤) 생성, 대한(大限), 유년(流年)/유월(流月) 분석
- **서양 점성술 출생차트(Natal Chart)** — 행성 위치, 하우스, 앵글, 애스펙트 (Swiss Ephemeris WASM)

백엔드 불필요. 모든 계산이 클라이언트에서 수행됩니다.

**[라이브 데모 →](https://rath.github.io/orrery/)**

## 크레딧

- **사주 만세력** — 고영창님의 Perl [진짜만세력](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)을 김정균님이 [PHP로 포팅](https://github.com/OOPS-ORG-PHP/Lunar)한 것을, 2018년 11월 황장호가 Java와 Python으로 포팅하여 사용해오다가, 2026년 2월 Claude Code (Opus 4.6)로 TypeScript로 포팅
- **자미두수 명반** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 라이브러리 기반으로 Claude (Opus 4.5)가 중국어 문헌을 리서치하며 구현
- **점성술 출생차트** — [Swiss Ephemeris](https://github.com/arturania/swisseph)를 WASM으로 빌드한 [swisseph-wasm](https://www.npmjs.com/package/swisseph-wasm) 기반

## 설치

```bash
npm install @orrery/core
```

서양 점성술(natal) 기능을 사용하려면 `swisseph-wasm`도 설치하세요:

```bash
npm install swisseph-wasm
```

> `swisseph-wasm`은 optional peer dependency입니다. 사주/자미두수만 사용한다면 설치하지 않아도 됩니다.

## 사용법

### 사주팔자 (四柱八字)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
}

const result = calculateSaju(input)

// 사주 4주 (시, 일, 월, 년 순서)
for (const p of result.pillars) {
  console.log(p.pillar.ganzi)     // '乙巳', '壬辰', '乙卯', '癸酉'
  console.log(p.stemSipsin)       // 천간 십신
  console.log(p.branchSipsin)     // 지지 십신
  console.log(p.unseong)          // 12운성
}

// 대운
for (const dw of result.daewoon) {
  console.log(`${dw.ganzi} (${dw.age}세~)`)
}

// 간지 관계 (합, 충, 형, 파, 해)
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 자미두수 (紫微斗數)

```typescript
import { createChart, calculateLiunian, getDaxianList } from '@orrery/core/ziwei'

// 명반 생성
const chart = createChart(1993, 3, 12, 9, 45, true)

console.log(chart.mingGongZhi)     // 명궁 지지
console.log(chart.shenGongZhi)     // 신궁 지지
console.log(chart.wuXingJu.name)   // 오행국 (예: '水二局')

// 각 궁위의 성요 확인
for (const [name, palace] of Object.entries(chart.palaces)) {
  const stars = palace.stars.map(s => {
    const sihua = s.siHua ? `(${s.siHua})` : ''
    return `${s.name}${s.brightness}${sihua}`
  })
  console.log(`${name} [${palace.ganZhi}]: ${stars.join(', ')}`)
}

// 대한 (大限)
const daxianList = getDaxianList(chart)
for (const dx of daxianList) {
  console.log(`${dx.ageStart}~${dx.ageEnd}세: ${dx.palaceName} ${dx.ganZhi}`)
}

// 유년 (流年) — 특정 연도의 운세
const liunian = calculateLiunian(chart, 2026)
console.log(liunian.natalPalaceAtMing) // 유년 명궁이 위치한 본명반 궁위
console.log(liunian.siHua)             // 유년 사화
```

### 서양 점성술 (Natal Chart)

```typescript
import { calculateNatal } from '@orrery/core/natal'
import type { BirthInput } from '@orrery/core/types'

const input: BirthInput = {
  year: 1993, month: 3, day: 12,
  hour: 9, minute: 45,
  gender: 'M',
  latitude: 37.5665,   // 서울 (선택사항, 기본값: 서울)
  longitude: 126.9780,
}

const chart = await calculateNatal(input)

// 행성 위치
for (const planet of chart.planets) {
  console.log(`${planet.id}: ${planet.sign} ${planet.degreeInSign.toFixed(1)}°`)
  // 'Sun: Pisces 21.6°'
}

// ASC / MC
console.log(`ASC: ${chart.angles.asc.sign}`)
console.log(`MC: ${chart.angles.mc.sign}`)

// 하우스 (기본: Placidus)
for (const house of chart.houses) {
  console.log(`House ${house.number}: ${house.sign} ${house.degreeInSign.toFixed(1)}°`)
}

// 애스펙트
for (const aspect of chart.aspects) {
  console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (orb: ${aspect.orb.toFixed(1)}°)`)
}

// 하우스 시스템 변경 (Koch)
const kochChart = await calculateNatal(input, 'K')
```

### 저수준 API

개별 함수를 직접 사용할 수도 있습니다:

```typescript
import { getFourPillars, getDaewoon, getRelation } from '@orrery/core/pillars'
import { STEM_INFO, ELEMENT_HANJA } from '@orrery/core/constants'

// 사주 4주만 계산
const [년주, 월주, 일주, 시주] = getFourPillars(1993, 3, 12, 9, 45)
console.log(년주, 월주, 일주, 시주) // '癸酉', '乙卯', '壬辰', '乙巳'

// 십신 관계
const relation = getRelation('壬', '乙')
console.log(relation?.hanja) // '傷官'

// 천간 오행 정보
console.log(STEM_INFO['壬']) // { yinyang: '+', element: 'water' }
console.log(ELEMENT_HANJA['water']) // '水'
```

### 도시 데이터

출생 위치 입력에 활용할 수 있는 한국/세계 주요 도시 데이터를 제공합니다:

```typescript
import { SEOUL, filterCities, formatCityName } from '@orrery/core/cities'

console.log(SEOUL) // { name: '서울', lat: 37.5665, lon: 126.9780 }

// 한글 초성 검색 지원
const results = filterCities('ㅂㅅ')  // '부산' 매칭
console.log(formatCityName(results[0])) // '부산'
```

## 예제 실행

저장소를 클론한 후 바로 실행해볼 수 있는 예제 스크립트가 있습니다:

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

필요한 모듈만 선택적으로 import할 수 있습니다:

| 경로 | 설명 |
|------|------|
| `@orrery/core` | 전체 barrel export |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`, 별자리/행성 심볼, 포맷 함수 |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` 등 저수준 API |
| `@orrery/core/types` | 모든 TypeScript 타입/인터페이스 |
| `@orrery/core/constants` | 천간/지지, 십신, 궁위명 등 상수 테이블 |
| `@orrery/core/cities` | 도시 데이터, 검색 함수 |

## 의존성

| 패키지 | 유형 | 용도 |
|--------|------|------|
| `lunar-javascript` | dependency | 음력 변환 (자미두수) |
| `swisseph-wasm` | optional peer | Swiss Ephemeris WASM (서양 점성술) |

`swisseph-wasm`을 설치하지 않으면 사주/자미두수만 사용 가능합니다.

## 라이선스

[AGPL-3.0](../../LICENSE)

<details>
<summary>AGPL-3.0이 뭔가요? (쉬운 설명)</summary>

### 자유롭게 할 수 있는 것

- **개인적으로 사용** — 본인 컴퓨터에서 마음대로 실행하고 수정해도 됩니다.
- **소스 코드를 읽고 공부** — 코드를 보고 배우는 건 언제든 환영합니다.
- **수정·개선 후 재배포** — 코드를 고쳐서 다시 배포할 수 있습니다. 단, 아래 조건을 지켜야 합니다.

### 반드시 지켜야 하는 것

- **같은 라이선스(AGPL-3.0) 유지** — 이 코드를 수정하거나 포함해서 배포할 때, 그 결과물도 반드시 AGPL-3.0으로 공개해야 합니다.
- **소스 코드 공개 의무** — 일반적인 GPL과 달리, AGPL은 **웹 서비스로 제공하는 경우에도** 소스 코드를 공개해야 합니다. 예를 들어 이 코드를 수정해서 웹사이트로 운영하면, 사용자가 요청할 때 수정된 소스 코드를 제공해야 합니다.
- **변경 사항 명시** — 원본에서 무엇을 바꿨는지 알 수 있도록 표시해야 합니다.
- **저작권 표시 유지** — 원본의 저작권 표시와 라이선스 문구를 지우면 안 됩니다.

### 할 수 없는 것

- **소스 비공개 상태로 서비스 운영** — 이 코드를 수정해서 웹 서비스를 만들면서 소스를 공개하지 않는 것은 라이선스 위반입니다.
- **다른 라이선스로 변경** — AGPL 코드를 MIT, Apache 등 더 허용적인 라이선스로 바꿔서 배포할 수 없습니다.

### 한줄 요약

> 마음껏 쓰되, 수정하거나 서비스로 제공할 경우 소스 코드를 AGPL-3.0으로 공개하세요.

</details>
