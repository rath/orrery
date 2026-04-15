/**
 * 한국 하계표준시(KDT) 1987-88 탐지 유틸리티
 *
 * 1987~1988년 88올림픽 준비를 위해 시행된 하계표준시(UTC+10) 구간 판정 전용.
 * `BirthForm`이 "88올림픽 KDT" 특정 안내 메시지를 렌더링하는 UI 경로에서만 쓰인다.
 *
 * 한국 표준시 편차 전반(1948-1951, 1954-1961 UTC+8:30/+9:30 등)에 대한 일반
 * 검출은 `timezone.ts::isKoreanHistoricalTimeAnomaly`를 사용할 것. 실제 saju/
 * ziwei 계산은 `adjustBirthInputToKstWallClock`이 IANA 오프셋을 이용해 모든
 * 편차 구간을 자동 커버하므로 이 파일의 판정 함수에 의존하지 않는다.
 */

/** 한국 하계표준시(KDT) 기간인지 판정 (1987~1988 88올림픽 UI 메시지 전용) */
export function isKoreanDaylightTime(year: number, month: number, day: number): boolean {
  if (year === 1987) {
    // 1987-05-10 ~ 1987-10-11
    if (month > 5 && month < 10) return true
    if (month === 5 && day >= 10) return true
    if (month === 10 && day <= 11) return true
  }
  if (year === 1988) {
    // 1988-05-08 ~ 1988-10-09
    if (month > 5 && month < 10) return true
    if (month === 5 && day >= 8) return true
    if (month === 10 && day <= 9) return true
  }
  return false
}
