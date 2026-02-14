/**
 * 참조 데이터
 */

export interface PillarFixture {
  year: number; month: number; day: number; hour: number; minute: number;
  expected: { year: string; month: string; day: string; hour: string };
}

export const PILLAR_FIXTURES: PillarFixture[] = [
  { year: 1993, month: 3, day: 12, hour: 9, minute: 45, expected: { year: '癸酉', month: '乙卯', day: '壬辰', hour: '乙巳' } },
  { year: 1987, month: 8, day: 23, hour: 4, minute: 10, expected: { year: '丁卯', month: '戊申', day: '甲辰', hour: '丙寅' } },
  { year: 1995, month: 12, day: 30, hour: 18, minute: 55, expected: { year: '乙亥', month: '戊子', day: '乙未', hour: '乙酉' } },
  { year: 1978, month: 10, day: 14, hour: 21, minute: 0, expected: { year: '戊午', month: '壬戌', day: '己酉', hour: '甲戌' } },
  { year: 2001, month: 11, day: 7, hour: 15, minute: 20, expected: { year: '辛巳', month: '戊戌', day: '甲戌', hour: '辛未' } },
  { year: 2010, month: 5, day: 1, hour: 10, minute: 15, expected: { year: '庚寅', month: '庚辰', day: '辛亥', hour: '癸巳' } },
  { year: 1970, month: 1, day: 5, hour: 6, minute: 0, expected: { year: '己酉', month: '丙子', day: '乙酉', hour: '己卯' } },
  { year: 1982, month: 7, day: 18, hour: 13, minute: 40, expected: { year: '壬戌', month: '丁未', day: '壬寅', hour: '丁未' } },
  { year: 1999, month: 2, day: 14, hour: 8, minute: 20, expected: { year: '己卯', month: '丙寅', day: '丁酉', hour: '甲辰' } },
  { year: 2005, month: 9, day: 30, hour: 22, minute: 45, expected: { year: '乙酉', month: '乙酉', day: '丁巳', hour: '辛亥' } },
  { year: 1974, month: 4, day: 22, hour: 3, minute: 30, expected: { year: '甲寅', month: '戊辰', day: '癸巳', hour: '甲寅' } },
  { year: 2015, month: 6, day: 8, hour: 16, minute: 0, expected: { year: '乙未', month: '壬午', day: '乙卯', hour: '甲申' } },
  { year: 1991, month: 12, day: 1, hour: 11, minute: 10, expected: { year: '辛未', month: '己亥', day: '乙巳', hour: '辛巳' } },
  { year: 2008, month: 3, day: 20, hour: 7, minute: 50, expected: { year: '戊子', month: '乙卯', day: '己未', hour: '戊辰' } },
  { year: 1968, month: 11, day: 25, hour: 19, minute: 30, expected: { year: '戊申', month: '癸亥', day: '己亥', hour: '甲戌' } },
  { year: 2020, month: 8, day: 15, hour: 14, minute: 0, expected: { year: '庚子', month: '甲申', day: '庚寅', hour: '癸未' } },
  { year: 1985, month: 5, day: 10, hour: 6, minute: 30, expected: { year: '乙丑', month: '辛巳', day: '己酉', hour: '丁卯' } },
  { year: 2003, month: 1, day: 28, hour: 5, minute: 15, expected: { year: '壬午', month: '癸丑', day: '辛丑', hour: '庚寅' } },
  { year: 1976, month: 9, day: 3, hour: 17, minute: 20, expected: { year: '丙辰', month: '丙申', day: '戊午', hour: '庚申' } },
  { year: 2012, month: 12, day: 21, hour: 23, minute: 0, expected: { year: '壬辰', month: '壬子', day: '丙辰', hour: '己亥' } },
]

export interface ZiweiFixture {
  year: number; month: number; day: number; hour: number; minute: number; isMale: boolean;
  expected: {
    lunarYear: number; lunarMonth: number; lunarDay: number;
    yearGanZhi: string;
    mingGongZhi: string;
    shenGongZhi: string;
    wuXingJuName: string;
    wuXingJuNumber: number;
  };
}

export interface NatalFixture {
  year: number; month: number; day: number; hour: number; minute: number;
  expected: {
    asc: { lon: number; sign: string };
    mc: { lon: number; sign: string };
    sun: { lon: number; sign: string; house: number };
    moon: { lon: number; sign: string; house: number };
    mercury: { lon: number; isRetrograde: boolean };
    northNode: { lon: number; sign: string };
  };
}

export const NATAL_FIXTURES: NatalFixture[] = [
  {
    year: 1993, month: 3, day: 12, hour: 9, minute: 45,
    expected: {
      asc: { lon: 55.8952, sign: 'Taurus' },
      mc: { lon: 305.6655, sign: 'Aquarius' },
      sun: { lon: 351.456, sign: 'Pisces', house: 11 },
      moon: { lon: 222.107, sign: 'Scorpio', house: 6 },
      mercury: { lon: 345.7711, isRetrograde: true },
      northNode: { lon: 256.7172, sign: 'Sagittarius' },
    },
  },
  {
    year: 1987, month: 8, day: 23, hour: 4, minute: 10,
    expected: {
      asc: { lon: 127.5375, sign: 'Leo' },
      mc: { lon: 27.1074, sign: 'Aries' },
      sun: { lon: 149.1567, sign: 'Leo', house: 2 },
      moon: { lon: 130.4845, sign: 'Leo', house: 1 },
      mercury: { lon: 151.7648, isRetrograde: false },
      northNode: { lon: 4.115, sign: 'Aries' },
    },
  },
  {
    year: 1995, month: 11, day: 3, hour: 15, minute: 20,
    expected: {
      asc: { lon: 350.4641, sign: 'Pisces' },
      mc: { lon: 264.6248, sign: 'Sagittarius' },
      sun: { lon: 220.354, sign: 'Scorpio', house: 8 },
      moon: { lon: 352.8906, sign: 'Pisces', house: 1 },
      mercury: { lon: 208.1994, isRetrograde: false },
      northNode: { lon: 205.5485, sign: 'Libra' },
    },
  },
  {
    year: 1988, month: 4, day: 15, hour: 22, minute: 10,
    expected: {
      asc: { lon: 243.5151, sign: 'Sagittarius' },
      mc: { lon: 167.506, sign: 'Virgo' },
      sun: { lon: 25.7796, sign: 'Aries', house: 5 },
      moon: { lon: 12.9804, sign: 'Aries', house: 4 },
      mercury: { lon: 20.1917, isRetrograde: false },
      northNode: { lon: 351.5786, sign: 'Pisces' },
    },
  },
  {
    year: 2001, month: 12, day: 25, hour: 6, minute: 0,
    expected: {
      asc: { lon: 249.3038, sign: 'Sagittarius' },
      mc: { lon: 175.1495, sign: 'Virgo' },
      sun: { lon: 273.1253, sign: 'Capricorn', house: 1 },
      moon: { lon: 25.2698, sign: 'Aries', house: 5 },
      mercury: { lon: 284.3545, isRetrograde: false },
      northNode: { lon: 86.7343, sign: 'Gemini' },
    },
  },
  {
    year: 1974, month: 9, day: 8, hour: 13, minute: 45,
    expected: {
      asc: { lon: 257.4335, sign: 'Sagittarius' },
      mc: { lon: 185.6876, sign: 'Libra' },
      sun: { lon: 165.1618, sign: 'Virgo', house: 9 },
      moon: { lon: 58.9822, sign: 'Taurus', house: 6 },
      mercury: { lon: 183.0967, isRetrograde: false },
      northNode: { lon: 254.6759, sign: 'Sagittarius' },
    },
  },
  {
    year: 2010, month: 7, day: 19, hour: 3, minute: 30,
    expected: {
      asc: { lon: 90.4616, sign: 'Cancer' },
      mc: { lon: 339.4925, sign: 'Pisces' },
      sun: { lon: 116.0293, sign: 'Cancer', house: 2 },
      moon: { lon: 210.4574, sign: 'Scorpio', house: 5 },
      mercury: { lon: 136.2848, isRetrograde: false },
      northNode: { lon: 281.1101, sign: 'Capricorn' },
    },
  },
  {
    year: 1965, month: 1, day: 30, hour: 18, minute: 55,
    expected: {
      asc: { lon: 143.6809, sign: 'Leo' },
      mc: { lon: 47.738, sign: 'Taurus' },
      sun: { lon: 310.3118, sign: 'Aquarius', house: 6 },
      moon: { lon: 285.489, sign: 'Capricorn', house: 5 },
      mercury: { lon: 293.9106, isRetrograde: false },
      northNode: { lon: 80.4174, sign: 'Gemini' },
    },
  },
  {
    year: 1999, month: 5, day: 22, hour: 10, minute: 15,
    expected: {
      asc: { lon: 127.474, sign: 'Leo' },
      mc: { lon: 27.0259, sign: 'Aries' },
      sun: { lon: 60.5362, sign: 'Gemini', house: 11 },
      moon: { lon: 148.3763, sign: 'Leo', house: 2 },
      mercury: { lon: 56.016, isRetrograde: false },
      northNode: { lon: 136.9263, sign: 'Leo' },
    },
  },
  {
    year: 1982, month: 11, day: 11, hour: 0, minute: 5,
    expected: {
      asc: { lon: 141.6879, sign: 'Leo' },
      mc: { lon: 45.2591, sign: 'Taurus' },
      sun: { lon: 227.8888, sign: 'Scorpio', house: 4 },
      moon: { lon: 167.8689, sign: 'Virgo', house: 2 },
      mercury: { lon: 222.4322, isRetrograde: false },
      northNode: { lon: 96.5762, sign: 'Cancer' },
    },
  },
  {
    year: 2005, month: 3, day: 1, hour: 8, minute: 40,
    expected: {
      asc: { lon: 17.7486, sign: 'Aries' },
      mc: { lon: 280.0956, sign: 'Capricorn' },
      sun: { lon: 340.4843, sign: 'Pisces', house: 12 },
      moon: { lon: 216.1668, sign: 'Scorpio', house: 7 },
      mercury: { lon: 352.8247, isRetrograde: false },
      northNode: { lon: 25.1991, sign: 'Aries' },
    },
  },
]

export const ZIWEI_FIXTURES: ZiweiFixture[] = [
  {
    year: 1993, month: 3, day: 12, hour: 9, minute: 45, isMale: true,
    expected: {
      lunarYear: 1993, lunarMonth: 2, lunarDay: 20,
      yearGanZhi: '癸酉', mingGongZhi: '戌', shenGongZhi: '申',
      wuXingJuName: '水二局', wuXingJuNumber: 2,
    },
  },
  {
    year: 1987, month: 8, day: 23, hour: 4, minute: 10, isMale: true,
    expected: {
      lunarYear: 1987, lunarMonth: 6, lunarDay: 29,
      yearGanZhi: '丁卯', mingGongZhi: '巳', shenGongZhi: '酉',
      wuXingJuName: '火六局', wuXingJuNumber: 6,
    },
  },
  {
    year: 1978, month: 10, day: 14, hour: 21, minute: 0, isMale: false,
    expected: {
      lunarYear: 1978, lunarMonth: 9, lunarDay: 13,
      yearGanZhi: '戊午', mingGongZhi: '亥', shenGongZhi: '酉',
      wuXingJuName: '水二局', wuXingJuNumber: 2,
    },
  },
  {
    year: 2001, month: 11, day: 7, hour: 15, minute: 20, isMale: false,
    expected: {
      lunarYear: 2001, lunarMonth: 9, lunarDay: 22,
      yearGanZhi: '辛巳', mingGongZhi: '寅', shenGongZhi: '午',
      wuXingJuName: '木三局', wuXingJuNumber: 3,
    },
  },
  {
    year: 1982, month: 7, day: 18, hour: 13, minute: 40, isMale: true,
    expected: {
      lunarYear: 1982, lunarMonth: 5, lunarDay: 28,
      yearGanZhi: '壬戌', mingGongZhi: '亥', shenGongZhi: '丑',
      wuXingJuName: '金四局', wuXingJuNumber: 4,
    },
  },
  {
    year: 1999, month: 2, day: 14, hour: 8, minute: 20, isMale: false,
    expected: {
      lunarYear: 1998, lunarMonth: 12, lunarDay: 29,
      yearGanZhi: '戊寅', mingGongZhi: '酉', shenGongZhi: '巳',
      wuXingJuName: '木三局', wuXingJuNumber: 3,
    },
  },
  {
    year: 2005, month: 9, day: 30, hour: 22, minute: 45, isMale: true,
    expected: {
      lunarYear: 2005, lunarMonth: 8, lunarDay: 27,
      yearGanZhi: '乙酉', mingGongZhi: '戌', shenGongZhi: '申',
      wuXingJuName: '土五局', wuXingJuNumber: 5,
    },
  },
  {
    year: 2015, month: 6, day: 8, hour: 16, minute: 0, isMale: false,
    expected: {
      lunarYear: 2015, lunarMonth: 4, lunarDay: 22,
      yearGanZhi: '乙未', mingGongZhi: '酉', shenGongZhi: '丑',
      wuXingJuName: '水二局', wuXingJuNumber: 2,
    },
  },
  {
    year: 1991, month: 12, day: 1, hour: 11, minute: 10, isMale: true,
    expected: {
      lunarYear: 1991, lunarMonth: 10, lunarDay: 26,
      yearGanZhi: '辛未', mingGongZhi: '巳', shenGongZhi: '巳',
      wuXingJuName: '水二局', wuXingJuNumber: 2,
    },
  },
  {
    year: 2008, month: 3, day: 20, hour: 7, minute: 50, isMale: false,
    expected: {
      lunarYear: 2008, lunarMonth: 2, lunarDay: 13,
      yearGanZhi: '戊子', mingGongZhi: '亥', shenGongZhi: '未',
      wuXingJuName: '水二局', wuXingJuNumber: 2,
    },
  },
]
