// ═══════════════════════════════════════════════════════════════════════════
// MIS EMOCIONES — Constants & Content
// Based on Carl Jung's shadow work, adapted for traders
// ═══════════════════════════════════════════════════════════════════════════

export type RouteType = "novato" | "operador";

// ── PHASES ─────────────────────────────────────────────────────────────────

export const PHASES: Record<string, {
  label: string;
  color: string;
  hex: string;
  glow: string;
  bgClass: string;
  borderClass: string;
  icon: string;
  range: [number, number];
}> = {
  detectar: {
    label: "Detectar",
    color: "text-orange-500",
    hex: "#f97316",
    glow: "249,115,22",
    bgClass: "from-orange-500/10 to-transparent",
    borderClass: "border-orange-500/20",
    icon: "🎯",
    range: [1, 3],
  },
  desactivar: {
    label: "Desactivar",
    color: "text-amber-500",
    hex: "#f59e0b",
    glow: "245,158,11",
    bgClass: "from-amber-500/10 to-transparent",
    borderClass: "border-amber-500/20",
    icon: "⚔️",
    range: [4, 7],
  },
  dominar: {
    label: "Dominar",
    color: "text-emerald-500",
    hex: "#10b981",
    glow: "16,185,129",
    bgClass: "from-emerald-500/10 to-transparent",
    borderClass: "border-emerald-500/20",
    icon: "👑",
    range: [8, 10],
  },
};

// ── DIAGNOSTIC ─────────────────────────────────────────────────────────────

export const DIAG_Q: Record<RouteType, string[]> = {
  operador: [
    "¿Has movido un stop loss aunque sabías que estaba bien?",
    "¿Has hecho 'revenge trading' después de una pérdida grande?",
    "¿Has cerrado un trade ganador demasiado pronto por miedo?",
    "¿Sientes que 'algo' toma el control y operas contra tu plan?",
  ],
  novato: [
    "¿Has comprado algo por impulso saliendo de tu presupuesto sólo para calmar el estrés o aburrimiento?",
    "¿Has postergado revisar tus cuentas o deudas por miedo a ver tu realidad financiera?",
    "¿Has dejado pasar una oportunidad de ahorrar, invertir o educarte por desidia o miedo al fracaso?",
    "¿Sientes que 'algo' toma el control de tus finanzas y gastas de más aunque te propongas no hacerlo?",
  ]
};

export const DIAG_R: Record<RouteType, Record<string, {
  title: string;
  color: string;
  glow: string;
  message: string;
}>> = {
  operador: {
    silencio: {
      title: "Tu Saboteador está EN SILENCIO",
      color: "#10b981",
      glow: "16,185,129",
      message: "Pero está esperando. Cada trader exitoso lo descubrió tarde — y pagó caro. Tú tienes la oportunidad de blindarte ANTES de que despierte.",
    },
    acechando: {
      title: "Tu Saboteador tiene PIE en la PUERTA",
      color: "#f59e0b",
      glow: "245,158,11",
      message: "Ya hace ruido. Aún no controla — pero está ganando terreno. Detenerlo ahora cuesta días. En 6 meses costará miles.",
    },
    operando: {
      title: "Tu Saboteador está OPERANDO contigo",
      color: "#f97316",
      glow: "249,115,22",
      message: "Y tú estás pagando la cuenta. Cada trade es 50% tuyo, 50% suyo. La diferencia entre perder y ganar consistentemente está en desactivarlo. AHORA.",
    },
    alMando: {
      title: "Tu Saboteador está al MANDO",
      color: "#ea580c",
      glow: "234,88,12",
      message: "Esto es una emergencia. No es tu culpa — pero SÍ es tu responsabilidad. Cada día que esperas, le das más poder.",
    },
  },
  novato: {
    silencio: {
      title: "Tu Saboteador está EN SILENCIO",
      color: "#10b981",
      glow: "16,185,129",
      message: "Pero está al acecho. La impulsividad y el autosabotaje financiero suelen despertarse en momentos inesperados. Tienes la oportunidad de blindar tu mente y tu relación con el dinero antes de empezar a arriesgar capital.",
    },
    acechando: {
      title: "Tu Saboteador tiene PIE en la PUERTA",
      color: "#f59e0b",
      glow: "245,158,11",
      message: "Ya hace ruido en tus finanzas. Pequeños gastos emocionales o la procrastinación para tomar decisiones clave están ganando terreno. Detenerlo ahora te ahorrará dolores de cabeza futuros.",
    },
    operando: {
      title: "Tu Saboteador está TOMANDO las RIENDAS",
      color: "#f97316",
      glow: "249,115,22",
      message: "Y tú estás pagando la cuenta con tus hábitos diarios. La impulsividad o el miedo al fracaso dictan tus pasos, afectando tu capacidad de ahorro y tu libertad financiera. Es hora de desactivarlo.",
    },
    alMando: {
      title: "Tu Saboteador tiene el CONTROL de tus finanzas",
      color: "#ea580c",
      glow: "234,88,12",
      message: "Esto requiere tu atención inmediata. Sientes parálisis ante las oportunidades o tomas decisiones por puro impulso emocional. No es tu culpa (es un patrón aprendido), pero sí es tu responsabilidad tomar el control hoy.",
    },
  }
};

// ── DAYS ───────────────────────────────────────────────────────────────────

export interface Exercise {
  type: string;
  icon: string;
  title: string;
  time: string;
  inst: string;
}

export interface DayData {
  day: number;
  phase: string;
  title: string;
  icon: string;
  hook: string;
  quote: string;
  teaching: string;
  routes: {
    novato: { context: string; exercises: Exercise[] };
    operador: { context: string; exercises: Exercise[] };
  };
}

export const DAYS: DayData[] = [
  // ═══ DAY 1 ═══
  {
    day: 1, phase: "detectar", title: "El Trader que Nadie Ve", icon: "👤",
    hook: "Hay un trader operando contigo. Y NO es tu yo consciente.",
    quote: "\"Hasta que no hagas consciente lo inconsciente, dirigirá tu vida y lo llamarás destino.\" — C.G. Jung",
    teaching: "¿Sabes ese momento en que entras a un trade SABIENDO que no deberías? Eso no es debilidad. Eso es tu Saboteador en acción. Carl Jung lo descubrió hace 100 años: dentro de cada persona vive una segunda personalidad inconsciente. Para los traders, esto significa que en tu silla hay DOS operadores — y solo uno tiene un plan.",
    routes: {
      novato: {
        context: "Tu Saboteador ya existe — solo que aún no le has dado un mercado donde jugar. Mejor conocerlo ahora que cuando esté manejando tu capital.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Espejo de Proyección", time: "15 min", inst: "Escribe 5 cualidades que detestas en personas que ganan mucho dinero o en traders que ves en redes. Para cada una, pregúntate con honestidad brutal: ¿en qué momentos yo también soy así? Lo que rechazas en otros es la firma de tu Saboteador." },
          { type: "meditation", icon: "🧘", title: "Activación del Observador", time: "10 min", inst: "Aplica la respiración de calma 4-7-8 para sintonizar tu atención:\n1. Inhala en 4 segundos.\n2. Retén el aire durante 7 segundos.\n3. Exhala completamente durante 8 segundos.\nRepite este proceso por 4 ciclos.\n\nAl terminar, quédate en silencio y observa qué pensamientos surgen. Aquellos que te causen incomodidad o rechazo son precisamente lo que tu Saboteador intenta esconder." },
          { type: "practice", icon: "🎯", title: "Auditoría de Decisiones", time: "15 min", inst: "Lista las últimas 5 decisiones financieras grandes. Marca con ⚠️ las que tomaste por impulso. Ese patrón es el ensayo general de tu Saboteador." },
          { type: "reflection", icon: "🔍", title: "La Pregunta Filo", time: "5 min", inst: "Antes de dormir, escribe una sola línea: 'Hoy, ¿qué parte de mí no quise ver?' Lo primero que venga. Sin filtro." },
        ],
      },
      operador: {
        context: "Tu Saboteador opera contigo CADA día. Está en los trades impulsivos, en el FOMO, en cada stop que moviste 'solo esta vez'. Hoy le pones cara.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Espejo del Trader", time: "15 min", inst: "Escribe 5 cualidades que detestas en otros traders (codiciosos, impulsivos, arrogantes, inseguros). Para cada una: ¿en qué momento de tu trading TÚ también eres así? La verdad arde — pero esta verdad te va a hacer rico." },
          { type: "meditation", icon: "🧘", title: "Activación del Observador", time: "10 min", inst: "Aplica la respiración de calma 4-7-8 para sintonizar tu atención:\n1. Inhala en 4 segundos.\n2. Retén el aire durante 7 segundos.\n3. Exhala completamente durante 8 segundos.\nRepite este proceso por 4 ciclos.\n\nAl terminar, quédate en silencio y observa los pensamientos que surgen sobre tu trading sin invitarlos. La autocrítica o la impaciencia son la firma directa de tu Saboteador." },
          { type: "practice", icon: "📊", title: "Auditoría Forense de Trades", time: "20 min", inst: "Revisa tus últimos 10 trades. Marca con 🩸 cada uno donde sentiste emoción intensa. Cuenta. Ese número es el porcentaje exacto de tu cuenta que tu Saboteador maneja." },
          { type: "reflection", icon: "🔍", title: "La Confesión", time: "5 min", inst: "Antes de dormir: '¿Qué trade reciente fue 100% decidido por mi Saboteador?' Escríbelo sin justificarlo. Esta confesión vale más que cualquier curso." },
        ],
      },
    },
  },
  // ═══ DAY 2 ═══
  {
    day: 2, phase: "detectar", title: "Las 2 Caras del Trader", icon: "🎭",
    hook: "Tu disciplina es una máscara. Detrás hay alguien más.",
    quote: "\"La persona es lo que uno parece ser; la sombra es lo que uno realmente es.\" — C.G. Jung",
    teaching: "Aquí está la trampa: cuanto MÁS rígida es tu imagen de 'trader disciplinado', más poderoso es el saboteador escondido detrás. El que dice 'yo nunca opero por emoción' es exactamente quien más lo hace — solo que no se ve.",
    routes: {
      novato: {
        context: "Ya tienes una 'persona financiera' aunque no operes. Es la imagen que muestras sobre tu relación con el dinero. La pregunta incómoda: ¿quién hay debajo?",
        exercises: [
          { type: "journal", icon: "✍️", title: "Retrato Dual", time: "20 min", inst: "Toma una hoja de papel y divídela en 2 columnas. En la columna IZQUIERDA escribe: 'Mi yo financiero ideal' (cómo quieres comportarte con tu dinero y qué imagen quieres dar). En la columna DERECHA escribe: 'Mi yo financiero real' (cómo actúas realmente cuando sientes estrés económico, deudas o prisa por ganar). Compara ambas columnas; la diferencia entre lo que quieres ser y lo que haces es el tamaño de tu Saboteador." },
          { type: "meditation", icon: "🧘", title: "Cara a Cara con la Máscara", time: "12 min", inst: "Visualiza tu 'persona financiera' como un personaje frente a ti. Ahora dale la vuelta: ¿qué hay en su sombra y qué esconde?\n\nSi sientes ansiedad o resistencia, aplica la respiración cuadrada (Box Breathing) de 4 tiempos:\n1. Inhala en 4 segundos.\n2. Retén el aire en 4 segundos.\n3. Exhala en 4 segundos.\n4. Mantén los pulmones vacíos en 4 segundos.\nRepite este ciclo hasta calmarte y no huyas del ejercicio." },
          { type: "practice", icon: "🎯", title: "Diario de Emociones $", time: "Durante el día", inst: "Cada vez que toques dinero hoy, escribe: 'Me siento ___ porque ___'. Mínimo 5 registros. La emoción más repetida es lo que tu Saboteador usa de combustible." },
          { type: "reflection", icon: "🔍", title: "La Pregunta del Espejo", time: "5 min", inst: "Si alguien que respetas viera TODAS tus decisiones financieras de 6 meses — incluyendo las impulsivas — ¿qué sentirías? Esa sensación alimenta a tu Saboteador." },
        ],
      },
      operador: {
        context: "Tu 'persona trader' es un disfraz que usas hasta que pierdes 3 trades seguidos. Ahí cae la máscara y aparece quien realmente opera.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Trader Ideal vs Trader Real", time: "20 min", inst: "IZQUIERDA: 'El trader que pretendo ser' (disciplinado, paciente, frío). DERECHA: 'El trader que aparece después de 3 pérdidas seguidas'. Ese segundo trader es a quien vas a vencer en 8 días." },
          { type: "meditation", icon: "🧘", title: "Cara a Cara con la Máscara", time: "12 min", inst: "Visualiza tu Persona trader frente a ti. Ahora dale la vuelta y mira su sombra. Esa figura es tu Saboteador. Necesitas verlo claramente para vencerlo." },
          { type: "practice", icon: "📊", title: "Estado en Tiempo Real", time: "Durante tu sesión", inst: "ANTES de mirar charts: 'Me siento ___ porque ___'. Repite después de cada trade y al cerrar. Mínimo 5 registros. Verás cómo tu estado fluctúa con el P&L. Esa fluctuación = tu Saboteador respirando." },
          { type: "reflection", icon: "🔍", title: "La Pregunta Prohibida", time: "5 min", inst: "Si tus alumnos/colegas vieran TODOS tus trades — los impulsivos, los de venganza — ¿qué sentirías? Esa vergüenza es la herramienta que tu Saboteador usa para dominarte." },
        ],
      },
    },
  },
  // ═══ DAY 3 ═══
  {
    day: 3, phase: "detectar", title: "Captura al Saboteador in Fraganti", icon: "🔦",
    hook: "Hoy le pones nombre. Hoy le pones cara. Hoy lo arrinconas.",
    quote: "\"Un hombre poseído por su sombra siempre se interpone en su propia luz.\" — C.G. Jung",
    teaching: "El autosabotaje no es falta de disciplina. Es un programa inconsciente que protege una creencia oculta. Cada vez que te boicoteas, alguna parte tuya cumple una misión secreta: protegerte, castigarte, mantenerte 'pequeño'. Hoy capturamos al Saboteador con las manos en la masa.",
    routes: {
      novato: {
        context: "Aunque no operes, te saboteas en decisiones cotidianas: procrastinas aprender, evitas exponerte, descartas oportunidades. Hoy nombras al responsable.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Ficha Policial del Saboteador", time: "20 min", inst: "Dale NOMBRE a tu Saboteador. ¿Qué voz usa? ¿Qué frases repite? ('No estás listo', 'Mañana empiezo'). Escribe su modus operandi: cuándo aparece, qué te hace hacer y NO hacer. Sé tan específico como una ficha de la INTERPOL." },
          { type: "meditation", icon: "🧘", title: "Respiración Anti-Sabotaje", time: "8 min", inst: "Aplica la respiración anti-sabotaje usando la técnica 5-5-7 para liberar la tensión y calmar tu mente:\n1. Inhala en 5 segundos.\n2. Retén el aire durante 5 segundos.\n3. Exhala lentamente durante 7 segundos.\nRepite este proceso por 6 ciclos.\n\nCon cada exhalación, repite mentalmente: 'Te veo. No te necesito ahora.' Memoriza esta técnica, será tu principal herramienta los próximos días." },
          { type: "practice", icon: "🎯", title: "Mapa de Triggers", time: "15 min", inst: "Dibuja 3 columnas en una hoja. 1ª Columna: DETONANTE (el evento o estímulo que activa tu sabotaje). 2ª Columna: REACCIÓN (qué haces o dejas de hacer inmediatamente). 3ª Columna: NECESIDAD OCULTA (el miedo o creencia detrás de tu reacción). Ejemplo: 'Veo un curso nuevo (Detonante) → Lo ignoro o pospongo (Reacción) → Miedo a descubrir que no soy tan inteligente o capaz (Necesidad oculta)'. Identifica y escribe 5 detonantes (triggers) en tus finanzas o estudio." },
          { type: "reflection", icon: "🔍", title: "La Necesidad Secreta", time: "10 min", inst: "El autosabotaje no es pereza ni falta de voluntad: es un mecanismo de defensa inconsciente. Tu Saboteador intenta 'protegerte' de algún peligro emocional, aunque lo haga de forma equivocada.\n\nAnaliza tus conductas recientes e identifica cuál de estas misiones secretas está operando en ti:\n\n• Protegerme del fracaso: Evitar intentarlo o postergar para que el fracaso 'no cuente'.\n• Confirmar que 'no merezco': Creencias familiares de escasez o culpa que frenan tu prosperidad.\n• Mantener zona de confort: Miedo a la incomodidad de lo nuevo o a la responsabilidad de ganar más.\n• Evitar el juicio: Miedo al qué dirán si tienes éxito o si fallas.\n• Castigarme: Culpa inconsciente que te lleva a perder dinero por errores del pasado.\n\nLa opción que identifiques representa la 'lealtad invisible' de tu Saboteador. Escríbela en tu cuaderno de trabajo para traerla a la luz y desactivar su control." },
        ],
      },
      operador: {
        context: "Tu Saboteador tiene un curriculum brillante: overtrading, revenge trading, mover stops, parálisis ante setups perfectos. Hoy le hacemos ficha policial.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Ficha Policial del Saboteador", time: "20 min", inst: "NOMBRE: dáselo. VOZ: ¿qué dice? ('Recupera eso YA', 'Un trade más'). MODUS OPERANDI: ¿después de cuántas pérdidas se activa? ¿En qué horario es más peligroso? Lo que no puedes nombrar te sigue dominando." },
          { type: "meditation", icon: "🧘", title: "Respiración Anti-Sabotaje", time: "8 min", inst: "Aplica la respiración anti-sabotaje usando la técnica 5-5-7 para liberar la tensión y calmar tu mente:\n1. Inhala en 5 segundos.\n2. Retén el aire durante 5 segundos.\n3. Exhala lentamente durante 7 segundos.\nRepite este proceso por 6 ciclos.\n\nCon cada exhalación, repite mentalmente: 'Te veo. No te necesito ahora.' Esta es tu primera línea de defensa para recuperar la calma entre trades. Memorízala." },
          { type: "practice", icon: "📊", title: "Protocolo Pausa Obligatoria", time: "Durante tu sesión", inst: "REGLA DE HOY: después de CUALQUIER pérdida, ESPERA 15 minutos. Durante la pausa: '¿Qué quiere hacer mi Saboteador AHORA?' y '¿Por qué NO lo voy a permitir?'. Si sobrevives, le ganaste la batalla." },
          { type: "reflection", icon: "🔍", title: "Los 5 Por Qué del Sabotaje", time: "10 min", inst: "Toma tu peor patrón. ¿Por qué lo hago? → Porque ___. Repite 5 veces. La 5ª respuesta es el miedo nuclear que tu Saboteador protege. Nombrarlo le quita el 50% del poder." },
        ],
      },
    },
  },
  // ═══ DAY 4 ═══
  {
    day: 4, phase: "desactivar", title: "El Dinero Tiene Memoria", icon: "💰",
    hook: "Tu primer recuerdo con dinero está moviendo tu stop loss hoy.",
    quote: "\"Las ramificaciones de la sombra alcanzan el reino de nuestros ancestros.\" — C.G. Jung",
    teaching: "Aquí va la verdad incómoda: tu relación con el dinero la heredaste antes de cumplir 7 años. Cada frase que escuchaste en casa se grabó como código fuente. Y ese código está ejecutándose AHORA, en cada decisión de trading. Hoy lo desinstalamos.",
    routes: {
      novato: {
        context: "Tu Saboteador financiero te habla con la voz de tus padres, abuelos, profesores. Suena como TÚ — pero no eres tú.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Arqueología Financiera", time: "25 min", inst: "1) ¿Qué frases sobre dinero escuchabas en casa? 2) ¿Tu familia era de 'nunca hay' o 'el dinero no importa'? 3) ¿Cuál es tu PRIMER recuerdo emocional con dinero? 4) ¿Qué sientes cuando alguien de tu edad gana mucho? 5) ¿Realmente CREES que mereces abundancia?" },
          { type: "meditation", icon: "🧘", title: "Visualización: Cuenta al Doble", time: "12 min", inst: "Regula tus pulsaciones aplicando coherencia cardíaca:\n1. Inhala suave y profundamente por la nariz durante 5 segundos.\n2. Exhala lento por la boca durante 5 segundos.\nRepite este ritmo constante por 10 ciclos.\n\nAl terminar, visualiza en tu mente que tienes EXACTAMENTE el doble de dinero en tu cuenta. Observa qué emoción surge en tu cuerpo: ¿Alegría? ¿Culpa? ¿Miedo? Lo que sientas es tu Saboteador financiero." },
          { type: "practice", icon: "🎯", title: "Score de Creencias Limitantes", time: "15 min", inst: "Califica 1-10 qué tan VERDADERAS sientes: 'Ganar mucho es egoísta' __/10. 'Si gano mucho, algo malo pasará' __/10. 'Yo no soy de los que tienen dinero' __/10. 'El dinero cambia a la gente' __/10. Las que pasen de 6 son sombras activas." },
          { type: "reflection", icon: "🔍", title: "Carta a tu Yo Niño", time: "10 min", inst: "Escribe desde tu yo adulto a tu yo niño sobre el dinero. Dile lo que NADIE le dijo: que está bien prosperar, que merece abundancia sin culpa. Esto es reparentalización. Es brutalmente efectivo." },
        ],
      },
      operador: {
        context: "Operas todos los días pero tu inconsciente sigue creyendo lo que tu papá decía sobre el dinero en 1995. Hoy lo desactivamos.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Arqueología Financiera Trader", time: "25 min", inst: "1) ¿Qué frases sobre dinero escuchabas en casa? 2) ¿Cuánto SIENTES que mereces ganar al mes? ¿Quién definió ese número? 3) ¿Qué sientes cuando ganas $5K en un día? ¿Y cuando pierdes $5K? 4) ¿Mereces ganar más que tus padres? 5) ¿Tu sizing es pequeño 'por seguridad' o porque NO mereces arriesgar más?" },
          { type: "meditation", icon: "🧘", title: "Visualización: Cuenta al Doble", time: "12 min", inst: "Regula tus pulsaciones aplicando coherencia cardíaca:\n1. Inhala suave y profundamente por la nariz durante 5 segundos.\n2. Exhala lento por la boca durante 5 segundos.\nRepite este ritmo constante por 10 ciclos.\n\nAl terminar, visualiza en tu mente tu cuenta de trading con el DOBLE de capital. ¿Operarías diferente? ¿Sientes resistencia o que 'no te pertenece'? Esa tensión es la firma de tu sombra financiera." },
          { type: "practice", icon: "📊", title: "Auditoría Forense de Sizing", time: "15 min", inst: "Revisa tu position sizing de 2 semanas. ¿Operas demasiado pequeño (miedo) o demasiado grande (codicia)? ¿Tu sizing cambia ganando vs perdiendo? Cada inconsistencia es una huella de tu Saboteador." },
          { type: "reflection", icon: "🔍", title: "Carta al Dinero", time: "10 min", inst: "Escríbele al dinero como si fuera persona. ¿Qué relación tienen? ¿De confianza? ¿De miedo? ¿Lo persigues o lo ahuyentas inconscientemente?" },
        ],
      },
    },
  },
  // ═══ DAY 5 ═══
  {
    day: 5, phase: "desactivar", title: "Habla con tu Enemigo Interior", icon: "🗣️",
    hook: "Vas a hacer algo que parece loco. Y va a cambiarlo todo.",
    quote: "\"Uno no se ilumina imaginando figuras de luz, sino haciendo consciente la oscuridad.\" — C.G. Jung",
    teaching: "Tu Saboteador NO es un concepto abstracto: es una sub-personalidad real con voz propia. Jung descubrió que cuando le das espacio para hablar, te dice cosas que cambian todo. Hoy haces 'Imaginación Activa' — la técnica más poderosa de Jung. Vas a sentarte con tu Saboteador y hablar.",
    routes: {
      novato: {
        context: "Si nunca has hecho esto, va a sentirse raro. Aguanta. Lo que tu Saboteador te dirá hoy puede ahorrarte años de pérdidas futuras.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Diálogo con el Saboteador", time: "25 min", inst: "Escribe una conversación directa con tu Saboteador en tu diario o cuaderno. Hazlo en formato de guion teatral y extiéndete escribiendo al menos 2 páginas para permitir que tu mente inconsciente se exprese sin filtros:\n\n1. Inicia preguntando tú:\nYO: '¿Qué es lo que realmente quieres de mí?'\n2. Deja que fluya la respuesta sin censura:\nSABOTEADOR: (Escribe lo primero que llegue a tu mente, por más irracional o incómodo que sea).\n3. Profundiza con estas preguntas clave:\n• '¿Por qué intentas frenarme en mis metas?'\n• '¿De qué dolor o peligro me estás intentando proteger?'\n• '¿Qué necesitas de mí para estar tranquilo?'\n\nIMPORTANTE: No trates de racionalizar o controlar las respuestas. Permite que el Saboteador responda con total honestidad." },
          { type: "meditation", icon: "🧘", title: "Encuentro Visualizado", time: "15 min", inst: "Cierra los ojos e imagina un espacio seguro. Invita a tu Saboteador a sentarse frente a ti y obsérvalo detalladamente: ¿qué aspecto tiene? ¿Qué edad representa? Pregúntale con respeto qué quiere mostrarte.\n\nSi sientes tensión o ansiedad, regula tu sistema nervioso con la respiración cuadrada (Box Breathing):\n1. Inhala durante 4 segundos.\n2. Retén el aire 4 segundos.\n3. Exhala durante 4 segundos.\n4. Mantén sin aire 4 segundos.\nRepite hasta calmarte y prosigue con la visualización." },
          { type: "practice", icon: "🎯", title: "Doble Filtro de Decisiones", time: "Durante el día", inst: "Antes de tomar cualquier decisión importante hoy (financiera, de estudio o personal), haz una pausa y pregúntate:\n'¿Esta decisión viene de mí o de mi Saboteador?'\n\nSi sientes conflicto interno o dudas, escribe estas 3 líneas en tu cuaderno para ganar claridad:\n1. Mi yo consciente quiere [___] porque [___].\n2. Mi Saboteador quiere [___] porque [___].\n3. Mi decisión final es: [___].\n\nEjemplo:\n1. Mi yo consciente quiere apagar la pantalla porque ya cumplí mi plan del día.\n2. Mi Saboteador quiere abrir otra operación porque tengo prisa por recuperar una pérdida.\n3. Mi decisión final es: Apagar la pantalla y cerrar la sesión." },
          { type: "reflection", icon: "🔍", title: "El Mensaje Central", time: "5 min", inst: "Tu Saboteador te dijo algo hoy que no esperabas. Escríbelo en UNA frase. Ponla donde la veas cada mañana." },
        ],
      },
      operador: {
        context: "Tu Saboteador opera contigo en cada sesión. Hoy lo sientas frente a ti. Vas a descubrir por qué sigues repitiendo errores que sabes que son errores.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Diálogo con tu Saboteador Trader", time: "25 min", inst: "Establece una conversación directa y por escrito con tu Saboteador en tu diario de trading. Usa formato de diálogo continuo y escribe al menos 2 páginas para romper las barreras del ego y ver su verdadera intención:\n\n1. Inicia preguntando tú:\nYO: '¿Por qué me saboteas y me haces romper las reglas en mis mejores setups?'\n2. Responde desde su perspectiva sin filtros:\nSABOTEADOR: (Escribe lo primero que sientas, aunque suene irracional o doloroso).\n3. Continúa el diálogo usando estas preguntas de guía:\n• '¿Qué necesitas de mí cuando operamos?'\n• '¿De qué me proteges al hacerme perder o evitar entrar al mercado?'\n• '¿Cuándo y por qué apareciste por primera vez?'\n\nIMPORTANTE: No controles la escritura, escribe de forma automática y rápida. Las respuestas te revelarán tu verdadero punto ciego en el trading." },
          { type: "meditation", icon: "🧘", title: "Encuentro en tu Estación", time: "15 min", inst: "Visualiza tu estación de trading. Hay alguien sentado en TU silla. Es tu Saboteador. Obsérvalo operar: ¿qué trades toma? ¿Cómo gestiona? Pregúntale POR QUÉ." },
          { type: "practice", icon: "📊", title: "Filtro Pre-Operación Obligatorio", time: "Durante tu sesión", inst: "Antes de cada operación (trade) hoy, realiza una validación obligatoria:\nPregúntate: '¿Esta entrada viene de mi análisis técnico o es impulsada por mi Saboteador?'\n\nSi notas que más de la mitad de tus intenciones de entrada son generadas por el Saboteador, detén la sesión por hoy para proteger tu cuenta." },
          { type: "reflection", icon: "🔍", title: "Lo que Confesó", time: "5 min", inst: "Escribe en UNA frase la confesión más importante de tu Saboteador hoy. Ponla AL LADO DE TU PANTALLA. Léela antes de cada sesión." },
        ],
      },
    },
  },
  // ═══ DAY 6 ═══
  {
    day: 6, phase: "desactivar", title: "El Miedo que Mueve tu Stop", icon: "💀",
    hook: "Cada vez que mueves un stop, tienes 4 años otra vez.",
    quote: "\"La sombra se manifiesta como humor sombrío, enfermedad psicosomática o accidentes provocados inconscientemente.\" — IAAP",
    teaching: "Debajo de cada patrón de sabotaje hay un miedo nuclear instalado en tu infancia. No es racional. No es de adulto. Es pre-verbal. Cada vez que mueves un stop, NO eres tú adulto operando — es un niño asustado tratando de evitar una sensación de hace 30 años.",
    routes: {
      novato: {
        context: "Tu miedo nuclear ya está moldeando tus decisiones financieras. Verlo claramente puede ahorrarte miles en pérdidas futuras.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Los 5 Por Qué del Miedo", time: "20 min", inst: "Toma tu mayor bloqueo financiero. ¿Por qué no lo hago? → Porque ___. Repite 5 veces. La 5ª respuesta es tu miedo nuclear. Ej: 'No invierto → puedo perder → si pierdo no tendré → seré una carga → MIEDO: No valgo nada sin dinero'." },
          { type: "meditation", icon: "🧘", title: "Exposición Controlada", time: "12 min", inst: "Invoca tu miedo nuclear. Déjalo crecer. Dale color, forma, temperatura. Respira 5s/7s hacia él. NO huyas. Quédate 5 minutos. Al final: 'Puedo sentir esto y seguir vivo'. Le quitaste el 50% del poder." },
          { type: "practice", icon: "🎯", title: "Simulación del Peor Escenario", time: "15 min", inst: "Escribe tu PEOR escenario financiero con detalle. ¿Realmente morirías? Luego escribe tu plan B realista. Descubrirás que puedes sobrevivir. Eso desactiva al Saboteador." },
          { type: "reflection", icon: "🔍", title: "Reescritura del Origen", time: "10 min", inst: "Vuelve a la escena infantil donde se instaló tu miedo. Reescríbela como te HABRÍA gustado. ¿Qué te habría dicho un adulto amoroso? Escríbele esas palabras a tu yo niño." },
        ],
      },
      operador: {
        context: "Tu miedo nuclear ES la razón oculta de tus peores trades. Mover el stop, cerrar el ganador a +20%, no tomar el setup perfecto — todo viene de la misma raíz.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Los 5 Por Qué del Trader", time: "20 min", inst: "Toma tu peor patrón. ¿Por qué muevo el stop? → Porque no quiero confirmar la pérdida → Porque perder me hace sentir tonto → Porque mi padre me llamaba tonto → MIEDO: Soy un fracaso. Encuentra TU cadena. Va al hueso." },
          { type: "meditation", icon: "🧘", title: "Exposición Controlada", time: "12 min", inst: "Imagina la PEOR sesión posible. Déjate sentir todo: vergüenza, rabia, impotencia. Respira 5s/7s. Quédate 5 minutos. 'Puedo sentir esto y seguir operando mañana'." },
          { type: "practice", icon: "📊", title: "Operar CON el Miedo Presente", time: "Durante tu sesión", inst: "Cuando sientas miedo antes de un trade, NO lo ignores: 'Te siento. ¿Eres real o eres mi herida?'. Si es real: ajusta el riesgo. Si es herida: opera según tu plan SIN modificar nada." },
          { type: "reflection", icon: "🔍", title: "Carta al Miedo", time: "10 min", inst: "Escríbele a tu miedo nuclear: 'Sé que existes desde ___. Sé que tratas de protegerme. Pero yo ya no soy ese niño. En esta silla, yo decido. Tú observas.' Lee en voz alta antes de tu próxima sesión." },
        ],
      },
    },
  },
  // ═══ DAY 7 ═══
  {
    day: 7, phase: "desactivar", title: "El Don que Has Estado Ignorando", icon: "✨",
    hook: "Tu Saboteador no solo esconde tus defectos. Esconde tu poder.",
    quote: "\"La sombra contiene también cualidades buenas, instintos normales y percepciones realistas.\" — C.G. Jung",
    teaching: "Plot twist: Jung descubrió que la sombra NO solo guarda defectos. También guarda tus DONES reprimidos. Tu intuición que ignoras. Tu creatividad que desprecias. Tu audacia que te da miedo. Esto se llama 'sombra dorada' — el potencial que tu Saboteador enterró por miedo a que brilles.",
    routes: {
      novato: {
        context: "Tienes talentos reprimidos — quizá por miedo a brillar más que tu familia. Tu sombra dorada contiene la versión más poderosa de ti.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Inventario de Dones Reprimidos", time: "20 min", inst: "1) ¿Qué talentos te han elogiado que tú minimizas? 2) ¿Qué harías si NADIE pudiera juzgarte? 3) ¿A quién envidias en silencio? (la envidia señala tu propio potencial dormido). 4) ¿Qué sueño profesional NO te atreves a decir en voz alta?" },
          { type: "meditation", icon: "🧘", title: "Tu Versión en Plenitud", time: "15 min", inst: "Visualiza tu versión MÁS poderosa: sin frenos, sin miedos, sin 'debería'. ¿Cómo se ve? ¿Qué hace? Permítete 5 minutos sintiendo ese poder. NO es fantasía — es tu sombra dorada." },
          { type: "practice", icon: "🎯", title: "Un Acto de Sombra Dorada", time: "Durante el día", inst: "Hoy, haz UNA cosa que tu versión poderosa haría pero que normalmente NO te permites. Audaz, creativa, ambiciosa. Pequeña está bien. El acto físico le quita poder al Saboteador." },
          { type: "reflection", icon: "🔍", title: "Permiso para Brillar", time: "5 min", inst: "Lee en voz alta: 'Me doy permiso para ser extraordinario. Para superar a quienes admiro. Mi luz no le quita luz a nadie.' La frase que más te cueste = la sombra dorada más profunda." },
        ],
      },
      operador: {
        context: "Tienes una intuición de trader que has aprendido a ignorar porque 'no es racional'. Tienes una forma propia de leer el mercado que has reprimido. Hoy recuperas tu poder.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Dones Trader Reprimidos", time: "20 min", inst: "1) ¿Qué talento de trading has minimizado? 2) ¿A qué trader envidias? ¿Qué hace que tú también podrías hacer? 3) ¿Has rechazado tu PROPIA forma de operar por seguir lo 'correcto'? 4) ¿Qué tipo de trader serías sin miedo al juicio?" },
          { type: "meditation", icon: "🧘", title: "El Trader en Plenitud", time: "15 min", inst: "Visualízate operando desde tu MÁXIMO potencial. Sin frenos. Sin segundas adivinanzas. ¿Qué trades tomas? ¿Con qué convicción? Esa versión existe — está esperando que la dejes salir." },
          { type: "practice", icon: "📊", title: "Un Trade desde la Intuición", time: "Durante tu sesión", inst: "Toma UN trade basado en intuición pura (con risk management y stop). Documenta: ¿Qué sentía mi cuerpo? ¿Qué vi que mi cabeza no podía explicar? El resultado no importa. Darle espacio a tu sombra dorada SÍ." },
          { type: "reflection", icon: "🔍", title: "Permiso para Ganar", time: "5 min", inst: "Lee en voz alta: 'Me doy permiso para ganar consistentemente. Para confiar en mi intuición. Para ser mejor de lo que mi familia esperaba.' Repite la que más te cueste 7 veces." },
        ],
      },
    },
  },
  // ═══ DAY 8 ═══
  {
    day: 8, phase: "dominar", title: "Operar con tu Saboteador como Aliado", icon: "🤝",
    hook: "No vas a eliminarlo. Vas a contratarlo.",
    quote: "\"La integración expande la conciencia y libera la energía que se gastaba en luchar contra ella.\" — IAAP",
    teaching: "NO vas a eliminar a tu Saboteador. Eso es imposible. Vas a CONTRATARLO. La energía que él usa para sabotearte se convierte en combustible cuando lo integras. Un trader completo NO es el que nunca siente miedo — es el que siente miedo Y opera con disciplina.",
    routes: {
      novato: {
        context: "Hoy no eliminas a tu Saboteador — lo conviertes en tu sistema de alarma temprana. Su miedo se vuelve tu prudencia. Su impulsividad, tu capacidad de acción rápida.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Reglas de Vida Integradas", time: "25 min", inst: "Reescribe tus reglas financieras incluyendo a tu Saboteador como aliado. Antes: 'Nunca gastar por impulso'. Integrado: 'Cuando siento impulso, pauso 24h. El impulso me INFORMA pero no me gobierna'. Reescribe 5 reglas." },
          { type: "meditation", icon: "🧘", title: "Ritual de Mañana Integrado", time: "10 min", inst: "Establece tu nuevo ritual diario realizando esta rutina en orden:\n\n1. Respiración 4-7-8 (calma tu sistema nervioso × 3 ciclos):\n   • Inhala en 4 segundos.\n   • Sostén durante 7 segundos.\n   • Exhala completamente en 8 segundos.\n2. Pregúntate: '¿Cómo está mi Saboteador hoy?' y escucha tu cuerpo.\n3. Pregúntate: '¿Mi máscara de \"yo ideal\" está demasiado rígida hoy?'\n4. Declara tu intención del día: 'Hoy actúo y decido desde mi totalidad'.\n\nPractica este ritual hoy y conviértelo en tu ancla matutina." },
          { type: "practice", icon: "🎯", title: "Un Día Integrado", time: "Durante el día", inst: "Pasa cada decisión importante por un doble filtro de conciencia preguntándote:\n• ¿Viene de mi yo racional?\n• ¿Viene de mi Saboteador?\n• ¿O es una elección desde mi totalidad?\n\nAl final del día, anota cuántas decisiones de cada tipo tomaste en tu cuaderno. Tu objetivo es que la gran mayoría de tus elecciones sean integradas." },
          { type: "reflection", icon: "🔍", title: "% de Integración", time: "5 min", inst: "Calcula y anota el nivel de control consciente que tuviste hoy en tus decisiones:\n\n1. Recuerda que una decisión es 'integrada' cuando no actúas en piloto automático, sino que identificas los impulsos de tu Saboteador y los de tu mente racional para elegir desde tu sabiduría (totalidad).\n2. Calcula tu porcentaje:\n   • Fórmula: (Decisiones integradas ÷ Total de decisiones del día) × 100.\n   • Ejemplo: Si tomaste 10 decisiones importantes hoy y en 7 de ellas elegiste con conciencia e integración, tu porcentaje es 70%.\n\nEscribe el número final en tu cuaderno de trabajo para registrar y medir tu progreso diario." },
        ],
      },
      operador: {
        context: "Hoy fusionas sombra + PEDEM + flow en un solo sistema operativo. Ya no operas perfecto — operas COMPLETO. Y eso es 100x más rentable.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Reglas de Trading Integradas", time: "25 min", inst: "Reescribe TODAS tus reglas incluyendo al Saboteador como aliado. 'Reconozco mis emociones antes de cada trade. Si detecto Saboteador activo, pauso 15 min. Las emociones me INFORMAN pero no me gobiernan'. Este documento es tu nuevo edge." },
          { type: "meditation", icon: "🧘", title: "Ritual Pre-Trading Integrado", time: "10 min", inst: "Establece tu ritual de pre-trading antes de encender las pantallas:\n\n1. Respiración 4-7-8 (calma tu sistema nervioso × 3 ciclos):\n   • Inhala en 4 segundos.\n   • Sostén durante 7 segundos.\n   • Exhala completamente en 8 segundos.\n2. Pregúntate: '¿Cómo está mi Saboteador hoy?' y siente tu estado físico.\n3. Pregúntate: '¿Mi máscara de trader ideal está demasiado rígida?'\n4. Declara tu intención: 'Hoy opero y gestiono desde la totalidad'.\n5. Abre tu plataforma de trading de forma pausada.\n\nRepite esto al iniciar cada sesión de trading." },
          { type: "practice", icon: "📊", title: "PEDEM + Saboteador", time: "Durante tu sesión", inst: "Agrega columna 'Estado Saboteador' a tu PEDEM. Para cada trade: ¿estado emocional? ¿Saboteador activo? ¿Operé desde totalidad o desde máscara? Calcula tu % de trades integrados." },
          { type: "reflection", icon: "🔍", title: "Score de Integración", time: "10 min", inst: "Calcula tu rendimiento operativo consciente de la sesión de hoy:\n\n1. Evalúa cada una de tus operaciones (trades) de 1 a 10 en estos 4 criterios:\n   • Conciencia (¿operaste con atención plena?)\n   • Ejecución (¿seguiste tu plan técnico al pie de la letra?)\n   • Manejo de Saboteador (¿controlaste tus impulsos emocionales?)\n   • Flow (¿sentiste fluidez y calma al tomar la decisión?)\n2. Promedia las puntuaciones (suma los resultados y divídelos entre el número de operaciones).\n\nTu meta es obtener un promedio mayor a 7. Anota este score en tu diario de trading; este indicador de rendimiento mental es mucho más valioso para tu consistencia a largo plazo que tus ganancias diarias." },
        ],
      },
    },
  },
  // ═══ DAY 9 ═══
  {
    day: 9, phase: "dominar", title: "Convierte tu Veneno en tu Edge", icon: "⚗️",
    hook: "Tu peor defecto contiene tu mayor poder. En serio.",
    quote: "\"En la alquimia, la nigredo — la oscuridad — es la primera etapa de la transformación.\" — C.G. Jung",
    teaching: "Jung pasó décadas estudiando alquimia como metáfora de la integración. La idea: NO se descarta el plomo, se transmuta en oro. Tu impulsividad contiene intuición. Tu miedo contiene prudencia. Tu codicia contiene ambición. Hoy descubres el oro escondido en tus peores rasgos.",
    routes: {
      novato: {
        context: "Tus 'defectos' son materia prima. Cada uno contiene una habilidad latente. Hoy haces alquimia con los tuyos.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Tabla de Transmutación", time: "25 min", inst: "Para cada 'defecto', encuentra el don oculto: Indecisión → Capacidad de evaluar opciones. Impaciencia → Sentido de urgencia. Miedo → Radar de peligro. Procrastinación → Filtro contra decisiones precipitadas. Escribe la versión 'oro' de tus 5 peores defectos." },
          { type: "meditation", icon: "🧘", title: "Visualización Alquímica", time: "15 min", inst: "Imagina un crisol dorado. Coloca tu peor defecto adentro. Observa cómo el fuego lo transforma: oscuro → dorado. ¿En qué se convirtió? Repite con 2 más." },
          { type: "practice", icon: "🎯", title: "Usar el Oro", time: "Durante el día", inst: "Elige tu 'defecto transmutado' más poderoso. Hoy, úsalo conscientemente. Si transmutaste 'miedo' → 'prudencia inteligente': toma una decisión con precaución calculada, no parálisis. Siente la diferencia." },
          { type: "reflection", icon: "🔍", title: "El Oro Encontrado", time: "5 min", inst: "¿Qué descubriste al usar tu defecto transmutado? Escribe la lección en UNA frase para siempre." },
        ],
      },
      operador: {
        context: "Tu impulsividad, miedo, codicia — NO son enemigos. Son materia prima de tu edge. Hoy los conviertes en herramientas operativas.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Tabla de Transmutación Trader", time: "25 min", inst: "Impulsividad → Ejecución rápida cuando el setup es claro. Miedo → Risk management intuitivo. Codicia → Capacidad de dejar correr ganadores. Perfeccionismo → Ojo para entradas precisas. Para CADA defecto: ¿cómo lo aplico mañana?" },
          { type: "meditation", icon: "🧘", title: "Visualización Alquímica", time: "15 min", inst: "Crisol alquímico: coloca tu peor defecto de trading. Observa la transmutación. ¿En qué habilidad se convierte? Repite con 2 más." },
          { type: "practice", icon: "📊", title: "Operar con el Oro", time: "Durante tu sesión", inst: "Elige tu defecto transmutado más poderoso. Hoy ÚSALO. Si transmutaste impulsividad → ejecución rápida: busca un setup que requiera acción inmediata y ejecútalo con convicción. Operas DESDE tu sombra dorada." },
          { type: "reflection", icon: "🔍", title: "Nueva Habilidad", time: "10 min", inst: "¿Tu defecto transmutado funcionó mejor de lo esperado? Escribe la lección en UNA frase que puedas leer antes de cada sesión." },
        ],
      },
    },
  },
  // ═══ DAY 10 ═══
  {
    day: 10, phase: "dominar", title: "El Trader Imparable", icon: "👑",
    hook: "Hoy demuestras quién eres ahora. No quien eras hace 10 días.",
    quote: "\"La integración de la sombra marca la primera etapa del proceso analítico.\" — C.G. Jung",
    teaching: "En 10 días has hecho lo que el 99% de traders nunca hace. Has visto a tu Saboteador, dialogado con él, transmutado tu peor veneno en oro. Hoy NO es un final — es el inicio de un nuevo estándar. Y luego compartes el viaje con quien lo necesite.",
    routes: {
      novato: {
        context: "En 10 días has hecho más trabajo interior que la mayoría en años. Tienes las herramientas para operar — y para vivir — desde tu totalidad.",
        exercises: [
          { type: "journal", icon: "✍️", title: "El Antes y el Después", time: "20 min", inst: "YO HACE 10 DÍAS: ¿Qué no veía? ¿Qué me controlaba? YO HOY: ¿Qué veo ahora? ¿Qué he integrado? Sé específico. Esta es tu evidencia tangible de transformación. Guárdala." },
          { type: "meditation", icon: "🧘", title: "Ceremonia de Cierre", time: "15 min", inst: "Antes de iniciar tu visualización final, realiza la respiración de calma 4-7-8 por 5 ciclos:\n• Inhala en 4 segundos.\n• Retén el aire durante 7 segundos.\n• Exhala lento durante 8 segundos.\n\nAl terminar, visualiza a tu Saboteador frente a ti. Ya no es tu enemigo: es tu aliado contratado e integrado. Estrecha su mano y di en voz alta: 'Somos uno. Actúo y vivo desde mi totalidad'." },
          { type: "practice", icon: "🎯", title: "Diseña tu Ritual Permanente", time: "20 min", inst: "Crea tu sistema diario post-reto. MAÑANA (10 min): ___. DURANTE EL DÍA: ___. NOCHE (5 min): ___. Hazlo REALISTA." },
          { type: "reflection", icon: "🔍", title: "Tu Mensaje + Tu Invitación", time: "10 min", inst: "Si pudieras compartir UNA lección con alguien que la necesita, ¿cuál sería? Escríbela. Ahora ABRE el botón de compartir y envíasela. Quien camina acompañado, llega más lejos." },
        ],
      },
      operador: {
        context: "En 10 días has transformado tu trading desde la raíz. Hoy operas tu mejor setup como un trader integrado. Y luego compartes el reto.",
        exercises: [
          { type: "journal", icon: "✍️", title: "Antes y Después del Trader", time: "20 min", inst: "MI TRADING HACE 10 DÍAS: ¿Cómo operaba? ¿Qué me controlaba? MI TRADING HOY: ¿Cómo opero ahora? ¿Qué integré? Evidencia concreta. La prueba de que ya no eres el mismo." },
          { type: "meditation", icon: "🧘", title: "Ceremonia de Cierre", time: "15 min", inst: "Antes de iniciar tu visualización final, realiza la respiración de calma 4-7-8 por 5 ciclos:\n• Inhala en 4 segundos.\n• Retén el aire durante 7 segundos.\n• Exhala lento durante 8 segundos.\n\nAl terminar, visualiza a tu Saboteador trader frente a ti. Estrecha su mano y declara con firmeza: 'Somos uno. Operamos y gestionamos desde la totalidad'. Abre los ojos sintiendo tu integración." },
          { type: "practice", icon: "📊", title: "El Trade de Individuación", time: "Durante tu sesión", inst: "Opera tu mejor setup con TODO: ritual pre-trading, conciencia de Saboteador, PEDEM 2.0, flow activado. NO importa el resultado — importa la calidad del proceso. Es tu declaración pública." },
          { type: "reflection", icon: "🔍", title: "Manifiesto + Invitación", time: "15 min", inst: "Escribe tu Manifiesto del Trader Integrado en primera persona. Luego: ¿qué trader específico necesita este reto? Compártelo AHORA." },
        ],
      },
    },
  },
];
