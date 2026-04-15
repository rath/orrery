# CLAUDE.md

## Project Overview

Orrery는 브라우저 기반 명리학 도구입니다. 사주팔자(四柱八字), 자미두수(紫微斗數), 서양 점성술 출생차트(Natal Chart)를 백엔드 없이 클라이언트에서 계산합니다.

## Commands

```bash
# 개발 서버 (웹앱)
bun dev

# 빌드 (웹앱)
bun run build

# 타입 체크
bunx tsc --noEmit

# 테스트 (전체)
bun test

# 코어 패키지 빌드
bun run --cwd packages/core build

# 코어 패키지 테스트
bun run --cwd packages/core test
```

## Architecture

모노레포 구조 (bun workspaces):

```
packages/core/          # @orrery/core — 독립 npm 패키지 (계산 엔진)
├── src/
│   ├── index.ts        # barrel export
│   ├── types.ts        # 인터페이스, 타입 정의
│   ├── constants.ts    # 모든 상수/룩업 테이블
│   ├── pillars.ts      # 사주 계산 엔진 (60갑자, 절기, 대운)
│   ├── saju.ts         # 사주 결과 조립 (십신, 운성)
│   ├── ziwei.ts        # 자미두수 계산 엔진 (명반 생성)
│   ├── natal.ts        # 서양 점성술 계산 엔진 (순수 TypeScript ephemeris)
│   └── cities.ts       # 출생 도시 데이터
└── tests/
    ├── fixtures.ts     # Python 기준 참조 데이터
    ├── pillars.test.ts
    ├── ziwei.test.ts
    └── natal.test.ts

src/                    # 웹앱 (Vite + React)
├── components/
│   ├── App.tsx         # 루트: 탭 네비게이션 + 상태
│   ├── BirthForm.tsx   # 생년월일시/성별 입력 폼
│   ├── CopyButton.tsx  # 클립보드 복사
│   ├── saju/           # 사주 UI 컴포넌트
│   ├── ziwei/          # 자미두수 UI 컴포넌트
│   └── natal/          # 출생차트 UI 컴포넌트
└── utils/
    ├── format.ts       # CJK 포매팅 헬퍼
    └── text-export.ts  # 복사용 텍스트 생성
```

웹앱에서 코어 import: `import { ... } from '@orrery/core/saju'` 등 subpath exports 사용.

## Tech Stack

- bun workspaces (모노레포, 패키지 매니저)
- TypeScript 5 (strict mode)
- **@orrery/core**: tsup (빌드), Vitest (테스트), lunar-javascript (음력 변환)
- **웹앱**: React 19, Vite 7 (빌드/개발 서버), Tailwind CSS 4 (스타일링), Vitest (테스트)

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

4개 언어 지원: 한국어(ko), 중국어(zh), 일본어(ja), 영어(en).

- 번역 파일: `src/i18n/locales/{ko,zh,ja,en}.ts` — 플랫 딕셔너리 (`Record<string, string>`)
- 스토어: `src/i18n/store.ts` — `useSyncExternalStore` 기반, localStorage 키 `orrery-locale`
- Hook: `src/i18n/index.ts` — `useLocale()` → `{ locale, setLocale, t }`
- 컴포넌트에서 사용: `const { t } = useLocale()` 후 `t('key.name')`

**규칙:**
- UI에 한국어 문자열을 하드코딩하지 말 것. 반드시 `t('key')` 사용
- 한자 전문용어(四柱八字, 十神, 空亡, 大運, 天干, 地支 등)는 번역하지 않고 모든 언어에서 그대로 사용
- '혼천의(渾天儀)' 앱 제목은 번역하지 않음 (고정값)
- 새 문자열 추가 시 4개 언어 파일 모두에 키를 추가할 것
- 브라우저 언어 자동 감지, 폴백은 영어(en)

## @orrery/core 사용 시 주의

`BirthInput.timezone`은 선택 필드지만 생략하면 `Asia/Seoul`로 폴백된다. 한국 이외 출생지를 계산할 때는 반드시 IANA 타임존 ID(예: `America/Los_Angeles`)를 명시할 것 — 누락하면 natal/saju/ziwei 모두가 서울 기준으로 계산된다. 웹 폼(`BirthForm.tsx::buildBirthInput`)은 좌표에서 자동 추론해 주입하므로 문제없지만, 테스트·스크립트·외부 소비자가 `BirthInput`을 직접 구성할 때는 `timezone` 필드를 빠뜨리지 않도록 주의해야 한다.

동작 규칙:
- `'Asia/Seoul'` 또는 미지정: KDT→KST 보정 후 KST 벽시계로 계산 (한국 사주 관례 유지)
- 그 외 타임존: IANA → UTC 변환 후 경도·균시차 기반 진태양시 보정
