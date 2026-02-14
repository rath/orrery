/** 도시 정보 */
export interface City {
  /** 한국어 도시명 */
  name: string
  /** 한국어 국가명 (국내 도시는 생략) */
  country?: string
  lat: number
  lon: number
}

// =============================================
// 한국어 초성 검색
// =============================================

const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'

/** 자모 코드포인트 → 초성 인덱스 */
const JAMO_TO_INITIAL: Record<number, number> = {
  0x3131: 0, 0x3132: 1, 0x3134: 2, 0x3137: 3, 0x3138: 4,
  0x3139: 5, 0x3141: 6, 0x3142: 7, 0x3143: 8, 0x3145: 9,
  0x3146: 10, 0x3147: 11, 0x3148: 12, 0x3149: 13, 0x314A: 14,
  0x314B: 15, 0x314C: 16, 0x314D: 17, 0x314E: 18,
}

/** 한 글자의 초성 인덱스 추출 (한글 음절 또는 자모) */
function getInitialIndex(char: string): number | null {
  const code = char.charCodeAt(0)
  // 완성형 음절 (가~힣)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    return Math.floor((code - 0xAC00) / (21 * 28))
  }
  // 자모 자음
  if (code in JAMO_TO_INITIAL) {
    return JAMO_TO_INITIAL[code]
  }
  return null
}

/** 문자가 자모 자음인지 확인 */
function isJamo(char: string): boolean {
  return char.charCodeAt(0) in JAMO_TO_INITIAL
}

/** 쿼리가 모두 자모 자음(초성)인지 확인 */
function isAllChosung(query: string): boolean {
  return query.length > 0 && [...query].every(isJamo)
}

/** 초성으로 이름 매칭 (예: ㅅㅇ → 서울) */
function matchChosung(name: string, query: string): boolean {
  if (query.length > name.length) return false
  for (let i = 0; i < query.length; i++) {
    const qIdx = JAMO_TO_INITIAL[query.charCodeAt(i)]
    const nIdx = getInitialIndex(name[i])
    if (qIdx === undefined || nIdx === null || qIdx !== nIdx) return false
  }
  return true
}

// =============================================
// 도시 데이터
// =============================================

export const KOREAN_CITIES: readonly City[] = [
  // 특별/광역시
  { name: '서울', lat: 37.5665, lon: 126.9780 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '울산', lat: 35.5384, lon: 129.3114 },
  { name: '세종', lat: 36.4800, lon: 127.2590 },
  // 경기도
  { name: '수원', lat: 37.2636, lon: 127.0286 },
  { name: '고양', lat: 37.6584, lon: 126.8320 },
  { name: '용인', lat: 37.2411, lon: 127.1776 },
  { name: '성남', lat: 37.4386, lon: 127.1378 },
  { name: '부천', lat: 37.5034, lon: 126.7660 },
  { name: '안산', lat: 37.3219, lon: 126.8309 },
  { name: '안양', lat: 37.3943, lon: 126.9568 },
  { name: '남양주', lat: 37.6360, lon: 127.2165 },
  { name: '화성', lat: 37.1996, lon: 126.8312 },
  { name: '평택', lat: 36.9921, lon: 127.0857 },
  { name: '의정부', lat: 37.7381, lon: 127.0338 },
  { name: '시흥', lat: 37.3801, lon: 126.8032 },
  { name: '파주', lat: 37.7590, lon: 126.7802 },
  { name: '김포', lat: 37.6153, lon: 126.7156 },
  { name: '광명', lat: 37.4786, lon: 126.8646 },
  { name: '이천', lat: 37.2720, lon: 127.4350 },
  // 강원도
  { name: '춘천', lat: 37.8813, lon: 127.7299 },
  { name: '원주', lat: 37.3422, lon: 127.9202 },
  { name: '강릉', lat: 37.7519, lon: 128.8761 },
  { name: '속초', lat: 38.2070, lon: 128.5918 },
  // 충청도
  { name: '청주', lat: 36.6424, lon: 127.4890 },
  { name: '천안', lat: 36.8152, lon: 127.1139 },
  { name: '충주', lat: 36.9910, lon: 127.9259 },
  { name: '제천', lat: 37.1326, lon: 128.1910 },
  { name: '아산', lat: 36.7898, lon: 127.0018 },
  // 전라도
  { name: '전주', lat: 35.8242, lon: 127.1480 },
  { name: '목포', lat: 34.8118, lon: 126.3922 },
  { name: '여수', lat: 34.7604, lon: 127.6622 },
  { name: '순천', lat: 34.9505, lon: 127.4873 },
  { name: '군산', lat: 35.9677, lon: 126.7370 },
  { name: '익산', lat: 35.9483, lon: 126.9576 },
  // 경상도
  { name: '포항', lat: 36.0190, lon: 129.3435 },
  { name: '경주', lat: 35.8562, lon: 129.2247 },
  { name: '김해', lat: 35.2285, lon: 128.8894 },
  { name: '창원', lat: 35.2281, lon: 128.6811 },
  { name: '진주', lat: 35.1798, lon: 128.1076 },
  { name: '구미', lat: 36.1197, lon: 128.3446 },
  { name: '안동', lat: 36.5684, lon: 128.7294 },
  // 제주도
  { name: '제주', lat: 33.4996, lon: 126.5312 },
  { name: '서귀포', lat: 33.2542, lon: 126.5600 },
] as const

export const WORLD_CITIES: readonly City[] = [
  // ── 동아시아 ──
  { name: '도쿄', country: '일본', lat: 35.6762, lon: 139.6503 },
  { name: '오사카', country: '일본', lat: 34.6937, lon: 135.5023 },
  { name: '교토', country: '일본', lat: 35.0116, lon: 135.7681 },
  { name: '후쿠오카', country: '일본', lat: 33.5904, lon: 130.4017 },
  { name: '삿포로', country: '일본', lat: 43.0618, lon: 141.3545 },
  { name: '나고야', country: '일본', lat: 35.1815, lon: 136.9066 },
  { name: '베이징', country: '중국', lat: 39.9042, lon: 116.4074 },
  { name: '상하이', country: '중국', lat: 31.2304, lon: 121.4737 },
  { name: '광저우', country: '중국', lat: 23.1291, lon: 113.2644 },
  { name: '선전', country: '중국', lat: 22.5431, lon: 114.0579 },
  { name: '청두', country: '중국', lat: 30.5728, lon: 104.0668 },
  { name: '충칭', country: '중국', lat: 29.4316, lon: 106.9123 },
  { name: '시안', country: '중국', lat: 34.3416, lon: 108.9398 },
  { name: '홍콩', country: '중국', lat: 22.3193, lon: 114.1694 },
  { name: '타이베이', country: '대만', lat: 25.0330, lon: 121.5654 },
  { name: '울란바토르', country: '몽골', lat: 47.8864, lon: 106.9057 },
  { name: '평양', country: '북한', lat: 39.0392, lon: 125.7625 },
  // ── 동남아시아 ──
  { name: '방콕', country: '태국', lat: 13.7563, lon: 100.5018 },
  { name: '하노이', country: '베트남', lat: 21.0278, lon: 105.8342 },
  { name: '호치민', country: '베트남', lat: 10.8231, lon: 106.6297 },
  { name: '다낭', country: '베트남', lat: 16.0544, lon: 108.2022 },
  { name: '자카르타', country: '인도네시아', lat: -6.2088, lon: 106.8456 },
  { name: '발리', country: '인도네시아', lat: -8.3405, lon: 115.0920 },
  { name: '싱가포르', country: '싱가포르', lat: 1.3521, lon: 103.8198 },
  { name: '쿠알라룸푸르', country: '말레이시아', lat: 3.1390, lon: 101.6869 },
  { name: '마닐라', country: '필리핀', lat: 14.5995, lon: 120.9842 },
  { name: '세부', country: '필리핀', lat: 10.3157, lon: 123.8854 },
  { name: '양곤', country: '미얀마', lat: 16.8661, lon: 96.1951 },
  { name: '프놈펜', country: '캄보디아', lat: 11.5564, lon: 104.9282 },
  { name: '비엔티안', country: '라오스', lat: 17.9757, lon: 102.6331 },
  // ── 남아시아 ──
  { name: '뉴델리', country: '인도', lat: 28.6139, lon: 77.2090 },
  { name: '뭄바이', country: '인도', lat: 19.0760, lon: 72.8777 },
  { name: '벵갈루루', country: '인도', lat: 12.9716, lon: 77.5946 },
  { name: '다카', country: '방글라데시', lat: 23.8103, lon: 90.4125 },
  { name: '이슬라마바드', country: '파키스탄', lat: 33.6844, lon: 73.0479 },
  { name: '카라치', country: '파키스탄', lat: 24.8607, lon: 67.0011 },
  { name: '카트만두', country: '네팔', lat: 27.7172, lon: 85.3240 },
  { name: '콜롬보', country: '스리랑카', lat: 6.9271, lon: 79.8612 },
  // ── 중앙아시아 / 서아시아 ──
  { name: '아스타나', country: '카자흐스탄', lat: 51.1694, lon: 71.4491 },
  { name: '알마티', country: '카자흐스탄', lat: 43.2220, lon: 76.8512 },
  { name: '타슈켄트', country: '우즈베키스탄', lat: 41.2995, lon: 69.2401 },
  { name: '비슈케크', country: '키르기스스탄', lat: 42.8746, lon: 74.5698 },
  { name: '두샨베', country: '타지키스탄', lat: 38.5598, lon: 68.7738 },
  { name: '아시가바트', country: '투르크메니스탄', lat: 37.9601, lon: 58.3261 },
  { name: '테헤란', country: '이란', lat: 35.6892, lon: 51.3890 },
  { name: '바그다드', country: '이라크', lat: 33.3128, lon: 44.3615 },
  { name: '리야드', country: '사우디아라비아', lat: 24.7136, lon: 46.6753 },
  { name: '제다', country: '사우디아라비아', lat: 21.4858, lon: 39.1925 },
  { name: '두바이', country: '아랍에미리트', lat: 25.2048, lon: 55.2708 },
  { name: '아부다비', country: '아랍에미리트', lat: 24.4539, lon: 54.3773 },
  { name: '도하', country: '카타르', lat: 25.2854, lon: 51.5310 },
  { name: '쿠웨이트시티', country: '쿠웨이트', lat: 29.3759, lon: 47.9774 },
  { name: '앙카라', country: '튀르키예', lat: 39.9334, lon: 32.8597 },
  { name: '이스탄불', country: '튀르키예', lat: 41.0082, lon: 28.9784 },
  { name: '텔아비브', country: '이스라엘', lat: 32.0853, lon: 34.7818 },
  { name: '예루살렘', country: '이스라엘', lat: 31.7683, lon: 35.2137 },
  { name: '베이루트', country: '레바논', lat: 33.8938, lon: 35.5018 },
  { name: '암만', country: '요르단', lat: 31.9454, lon: 35.9284 },
  { name: '다마스쿠스', country: '시리아', lat: 33.5138, lon: 36.2765 },
  { name: '트빌리시', country: '조지아', lat: 41.7151, lon: 44.8271 },
  { name: '바쿠', country: '아제르바이잔', lat: 40.4093, lon: 49.8671 },
  { name: '예레반', country: '아르메니아', lat: 40.1792, lon: 44.4991 },
  // ── 서유럽 ──
  { name: '런던', country: '영국', lat: 51.5074, lon: -0.1278 },
  { name: '에든버러', country: '영국', lat: 55.9533, lon: -3.1883 },
  { name: '맨체스터', country: '영국', lat: 53.4808, lon: -2.2426 },
  { name: '파리', country: '프랑스', lat: 48.8566, lon: 2.3522 },
  { name: '마르세유', country: '프랑스', lat: 43.2965, lon: 5.3698 },
  { name: '리옹', country: '프랑스', lat: 45.7640, lon: 4.8357 },
  { name: '베를린', country: '독일', lat: 52.5200, lon: 13.4050 },
  { name: '뮌헨', country: '독일', lat: 48.1351, lon: 11.5820 },
  { name: '함부르크', country: '독일', lat: 53.5511, lon: 9.9937 },
  { name: '프랑크푸르트', country: '독일', lat: 50.1109, lon: 8.6821 },
  { name: '암스테르담', country: '네덜란드', lat: 52.3676, lon: 4.9041 },
  { name: '브뤼셀', country: '벨기에', lat: 50.8503, lon: 4.3517 },
  { name: '룩셈부르크', country: '룩셈부르크', lat: 49.6117, lon: 6.1319 },
  // ── 남유럽 ──
  { name: '마드리드', country: '스페인', lat: 40.4168, lon: -3.7038 },
  { name: '바르셀로나', country: '스페인', lat: 41.3874, lon: 2.1686 },
  { name: '로마', country: '이탈리아', lat: 41.9028, lon: 12.4964 },
  { name: '밀라노', country: '이탈리아', lat: 45.4642, lon: 9.1900 },
  { name: '나폴리', country: '이탈리아', lat: 40.8518, lon: 14.2681 },
  { name: '리스본', country: '포르투갈', lat: 38.7223, lon: -9.1393 },
  { name: '아테네', country: '그리스', lat: 37.9838, lon: 23.7275 },
  // ── 중유럽 ──
  { name: '빈', country: '오스트리아', lat: 48.2082, lon: 16.3738 },
  { name: '베른', country: '스위스', lat: 46.9480, lon: 7.4474 },
  { name: '취리히', country: '스위스', lat: 47.3769, lon: 8.5417 },
  { name: '제네바', country: '스위스', lat: 46.2044, lon: 6.1432 },
  { name: '프라하', country: '체코', lat: 50.0755, lon: 14.4378 },
  { name: '바르샤바', country: '폴란드', lat: 52.2297, lon: 21.0122 },
  { name: '크라쿠프', country: '폴란드', lat: 50.0647, lon: 19.9450 },
  { name: '부다페스트', country: '헝가리', lat: 47.4979, lon: 19.0402 },
  { name: '부쿠레슈티', country: '루마니아', lat: 44.4268, lon: 26.1025 },
  { name: '소피아', country: '불가리아', lat: 42.6977, lon: 23.3219 },
  // ── 발칸/남동유럽 ──
  { name: '자그레브', country: '크로아티아', lat: 45.8150, lon: 15.9819 },
  { name: '류블랴나', country: '슬로베니아', lat: 46.0569, lon: 14.5058 },
  { name: '베오그라드', country: '세르비아', lat: 44.7866, lon: 20.4489 },
  { name: '사라예보', country: '보스니아', lat: 43.8563, lon: 18.4131 },
  { name: '티라나', country: '알바니아', lat: 41.3275, lon: 19.8187 },
  // ── 북유럽 ──
  { name: '헬싱키', country: '핀란드', lat: 60.1699, lon: 24.9384 },
  { name: '스톡홀름', country: '스웨덴', lat: 59.3293, lon: 18.0686 },
  { name: '오슬로', country: '노르웨이', lat: 59.9139, lon: 10.7522 },
  { name: '코펜하겐', country: '덴마크', lat: 55.6761, lon: 12.5683 },
  { name: '레이캬비크', country: '아이슬란드', lat: 64.1466, lon: -21.9426 },
  { name: '더블린', country: '아일랜드', lat: 53.3498, lon: -6.2603 },
  // ── 발트 3국 ──
  { name: '탈린', country: '에스토니아', lat: 59.4370, lon: 24.7536 },
  { name: '리가', country: '라트비아', lat: 56.9496, lon: 24.1052 },
  { name: '빌뉴스', country: '리투아니아', lat: 54.6872, lon: 25.2797 },
  // ── 동유럽 / CIS ──
  { name: '모스크바', country: '러시아', lat: 55.7558, lon: 37.6173 },
  { name: '상트페테르부르크', country: '러시아', lat: 59.9311, lon: 30.3609 },
  { name: '블라디보스토크', country: '러시아', lat: 43.1332, lon: 131.9113 },
  { name: '키이우', country: '우크라이나', lat: 50.4504, lon: 30.5245 },
  { name: '민스크', country: '벨라루스', lat: 53.9006, lon: 27.5590 },
  { name: '키시너우', country: '몰도바', lat: 47.0105, lon: 28.8638 },
  // ── 북아메리카 ──
  { name: '워싱턴 D.C.', country: '미국', lat: 38.9072, lon: -77.0369 },
  { name: '뉴욕', country: '미국', lat: 40.7128, lon: -74.0060 },
  { name: '로스앤젤레스', country: '미국', lat: 34.0522, lon: -118.2437 },
  { name: '시카고', country: '미국', lat: 41.8781, lon: -87.6298 },
  { name: '샌프란시스코', country: '미국', lat: 37.7749, lon: -122.4194 },
  { name: '시애틀', country: '미국', lat: 47.6062, lon: -122.3321 },
  { name: '보스턴', country: '미국', lat: 42.3601, lon: -71.0589 },
  { name: '호놀룰루', country: '미국', lat: 21.3069, lon: -157.8583 },
  { name: '라스베이거스', country: '미국', lat: 36.1699, lon: -115.1398 },
  { name: '마이애미', country: '미국', lat: 25.7617, lon: -80.1918 },
  { name: '휴스턴', country: '미국', lat: 29.7604, lon: -95.3698 },
  { name: '댈러스', country: '미국', lat: 32.7767, lon: -96.7970 },
  { name: '애틀랜타', country: '미국', lat: 33.7490, lon: -84.3880 },
  { name: '덴버', country: '미국', lat: 39.7392, lon: -104.9903 },
  { name: '오타와', country: '캐나다', lat: 45.4215, lon: -75.6972 },
  { name: '토론토', country: '캐나다', lat: 43.6532, lon: -79.3832 },
  { name: '밴쿠버', country: '캐나다', lat: 49.2827, lon: -123.1207 },
  { name: '몬트리올', country: '캐나다', lat: 45.5017, lon: -73.5673 },
  { name: '멕시코시티', country: '멕시코', lat: 19.4326, lon: -99.1332 },
  { name: '칸쿤', country: '멕시코', lat: 21.1619, lon: -86.8515 },
  // ── 카리브해 / 중앙아메리카 ──
  { name: '아바나', country: '쿠바', lat: 23.1136, lon: -82.3666 },
  { name: '산토도밍고', country: '도미니카공화국', lat: 18.4861, lon: -69.9312 },
  { name: '과테말라시티', country: '과테말라', lat: 14.6349, lon: -90.5069 },
  { name: '산호세', country: '코스타리카', lat: 9.9281, lon: -84.0907 },
  { name: '파나마시티', country: '파나마', lat: 8.9824, lon: -79.5199 },
  { name: '산후안', country: '푸에르토리코', lat: 18.4655, lon: -66.1057 },
  { name: '킹스턴', country: '자메이카', lat: 18.0179, lon: -76.8099 },
  // ── 남아메리카 ──
  { name: '보고타', country: '콜롬비아', lat: 4.7110, lon: -74.0721 },
  { name: '리마', country: '페루', lat: -12.0464, lon: -77.0428 },
  { name: '키토', country: '에콰도르', lat: -0.1807, lon: -78.4678 },
  { name: '산티아고', country: '칠레', lat: -33.4489, lon: -70.6693 },
  { name: '부에노스아이레스', country: '아르헨티나', lat: -34.6037, lon: -58.3816 },
  { name: '몬테비데오', country: '우루과이', lat: -34.9011, lon: -56.1645 },
  { name: '아순시온', country: '파라과이', lat: -25.2637, lon: -57.5759 },
  { name: '라파스', country: '볼리비아', lat: -16.4897, lon: -68.1193 },
  { name: '브라질리아', country: '브라질', lat: -15.7975, lon: -47.8919 },
  { name: '상파울루', country: '브라질', lat: -23.5505, lon: -46.6333 },
  { name: '리우데자네이루', country: '브라질', lat: -22.9068, lon: -43.1729 },
  { name: '카라카스', country: '베네수엘라', lat: 10.4806, lon: -66.9036 },
  // ── 아프리카 ──
  { name: '카이로', country: '이집트', lat: 30.0444, lon: 31.2357 },
  { name: '나이로비', country: '케냐', lat: -1.2921, lon: 36.8219 },
  { name: '아디스아바바', country: '에티오피아', lat: 9.0250, lon: 38.7469 },
  { name: '아크라', country: '가나', lat: 5.6037, lon: -0.1870 },
  { name: '라고스', country: '나이지리아', lat: 6.5244, lon: 3.3792 },
  { name: '아부자', country: '나이지리아', lat: 9.0579, lon: 7.4951 },
  { name: '다르에스살람', country: '탄자니아', lat: -6.7924, lon: 39.2083 },
  { name: '케이프타운', country: '남아프리카공화국', lat: -33.9249, lon: 18.4241 },
  { name: '요하네스버그', country: '남아프리카공화국', lat: -26.2041, lon: 28.0473 },
  { name: '알제', country: '알제리', lat: 36.7538, lon: 3.0588 },
  { name: '튀니스', country: '튀니지', lat: 36.8065, lon: 10.1815 },
  { name: '라바트', country: '모로코', lat: 34.0209, lon: -6.8416 },
  { name: '카사블랑카', country: '모로코', lat: 33.5731, lon: -7.5898 },
  { name: '캄팔라', country: '우간다', lat: 0.3476, lon: 32.5825 },
  { name: '루사카', country: '잠비아', lat: -15.3875, lon: 28.3228 },
  { name: '하라레', country: '짐바브웨', lat: -17.8252, lon: 31.0335 },
  { name: '마푸투', country: '모잠비크', lat: -25.9692, lon: 32.5732 },
  { name: '안타나나리보', country: '마다가스카르', lat: -18.8792, lon: 47.5079 },
  // ── 오세아니아 ──
  { name: '캔버라', country: '호주', lat: -35.2809, lon: 149.1300 },
  { name: '시드니', country: '호주', lat: -33.8688, lon: 151.2093 },
  { name: '멜버른', country: '호주', lat: -37.8136, lon: 144.9631 },
  { name: '브리즈번', country: '호주', lat: -27.4698, lon: 153.0251 },
  { name: '퍼스', country: '호주', lat: -31.9505, lon: 115.8605 },
  { name: '웰링턴', country: '뉴질랜드', lat: -41.2866, lon: 174.7756 },
  { name: '오클랜드', country: '뉴질랜드', lat: -36.8485, lon: 174.7633 },
] as const

/** 기본값: 서울 */
export const SEOUL = KOREAN_CITIES[0]

// =============================================
// 검색 / 필터링
// =============================================

/** 도시 표시명 (예: "서울", "도쿄, 일본") */
export function formatCityName(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name
}

/** 쿼리로 도시 필터링 (최대 8개, 한국 도시 우선) */
export function filterCities(query: string): City[] {
  const q = query.trim()
  if (!q) return []

  const chosung = isAllChosung(q)
  const koreanResults: City[] = []
  const worldResults: City[] = []

  for (const city of KOREAN_CITIES) {
    if (chosung ? matchChosung(city.name, q) : city.name.includes(q)) {
      koreanResults.push(city)
    }
  }

  for (const city of WORLD_CITIES) {
    if (chosung) {
      if (matchChosung(city.name, q)) worldResults.push(city)
    } else {
      const label = formatCityName(city)
      if (label.includes(q)) worldResults.push(city)
    }
  }

  return [...koreanResults, ...worldResults].slice(0, 8)
}
