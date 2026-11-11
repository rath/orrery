**한국어** | [English](./README.en.md) | [中文](./README.zh.md) | [日本語](./README.ja.md)

<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

브라우저 기반 명리학 도구. 사주팔자(四柱八字), 자미두수(紫微斗數), 서양 점성술 출생차트(Natal Chart)를 백엔드 없이 클라이언트에서 계산합니다.

**[라이브 데모 →](https://sky.told.me/)**

## 크레딧

- **사주 만세력** — 고영창님의 Perl [진짜만세력](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)을 김정균님이 [PHP로 포팅](https://github.com/OOPS-ORG-PHP/Lunar)했고, 이를 황장호가 2018년 11월 Java와 Python으로 옮겨 사용해 오다가 2026년 2월 Claude Code(Opus 4.6)로 TypeScript에 포팅. 절입 시각은 2026년 10월부터 lunar-javascript의 천문 계산 사용
- **자미두수 명반** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 라이브러리를 바탕으로 Claude(Opus 4.5)가 중국어 문헌을 조사하며 구현
- **점성술 출생차트** — 공개된 천문 이론과 데이터만으로 독자 구현한 순수 TypeScript 천체력. 수성~화성은 [VSOP87](https://ftp.imcce.fr/pub/ephem/planets/vsop87/), 달은 [ELP 2000-82B](https://ftp.imcce.fr/pub/ephem/moon/elp82b/) 이론으로, 목성~명왕성과 키론은 [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)(DE441) 상태벡터에서 출발하는 수치적분으로 계산하고, 결과를 JPL Horizons와 대조해 검증

## 기능

### 사주팔자 (四柱八字)
- 60갑자 기반 4주 계산 (시주, 일주, 월주, 연주)
- 십신, 12운성, 지장간
- 12신살, 공망
- 신살: 길신(천을귀인, 천덕귀인, 월덕귀인, 문창귀인, 금여록), 흉살(양인살, 도화살, 백호살, 괴강살, 홍염살)
- 합충형파해 관계 분석 (삼합, 반합, 방합 포함)
- 좌법(坐法), 인종법(引從法)
- 자시법(子時法) 선택: 통자시(기본), 야자시
- 대운 10개 (순행/역행 판단)
- 일운/월운 트랜짓 (합/충/형 감지)

### 자미두수 (紫微斗數)
- 음력 자동 변환
- 명궁/신궁 계산
- 14주성 배치 (紫微계 + 天府계)
- 보성/살성 배치
- 사화 (化祿/化權/化科/化忌)
- 성요 밝기 (廟/旺/得/利/平/陷)
- 전통 4×4 명반 그리드 레이아웃
- 대한 12개
- 유년 운세 (유년명궁, 유년사화, 12유월)

### 출생차트 (Natal Chart)
- VSOP87·ELP 2000-82B 이론과 수치적분으로 구현한 자체 천체력 기반 행성 위치 계산 (순수 TypeScript, 1800–2200년 JPL DE441 대비 0.3″ 이내)
- 10개 행성 + 키론 + 남/북교점 + 행운점(Part of Fortune) 위치 (별자리, 도수, 역행, 하우스)
- 하우스 시스템 10종 지원 (기본값 Placidus)
- ASC/MC/DESC/IC 앵글
- 5대 메이저 애스펙트 (컨정션, 섹스타일, 스퀘어, 트라인, 오포지션)
- 출생차트 휠 시각화

### 공통
- AI 해석용 텍스트 복사 (사주 + 자미두수 + 출생차트 일괄 복사)
- 출생지 입력: 한국·세계 주요 도시 검색(한글 초성 지원) 또는 위도/경도 직접 입력 (기본값 서울), 좌표 기반 시간대 자동 추론
- 서머타임, UTC+8:30 시기 등 한국 표준시 변경 이력 자동 반영
- 시간 모름 모드 (사주는 3주만 계산, 자미두수는 생략, 출생차트는 하우스·앵글 제외)
- 프로필 저장 (브라우저에 보관, JSON 가져오기/내보내기)
- 6개 언어 UI (한국어, English, 中文, 日本語, Deutsch, Español)
- 라이트/다크 테마 (시스템 설정 연동)
- 사용 가이드 및 용어 설명
- 모바일 반응형

## 사용법

```bash
# 의존성 설치
bun install

# 개발 서버
bun dev

# 빌드
bun run build

# 린트
bun run lint

# 타입 체크
bun run typecheck

# 테스트
bun run test
```

## 기술 스택

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript (음력 변환, 절입 시각)
- @photostructure/tz-lookup (좌표 → 시간대 추론)
- Vitest (테스트)

## `@orrery/core` 맛보기

계산 엔진을 npm 패키지로 사용할 수 있습니다. → [`@orrery/core`](https://www.npmjs.com/package/@orrery/core)

```typescript
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'

// timezone을 생략하면 Asia/Seoul 기준으로 계산
const input = { year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' as const }

// 사주팔자
const saju = calculateSaju(input)
saju.pillars.forEach(p => console.log(p.pillar.ganzi)) // 乙巳, 壬辰, 乙卯, 癸酉 (시·일·월·연 순)

// 자미두수 명반 (마지막 인수: 남성 여부)
const ziwei = createChart(1993, 3, 12, 9, 45, true)
console.log(ziwei.mingGongZhi)   // 명궁 지지 (戌)
console.log(ziwei.wuXingJu.name) // 오행국 (水二局)

// 서양 점성술 출생차트
const natal = await calculateNatal(input)
natal.planets.forEach(p => console.log(`${p.id}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`))
console.log(`ASC: ${natal.angles?.asc.sign}`) // 시간 모름이면 angles는 null
```

## 라이선스

[MIT](LICENSE)

저작권 표시와 라이선스 문구만 유지하면 상업적 이용을 포함해 자유롭게 사용·수정·배포할 수 있습니다.

`@orrery/core` 0.5.0 이하 버전은 Swiss Ephemeris에서 포팅한 천체력 코드를 포함하므로 AGPL-3.0으로 남습니다. 그 이후 버전은 천체력을 독자 구현으로 교체했으며 MIT로 배포합니다.
