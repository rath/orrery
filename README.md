<div align="center">
  <img src="src/assets/icon-512.png" alt="Orrery" width="256" />
  <h1>Orrery — 혼천의(渾天儀)</h1>
</div>

브라우저 기반 명리학 도구. 사주팔자(四柱八字), 자미두수(紫微斗數), 서양 점성술 출생차트(Natal Chart)를 백엔드 없이 클라이언트에서 계산합니다.

**[라이브 데모 →](https://rath.github.io/orrery/)**

## 크레딧

- **사주 만세력** — 고영창님의 Perl [진짜만세력](http://afnmp3.homeip.net/~kohyc/calendar/cal20000.html)을 김정균님이 [PHP로 포팅](https://github.com/OOPS-ORG-PHP/Lunar)한 것을, 2018년 11월 황장호가 Java와 Python으로 포팅하여 사용해오다가, 2026년 2월 Claude Code (Opus 4.6)로 TypeScript로 포팅
- **자미두수 명반** — [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 라이브러리 기반으로 Claude (Opus 4.5)가 중국어 문헌을 리서치하며 구현
- **점성술 출생차트** — [Swiss Ephemeris](https://github.com/arturania/swisseph)를 WASM으로 빌드한 [swisseph-wasm](https://www.npmjs.com/package/swisseph-wasm) 기반

## 기능

### 사주팔자 (四柱八字)
- 60갑자 기반 4주 계산 (시주, 일주, 월주, 년주)
- 십신, 12운성, 지장간
- 합충형파해 관계 분석 (삼합, 반합, 방합 포함)
- 신살 (양인살, 백호살, 괴강살)
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
- Swiss Ephemeris (WASM) 기반 행성 위치 계산
- 10개 행성 + 키론 + 남/북교점 위치 (별자리, 도수, 역행)
- 하우스 시스템 선택 (Placidus 기본, 10종 지원)
- ASC/MC/DESC/IC 앵글
- 5대 메이저 애스펙트 (합, 육합, 스퀘어, 트라인, 충)
- 출생 위치 입력 (위도/경도, 서울 기본값)

### 공통
- AI 에이전트용 텍스트 복사 (사주 + 자미두수 + 출생차트 일괄 복사)
- 사용 가이드 및 용어 설명
- 시간 모름 모드 (3주 계산)
- 모바일 반응형

## 사용법

```bash
# 의존성 설치
bun install

# 개발 서버
bun dev

# 빌드
bun run build

# 테스트
bun test
```

## 기술 스택

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- lunar-javascript (음력 변환)
- swisseph-wasm (Swiss Ephemeris WASM, 서양 점성술)
- Vitest (테스트)

## 라이선스

MIT
