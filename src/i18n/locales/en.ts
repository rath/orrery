const en: Record<string, string> = {
  // App
  'app.subtitle1': 'A serverless, browser-based',
  'app.subtitle.tool': 'Saju · Ziwei Doushu · Natal Chart',
  'app.subtitle2': 'Calculator',
  'app.subtitle3': 'Chinese & Western astrology charts, all in one place',
  'app.profileManage': 'Manage Profiles',
  'app.tab.saju': 'Saju (四柱八字)',
  'app.tab.ziwei': 'Ziwei Doushu (紫微斗数)',
  'app.tab.natal': 'Natal Chart',
  'app.copyAll': 'For AI Reading',
  'app.copyAllSub': 'Copy All',
  'app.intro': 'About',

  // BirthForm
  'form.birthDate': 'Date of Birth (Solar)',
  'form.yearSuffix': '',
  'form.monthSuffix': '',
  'form.daySuffix': '',
  'form.kdt': 'This period falls under the 1988 Olympics summer time (KDT, UTC+10). All calculations are automatically adjusted.',
  'form.kstHistoricalOffset': 'This date falls under Korean historical timezone anomalies (1948-1951 KDT, 1954-1961 UTC+8:30/+9:30, 1987-1988 KDT). All calculations are automatically normalized to KST wall-clock.',
  'form.dstGapError': 'The entered time falls in a DST spring-forward gap and does not exist. Please verify the timezone of the birth record.',
  'form.time': 'Time',
  'form.unknown': 'Unknown',
  'form.hourSuffix': '',
  'form.minuteSuffix': '',
  'form.male': 'M',
  'form.female': 'F',
  'form.birthPlace': 'Birthplace',
  'form.citySearch': 'Choose City',
  'form.coordInput': 'Enter Coordinates',
  'form.manualInput': 'Manual Input',
  'form.latitude': 'Latitude',
  'form.longitude': 'Longitude',
  'form.coordinateInvalid': 'Please enter valid numeric coordinates.',
  'form.timezoneDefault': 'Inferred time zone:',
  'form.timezoneAutoDetectFailed': 'The time zone could not be inferred from the current coordinates. Please check the coordinates.',
  'form.dstActive': 'Daylight saving time (DST) in effect',
  'form.advanced': 'Advanced Settings',
  'form.jasiMethod': 'Ja-si Method (子時法)',
  'form.unified': 'Unified Ja-si',
  'form.split': 'Split Ja-si (Night)',
  'form.unifiedDesc': 'From 23:30, it is 子 hour, and the day pillar advances to the next day.',
  'form.splitDesc': '23:30–00:00 (night Ja-si) is 子 hour, but the day pillar remains on the current day.',
  'form.calculate': 'Calculate',
  'form.privacy1': 'All calculations are processed in your browser.',
  'form.privacy2': 'Your information is never sent to any server.',

  // CopyButton
  'copy.copy': 'Copy',
  'copy.copied': 'Copied ✓',
  'copy.aiCopy': 'Copy for AI Reading',

  // ThemeToggle
  'theme.system': 'Follow System',
  'theme.light': 'Light Mode',
  'theme.dark': 'Dark Mode',

  // CityCombobox
  'city.noResults': 'No results found',
  'city.korea': 'Korea',
  'city.world': 'World',
  'city.placeholder': 'Enter a city name',

  // Guide
  'guide.title': 'How to Use',
  'guide.step1': 'Enter your date of birth, time of birth, and gender in the form above.',
  'guide.step2a': 'Calculate',
  'guide.step2b': ' to see results for Saju, Ziwei Doushu, and your Natal Chart.',
  'guide.step3a': 'Click ',
  'guide.step3bold': 'Copy All for AI Reading',
  'guide.step3b': ' on the right side of the tabs to copy Saju + Ziwei Doushu + Natal Chart data at once. You can also use the ',
  'guide.step3bold2': 'Copy for AI Reading',
  'guide.step3c': ' button on each tab to copy individually.',
  'guide.step4': 'Paste it into an AI chat like Claude, ChatGPT, or Gemini, and ask for an interpretation.',
  'guide.askAI': 'Try asking AI like this',
  'guide.personality': 'Personality Analysis',
  'guide.personalityEx': 'Here are my Saju, Ziwei Doushu chart, and Natal Chart. Please analyze my personality strengths and weaknesses.',
  'guide.pasteData': '[Paste copied data here]',
  'guide.counseling': 'Life Advice',
  'guide.counselingEx': 'Based on the chart data below, list the top 3 challenges I may face in life and give me advice.',
  'guide.compatibility': 'Compatibility Reading',
  'guide.compatibilityEx': "I'll send two people's chart data. Please analyze the compatible aspects and potential areas of conflict.",
  'guide.pasteA': "[Paste A's data here]",
  'guide.pasteB': "[Paste B's data here]",

  // ProfileModal
  'profile.timeUnknown': 'Time unknown',
  'profile.manualInput': 'Manual input',
  'profile.male': 'M',
  'profile.female': 'F',
  'profile.ilju': 'Day Pillar',
  'profile.title': 'Manage Profiles',
  'profile.close': 'Close',
  'profile.desc': 'Profiles are stored in browser LocalStorage and will be deleted when browser data is cleared. ',
  'profile.export': 'Export',
  'profile.import': 'Import',
  'profile.backupSuffix': ' to back up.',
  'profile.namePlaceholder': 'Enter nickname',
  'profile.save': 'Save',
  'profile.cancel': 'Cancel',
  'profile.addNew': '+ Add current input as a new profile',
  'profile.empty': 'No saved profiles.',
  'profile.editName': 'Edit nickname',
  'profile.confirmDelete': 'Confirm?',
  'profile.storageError': 'Storage is full. Please delete unnecessary profiles.',
  'profile.importError': 'Unable to read the file. Please check that it is a valid JSON file.',

  // Saju - PillarTable
  'saju.sipsin': '十神',
  'saju.cheongan': '天干',
  'saju.jiji': '地支',
  'saju.unseong': '運星',
  'saju.sinsal': '神殺',
  'saju.janggan': '藏干',
  'saju.gongmang': '空亡',

  // Saju - DaewoonTable
  'saju.noData': 'No major cycle (大運) data available.',
  'saju.unknownTimeWarning': 'Calculated based on noon (12:00) without birth time. The start of major cycles may have an error of several months.',
  'saju.ageSuffix': '',

  // Saju - SinsalList
  'saju.sal.cheonul': 'Heavenly Noble (天乙貴人)',
  'saju.sal.cheonduk': 'Heavenly Virtue (天德貴人)',
  'saju.sal.wolduk': 'Monthly Virtue (月德貴人)',
  'saju.sal.munchang': 'Literary Star (文昌貴人)',
  'saju.sal.geumyeo': 'Golden Carriage (金輿祿)',
  'saju.sal.yangin': 'Blade Star (羊刃殺)',
  'saju.sal.dohwa': 'Peach Blossom (桃花殺)',
  'saju.sal.baekho': 'White Tiger (白虎殺)',
  'saju.sal.goegang': 'Chief Star (魁罡殺)',
  'saju.sal.hongyeom': 'Red Beauty (紅艶殺)',

  // Saju - TransitView
  'saju.transit.past': 'Past',
  'saju.transit.future': 'Upcoming',
  'saju.transit.futureBtn': 'Future',
  'saju.transit.pastBtn': 'Past',
  'saju.transit.1month': '1 month',
  'saju.transit.3months': '3 months',
  'saju.transit.6months': '6 months',
  'saju.transit.noRelation': ' months with no notable interactions',

  // Saju - Transit relation prefix
  'transit.stem': '天干',
  'transit.branch': '地支',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': 'Which cycle star each pillar\'s hidden stems are seated (坐) at in the day branch',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': 'Hidden Stems',
  'saju.injong.desc': '— Yang stem seeding for missing Ten Gods',

  // Ziwei
  'ziwei.needTime': 'Ziwei Doushu requires the time of birth.',
  'ziwei.needTimeDesc': 'The entire chart structure changes based on birth time. Please enter your time of birth.',

  // Natal
  'natal.loading': 'Loading Swiss Ephemeris...',
  'natal.error': 'Calculation Error',
  'natal.unknownTime': 'Calculated based on noon (12:00) without birth time.',
  'natal.unknownTimeDetail': 'The Moon may have up to ±6° error, and ASC / house placements are not displayed.',
  'natal.planet': 'Planet',
  'natal.sign': 'Sign',
  'natal.degree': 'Degree',
  'natal.house': 'House',

  // Natal - Planets
  'planet.Sun': 'Sun', 'planet.Moon': 'Moon', 'planet.Mercury': 'Mercury', 'planet.Venus': 'Venus',
  'planet.Mars': 'Mars', 'planet.Jupiter': 'Jupiter', 'planet.Saturn': 'Saturn', 'planet.Uranus': 'Uranus',
  'planet.Neptune': 'Neptune', 'planet.Pluto': 'Pluto', 'planet.Chiron': 'Chiron',
  'planet.NorthNode': 'North Node', 'planet.SouthNode': 'South Node', 'planet.Fortuna': 'Fortuna',

  // Natal - Zodiac Signs
  'zodiac.Aries': 'Aries', 'zodiac.Taurus': 'Taurus', 'zodiac.Gemini': 'Gemini', 'zodiac.Cancer': 'Cancer',
  'zodiac.Leo': 'Leo', 'zodiac.Virgo': 'Virgo', 'zodiac.Libra': 'Libra', 'zodiac.Scorpio': 'Scorpio',
  'zodiac.Sagittarius': 'Sagittarius', 'zodiac.Capricorn': 'Capricorn', 'zodiac.Aquarius': 'Aquarius', 'zodiac.Pisces': 'Pisces',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': 'Ari', 'zodiac.short.Taurus': 'Tau', 'zodiac.short.Gemini': 'Gem', 'zodiac.short.Cancer': 'Can',
  'zodiac.short.Leo': 'Leo', 'zodiac.short.Virgo': 'Vir', 'zodiac.short.Libra': 'Lib', 'zodiac.short.Scorpio': 'Sco',
  'zodiac.short.Sagittarius': 'Sag', 'zodiac.short.Capricorn': 'Cap', 'zodiac.short.Aquarius': 'Aqu', 'zodiac.short.Pisces': 'Pis',
}

export default en
