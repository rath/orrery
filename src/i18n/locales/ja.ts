const ja: Record<string, string> = {
  // App
  'app.subtitle1': 'サーバー不要、ブラウザで動作する',
  'app.subtitle.tool': '四柱八字 · 紫微斗数 · 西洋占星術',
  'app.subtitle2': '計算機',
  'app.subtitle3': '十神、大運、命盤、四化、出生チャートまで一度に',
  'app.profileManage': 'プロフィール管理',
  'app.tab.saju': '四柱八字',
  'app.tab.ziwei': '紫微斗数',
  'app.tab.natal': '出生チャート',
  'app.copyAll': 'AI 鑑定用',
  'app.copyAllSub': 'すべてコピー',
  'app.intro': '紹介',

  // BirthForm
  'form.birthDate': '生年月日（新暦）',
  'form.yearSuffix': '年',
  'form.monthSuffix': '月',
  'form.daySuffix': '日',
  'form.kdt': '88オリンピック夏時間（KDT, UTC+10）適用期間です。すべての計算に自動反映されます。',
  'form.kstHistoricalOffset': 'この日付は韓国標準時の歴史的な時差変動期間（1948-1951 KDT、1954-1961 UTC+8:30/+9:30、1987-1988 KDT）に該当し、KSTの壁時計基準で自動的に正規化されます。',
  'form.dstGapError': '入力された時刻はサマータイム(DST)切替により存在しない時間帯です。出生記録のタイムゾーンを再確認してください。',
  'form.time': '時間',
  'form.unknown': '不明',
  'form.hourSuffix': '時',
  'form.minuteSuffix': '分',
  'form.male': '男',
  'form.female': '女',
  'form.birthPlace': '出生地',
  'form.citySearch': '都市を選択',
  'form.coordInput': '座標を入力',
  'form.manualInput': '手動入力',
  'form.latitude': '緯度',
  'form.longitude': '経度',
  'form.coordinateInvalid': '座標は有効な数値で入力してください。',
  'form.timezoneDefault': '自動推定タイムゾーン:',
  'form.timezoneAutoDetectFailed': '現在の座標からタイムゾーンを自動推定できませんでした。座標を確認してください。',
  'form.dstActive': 'サマータイム(DST)適用中',
  'form.advanced': '詳細設定',
  'form.jasiMethod': '子時法（子時法）',
  'form.unified': '統子時',
  'form.split': '夜子時',
  'form.unifiedDesc': '23:30から子時とし、日柱を翌日に繰り越します。',
  'form.splitDesc': '23:30〜00:00（夜子時）は子時ですが、日柱は当日のまま維持します。',
  'form.calculate': '計算',
  'form.privacy1': 'すべての計算はブラウザ内で処理され、',
  'form.privacy2': '入力された情報はいかなるサーバーにも送信されません。',

  // CopyButton
  'copy.copy': 'コピー',
  'copy.copied': 'コピー済み ✓',
  'copy.aiCopy': 'AI 鑑定用コピー',

  // ThemeToggle
  'theme.system': 'システム設定に従う',
  'theme.light': 'ライトモード',
  'theme.dark': 'ダークモード',

  // CityCombobox
  'city.noResults': '検索結果なし',
  'city.korea': '韓国',
  'city.world': '世界',
  'city.placeholder': '都市名を入力してください',

  // Guide
  'guide.title': '使い方',
  'guide.step1': '上のフォームに生年月日、生まれた時間、性別を入力します。',
  'guide.step2a': '計算',
  'guide.step2b': ' ボタンを押すと、四柱八字・紫微斗数・出生チャートの結果が表示されます。',
  'guide.step3a': 'タブ右側の ',
  'guide.step3bold': 'AI 鑑定用 すべてコピー',
  'guide.step3b': 'を押すと、四柱八字 + 紫微斗数 + 出生チャートのデータが一括コピーされます。各タブの ',
  'guide.step3bold2': 'AI 鑑定用コピー',
  'guide.step3c': ' ボタンで個別コピーもできます。',
  'guide.step4': 'Claude、ChatGPT、Gemini などの AI チャットに貼り付けて鑑定を依頼してください。',
  'guide.askAI': 'AI にこう聞いてみましょう',
  'guide.personality': '性格分析',
  'guide.personalityEx': '以下は私の四柱八字、紫微斗数の命盤、出生チャートです。性格的な強みと弱みを分析してください。',
  'guide.pasteData': '[コピーしたデータを貼り付け]',
  'guide.counseling': 'お悩み相談',
  'guide.counselingEx': '以下の命盤データに基づいて、人生で苦労しやすい点 Top 3 を挙げてアドバイスしてください。',
  'guide.compatibility': '相性診断',
  'guide.compatibilityEx': '二人の命盤データを送ります。性格的に合う部分とぶつかりやすい部分を分析してください。',
  'guide.pasteA': '[A のデータを貼り付け]',
  'guide.pasteB': '[B のデータを貼り付け]',

  // ProfileModal
  'profile.timeUnknown': '時間不明',
  'profile.manualInput': '手動入力',
  'profile.male': '男',
  'profile.female': '女',
  'profile.ilju': '日柱',
  'profile.title': 'プロフィール管理',
  'profile.close': '閉じる',
  'profile.desc': 'プロフィールはブラウザのローカルストレージ（LocalStorage）に保存され、ブラウザデータの削除時に一緒に消去されます。',
  'profile.export': 'エクスポート',
  'profile.import': 'インポート',
  'profile.backupSuffix': 'でバックアップできます。',
  'profile.namePlaceholder': 'ニックネームを入力',
  'profile.save': '保存',
  'profile.cancel': 'キャンセル',
  'profile.addNew': '+ 入力した情報で新しいプロフィールを追加',
  'profile.empty': '保存されたプロフィールはありません。',
  'profile.editName': 'ニックネーム変更',
  'profile.confirmDelete': '削除しますか？',
  'profile.storageError': '保存容量が不足しています。不要なプロフィールを削除してください。',
  'profile.importError': 'ファイルを読み込めません。正しい JSON ファイルか確認してください。',

  // Saju - PillarTable
  'saju.sipsin': '十神',
  'saju.cheongan': '天干',
  'saju.jiji': '地支',
  'saju.unseong': '運星',
  'saju.sinsal': '神殺',
  'saju.janggan': '蔵干',
  'saju.gongmang': '空亡',

  // Saju - DaewoonTable
  'saju.noData': '大運データがありません。',
  'saju.unknownTimeWarning': '出生時間未入力のため正午（12:00）基準で計算しており、大運の開始時期に数か月の誤差がある可能性があります。',
  'saju.ageSuffix': '歳',

  // Saju - SinsalList
  'saju.sal.cheonul': '天乙貴人',
  'saju.sal.cheonduk': '天徳貴人',
  'saju.sal.wolduk': '月徳貴人',
  'saju.sal.munchang': '文昌貴人',
  'saju.sal.geumyeo': '金輿禄',
  'saju.sal.yangin': '羊刃殺',
  'saju.sal.dohwa': '桃花殺',
  'saju.sal.baekho': '白虎殺',
  'saju.sal.goegang': '魁罡殺',
  'saju.sal.hongyeom': '紅艶殺',

  // Saju - TransitView
  'saju.transit.past': '過去',
  'saju.transit.future': '今後',
  'saju.transit.futureBtn': '未来',
  'saju.transit.pastBtn': '過去',
  'saju.transit.1month': '1か月',
  'saju.transit.3months': '3か月',
  'saju.transit.6months': '6か月',
  'saju.transit.noRelation': 'か月間、特別な関係なし',

  // Saju - Transit relation prefix
  'transit.stem': '天干',
  'transit.branch': '地支',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': '各柱の蔵干が日支でどの運星に坐（坐）するか',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': '蔵干',
  'saju.injong.desc': '— 欠落十神の陽干引種',

  // Ziwei
  'ziwei.needTime': '紫微斗数には出生時間が必須です。',
  'ziwei.needTimeDesc': '出生時間によって命盤の構造が変わります。出生時間を入力してください。',

  // Natal
  'natal.loading': 'Swiss Ephemeris 読み込み中...',
  'natal.error': '計算エラー',
  'natal.unknownTime': '出生時間未入力のため、正午（12:00）基準で計算した結果です。',
  'natal.unknownTimeDetail': '月は最大 ±6° の誤差がある可能性があり、ASC・ハウス配置は表示しません。',
  'natal.planet': '惑星',
  'natal.sign': '星座',
  'natal.degree': '度数',
  'natal.house': 'ハウス',

  // Natal - Planets
  'planet.Sun': '太陽', 'planet.Moon': '月', 'planet.Mercury': '水星', 'planet.Venus': '金星',
  'planet.Mars': '火星', 'planet.Jupiter': '木星', 'planet.Saturn': '土星', 'planet.Uranus': '天王星',
  'planet.Neptune': '海王星', 'planet.Pluto': '冥王星', 'planet.Chiron': 'キロン',
  'planet.NorthNode': '北交点', 'planet.SouthNode': '南交点', 'planet.Fortuna': 'フォーチュナ',

  // Natal - Zodiac Signs
  'zodiac.Aries': '牡羊座', 'zodiac.Taurus': '牡牛座', 'zodiac.Gemini': '双子座', 'zodiac.Cancer': '蟹座',
  'zodiac.Leo': '獅子座', 'zodiac.Virgo': '乙女座', 'zodiac.Libra': '天秤座', 'zodiac.Scorpio': '蠍座',
  'zodiac.Sagittarius': '射手座', 'zodiac.Capricorn': '山羊座', 'zodiac.Aquarius': '水瓶座', 'zodiac.Pisces': '魚座',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': '牡羊', 'zodiac.short.Taurus': '牡牛', 'zodiac.short.Gemini': '双子', 'zodiac.short.Cancer': '蟹',
  'zodiac.short.Leo': '獅子', 'zodiac.short.Virgo': '乙女', 'zodiac.short.Libra': '天秤', 'zodiac.short.Scorpio': '蠍',
  'zodiac.short.Sagittarius': '射手', 'zodiac.short.Capricorn': '山羊', 'zodiac.short.Aquarius': '水瓶', 'zodiac.short.Pisces': '魚',
}

export default ja
