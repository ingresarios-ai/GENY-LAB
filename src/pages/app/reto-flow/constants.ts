// ── PHASES ──────────────────────────────────────────────────────────────────
export const PHASES = {
  activacion:     { label: "Activación",     color: "text-brand-yellow",  glow: "border-brand-yellow",  icon: "🌅", range: [1, 3]  },
  profundizacion: { label: "Profundización", color: "text-brand-blue",    glow: "border-brand-blue",    icon: "🌀", range: [4, 7]  },
  integracion:    { label: "Integración",    color: "text-brand-green",   glow: "border-brand-green",   icon: "🏆", range: [8, 10] },
};

// ── TRACKS ──────────────────────────────────────────────────────────────────
export type RouteType = "novato" | "trader";

export const TRACKS: Record<RouteType, { id: RouteType; nombre: string; emoji: string; tagline: string; desc: string }> = {
  novato: {
    id: "novato",
    nombre: "Novato al Flow",
    emoji: "🌱",
    tagline: "No necesitas saber de trading. Solo necesitas conocerte.",
    desc: "Para personas que quieren dominar su mente y emociones antes de operar.",
  },
  trader: {
    id: "trader",
    nombre: "Trader en Flow",
    emoji: "⚡",
    tagline: "Ya operas. Ahora hazlo desde el estado óptimo.",
    desc: "Para traders activos que quieren activar su zona de máximo rendimiento.",
  },
};

// ── ARQUETIPOS ──────────────────────────────────────────────────────────────
export const ARQUETIPOS = [
  { id: "explorador", nombre: "El Explorador",  emoji: "🧭", desc: "Tu flow llega con la novedad y el descubrimiento. Aprendes haciendo." },
  { id: "estratega",  nombre: "El Estratega",   emoji: "♟️", desc: "Tu flow emerge cuando el plan se ejecuta con precisión." },
  { id: "artesano",   nombre: "El Artesano",    emoji: "⚒️", desc: "Tu flow vive en la práctica deliberada y el dominio progresivo." },
  { id: "guardian",   nombre: "El Guardián",    emoji: "🛡️", desc: "Tu flow viene de la consistencia y la disciplina sostenida." },
  { id: "visionario", nombre: "El Visionario",  emoji: "🔭", desc: "Tu flow surge en la síntesis y la visión de largo plazo." },
];

// ── EMOCIONES ───────────────────────────────────────────────────────────────
export const EMOCIONES = [
  { id: "flow",      label: "En Flow",   emoji: "⚡", color: "#00E676" },
  { id: "enfocado",  label: "Enfocado",  emoji: "🎯", color: "#00D1FF" },
  { id: "neutral",   label: "Neutral",   emoji: "😐", color: "#D0D3D6" },
  { id: "ansioso",   label: "Ansioso",   emoji: "😰", color: "#FEDD04" },
  { id: "frustrado", label: "Frustrado", emoji: "😤", color: "#FF6321" },
  { id: "miedo",     label: "Con Miedo", emoji: "😨", color: "#fe0443" },
];

// ── TIPO DE ACTIVIDAD → COLOR ───────────────────────────────────────────────
export const TIPO_COLOR: Record<string, string> = {
  reflexión: "#7c3aed",
  práctica:  "#00E676",
  ritual:    "#00D1FF",
  jung:      "#FF6321",
  pedem:     "#FEDD04",
};

// ── GLOSARIO ────────────────────────────────────────────────────────────────
export const GLOSARIO = [
  { term: "Flow",               emoji: "⚡", def: "Estado mental de máximo rendimiento donde el tiempo se distorsiona, las distracciones desaparecen y actúas desde tu mejor versión. Ni aburrido ni ansioso: en la zona exacta." },
  { term: "Arquetipo",          emoji: "🎭", def: "Un patrón de personalidad profundo que viene de tu psicología. No es un rol que juegas: es una forma natural de ver y reaccionar ante el mundo. Jung los estudió en miles de personas." },
  { term: "Sombra",             emoji: "🌑", def: "La parte de ti que niegas o no quieres ver. En las finanzas, tu sombra suele ser el miedo, la codicia o la impulsividad. Reconocerla es el primer paso para integrarla." },
  { term: "PEDEM",              emoji: "🔄", def: "Metodología de GENY LAB: Planear → Ejecutar → Documentar → Evaluar → Mejorar. Un ciclo que convierte cualquier acción en aprendizaje compuesto." },
  { term: "Trader",             emoji: "📊", def: "Persona que compra y vende activos financieros (acciones, divisas, contratos) buscando ganar con la diferencia de precio. No necesitas ser millonario para empezar." },
  { term: "Canal Óptimo",       emoji: "🎯", def: "El nivel de desafío justo para entrar en flow. Muy fácil = aburrimiento. Muy difícil = ansiedad. Tu canal óptimo es el punto medio donde creces sin paralizarte." },
  { term: "Self vs Ego",        emoji: "⚖️", def: "El Ego es la voz que reacciona con miedo o soberbia. El Self es tu centro más profundo, el que decide con claridad. Madurar es aprender que el Self guíe al Ego." },
  { term: "P&L",                emoji: "💹", def: "Profit & Loss (Ganancia y Pérdida). El marcador de una sesión de trading. Un trader en flow no opera para el P&L: opera desde la claridad, y el P&L es la consecuencia." },
  { term: "Gestión de Riesgo",  emoji: "🛡️", def: "Saber cuánto puedes perder antes de entrar a una operación. Es la diferencia entre un trader profesional y un apostador." },
  { term: "Csikszentmihalyi",   emoji: "🧠", def: "Mihaly Csikszentmihalyi (se pronuncia 'chick-sent-me-high'). Psicólogo húngaro que estudió el flow durante décadas. Su libro 'Flow' es uno de los más influyentes en psicología del rendimiento." },
  { term: "Sesgo del Día",      emoji: "🧭", def: "La dirección probable del mercado ese día (alcista, bajista o lateral). Un trader lo define antes de operar." },
];

// ── DÍAS ────────────────────────────────────────────────────────────────────
export interface FlowExercise {
  type: string;
  icon: string;
  title: string;
  time: string;
  inst: string;
}

export interface FlowDay {
  day: number;
  phase: string;
  title: string;
  icon: string;
  quote: string;
  teaching: string;
  routes: {
    novato: { context: string; exercises: FlowExercise[] };
    trader: { context: string; exercises: FlowExercise[] };
  };
}

export const DAYS: FlowDay[] = [
  // ═══ DÍA 1 · Activación ═══
  {
    day: 1, phase: "activacion", title: "¿Qué es el Flow?", icon: "🌊",
    quote: "\"El estado de flow ocurre cuando los desafíos que enfrenta una persona están equilibrados con sus habilidades.\" — M. Csikszentmihalyi",
    teaching: "El flow es el estado de máximo rendimiento mental. No es misticismo: es un estado neuroquímico documentado donde tu atención se fusiona con la acción. Csikszentmihalyi lo estudió durante 40 años en atletas, artistas y ejecutivos. La buena noticia: es entrenable.",
    routes: {
      novato: {
        context: "No necesitas saber de trading para experimentar flow. Hoy vas a recordar momentos donde ya lo viviste — probablemente sin saberlo.",
        exercises: [
          { type: "reflexión", icon: "✍️", title: "Mapa de Flow Personal", time: "15 min",
            inst: "Escribe 3 momentos de tu vida donde el tiempo 'desapareció'. No tienen que ver con dinero. ¿Qué tenían en común? Busca el patrón." },
          { type: "práctica", icon: "🎯", title: "Micro-Flow Intencional", time: "20 min",
            inst: "Elige una actividad que te absorba (dibujar, cocinar, un videojuego). Hazla 20 minutos con atención plena. Observa cuándo tu mente se va y cuándo regresa." },
          { type: "reflexión", icon: "📝", title: "Bitácora del Día", time: "10 min",
            inst: "¿Lograste entrar en flow aunque sea unos segundos? ¿Qué lo facilitó? ¿Qué lo interrumpió? Escribe sin filtro." },
        ]
      },
      trader: {
        context: "Ya conoces el flow — lo has sentido en tus mejores sesiones. Hoy vas a diseccionar exactamente qué condiciones lo producen en ti.",
        exercises: [
          { type: "reflexión", icon: "✍️", title: "Diagnóstico de Flow", time: "15 min",
            inst: "Identifica tus 3 últimas sesiones en flow. ¿Qué condiciones internas y externas las produjeron? Busca el patrón con honestidad." },
          { type: "práctica", icon: "📊", title: "Sesión de Observación", time: "30 min",
            inst: "Opera con volumen 50% menor. Tu ÚNICO objetivo: observar tu estado interno, no el P&L. ¿Cuándo aparece el flow? ¿Cuándo se rompe?" },
          { type: "reflexión", icon: "📝", title: "Bitácora del Trader", time: "10 min",
            inst: "Documenta: ¿Hubo flow? ¿En qué momento exacto? ¿Qué lo rompió? Datos, no justificaciones." },
        ]
      }
    }
  },
  // ═══ DÍA 2 · Activación ═══
  {
    day: 2, phase: "activacion", title: "Tu Mapa Emocional", icon: "🗺️",
    quote: "\"Conocer tu oscuridad es el mejor método para tratar con la oscuridad de otras personas.\" — C.G. Jung",
    teaching: "Antes de entrenar el flow, necesitas un mapa emocional honesto. Las emociones no son obstáculos — son información. El miedo te dice dónde está tu límite actual. La ansiedad señala que el desafío excede tu habilidad percibida. Mapearlas es el primer paso para calibrar tu canal óptimo.",
    routes: {
      novato: {
        context: "Tu relación emocional con el dinero y las decisiones importantes es la base sobre la que construirás todo. Hoy la revelamos sin juicios.",
        exercises: [
          { type: "jung", icon: "🎭", title: "Retrato Emocional", time: "20 min",
            inst: "Dibuja o escribe cómo te sientes cuando tomas decisiones con dinero. ¿Hay miedo? ¿Emoción? ¿Evitación? Sin juicios, solo observa." },
          { type: "práctica", icon: "📋", title: "Registro Emocional en Tiempo Real", time: "Durante el día",
            inst: "Cada vez que toques dinero hoy (compra, pago, transferencia), escribe: 'Me siento ___ porque ___'. Mínimo 5 registros." },
          { type: "reflexión", icon: "🔍", title: "Análisis de Patrones", time: "10 min",
            inst: "Revisa tus registros del día. ¿Qué emoción se repite más? ¿Cuándo aparece el miedo vs. la confianza? Ese es tu mapa base." },
        ]
      },
      trader: {
        context: "Tus emociones ya están operando en cada trade. El FOMO, el revenge trading, la parálisis ante una pérdida — todo es tu mapa emocional en acción.",
        exercises: [
          { type: "jung", icon: "🎭", title: "Mapa Emocional del Trader", time: "20 min",
            inst: "Crea un mapa de tus 6 emociones más frecuentes durante el trading. Para cada una: ¿en qué situación aparece? ¿Qué decisión tomas cuando llega?" },
          { type: "práctica", icon: "📊", title: "Trading con Bitácora Emocional", time: "30 min",
            inst: "Opera normalmente pero cada 5 minutos registra tu emoción dominante. Al final: ¿hay correlación entre emoción y resultado?" },
          { type: "reflexión", icon: "🔍", title: "El Patrón Revelado", time: "10 min",
            inst: "¿Cuál es tu emoción dominante cuando ganas? ¿Y cuando pierdes? ¿Cuál te saca del flow con más frecuencia? Esa es tu puerta de entrada." },
        ]
      }
    }
  },
  // ═══ DÍA 3 · Activación ═══
  {
    day: 3, phase: "activacion", title: "El Ritual de Entrada", icon: "🚪",
    quote: "\"El flow no sucede por accidente. Es resultado de preparación intencional y condiciones óptimas.\" — Steven Kotler",
    teaching: "Los atletas de elite no entran en zona por suerte. Tienen rituales de entrada que preparan su sistema nervioso para el rendimiento óptimo. Respiración, intención, eliminación de distracciones — estos no son caprichos: son protocolos neurológicos que activan el estado de flow.",
    routes: {
      novato: {
        context: "No necesitas ser trader para beneficiarte de un ritual de entrada. Cualquier tarea importante se ejecuta mejor cuando preparas tu mente primero.",
        exercises: [
          { type: "ritual", icon: "🧘", title: "Protocolo de Entrada", time: "10 min",
            inst: "Crea una rutina de 5 minutos: 1) Respiración 4-7-8 × 3 ciclos, 2) Escribe tu intención para la sesión, 3) Apaga notificaciones. Practícala ahora." },
          { type: "práctica", icon: "🎯", title: "Flow con Ritual", time: "25 min",
            inst: "Elige una tarea desafiante (estudiar, resolver un problema, crear algo). Ejecuta tu ritual de entrada y luego trabaja 20 min sin parar. ¿Notas diferencia?" },
          { type: "reflexión", icon: "📝", title: "Evaluación del Ritual", time: "10 min",
            inst: "¿El ritual te ayudó a enfocarte más rápido? ¿Qué ajustarías? Tu ritual evolucionará — hoy es la versión 1.0." },
        ]
      },
      trader: {
        context: "Tu protocolo pre-trading es tu borde competitivo más subestimado. Los traders en flow no abren la plataforma y empiezan a operar. Preparan su estado interno primero.",
        exercises: [
          { type: "ritual", icon: "🧘", title: "Protocolo Pre-Trading", time: "10 min",
            inst: "Diseña tu protocolo de 5 min: 1) Respiración 4-7-8 × 3 ciclos, 2) Define tu sesgo del día, 3) Revisa niveles clave, 4) Intención escrita. Ejecútalo ahora." },
          { type: "práctica", icon: "📊", title: "Sesión con Protocolo Activo", time: "30 min",
            inst: "Ejecuta tu ritual COMPLETO antes de operar. Durante la sesión, observa: ¿entraste al mercado más calmado? ¿Tus decisiones fueron más limpias?" },
          { type: "reflexión", icon: "📝", title: "Evaluación del Protocolo", time: "10 min",
            inst: "¿Qué parte del ritual tuvo más impacto? ¿Qué quieres ajustar mañana? Documenta la versión 1.0 de tu protocolo personal." },
        ]
      }
    }
  },
  // ═══ DÍA 4 · Profundización ═══
  {
    day: 4, phase: "profundizacion", title: "La Voz del Miedo", icon: "😨",
    quote: "\"Lo que niegas te somete. Lo que aceptas te transforma.\" — C.G. Jung",
    teaching: "El miedo no es tu enemigo — es un mensajero. Detrás de cada miedo financiero hay una creencia no examinada. Jung demostró que la sombra (lo que rechazamos de nosotros) acumula poder precisamente porque la evitamos. Hoy enfrentas al miedo directamente.",
    routes: {
      novato: {
        context: "Probablemente hay una decisión financiera que llevas evitando. Invertir, ahorrar, tomar un riesgo calculado. ¿Qué te dice la voz interior cuando piensas en ella?",
        exercises: [
          { type: "jung", icon: "🌑", title: "La Sombra del Miedo", time: "20 min",
            inst: "Escribe sobre una decisión financiera que evitas. ¿Qué te dice tu voz interior? Dale nombre a ese miedo. 'Mi miedo se llama ___ y me dice ___'." },
          { type: "práctica", icon: "🎯", title: "Desafío Óptimo", time: "30 min",
            inst: "El flow ocurre entre el aburrimiento y la ansiedad. Elige algo que te cueste pero no te paralice. Hazlo 30 minutos sin rendirte." },
          { type: "reflexión", icon: "🔍", title: "Diálogo con el Miedo", time: "10 min",
            inst: "Si tu miedo pudiera hablar, ¿qué necesita realmente? El miedo es protección mal calibrada. ¿De qué te está protegiendo?" },
        ]
      },
      trader: {
        context: "Tu miedo ya está operando contigo. Está en el stop loss que mueves, en la posición que no tomas, en el profit que cortas demasiado pronto.",
        exercises: [
          { type: "jung", icon: "🌑", title: "La Sombra del Trader", time: "20 min",
            inst: "¿Qué emoción te saca del flow con más frecuencia: miedo, codicia, soberbia? Escríbele directamente. Dale nombre sin juzgar." },
          { type: "práctica", icon: "📊", title: "Operar con Consciencia del Miedo", time: "30 min",
            inst: "Opera normalmente pero cada vez que sientas miedo, NÓMBRALO en voz alta antes de decidir. ¿Cambia la decisión cuando iluminas la emoción?" },
          { type: "reflexión", icon: "🔍", title: "El Miedo como Información", time: "10 min",
            inst: "Tu miedo tiene data que tu análisis técnico no. ¿Cuándo tu miedo tuvo razón? ¿Cuándo te saboteó? Documenta la diferencia." },
        ]
      }
    }
  },
  // ═══ DÍA 5 · Profundización ═══
  {
    day: 5, phase: "profundizacion", title: "PEDEM Consciente", icon: "🔄",
    quote: "\"No se trata de cuánto operas, sino de cuánto aprendes de cada operación.\" — Metodología PEDEM",
    teaching: "PEDEM es la metodología de GENY LAB: Planear → Ejecutar → Documentar → Evaluar → Mejorar. Cuando la aplicas con plena consciencia, cada acción se convierte en aprendizaje compuesto. El flow y PEDEM se potencian mutuamente: uno demanda presencia, el otro demanda estructura.",
    routes: {
      novato: {
        context: "PEDEM no es solo para traders. Es un framework para cualquier meta importante. Hoy lo aplicas a una decisión financiera personal.",
        exercises: [
          { type: "pedem", icon: "📋", title: "PLANEAR sin Miedo", time: "15 min",
            inst: "Escribe un plan simple para una meta financiera pequeña (ahorrar X, invertir Y, aprender Z). No tiene que ser perfecta. Solo tiene que existir." },
          { type: "pedem", icon: "🎯", title: "EJECUTAR con Presencia", time: "20 min",
            inst: "Ejecuta el primer paso de tu plan. Observa tu estado interno mientras lo haces. ¿Hay flow o hay miedo? ¿Es tu Self o tu ego quien decide?" },
          { type: "pedem", icon: "📝", title: "DOCUMENTAR con Honestidad", time: "10 min",
            inst: "Documenta qué hiciste, cómo te sentiste, y qué aprendiste. Las 3 preguntas PEDEM: ¿Qué salió bien? ¿Qué falló? ¿Qué haré diferente?" },
        ]
      },
      trader: {
        context: "Ejecutar PEDEM con consciencia es operar desde el Self y no desde el ego reactivo. Hoy cada parte del ciclo se hace con presencia total.",
        exercises: [
          { type: "pedem", icon: "📋", title: "PLANEAR con Claridad", time: "15 min",
            inst: "Antes de la sesión: define 3 setups (configuraciones o patrones gráficos de entrada), niveles de entrada, stop loss y target. SIN ambigüedad. Si no hay setup claro, el plan es NO operar." },
          { type: "pedem", icon: "📊", title: "EJECUTAR desde el Self", time: "40 min",
            inst: "Ejecuta tu plan con plena consciencia. Cada decisión pregúntate: ¿esto lo decide mi análisis o mi emoción? Opera desde la claridad." },
          { type: "pedem", icon: "📝", title: "DOCUMENTAR sin Ego", time: "15 min",
            inst: "Documenta con honestidad radical: ¿Seguiste el plan? ¿Dónde se coló la emoción? ¿Qué harás diferente mañana? Sin justificaciones." },
        ]
      }
    }
  },
  // ═══ DÍA 6 · Profundización ═══
  {
    day: 6, phase: "profundizacion", title: "Ego vs Self del Trader", icon: "⚖️",
    quote: "\"El ego protege. El Self transforma. La madurez ocurre cuando el Self aprende a guiar al ego.\" — Adaptación Jungiana",
    teaching: "Jung separó el ego (la identidad consciente, reactiva, defensiva) del Self (el centro integrador, la totalidad de la psique). En el trading — y en la vida — la mayoría de las malas decisiones vienen del ego: la necesidad de tener razón, el miedo a perder estatus, la codicia. El Self decide con claridad.",
    routes: {
      novato: {
        context: "Tu ego financiero es esa voz que dice 'no tengo disciplina', 'el dinero no es para mí', 'no entiendo esto'. Tu Self sabe que puedes aprender cualquier cosa.",
        exercises: [
          { type: "jung", icon: "⚖️", title: "Diálogo Ego vs Self", time: "15 min",
            inst: "Escribe una conversación entre tu 'ego financiero' (miedoso, reactivo) y tu 'Self financiero' (calmado, estratégico). ¿Qué le dice cada uno al otro?" },
          { type: "ritual", icon: "🧘", title: "Meditación del Observador", time: "10 min",
            inst: "10 min de meditación: visualiza al ego y al Self como dos personajes. El ego grita, el Self observa. Practica ser el que observa al que grita." },
          { type: "reflexión", icon: "🔍", title: "¿Quién decide hoy?", time: "10 min",
            inst: "Revisa las 3 últimas decisiones importantes que tomaste. ¿Las tomó tu ego o tu Self? ¿Cómo habrían sido diferentes desde el Self?" },
        ]
      },
      trader: {
        context: "En el trading, el ego quiere tener razón. El Self quiere hacer lo correcto. ¿Cuál toma tus decisiones reales?",
        exercises: [
          { type: "jung", icon: "⚖️", title: "El Trader-Self vs El Trader-Ego", time: "15 min",
            inst: "Meditación de 10 min: visualiza al Trader-Self separado del ego reactivo. ¿Cuál toma tus decisiones reales? ¿Cuál quieres que las tome?" },
          { type: "práctica", icon: "📊", title: "Operar desde el Self", time: "30 min",
            inst: "Sesión de trading donde antes de cada decisión preguntas: '¿Esto es ego o Self?' Si es ego, no lo ejecutas. Documenta qué descubres." },
          { type: "reflexión", icon: "🔍", title: "Evaluación Ego/Self", time: "10 min",
            inst: "¿Cuántas veces fue el ego? ¿Cuántas el Self? ¿Cuáles fueron mejores decisiones? La data no miente." },
        ]
      }
    }
  },
  // ═══ DÍA 7 · Profundización ═══
  {
    day: 7, phase: "profundizacion", title: "Concentración Pura", icon: "🔬",
    quote: "\"La concentración profunda es el músculo del flow. Cuanto más lo entrenas, más fácil es activar el estado.\" — Steven Kotler",
    teaching: "El flow requiere concentración ininterrumpida. Cada notificación, cada distracción, cada 'solo voy a revisar rápido' resetea tu estado. La concentración pura es la habilidad más valiosa del siglo XXI — y la más rara. Hoy la entrenas sin excusas.",
    routes: {
      novato: {
        context: "La capacidad de concentrarte sin distracciones es la base de cualquier éxito financiero. No se trata de ser inteligente — se trata de no dispersarte.",
        exercises: [
          { type: "práctica", icon: "🔬", title: "Bloque de Concentración Pura", time: "30 min",
            inst: "Elige una tarea importante. Sin móvil, sin redes, sin interrupciones. 30 minutos de foco absoluto. Registra cada distracción que surja internamente." },
          { type: "ritual", icon: "⏱️", title: "Protocolo Anti-Distracción", time: "10 min",
            inst: "Crea tu lista personal: 3 distracciones que debes eliminar y 3 condiciones que facilitan tu concentración. Comprométete con ellas por 24h." },
          { type: "reflexión", icon: "📝", title: "Nivel de Flow Alcanzado", time: "10 min",
            inst: "¿Hubo momentos de flow durante la concentración? ¿Cuántas veces te distrajiste? ¿Desde dónde operaste: ego disperso o Self enfocado?" },
        ]
      },
      trader: {
        context: "Una sesión de trading sin interrupciones vale más que 10 sesiones dispersas. Hoy entrenas la concentración como si fuera tu hedge.",
        exercises: [
          { type: "práctica", icon: "📊", title: "Sesión Sin Interrupciones", time: "45 min",
            inst: "Sesión completa sin móvil, sin redes, sin interrupciones. Registra cada distracción que surja. ¿Desde dónde operaste hoy?" },
          { type: "ritual", icon: "⏱️", title: "Protocolo de Foco del Trader", time: "10 min",
            inst: "Documenta: ¿Qué condiciones ambientales y mentales necesitas para tu concentración máxima? Este es tu setup (configuración o preparación) no-técnico más importante." },
          { type: "reflexión", icon: "📝", title: "Ratio Flow/Ruido", time: "10 min",
            inst: "¿Cuántos minutos estuviste en flow real vs. ruido mental? Calcula tu ratio. ¿Es mejor que la semana pasada?" },
        ]
      }
    }
  },
  // ═══ DÍA 8 · Integración ═══
  {
    day: 8, phase: "integracion", title: "Tu Sistema de Flow", icon: "⚙️",
    quote: "\"La excelencia no es un acto, sino un hábito.\" — Aristóteles, adaptado por Csikszentmihalyi",
    teaching: "Los primeros 7 días fueron exploración y experimentación. Ahora viene la integración. Un sistema de flow es tu colección personal de condiciones internas y externas que garantizan tu estado óptimo. No es genérico — es tuyo. Lo documentas y lo conviertes en protocolo.",
    routes: {
      novato: {
        context: "Ya tienes 7 días de datos sobre ti mismo. ¿Qué funciona? ¿Qué no? Hoy creamos tu manual personal de flow.",
        exercises: [
          { type: "pedem", icon: "⚙️", title: "Tu Protocolo Personal", time: "25 min",
            inst: "Documenta exactamente qué condiciones internas (estado emocional, nivel de energía) y externas (ambiente, hora, música) facilitan tu flow. Este es tu protocolo 1.0." },
          { type: "práctica", icon: "🎯", title: "Activar el Sistema", time: "20 min",
            inst: "Implementa tu protocolo completo y realiza una tarea que requiera concentración. ¿El sistema funcionó? ¿Qué ajustarías?" },
          { type: "reflexión", icon: "📝", title: "Versión 2.0", time: "10 min",
            inst: "Actualiza tu protocolo con los aprendizajes de hoy. Tu sistema está vivo — evolucionará contigo." },
        ]
      },
      trader: {
        context: "7 días de observación no mienten. Ya sabes cuándo entras en flow y cuándo no. Hoy lo conviertes en un sistema replicable.",
        exercises: [
          { type: "pedem", icon: "⚙️", title: "Sistema de Flow del Trader", time: "25 min",
            inst: "Documenta exactamente qué condiciones internas y externas garantizan tu estado óptimo. Hora, setup (configuración o patrón gráfico de entrada), ritual, nivel de riesgo, estado emocional. Este es tu protocolo." },
          { type: "práctica", icon: "📊", title: "Sesión con Sistema Completo", time: "30 min",
            inst: "Activa TODOS tus protocolos: ritual de entrada, condiciones ambientales, gestión de riesgo. Opera desde el sistema, no desde el impulso." },
          { type: "reflexión", icon: "📝", title: "Evaluación del Sistema", time: "10 min",
            inst: "¿El sistema mejoró tu sesión? ¿Dónde falló? Ajusta para mañana. Versión 2.0 documentada." },
        ]
      }
    }
  },
  // ═══ DÍA 9 · Integración ═══
  {
    day: 9, phase: "integracion", title: "Integrar la Sombra", icon: "🌗",
    quote: "\"No se ilumina imaginando figuras de luz, sino haciendo consciente la oscuridad.\" — C.G. Jung",
    teaching: "Integrar la sombra no es destruirla — es incorporarla. Tu miedo puede convertirse en prudencia. Tu codicia puede convertirse en ambición estratégica. Tu impulsividad puede convertirse en capacidad de acción rápida. La sombra integrada es poder consciente.",
    routes: {
      novato: {
        context: "La sombra que descubriste en el Día 4 no es tu enemiga. Es energía mal canalizada. Hoy la transformas.",
        exercises: [
          { type: "jung", icon: "🌗", title: "Carta a la Sombra", time: "20 min",
            inst: "Vuelve al miedo del Día 4. Escríbele una carta de integración. No lo combatas: incorpóralo. 'Querido miedo, entiendo que me proteges de ___. Te integro como ___.'" },
          { type: "práctica", icon: "🎯", title: "Acción desde la Integración", time: "15 min",
            inst: "Toma una pequeña acción financiera que antes evitabas. Pero hazla desde la prudencia (sombra integrada), no desde el miedo." },
          { type: "reflexión", icon: "🔍", title: "Mi Sombra y Mi Fuerza", time: "15 min",
            inst: "Integración Jungiana: tu sombra (lo que evitas) y tu fuerza (lo que ya eres). Escribe ambas. Juntas forman a la persona que vas a ser." },
        ]
      },
      trader: {
        context: "Vuelve a la sombra del Día 4. ¿Cambió algo en estos 5 días? Tu Trader-Sombra puede convertirse en tu mayor edge.",
        exercises: [
          { type: "jung", icon: "🌗", title: "Carta de Integración al Trader-Sombra", time: "20 min",
            inst: "Escríbele una carta de integración desde el Trader-Self. No la combatas: incorpórala. Tu codicia puede ser ambición. Tu miedo puede ser gestión de riesgo." },
          { type: "práctica", icon: "📊", title: "Operar con Sombra Integrada", time: "25 min",
            inst: "Opera reconociendo tu sombra como aliada. Cuando aparezca: nómbrala, agradécele la información, y decide desde el Self." },
          { type: "reflexión", icon: "🔍", title: "El Edge de la Sombra", time: "10 min",
            inst: "¿Cuál es el 'edge' que te da tu sombra integrada? Documéntalo. Este es un insight que pocos traders tienen." },
        ]
      }
    }
  },
  // ═══ DÍA 10 · Integración ═══
  {
    day: 10, phase: "integracion", title: "El Trader en Flow", icon: "🏆",
    quote: "\"La recompensa del flow no está en el resultado, sino en la experiencia de ser totalmente tú.\" — M. Csikszentmihalyi",
    teaching: "Hoy no es un final — es un comienzo. Los últimos 9 días instalaron protocolos, revelaron tu sombra, y entrenaron tu capacidad de flow. El Día 10 es tu declaración: ya no eres quien eras el Día 1. Ahora decides quién serás de aquí en adelante.",
    routes: {
      novato: {
        context: "No necesitaste un solo trade para transformar tu relación con el dinero, el riesgo y contigo mismo. Eso es poder real.",
        exercises: [
          { type: "reflexión", icon: "📝", title: "Carta al Trader que Seré", time: "25 min",
            inst: "Escribe una carta a tu yo futuro como persona en flow. ¿Qué aprendiste? ¿Qué sueltas? ¿Qué te llevas? Esta es tu declaración." },
          { type: "ritual", icon: "🏆", title: "Sesión Ceremonial de Cierre", time: "15 min",
            inst: "Activa tu ritual completo. Haz algo que habrías evitado el Día 1 (revisar finanzas, planear una inversión, presupuestar). Hazlo desde el flow." },
          { type: "reflexión", icon: "🌟", title: "Manifiesto Personal del Flow", time: "20 min",
            inst: "Escribe tu manifiesto en 3 líneas: 1) Quién soy en flow, 2) Qué ya no tolero, 3) Qué haré esta semana para mantener el estado." },
        ]
      },
      trader: {
        context: "Hoy operas como el Trader en Flow. Todos los protocolos, la sombra integrada, el PEDEM consciente — todo se activa. Este es tu día.",
        exercises: [
          { type: "ritual", icon: "🏆", title: "Protocolo Ceremonial Completo", time: "15 min",
            inst: "Activa TODOS tus rituales: respiración, intención, setup (configuración o preparación), revisión del sesgo. Hoy es la versión final de tu protocolo. Ejecútalo con presencia total." },
          { type: "práctica", icon: "⚡", title: "Sesión de Trading en Flow Total", time: "60 min",
            inst: "Opera con PEDEM consciente, decide desde el Self, integra la sombra cuando aparezca. Esta sesión no es para ganar dinero — es para ser quien ya eres." },
          { type: "reflexión", icon: "🌟", title: "Manifiesto del Trader en Flow", time: "15 min",
            inst: "Escribe tu manifiesto: 1) Mi estado óptimo es ___, 2) Mi sombra integrada me da ___, 3) Mi protocolo de flow es ___. Este es tu documento vivo." },
        ]
      }
    }
  },
];
