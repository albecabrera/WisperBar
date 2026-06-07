// ─── GAME DATA ──────────────────────────────────────────────────────────────

window.LEVELS = [

// ══════════════════════════════════════════════════════════════════════════════
// NIVEL 1 — La historia (comprensión lectora)
// ══════════════════════════════════════════════════════════════════════════════
{
  id: 0,
  title: "Nivel 1",
  subtitle: "La historia",
  detail: "¿Qué ocurre en la novela?",
  accentColor: "#C4813A",
  introText: "Hola. Soy la radio verde que escucha la familia de Pedro por las noches.\n\nPedro es un niño de 9 años que vive en Chile en 1973. Desde que los militares tomaron el Gobierno, algo ha cambiado: vecinos detenidos, miedos en silencio, una radio que dice la verdad en secreto.\n\nHoy, un capitán entró en su escuela con una misión: pedir a los niños que escriban una composición sobre \"lo que hace su familia por las noches.\"\n\nVuestra misión: explorad cada sala, leed los documentos y encontrad la palabra clave que abre la siguiente sala.",
  introTip: "📓 Usad el Cuaderno de notas en la parte de abajo para recordar las pistas importantes.",
  introButton: "Explorar la primera sala →",
  rooms: [
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
  ]
},

// ══════════════════════════════════════════════════════════════════════════════
// NIVEL 2 — Los personajes (análisis de personajes)
// ══════════════════════════════════════════════════════════════════════════════
{
  id: 1,
  title: "Nivel 2",
  subtitle: "Los personajes",
  detail: "¿Quiénes son y por qué actúan así?",
  accentColor: "#7BA7BC",
  introText: "Bienvenidos al Nivel 2.\n\nAhora que conocéis lo que ocurre en la novela, es hora de entender a quienes la protagonizan. Cada sala os acercará a un personaje diferente: sus miedos, sus decisiones, sus razones para actuar como actúan.\n\nEl mismo peligro, vivido de formas muy distintas.\n\nVuestra misión: explorad las salas y descubrid el POR QUÉ detrás de cada personaje.",
  introTip: "📝 En este nivel los documentos buscan las motivaciones — lee entre líneas y busca lo que los personajes sienten pero no dicen.",
  introButton: "Explorar el Nivel 2 →",
  rooms: [
    {
      id: 0,
      title: "Los padres de Pedro",
      subtitle: "El miedo de los que saben",
      bgGradient: "linear-gradient(to bottom, #150A02 0%, #28140A 22%, #3E2010 45%, #2E1808 72%, #140C04 100%)",
      bgPattern: "radial-gradient(ellipse at 28% 58%, rgba(180,110,30,0.22) 0%, rgba(160,90,15,0.08) 44%, transparent 68%)",
      accentColor: "#C4813A",
      radioComment: "Aquí están los padres de Pedro. Ellos saben mucho más que Pedro — y por eso tienen más miedo. Buscad los documentos para entender por qué actúan como actúan.",
      passwordWord: "ABRAZO",
      passwordHint1: "Busca el extracto de la novela donde Pedro regresa con el pijama y encuentra a sus padres en el sillón escuchando la radio.",
      passwordHint2: "Los padres están juntos en el sillón, muy cerca, con el oído pegado a la radio. ¿Cómo están físicamente el uno con el otro?",
      passwordQuestion: "¿Cómo están sentados los padres de Pedro cuando él vuelve con el pijama y los encuentra escuchando la radio? (una palabra)",
      hotspots: [
        {
          id: "l2_escucha", label: "La escucha nocturna", x: 40, y: 30, w: 20, h: 18, emoji: "📻",
          sourceType: "novela",
          title: "Extracto de la novela — páginas 16-18",
          content: "Terminaron de cenar en silencio y Pedro fue a ponerse su pijama. Cuando volvió a la sala, sus papás estaban abrazados en el sillón con el oído muy cerca de la radio, que emitía sonidos extraños, más confusos ahora por el poco volumen.\n\nPedro se apoyó en el marco de la puerta, feliz de que no lo mandaran a acostarse. Prestó atención a la radio tratando de entender.",
          keyInfo: "Los padres están ABRAZADOS. Es un gesto de miedo compartido: se protegen el uno al otro.",
          noteLabel: "🤗 Los padres abrazados — miedo compartido"
        },
        {
          id: "l2_carta_amigo", label: "Carta de un amigo", x: 12, y: 55, w: 18, h: 12, emoji: "✉️",
          sourceType: "carta",
          title: "Carta recibida por el padre de Pedro",
          content: "Amigo:\n\nNo pongas mi nombre. Sabes que no puedo. El jueves, como siempre, llevamos la información al lugar de siempre. Ven puntual y sin nada que te comprometa.\n\nCuida mucho a los tuyos. Y dile a tu señora que si pasa algo, ya sabe a quién llamar.\n\nCon abrazo,\n[nombre tachado]",
          keyInfo: "El padre pertenece a una red clandestina. Sus amigos también arriesgan todo por resistir.",
          noteLabel: "✉️ El padre: red clandestina de confianza"
        },
        {
          id: "l2_bando_radio", label: "Bando militar", x: 62, y: 58, w: 20, h: 12, emoji: "📄",
          sourceType: "documento",
          title: "Bando Militar No. 23 — octubre 1973",
          content: "GOBIERNO DE CHILE — JUNTA MILITAR\nBando No. 23\n\nQueda TERMINANTEMENTE PROHIBIDO:\n— Escuchar emisoras de radio no autorizadas por el Gobierno Militar\n— Reunirse en grupos de más de 3 personas después de las 22:00 h\n— Poseer o distribuir material impreso no autorizado\n\nLos infractores serán detenidos de forma inmediata sin necesidad de orden judicial.\n\nFirmado: Junta Militar, octubre 1973.",
          keyInfo: "Escuchar la radio clandestina es ILEGAL. El padre arriesga el arresto cada noche que levanta esa antena verde.",
          noteLabel: "📄 Bando 23: radio extranjera = arresto inmediato"
        },
        {
          id: "l2_notas_madre", label: "Notas de la madre", x: 72, y: 20, w: 16, h: 16, emoji: "📔",
          sourceType: "diario",
          title: "Notas privadas de la madre de Pedro",
          content: "No puedo decirle nada a Pedro. Si le cuento lo que pasa de verdad, lo pondré en peligro. Los niños no saben guardar secretos — no porque sean malos, sino porque son niños.\n\nAsí que lloro en silencio. Y cuando él me pregunta si estoy llorando, digo que no.\n\nEs la única mentira que le digo a mi hijo. Y es para protegerlo.",
          keyInfo: "La madre miente para proteger a Pedro. Los silencios y las mentiras de los adultos SON una forma de cuidar.",
          noteLabel: "📔 La madre miente a Pedro — para protegerlo"
        },
        {
          id: "l2_sillon_irr", label: "El sillón viejo", x: 22, y: 72, w: 14, h: 14, emoji: "🪑",
          irrelevant: true,
          content: "El sillón tiene la forma exacta del cuerpo del padre después de años de uso. Pero desde hace un mes, ya no lo usa para descansar: lo usa para tener miedo. Para esperar noticias. Para sobrevivir."
        }
      ]
    },
    {
      id: 1,
      title: "Daniel — tras la detención",
      subtitle: "La responsabilidad que no le tocaba",
      bgGradient: "linear-gradient(to bottom, #162230 0%, #1E3040 20%, #263848 45%, #1C2C38 70%, #101820 100%)",
      bgPattern: "linear-gradient(to bottom, rgba(100,150,190,0.14) 0%, rgba(80,130,170,0.05) 40%, transparent 65%)",
      accentColor: "#7BA7BC",
      radioComment: "Este es el almacén del padre de Daniel. Después de la detención, Daniel tiene que cargarlo solo. Buscad los documentos para entender lo que significa eso para un niño.",
      passwordWord: "NEGOCIO",
      passwordHint1: "Busca las últimas palabras que el padre de Daniel le dice cuando los soldados se lo llevan.",
      passwordHint2: "El padre de Daniel le hace una petición muy concreta a su hijo antes de que el jeep parta. ¿Qué le pide exactamente?",
      passwordQuestion: "¿Qué le pide don Daniel a su hijo cuando los soldados se lo llevan? (la última palabra de su frase)",
      hotspots: [
        {
          id: "l2_ultimas_palabras", label: "La última frase", x: 28, y: 28, w: 24, h: 22, emoji: "🗝️",
          sourceType: "novela",
          title: "Extracto de la novela — páginas 10-12",
          content: "Don Daniel miró a su hijo:\n— Cuídame bien el negocio.\n\nNo pudo decir más. Uno de los hombres tiró de él. El jeep partió levantando polvareda. Daniel quedó solo en la acera con las llaves en la mano, mirando la nube de polvo que se alejaba.",
          keyInfo: "'Cuídame bien el NEGOCIO': las últimas palabras del padre. Una despedida que es también una misión imposible para un niño.",
          noteLabel: "🗝️ 'Cuídame bien el negocio' — despedida y misión"
        },
        {
          id: "l2_diario_daniel", label: "Diario de Daniel", x: 60, y: 55, w: 20, h: 16, emoji: "📔",
          sourceType: "diario",
          title: "Diario de Daniel — días después",
          content: "No sé cuándo va a volver mi papá. Hoy abrí el almacén porque se lo prometí. Nadie compró nada. Los vecinos me miraban desde la puerta pero no entraban.\n\nPedro vino a acompañarme un rato. No hablamos mucho. Creo que los dos sabíamos que no había nada que decir.\n\nTengo las llaves en el bolsillo del pantalón. Pesan más de lo que deberían.",
          keyInfo: "Daniel carga solo con la responsabilidad del almacén. Las llaves son un símbolo de una carga demasiado grande.",
          noteLabel: "📔 Daniel: las llaves pesan más de lo que deberían"
        },
        {
          id: "l2_almacen_comunidad", label: "El almacén y el barrio", x: 8, y: 45, w: 20, h: 18, emoji: "🏪",
          sourceType: "articulo",
          title: "Texto informativo — El almacén como centro comunitario",
          content: "En los barrios populares de Chile, el almacén no era solo una tienda. Era el lugar donde la gente se reunía, se enteraba de las noticias y hablaba de la vida.\n\nEl almacenero era una figura de confianza: sabía de los problemas del barrio, escuchaba, aconsejaba. Por eso muchos almaceneros fueron detenidos durante la dictadura: sabían demasiado y la gente los escuchaba.",
          keyInfo: "El almacenero era un líder de opinión. Por eso era peligroso para la dictadura y por eso lo detuvieron.",
          noteLabel: "🏪 El almacenero: líder del barrio — y por eso peligroso"
        },
        {
          id: "l2_lista_detenidos", label: "Lista de detenidos", x: 68, y: 22, w: 20, h: 16, emoji: "📄",
          sourceType: "documento",
          title: "Registro de detenidos — Sector Norte",
          content: "REGISTRO DE DETENIDOS — SECTOR NORTE\nFecha: 12 de octubre de 1973\n\nDaniel Morales, almacenero — 'actividades contrarias al régimen'\n[nombre tachado] — [actividad tachada]\n[nombre tachado] — [actividad tachada]\n\nDestino: reclusorio transitorio norte.\nObservación: familia notificada. Visitas: no autorizadas por el momento.\n\nFirmado: Comandante Área 3.",
          keyInfo: "Los detenidos son llevados al norte sin que sus familias sepan adónde exactamente. Daniel no sabe dónde está su padre.",
          noteLabel: "📄 Detenidos: trasladados al norte — sin dirección"
        },
        {
          id: "l2_pelota_irr", label: "La pelota olvidada", x: 42, y: 75, w: 12, h: 12, emoji: "⚽",
          irrelevant: true,
          content: "La pelota de Pedro quedó tirada frente al almacén el día que se llevaron al padre de Daniel. Ninguno de los dos volvió a buscarla. El fútbol podía esperar."
        }
      ]
    },
    {
      id: 2,
      title: "La maestra",
      subtitle: "Entre el miedo y la conciencia",
      bgGradient: "linear-gradient(160deg, #1A1428 0%, #24183A 42%, #1A1030 72%, #100C20 100%)",
      bgPattern: "repeating-linear-gradient(0deg, transparent, transparent 42px, rgba(155,107,155,0.06) 42px, rgba(155,107,155,0.06) 43px)",
      accentColor: "#9B6B9B",
      radioComment: "Esta es el aula de la Escuela Siria. La maestra sabía lo que el capitán venía a hacer. Y no pudo decir nada. Buscad los documentos para entender por qué.",
      passwordWord: "TIESA",
      passwordHint1: "Busca en el extracto del libro cómo describe el narrador la postura de la maestra cuando entra al aula con el capitán.",
      passwordHint2: "El narrador usa un adjetivo muy concreto para describir cómo camina la maestra. Es una sola palabra que dice todo sobre su miedo.",
      passwordQuestion: "¿Cómo describe el narrador la postura de la maestra cuando entra al aula con el capitán? (una sola palabra del texto)",
      hotspots: [
        {
          id: "l2_entrada_maestra", label: "La entrada al aula", x: 8, y: 22, w: 22, h: 36, emoji: "👩‍🏫",
          sourceType: "novela",
          title: "Extracto de la novela — página 20",
          content: "Todavía no terminaba de sonar ding-dong la campana, cuando la maestra entró, muy tiesa, acompañada por un señor con uniforme militar...\n\nLa maestra no dijo nada. Se quedó de pie junto a la pizarra, con los brazos cruzados, y no miró a los niños ni una sola vez durante el discurso del capitán.",
          keyInfo: "'Muy TIESA': la maestra tiene miedo. Su cuerpo lo dice todo: rígida, sin mirar a los niños, sin decir nada.",
          noteLabel: "🧍 La maestra: 'muy tiesa' — miedo que no puede mostrarse"
        },
        {
          id: "l2_nota_maestra", label: "Nota del cajón", x: 55, y: 55, w: 22, h: 16, emoji: "📔",
          sourceType: "diario",
          title: "Nota privada encontrada en el escritorio de la maestra",
          content: "No tenía otra opción. Si me negaba a dejarlos pasar, perdía el puesto. Y si perdía el puesto... ¿quién cuidaría a mis hijos?\n\nLos niños me miraban. Yo miraba la pizarra. No pude decirles que era una trampa. Si lo hacía, me detenían.\n\nEspero que ninguno de ellos escriba la verdad. Espero que sean suficientemente listos.",
          keyInfo: "La maestra sabe que es una trampa. Pero el miedo la paraliza. Incluso los adultos responsables son víctimas del terror.",
          noteLabel: "📔 La maestra lo sabía — pero el miedo la paralizó"
        },
        {
          id: "l2_circular_director", label: "Circular del director", x: 32, y: 18, w: 26, h: 16, emoji: "📄",
          sourceType: "documento",
          title: "Circular interna — Escuela Siria",
          content: "Escuela Siria — CIRCULAR INTERNA\nCONFIDENCIAL\n\nSe informa a todos los docentes:\n\n— Cooperar con las autoridades militares ES OBLIGATORIO.\n— Cualquier negativa o resistencia pasiva será comunicada al Ministerio de Educación.\n— Los maestros que no faciliten el acceso a las aulas serán sancionados sin posibilidad de recurso.\n\nFirmado: Director, por instrucción del Gobierno Militar.",
          keyInfo: "Los maestros no tenían elección legal. El Gobierno controlaba las escuelas. Resistir significaba perder el trabajo o algo peor.",
          noteLabel: "📄 Circular: maestros OBLIGADOS a cooperar"
        },
        {
          id: "l2_texto_educacion", label: "Educación y dictadura", x: 62, y: 20, w: 22, h: 18, emoji: "📋",
          sourceType: "articulo",
          title: "Texto informativo — La educación bajo la dictadura",
          content: "Bajo la dictadura militar chilena, el sistema educativo fue reorganizado completamente. Se eliminaron libros de texto con contenido 'ideológico'. Los maestros sospechosos de ideas contrarias al régimen podían ser despedidos o detenidos.\n\nMuchos maestros tuvieron que elegir entre su conciencia y su seguridad. La mayoría eligió sobrevivir. Y esa también es una forma de resistir: quedarse, no marcharse, estar ahí para los niños.",
          keyInfo: "La maestra no es cómplice por convicción: es víctima del miedo. Quedarse en el aula también era una forma de proteger a los niños.",
          noteLabel: "📋 Maestros: víctimas del miedo, no cómplices por convicción"
        },
        {
          id: "l2_pizarra_irr", label: "La pizarra", x: 75, y: 58, w: 16, h: 20, emoji: "🖊️",
          irrelevant: true,
          content: "En la pizarra estaba escrita la lección del día: 'Repaso del abecedario'. La misma tarea de siempre. Nada había cambiado en la superficie. Y debajo, todo había cambiado."
        }
      ]
    },
    {
      id: 3,
      title: "Juan — el amigo silencioso",
      subtitle: "El mismo miedo, diferente respuesta",
      bgGradient: "linear-gradient(to bottom, #1A2230 0%, #222C3C 22%, #2A3448 48%, #1E2838 72%, #121C28 100%)",
      bgPattern: "radial-gradient(ellipse at 65% 35%, rgba(100,140,180,0.12) 0%, transparent 60%)",
      accentColor: "#6B8FAA",
      radioComment: "Juan es el otro niño cuyo padre fue detenido. Comparte el mismo miedo que Pedro, pero reacciona de forma diferente. Buscad los documentos para entender su historia.",
      passwordWord: "NORTE",
      passwordHint1: "Busca el susurro entre Pedro y Juan en el aula. Juan le dice a Pedro adónde se llevaron a su padre.",
      passwordHint2: "En el diálogo de la novela, Juan dice: 'A mi papá se lo llevaron preso al...' — ¿a qué dirección?",
      passwordQuestion: "¿Adónde se llevaron al padre de Juan? (una sola palabra)",
      hotspots: [
        {
          id: "l2_susurro_juan", label: "El susurro", x: 30, y: 30, w: 24, h: 24, emoji: "🤫",
          sourceType: "novela",
          title: "Extracto de la novela — página 29",
          content: "Pedro se acercó a Juan y le susurró en la oreja:\n— ¿Tú estás contra la dictadura?\nJuan vigiló la posición del capitán y se inclinó:\n— Claro.\n— Pero tú eres un niño...\n— ¿Y eso qué importa?\n— A mi papá se lo llevaron preso al norte.\n— Igual que al de Daniel.",
          keyInfo: "Al padre de Juan también lo llevaron al NORTE. Juan y Pedro comparten el mismo miedo, pero ninguno lo puede decir en voz alta.",
          noteLabel: "🤫 Juan: 'al norte' — igual que el padre de Daniel"
        },
        {
          id: "l2_carta_juan", label: "Carta sin respuesta", x: 62, y: 22, w: 20, h: 16, emoji: "✉️",
          sourceType: "carta",
          title: "Carta de Juan a su padre — sin enviar",
          content: "Papá:\n\nMamá dice que estás 'trabajando lejos'. Pero yo ya tengo once años y sé que eso no es verdad.\n\nHoy vino un capitán al colegio a pedirle a todos los niños que escribamos sobre lo que hace nuestra familia por las noches. No voy a escribir nada. No tengo nada que contar.\n\nTu hijo,\nJuan\n\n[Carta nunca enviada. Encontrada en el cuaderno de Juan.]",
          keyInfo: "Juan decide no escribir nada. Pedro, en cambio, decide escribir una mentira perfecta. Dos respuestas al mismo miedo.",
          noteLabel: "✉️ Juan no escribe nada — Pedro escribe una mentira inteligente"
        },
        {
          id: "l2_mapa_chile", label: "Mapa de Chile", x: 8, y: 30, w: 18, h: 36, emoji: "🗺️",
          sourceType: "objeto",
          title: "Chile — dónde estaban los centros de detención",
          content: "[Mapa de Chile]\n\nDurante la dictadura, miles de presos políticos fueron trasladados al norte de Chile: la pampa del Atacama, los campamentos mineros abandonados, el desierto. Alejados de sus familias, sin posibilidad de comunicarse.\n\nEl 'norte' era una palabra que los niños de ese tiempo aprendieron a temer. Significaba lejos, frío, y sin saber cuándo volvería.",
          keyInfo: "El norte = donde desaparecían los detenidos políticos. Una palabra que llenaba de terror a las familias.",
          noteLabel: "🗺️ El norte: donde desaparecían los detenidos"
        },
        {
          id: "l2_silencio_forzado", label: "El silencio de los niños", x: 60, y: 52, w: 24, h: 18, emoji: "📋",
          sourceType: "articulo",
          title: "Texto informativo — El silencio forzado",
          content: "En 1973, miles de niños chilenos vivieron la misma experiencia que Juan y Pedro: un padre que desaparece, una madre que llora en silencio, preguntas sin respuesta.\n\nLos psicólogos que trabajaron con estas familias describieron el fenómeno del 'silencio forzado': los adultos no podían explicar la realidad a sus hijos por miedo a que los niños la revelasen sin querer.\n\nEsa incomunicación dejó heridas profundas que duran hasta hoy.",
          keyInfo: "El silencio de los adultos era para proteger a los niños. Pero ese mismo silencio los dejó solos con su miedo.",
          noteLabel: "📋 Silencio forzado: proteger callando — a veces también hace daño"
        },
        {
          id: "l2_recreo_irr", label: "El patio vacío", x: 76, y: 65, w: 16, h: 18, emoji: "🏃",
          irrelevant: true,
          content: "En el patio ya nadie jugaba al fútbol. Desde la visita del capitán, los niños corrían menos y se miraban más. Como si ya no fueran del todo niños."
        }
      ]
    },
    {
      id: 4,
      title: "Pedro — el héroe con lápiz",
      subtitle: "La inteligencia como resistencia",
      bgGradient: "radial-gradient(ellipse at 50% 55%, #162210 0%, #0E1808 55%, #060C04 100%)",
      bgPattern: "radial-gradient(ellipse at 50% 55%, rgba(80,140,90,0.18) 0%, rgba(60,120,70,0.06) 48%, transparent 72%)",
      accentColor: "#5C9E6F",
      radioComment: "Pedro está frente a la hoja en blanco. Tiene que tomar la decisión más importante de su vida. Buscad los documentos para entender cómo piensa y qué lo hace especial.",
      passwordWord: "LÁPIZ",
      passwordHint1: "Busca el texto que explica con qué 'arma' protege Pedro a su familia — no es un arma de verdad.",
      passwordHint2: "En el texto sobre la resistencia inteligente se explica qué herramienta usa Pedro en vez de la violencia. ¿Con qué objeto escribe su composición?",
      passwordQuestion: "¿Con qué objeto — su 'arma' — protege Pedro a su familia? (una sola palabra)",
      hotspots: [
        {
          id: "l2_hoja_blanca", label: "La hoja en blanco", x: 25, y: 25, w: 22, h: 30, emoji: "📝",
          sourceType: "novela",
          title: "Extracto de la novela — páginas 28-29",
          content: "Pedro miró la hoja en blanco y leyó lo que había escrito: 'Lo que hace mi familia por las noches. Pedro Malbrán. Escuela Siria. Tercer Grado A.'\n\nY después no escribió nada más durante un buen rato. Pensaba. Con nueve años y la lengua entre los dientes, pensaba con toda la potencia de su cerebro.",
          keyInfo: "Pedro no reacciona: piensa. Un niño de 9 años está elaborando una estrategia para proteger a su familia.",
          noteLabel: "📝 Pedro piensa antes de actuar — estrategia, no reacción"
        },
        {
          id: "l2_monologo_pedro", label: "Lo que Pedro piensa", x: 55, y: 22, w: 26, h: 26, emoji: "💭",
          sourceType: "monologointerior",
          title: "Monólogo interior de Pedro",
          content: "[ Lo que Pedro piensa ]\n\nSi escribo la verdad — que mis papás escuchan la radio clandestina y están contra la dictadura — se llevan a mi papá. Como al papá de Daniel. Como al papá de Juan.\n\nTengo que inventar algo. Algo aburrido. Algo completamente normal. Algo que el capitán lea y piense: 'esta familia no tiene nada que esconder.'",
          keyInfo: "Pedro razona como un estratega. Entiende el peligro y diseña una solución. Eso es inteligencia, no suerte.",
          noteLabel: "💭 Pedro razona: necesita una mentira perfecta y normal"
        },
        {
          id: "l2_resistencia_inteligente", label: "La resistencia inteligente", x: 8, y: 58, w: 24, h: 20, emoji: "📋",
          sourceType: "articulo",
          title: "Para pensar — La resistencia con lápiz",
          content: "En la historia de los regímenes autoritarios, la resistencia adopta muchas formas. La más visible es la violencia. Pero la más duradera y efectiva suele ser la más silenciosa:\n\nEl humor. La escritura. El arte. La mentira bien construida.\n\nAntonio Skármeta eligió a un niño de nueve años para demostrar que la inteligencia — no la fuerza — es el arma más poderosa contra la injusticia. El arma de Pedro es un simple lápiz.",
          keyInfo: "El LÁPIZ de Pedro es su arma. La escritura como forma de resistencia inteligente.",
          noteLabel: "📋 El lápiz: el arma más poderosa de Pedro"
        },
        {
          id: "l2_composicion_pedro", label: "La composición entregada", x: 56, y: 58, w: 26, h: 20, emoji: "✅",
          sourceType: "documento",
          title: "Nota del capitán Romo sobre la composición de Pedro",
          content: "[Escrito con tinta verde sobre la composición de Pedro:]\n\n'¡Bravo! ¡Te felicito!'\n— Capitán Romo\n\n[Y debajo, la reacción del padre de Pedro cuando Pedro le leyó la composición en casa:]\n\n— Bueno —dijo el papá—, habrá que comprar un ajedrez, por si las moscas.",
          keyInfo: "El capitán felicita a Pedro. El padre sonríe. La mentira con lápiz funcionó mejor que cualquier otra arma.",
          noteLabel: "✅ El lápiz ganó: el capitán felicita, el padre sonríe"
        },
        {
          id: "l2_lapiz_irr", label: "Un lápiz roto", x: 78, y: 70, w: 12, h: 12, emoji: "✏️",
          irrelevant: true,
          content: "Bajo el pupitre de Juan había un lápiz roto en dos trozos. Juan no pudo escribir nada. Pedro sí. A veces la diferencia entre actuar y no actuar es apenas ese lápiz."
        }
      ]
    }
  ]
},

// ══════════════════════════════════════════════════════════════════════════════
// NIVEL 3 — Historia y análisis (contexto histórico y literario)
// ══════════════════════════════════════════════════════════════════════════════
{
  id: 2,
  title: "Nivel 3",
  subtitle: "Historia y análisis",
  detail: "Chile 1973 y análisis literario",
  accentColor: "#5C9E6F",
  introText: "Bienvenidos al Nivel 3.\n\nEsta novela no nació de la imaginación: nació de la historia real de Chile. Para entenderla del todo, necesitáis conocer el contexto: quién era Allende, qué ocurrió el 11 de septiembre de 1973, por qué la radio verde era peligrosa.\n\nY también necesitáis conocer a su autor, Antonio Skármeta, que vivió todo esto en primera persona.\n\nVuestra misión: explorad el contexto histórico y literario para comprender la novela en toda su profundidad.",
  introTip: "📚 En este nivel encontraréis documentos históricos reales y análisis literario. La novela cobra un significado completamente nuevo.",
  introButton: "Explorar el Nivel 3 →",
  rooms: [
    {
      id: 0,
      title: "El 11 de septiembre de 1973",
      subtitle: "El día que cambió Chile",
      bgGradient: "linear-gradient(to bottom, #0C1220 0%, #141C2E 20%, #1C2440 48%, #141C30 72%, #0A1018 100%)",
      bgPattern: "radial-gradient(ellipse at 50% 30%, rgba(80,120,180,0.14) 0%, transparent 58%)",
      accentColor: "#7BA7BC",
      radioComment: "El 11 de septiembre de 1973 es la fecha más importante para entender la novela. Explorad los documentos para saber qué pasó ese día y por qué cambió la vida de Pedro.",
      passwordWord: "MONEDA",
      passwordHint1: "Busca el nombre del Palacio de Gobierno de Chile que fue bombardeado el día del golpe.",
      passwordHint2: "El presidente Allende murió defendiendo ese edificio. Su nombre es el de una moneda. ¿Cómo se llama?",
      passwordQuestion: "¿Cómo se llama el Palacio de Gobierno de Chile que fue bombardeado durante el golpe del 11 de septiembre de 1973?",
      hotspots: [
        {
          id: "l3_golpe_texto", label: "El golpe de estado", x: 10, y: 22, w: 26, h: 22, emoji: "📋",
          sourceType: "articulo",
          title: "El golpe de estado del 11 de septiembre de 1973",
          content: "El 11 de septiembre de 1973, las Fuerzas Armadas de Chile derrocaron al gobierno democrático del presidente Salvador Allende. Los aviones militares bombardearon el Palacio de La Moneda, sede del gobierno.\n\nAllende murió ese mismo día. El general Augusto Pinochet tomó el poder e instauró una dictadura militar que duraría 17 años (1973-1990).\n\nEn un solo día, Chile pasó de una democracia a una dictadura.",
          keyInfo: "11/9/1973: Bombardeo de La MONEDA. Allende muere. Pinochet toma el poder. Chile pasa de democracia a dictadura.",
          noteLabel: "📋 11/9/1973: La Moneda bombardeada — Allende muere"
        },
        {
          id: "l3_bando_1", label: "Bando No. 1", x: 44, y: 18, w: 24, h: 18, emoji: "📄",
          sourceType: "documento",
          title: "Bando Militar No. 1 — 11 de septiembre de 1973",
          content: "JUNTA MILITAR DE CHILE\nBando No. 1 — 11 de septiembre de 1973, 08:30 h\n\nA la ciudadanía en general:\n\nLas Fuerzas Armadas y el Cuerpo de Carabineros de Chile han resuelto asumir el deber moral que la patria les impone.\n\nEl señor Allende debe proceder a la entrega inmediata de su cargo. Las Fuerzas Armadas están unidas para iniciar la tarea de liberar a la Patria.\n\nJunta Militar, 11 de septiembre de 1973.",
          keyInfo: "El Bando No. 1 fue el primer comunicado de la dictadura. Pedían la rendición de Allende. Él se negó.",
          noteLabel: "📄 Bando No. 1 — el primer comunicado de la dictadura"
        },
        {
          id: "l3_discurso_allende", label: "El último discurso", x: 72, y: 18, w: 20, h: 22, emoji: "📻",
          sourceType: "carta",
          title: "Último discurso de Salvador Allende — radio, 11/9/1973",
          content: "«Estas son mis últimas palabras y tengo la certeza de que la semilla que entregáramos a la conciencia digna de miles y miles de chilenos no podrá ser segada definitivamente.\n\nTengo la certeza de que muy pronto se abrirán las grandes alamedas por donde pase el hombre libre para construir una sociedad mejor.»\n\n— Salvador Allende, 11 de septiembre de 1973, 09:10 h\n(Última transmisión antes de que los militares silenciaran la radio.)",
          keyInfo: "'Se abrirán las grandes alamedas': las palabras más famosas de Allende. Pronunciadas por radio, poco antes de morir.",
          noteLabel: "📻 Allende: 'las grandes alamedas' — su última transmisión"
        },
        {
          id: "l3_cronologia", label: "Cronología", x: 20, y: 55, w: 32, h: 18, emoji: "🗓️",
          sourceType: "objeto",
          title: "Cronología — del golpe a la novela",
          content: "[Línea del tiempo]\n\n1970 — Salvador Allende elegido presidente democráticamente\n1971-72 — Reformas sociales: nacionalización del cobre, reforma agraria\n11/09/1973 — Golpe de estado. Bombardeo de La Moneda. Allende muere.\n12/09/1973 — Al día siguiente: el capitán Romo entra en la escuela de Pedro\n1973-1990 — Dictadura militar de Pinochet (17 años)\n1999 — Antonio Skármeta publica 'La composición'",
          keyInfo: "El capitán Romo llega a la escuela AL DÍA SIGUIENTE del golpe. La composición ocurre en ese momento exacto.",
          noteLabel: "🗓️ 11/9 = golpe · 12/9 = el capitán llega al colegio de Pedro"
        },
        {
          id: "l3_foto_irr", label: "La plaza vacía", x: 62, y: 58, w: 22, h: 18, emoji: "🏛️",
          irrelevant: true,
          content: "La plaza frente al palacio ese día estaba completamente vacía. Nadie se atrevía a salir. Solo se oían los aviones y el humo del incendio. El mundo de Pedro cambió ese día, aunque él todavía no lo sabía."
        }
      ]
    },
    {
      id: 1,
      title: "Salvador Allende",
      subtitle: "El presidente que la radio defendía",
      bgGradient: "linear-gradient(160deg, #1E0C06 0%, #300E08 35%, #4A1A10 60%, #2E1008 80%, #160804 100%)",
      bgPattern: "radial-gradient(ellipse at 60% 40%, rgba(160,60,20,0.18) 0%, rgba(140,40,10,0.06) 50%, transparent 72%)",
      accentColor: "#C4813A",
      radioComment: "Salvador Allende era el presidente que la radio verde defendía. Para entender por qué la familia de Pedro escuchaba esa radio clandestina, hay que saber quién era Allende.",
      passwordWord: "ALLENDE",
      passwordHint1: "Busca el nombre del presidente democrático de Chile que fue derrocado en el golpe de septiembre de 1973.",
      passwordHint2: "El padre de Pedro apoyaba a este presidente. Por eso está 'contra la dictadura'. ¿Cómo se llamaba ese presidente?",
      passwordQuestion: "¿Cómo se llamaba el presidente democrático de Chile derrocado en 1973? (su apellido)",
      hotspots: [
        {
          id: "l3_quien_allende", label: "¿Quién era Allende?", x: 10, y: 18, w: 26, h: 22, emoji: "📋",
          sourceType: "articulo",
          title: "Salvador Allende — quién era y qué quería",
          content: "Salvador Allende (1908-1973) fue el primer presidente marxista elegido democráticamente en el mundo. En 1970 ganó las elecciones con la Unidad Popular.\n\nSu programa incluía:\n— Nacionalización de las minas de cobre (principal riqueza de Chile)\n— Reforma agraria para dar tierras a los campesinos\n— Educación y sanidad gratuita para todos\n\nEstos cambios amenazaban los intereses de las élites chilenas y de empresas estadounidenses.",
          keyInfo: "Allende fue elegido democráticamente. Sus reformas sociales amenazaban intereses muy poderosos.",
          noteLabel: "📋 Allende: presidente democrático — reformas sociales radicales"
        },
        {
          id: "l3_alamedas", label: "Las grandes alamedas", x: 44, y: 15, w: 24, h: 20, emoji: "🌳",
          sourceType: "carta",
          title: "La frase que se convirtió en símbolo",
          content: "«Mucho más temprano que tarde, de nuevo se abrirán las grandes alamedas por donde pase el hombre libre para construir una sociedad mejor.»\n\n— Salvador Allende, último discurso, 11 de septiembre de 1973\n\nEsta frase se convirtió en el símbolo de la resistencia chilena. La gente la repetía en susurros durante los 17 años de dictadura.",
          keyInfo: "'Las grandes alamedas' — la promesa de Allende a los que resistían. La razón por la que la radio verde era necesaria.",
          noteLabel: "🌳 'Las grandes alamedas': símbolo de esperanza y resistencia"
        },
        {
          id: "l3_eeuu_intervencion", label: "La intervención de EEUU", x: 70, y: 18, w: 22, h: 20, emoji: "📄",
          sourceType: "documento",
          title: "Documento desclasificado — CIA, 1970",
          content: "DOCUMENTO DESCLASIFICADO — CIA (EEUU)\nFecha original: 1970 · Desclasificado: 2000\n\n[Extracto]\n\n'Debemos hacer todo lo posible para desestabilizar el gobierno de Allende. El objetivo es provocar su caída antes de que consolide su programa. Presupuesto aprobado para operaciones encubiertas: 8 millones de dólares.'\n\n[Nota: Los EEUU financiaron activamente el golpe por miedo al comunismo en América del Sur.]",
          keyInfo: "Los EEUU financiaron el golpe con 8 millones de dólares. La Guerra Fría llegó al Chile de Pedro.",
          noteLabel: "📄 EEUU financió el golpe: 8 millones de dólares"
        },
        {
          id: "l3_padre_pedro_allendista", label: "El padre de Pedro", x: 18, y: 55, w: 28, h: 18, emoji: "📖",
          sourceType: "novela",
          title: "La conexión con la novela",
          content: "La novela de Skármeta nunca menciona a Allende por su nombre. Pero los lectores chilenos saben exactamente de quién habla.\n\nEl padre de Pedro — que escucha la radio clandestina cada noche y asiente cuando su hijo le pregunta si está 'contra la dictadura' — es uno de los millones de chilenos que apoyaban a Allende.\n\nAhora que Allende ha muerto y Pinochet gobierna, ese apoyo se convierte en peligro.",
          keyInfo: "El padre de Pedro = un allendista clandestino. Por eso escucha la radio. Por eso la composición es tan peligrosa.",
          noteLabel: "📖 El padre de Pedro = allendista clandestino"
        },
        {
          id: "l3_cartel_irr", label: "Cartel electoral", x: 60, y: 60, w: 20, h: 18, emoji: "📢",
          irrelevant: true,
          content: "En las paredes del barrio quedaban restos de carteles electorales de Allende: 'Venceremos'. Ya nadie los podía ver sin mirar a los lados primero."
        }
      ]
    },
    {
      id: 2,
      title: "La dictadura de Pinochet",
      subtitle: "El general Perdomo tiene nombre real",
      bgGradient: "linear-gradient(to bottom, #0A0A14 0%, #12101E 25%, #1A1428 55%, #100E1C 80%, #080810 100%)",
      bgPattern: "repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(180,50,50,0.04) 50px, rgba(180,50,50,0.04) 51px)",
      accentColor: "#8B3A3A",
      radioComment: "En la novela, el capitán Romo actúa en nombre del 'general Perdomo'. Ese nombre es ficticio, pero tiene un referente real. Buscad los documentos para entender quién fue Pinochet.",
      passwordWord: "PINOCHET",
      passwordHint1: "Busca en los documentos el nombre del general real que lideró el golpe y gobernó Chile durante 17 años.",
      passwordHint2: "El texto sobre el régimen militar menciona su nombre completo. Buscad el apellido del general que tomó el poder en septiembre de 1973.",
      passwordQuestion: "¿Cómo se apellidaba el general que lideró el golpe y gobernó Chile como dictador 17 años?",
      hotspots: [
        {
          id: "l3_regimen_pinochet", label: "El régimen de Pinochet", x: 8, y: 18, w: 28, h: 22, emoji: "📋",
          sourceType: "articulo",
          title: "La dictadura de Augusto Pinochet (1973-1990)",
          content: "Augusto Pinochet (1915-2006) fue el general que lideró el golpe del 11 de septiembre de 1973. Gobernó Chile como dictador durante 17 años.\n\nSu régimen se caracterizó por:\n— Más de 40.000 personas detenidas y torturadas\n— Aproximadamente 3.200 personas ejecutadas o desaparecidas\n— Más de 200.000 exiliados que tuvieron que huir del país\n\nNo hubo elecciones libres hasta 1990.",
          keyInfo: "Pinochet: 17 años, 40.000 detenidos, 3.200 muertos, 200.000 exiliados. El general Perdomo de la novela.",
          noteLabel: "📋 Pinochet: 17 años · 40.000 detenidos · 200.000 exiliados"
        },
        {
          id: "l3_dina", label: "La policía secreta — DINA", x: 44, y: 15, w: 24, h: 20, emoji: "📄",
          sourceType: "documento",
          title: "DINA — Dirección de Inteligencia Nacional",
          content: "DINA — Dirección de Inteligencia Nacional\nFundada: 1973\n\nLa DINA era la policía secreta de la dictadura. Sus agentes:\n— Infiltraban reuniones y grupos de oposición\n— Detenían a sospechosos sin orden judicial\n— Operaban centros de detención clandestinos\n— Actuaban en el extranjero (Operación Cóndor)\n\nSus agentes podían estar en cualquier lugar. En los barrios, en los colegios, en el almacén.",
          keyInfo: "La DINA explica el miedo del padre de Pedro. Los espías de la dictadura podían estar en cualquier parte — incluso en el almacén de don Daniel.",
          noteLabel: "📄 DINA: policía secreta — espías en cualquier parte"
        },
        {
          id: "l3_perdomo_ficcional", label: "El general Perdomo", x: 70, y: 18, w: 22, h: 20, emoji: "📖",
          sourceType: "novela",
          title: "El general Perdomo — un personaje universal",
          content: "En la novela, el capitán Romo actúa en nombre del 'general Perdomo'. Este nombre es ficticio.\n\nSkármeta no usa el nombre real de Pinochet deliberadamente. Quiere que la novela sea universal: la historia de Pedro podría ocurrir en cualquier dictadura, no solo en la chilena.\n\nUn Pinochet real con nombre real convertiría la novela en periodismo. Un 'general Perdomo' la convierte en literatura universal.",
          keyInfo: "Perdomo ≠ Pinochet. Skármeta lo hace universal a propósito: esta historia no es solo de Chile.",
          noteLabel: "📖 Perdomo ≠ Pinochet — ficción universal, no solo Chile"
        },
        {
          id: "l3_testimonio", label: "Testimonio de un detenido", x: 18, y: 55, w: 26, h: 20, emoji: "✉️",
          sourceType: "carta",
          title: "Testimonio recogido por la Vicaría de la Solidaridad, 1978",
          content: "Mi nombre no puedo escribirlo. Me detuvieron el 15 de octubre de 1973.\nTenía 34 años y dos hijos pequeños.\n\nEstuve en un lugar del que no sé el nombre. Con los ojos vendados en el jeep. Después me soltaron en la pampa, al norte.\n\nMi familia no supo nada durante tres meses.\n\n[Testimonio anónimo recogido por la Vicaría de la Solidaridad, organismo de la Iglesia Católica que documentó las violaciones de derechos humanos durante la dictadura.]",
          keyInfo: "El padre de Daniel podría ser este hombre. La historia de Juan y Daniel era la historia de miles de familias chilenas.",
          noteLabel: "✉️ Testimonio real: el padre de Daniel × miles de familias"
        },
        {
          id: "l3_uniforme_irr", label: "El uniforme del capitán", x: 62, y: 62, w: 18, h: 18, emoji: "🎖️",
          irrelevant: true,
          content: "El capitán Romo llevaba una medalla en el pecho y anteojos más negros que mugre en la rodilla. Para Pedro, era simplemente un señor con bigotes grises. Para los adultos de la novela, ese uniforme significaba todo: poder, peligro y miedo."
        }
      ]
    },
    {
      id: 3,
      title: "La radio y la resistencia",
      subtitle: "Por qué la radio verde era peligrosa",
      bgGradient: "linear-gradient(to bottom, #1A1408 0%, #2A2010 22%, #3E3018 48%, #2A2210 72%, #181408 100%)",
      bgPattern: "radial-gradient(ellipse at 45% 45%, rgba(210,160,50,0.18) 0%, rgba(190,140,30,0.07) 46%, transparent 70%)",
      accentColor: "#D4A843",
      radioComment: "Soy la radio verde. Yo soy el centro de esta historia. Buscad los documentos para entender por qué escucharme era un acto peligroso — y por qué lo hacían igual.",
      passwordWord: "MOSCÚ",
      passwordHint1: "Busca desde qué ciudad soviética emitía la radio que muchas familias chilenas opositoras escuchaban clandestinamente.",
      passwordHint2: "El texto sobre las radios clandestinas menciona dos emisoras extranjeras principales. Una es la BBC de Londres, la otra es de una ciudad soviética. ¿Cuál?",
      passwordQuestion: "¿Desde qué ciudad soviética emitía la radio clandestina que escuchaban las familias opositoras en Chile?",
      hotspots: [
        {
          id: "l3_radio_clandestina", label: "Radios clandestinas", x: 10, y: 18, w: 26, h: 22, emoji: "📋",
          sourceType: "articulo",
          title: "Las radios clandestinas en Chile (1973-1990)",
          content: "Durante la dictadura de Pinochet, todas las radios chilenas estaban controladas por el Gobierno. La información independiente solo llegaba desde emisoras extranjeras:\n\n— Radio Moscú (URSS): noticias sobre represión política en Chile\n— BBC de Londres: análisis internacional del golpe\n— Radio Francia Internacional\n\nEscucharlas era ilegal. Se oían con mucho ruido y en voz muy baja, por la noche. Exactamente como describe Pedro en la novela.",
          keyInfo: "Radio MOSCÚ y la BBC transmitían la verdad que el gobierno ocultaba. Por eso llegaban con 'mucho ruido'.",
          noteLabel: "📋 Radio Moscú y BBC: la verdad prohibida — con mucho ruido"
        },
        {
          id: "l3_radio_verde_novela", label: "La radio verde", x: 44, y: 14, w: 22, h: 20, emoji: "📻",
          sourceType: "novela",
          title: "La radio verde — extracto de la novela",
          content: "«Oía con atención noticias que llegaban desde muy lejos. A veces venían amigos que se tendían en el suelo, fumaban como chimeneas y ponían las orejas cerca del receptor.»\n\nPedro le preguntó a su mamá:\n— ¿Por qué siempre oyen esa radio llena de ruidos?\n— Porque es interesante lo que dice.\n— ¿Y por qué se oye tan mal?\n— La voz viene de muy lejos.",
          keyInfo: "'La voz viene de muy lejos': la madre dice la verdad. La radio SÍ venía de muy lejos — desde Moscú o Londres.",
          noteLabel: "📻 'La voz viene de muy lejos' = Radio Moscú o BBC"
        },
        {
          id: "l3_decreto_censura", label: "Decreto de censura", x: 70, y: 16, w: 22, h: 20, emoji: "📄",
          sourceType: "documento",
          title: "Decreto sobre Medios de Comunicación — Chile 1973",
          content: "GOBIERNO MILITAR DE CHILE\nDecreto sobre Medios de Comunicación\n\nQueda TERMINANTEMENTE PROHIBIDA la emisión, reproducción o escucha de información procedente de:\n— Gobiernos o entidades del bloque comunista\n— Organismos internacionales no reconocidos por el Gobierno\n— Personas declaradas enemigas del régimen\n\nLa infracción será sancionada con arresto inmediato.\n\nFirmado: Junta Militar de Chile.",
          keyInfo: "La radio verde es ilegal bajo este decreto. Escuchar Radio Moscú = arresto inmediato. El padre de Pedro lo arriesga cada noche.",
          noteLabel: "📄 Decreto: escuchar radio soviética = arresto inmediato"
        },
        {
          id: "l3_radio_simbolo", label: "La radio como símbolo", x: 20, y: 55, w: 32, h: 18, emoji: "📖",
          sourceType: "articulo",
          title: "La radio verde — análisis literario",
          content: "La radio verde es el objeto más importante de la novela. Aparece en las primeras páginas y regresa en el momento clave: cuando Pedro, escuchándola con sus padres, entiende por fin qué significa 'dictadura'.\n\nNo es solo un aparato: es el símbolo de la resistencia familiar, el canal por donde llega la verdad, el hilo que conecta a la familia de Pedro con quienes también resisten.\n\nSin la radio verde, Pedro nunca habría podido escribir su composición.",
          keyInfo: "La radio verde = símbolo de resistencia, verdad y conocimiento. Sin ella, no hay historia.",
          noteLabel: "📖 La radio verde: símbolo de resistencia y conocimiento"
        },
        {
          id: "l3_antena_irr", label: "La antena", x: 66, y: 60, w: 16, h: 18, emoji: "📡",
          irrelevant: true,
          content: "La antena verde se levantaba cada noche. Un gesto pequeño, casi invisible desde la calle. Pero en aquel Chile, levantar esa antena era un acto de valentía que podía costarte la libertad."
        }
      ]
    },
    {
      id: 4,
      title: "Antonio Skármeta y el exilio",
      subtitle: "El autor que escribió desde el dolor",
      bgGradient: "radial-gradient(ellipse at 45% 55%, #122018 0%, #0A1610 55%, #060C08 100%)",
      bgPattern: "radial-gradient(ellipse at 45% 55%, rgba(70,130,90,0.18) 0%, rgba(50,110,70,0.06) 50%, transparent 74%)",
      accentColor: "#5C9E6F",
      radioComment: "Esta es la última sala del juego. Os voy a hablar de quien me creó: Antonio Skármeta. Para entender por qué escribió esta novela, hay que saber quién es y lo que vivió.",
      passwordWord: "EXILIO",
      passwordHint1: "Busca lo que le ocurrió a Skármeta y a muchos intelectuales chilenos después del golpe de 1973.",
      passwordHint2: "El texto biográfico sobre Skármeta explica que tuvo que salir de Chile. ¿Qué se llama ese acto de tener que marcharse forzosamente de tu país?",
      passwordQuestion: "¿Qué tuvo que hacer Skármeta — como muchos intelectuales chilenos — después del golpe de 1973? (una palabra)",
      hotspots: [
        {
          id: "l3_skarmeta_bio", label: "Antonio Skármeta", x: 10, y: 18, w: 26, h: 22, emoji: "📋",
          sourceType: "articulo",
          title: "Antonio Skármeta — quién es el autor",
          content: "Antonio Skármeta nació en Chile en 1940. Cuando ocurrió el golpe de 1973, era ya un escritor reconocido y profesor universitario en Santiago.\n\nComo muchos intelectuales y artistas chilenos, tuvo que salir de su país para sobrevivir. Vivió en exilio en Argentina y después en Alemania (Berlín), donde vivió muchos años.\n\nEn el exilio, escribió sobre Chile para que el mundo no olvidara lo que estaba ocurriendo. 'La composición' fue publicada en 1999, ilustrada por el español Alfonso Ruano.",
          keyInfo: "Skármeta vivió el EXILIO en Alemania. Escribió 'La composición' desde su propia experiencia del dolor chileno.",
          noteLabel: "📋 Skármeta: exiliado en Berlín — escribió para no olvidar"
        },
        {
          id: "l3_exilio_intelectual", label: "El exilio intelectual", x: 44, y: 15, w: 24, h: 20, emoji: "📄",
          sourceType: "documento",
          title: "El exilio chileno tras el golpe de 1973",
          content: "EXILIO CHILENO 1973-1990\n\nEntre los que tuvieron que abandonar Chile:\n— Músico y compositor: Víctor Jara (asesinado en el Estadio Chile)\n— Grupos musicales: Inti Illimani, Quilapayún (en exilio en Europa)\n— Escritores: Antonio Skármeta, Isabel Allende, José Donoso\n— Científicos, médicos, profesores universitarios\n\nTotal estimado: más de 200.000 personas exiliadas.\n\nMuchos vivieron en Alemania, Francia, México, Venezuela y Suecia.",
          keyInfo: "200.000 exiliados. Skármeta, Isabel Allende, Víctor Jara. Chile perdió a su generación más brillante.",
          noteLabel: "📄 Exilio: 200.000 chilenos — Skármeta e Isabel Allende entre ellos"
        },
        {
          id: "l3_conexion_alemania", label: "Alemania y Chile", x: 70, y: 16, w: 22, h: 20, emoji: "🌍",
          sourceType: "articulo",
          title: "Por qué esta novela se estudia en alemán",
          content: "¿Por qué Skármeta eligió Alemania para su exilio? Alemania Occidental recibió a miles de exiliados chilenos durante los años 70 y 80. Berlín se convirtió en un centro de la resistencia cultural chilena.\n\nNo es casualidad que esta novela se estudie en clase de español en Alemania. Existe una conexión histórica real entre ambos países: muchos alemanes conocen la historia de Chile precisamente porque sus vecinos chilenos se la contaron.",
          keyInfo: "Skármeta vivió en Berlín. Alemania acogió miles de exiliados chilenos. Por eso esta novela llega a vosotros.",
          noteLabel: "🌍 Berlín-Chile: conexión histórica real"
        },
        {
          id: "l3_novela_perspectiva", label: "La mirada de un niño", x: 20, y: 55, w: 30, h: 18, emoji: "📖",
          sourceType: "novela",
          title: "¿Por qué Skármeta eligió la perspectiva de un niño?",
          content: "'La composición' fue publicada 26 años después del golpe. Skármeta no la vivió siendo niño — tenía 33 años en 1973. Pero eligió narrar la historia a través de los ojos de un niño de 9 años.\n\n¿Por qué? Porque los niños hacen las preguntas que los adultos tienen miedo de hacer. Porque la inocencia de Pedro hace visible la absurdidad del terror. Y porque un lápiz en manos de un niño puede ser más poderoso que un fusil.",
          keyInfo: "La perspectiva infantil es el arma literaria de Skármeta: la inocencia de Pedro revela la absurdidad del terror.",
          noteLabel: "📖 La perspectiva de niño: inocencia que revela la absurdidad del terror"
        },
        {
          id: "l3_nota_autor_irr", label: "Nota del autor", x: 62, y: 62, w: 18, h: 18, emoji: "✍️",
          irrelevant: true,
          content: "Skármeta dijo una vez: 'Escribo para los que no pueden hablar.' Pedro habla por todos los niños que vivieron ese tiempo. Y por todos los que siguen viviendo bajo regímenes que les piden que traicionen a sus familias."
        }
      ]
    }
  ]
}

]; // fin de LEVELS

// ─── SOURCE CONFIG ───────────────────────────────────────────────────────────
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

// ─── NORMALIZE PASSWORD ──────────────────────────────────────────────────────
window.normalizePassword = function(s) {
  return s.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s\-]/g, "");
};
