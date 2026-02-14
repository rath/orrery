# CLAUDE.md

## Project Overview

Orrery는 브라우저 기반 명리학 도구입니다. 사주팔자(四柱八字)와 자미두수(紫微斗數)를 백엔드 없이 클라이언트에서 계산합니다.

## Commands

```bash
# 개발 서버
bun dev

# 빌드
bun run build

# 타입 체크
bunx tsc --noEmit

# 테스트
bun test
```

## Architecture

```
src/
├── core/           # 계산 엔진 (Python 포팅)
│   ├── types.ts    # 인터페이스, 타입 정의
│   ├── constants.ts # 모든 상수/룩업 테이블
│   ├── pillars.ts  # 사주 계산 엔진 (60갑자, 절기, 대운)
│   ├── saju.ts     # 사주 결과 조립 (십신, 운성)
│   └── ziwei.ts    # 자미두수 계산 엔진 (명반 생성)
├── components/
│   ├── App.tsx     # 루트: 탭 네비게이션 + 상태
│   ├── BirthForm.tsx # 생년월일시/성별 입력 폼
│   ├── CopyButton.tsx # 클립보드 복사
│   ├── saju/       # 사주 UI 컴포넌트
│   └── ziwei/      # 자미두수 UI 컴포넌트
├── utils/
│   ├── format.ts   # CJK 포매팅 헬퍼
│   └── text-export.ts # 복사용 텍스트 생성
└── tests/
    ├── fixtures.ts # Python 기준 참조 데이터
    ├── pillars.test.ts
    └── ziwei.test.ts
```

## Tech Stack

- React 18 + TypeScript 5 (strict mode)
- Vite 5 (빌드/개발 서버)
- Tailwind CSS 4 (스타일링)
- bun (패키지 매니저)
- Vitest (테스트)
- lunar-javascript (음력 변환)

## 포팅 주의사항

Python에서 TypeScript로 포팅 시 주의:

| 항목 | Python | TypeScript |
|------|--------|------------|
| 정수 나눗셈 | `int(a/b)` | `Math.trunc(a / b)` |
| 음수 모듈로 | `(-7) % 12 == 5` | `((-7 % 12) + 12) % 12` |
| 날짜 월 인덱스 | 1-based | `new Date(y, m-1, d)` |

**CRITICAL: 이 프로젝트의 커밋 메시지는 한국어로 작성합니다.**

## Conventions

- 한국어 UI, 한자 술어
- CJK 폰트: Noto Sans KR, Apple SD Gothic Neo 우선
- 오행 색상: 木=green, 火=red, 土=yellow, 金=gray, 水=blue
