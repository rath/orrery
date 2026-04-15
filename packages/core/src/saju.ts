/**
 * 사주 결과 조립
 */
import {
  getFourPillars, getDaewoon, getRelation, getJeonggi,
  getTwelveMeteor, getTwelveSpirit, getHiddenStems, analyzeAllRelations, getSpecialSals,
  calculateJwabeop, calculateInjongbeop, getGongmang,
} from './pillars.ts';
import { STEM_INFO } from './constants.ts';
import {
  adjustBirthInputToSolarTime,
  adjustBirthInputToKstWallClock,
  DEFAULT_TIMEZONE,
} from './timezone.ts';
import type {
  BirthInput, SajuResult, PillarDetail, Pillar, DaewoonItem, Gongmang,
} from './types.ts';

/** 천간 → 십신 (한자) */
function getSipsin(dayStem: string, targetStem: string): string {
  const rel = getRelation(dayStem, targetStem);
  return rel ? rel.hanja : '?';
}

/** BirthInput → SajuResult */
export function calculateSaju(input: BirthInput): SajuResult {
  // Asia/Seoul(또는 미지정) 출생은 KST(+9) 벽시계를 기준으로 하는 한국 사주 관례를 유지하기 위해
  // 경도 기반 진태양시 보정을 건너뛰고, IANA Asia/Seoul 오프셋을 이용한 KST 벽시계 정규화만
  // 적용한다. 이 경로는 1948-1951 KDT, 1954-1961 UTC+8:30/+9:30, 1987-1988 KDT 등
  // 한국 표준시 역사적 편차를 ICU/tzdb 기반으로 모두 자동 흡수한다.
  const useSolarTime = input.timezone != null && input.timezone !== DEFAULT_TIMEZONE;
  const { year, month, day, hour, minute } = useSolarTime
    ? adjustBirthInputToSolarTime(input)
    : adjustBirthInputToKstWallClock(input);
  const { gender } = input;
  const isMale = gender === 'M';

  // 사주 계산 (년, 월, 일, 시)
  const [yp, mp, dp, hp] = getFourPillars(year, month, day, hour, minute, input.jasiMethod);

  // 일간 (일주의 천간)
  const dayStem = dp[0];

  // 각 주의 천간/지지 (시 일 월 년 순서)
  const stems = [hp[0], dp[0], mp[0], yp[0]];
  const branches = [hp[1], dp[1], mp[1], yp[1]];
  const ganzis = [hp, dp, mp, yp];

  // 주별 상세 정보 조립
  const pillars: PillarDetail[] = ganzis.map((ganzi, i) => {
    const stem = stems[i];
    const branch = branches[i];

    // 천간 십신
    let stemSipsin = getSipsin(dayStem, stem);
    if (i === 1) stemSipsin = '本元'; // 일간 본인

    // 지지 십신 (지장간 정기)
    const jeonggi = getJeonggi(branch);
    const branchSipsin = getSipsin(dayStem, jeonggi);

    // 12운성
    const unseong = getTwelveMeteor(dayStem, branch);

    // 12신살 (연지 기준)
    const sinsal = getTwelveSpirit(yp[1], branch);

    // 지장간
    const jigang = getHiddenStems(branch);

    const pillar: Pillar = { ganzi, stem, branch };

    return {
      pillar,
      stemSipsin,
      branchSipsin,
      unseong,
      sinsal,
      jigang,
    };
  });

  // 대운 계산 (시간 모름이면 정오 기준)
  const dwHour = input.unknownTime ? 12 : hour;
  const dwMinute = input.unknownTime ? 0 : minute;
  const rawDaewoon = getDaewoon(isMale, year, month, day, dwHour, dwMinute, input.jasiMethod);

  const yearBranch = yp[1];

  // 공망 계산
  const gmBranches = getGongmang(dp);
  const gmSet = new Set(gmBranches);
  const gongmang: Gongmang = {
    branches: gmBranches,
    pillarIndices: branches.reduce<number[]>((acc, b, i) => {
      if (i !== 1 && gmSet.has(b)) acc.push(i);  // 일주 자신은 제외
      return acc;
    }, []),
  };

  const daewoon: DaewoonItem[] = rawDaewoon.map((dw, i) => {
    const age = dw.startDate.getFullYear() - year;
    const dwStem = dw.ganzi[0];
    const dwBranch = dw.ganzi[1];
    const dwStemSipsin = getSipsin(dayStem, dwStem);
    const dwBranchJeonggi = getJeonggi(dwBranch);
    const dwBranchSipsin = getSipsin(dayStem, dwBranchJeonggi);
    const unseong = getTwelveMeteor(dayStem, dwBranch);
    const sinsal = getTwelveSpirit(yearBranch, dwBranch);

    return {
      index: i + 1,
      ganzi: dw.ganzi,
      startDate: dw.startDate,
      age,
      stemSipsin: dwStemSipsin,
      branchSipsin: dwBranchSipsin,
      unseong,
      sinsal,
      isGongmang: gmSet.has(dwBranch),
    };
  });

  // 팔자 관계
  const relations = analyzeAllRelations(ganzis);

  // 신살
  const specialSals = getSpecialSals(stems, branches, dp);

  // 좌법 · 인종법
  const dayBranch = dp[1];
  const jwabeop = calculateJwabeop(dayStem, branches, dayBranch);
  const injongbeop = calculateInjongbeop(dayStem, dayBranch);

  return {
    input,
    pillars,
    daewoon,
    relations,
    specialSals,
    gongmang,
    jwabeop,
    injongbeop,
  };
}
