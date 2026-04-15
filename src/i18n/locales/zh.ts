const zh: Record<string, string> = {
  // App
  'app.subtitle1': '无需服务器，在浏览器中运行的',
  'app.subtitle.tool': '四柱八字 · 紫微斗数 · 西洋占星术',
  'app.subtitle2': '计算器',
  'app.subtitle3': '十神、大运、命盘、四化、出生星盘一次搞定',
  'app.profileManage': '档案管理',
  'app.tab.saju': '四柱八字',
  'app.tab.ziwei': '紫微斗数',
  'app.tab.natal': '出生星盘',
  'app.copyAll': 'AI 解读用',
  'app.copyAllSub': '全部复制',
  'app.intro': '简介',

  // BirthForm
  'form.birthDate': '出生日期（公历）',
  'form.yearSuffix': '年',
  'form.monthSuffix': '月',
  'form.daySuffix': '日',
  'form.kdt': '该时段处于88奥运会夏令时（KDT, UTC+10）期间，所有计算已自动调整。',
  'form.kstHistoricalOffset': '该日期处于韩国标准时的历史偏差时段（1948-1951 KDT、1954-1961 UTC+8:30/+9:30、1987-1988 KDT），所有计算已按 KST 壁钟自动规范化。',
  'form.dstGapError': '您输入的时间位于夏令时(DST)切换的空缺时段，实际并不存在。请确认出生记录的时区。',
  'form.time': '时间',
  'form.unknown': '不详',
  'form.hourSuffix': '时',
  'form.minuteSuffix': '分',
  'form.male': '男',
  'form.female': '女',
  'form.birthPlace': '出生地点',
  'form.citySearch': '选择城市',
  'form.coordInput': '输入坐标',
  'form.manualInput': '手动输入',
  'form.latitude': '纬度',
  'form.longitude': '经度',
  'form.coordinateInvalid': '请输入有效的数字坐标。',
  'form.timezoneDefault': '自动推断时区：',
  'form.timezoneAutoDetectFailed': '无法根据当前坐标自动推断时区，请检查坐标。',
  'form.dstActive': '夏令时(DST)适用中',
  'form.advanced': '高级设置',
  'form.jasiMethod': '子时法（子時法）',
  'form.unified': '统子时',
  'form.split': '夜子时',
  'form.unifiedDesc': '23:30起为子时，日柱顺延至次日。',
  'form.splitDesc': '23:30~00:00（夜子时）为子时，但日柱仍为当日。',
  'form.calculate': '计算',
  'form.privacy1': '所有计算均在浏览器中完成，',
  'form.privacy2': '您输入的信息不会发送到任何服务器。',

  // CopyButton
  'copy.copy': '复制',
  'copy.copied': '已复制 ✓',
  'copy.aiCopy': 'AI 解读用复制',

  // ThemeToggle
  'theme.system': '跟随系统设置',
  'theme.light': '浅色模式',
  'theme.dark': '深色模式',

  // CityCombobox
  'city.noResults': '无搜索结果',
  'city.korea': '韩国',
  'city.world': '世界',
  'city.placeholder': '请输入城市名称',

  // Guide
  'guide.title': '使用方法',
  'guide.step1': '在上方表单中输入出生日期、出生时间和性别。',
  'guide.step2a': '计算',
  'guide.step2b': ' 按钮后，将显示四柱八字、紫微斗数、出生星盘的结果。',
  'guide.step3a': '点击标签栏右侧的 ',
  'guide.step3bold': 'AI 解读用 全部复制',
  'guide.step3b': '，可一次性复制四柱八字 + 紫微斗数 + 出生星盘数据。也可通过各标签页的 ',
  'guide.step3bold2': 'AI 解读用复制',
  'guide.step3c': ' 按钮单独复制。',
  'guide.step4': '粘贴到 Claude、ChatGPT、Gemini 等 AI 对话中，请求解读。',
  'guide.askAI': '可以这样问 AI',
  'guide.personality': '性格分析',
  'guide.personalityEx': '以下是我的四柱八字、紫微斗数命盘和出生星盘，请分析我的性格优势和不足。',
  'guide.pasteData': '[粘贴复制的数据]',
  'guide.counseling': '烦恼咨询',
  'guide.counselingEx': '请根据以下命盘数据，列出我人生中可能面临的 Top 3 困难并给出建议。',
  'guide.compatibility': '合盘分析',
  'guide.compatibilityEx': '我发送两个人的命盘数据，请分析性格上的契合点和可能的冲突点。',
  'guide.pasteA': '[粘贴 A 的数据]',
  'guide.pasteB': '[粘贴 B 的数据]',

  // ProfileModal
  'profile.timeUnknown': '时间不详',
  'profile.manualInput': '手动输入',
  'profile.male': '男',
  'profile.female': '女',
  'profile.ilju': '日柱',
  'profile.title': '档案管理',
  'profile.close': '关闭',
  'profile.desc': '档案保存在浏览器本地存储（LocalStorage）中，清除浏览器数据时将一并删除。',
  'profile.export': '导出',
  'profile.import': '导入',
  'profile.backupSuffix': '进行备份。',
  'profile.namePlaceholder': '输入别名',
  'profile.save': '保存',
  'profile.cancel': '取消',
  'profile.addNew': '+ 将输入的信息添加为新档案',
  'profile.empty': '暂无已保存的档案。',
  'profile.editName': '修改别名',
  'profile.confirmDelete': '确认？',
  'profile.storageError': '存储空间不足，请删除不需要的档案。',
  'profile.importError': '无法读取文件，请确认是否为有效的 JSON 文件。',

  // Saju - PillarTable
  'saju.sipsin': '十神',
  'saju.cheongan': '天干',
  'saju.jiji': '地支',
  'saju.unseong': '运星',
  'saju.sinsal': '神煞',
  'saju.janggan': '藏干',
  'saju.gongmang': '空亡',

  // Saju - DaewoonTable
  'saju.noData': '无大运数据。',
  'saju.unknownTimeWarning': '未输入出生时间，以正午（12:00）为基准计算，大运起始时间可能有数月误差。',
  'saju.ageSuffix': '岁',

  // Saju - SinsalList
  'saju.sal.cheonul': '天乙贵人',
  'saju.sal.cheonduk': '天德贵人',
  'saju.sal.wolduk': '月德贵人',
  'saju.sal.munchang': '文昌贵人',
  'saju.sal.geumyeo': '金舆禄',
  'saju.sal.yangin': '羊刃煞',
  'saju.sal.dohwa': '桃花煞',
  'saju.sal.baekho': '白虎煞',
  'saju.sal.goegang': '魁罡煞',
  'saju.sal.hongyeom': '红艳煞',

  // Saju - TransitView
  'saju.transit.past': '过去',
  'saju.transit.future': '未来',
  'saju.transit.futureBtn': '未来',
  'saju.transit.pastBtn': '过去',
  'saju.transit.1month': '1个月',
  'saju.transit.3months': '3个月',
  'saju.transit.6months': '6个月',
  'saju.transit.noRelation': '个月内无特殊关系',

  // Saju - Transit relation prefix
  'transit.stem': '天干',
  'transit.branch': '地支',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': '各柱藏干在日支中对应的运星（坐）',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': '藏干',
  'saju.injong.desc': '— 缺失十神的阳干引种',

  // Ziwei
  'ziwei.needTime': '紫微斗数需要出生时间。',
  'ziwei.needTimeDesc': '命盘结构随出生时间变化，请输入出生时间。',

  // Natal
  'natal.loading': '正在加载 Swiss Ephemeris...',
  'natal.error': '计算错误',
  'natal.unknownTime': '未输入出生时间，以正午（12:00）为基准计算。',
  'natal.unknownTimeDetail': '月亮可能有最大 ±6° 的误差，ASC 和宫位配置不予显示。',
  'natal.planet': '行星',
  'natal.sign': '星座',
  'natal.degree': '度数',
  'natal.house': '宫位',

  // Natal - Planets
  'planet.Sun': '太阳', 'planet.Moon': '月亮', 'planet.Mercury': '水星', 'planet.Venus': '金星',
  'planet.Mars': '火星', 'planet.Jupiter': '木星', 'planet.Saturn': '土星', 'planet.Uranus': '天王星',
  'planet.Neptune': '海王星', 'planet.Pluto': '冥王星', 'planet.Chiron': '凯龙',
  'planet.NorthNode': '北交点', 'planet.SouthNode': '南交点', 'planet.Fortuna': '福点',

  // Natal - Zodiac Signs
  'zodiac.Aries': '白羊座', 'zodiac.Taurus': '金牛座', 'zodiac.Gemini': '双子座', 'zodiac.Cancer': '巨蟹座',
  'zodiac.Leo': '狮子座', 'zodiac.Virgo': '处女座', 'zodiac.Libra': '天秤座', 'zodiac.Scorpio': '天蝎座',
  'zodiac.Sagittarius': '射手座', 'zodiac.Capricorn': '摩羯座', 'zodiac.Aquarius': '水瓶座', 'zodiac.Pisces': '双鱼座',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': '白羊', 'zodiac.short.Taurus': '金牛', 'zodiac.short.Gemini': '双子', 'zodiac.short.Cancer': '巨蟹',
  'zodiac.short.Leo': '狮子', 'zodiac.short.Virgo': '处女', 'zodiac.short.Libra': '天秤', 'zodiac.short.Scorpio': '天蝎',
  'zodiac.short.Sagittarius': '射手', 'zodiac.short.Capricorn': '摩羯', 'zodiac.short.Aquarius': '水瓶', 'zodiac.short.Pisces': '双鱼',
}

export default zh
