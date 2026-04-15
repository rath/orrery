const ko: Record<string, string> = {
  // App
  'app.subtitle1': '서버 없이 브라우저에서 동작하는',
  'app.subtitle.tool': '사주팔자 · 자미두수 · 서양 점성술',
  'app.subtitle2': '계산기',
  'app.subtitle3': '십신, 대운, 명반, 사화, 출생차트까지 한 번에',
  'app.profileManage': '프로필 관리',
  'app.tab.saju': '사주팔자',
  'app.tab.ziwei': '자미두수',
  'app.tab.natal': '출생차트',
  'app.copyAll': 'AI 해석용',
  'app.copyAllSub': '전부 복사',
  'app.intro': '소개글',

  // BirthForm
  'form.birthDate': '생년월일 (양력)',
  'form.yearSuffix': '년',
  'form.monthSuffix': '월',
  'form.daySuffix': '일',
  'form.kdt': '88올림픽 하계표준시(KDT, UTC+10) 적용 기간입니다. 모든 계산에 자동 반영됩니다.',
  'form.kstHistoricalOffset': '한국 표준시의 역사적 편차 구간(1948-1951 KDT, 1954-1961 UTC+8:30/+9:30, 1987-1988 KDT)에 해당하여, KST 벽시계 기준으로 자동 정규화합니다.',
  'form.dstGapError': '입력하신 시각은 서머타임(DST) 전환 직후 건너뛴 구간에 해당하여 실제로 존재하지 않습니다. 출생 기록의 시간대를 다시 확인해 주세요.',
  'form.time': '시간',
  'form.unknown': '모름',
  'form.hourSuffix': '시',
  'form.minuteSuffix': '분',
  'form.male': '남',
  'form.female': '여',
  'form.birthPlace': '출생 위치',
  'form.citySearch': '도시 선택',
  'form.coordInput': '좌표 입력',
  'form.manualInput': '직접 입력',
  'form.latitude': '위도',
  'form.longitude': '경도',
  'form.coordinateInvalid': '좌표를 올바른 숫자로 입력해주세요.',
  'form.timezoneDefault': '자동 추론 시간대:',
  'form.timezoneAutoDetectFailed': '현재 좌표로 시간대를 자동 추론하지 못했습니다. 좌표를 확인해주세요.',
  'form.dstActive': '서머타임(DST) 적용 중',
  'form.advanced': '고급 설정',
  'form.jasiMethod': '자시법 (子時法)',
  'form.unified': '통자시',
  'form.split': '야자시',
  'form.unifiedDesc': '23:30부터 子시, 일주를 다음날로 넘깁니다.',
  'form.splitDesc': '23:30~00:00(야자시)은 子시이나, 일주는 당일 유지합니다.',
  'form.calculate': '계산',
  'form.privacy1': '모든 계산은 브라우저에서 처리되며,',
  'form.privacy2': '입력하신 정보는 어떤 서버에도 전송되지 않습니다.',

  // CopyButton
  'copy.copy': '복사',
  'copy.copied': '복사됨 ✓',
  'copy.aiCopy': 'AI 해석용 복사',

  // ThemeToggle
  'theme.system': '시스템 설정 따름',
  'theme.light': '라이트 모드',
  'theme.dark': '다크 모드',

  // CityCombobox
  'city.noResults': '검색 결과 없음',
  'city.korea': '한국',
  'city.world': '세계',
  'city.placeholder': '도시 이름을 입력하세요',

  // Guide
  'guide.title': '사용 방법',
  'guide.step1': '위 폼에 생년월일, 태어난 시간, 성별을 입력합니다.',
  'guide.step2a': '계산',
  'guide.step2b': ' 버튼을 누르면 사주팔자, 자미두수, 출생차트 결과가 나타납니다.',
  'guide.step3a': '탭 우측의 ',
  'guide.step3bold': 'AI 해석용 전부 복사',
  'guide.step3b': '를 누르면 사주팔자 + 자미두수 + 출생차트 데이터가 한 번에 복사됩니다. 각 탭의 ',
  'guide.step3bold2': 'AI 해석용 복사',
  'guide.step3c': ' 버튼으로 개별 복사도 가능합니다.',
  'guide.step4': 'Claude, ChatGPT, Gemini 등 AI 채팅에 붙여넣고 해석을 요청하세요.',
  'guide.askAI': 'AI에게 이렇게 물어보세요',
  'guide.personality': '성격 분석',
  'guide.personalityEx': '다음은 내 사주팔자, 자미두수 명반, 출생차트야. 성격적 강점과 약점을 분석해줘.',
  'guide.pasteData': '[복사한 데이터 붙여넣기]',
  'guide.counseling': '고민 상담',
  'guide.counselingEx': '아래 명반 데이터를 기반으로, 내가 살면서 힘들 수 있는 부분 Top 3를 뽑고 조언해줘.',
  'guide.compatibility': '궁합 보기',
  'guide.compatibilityEx': '두 사람의 명반 데이터를 보내줄게. 성격적으로 잘 맞는 부분과 부딪힐 수 있는 부분을 분석해줘.',
  'guide.pasteA': '[A의 데이터 붙여넣기]',
  'guide.pasteB': '[B의 데이터 붙여넣기]',

  // ProfileModal
  'profile.timeUnknown': '시간모름',
  'profile.manualInput': '직접입력',
  'profile.male': '남',
  'profile.female': '여',
  'profile.ilju': '일주',
  'profile.title': '프로필 관리',
  'profile.close': '닫기',
  'profile.desc': '프로필은 브라우저 저장소(LocalStorage)에 보관되며, 브라우저 데이터 삭제 시 함께 사라집니다. ',
  'profile.export': '내보내기',
  'profile.import': '가져오기',
  'profile.backupSuffix': '로 백업할 수 있습니다.',
  'profile.namePlaceholder': '별칭 입력',
  'profile.save': '저장',
  'profile.cancel': '취소',
  'profile.addNew': '+ 입력한 정보로 새 프로필 추가',
  'profile.empty': '저장된 프로필이 없습니다.',
  'profile.editName': '별칭 수정',
  'profile.confirmDelete': '확인?',
  'profile.storageError': '저장 공간이 부족합니다. 불필요한 프로필을 삭제해주세요.',
  'profile.importError': '파일을 읽을 수 없습니다. 올바른 JSON 파일인지 확인해주세요.',

  // Saju - PillarTable
  'saju.sipsin': '십신',
  'saju.cheongan': '천간',
  'saju.jiji': '지지',
  'saju.unseong': '운성',
  'saju.sinsal': '신살',
  'saju.janggan': '장간',
  'saju.gongmang': '공망',

  // Saju - DaewoonTable
  'saju.noData': '대운 데이터가 없습니다.',
  'saju.unknownTimeWarning': '출생 시간 없이 정오(12:00) 기준으로 계산하여 대운 시작 시기에 수개월 오차가 있을 수 있습니다.',
  'saju.ageSuffix': '세',

  // Saju - SinsalList
  'saju.sal.cheonul': '천을귀인',
  'saju.sal.cheonduk': '천덕귀인',
  'saju.sal.wolduk': '월덕귀인',
  'saju.sal.munchang': '문창귀인',
  'saju.sal.geumyeo': '금여록',
  'saju.sal.yangin': '양인살',
  'saju.sal.dohwa': '도화살',
  'saju.sal.baekho': '백호살',
  'saju.sal.goegang': '괴강살',
  'saju.sal.hongyeom': '홍염살',

  // Saju - TransitView
  'saju.transit.past': '과거',
  'saju.transit.future': '향후',
  'saju.transit.futureBtn': '미래',
  'saju.transit.pastBtn': '과거',
  'saju.transit.1month': '1개월',
  'saju.transit.3months': '3개월',
  'saju.transit.6months': '6개월',
  'saju.transit.noRelation': '개월간 특별한 관계 없음',

  // Saju - Transit relation prefix
  'transit.stem': '천간',
  'transit.branch': '지지',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': '각 주 지장간이 일지에서 어떤 운성에 좌(坐)하는지',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': '지장간',
  'saju.injong.desc': '— 누락 십성의 양간 인종',

  // Ziwei
  'ziwei.needTime': '자미두수는 출생 시간이 필수입니다.',
  'ziwei.needTimeDesc': '시간에 따라 명반 전체 구조가 바뀝니다. 출생 시간을 입력해주세요.',

  // Natal
  'natal.loading': 'Swiss Ephemeris 로딩 중...',
  'natal.error': '계산 오류',
  'natal.unknownTime': '출생 시간 없이 정오(12:00) 기준으로 계산한 결과입니다.',
  'natal.unknownTimeDetail': '달은 최대 ±6° 오차가 있을 수 있으며, ASC · 하우스 배치는 표시하지 않습니다.',
  'natal.planet': '행성',
  'natal.sign': '별자리',
  'natal.degree': '도수',
  'natal.house': '하우스',

  // Natal - Planets
  'planet.Sun': '태양', 'planet.Moon': '달', 'planet.Mercury': '수성', 'planet.Venus': '금성',
  'planet.Mars': '화성', 'planet.Jupiter': '목성', 'planet.Saturn': '토성', 'planet.Uranus': '천왕성',
  'planet.Neptune': '해왕성', 'planet.Pluto': '명왕성', 'planet.Chiron': '키론',
  'planet.NorthNode': '북교점', 'planet.SouthNode': '남교점', 'planet.Fortuna': '행운점',

  // Natal - Zodiac Signs
  'zodiac.Aries': '양자리', 'zodiac.Taurus': '황소자리', 'zodiac.Gemini': '쌍둥이자리', 'zodiac.Cancer': '게자리',
  'zodiac.Leo': '사자자리', 'zodiac.Virgo': '처녀자리', 'zodiac.Libra': '천칭자리', 'zodiac.Scorpio': '전갈자리',
  'zodiac.Sagittarius': '궁수자리', 'zodiac.Capricorn': '염소자리', 'zodiac.Aquarius': '물병자리', 'zodiac.Pisces': '물고기자리',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': '양', 'zodiac.short.Taurus': '황소', 'zodiac.short.Gemini': '쌍둥이', 'zodiac.short.Cancer': '게',
  'zodiac.short.Leo': '사자', 'zodiac.short.Virgo': '처녀', 'zodiac.short.Libra': '천칭', 'zodiac.short.Scorpio': '전갈',
  'zodiac.short.Sagittarius': '궁수', 'zodiac.short.Capricorn': '염소', 'zodiac.short.Aquarius': '물병', 'zodiac.short.Pisces': '물고기',
}

export default ko
