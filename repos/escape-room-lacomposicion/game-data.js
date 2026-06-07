// ─── GAME DATA ──────────────────────────────────────────────────────────────

window.ROOMS = [
  {
    id: 0,
    title: "El cuarto de Pedro",
    subtitle: "Chile, octubre de 1973",
    bgGradient: "linear-gradient(to bottom, #1E0E04 0%, #3A2008 18%, #5A3416 42%, #4A2C10 68%, #2A1608 100%)",
    bgPattern:  "radial-gradient(ellipse at 70% 30%, rgba(200,148,52,0.26) 0%, rgba(190,130,35,0.10) 42%, transparent 68%)",
    accentColor: "#C4813A",
    radioComment: "Bienvenidos al cuarto de Pedro. Aquí vive un chico de nueve años con una pelota de plástico y muchas preguntas. Haced clic en los objetos para descubrir más.",
    passwordWord: "DANIEL",
    passwordHint1: "Busca el nombre del mejor amigo de Pedro. Aparece en dos documentos distintos.",
    passwordHint2: "El nombre está en la carta personal Y en el cuaderno escolar: el amigo que juega de arquero y el hijo del almacenero.",
    passwordQuestion: "¿Cuál es el nombre del mejor amigo de Pedro, el hijo del almacenero?",
    hotspots: [
      {
        id: "pelota", label: "La pelota", x: 12, y: 58, w: 11, h: 14, emoji: "⚽",
        sourceType: "diario",
        title: "Diario de Pedro – entrada del cumpleaños",
        content: "Hoy es mi cumpleaños. Me regalaron una pelota, pero es de plástico y es demasiado ligera. Cuando meto un gol de cabecita, sale volando como un pájaro. Yo quería una pelota de cuero blanco con parches negros, como las de los futbolistas profesionales. Mi papá me dijo que era mejor así, para no aturdirme la cabeza. Pero yo creo que él simplemente quería oír la radio.",
        keyInfo: "Pedro tiene 9 años. Le gusta el fútbol. Su padre siempre quiere oír la radio.",
        noteLabel: "🎂 Pedro: 9 años, ama el fútbol de verdad"
      },
      {
        id: "radio", label: "La radio verde", x: 70, y: 42, w: 14, h: 12, emoji: "📻",
        sourceType: "novela",
        title: "Extracto de la novela – página 4",
        content: "En el último mes, desde que las calles se llenaron de militares, Pedro había notado que todas las noches el papá se sentaba en su sillón preferido, levantaba la antena del aparato verde y oía con atención noticias que llegaban desde muy lejos. A veces venían amigos que se tendían en el suelo, fumaban como chimeneas y ponían las orejas cerca del receptor.\n\nPedro le preguntó a su mamá:\n— ¿Por qué siempre oyen esa radio llena de ruidos?\n— Porque es interesante lo que dice.\n— ¿Y por qué se oye tan mal?\n— La voz viene de muy lejos.",
        keyInfo: "Las calles están llenas de militares. Los padres escuchan una radio clandestina cada noche.",
        noteLabel: "📻 La radio: noticias secretas desde muy lejos"
      },
      {
        id: "carta", label: "Carta en el escritorio", x: 38, y: 62, w: 18, h: 10, emoji: "✉️",
        sourceType: "carta",
        title: "Carta de Pedro a su amigo Daniel",
        content: "Querido Daniel:\n\nEspero que estés bien. Ayer te vi en el partido y metiste un gol de chilena increíble. Todos decían que parecías Pelé. Yo metí tres goles de cabecita pero nadie me abrazó después porque estaban todos mirando hacia el almacén de tu papá. ¿Qué pasó?\n\nYo soy pequeño pero soy inteligente y rápido. Tú eres mi mejor amigo aunque juegas de arquero.\n\nTu amigo,\nPedro Malbrán",
        keyInfo: "Daniel es el mejor amigo de Pedro. El padre de Daniel tiene un almacén.",
        noteLabel: "✉️ Daniel: mejor amigo de Pedro, hijo del almacenero"
      },
      {
        id: "foto", label: "Foto familiar", x: 55, y: 15, w: 15, h: 18, emoji: "🖼️",
        sourceType: "foto",
        title: "Fotografía familiar — sin fecha",
        content: "[Foto en blanco y negro: Un niño pequeño con jersey de rayas amarillas sostiene una pelota de plástico. Detrás, sus padres sentados en un sillón, muy juntos. En la mesita de noche, una radio verde con la antena levantada.]\n\nNota escrita al dorso: 'Pedro, mamá y papá. Octubre, 1973.'",
        keyInfo: "La familia de Pedro: papá, mamá y Pedro. Octubre 1973.",
        noteLabel: "📷 Familia de Pedro — octubre 1973"
      },
      {
        id: "cuaderno", label: "Cuaderno escolar", x: 30, y: 78, w: 16, h: 10, emoji: "📓",
        sourceType: "documento",
        title: "Cuaderno escolar de Pedro Malbrán — 3.º Grado A",
        content: "Escuela Siria\nAlumno: Pedro Malbrán\nCurso: Tercer Grado A\nMateria: Lengua y escritura\n\nMi amigo se llama Daniel. Es el hijo del almacenero. Me pasa muy buenos pases cuando jugamos al fútbol en la calle de los árboles grandes. A veces jugamos hasta que oscurece y nuestras mamás nos llaman a gritos.",
        keyInfo: "Pedro Malbrán, Escuela Siria, 3.º Grado A. Su amigo Daniel es el hijo del almacenero.",
        noteLabel: "📓 Pedro Malbrán — Escuela Siria, Tercer Grado A"
      },
      {
        id: "ventana", label: "La ventana", x: 78, y: 20, w: 14, h: 22, emoji: "🪟",
        irrelevant: true,
        content: "Por la ventana se ven los cerros lejanos. Pedro a veces se asoma y trata de adivinar por cuál de esos cerros se filtra la voz de la radio. Son preguntas de niño para un problema de adultos."
      }
    ]
  },
  {
    id: 1,
    title: "La calle del barrio",
    subtitle: "Un día de octubre — la detención",
    bgGradient: "linear-gradient(to bottom, #283848 0%, #38505C 18%, #4A584A 36%, #5A523C 55%, #4C3E20 75%, #3A3010 100%)",
    bgPattern:  "linear-gradient(to bottom, rgba(122,175,195,0.16) 0%, rgba(122,175,195,0.06) 30%, transparent 52%)",
    accentColor: "#7BA7BC",
    radioComment: "Esta es la calle donde Pedro jugaba al fútbol. Hoy algo terrible ha pasado aquí. Mirad todos los objetos con cuidado.",
    passwordWord: "DICTADURA",
    passwordHint1: "Busca la palabra que Daniel usa para explicar por qué se llevaron a su padre. Aparece en dos fuentes distintas.",
    passwordHint2: "En el diálogo del libro y en el artículo de periódico encontrarás la misma palabra clave: la razón por la que detienen a los adultos.",
    passwordQuestion: "¿Contra qué dice Daniel que estaba su padre? (una sola palabra)",
    hotspots: [
      {
        id: "detencion", label: "La detención", x: 25, y: 30, w: 22, h: 28, emoji: "🚙",
        sourceType: "novela",
        title: "Extracto de la novela — páginas 10-12",
        content: "Pedro vio que al padre de Daniel se lo llevaban dos hombres, arrastrándolo, mientras un piquete de soldados lo apuntaba con metralletas. Cuando Daniel quiso acercársele, uno de los hombres lo contuvo poniéndole la mano en el pecho.\n— Tranquilo —le dijo.\nDon Daniel miró a su hijo:\n— Cuídame bien el negocio.\n\nPedro se quedó cerca de Daniel en medio de la polvareda que levantó el jeep al partir.\n— ¿Por qué se lo llevaron?\nDaniel hundió las manos en los bolsillos y apretó las llaves.\n— Mi papá está contra la dictadura.",
        keyInfo: "Al padre de Daniel lo detienen los soldados. Daniel dice: 'Mi papá está contra la dictadura.'",
        noteLabel: "🚙 Don Daniel detenido — 'contra la dictadura'"
      },
      {
        id: "periodico", label: "Periódico", x: 60, y: 65, w: 18, h: 12, emoji: "📰",
        sourceType: "periodico",
        title: "El Diario del Pueblo — 12 de octubre de 1973",
        content: "ORDEN Y PROGRESO EN CHILE\n\nEl Gobierno Militar informa que continúan las operaciones de seguridad nacional. Varios ciudadanos han sido detenidos por actividades contrarias al régimen. El general Perdomo declara: 'Quienes están contra la dictadura serán procesados según la ley militar.'\n\nNota del redactor: [texto tachado con tinta negra]",
        keyInfo: "El periódico habla de detenciones. 'Contra la dictadura' es una frase peligrosa.",
        noteLabel: "📰 Periódico: detenidos 'contra la dictadura'"
      },
      {
        id: "llaves", label: "Las llaves del almacén", x: 48, y: 55, w: 10, h: 10, emoji: "🗝️",
        sourceType: "objeto",
        title: "Las llaves del almacén — símbolo de la escena",
        content: "Don Daniel quiso llevarse una mano al bolsillo. De inmediato un soldado levantó su metralleta. Don Daniel explicó que solo quería entregarle las llaves al niño. Un soldado le agarró el brazo. Palpó sus pantalones, sacó las llaves y las lanzó al aire. Daniel las recogió en el aire. El jeep partió.",
        keyInfo: "Daniel recoge las llaves. Ahora él cuida el negocio de su padre detenido.",
        noteLabel: "🗝️ Daniel recibe las llaves — queda solo"
      },
      {
        id: "graffiti", label: "Graffiti en el muro", x: 5, y: 55, w: 18, h: 20, emoji: "🧱",
        sourceType: "objeto",
        title: "Muro de la escuela — palabra pintada",
        content: "[En el muro de ladrillo rojo aparece escrita una sola palabra con pintura negra:]\n\nRESISTENCIA\n\nNadie sabe quién la escribió. Apareció una noche. Al día siguiente, los niños la miraban de camino a la escuela.",
        keyInfo: "La palabra RESISTENCIA aparece en el muro. Es una señal de que no todos aceptan la situación.",
        noteLabel: "🧱 Muro: la palabra RESISTENCIA"
      },
      {
        id: "madre", label: "Las madres en la calle", x: 75, y: 35, w: 15, h: 25, emoji: "👩",
        irrelevant: true,
        content: "Las madres precipitaron a la calle, agarraron a sus hijos del cuello y los metieron en sus casas. Algunas ventanas se abrieron. Otras puertas, sin embargo, se cerraron de golpe. El miedo tiene muchas formas."
      }
    ]
  },
  {
    id: 2,
    title: "La sala de casa",
    subtitle: "La noche después de la detención",
    bgGradient: "radial-gradient(ellipse at 36% 52%, #503C08 0%, #301C04 42%, #0E0802 100%)",
    bgPattern:  "radial-gradient(circle at 36% 52%, rgba(212,165,55,0.22) 0%, rgba(196,130,30,0.08) 44%, transparent 70%)",
    accentColor: "#D4A843",
    radioComment: "Esta es la sala de la familia de Pedro. Hay una cena en silencio, una madre que llora, y una radio que lo dice todo. Buscad con cuidado.",
    passwordWord: "ROMPECABEZAS",
    passwordHint1: "¿Qué imagen usa Pedro para describir el momento en que todo empieza a tener sentido? Está en la página del libro donde escucha la radio.",
    passwordHint2: "En el extracto de la novela de la noche de la radio, Pedro usa una metáfora muy específica cuando finalmente entiende. Búscala en el texto.",
    passwordQuestion: "¿Con qué objeto compara Pedro el momento en que todas las piezas encajan? (una palabra)",
    hotspots: [
      {
        id: "radio-sala", label: "La radio", x: 38, y: 45, w: 16, h: 16, emoji: "📻",
        sourceType: "novela",
        title: "Extracto de la novela — páginas 16-18",
        content: "Terminaron de cenar en silencio y Pedro fue a ponerse su pijama. Cuando volvió a la sala, sus papás estaban abrazados en el sillón con el oído muy cerca de la radio, que emitía sonidos extraños, más confusos ahora por el poco volumen.\n\nPedro se apoyó en el marco de la puerta, feliz de que no lo mandaran a acostarse. Prestó atención a la radio tratando de entender. Cuando la radio dijo: 'la dictadura militar', Pedro sintió que todas las cosas que andaban sueltas en su cabeza se juntaban como un rompecabezas.",
        keyInfo: "Pedro entiende todo gracias a la radio. Las piezas se juntan 'como un rompecabezas'.",
        noteLabel: "📻 Pedro entiende: 'como un rompecabezas'"
      },
      {
        id: "pregunta-padre", label: "Conversación con el padre", x: 65, y: 30, w: 20, h: 30, emoji: "👨",
        sourceType: "novela",
        title: "Extracto de la novela — página 17",
        content: "— Papá, ¿tú estás contra la dictadura?\n\nEl hombre miró a su hijo, luego a su mujer, y en seguida ambos lo miraron a él. Después bajó y subió lentamente la cabeza, asintiendo.\n\n— Papá —preguntó entonces—, ¿yo también estoy contra la dictadura?\n\nLa mamá dijo:\n— No se puede decir. Los niños no están en contra de nada. Los niños son simplemente niños. Los niños de tu edad tienen que ir a la escuela, estudiar mucho, jugar y ser cariñosos con sus padres.\n\n— Acuéstate, chico —dijo el papá.",
        keyInfo: "El padre de Pedro asiente: sí está contra la dictadura. La madre dice que los niños no pueden decirlo.",
        noteLabel: "👨 El padre asiente: sí está contra la dictadura"
      },
      {
        id: "texto-censura", label: "Sobre la censura", x: 8, y: 20, w: 22, h: 18, emoji: "📄",
        sourceType: "articulo",
        title: "Texto informativo — La censura en Chile (1973)",
        content: "Durante la dictadura militar, el Gobierno controlaba los periódicos, la televisión y las radios nacionales. Solo se podía escuchar la versión oficial. Por eso, muchas familias escuchaban a escondidas radios extranjeras como Radio Moscú o la BBC, que llegaban con mucho ruido pero decían la verdad.\n\nProducir o escuchar información contra el régimen era muy peligroso. Los que lo hacían podían ser detenidos.",
        keyInfo: "Las radios extranjeras decían la verdad que las radios nacionales ocultaban. Por eso la radio de la familia tiene tanto ruido.",
        noteLabel: "📄 La radio con ruido = información prohibida"
      },
      {
        id: "madre-llora", label: "La madre llorando", x: 62, y: 65, w: 18, h: 18, emoji: "😢",
        sourceType: "novela",
        title: "Extracto de la novela — página 16",
        content: "De pronto, la madre comenzó a llorar, sin ruido.\n— ¿Por qué está llorando mi mamá?\nEl papá se fijó primero en Pedro y luego en ella y no contestó. La mamá dijo:\n— No estoy llorando.\n— ¿Alguien te hizo algo? —preguntó Pedro.\n— No —dijo ella.",
        keyInfo: "La madre llora en silencio. Los adultos tienen miedos que no pueden compartir con los niños.",
        noteLabel: "😢 La madre llora en silencio — miedo sin palabras"
      },
      {
        id: "sillon", label: "El sillón", x: 20, y: 55, w: 15, h: 20, emoji: "🪑",
        irrelevant: true,
        content: "El sillón preferido del papá. Tiene la forma exacta de su cuerpo después de tantos años de sentarse ahí cada noche. Desde hace un mes, ya no se sienta a descansar: se sienta a escuchar."
      }
    ]
  },
  {
    id: 3,
    title: "La escuela — el capitán Romo",
    subtitle: "Al día siguiente — la trampa",
    bgGradient: "linear-gradient(160deg, #1C1828 0%, #252038 55%, #161220 100%)",
    bgPattern:  "repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(255,255,255,0.018) 38px, rgba(255,255,255,0.018) 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(255,255,255,0.018) 38px, rgba(255,255,255,0.018) 39px)",
    accentColor: "#8B3A3A",
    radioComment: "Aquí está la escuela de Pedro. Hoy ha venido alguien del Gobierno. Prestad mucha atención a lo que dice y lo que NO dice.",
    passwordWord: "PERDOMO",
    passwordHint1: "El capitán Romo dice que viene de parte de alguien. ¿Quién es esa persona? Está en el discurso del capitán.",
    passwordHint2: "El capitán dice que la medalla la dará 'la propia mano del general...' — ¿cómo se llama ese general?",
    passwordQuestion: "¿Cómo se llama el general de parte del cual viene el capitán Romo? (su apellido)",
    hotspots: [
      {
        id: "capitan", label: "El capitán Romo", x: 5, y: 25, w: 20, h: 45, emoji: "🪖",
        sourceType: "novela",
        title: "Extracto de la novela — página 20",
        content: "Todavía no terminaba de sonar ding-dong la campana, cuando la maestra entró, muy tiesa, acompañada por un señor con uniforme militar, una medalla en el pecho, bigotes grises y unos anteojos más negros que mugre en la rodilla.\n\n— Buenos días, amiguitos —dijo—. Yo soy el capitán Romo y vengo de parte del Gobierno, es decir, del general Perdomo, para invitar a todos los niños de todos los grados de esta escuela a escribir una composición. El que escriba la más linda de todas recibirá, de la propia mano del general Perdomo, una medalla de oro y una cinta.",
        keyInfo: "El capitán Romo viene del general Perdomo. Quiere que los niños escriban una composición.",
        noteLabel: "🪖 Capitán Romo — enviado por el general Perdomo"
      },
      {
        id: "encargo", label: "La tarea — instrucciones", x: 35, y: 20, w: 30, h: 20, emoji: "📝",
        sourceType: "documento",
        title: "Instrucciones oficiales — Escuela Siria, Tercer Grado A",
        content: "TÍTULO DE LA COMPOSICIÓN:\n'Lo que hace mi familia por las noches'\n\nContenido: Lo que hacen ustedes y sus padres desde que llegan de la escuela y del trabajo. Los amigos que vienen. Lo que conversan. Lo que comentan cuando ven la televisión. Cualquier cosa que a ustedes se les ocurra, con toda libertad.\n\nExtensión: Una o dos páginas.\nFirmado: Capitán Romo, en nombre del general Perdomo.",
        keyInfo: "La composición pregunta qué hace la familia por las noches: qué escuchan, quiénes visitan, qué hablan. Es una trampa para descubrir a las familias que están contra el Gobierno.",
        noteLabel: "📝 La composición: trampa para espiar a las familias"
      },
      {
        id: "dialogo-juan", label: "Pedro susurra a Juan", x: 52, y: 45, w: 22, h: 25, emoji: "🤫",
        sourceType: "novela",
        title: "Extracto de la novela — página 29",
        content: "Pedro se acercó a Juan y le susurró en la oreja:\n— ¿Tú estás contra la dictadura?\nJuan vigiló la posición del capitán y se inclinó hacia Pedro:\n— Claro.\n— Pero tú eres un niño...\n— ¿Y eso qué importa?\n— A mi papá se lo llevaron preso al norte.\n— Igual que al de Daniel.\n\nPedro miró la hoja en blanco y leyó lo que había escrito: 'Lo que hace mi familia por las noches. Pedro Malbrán. Escuela Siria. Tercer Grado A.'",
        keyInfo: "El padre de Juan también fue detenido. Pedro comprende que la composición es peligrosa.",
        noteLabel: "🤫 El padre de Juan también preso — la trampa es real"
      },
      {
        id: "placa", label: "El cuadro oficial", x: 72, y: 10, w: 18, h: 22, emoji: "🖼️",
        sourceType: "objeto",
        title: "Cuadro oficial en el aula — sin nombre",
        content: "[Un retrato de un hombre con uniforme militar cuelga en la pared del aula. No tiene nombre escrito debajo. Los niños saben quién es, pero no lo dicen en voz alta.]\n\nNota de la maestra encontrada en su escritorio:\n'Por instrucciones del Gobierno, el retrato del general debe colgar en todas las aulas a partir del 12 de septiembre de 1973.'",
        keyInfo: "El retrato del general está en todas las aulas desde el golpe de estado de septiembre de 1973.",
        noteLabel: "🖼️ Retrato del general — en todas las aulas desde sept. 1973"
      },
      {
        id: "medalla", label: "La promesa de la medalla", x: 78, y: 55, w: 15, h: 20, emoji: "🏅",
        sourceType: "documento",
        title: "Volante oficial del Gobierno",
        content: "GOBIERNO DE CHILE\nMinisterio de Educación Nacional\n\nA los alumnos de la Escuela Siria:\n\nEl ganador del concurso de composición 'Lo que hace mi familia por las noches' recibirá:\n→ Una medalla de oro\n→ Una cinta con los colores de la bandera\n→ El honor de llevar la bandera en el desfile de la Semana de la Patria\n\nPor orden del general Perdomo.",
        keyInfo: "La recompensa es una medalla de oro del general Perdomo. El concurso es oficial, del Gobierno.",
        noteLabel: "🏅 Recompensa del general Perdomo — desfile de la Patria"
      }
    ]
  },
  {
    id: 4,
    title: "La composición de Pedro",
    subtitle: "La decisión más importante",
    bgGradient: "radial-gradient(ellipse at 42% 58%, #1E2E14 0%, #101808 56%, #060C04 100%)",
    bgPattern:  "radial-gradient(ellipse at 42% 58%, rgba(92,158,111,0.16) 0%, rgba(80,140,95,0.05) 44%, transparent 68%)",
    accentColor: "#5C9E6F",
    radioComment: "Pedro tiene una hoja en blanco delante. Tiene que decidir qué escribir. Esta es la habitación más importante del juego. Leed todo con mucho cuidado.",
    passwordWord: "AJEDREZ",
    passwordHint1: "¿Qué juego inventó Pedro que juegan sus padres por las noches? Está en la composición que Pedro leyó a su familia.",
    passwordHint2: "Lee la composición oficial de Pedro. Dice que sus padres hacen algo en el sillón por las noches. ¿Qué? Y luego lee lo que dice el padre al final.",
    passwordQuestion: "¿Qué inventó Pedro que juegan sus padres por las noches en la composición? (una palabra)",
    hotspots: [
      {
        id: "composicion-oficial", label: "La composición oficial", x: 20, y: 25, w: 30, h: 45, emoji: "📄",
        sourceType: "documento",
        title: "Composición de Pedro Malbrán — entregada al capitán",
        content: "Escuela Siria. Tercer Grado A.\n\n'Cuando mi papá vuelve del trabajo'\n\nCuando mi papá vuelve del trabajo, yo voy a esperarlo al autobús. Mi mamá está en la casa y cuando llega mi papá le dice quiubo chico, cómo te fue hoy. Entonces yo salgo a jugar fútbol y me gusta meter goles de cabecita. Después viene mi mamá y me dice ya Pedrito venga a comer. Luego nos sentamos a la mesa y yo siempre me como todo menos la sopa que no me gusta. Después todas las noches mi papá y mi mamá se sientan en el sillón y juegan ajedrez y yo termino la tarea. Y ellos siguen jugando ajedrez hasta que es la hora de irse a dormir. Y después, no puedo contar porque me quedo dormido.\n\nFirmado: Pedro Malbrán.\n\nNota: Si me dan un premio por la composición ojalá sea una pelota de fútbol, pero no de plástico.",
        keyInfo: "Pedro escribió que sus padres juegan AJEDREZ por las noches. Es mentira: en realidad escuchan la radio clandestina. Pero es una mentira inteligente para proteger a su familia.",
        noteLabel: "📄 Pedro inventó: los padres juegan AJEDREZ (mentira protectora)"
      },
      {
        id: "verdad", label: "Lo que pasa de verdad", x: 58, y: 25, w: 28, h: 30, emoji: "🔍",
        sourceType: "monologointerior",
        title: "Monólogo interior de Pedro — lo que NO escribió",
        content: "[ Lo que Pedro sabe pero no puede escribir: ]\n\nTodas las noches, después de cenar, mis papás se sientan en el sillón y ponen la oreja cerca de la radio verde. Vienen amigos y ponen la radio muy bajita para que nadie oiga. Escuchan cosas sobre nuestro país que no salen en la televisión. A veces mi mamá llora sin ruido. A veces mi papá respira muy hondo y mira la calle. Yo sé que hacen esto porque están contra la dictadura. Pero si lo escribo, se llevan a mi papá como se llevaron al papá de Daniel.",
        keyInfo: "Pedro sabe la verdad: sus padres escuchan la radio clandestina porque están contra la dictadura. No lo puede escribir porque es peligroso.",
        noteLabel: "🔍 La verdad: la radio clandestina — demasiado peligroso escribirlo"
      },
      {
        id: "reaccion-padres", label: "La reacción de los padres", x: 15, y: 72, w: 32, h: 16, emoji: "😊",
        sourceType: "novela",
        title: "Extracto de la novela — páginas 32-35",
        content: "Los papás escucharon la composición con mucha atención. Cuando Pedro terminó de leer, levantó la mirada y se dio cuenta de que sus padres estaban sonriendo.\n\n— Bueno —dijo el papá—, habrá que comprar un ajedrez, por si las moscas.",
        keyInfo: "Los padres sonríen aliviados. El padre dice que hay que comprar un ajedrez para que la mentira sea creíble si alguien pregunta.",
        noteLabel: "😊 Los padres sonríen: Pedro los ha protegido"
      },
      {
        id: "nota-capitan", label: "Nota del capitán", x: 60, y: 68, w: 25, h: 16, emoji: "✅",
        sourceType: "documento",
        title: "Nota del capitán Romo en la composición",
        content: "[Escrito con tinta verde sobre la composición de Pedro:]\n\n'¡Bravo! ¡Te felicito!'\n— Capitán Romo",
        keyInfo: "El capitán felicita a Pedro. No sospecha nada. La composición mentirosa funcionó.",
        noteLabel: "✅ El capitán felicita a Pedro — la mentira funcionó"
      },
      {
        id: "significado", label: "¿Por qué es valiente Pedro?", x: 5, y: 30, w: 12, h: 35, emoji: "⭐",
        sourceType: "articulo",
        title: "Para pensar — ¿por qué es importante esta decisión?",
        content: "Pedro tiene solo 9 años. Nadie le explicó qué tenía que hacer. Pero él solo entendió que:\n\n1. La composición era una trampa del Gobierno para descubrir a las familias que no apoyaban la dictadura.\n2. Si escribía la verdad (que sus padres escuchan la radio clandestina), su padre podría ir a la cárcel.\n3. Si escribía una mentira inocente, protegía a su familia.\n\nEso se llama resistencia. No con armas, sino con inteligencia y valentía.",
        keyInfo: "La decisión de Pedro es un acto de resistencia: proteger a su familia con una mentira inteligente.",
        noteLabel: "⭐ Resistencia: proteger con inteligencia, no con armas"
      }
    ]
  }
];

window.SOURCE_CONFIG = {
  novela:            { accent: "#C4813A", label: "📖 Extracto de la novela",  paper: "#FAF5E8" },
  carta:             { accent: "#7BA7BC", label: "✉️ Carta personal",          paper: "#EEF4F9" },
  diario:            { accent: "#8B7355", label: "📔 Diario personal",         paper: "#F5EDE0" },
  periodico:         { accent: "#5A5A5A", label: "📰 Periódico",               paper: "#F0EFEA" },
  documento:         { accent: "#8B3A3A", label: "📄 Documento oficial",       paper: "#FDF5F5" },
  articulo:          { accent: "#5C9E6F", label: "📋 Texto informativo",       paper: "#EDF8F1" },
  monologointerior:  { accent: "#9B6B9B", label: "💭 Monólogo interior",       paper: "#F5F0FA" },
  foto:              { accent: "#4A4A4A", label: "📷 Fotografía",              paper: "#EDEDED" },
  objeto:            { accent: "#6B7B6B", label: "🔍 Objeto / detalle",        paper: "#F0F2F0" }
};

window.normalizePassword = function(s) {
  return s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-]/g, "");
};
