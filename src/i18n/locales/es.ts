const es: Record<string, string> = {
  // App
  'app.subtitle1': 'Calculadora de',
  'app.subtitle.tool': 'Saju · Zi Wei Dou Shu · Carta natal',
  'app.subtitle2': 'sin servidor, en el navegador',
  'app.subtitle3': 'Astrología china y occidental en un solo lugar',
  'app.profileManage': 'Gestionar perfiles',
  'app.tab.saju': 'Saju (四柱八字)',
  'app.tab.ziwei': 'Zi Wei Dou Shu (紫微斗数)',
  'app.tab.natal': 'Carta natal',
  'app.copyAll': 'Para lectura con IA',
  'app.copyAllSub': 'Copiar todo',
  'app.intro': 'Acerca de',

  // BirthForm
  'form.birthDate': 'Fecha de nacimiento (calendario solar)',
  'form.yearSuffix': '',
  'form.monthSuffix': '',
  'form.daySuffix': '',
  'form.kdt': 'Este período corresponde al horario de verano de los Juegos Olímpicos de 1988 (KDT, UTC+10). Todos los cálculos se ajustan automáticamente.',
  'form.kstHistoricalOffset': 'Esta fecha corresponde a una anomalía histórica de la zona horaria coreana (1948–1951 KDT, 1954–1961 UTC+8:30/+9:30, 1987–1988 KDT). Todos los cálculos se normalizan automáticamente a la hora oficial KST.',
  'form.dstGapError': 'La hora introducida cae en el salto del horario de verano y no existe. Compruebe la zona horaria del registro de nacimiento.',
  'form.time': 'Hora',
  'form.unknown': 'Desconocida',
  'form.hourSuffix': '',
  'form.minuteSuffix': '',
  'form.male': 'H',
  'form.female': 'M',
  'form.birthPlace': 'Lugar de nacimiento',
  'form.citySearch': 'Ciudad',
  'form.coordInput': 'Coordenadas',
  'form.manualInput': 'Entrada manual',
  'form.latitude': 'Latitud',
  'form.longitude': 'Longitud',
  'form.coordinateInvalid': 'Introduzca coordenadas numéricas válidas.',
  'form.timezoneDefault': 'Zona horaria inferida:',
  'form.timezoneAutoDetectFailed': 'No se pudo inferir la zona horaria a partir de las coordenadas actuales. Compruebe las coordenadas.',
  'form.dstActive': 'Horario de verano (DST) en vigor',
  'form.advanced': 'Ajustes avanzados',
  'form.jasiMethod': 'Método Ja-si (子時法)',
  'form.unified': 'Ja-si unificado',
  'form.split': 'Ja-si dividido (nocturno)',
  'form.unifiedDesc': 'A partir de las 23:30 rige la hora 子 y el pilar del día avanza al día siguiente.',
  'form.splitDesc': 'De 23:30 a 00:00 (Ja-si nocturno) rige la hora 子, pero el pilar del día se mantiene en el día actual.',
  'form.calculate': 'Calcular',
  'form.privacy1': 'Todos los cálculos se realizan en su navegador.',
  'form.privacy2': 'Sus datos nunca se envían a ningún servidor.',

  // CopyButton
  'copy.copy': 'Copiar',
  'copy.copied': 'Copiado ✓',
  'copy.aiCopy': 'Copiar para lectura con IA',

  // ThemeToggle
  'theme.system': 'Según el sistema',
  'theme.light': 'Modo claro',
  'theme.dark': 'Modo oscuro',

  // LanguageMenu
  'lang.select': 'Seleccionar idioma',

  // Date formats ({m} = month, {d} = day)
  'date.monthDay': '{d}/{m}',

  // CityCombobox
  'city.noResults': 'Sin resultados',
  'city.korea': 'Corea',
  'city.world': 'Mundo',
  'city.placeholder': 'Introduzca el nombre de la ciudad',

  // Guide
  'guide.title': 'Cómo usar',
  'guide.step1': 'Introduzca su fecha de nacimiento, hora de nacimiento y sexo en el formulario superior.',
  'guide.step2a': 'Calcular',
  'guide.step2b': ' para ver los resultados de Saju, Zi Wei Dou Shu y su carta natal.',
  'guide.step3a': 'Pulse ',
  'guide.step3bold': 'Copiar todo para lectura con IA',
  'guide.step3b': ' a la derecha de las pestañas para copiar Saju + Zi Wei Dou Shu + carta natal de una vez. También puede usar el botón ',
  'guide.step3bold2': 'Copiar para lectura con IA',
  'guide.step3c': ' de cada pestaña para copiarlos por separado.',
  'guide.step4': 'Péguelo en un chat de IA como Claude, ChatGPT o Gemini y pida una interpretación.',
  'guide.askAI': 'Pruebe a preguntar a la IA así',
  'guide.personality': 'Análisis de personalidad',
  'guide.personalityEx': 'Aquí están mi Saju, mi carta de Zi Wei Dou Shu y mi carta natal. Analiza los puntos fuertes y débiles de mi personalidad.',
  'guide.pasteData': '[Pegue aquí los datos copiados]',
  'guide.counseling': 'Consejos de vida',
  'guide.counselingEx': 'A partir de los datos de la carta siguiente, enumera los 3 mayores retos que puedo afrontar en la vida y dame consejos.',
  'guide.compatibility': 'Lectura de compatibilidad',
  'guide.compatibilityEx': 'Enviaré los datos de las cartas de dos personas. Analiza los aspectos compatibles y las posibles áreas de conflicto.',
  'guide.pasteA': '[Pegue aquí los datos de A]',
  'guide.pasteB': '[Pegue aquí los datos de B]',

  // ProfileModal
  'profile.timeUnknown': 'Hora desconocida',
  'profile.manualInput': 'Entrada manual',
  'profile.male': 'H',
  'profile.female': 'M',
  'profile.ilju': 'Pilar del día',
  'profile.title': 'Gestionar perfiles',
  'profile.close': 'Cerrar',
  'profile.desc': 'Los perfiles se guardan en el LocalStorage del navegador y se eliminan al borrar los datos del navegador. Use ',
  'profile.export': 'Exportar',
  'profile.import': 'Importar',
  'profile.backupSuffix': ' para hacer una copia de seguridad.',
  'profile.namePlaceholder': 'Introduzca un apodo',
  'profile.save': 'Guardar',
  'profile.cancel': 'Cancelar',
  'profile.addNew': '+ Añadir la entrada actual como nuevo perfil',
  'profile.empty': 'No hay perfiles guardados.',
  'profile.editName': 'Editar apodo',
  'profile.confirmDelete': '¿Confirmar?',
  'profile.storageError': 'El almacenamiento está lleno. Elimine los perfiles que no necesite.',
  'profile.importError': 'No se pudo leer el archivo. Compruebe que sea un archivo JSON válido.',

  // Saju - PillarTable
  'saju.sipsin': '十神',
  'saju.cheongan': '天干',
  'saju.jiji': '地支',
  'saju.unseong': '運星',
  'saju.sinsal': '神殺',
  'saju.janggan': '藏干',
  'saju.gongmang': '空亡',

  // Saju - DaewoonTable
  'saju.noData': 'No hay datos de ciclos mayores (大運).',
  'saju.unknownTimeWarning': 'Calculado a partir del mediodía (12:00) sin hora de nacimiento. El inicio de los ciclos mayores puede tener un error de varios meses.',
  'saju.ageSuffix': '',

  // Saju - SinsalList
  'saju.sal.cheonul': 'Noble celestial (天乙貴人)',
  'saju.sal.cheonduk': 'Virtud celestial (天德貴人)',
  'saju.sal.wolduk': 'Virtud mensual (月德貴人)',
  'saju.sal.munchang': 'Estrella literaria (文昌貴人)',
  'saju.sal.geumyeo': 'Carruaje dorado (金輿祿)',
  'saju.sal.yangin': 'Estrella de la hoja (羊刃殺)',
  'saju.sal.dohwa': 'Flor de melocotón (桃花殺)',
  'saju.sal.baekho': 'Tigre blanco (白虎殺)',
  'saju.sal.goegang': 'Estrella del jefe (魁罡殺)',
  'saju.sal.hongyeom': 'Belleza roja (紅艶殺)',

  // Saju - TransitView
  'saju.transit.past': 'Pasado',
  'saju.transit.future': 'Próximo',
  'saju.transit.futureBtn': 'Futuro',
  'saju.transit.pastBtn': 'Pasado',
  'saju.transit.1month': '1 mes',
  'saju.transit.3months': '3 meses',
  'saju.transit.6months': '6 meses',
  'saju.transit.noRelation': ' meses sin interacciones destacables',

  // Saju - Transit relation prefix
  'transit.stem': '天干',
  'transit.branch': '地支',

  // Saju - JwabeopChart
  'saju.jwabeop.desc': 'En qué estrella de ciclo se asientan (坐) los troncos ocultos de cada pilar respecto a la rama del día',

  // Saju - InjongbeopChart
  'saju.injong.jijanggan': 'Troncos ocultos',
  'saju.injong.desc': '— Siembra de tronco Yang para los Diez Dioses ausentes',

  // Ziwei
  'ziwei.needTime': 'Zi Wei Dou Shu requiere la hora de nacimiento.',
  'ziwei.needTimeDesc': 'Toda la estructura de la carta cambia según la hora de nacimiento. Introduzca su hora de nacimiento.',

  // Natal
  'natal.loading': 'Cargando Swiss Ephemeris...',
  'natal.error': 'Error de cálculo',
  'natal.unknownTime': 'Calculado a partir del mediodía (12:00) sin hora de nacimiento.',
  'natal.unknownTimeDetail': 'La Luna puede tener un error de hasta ±6°, y no se muestran el ASC ni las posiciones de las casas.',
  'natal.planet': 'Planeta',
  'natal.sign': 'Signo',
  'natal.degree': 'Grado',
  'natal.house': 'Casa',

  // Natal - Planets
  'planet.Sun': 'Sol', 'planet.Moon': 'Luna', 'planet.Mercury': 'Mercurio', 'planet.Venus': 'Venus',
  'planet.Mars': 'Marte', 'planet.Jupiter': 'Júpiter', 'planet.Saturn': 'Saturno', 'planet.Uranus': 'Urano',
  'planet.Neptune': 'Neptuno', 'planet.Pluto': 'Plutón', 'planet.Chiron': 'Quirón',
  'planet.NorthNode': 'Nodo Norte', 'planet.SouthNode': 'Nodo Sur', 'planet.Fortuna': 'Parte de la Fortuna',

  // Natal - Zodiac Signs
  'zodiac.Aries': 'Aries', 'zodiac.Taurus': 'Tauro', 'zodiac.Gemini': 'Géminis', 'zodiac.Cancer': 'Cáncer',
  'zodiac.Leo': 'Leo', 'zodiac.Virgo': 'Virgo', 'zodiac.Libra': 'Libra', 'zodiac.Scorpio': 'Escorpio',
  'zodiac.Sagittarius': 'Sagitario', 'zodiac.Capricorn': 'Capricornio', 'zodiac.Aquarius': 'Acuario', 'zodiac.Pisces': 'Piscis',

  // Natal - Zodiac Signs (short, for mobile)
  'zodiac.short.Aries': 'Ari', 'zodiac.short.Taurus': 'Tau', 'zodiac.short.Gemini': 'Gém', 'zodiac.short.Cancer': 'Cán',
  'zodiac.short.Leo': 'Leo', 'zodiac.short.Virgo': 'Vir', 'zodiac.short.Libra': 'Lib', 'zodiac.short.Scorpio': 'Esc',
  'zodiac.short.Sagittarius': 'Sag', 'zodiac.short.Capricorn': 'Cap', 'zodiac.short.Aquarius': 'Acu', 'zodiac.short.Pisces': 'Pis',
}

export default es
