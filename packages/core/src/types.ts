/** 오행 (Five Elements) */
export type Element = 'tree' | 'fire' | 'earth' | 'metal' | 'water';

/** 음양 (Yin-Yang) */
export type YinYang = '+' | '-';

/** 성별 */
export type Gender = 'M' | 'F';

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
  /** 위도 (기본값: 37.5194 서울) */
  latitude?: number;
  /** 경도 (기본값: 127.0992 서울) */
  longitude?: number;
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
  | 'Chiron' | 'NorthNode' | 'SouthNode';

/** 행성 위치 */
export interface PlanetPosition {
  id: PlanetId;
  longitude: number;
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  degreeInSign: number;
  isRetrograde: boolean;
  house: number;
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
  angles: NatalAngles;
  aspects: NatalAspect[];
}
