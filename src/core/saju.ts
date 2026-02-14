/**
 * 사주 결과 조립 (saju.py 로직 포팅)
 */
import {
  getFourPillars, getDaewoon, getRelation, getJeonggi,
  getTwelveMeteor, getTwelveSpirit, getHiddenStems, analyzeAllRelations, getSpecialSals,
} from './pillars.ts';
import { STEM_INFO } from './constants.ts';
import type {
  BirthInput, SajuResult, PillarDetail, Pillar, DaewoonItem,
} from './types.ts';

/** 천간 → 십신 (한자) */
function getSipsin(dayStem: string, targetStem: string): string {
  const rel = getRelation(dayStem, targetStem);
  return rel ? rel.hanja : '?';
}

/** BirthInput → SajuResult */
export function calculateSaju(input: BirthInput): SajuResult {
  const { year, month, day, hour, minute, gender } = input;
  const isMale = gender === 'M';

  // 사주 계산 (년, 월, 일, 시)
  const [yp, mp, dp, hp] = getFourPillars(year, month, day, hour, minute);

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

  // 대운 계산
  const rawDaewoon = input.unknownTime
    ? []
    : getDaewoon(isMale, year, month, day, hour, minute);

  const yearBranch = yp[1];

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
    };
  });

  // 팔자 관계
  const relations = analyzeAllRelations(ganzis);

  // 신살
  const specialSals = getSpecialSals(dayStem, dp, branches);

  return {
    input,
    pillars,
    daewoon,
    relations,
    specialSals,
  };
}
