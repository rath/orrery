const de: Record<string, string> = {
  // App
  'app.subtitle1': 'Ein serverloser, browserbasierter',
  'app.subtitle.tool': 'Saju · Zi Wei Dou Shu · Geburtshoroskop',
  'app.subtitle2': 'Rechner',
  'app.subtitle3': 'Chinesische und westliche Astrologie an einem Ort',
  'app.profileManage': 'Profile verwalten',
  'app.tab.saju': 'Saju (四柱八字)',
  'app.tab.ziwei': 'Zi Wei Dou Shu (紫微斗数)',
  'app.tab.natal': 'Geburtshoroskop',
  'app.copyAll': 'Für KI-Deutung',
  'app.copyAllSub': 'Alles kopieren',
  'app.intro': 'Info',

  // BirthForm
  'form.birthDate': 'Geburtsdatum (Sonnenkalender)',
  'form.yearSuffix': '',
  'form.monthSuffix': '',
  'form.daySuffix': '',
  'form.kdt': 'Dieser Zeitraum fällt in die Sommerzeit der Olympischen Spiele 1988 (KDT, UTC+10). Alle Berechnungen werden automatisch angepasst.',
  'form.kstHistoricalOffset': 'Dieses Datum fällt in eine historische Zeitzonenabweichung Koreas (1948–1951 KDT, 1954–1961 UTC+8:30/+9:30, 1987–1988 KDT). Alle Berechnungen werden automatisch auf die KST-Uhrzeit normalisiert.',
  'form.dstGapError': 'Die eingegebene Zeit liegt in der Lücke der Sommerzeitumstellung und existiert nicht. Bitte prüfen Sie die Zeitzone des Geburtseintrags.',
  'form.time': 'Uhrzeit',
  'form.unknown': 'Unbekannt',
  'form.hourSuffix': '',
  'form.minuteSuffix': '',
  'form.male': 'M',
  'form.female': 'W',
  'form.birthPlace': 'Geburtsort',
  'form.citySearch': 'Stadt',
  'form.coordInput': 'Koordinaten',
  'form.manualInput': 'Manuelle Eingabe',
  'form.latitude': 'Breitengrad',
  'form.longitude': 'Längengrad',
  'form.coordinateInvalid': 'Bitte gültige numerische Koordinaten eingeben.',
  'form.timezoneDefault': 'Ermittelte Zeitzone:',
  'form.timezoneAutoDetectFailed': 'Aus den aktuellen Koordinaten konnte keine Zeitzone ermittelt werden. Bitte prüfen Sie die Koordinaten.',
  'form.dstActive': 'Sommerzeit (DST) aktiv',
  'form.advanced': 'Erweiterte Einstellungen',
  'form.jasiMethod': 'Ja-si-Methode (子時法)',
  'form.unified': 'Einheitliches Ja-si',
  'form.split': 'Geteiltes Ja-si (Nacht)',
  'form.unifiedDesc': 'Ab 23:30 gilt die 子-Stunde, und die Tagessäule wechselt auf den nächsten Tag.',
  'form.splitDesc': '23:30–00:00 (Nacht-Ja-si) ist die 子-Stunde, die Tagessäule bleibt jedoch beim aktuellen Tag.',
  'form.calculate': 'Berechnen',
  'form.privacy1': 'Alle Berechnungen erfolgen in Ihrem Browser.',
  'form.privacy2': 'Ihre Daten werden an keinen Server gesendet.',

  // CopyButton
  'copy.copy': 'Kopieren',
  'copy.copied': 'Kopiert ✓',
  'copy.aiCopy': 'Für KI-Deutung kopieren',

  // ThemeToggle
  'theme.system': 'Systemeinstellung',
  'theme.light': 'Heller Modus',
  'theme.dark': 'Dunkler Modus',

  // LanguageMenu
  'lang.select': 'Sprache wählen',

  // Date formats ({m} = month, {d} = day)
  'date.monthDay': '{d}.{m}.',

  // CityCombobox
  'city.noResults': 'Keine Ergebnisse',
  'city.korea': 'Korea',
  'city.world': 'Welt',
  'city.placeholder': 'Stadtnamen eingeben',

  // Guide
  'guide.title': 'Anleitung',
  'guide.step1': 'Geben Sie oben im Formular Geburtsdatum, Geburtszeit und Geschlecht ein.',
  'guide.step2a': 'Berechnen',
  'guide.step2b': ' anklicken, um Saju, Zi Wei Dou Shu und Ihr Geburtshoroskop zu sehen.',
  'guide.step3a': 'Mit ',
  'guide.step3bold': 'Alles kopieren für KI-Deutung',
  'guide.step3b': ' rechts neben den Tabs kopieren Sie Saju + Zi Wei Dou Shu + Geburtshoroskop auf einmal. Mit ',
  'guide.step3bold2': 'Für KI-Deutung kopieren',
  'guide.step3c': ' in jedem Tab kopieren Sie die Daten einzeln.',
  'guide.step4': 'Fügen Sie den Text in einen KI-Chat wie Claude, ChatGPT oder Gemini ein und bitten Sie um eine Deutung.',
  'guide.askAI': 'So können Sie die KI fragen',
  'guide.personality': 'Persönlichkeitsanalyse',
  'guide.personalityEx': 'Hier sind mein Saju, mein Zi-Wei-Dou-Shu-Horoskop und mein Geburtshoroskop. Bitte analysiere die Stärken und Schwächen meiner Persönlichkeit.',
  'guide.pasteData': '[Kopierte Daten hier einfügen]',
  'guide.counseling': 'Lebensberatung',
  'guide.counselingEx': 'Nenne mir anhand der folgenden Horoskopdaten die drei größten Herausforderungen in meinem Leben und gib mir Rat.',
  'guide.compatibility': 'Partnerschaftsanalyse',
  'guide.compatibilityEx': 'Ich sende die Horoskopdaten von zwei Personen. Bitte analysiere die harmonischen Aspekte und mögliche Konfliktbereiche.',
  'guide.pasteA': '[Daten von A hier einfügen]',
  'guide.pasteB': '[Daten von B hier einfügen]',

  // ProfileModal
  'profile.timeUnknown': 'Zeit unbekannt',
  'profile.manualInput': 'Manuelle Eingabe',
  'profile.male': 'M',
  'profile.female': 'W',
  'profile.ilju': 'Tagessäule',
  'profile.title': 'Profile verwalten',
  'profile.close': 'Schließen',
  'profile.desc': 'Profile werden im LocalStorage des Browsers gespeichert und beim Löschen der Browserdaten entfernt. Zur Sicherung ',
  'profile.export': 'Exportieren',
  'profile.import': 'Importieren',
  'profile.backupSuffix': ' verwenden.',
  'profile.namePlaceholder': 'Spitznamen eingeben',
  'profile.save': 'Speichern',
  'profile.cancel': 'Abbrechen',
  'profile.addNew': '+ Aktuelle Eingabe als neues Profil hinzufügen',
  'profile.empty': 'Keine gespeicherten Profile.',
  'profile.editName': 'Spitznamen bearbeiten',
  'profile.confirmDelete': 'Wirklich löschen?',
  'profile.storageError': 'Der Speicher ist voll. Bitte nicht benötigte Profile löschen.',
  'profile.importError': 'Die Datei konnte nicht gelesen werden. Bitte prüfen Sie, ob es sich um eine gültige JSON-Datei handelt.',

  // Saju - PillarTable
  'saju.sipsin': '十神',
  'saju.cheongan': '天干',
  'saju.jiji': '地支',
  'saju.unseong': '運星',
  'saju.sinsal': '神殺',
  'saju.janggan': '藏干',
  'saju.gongmang': '空亡',

  // Saju - DaewoonTable
  'saju.noData': 'Keine Daten zu den großen Zyklen (大運) vorhanden.',
  'saju.unknownTimeWarning': 'Ohne Geburtszeit auf Basis von 12:00 Uhr berechnet. Der Beginn der großen Zyklen kann um mehrere Monate abweichen.',
  'saju.ageSuffix': '',

  // Saju - SinsalList
  'saju.sal.cheonul': 'Himmlischer Edler (天乙貴人)',
  'saju.sal.cheonduk': 'Himmlische Tugend (天德貴人)',
  'saju.sal.wolduk': 'Monatstugend (月德貴人)',
  'saju.sal.munchang': 'Stern der Gelehrsamkeit (文昌貴人)',
  'saju.sal.geumyeo': 'Goldene Kutsche (金輿祿)',
  'saju.sal.yangin': 'Klingenstern (羊刃殺)',
  'saju.sal.dohwa': 'Pfirsichblüte (桃花殺)',
  'saju.sal.baekho': 'Weißer Tiger (白虎殺)',
  'saju.sal.goegang': 'Anführerstern (魁罡殺)',
  'saju.sal.hongyeom': 'Rote Schönheit (紅艶殺)',

  // Saju - TransitView
  'saju.transit.past': 'Vergangenheit',
  'saju.transit.future': 'Bevorstehend',
  'saju.transit.futureBtn': 'Zukunft',
  'saju.transit.pastBtn': 'Vergangenheit',
  'saju.transit.1month': '1 Monat',
  'saju.transit.3months': '3 Monate',
  'saju.transit.6months': '6 Monate',
  'saju.transit.noRelation': ' Monate ohne nennenswerte Wechselwirkungen',

  // Saju - Transit relation prefix
  'transit.stem': '天干',
  'transit.branch': '地支',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': 'Auf welchem Zyklusstern die verborgenen Stämme jeder Säule im Tageszweig sitzen (坐)',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': 'Verborgene Stämme',
  'saju.injong.desc': '— Yang-Stamm-Aussaat für fehlende Zehn Götter',

  // Ziwei
  'ziwei.needTime': 'Zi Wei Dou Shu benötigt die Geburtszeit.',
  'ziwei.needTimeDesc': 'Die gesamte Struktur des Horoskops hängt von der Geburtszeit ab. Bitte geben Sie Ihre Geburtszeit ein.',

  // Natal
  'natal.loading': 'Swiss Ephemeris wird geladen...',
  'natal.error': 'Berechnungsfehler',
  'natal.unknownTime': 'Ohne Geburtszeit auf Basis von 12:00 Uhr berechnet.',
  'natal.unknownTimeDetail': 'Der Mond kann bis zu ±6° abweichen; AC und Häuserstellungen werden nicht angezeigt.',
  'natal.planet': 'Planet',
  'natal.sign': 'Zeichen',
  'natal.degree': 'Grad',
  'natal.house': 'Haus',

  // Natal - Planets
  'planet.Sun': 'Sonne', 'planet.Moon': 'Mond', 'planet.Mercury': 'Merkur', 'planet.Venus': 'Venus',
  'planet.Mars': 'Mars', 'planet.Jupiter': 'Jupiter', 'planet.Saturn': 'Saturn', 'planet.Uranus': 'Uranus',
  'planet.Neptune': 'Neptun', 'planet.Pluto': 'Pluto', 'planet.Chiron': 'Chiron',
  'planet.NorthNode': 'Nördlicher Mondknoten', 'planet.SouthNode': 'Südlicher Mondknoten', 'planet.Fortuna': 'Glückspunkt',

  // Natal - Zodiac Signs
  'zodiac.Aries': 'Widder', 'zodiac.Taurus': 'Stier', 'zodiac.Gemini': 'Zwillinge', 'zodiac.Cancer': 'Krebs',
  'zodiac.Leo': 'Löwe', 'zodiac.Virgo': 'Jungfrau', 'zodiac.Libra': 'Waage', 'zodiac.Scorpio': 'Skorpion',
  'zodiac.Sagittarius': 'Schütze', 'zodiac.Capricorn': 'Steinbock', 'zodiac.Aquarius': 'Wassermann', 'zodiac.Pisces': 'Fische',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': 'Wid', 'zodiac.short.Taurus': 'Sti', 'zodiac.short.Gemini': 'Zwi', 'zodiac.short.Cancer': 'Kre',
  'zodiac.short.Leo': 'Löw', 'zodiac.short.Virgo': 'Jun', 'zodiac.short.Libra': 'Waa', 'zodiac.short.Scorpio': 'Sko',
  'zodiac.short.Sagittarius': 'Sch', 'zodiac.short.Capricorn': 'Ste', 'zodiac.short.Aquarius': 'Was', 'zodiac.short.Pisces': 'Fis',
}

export default de
