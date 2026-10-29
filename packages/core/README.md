**한국어** | [English](https://github.com/rath/orrery/blob/main/packages/core/README.en.md) | [中文](https://github.com/rath/orrery/blob/main/packages/core/README.zh.md) | [日本語](https://github.com/rath/orrery/blob/main/packages/core/README.ja.md)

# @orrery/core

브라우저와 Node.js 환경에서 동작하는 동양·서양 점술 계산 엔진입니다.

- **사주팔자(四柱八字)** — 60갑자, 십신, 12운성, 신살·12신살, 공망, 대운, 간지 관계 분석
- **자미두수(紫微斗數)** — 명반(命盤) 생성, 대한(大限), 유년(流年)/유월(流月) 분석
- **서양 점성술 출생차트(Natal Chart)** — 행성 위치, 하우스, 앵글, 애스펙트, 행운점 (순수 TypeScript)

백엔드 없이 모든 계산을 클라이언트에서 수행합니다.

**[라이브 데모 →](https://sky.told.me/)**

## 크레딧

- **사주 만세력** — 고영창님의 Perl [진짜만세력](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)을 김정균님이 [PHP로 포팅](https://github.com/OOPS-ORG-PHP/Lunar)했고, 이를 황장호가 2018년 11월 Java와 Python으로 옮겨 사용해 오다가 2026년 2월 Claude Code(Opus 4.6)로 TypeScript에 포팅
- **자미두수 명반** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 라이브러리를 바탕으로 Claude(Opus 4.5)가 중국어 문헌을 조사하며 구현
- **점성술 출생차트** — [Swiss Ephemeris](https://www.astro.com/swisseph/)의 Moshier 천체력을 순수 TypeScript로 포팅

## 설치

```bash
npm install @orrery/core
```

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

// 사주 4주 (시, 일, 월, 연 순서)
for (const p of result.pillars) {
  console.log(p.pillar.ganzi)     // '乙巳', '壬辰', '乙卯', '癸酉'
  console.log(p.stemSipsin)       // 천간 십신
  console.log(p.branchSipsin)     // 지지 십신
  console.log(p.unseong)          // 12운성
}

// 대운
for (const dw of result.daewoon) {
  const startYear = dw.startDate.getUTCFullYear()
  console.log(`${dw.ganzi} (${dw.age}세~, ${startYear}년 시작)`)
}

// 간지 관계 (합, 충, 형, 파, 해)
for (const [key, pair] of result.relations.pairs) {
  console.log(key, pair.stem, pair.branch)
}
```

### 시간 미상과 타임존

- `unknownTime: true`이면 `hour`와 `minute`은 무시되고 정오(12:00) 기준으로 계산하므로, 대운 시작 시기에 수개월 오차가 있을 수 있습니다. `result.pillars[0]`의 간지·천간·지지는 각각 `'??'`, `'?'`, `'?'`이며, 시주는 관계·신살·공망·좌법·트랜짓 분석에서 제외됩니다. `calculateNatal()`은 하우스·앵글·행운점을 계산하지 않습니다(`houses`는 빈 배열, `angles`는 `null`).
- `timezone`을 생략하면 `Asia/Seoul`로 처리됩니다. 한국 외 출생지는 반드시 IANA 타임존 ID와 `longitude`를 지정하고, 서양 점성술 하우스 계산에는 `latitude`도 지정하세요. 자미두수의 `createChart()`는 `BirthInput` 대신 개별 인수를 받으므로 7·8번째 인수로 `timezone`과 `longitude`를 넘깁니다.
- 대운의 `startDate`는 명리 계산에 쓰인 벽시계 날짜를 UTC 필드에 담고 있어 실행 환경의 타임존에 영향을 받지 않습니다. 연·월·일을 읽을 때는 `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()`를 사용하세요.

### 자미두수 (紫微斗數)

```typescript
import { createChart, calculateLiunian, getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'

// 명반 생성 (양력 연·월·일·시·분, 남성 여부)
// 해외 출생: createChart(1993, 3, 12, 9, 45, true, 'America/New_York', -74.006)
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
const currentDaxianIndex = getDaxianIndex(chart, new Date().getFullYear())

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
  // 'Sun: Pisces 21.5°'
}

// ASC / MC (시간 미상이면 angles는 null)
if (chart.angles) {
  console.log(`ASC: ${chart.angles.asc.sign}`)
  console.log(`MC: ${chart.angles.mc.sign}`)
}

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
const [연주, 월주, 일주, 시주] = getFourPillars(1993, 3, 12, 9, 45)
console.log(연주, 월주, 일주, 시주) // '癸酉', '乙卯', '壬辰', '乙巳'

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

console.log(SEOUL) // { name: '서울', region: '서울특별시', lat: 37.5665, lon: 126.978 }

// 한글 초성 검색 지원
const results = filterCities('ㅂㅅ')  // '부산' 매칭
console.log(formatCityName(results[0])) // '부산'
```

## 계산 기준

입력 날짜는 서기 1–9999년의 유효한 그레고리력 날짜여야 합니다. 단, 출생차트는 Chiron 표가 다루는 약 1900–2100년만 계산할 수 있으며, 이 범위를 벗어나면 `calculateNatal()`이 오류를 던집니다.

### 사주팔자

연주·월주 판정과 대운 기산에는 `lunar-javascript`가 계산한 천문 절입 시각을 UTC로 변환해 사용합니다. 한국 출생(`timezone`이 `Asia/Seoul`이거나 생략된 경우)은 서머타임 등 한국 표준시의 역사적 편차를 KST 벽시계로 정규화한 뒤, 한국 사주 관례에 따라 시주 경계를 30분 늦춰(子시 23:30~01:30) 계산합니다. 해외 출생은 경도와 균시차로 보정한 진태양시를 사용하며, 30분 보정은 적용하지 않습니다.

### 자미두수

음력 설을 연도 경계로, 자정(00시)을 날짜 경계로 사용합니다. 윤달은 달 전체를 해당 음력 월로 취급하며, 윤달을 전반·후반으로 나누는 학파의 규칙은 적용하지 않습니다. 유월 명궁은 생월·생시를 반영한 斗君으로 정하고, 대한의 나이는 음력 출생년을 1세로 치는 세는나이입니다. 결과는 [iztro](https://github.com/SylarLong/iztro)를 `dayDivide: 'current'`, `yearDivide: 'normal'`, `fixLeap: false`로 설정한 값과 대조해 검증했습니다.

### 출생차트

행운점(Fortuna)의 주간·야간 차트 판정은 하우스 번호가 아니라 태양 중심의 기하학적 고도(대기 굴절 미반영)를 기준으로 합니다. 따라서 하우스 경계가 지평선과 일치하지 않는 Whole Sign·Morinus나 극지방에서도 같은 기준이 적용됩니다. Placidus·Koch를 계산할 수 없는 극지방에서는 Porphyrius로 대체하며, 실제로 적용된 방식은 `chart.houseSystem`에 담깁니다.

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
| `@orrery/core` | 통합 barrel export (`validation` 제외) |
| `@orrery/core/saju` | `calculateSaju()` |
| `@orrery/core/ziwei` | `createChart()`, `calculateLiunian()`, `getDaxianIndex()`, `getDaxianList()` |
| `@orrery/core/natal` | `calculateNatal()`, `HOUSE_SYSTEMS`, 별자리/행성 심볼, 포맷 함수 |
| `@orrery/core/timezone` | `resolveLocalDateTimeToUtc()`, `getBirthTimezone()` 등 타임존·DST 유틸리티 |
| `@orrery/core/pillars` | `getFourPillars()`, `getDaewoon()` 등 저수준 API |
| `@orrery/core/types` | 모든 TypeScript 타입/인터페이스 |
| `@orrery/core/constants` | 천간/지지, 십신, 궁위명 등 상수 테이블 |
| `@orrery/core/cities` | 도시 데이터, 검색 함수 |
| `@orrery/core/validation` | `assertBirthInput()` 등 입력값 검증 |

## 의존성

| 패키지 | 유형 | 용도 |
|--------|------|------|
| `lunar-javascript` | dependency | 음력 변환 (자미두수), 절입 시각 (사주) |

외부 WASM이나 데이터 파일 의존성 없이 모든 기능이 순수 TypeScript로 동작합니다.

## 라이선스

[AGPL-3.0](https://github.com/rath/orrery/blob/main/LICENSE)

<details>
<summary>AGPL-3.0이 뭔가요? (쉬운 설명)</summary>

### 자유롭게 할 수 있는 것

- **개인적으로 사용** — 본인 컴퓨터에서 마음대로 실행하고 수정해도 됩니다.
- **소스 코드를 읽고 공부** — 코드를 보고 배우는 건 언제든 환영합니다.
- **수정·개선 후 재배포** — 코드를 고쳐서 다시 배포할 수 있습니다. 단, 아래 조건을 지켜야 합니다.

### 반드시 지켜야 하는 것

- **같은 라이선스(AGPL-3.0) 유지** — 이 코드를 수정하거나 포함해서 배포할 때, 그 결과물도 반드시 AGPL-3.0으로 공개해야 합니다.
- **소스 코드 공개 의무** — 일반적인 GPL과 달리, AGPL은 **웹 서비스로 제공하는 경우에도** 소스 코드를 공개해야 합니다. 예를 들어 이 코드를 수정해서 웹사이트로 운영하면, 사이트 이용자가 수정된 소스 코드를 받을 수 있는 방법을 제공해야 합니다.
- **변경 사항 명시** — 원본에서 무엇을 바꿨는지 알 수 있도록 표시해야 합니다.
- **저작권 표시 유지** — 원본의 저작권 표시와 라이선스 문구를 지우면 안 됩니다.

### 할 수 없는 것

- **소스 비공개 상태로 서비스 운영** — 이 코드를 수정해서 웹 서비스를 만들면서 소스를 공개하지 않는 것은 라이선스 위반입니다.
- **다른 라이선스로 변경** — AGPL 코드를 MIT, Apache 등 더 허용적인 라이선스로 바꿔서 배포할 수 없습니다.

### 한 줄 요약

> 마음껏 쓰되, 수정본을 배포하거나 서비스로 제공한다면 소스 코드를 AGPL-3.0으로 공개하세요.

</details>
