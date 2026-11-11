# 천체력 표 생성 스크립트

`src/ephemeris/data/`의 표와 `tests/horizons-reference.json`을 공개된 원자료에서 다시 만들어 내는 스크립트입니다. 패키지에는 포함되지 않는 개발용 도구이며, 표의 출처와 가공 방법을 기록해 두는 것이 목적입니다.

```bash
# 표 전체 재생성 (의존 순서대로: delta-t → nutation → vsop87 → elp2000 → checkpoints)
bun packages/core/scripts/ephemeris/build-tables.ts

# 일부만
bun packages/core/scripts/ephemeris/build-tables.ts vsop87 checkpoints

# 테스트 기준값 재생성
bun packages/core/scripts/ephemeris/build-reference.ts
```

원자료와 JPL Horizons 응답은 처음 한 번만 내려받아 `.cache/`(git 제외)에 보관하고, 이후에는 캐시만 읽습니다. 다른 위치를 쓰려면 `ORRERY_EPHEMERIS_CACHE` 환경 변수로 지정합니다.

## 독립 구현 원칙

이 천체력은 **Swiss Ephemeris를 비롯한 기존 천체력 소프트웨어의 소스 코드를 옮기지 않고**, 논문으로 발표된 이론과 공공 데이터만으로 작성했습니다. 교체 전의 Swiss Ephemeris 포팅 코드 가운데 작성 과정에서 열람한 것은 공개 API를 묶던 `index.ts`(교체 범위 파악용)뿐이며, 행성·달·하우스·세차·장동·ΔT 구현과 계수표는 열람하지 않았습니다. 이 디렉터리와 `src/ephemeris/`를 고칠 때에도 같은 원칙을 지켜야 합니다.

- 근거로 삼을 수 있는 것: 아래 표의 원자료와 그 공식 설명서, IAU/IERS 결의·기술문서, 교과서 수준의 구면천문학, JPL Horizons의 **계산 결과**.
- 근거로 삼으면 안 되는 것: Swiss Ephemeris(AGPL 또는 상용 라이선스), 그 파생 포팅의 소스 코드와 계수표.
- `tests/swiss-reference.json`은 Swiss Ephemeris가 출력한 **수치**만 담은 교차검증용 자료이며, 구현의 근거가 아닙니다.

## 원자료

| 표 | 내용 | 출처 |
|----|------|------|
| `vsop87.ts` | 수성·금성·지구·화성의 일심 직교좌표 급수 | P. Bretagnon, G. Francou, *Planetary theories in rectangular and spherical variables: VSOP87 solutions*, Astron. Astrophys. 202, 309 (1988). IMCCE 배포 `VSOP87A.*` |
| `elp2000.ts` | 달의 지심 좌표 급수 | M. Chapront-Touzé, J. Chapront, *The lunar ephemeris ELP 2000*, Astron. Astrophys. 124, 50 (1983); *ELP 2000-85*, Astron. Astrophys. 190, 342 (1988). IMCCE 배포 `ELP1`–`ELP36`과 설명서 *Lunar solution ELP 2000-82B* |
| `checkpoints.ts` | 목성~명왕성(계 질량중심)과 Chiron의 일심 상태벡터 | NASA/JPL Horizons API, 행성 천체력 DE441, Chiron은 JPL 소천체 궤도해 |
| `nutation.ts` | 장동 급수 | IERS Conventions (2010), Technical Note 36, 표 5.3a·5.3b (IAU 2000A_R06) |
| `delta-t.ts` | 관측된 ΔT = TT − UT1 | 미 해군천문대(USNO) `historic_deltat.data`, `deltat.data` |

코드에 직접 적은 상수의 출처는 다음과 같습니다.

- 세차: N. Capitaine, P. T. Wallace, J. Chapront, Astron. Astrophys. 412, 567 (2003) — IAU 2006 세차.
- 1900년 이전 ΔT: F. Espenak, J. Meeus, *Five Millennium Canon of Solar Eclipses* (NASA/TP-2006-214141)의 다항식.
- 질량(GM): JPL DE440 헤더 (R. S. Park 외, Astron. J. 161, 105, 2021).
- Delaunay 인수: IERS Conventions 2003 (J. L. Simon 외, 1994).

VSOP87과 ELP 2000-82B 파일에는 명시적인 라이선스 문구가 없습니다. 학술지에 발표된 이론의 계수이고 IMCCE가 재사용을 전제로 공개 배포해 왔으며, 여러 MIT·BSD 라이선스 천문 라이브러리가 같은 자료를 싣고 있습니다. 표 파일 머리말에 위 문헌을 밝혀 두었습니다.

## 가공 방법

### 급수 절단 (`vsop87`, `elp2000`, `nutation`)

원본 급수에서 진폭이 기준값 이상인 항만 남기고, 각 숫자는 결과 정밀도에 필요한 자릿수까지만 적습니다. 생성기는 절단 전의 전체 급수가 원자료에 딸린 검증값(`vsop87.chk`, ELP 설명서 Table H)을 재현하는지 먼저 확인하고, 어긋나면 중단합니다.

### DE441 재적합

VSOP87과 ELP 2000-82B는 1980년대 초의 JPL 천체력 DE200에 맞춰져 있어, 현행 DE441과 비교하면 천천히 어긋납니다.

- **달**: 평균 황경·근지점·교점의 0~3차 계수를 DE441 달 위치 720점(서기 1~3000년)에 최소제곱으로 다시 맞춥니다. 조석가속 값의 차이 때문에 원본 그대로는 서기 1년에서 7′ 넘게 벗어납니다.
- **수성~화성**: 궤도 진행 방향의 어긋남을 시간 보정으로 흡수합니다. 세기 단위 마디의 보정값(초)을 DE441 위치(행성당 480점)에 맞추고, 급수를 그만큼 옮긴 시각에서 계산합니다. 화성은 2200년에 약 16초, 고대에는 2분 넘게 차이 납니다.

### 외행성 수치적분 (`checkpoints`)

목성~명왕성과 Chiron은 해석적 급수 대신 운동방정식을 직접 적분합니다. Horizons에서 받은 상태벡터를 10,000일(Chiron은 4,000일) 간격의 체크포인트로 저장하고, 실행 시 가장 가까운 체크포인트에서 요청 시각까지 4차 Runge–Kutta로 적분합니다(`src/ephemeris/integrator.ts`). 생성기는 각 체크포인트를 다음 체크포인트까지 적분해 일치 정도를 확인하고, 허용 오차를 넘으면 중단합니다.

## 정확도

JPL Horizons(DE441)와 비교한 지심 위치의 최대 차이입니다(각초, 표본 150~190시점 측정). 테스트는 이보다 조금 여유를 둔 허용 오차로 같은 비교를 수행합니다.

| 천체 | 1800–2200년 | 서기 1–3000년 |
|------|------------:|--------------:|
| 태양 | 0.03 | 0.15 |
| 달 | 0.2 | 1.3 |
| 수성, 금성 | 0.15 | 0.25 |
| 화성 | 0.2 | 1.8 |
| 목성 | 0.07 | 0.1 |
| 토성, 천왕성, 해왕성, 명왕성 | 0.01 | 0.02 |
| Chiron (1900–2099년) | 0.01 | — |

이 수치는 ICRF 기준 위치(astrometric)의 비교입니다. 날짜 기준 황경에는 세차·장동 모델이 더해지는데, Horizons는 IAU 1976/80 모델로, 이 구현은 IAU 2006/2000A 모델로 계산하므로 두 결과가 세기당 약 0.2″씩 벌어집니다. 또한 UT로 주어진 시각은 ΔT를 거치므로, ΔT가 관측되지 않은 먼 과거와 미래에서는 달의 위치가 ΔT 불확실성(초당 0.55″)만큼 불확실합니다.
