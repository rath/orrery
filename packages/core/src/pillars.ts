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
  JIJANGGAN, METEOR_LOOKUP, PILLAR_NAMES, GONGMANG_TABLE,
} from './constants.ts';
import type {
  Element, Relation, RelationResult, PairRelation, AllRelations, SpecialSals,
  TransitItem, JwaEntry, InjongEntry, JasiMethod,
} from './types.ts';
import { assertDateTime, civilDateToUtc } from './validation.ts';
import { getSolarTermPeriod } from './solar-terms.ts';

/** Calendar fields are local wall time; utcDate supplies the actual solar-term instant. */
export interface PillarCalculationOptions {
  utcDate?: Date;
  /** Already corrected to true solar time: do not apply Korea's extra 30-minute offset. */
  trueSolarTime?: boolean;
}

const mod = (value: number, base: number) => ((value % base) + base) % base;
const DAY_MS = 86_400_000;
const KST_MS = 9 * 3_600_000;
const DAY_REFERENCE = civilDateToUtc(1996, 2, 4).getTime();

function calculationInstant(
  year: number, month: number, day: number, hour: number, minute: number,
  options?: PillarCalculationOptions,
): number {
  assertDateTime(year, month, day, hour, minute);
  const instant = options?.utcDate?.getTime()
    ?? civilDateToUtc(year, month, day, hour, minute).getTime() - KST_MS;
  if (!Number.isFinite(instant)) throw new RangeError('Invalid calculation instant');
  return instant;
}

/** Gregorian wall clock → [year offset from 1996, year, month, day, hour indices]. */
export function calcPillarIndices(
  year: number, month: number, day: number, hour: number, min: number,
  jasiMethod?: JasiMethod, options?: PillarCalculationOptions,
): [number, number, number, number, number] {
  const instant = calculationInstant(year, month, day, hour, min, options);
  const { astrologyYear, previous } = getSolarTermPeriod(instant);
  const yearIndex = mod(astrologyYear - 4, 60);
  const monthIndex = mod((yearIndex % 10 % 5) * 12 + 2 + previous.index / 2, 60);
  const days = Math.round((civilDateToUtc(year, month, day).getTime() - DAY_REFERENCE) / DAY_MS);
  let dayIndex = mod(7 + days, 60);
  const offset = options?.trueSolarTime ? 0 : 30;
  const hourIndex = mod(Math.floor((hour * 60 + min - offset + 60) / 120), 12);
  const lateZi = hour * 60 + min >= 23 * 60 + offset;
  if (lateZi && jasiMethod !== 'split') dayIndex = mod(dayIndex + 1, 60);
  const dayForHour = lateZi && jasiMethod === 'split' ? mod(dayIndex + 1, 60) : dayIndex;
  const hourPillarIndex = (dayForHour % 10 % 5) * 12 + hourIndex;
  return [1996 - astrologyYear, yearIndex, monthIndex, dayIndex, hourPillarIndex];
}

/** Astronomical entry/mid/exit solar terms, returned as fixed UTC+9 wall-clock fields. */
export function calcSolarTerms(
  year: number, month: number, day: number, hour: number, min: number,
): {
  ingiName: number; ingiYear: number; ingiMonth: number; ingiDay: number; ingiHour: number; ingiMin: number;
  midName: number; midYear: number; midMonth: number; midDay: number; midHour: number; midMin: number;
  outgiName: number; outgiYear: number; outgiMonth: number; outgiDay: number; outgiHour: number; outgiMin: number;
} {
  const period = getSolarTermPeriod(calculationInstant(year, month, day, hour, min));
  const entry = new Date(period.previous.utcMs + KST_MS);
  const mid = new Date(period.middle.utcMs + KST_MS);
  const exit = new Date(period.next.utcMs + KST_MS);
  return {
    ingiName: period.previous.index,
    ingiYear: entry.getUTCFullYear(), ingiMonth: entry.getUTCMonth() + 1, ingiDay: entry.getUTCDate(),
    ingiHour: entry.getUTCHours(), ingiMin: entry.getUTCMinutes(),
    midName: period.middle.index,
    midYear: mid.getUTCFullYear(), midMonth: mid.getUTCMonth() + 1, midDay: mid.getUTCDate(),
    midHour: mid.getUTCHours(), midMin: mid.getUTCMinutes(),
    outgiName: period.previous.index + 2,
    outgiYear: exit.getUTCFullYear(), outgiMonth: exit.getUTCMonth() + 1, outgiDay: exit.getUTCDate(),
    outgiHour: exit.getUTCHours(), outgiMin: exit.getUTCMinutes(),
  };
}

/** Four pillars [year, month, day, hour]. Default input is fixed UTC+9 Korean wall time. */
export function getFourPillars(
  year: number, month: number, day: number, hour: number, minute: number,
  jasiMethod?: JasiMethod, options?: PillarCalculationOptions,
): [string, string, string, string] {
  const [, y, m, d, h] = calcPillarIndices(year, month, day, hour, minute, jasiMethod, options);
  return [HGANJI[y], HGANJI[m], HGANJI[d], HGANJI[h]];
}

/** Ten luck cycles; civil start dates are stored in UTC fields. */
export function getDaewoon(
  isMale: boolean,
  year: number, month: number, day: number, hour: number, minute: number,
  jasiMethod?: JasiMethod, options?: PillarCalculationOptions,
): Array<{ ganzi: string; startDate: Date }> {
  const [, sy, sm] = calcPillarIndices(year, month, day, hour, minute, jasiMethod, options);
  const isYangGan = YANGGAN.includes(HGANJI[sy][0]);
  const forward = (isMale && isYangGan) || (!isMale && !isYangGan);
  const instant = calculationInstant(year, month, day, hour, minute, options);
  const period = getSolarTermPeriod(instant);
  const term = forward ? period.next : period.previous;
  const elapsed = Math.abs(instant - term.utcMs);
  const birth = civilDateToUtc(year, month, day, hour, minute);
  const first = new Date(birth.getTime() + elapsed * 365.242196 / 3);
  first.setUTCMilliseconds(0);
  return Array.from({ length: 10 }, (_, i) => {
    const startDate = new Date(first);
    startDate.setUTCFullYear(first.getUTCFullYear() + i * 10);
    return { ganzi: HGANJI[mod(sm + (forward ? 1 : -1) * (i + 1), 60)], startDate };
  });
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
// 좌법 · 인종법
// =============================================

/** 오행 → 양간 매핑 */
const YANG_STEM_OF: Record<Element, string> = {
  tree: '甲', fire: '丙', earth: '戊', metal: '庚', water: '壬',
};

/** 5가지 십성 카테고리 */
const SIPSIN_CATEGORIES: Array<{ name: string; interactions: string[] }> = [
  { name: '比劫', interactions: ['same'] },
  { name: '食傷', interactions: ['output'] },
  { name: '財星', interactions: ['sword'] },
  { name: '官星', interactions: ['shield'] },
  { name: '印星', interactions: ['input'] },
];

/** 좌법 계산: 각 주 지장간 → 일지에서의 운성 */
export function calculateJwabeop(
  dayStem: string, branches: string[], dayBranch: string,
): JwaEntry[][] {
  return branches.map(branch => {
    const hidden = getHiddenStems(branch).replace(/ /g, '');
    return [...hidden].map(stem => {
      const rel = getRelation(dayStem, stem);
      const sipsin = rel ? rel.hanja : '?';
      const unseong = getTwelveMeteor(stem, dayBranch);
      return { stem, sipsin, unseong };
    });
  });
}

/** 인종법 계산: 일지 지장간에 없는 십성 카테고리의 양간 인종 */
export function calculateInjongbeop(
  dayStem: string, dayBranch: string,
): InjongEntry[] {
  const dayInfo = STEM_INFO[dayStem];
  if (!dayInfo) return [];

  // 일지 지장간에 존재하는 오행 interaction 수집
  const hidden = getHiddenStems(dayBranch).replace(/ /g, '');
  const presentInteractions = new Set<string>();
  for (const stem of hidden) {
    const info = STEM_INFO[stem];
    if (!info) continue;
    const interaction = getInteraction(dayInfo.element, info.element);
    if (interaction) presentInteractions.add(interaction);
  }

  // 누락 카테고리 → 양간 인종
  const result: InjongEntry[] = [];
  for (const cat of SIPSIN_CATEGORIES) {
    const missing = cat.interactions.every(i => !presentInteractions.has(i));
    if (!missing) continue;

    // 해당 카테고리의 오행 찾기
    let targetElement: Element | null = null;
    for (const info of Object.values(STEM_INFO)) {
      if (info.yinyang !== '+') continue;
      const inter = getInteraction(dayInfo.element, info.element);
      if (inter && cat.interactions.includes(inter)) {
        targetElement = info.element;
        break;
      }
    }
    if (!targetElement) continue;

    const yangStem = YANG_STEM_OF[targetElement];
    const unseong = getTwelveMeteor(yangStem, dayBranch);
    result.push({ category: cat.name, yangStem, unseong });
  }

  return result;
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
// 세운 (歲運) — 연도별 간지
// =============================================

/** 연도 → 년주 간지 (60갑자 주기) */
export function getYearGanzi(year: number): string {
  return HGANJI[((12 + (year - 1996)) % 60 + 60) % 60];
}

// =============================================
// 공망 (空亡)
// =============================================

/** 일주(간지) 기준 공망 지지 2개 반환 */
export function getGongmang(dayGanzi: string): [string, string] {
  const idx = HGANJI.indexOf(dayGanzi);
  if (idx < 0) return ['', ''];
  return GONGMANG_TABLE[Math.trunc(idx / 10)];
}

// =============================================
// 트랜짓 (운세)
// =============================================

const IMPORTANT_RELATIONS = new Set(['合', '沖', '刑']);

/** N개월(1–120)간의 일운/월운과 사주의 관계를 찾음. 최대 4주. */
export function findTransits(
  natalPillars: string[],
  months: number = 1,
  backward: boolean = false,
): TransitItem[] {
  if (!Number.isInteger(months) || months < 1 || months > 120) {
    throw new RangeError('Transit months must be between 1 and 120');
  }
  if (!Array.isArray(natalPillars) || natalPillars.length > 4
    || natalPillars.some(p => p !== '??' && !HGANJI.includes(p))) {
    throw new RangeError('Expected at most four valid natal pillars');
  }
  const results: TransitItem[] = [];
  const today = new Date();
  const msPerDay = 86400000;
  const endDate = new Date(today.getTime() + (backward ? -1 : 1) * months * 30 * msPerDay);

  let prevMonthPillar: string | null = null;

  const current = new Date(today);
  const step = backward ? -msPerDay : msPerDay;

  while (backward ? current >= endDate : current <= endDate) {
    const [, monthP, dayP] = getFourPillars(
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
