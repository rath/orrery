/** 오행 (Five Elements) */
export type Element = 'tree' | 'fire' | 'earth' | 'metal' | 'water';

/** 음양 (Yin-Yang) */
export type YinYang = '+' | '-';

/** 성별 */
export type Gender = 'M' | 'F';

/** 자시법 (子時法) — 23:00~01:00 구간 일주 처리 방식 */
export type JasiMethod = 'split' | 'unified';
// 'split'   = 야자시 인정: 23:00~24:00 일주 당일 유지
// 'unified' = 통자시: 23:00부터 일주 다음날로 넘김

/** 생년월일시 입력 */
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  /** 시간 모름 여부 */
  unknownTime?: boolean;
  /** 자시법 (기본값: 'unified' 통자시) */
  jasiMethod?: JasiMethod;
  /** 위도 (기본값: 37.5194 서울) */
  latitude?: number;
  /** 경도 (기본값: 127.0992 서울) */
  longitude?: number;
  /**
   * IANA 타임존 ID (예: 'Asia/Seoul', 'America/Los_Angeles').
   * 생략 시 'Asia/Seoul'로 폴백되므로 한국 이외 출생지는 반드시 명시할 것
   * (누락 시 natal/saju/ziwei 전부 서울 기준으로 계산됨).
   * 'Asia/Seoul'(또는 미지정)은 KST 벽시계 기반 한국 사주 관례를 유지하고,
   * 그 외 타임존은 경도·균시차 기반 진태양시 보정을 적용한다.
   */
  timezone?: string;
}

/** 천간 정보 */
export interface StemInfo {
  name: string;     // 한자 (甲, 乙, ...)
  yinyang: YinYang;
  element: Element;
}

/** 십신 관계 */
export interface Relation {
  hanja: string;   // 比肩, 劫財, ...
  hangul: string;  // 비견, 겁재, ...
}

/** 12운성 */
export interface Meteor {
  hanja: string;   // 長生, 沐浴, ...
  hangul: string;  // 장생, 목욕, ...
}

/** 12신살 */
export interface Spirit {
  hanja: string;   // 劫殺, 災殺, ...
  hangul: string;  // 겁살, 재살, ...
}

/** 사주 하나의 주 (柱) */
export interface Pillar {
  /** 60갑자 문자열 (예: '甲子') */
  ganzi: string;
  /** 천간 */
  stem: string;
  /** 지지 */
  branch: string;
}

/** 사주 결과에서의 하나의 주 상세 */
export interface PillarDetail {
  pillar: Pillar;
  /** 천간 십신 (일간 기준) */
  stemSipsin: string;
  /** 지지 십신 (지장간 정기 기준) */
  branchSipsin: string;
  /** 12운성 */
  unseong: string;
  /** 12신살 (연지 기준) */
  sinsal: string;
  /** 지장간 */
  jigang: string;
}

/** 대운 항목 */
export interface DaewoonItem {
  index: number;
  ganzi: string;
  startDate: Date;
  age: number;
  stemSipsin: string;
  branchSipsin: string;
  /** 12운성 (일간 기준) */
  unseong: string;
  /** 12신살 (연지 기준) */
  sinsal: string;
  /** 공망 여부 */
  isGongmang: boolean;
}

/** 관계 분석 결과 */
export interface RelationResult {
  type: string;    // 合, 沖, 刑, 破, 害, 半合
  detail: string | null;  // 오행 or 세부정보
}

/** 주 쌍 관계 */
export interface PairRelation {
  stem: RelationResult[];
  branch: RelationResult[];
}

/** 전체 팔자 관계 분석 */
export interface AllRelations {
  pairs: Map<string, PairRelation>;   // 'i,j' => PairRelation
  triple: RelationResult[];
  directional: RelationResult[];
}

/** 신살 정보 */
export interface SpecialSals {
  yangin: number[];     // 양인살 위치 인덱스
  baekho: boolean;      // 백호살
  goegang: boolean;     // 괴강살
  dohwa: number[];      // 도화살 위치 인덱스
  cheonul: number[];    // 천을귀인 위치 인덱스
  cheonduk: number[];   // 천덕귀인 위치 인덱스 (천간 또는 지지)
  wolduk: number[];     // 월덕귀인 위치 인덱스 (천간)
  munchang: number[];   // 문창귀인 위치 인덱스
  hongyeom: boolean;    // 홍염살
  geumyeo: number[];    // 금여록 위치 인덱스
}

/** 공망 정보 */
export interface Gongmang {
  /** 공망 지지 2개 */
  branches: [string, string];
  /** 공망에 든 주의 인덱스 (0=시, 1=일, 2=월, 3=년) */
  pillarIndices: number[];
}

/** 좌법 항목 (지장간 → 일지 운성) */
export interface JwaEntry {
  stem: string;       // 지장간 글자 (예: '戊')
  sipsin: string;     // 십신 한자 (예: '正財')
  unseong: string;    // 일지에서의 운성 한자 (예: '乾祿')
}

/** 인종법 항목 (일지에 없는 십성 카테고리) */
export interface InjongEntry {
  category: string;   // 십성 카테고리 (예: '比劫')
  yangStem: string;   // 인종된 양간 (예: '甲')
  unseong: string;    // 일지에서의 운성 (예: '病')
}

/** 트랜짓 항목 */
export interface TransitItem {
  date: Date;
  type: '日運' | '月運';
  transit: string;       // 간지
  natalName: string;     // 時柱, 日柱, 月柱, 年柱
  relations: Array<{ prefix: string; relation: RelationResult }>;
}

/** 사주 계산 전체 결과 */
export interface SajuResult {
  input: BirthInput;
  /** 4주 (시, 일, 월, 년 순서) */
  pillars: PillarDetail[];
  /** 대운 */
  daewoon: DaewoonItem[];
  /** 팔자 관계 */
  relations: AllRelations;
  /** 신살 */
  specialSals: SpecialSals;
  /** 공망 */
  gongmang: Gongmang;
  /** 좌법 (각 주 지장간 → 일지 운성) — 4주×N지장간 */
  jwabeop: JwaEntry[][];
  /** 인종법 (일지에 없는 십성 카테고리 인종) */
  injongbeop: InjongEntry[];
}

// =============================================
// 자미두수 타입
// =============================================

/** 오행국 */
export interface WuXingJu {
  name: string;    // '水二局', '木三局', ...
  number: number;  // 2, 3, 4, 5, 6
}

/** 성요 정보 */
export interface ZiweiStar {
  name: string;
  brightness: string;  // 廟/旺/得/利/平/不/陷
  siHua: string;       // 化祿/化權/化科/化忌 or ''
}

/** 궁위 정보 */
export interface ZiweiPalace {
  name: string;         // 命宮, 兄弟, ...
  zhi: string;          // 地支
  gan: string;          // 天干
  ganZhi: string;       // 干支 결합
  stars: ZiweiStar[];
  isShenGong: boolean;  // 身宮 여부
}

/** 자미두수 명반 */
export interface ZiweiChart {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  hour: number;
  minute: number;
  isMale: boolean;

  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;

  yearGan: string;
  yearZhi: string;

  mingGongZhi: string;
  shenGongZhi: string;
  wuXingJu: WuXingJu;

  palaces: Record<string, ZiweiPalace>;
  daXianStartAge: number;
}

/** 유월 정보 */
export interface LiuYueInfo {
  month: number;
  mingGongZhi: string;
  natalPalaceName: string;
}

/** 유년 정보 */
export interface LiuNianInfo {
  year: number;
  gan: string;
  zhi: string;
  mingGongZhi: string;
  natalPalaceAtMing: string;
  siHua: Record<string, string>;         // {星名: 化種}
  siHuaPalaces: Record<string, string>;   // {化種: 宮名}
  palaces: Record<string, string>;        // {宮名: 地支}
  liuyue: LiuYueInfo[];
  daxianPalaceName: string;
  daxianAgeStart: number;
  daxianAgeEnd: number;
}

// =============================================
// 서양 점성술 (Natal Chart) 타입
// =============================================

/** 12궁 별자리 */
export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

/** 행성 ID */
export type PlanetId =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'Chiron' | 'NorthNode' | 'SouthNode' | 'Fortuna';

/** 행성 위치 */
export interface PlanetPosition {
  id: PlanetId;
  longitude: number;
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  degreeInSign: number;
  isRetrograde: boolean;
  /** 하우스 번호 (시간 모름이면 undefined) */
  house?: number;
}

/** 하우스 cusp */
export interface NatalHouse {
  number: number;
  cuspLongitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
}

/** 앵글 (ASC, MC, DESC, IC) */
export interface NatalAngles {
  asc: { longitude: number; sign: ZodiacSign; degreeInSign: number };
  mc: { longitude: number; sign: ZodiacSign; degreeInSign: number };
  desc: { longitude: number; sign: ZodiacSign; degreeInSign: number };
  ic: { longitude: number; sign: ZodiacSign; degreeInSign: number };
}

/** 애스펙트 종류 */
export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

/** 애스펙트 */
export interface NatalAspect {
  planet1: PlanetId;
  planet2: PlanetId;
  type: AspectType;
  angle: number;
  orb: number;
}

/** 네이탈 차트 전체 결과 */
export interface NatalChart {
  input: BirthInput;
  planets: PlanetPosition[];
  houses: NatalHouse[];
  /** 앵글 (시간 모름이면 null) */
  angles: NatalAngles | null;
  aspects: NatalAspect[];
}
