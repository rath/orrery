# AGENTS.md

## Project Overview

Orrery는 브라우저 기반 명리학 도구입니다. 사주팔자(四柱八字), 자미두수(紫微斗數), 서양 점성술 출생차트(Natal Chart)를 백엔드 없이 클라이언트에서 계산합니다.

## Commands

```bash
# 개발 서버 (웹앱)
bun dev

# 빌드 (웹앱)
bun run build

# 린트
bun run lint

# 타입 체크 (웹앱 tsc -b + 코어 src·tests)
bun run typecheck

# 테스트 (전체)
bun run test

# 코어 패키지 빌드
bun run --cwd packages/core build

# 코어 패키지 테스트
bun run --cwd packages/core test
```

## Architecture

모노레포 구조 (bun workspaces):

```
packages/core/                      # @orrery/core — 독립 npm 패키지 (계산 엔진)
├── src/
│   ├── index.ts                    # barrel export (validation 제외)
│   ├── types.ts                    # 인터페이스, 타입 정의
│   ├── constants.ts                # 모든 상수/룩업 테이블
│   ├── validation.ts               # 입력 검증, 서기 1–9999년 날짜 변환
│   ├── timezone.ts                 # IANA 타임존 → UTC, 진태양시·KST 벽시계 보정
│   ├── kdt.ts                      # 1987–88 한국 하계표준시(KDT) 판정 (폼 안내용)
│   ├── solar-terms.ts              # lunar-javascript 기반 천문 절입 시각 (UTC)
│   ├── pillars.ts                  # 사주 계산 엔진 (60갑자, 대운, 관계, 신살, 트랜짓)
│   ├── saju.ts                     # 사주 결과 조립 (타임존 보정, 십신, 운성, 공망)
│   ├── ziwei.ts                    # 자미두수 계산 엔진 (명반, 대한, 유년·유월)
│   ├── natal.ts                    # 서양 점성술 출생차트 (행성, 하우스, 애스펙트, 행운점)
│   ├── cities.ts                   # 출생 도시 데이터, 초성 검색
│   └── ephemeris/                  # Swiss Ephemeris Moshier 모드의 순수 TypeScript 포팅
│       ├── index.ts                # 공개 API (calcPlanet, calcHouses, julday)
│       ├── planets.ts              # Moshier 행성 이론
│       ├── moon.ts                 # Moshier 달 이론
│       ├── chiron.ts               # Chiron 표 보간 (1900-01-01 ~ 2099-12-23 UT)
│       ├── node.ts                 # 달의 평균 교점
│       ├── houses.ts               # 하우스 시스템 10종, 극지방 대체
│       ├── julian.ts               # 율리우스일 변환
│       ├── deltat.ts               # ΔT (UT → TT)
│       ├── precession.ts           # 세차 (IAU 1976)
│       ├── nutation.ts             # 장동 (IAU 1980)
│       ├── obliquity.ts            # 황도 경사
│       ├── math.ts                 # 좌표 변환, 각도 유틸리티
│       └── tables/                 # 행성·달 계수표, Chiron 표
├── examples/                       # 실행 예제 (saju.ts, ziwei.ts, natal.ts)
└── tests/
    ├── fixtures.ts                 # Python 기준 참조 데이터
    ├── pillars.test.ts
    ├── solar-terms.test.ts         # 절입 시각 (Swiss Ephemeris 독립 검증값)
    ├── ziwei.test.ts
    ├── ziwei-reference.test.ts     # iztro 2.6.3 기준값 (ziwei-reference.json)
    ├── natal.test.ts
    ├── ephemeris-reference.test.ts # pyswisseph 기준값 (swiss-reference.json)
    ├── fortuna.test.ts             # 행운점 주야간 판정
    ├── timezone.test.ts
    └── validation.test.ts

src/                                # 웹앱 (Vite + React)
├── main.tsx                        # 진입점
├── index.css                       # Tailwind, 전역 스타일
├── assets/                         # 앱 아이콘
├── components/
│   ├── App.tsx                     # 루트: 탭 네비게이션 + 상태, AI 해석용 일괄 복사
│   ├── BirthForm.tsx               # 생년월일시/성별/출생지 입력 폼, 타임존 추론
│   ├── CityCombobox.tsx            # 도시 검색 콤보박스
│   ├── CopyButton.tsx              # 클립보드 복사
│   ├── Guide.tsx                   # 사용 가이드, 용어 설명
│   ├── LanguageMenu.tsx            # 언어 선택
│   ├── ProfileModal.tsx            # 프로필 관리 (저장, JSON 가져오기/내보내기)
│   ├── ThemeToggle.tsx             # 시스템/라이트/다크 테마
│   ├── saju/                       # 사주 UI 컴포넌트
│   ├── ziwei/                      # 자미두수 UI 컴포넌트
│   └── natal/                      # 출생차트 UI 컴포넌트
│       └── wheel/                  # 출생차트 휠 (SVG)
├── i18n/
│   ├── index.ts                    # useLocale() 훅
│   ├── store.ts                    # 로케일 스토어, LOCALES 정의
│   ├── locales/                    # 6개 언어 번역 파일
│   └── locales.test.ts             # 언어별 키 집합 일치 검증
├── types/                          # 타입 선언이 없는 외부 패키지용 .d.ts
└── utils/
    ├── birth-state.ts              # 저장된 폼 상태 검증·복원
    ├── coordinate-input.ts         # 위도/경도 입력 파싱·포매팅 (+ .test.ts)
    ├── format.ts                   # CJK 포매팅 헬퍼
    ├── profiles.ts                 # 프로필 저장소 (localStorage) (+ .test.ts)
    ├── text-export.ts              # 복사용 텍스트 생성
    └── timezones.ts                # 좌표 → 타임존 추론, 현지 시각 검증

public/                             # 정적 파일 (CNAME, manifest, robots.txt, sitemap)
scripts/                            # 아이콘·OG 이미지 생성 스크립트 (sharp)
.github/workflows/deploy.yml        # 린트·테스트·빌드 후 GitHub Pages 배포
```

웹앱에서 코어 import: `import { ... } from '@orrery/core/saju'` 등 subpath exports 사용.

## Tech Stack

- bun workspaces (모노레포, 패키지 매니저)
- TypeScript 5 (strict mode)
- **@orrery/core**: tsup (빌드), Vitest (테스트), lunar-javascript (음력 변환, 절입 시각 — 번들하지 않는 런타임 의존성)
- **웹앱**: React 19, Vite 7 (빌드/개발 서버), Tailwind CSS 4 (스타일링), Vitest (테스트), @photostructure/tz-lookup (좌표 → 타임존)

## 포팅 주의사항

Python에서 TypeScript로 포팅 시 주의:

| 항목 | Python | TypeScript |
|------|--------|------------|
| 정수 나눗셈 | `int(a/b)` | `Math.trunc(a / b)` |
| 음수 모듈로 | `(-7) % 12 == 5` | `((-7 % 12) + 12) % 12` |
| 날짜 월 인덱스 | 1-based | `new Date(y, m-1, d)` |

**CRITICAL: 이 프로젝트의 커밋 메시지는 한국어로 작성합니다.**

## Conventions

- 기본 폰트: Pretendard (한글/라틴), Noto Sans KR (한자 fallback)
- `.font-hanja` 클래스: Noto Sans KR (한자 전용)
- 오행 색상: 木=green, 火=red, 土=yellow, 金=gray, 水=blue

## i18n (다국어)

6개 언어 지원: 한국어(ko), 중국어(zh), 일본어(ja), 영어(en), 독일어(de), 스페인어(es).

- 번역 파일: `src/i18n/locales/{ko,zh,ja,en,de,es}.ts` — 플랫 딕셔너리 (`Record<string, string>`)
- 스토어: `src/i18n/store.ts` — `useSyncExternalStore` 기반, localStorage 키 `orrery-locale`. 지원 로케일 목록의 단일 출처는 `LOCALES` 상수(코드·약어·자국어 이름)이며 `Locale` 타입도 여기서 파생
- Hook: `src/i18n/index.ts` — `useLocale()` → `{ locale, setLocale, t }`
- 컴포넌트에서 사용: `const { t } = useLocale()` 후 `t('key.name')`

**규칙:**
- UI에 한국어 문자열을 하드코딩하지 말 것. 반드시 `t('key')` 사용
- 한자 전문용어(四柱八字, 十神, 空亡, 大運, 天干, 地支 등)는 번역하지 않고 모든 언어에서 그대로 사용
- '혼천의(渾天儀)' 앱 제목은 번역하지 않음 (고정값)
- 새 문자열 추가 시 6개 언어 파일 모두에 키를 추가할 것 (`src/i18n/locales.test.ts`가 키 집합 일치를 검증)
- 브라우저 언어 자동 감지, 폴백은 영어(en)

## @orrery/core 사용 시 주의

`BirthInput.timezone`은 선택 필드지만 생략하면 `Asia/Seoul`로 폴백된다. 한국 이외 출생지를 계산할 때는 반드시 IANA 타임존 ID(예: `America/Los_Angeles`)를 명시할 것 — 누락하면 natal/saju/ziwei 모두가 서울 기준으로 계산된다. 웹 폼(`BirthForm.tsx::buildBirthInput`)은 좌표에서 자동 추론해 주입하므로 문제없지만, 테스트·스크립트·외부 소비자가 `BirthInput`을 직접 구성할 때는 `timezone` 필드를 빠뜨리지 않도록 주의해야 한다.

동작 규칙:
- `'Asia/Seoul'` 또는 미지정: KDT→KST 보정 후 KST 벽시계로 계산 (한국 사주 관례 유지)
- 그 외 타임존: IANA → UTC 변환 후 경도·균시차 기반 진태양시 보정

출생차트 날짜 범위: `calculateNatal()`은 Moshier 천체력 범위(3003-04-29 TT)를 넘으면 `RangeError`를 던지고, Chiron은 사전 계산 표가 있는 1900-01-01 ~ 2099-12-23(UT)에만 결과에 포함한다. 웹 폼은 연도를 1900년~올해로 제한하므로 영향이 없지만, 테스트·스크립트에서 이 범위 밖 날짜를 다룰 때는 Chiron이 빠질 수 있음을 전제로 작성할 것.
