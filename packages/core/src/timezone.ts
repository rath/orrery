/**
 * 타임존 · DST 유틸리티
 *
 * 모든 IANA 타임존의 DST는 `Intl.DateTimeFormat` + `shortOffset`에 100% 위임한다.
 * ICU/tzdb가 미국 1974 Nixon 긴급 DST, 호주 남반구 반전 위상, 한국 역사적 편차
 * (1948-1951 KDT, 1954-1961 UTC+8:30/+9:30, 1987-1988 KDT) 등 모든 과거 룰을 커버한다.
 *
 * DST 전환 엣지 케이스 정책:
 * - Spring-forward 갭(존재하지 않는 로컬 시각): `RangeError('DST gap: ...')` throw.
 *   출생 기록의 시간대 오기재일 가능성이 높으므로 조용한 스냅 대신 실패를 노출한다.
 * - Fall-back 오버랩(동일 로컬 시각이 두 번 등장): 항상 **먼저 발생한 UTC 순간**
 *   (= pre-rollback = DST 유지 상태)을 결정론적으로 반환. 물리적 시간 순서와 일치.
 */

import type { BirthInput } from './types.ts';

export const DEFAULT_TIMEZONE = 'Asia/Seoul';
const DEFAULT_LONGITUDE = 127.0992;
const KST_FIXED_OFFSET_MINUTES = 9 * 60;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DST_GAP_ERROR_PREFIX = 'DST gap';

const LOCAL_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const OFFSET_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function getLocalFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = LOCAL_FORMATTERS.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    LOCAL_FORMATTERS.set(timezone, formatter);
  }
  return formatter;
}

function getOffsetFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = OFFSET_FORMATTERS.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    OFFSET_FORMATTERS.set(timezone, formatter);
  }
  return formatter;
}

function getLocalDateTimeParts(date: Date, timezone: string): LocalDateTimeParts {
  const parts = getLocalFormatter(timezone)
    .formatToParts(date)
    .filter(part => part.type !== 'literal');

  const result: Partial<Record<keyof LocalDateTimeParts, number>> = {};
  for (const part of parts) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day'
      || part.type === 'hour' || part.type === 'minute'
    ) {
      result[part.type] = Number(part.value);
    }
  }

  return {
    year: result.year ?? 0,
    month: result.month ?? 0,
    day: result.day ?? 0,
    hour: result.hour ?? 0,
    minute: result.minute ?? 0,
  };
}

function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const tzName = getOffsetFormatter(timezone)
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')
    ?.value;

  const match = tzName?.match(/^GMT(?:(\+|-)(\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) throw new RangeError(`Unsupported time zone: ${timezone}`);

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

function sameLocalDateTime(a: LocalDateTimeParts, b: LocalDateTimeParts): boolean {
  return a.year === b.year
    && a.month === b.month
    && a.day === b.day
    && a.hour === b.hour
    && a.minute === b.minute;
}

function formatGapMessage(
  timezone: string,
  year: number, month: number, day: number,
  hour: number, minute: number,
): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${DST_GAP_ERROR_PREFIX}: local time does not exist in timezone ${timezone}: ${y}-${m}-${d} ${h}:${min}`;
}

/**
 * 로컬 벽시계(year/month/day/hour/minute)를 UTC Date로 해석한다.
 *
 * - DST spring-forward 갭 시각 입력: `RangeError` (메시지 앞부분 `DST gap:`) throw.
 * - DST fall-back 오버랩: 두 후보 중 **더 이른 UTC** 결정론적 반환 (먼저 발생한 시각).
 * - 그 외 일반 케이스: 단일 유효 후보를 반환.
 */
export function resolveLocalDateTimeToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number, timezone: string,
): Date {
  const local = { year, month, day, hour, minute };
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute);

  // 전환 인근에서도 "transition 전" 오프셋과 "transition 후" 오프셋을 모두 포착하도록
  // ±24h 지점에서 오프셋을 샘플링한다. 한 날에 두 번 이상의 전환이 있는 타임존은 없다.
  const offsetBefore = getTimezoneOffsetMinutes(new Date(naiveUtcMs - ONE_DAY_MS), timezone);
  const offsetAfter = getTimezoneOffsetMinutes(new Date(naiveUtcMs + ONE_DAY_MS), timezone);

  const candidateMsSet = new Set<number>();
  candidateMsSet.add(naiveUtcMs - offsetBefore * 60_000);
  candidateMsSet.add(naiveUtcMs - offsetAfter * 60_000);

  const valid: number[] = [];
  for (const candidateMs of candidateMsSet) {
    const parts = getLocalDateTimeParts(new Date(candidateMs), timezone);
    if (sameLocalDateTime(parts, local)) {
      valid.push(candidateMs);
    }
  }

  if (valid.length === 0) {
    throw new RangeError(formatGapMessage(timezone, year, month, day, hour, minute));
  }

  // Overlap(valid.length === 2): prefer-first = 먼저 발생한 UTC = Math.min
  return new Date(Math.min(...valid));
}

export type ResolveLocalDateTimeToUtcResult =
  | { ok: true; date: Date }
  | { ok: false; reason: 'dst-gap' | 'invalid-timezone' };

/** `resolveLocalDateTimeToUtc`의 안전 래퍼. try/catch 없이 디스크리미네이티드 결과를 반환. */
export function resolveLocalDateTimeToUtcSafe(
  year: number, month: number, day: number,
  hour: number, minute: number, timezone: string,
): ResolveLocalDateTimeToUtcResult {
  try {
    const date = resolveLocalDateTimeToUtc(year, month, day, hour, minute, timezone);
    return { ok: true, date };
  } catch (err) {
    if (err instanceof RangeError) {
      if (err.message.startsWith(DST_GAP_ERROR_PREFIX)) {
        return { ok: false, reason: 'dst-gap' };
      }
      return { ok: false, reason: 'invalid-timezone' };
    }
    throw err;
  }
}

export function getBirthTimezone(input: BirthInput): string {
  return input.timezone ?? DEFAULT_TIMEZONE;
}

export function birthInputToUtcDate(
  year: number, month: number, day: number,
  hour: number, minute: number, timezone: string,
): Date {
  return resolveLocalDateTimeToUtc(year, month, day, hour, minute, timezone);
}

function getDayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / ONE_DAY_MS);
}

function getEquationOfTimeMinutes(year: number, month: number, day: number): number {
  const dayOfYear = getDayOfYear(year, month, day);
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

/**
 * 비-한국 출생 경로: 경도 × 4분 + 균시차(EoT) 보정을 적용해 지역 진태양시로 변환한다.
 * 내부에서 `resolveLocalDateTimeToUtc`를 호출하므로 전 세계 DST가 자동 반영된다.
 */
export function adjustBirthInputToSolarTime(input: BirthInput): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const timezone = getBirthTimezone(input);
  const utcDate = resolveLocalDateTimeToUtc(
    input.year, input.month, input.day, input.hour, input.minute, timezone,
  );
  const equationOfTime = getEquationOfTimeMinutes(input.year, input.month, input.day);
  const longitude = input.longitude ?? DEFAULT_LONGITUDE;
  const solarDate = new Date(utcDate.getTime() + (longitude * 4 + equationOfTime) * 60_000);

  return {
    year: solarDate.getUTCFullYear(),
    month: solarDate.getUTCMonth() + 1,
    day: solarDate.getUTCDate(),
    hour: solarDate.getUTCHours(),
    minute: solarDate.getUTCMinutes(),
  };
}

/**
 * 한국 출생 경로: 사주 관례가 요구하는 "KST(+9:00) 벽시계 등가 시각"을 반환한다.
 *
 * 사용자가 입력한 시각을 `Asia/Seoul` IANA 오프셋으로 UTC로 변환한 뒤, 고정 +9:00을
 * 적용해 KST 벽시계로 재정규화한다. 이 과정은 다음 기간을 모두 자동으로 커버한다.
 *
 * - 1948-1951: 표준시 +9, KDT +10 — KDT 기간은 1시간 후퇴.
 * - 1954-1961년 8월: 표준시 +8:30, DST +9:30 — 30분 전진 또는 후퇴.
 * - 1987-1988: 표준시 +9, KDT +10 — KDT 기간은 1시간 후퇴.
 * - 그 외: +9 고정 → 변경 없음.
 *
 * 경도/균시차 보정은 적용하지 않는다 (한국 사주 전통 KST 벽시계 관례 유지).
 */
export function adjustBirthInputToKstWallClock(input: BirthInput): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const utcDate = resolveLocalDateTimeToUtc(
    input.year, input.month, input.day, input.hour, input.minute, DEFAULT_TIMEZONE,
  );
  const kstMs = utcDate.getTime() + KST_FIXED_OFFSET_MINUTES * 60_000;
  const kst = new Date(kstMs);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
  };
}

/**
 * 해당 날짜에 `Asia/Seoul`의 IANA 오프셋이 +9:00이 아닌 구간인지 여부.
 * (1948-1951, 1954-1961년 8월 이전, 1987-1988 등을 모두 감지.)
 *
 * `isKoreanDaylightTime`(1987-88 전용 88올림픽 UI 메시지용)의 superset.
 */
export function isKoreanHistoricalTimeAnomaly(year: number, month: number, day: number): boolean {
  const sampleMs = Date.UTC(year, month - 1, day, 12, 0);
  const offset = getTimezoneOffsetMinutes(new Date(sampleMs), DEFAULT_TIMEZONE);
  return offset !== KST_FIXED_OFFSET_MINUTES;
}
