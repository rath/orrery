/**
 * 사주 계산 엔진
 *
 * 60갑자, 절기, 대운 계산
 */
import {
  HGANJI, YANGGAN, RELATIONS, METEORS_12, SPIRITS_12,
  SKY, EARTH, SKY_KR, EARTH_KR, STEM_INFO,
  TRIPLE_COMPOSES, TRIPLE_COMPOSE_ELEMENTS,
  HALF_COMPOSES, DIRECTIONAL_COMPOSES, DIRECTIONAL_COMPOSE_ELEMENTS,
  STEM_COMBINES, STEM_CLASHES,
  BRANCH_COMBINES_6, BRANCH_CLASHES, BRANCH_BREAKS, BRANCH_HARMS,
  BRANCH_PUNISHMENTS, BRANCH_SELF_PUNISHMENTS, BRANCH_WONJIN, BRANCH_GWIMUN,
  YANGIN_MAP, BAEKHO_PILLARS, GOEGANG_PILLARS,
  DOHWA_MAP, CHEONUL_MAP, CHEONDUK_MAP, WOLDUK_MAP,
  MUNCHANG_MAP, HONGYEOM_PILLARS, GEUMYEO_MAP,
  JIJANGGAN, METEOR_LOOKUP, PILLAR_NAMES,
} from './constants.ts';
import type {
  Relation, RelationResult, PairRelation, AllRelations, SpecialSals,
  TransitItem,
} from './types.ts';

// =============================================
// 유틸리티
// =============================================

/** Python의 int(a/b) — 0 방향 절사 */
function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

/** Python 호환 모듈로 (항상 양수) */
function pymod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

// =============================================
// 절기 상수 (월 시작분)
// =============================================

const MONTH = [
  0, 21355, 42843, 64498, 86335, 108366, 130578, 152958,
  175471, 198077, 220728, 243370, 265955, 288432, 310767,
  332928, 354903, 376685, 398290, 419736, 441060, 462295,
  483493, 504693, 525949,
];

// =============================================
// 기준점 (1996-02-04 22:08 병자년 입춘)
// =============================================

const UNIT = {
  year: 1996, month: 2, day: 4, hour: 22, min: 8,
  // 세차
  ygan: 2, yji: 0,
  // 월건
  mgan: 6, mji: 2, msu: 26,
  // 일진
  dgan: 7, dji: 7, dsu: 7,
  // 시주
  hgan: 5, hji: 11, hsu: 35,
};

// =============================================
// 날짜 연산
// =============================================

/** year의 1월 1일부터 month/day까지 일수 */
function dayOfYear(year: number, month: number, day: number): number {
  let e = 0;
  for (let i = 1; i < month; i++) {
    e += 31;
    if (i === 2 || i === 4 || i === 6 || i === 9 || i === 11) {
      e -= 1;
    }
    if (i === 2) {
      e -= 2;
      if (year % 4 === 0) e += 1;
      if (year % 100 === 0) e -= 1;
      if (year % 400 === 0) e += 1;
      if (year % 4000 === 0) e -= 1;
    }
  }
  e += day;
  return e;
}

/** 두 날짜 사이의 일수 (y1m1d1 → y2m2d2 방향) */
function daysBetween(
  y1: number, m1: number, d1: number,
  y2: number, m2: number, d2: number,
): number {
  let p1: number, p1n: number, p2: number;
  let pp1: number, pp2: number, pr: number;

  if (y2 > y1) {
    p1 = dayOfYear(y1, m1, d1);
    p1n = dayOfYear(y1, 12, 31);
    p2 = dayOfYear(y2, m2, d2);
    pp1 = y1; pp2 = y2; pr = -1;
  } else {
    p1 = dayOfYear(y2, m2, d2);
    p1n = dayOfYear(y2, 12, 31);
    p2 = dayOfYear(y1, m1, d1);
    pp1 = y2; pp2 = y1; pr = 1;
  }

  let dis: number;
  if (y2 === y1) {
    dis = p2 - p1;
  } else {
    dis = p1n - p1;
    let k = pp1 + 1;
    const ppp2 = pp2 - 1;

    while (k <= ppp2) {
      // 빠른 건너뛰기 (ppp2 > 1990일 때)
      if (k === -2000 && ppp2 > 1990) { dis += 1457682; k = 1991; }
      else if (k === -1750 && ppp2 > 1990) { dis += 1366371; k = 1991; }
      else if (k === -1500 && ppp2 > 1990) { dis += 1275060; k = 1991; }
      else if (k === -1250 && ppp2 > 1990) { dis += 1183750; k = 1991; }
      else if (k === -1000 && ppp2 > 1990) { dis += 1092439; k = 1991; }
      else if (k === -750 && ppp2 > 1990) { dis += 1001128; k = 1991; }
      else if (k === -500 && ppp2 > 1990) { dis += 909818; k = 1991; }
      else if (k === -250 && ppp2 > 1990) { dis += 818507; k = 1991; }
      else if (k === 0 && ppp2 > 1990) { dis += 727197; k = 1991; }
      else if (k === 250 && ppp2 > 1990) { dis += 635887; k = 1991; }
      else if (k === 500 && ppp2 > 1990) { dis += 544576; k = 1991; }
      else if (k === 750 && ppp2 > 1990) { dis += 453266; k = 1991; }
      else if (k === 1000 && ppp2 > 1990) { dis += 361955; k = 1991; }
      else if (k === 1250 && ppp2 > 1990) { dis += 270644; k = 1991; }
      else if (k === 1500 && ppp2 > 1990) { dis += 179334; k = 1991; }
      else if (k === 1750 && ppp2 > 1990) { dis += 88023; k = 1991; }

      dis += dayOfYear(k, 12, 31);
      k += 1;
    }
    dis += p2;
    dis *= pr;
  }
  return dis;
}

/** 두 시점 사이의 분(minutes) 계산 */
function minutesBetween(
  uy: number, umm: number, ud: number, uh: number, umin: number,
  y1: number, mo1: number, d1: number, h1: number, mm1: number,
): number {
  const dispday = daysBetween(uy, umm, ud, y1, mo1, d1);
  return dispday * 24 * 60 + (uh - h1) * 60 + (umin - mm1);
}

/** 분(tmin)으로부터 날짜 역산 */
function dateFromMinutes(
  tmin: number, uyear: number, umonth: number, uday: number,
  uhour: number, umin: number,
): [number, number, number, number, number] {
  let y1: number, mo1: number, d1: number, h1: number, mi1: number;
  let t: number;

  y1 = uyear - div(tmin, 525949);

  if (tmin > 0) {
    y1 += 2;
    while (true) {
      y1 -= 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, 1, 1, 0, 0);
      if (t >= tmin) break;
    }

    mo1 = 13;
    while (true) {
      mo1 -= 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, 1, 0, 0);
      if (t >= tmin) break;
    }

    d1 = 32;
    while (true) {
      d1 -= 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, 0, 0);
      if (t >= tmin) break;
    }

    h1 = 24;
    while (true) {
      h1 -= 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
      if (t >= tmin) break;
    }

    t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    mi1 = t - tmin;
  } else {
    y1 -= 2;
    while (true) {
      y1 += 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, 1, 1, 0, 0);
      if (t < tmin) break;
    }

    y1 -= 1;
    mo1 = 0;
    while (true) {
      mo1 += 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, 1, 0, 0);
      if (t < tmin) break;
    }

    mo1 -= 1;
    d1 = 0;
    while (true) {
      d1 += 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, 0, 0);
      if (t < tmin) break;
    }

    d1 -= 1;
    h1 = -1;
    while (true) {
      h1 += 1;
      t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
      if (t < tmin) break;
    }

    h1 -= 1;
    t = minutesBetween(uyear, umonth, uday, uhour, umin, y1, mo1, d1, h1, 0);
    mi1 = t - tmin;
  }

  return [y1, mo1, d1, h1, mi1];
}

// =============================================
// 핵심: 사주 인덱스 계산 (sydtoso24yd 포팅)
// =============================================

/**
 * 그레고리력 → 60갑자 인덱스 [연주, 월주, 일주, 시주]
 *
 * @returns [so24(60년 배수), so24year, so24month, so24day, so24hour]
 */
export function calcPillarIndices(
  year: number, month: number, day: number, hour: number, min: number,
): [number, number, number, number, number] {
  const displ2min = minutesBetween(
    UNIT.year, UNIT.month, UNIT.day, UNIT.hour, UNIT.min,
    year, month, day, hour, min,
  );
  const displ2day = daysBetween(
    UNIT.year, UNIT.month, UNIT.day, year, month, day,
  );

  // 경과 연수
  let so24 = div(displ2min, 525949);
  if (displ2min >= 0) so24 += 1;

  // 년주
  let so24year = (so24 % 60) * -1 + 12;
  if (so24year < 0) so24year += 60;
  else if (so24year > 59) so24year -= 60;

  // 월주
  let monthmin100 = displ2min % 525949;
  monthmin100 = 525949 - monthmin100;
  if (monthmin100 < 0) monthmin100 += 525949;
  else if (monthmin100 >= 525949) monthmin100 -= 525949;

  let so24monthIdx = 0;
  for (let i = 0; i < 12; i++) {
    const j = i * 2;
    if (MONTH[j] <= monthmin100 && monthmin100 < MONTH[j + 2]) {
      so24monthIdx = i;
    }
  }

  let t = so24year % 10;
  t = t % 5;
  t = t * 12 + 2 + so24monthIdx;
  let so24month = t;
  if (so24month > 59) so24month -= 60;

  // 일주
  let so24day = displ2day % 60;
  so24day = so24day * -1 + 7;
  if (so24day < 0) so24day += 60;
  else if (so24day > 59) so24day -= 60;

  // 시주
  let i: number;
  if (hour === 0 || (hour === 1 && min < 30)) {
    i = 0;
  } else if ((hour === 1 && min >= 30) || hour === 2 || (hour === 3 && min < 30)) {
    i = 1;
  } else if ((hour === 3 && min >= 30) || hour === 4 || (hour === 5 && min < 30)) {
    i = 2;
  } else if ((hour === 5 && min >= 30) || hour === 6 || (hour === 7 && min < 30)) {
    i = 3;
  } else if ((hour === 7 && min >= 30) || hour === 8 || (hour === 9 && min < 30)) {
    i = 4;
  } else if ((hour === 9 && min >= 30) || hour === 10 || (hour === 11 && min < 30)) {
    i = 5;
  } else if ((hour === 11 && min >= 30) || hour === 12 || (hour === 13 && min < 30)) {
    i = 6;
  } else if ((hour === 13 && min >= 30) || hour === 14 || (hour === 15 && min < 30)) {
    i = 7;
  } else if ((hour === 15 && min >= 30) || hour === 16 || (hour === 17 && min < 30)) {
    i = 8;
  } else if ((hour === 17 && min >= 30) || hour === 18 || (hour === 19 && min < 30)) {
    i = 9;
  } else if ((hour === 19 && min >= 30) || hour === 20 || (hour === 21 && min < 30)) {
    i = 10;
  } else if ((hour === 21 && min >= 30) || hour === 22 || (hour === 23 && min < 30)) {
    i = 11;
  } else {
    // hour === 23 && min >= 30
    so24day += 1;
    if (so24day === 60) so24day = 0;
    i = 0;
  }

  t = so24day % 10;
  t = t % 5;
  t = t * 12 + i;
  const so24hour = t;

  return [so24, so24year, so24month, so24day, so24hour];
}

// =============================================
// 절기 시간 계산 (solortoso24 포팅)
// =============================================

/**
 * 절기 시간 구하기 - 입기, 중기, 출기 날짜/시각
 */
export function calcSolarTerms(
  year: number, month: number, day: number, hour: number, min: number,
): {
  ingiName: number; ingiYear: number; ingiMonth: number; ingiDay: number; ingiHour: number; ingiMin: number;
  midName: number; midYear: number; midMonth: number; midDay: number; midHour: number; midMin: number;
  outgiName: number; outgiYear: number; outgiMonth: number; outgiDay: number; outgiHour: number; outgiMin: number;
} {
  const [, , so24month] = calcPillarIndices(year, month, day, hour, min);

  const displ2min = minutesBetween(
    UNIT.year, UNIT.month, UNIT.day, UNIT.hour, UNIT.min,
    year, month, day, hour, min,
  );

  let monthmin100 = (displ2min % 525949) * -1;
  if (monthmin100 < 0) monthmin100 += 525949;
  else if (monthmin100 >= 525949) monthmin100 -= 525949;

  let ii = so24month % 12 - 2;
  if (ii === -2) ii = 10;
  else if (ii === -1) ii = 11;

  const ingiName = ii * 2;
  const midName = ii * 2 + 1;
  const outgiName = ii * 2 + 2;

  const j = ii * 2;
  let tmin = displ2min + (monthmin100 - MONTH[j]);
  const [ingiYear, ingiMonth, ingiDay, ingiHour, ingiMin] = dateFromMinutes(
    tmin, UNIT.year, UNIT.month, UNIT.day, UNIT.hour, UNIT.min,
  );

  tmin = displ2min + (monthmin100 - MONTH[j + 1]);
  const [midYear, midMonth, midDay, midHour, midMin] = dateFromMinutes(
    tmin, UNIT.year, UNIT.month, UNIT.day, UNIT.hour, UNIT.min,
  );

  tmin = displ2min + (monthmin100 - MONTH[j + 2]);
  const [outgiYear, outgiMonth, outgiDay, outgiHour, outgiMin] = dateFromMinutes(
    tmin, UNIT.year, UNIT.month, UNIT.day, UNIT.hour, UNIT.min,
  );

  return {
    ingiName, ingiYear, ingiMonth, ingiDay, ingiHour, ingiMin,
    midName, midYear, midMonth, midDay, midHour, midMin,
    outgiName, outgiYear, outgiMonth, outgiDay, outgiHour, outgiMin,
  };
}

// =============================================
// 4주 계산 API
// =============================================

/** 4주를 60갑자 문자열로 반환 [년주, 월주, 일주, 시주] */
export function getFourPillars(
  year: number, month: number, day: number, hour: number, minute: number,
): [string, string, string, string] {
  const [, y, m, d, h] = calcPillarIndices(year, month, day, hour, minute);
  return [HGANJI[y], HGANJI[m], HGANJI[d], HGANJI[h]];
}

// =============================================
// 대운 계산
// =============================================

/** 대운 10개 계산 */
export function getDaewoon(
  isMale: boolean,
  year: number, month: number, day: number, hour: number, minute: number,
): Array<{ ganzi: string; startDate: Date }> {
  const [, sy, sm] = calcPillarIndices(year, month, day, hour, minute);

  // 순행/역행 결정
  const yearStem = HGANJI[sy][0];
  const isYangGan = YANGGAN.includes(yearStem);
  const order = (isMale && isYangGan) || (!isMale && !isYangGan);

  // 절기 시간 계산
  const terms = calcSolarTerms(year, month, day, hour, minute);

  const d0 = order
    ? new Date(terms.outgiYear, terms.outgiMonth - 1, terms.outgiDay, terms.outgiHour, terms.outgiMin)
    : new Date(terms.ingiYear, terms.ingiMonth - 1, terms.ingiDay, terms.ingiHour, terms.ingiMin);

  const birth = new Date(year, month - 1, day, hour, minute);
  const diff = birth.getTime() - d0.getTime();
  const secondsToFirst = Math.abs(diff / 1000 * 365.242196 / 3.0);

  let nextDate = new Date(birth.getTime() + secondsToFirst * 1000);
  nextDate.setMilliseconds(0);

  const flow = order ? 1 : -1;
  let mIdx = sm;

  const ret: Array<{ ganzi: string; startDate: Date }> = [];
  for (let i = 0; i < 10; i++) {
    mIdx = mIdx + flow;
    if (mIdx >= HGANJI.length) mIdx = 0;
    if (mIdx < 0) mIdx = HGANJI.length - 1;
    ret.push({ ganzi: HGANJI[mIdx], startDate: new Date(nextDate) });

    // 다음 대운은 10년 후
    nextDate = new Date(nextDate);
    nextDate.setFullYear(nextDate.getFullYear() + 10);
  }

  return ret;
}

// =============================================
// Symbol 로직 (십신 계산)
// =============================================

type InteractionType = 'same' | 'output' | 'input' | 'shield' | 'sword';

function getInteraction(e0: string, e1: string): InteractionType | null {
  if (e0 === e1) return 'same';

  // 상생 (output)
  if ((e0 === 'water' && e1 === 'tree') ||
      (e0 === 'tree' && e1 === 'fire') ||
      (e0 === 'fire' && e1 === 'earth') ||
      (e0 === 'earth' && e1 === 'metal') ||
      (e0 === 'metal' && e1 === 'water')) return 'output';

  // 상생 역방향 (input)
  if ((e0 === 'water' && e1 === 'metal') ||
      (e0 === 'tree' && e1 === 'water') ||
      (e0 === 'fire' && e1 === 'tree') ||
      (e0 === 'earth' && e1 === 'fire') ||
      (e0 === 'metal' && e1 === 'earth')) return 'input';

  // 상극 (shield - 나를 극하는)
  if ((e0 === 'water' && e1 === 'earth') ||
      (e0 === 'tree' && e1 === 'metal') ||
      (e0 === 'fire' && e1 === 'water') ||
      (e0 === 'earth' && e1 === 'tree') ||
      (e0 === 'metal' && e1 === 'fire')) return 'shield';

  // 상극 (sword - 내가 극하는)
  if ((e0 === 'water' && e1 === 'fire') ||
      (e0 === 'tree' && e1 === 'earth') ||
      (e0 === 'fire' && e1 === 'metal') ||
      (e0 === 'earth' && e1 === 'water') ||
      (e0 === 'metal' && e1 === 'tree')) return 'sword';

  return null;
}

/** 일간 기준 십신 계산 */
export function getRelation(dayStem: string, targetStem: string): Relation | null {
  const day = STEM_INFO[dayStem];
  const target = STEM_INFO[targetStem];
  if (!day || !target) return null;

  const interaction = getInteraction(day.element, target.element);
  if (!interaction) return null;

  const sameYY = day.yinyang === target.yinyang;

  switch (interaction) {
    case 'same': return sameYY ? RELATIONS[0] : RELATIONS[1];
    case 'output': return sameYY ? RELATIONS[2] : RELATIONS[3];
    case 'sword': return sameYY ? RELATIONS[4] : RELATIONS[5];
    case 'shield': return sameYY ? RELATIONS[6] : RELATIONS[7];
    case 'input': return sameYY ? RELATIONS[8] : RELATIONS[9];
  }
}

// =============================================
// 지장간, 12운성
// =============================================

/** 지장간 반환 */
export function getHiddenStems(branch: string): string {
  return JIJANGGAN[branch] || '';
}

/** 지장간의 정기 (마지막 글자) */
export function getJeonggi(branch: string): string {
  const jijang = getHiddenStems(branch);
  return jijang.replace(/ /g, '').slice(-1);
}

/** 한자를 한글로 변환 */
export function toHangul(hanja: string): string {
  const skyIdx = SKY.indexOf(hanja);
  if (skyIdx >= 0) return SKY_KR[skyIdx];
  const earthIdx = EARTH.indexOf(hanja);
  if (earthIdx >= 0) return EARTH_KR[earthIdx];
  return hanja;
}

/** 12운성 계산 */
export function getTwelveMeteor(stem: string, branch: string): string {
  const stemKr = toHangul(stem);
  const branchKr = toHangul(branch);
  const key = stemKr + branchKr;
  const idx = METEOR_LOOKUP[key];
  if (idx !== undefined) return METEORS_12[idx].hanja;
  return '?';
}

/** 12신살 시작 지지 (삼합 그룹별 劫殺 위치) */
const SPIRIT_START: Record<string, number> = {
  '寅': 11, '午': 11, '戌': 11,  // 亥
  '巳': 2,  '酉': 2,  '丑': 2,   // 寅
  '申': 5,  '子': 5,  '辰': 5,   // 巳
  '亥': 8,  '卯': 8,  '未': 8,   // 申
};

/** 12신살 계산 (년지 기준) */
export function getTwelveSpirit(yearBranch: string, targetBranch: string): string {
  const start = SPIRIT_START[yearBranch];
  if (start === undefined) return '?';
  const targetIdx = EARTH.indexOf(targetBranch);
  if (targetIdx < 0) return '?';
  const offset = ((targetIdx - start) % 12 + 12) % 12;
  return SPIRITS_12[offset].hanja;
}

// =============================================
// 합충형파해 관계
// =============================================

function lookupPair(table: Record<string, unknown>, a: string, b: string): unknown | undefined {
  return table[`${a},${b}`] ?? table[`${b},${a}`];
}

/** 천간 관계 */
export function getStemRelation(stem1: string, stem2: string): RelationResult[] {
  const results: RelationResult[] = [];

  const combine = lookupPair(STEM_COMBINES, stem1, stem2) as [string, string] | undefined;
  if (combine) results.push({ type: combine[0], detail: combine[1] });

  const clash = lookupPair(STEM_CLASHES, stem1, stem2) as string | undefined;
  if (clash) results.push({ type: clash, detail: null });

  return results;
}

/** 지지 관계 */
export function getBranchRelation(branch1: string, branch2: string): RelationResult[] {
  const results: RelationResult[] = [];

  const combine = lookupPair(BRANCH_COMBINES_6, branch1, branch2) as [string, string] | undefined;
  if (combine) results.push({ type: combine[0], detail: combine[1] });

  const half = lookupPair(HALF_COMPOSES, branch1, branch2) as [string, string] | undefined;
  if (half) results.push({ type: half[0], detail: half[1] });

  const clash = lookupPair(BRANCH_CLASHES, branch1, branch2) as string | undefined;
  if (clash) results.push({ type: clash, detail: null });

  const brk = lookupPair(BRANCH_BREAKS, branch1, branch2) as string | undefined;
  if (brk) results.push({ type: brk, detail: null });

  const harm = lookupPair(BRANCH_HARMS, branch1, branch2) as string | undefined;
  if (harm) results.push({ type: harm, detail: null });

  // 형 (방향성 있음)
  const pKey1 = `${branch1},${branch2}`;
  const pKey2 = `${branch2},${branch1}`;
  if (BRANCH_PUNISHMENTS[pKey1]) {
    const [t, d] = BRANCH_PUNISHMENTS[pKey1];
    results.push({ type: t, detail: d });
  } else if (BRANCH_PUNISHMENTS[pKey2]) {
    const [t, d] = BRANCH_PUNISHMENTS[pKey2];
    results.push({ type: t, detail: d });
  }

  // 자형
  if (branch1 === branch2 && BRANCH_SELF_PUNISHMENTS.has(branch1)) {
    results.push({ type: '刑', detail: '自刑' });
  }

  // 원진
  const wonjin = lookupPair(BRANCH_WONJIN, branch1, branch2) as string | undefined;
  if (wonjin) results.push({ type: wonjin, detail: null });

  // 귀문관살
  const gwimun = lookupPair(BRANCH_GWIMUN, branch1, branch2) as string | undefined;
  if (gwimun) results.push({ type: gwimun, detail: null });

  return results;
}

/** 두 주 사이의 관계 분석 */
export function analyzePillarRelations(pillar1: string, pillar2: string): PairRelation {
  return {
    stem: getStemRelation(pillar1[0], pillar2[0]),
    branch: getBranchRelation(pillar1[1], pillar2[1]),
  };
}

/** 삼합 검사 */
export function checkTripleCompose(branches: string[]): RelationResult[] {
  const results: RelationResult[] = [];
  const branchSet = new Set(branches);

  for (const triple of TRIPLE_COMPOSES) {
    if (triple.every(b => branchSet.has(b))) {
      const key = triple.join(',');
      results.push({ type: '三合', detail: TRIPLE_COMPOSE_ELEMENTS[key] });
    }
  }

  return results;
}

/** 방합 검사 */
export function checkDirectionalCompose(branches: string[]): RelationResult[] {
  const results: RelationResult[] = [];
  const branchSet = new Set(branches);

  for (const dir of DIRECTIONAL_COMPOSES) {
    if (dir.every(b => branchSet.has(b))) {
      const key = dir.join(',');
      results.push({ type: '方合', detail: DIRECTIONAL_COMPOSE_ELEMENTS[key] });
    }
  }

  return results;
}

/** 모든 주 관계 분석 */
export function analyzeAllRelations(pillars: string[]): AllRelations {
  const pairs = new Map<string, PairRelation>();

  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const rel = analyzePillarRelations(pillars[i], pillars[j]);
      if (rel.stem.length > 0 || rel.branch.length > 0) {
        pairs.set(`${i},${j}`, rel);
      }
    }
  }

  const branches = pillars.map(p => p[1]);

  return {
    pairs,
    triple: checkTripleCompose(branches),
    directional: checkDirectionalCompose(branches),
  };
}

// =============================================
// 신살
// =============================================

export function getSpecialSals(
  stems: string[], branches: string[], dayPillar: string,
): SpecialSals {
  const dayStem = stems[1];
  const dayBranch = branches[1];
  const monthBranch = branches[2];

  // 양인살
  const yanginBranch = YANGIN_MAP[dayStem];
  const yangin = yanginBranch
    ? branches.reduce<number[]>((acc, b, i) => { if (b === yanginBranch) acc.push(i); return acc; }, [])
    : [];

  // 도화살 (일지 삼합 기준)
  const dohwaBranch = DOHWA_MAP[dayBranch];
  const dohwa = dohwaBranch
    ? branches.reduce<number[]>((acc, b, i) => { if (i !== 1 && b === dohwaBranch) acc.push(i); return acc; }, [])
    : [];

  // 천을귀인 (일간 기준)
  const cheonulBranches = CHEONUL_MAP[dayStem] ?? [];
  const cheonul = branches.reduce<number[]>((acc, b, i) => {
    if (cheonulBranches.includes(b)) acc.push(i);
    return acc;
  }, []);

  // 천덕귀인 (월지 기준, 천간 또는 지지에서 탐색)
  const cheondukChar = CHEONDUK_MAP[monthBranch];
  const cheonduk = cheondukChar
    ? [...stems, ...branches].reduce<number[]>((acc, ch, i) => {
        if (ch === cheondukChar) acc.push(i % 4); // stems[0..3], branches[0..3] → pillar index
        return acc;
      }, []).filter((v, i, a) => a.indexOf(v) === i) // deduplicate
    : [];

  // 월덕귀인 (월지 기준, 천간에서 탐색)
  const woldukChar = WOLDUK_MAP[monthBranch];
  const wolduk = woldukChar
    ? stems.reduce<number[]>((acc, s, i) => { if (s === woldukChar) acc.push(i); return acc; }, [])
    : [];

  // 문창귀인 (일간 기준)
  const munchangBranch = MUNCHANG_MAP[dayStem];
  const munchang = munchangBranch
    ? branches.reduce<number[]>((acc, b, i) => { if (b === munchangBranch) acc.push(i); return acc; }, [])
    : [];

  // 금여록 (일간 기준)
  const geumyeoBranch = GEUMYEO_MAP[dayStem];
  const geumyeo = geumyeoBranch
    ? branches.reduce<number[]>((acc, b, i) => { if (b === geumyeoBranch) acc.push(i); return acc; }, [])
    : [];

  return {
    yangin,
    baekho: BAEKHO_PILLARS.has(dayPillar),
    goegang: GOEGANG_PILLARS.has(dayPillar),
    dohwa,
    cheonul,
    cheonduk,
    wolduk,
    munchang,
    hongyeom: HONGYEOM_PILLARS.has(dayPillar),
    geumyeo,
  };
}

// =============================================
// 트랜짓 (운세)
// =============================================

const IMPORTANT_RELATIONS = new Set(['合', '沖', '刑']);

/** N개월간의 일운/월운과 사주의 관계를 찾음 */
export function findTransits(
  natalPillars: string[],
  months: number = 1,
  backward: boolean = false,
): TransitItem[] {
  const results: TransitItem[] = [];
  const today = new Date();
  const msPerDay = 86400000;
  const endDate = new Date(today.getTime() + (backward ? -1 : 1) * months * 30 * msPerDay);

  let prevMonthPillar: string | null = null;

  const current = new Date(today);
  const step = backward ? -msPerDay : msPerDay;

  while (backward ? current >= endDate : current <= endDate) {
    const [yearP, monthP, dayP] = getFourPillars(
      current.getFullYear(), current.getMonth() + 1, current.getDate(), 12, 0,
    );

    // 월운 변경 감지
    if (monthP !== prevMonthPillar) {
      if (prevMonthPillar !== null) {
        for (let i = 0; i < natalPillars.length; i++) {
          const rel = analyzePillarRelations(monthP, natalPillars[i]);
          const allRels: Array<{ prefix: string; relation: RelationResult }> = [];
          for (const r of rel.stem) {
            if (IMPORTANT_RELATIONS.has(r.type)) allRels.push({ prefix: '천간', relation: r });
          }
          for (const r of rel.branch) {
            if (IMPORTANT_RELATIONS.has(r.type)) allRels.push({ prefix: '지지', relation: r });
          }
          if (allRels.length > 0) {
            results.push({
              date: new Date(current),
              type: '月運',
              transit: monthP,
              natalName: PILLAR_NAMES[i],
              relations: allRels,
            });
          }
        }
      }
      prevMonthPillar = monthP;
    }

    // 일운
    for (let i = 0; i < natalPillars.length; i++) {
      const rel = analyzePillarRelations(dayP, natalPillars[i]);
      const allRels: Array<{ prefix: string; relation: RelationResult }> = [];
      for (const r of rel.stem) {
        if (IMPORTANT_RELATIONS.has(r.type)) allRels.push({ prefix: '천간', relation: r });
      }
      for (const r of rel.branch) {
        if (IMPORTANT_RELATIONS.has(r.type)) allRels.push({ prefix: '지지', relation: r });
      }
      if (allRels.length > 0) {
        results.push({
          date: new Date(current),
          type: '日運',
          transit: dayP,
          natalName: PILLAR_NAMES[i],
          relations: allRels,
        });
      }
    }

    current.setTime(current.getTime() + step);
  }

  results.sort((a, b) => {
    const timeDiff = a.date.getTime() - b.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    return (a.type === '日運' ? 1 : 0) - (b.type === '日運' ? 1 : 0);
  });

  return results;
}
