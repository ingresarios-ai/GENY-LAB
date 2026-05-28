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
            inst: "ESCRIBE en tu cuaderno 3 momentos de tu vida donde el tiempo 'desapareció' (te absorbiste tanto que no sentiste pasar las horas). No tienen que ver con dinero.\n\nPara cada momento RESPONDE:\n• ¿Qué estabas haciendo?\n• ¿Cómo te sentías?\n• ¿Qué nivel de dificultad tenía?\n\nAl terminar, OBSERVA: ¿Qué tienen en común esos 3 momentos? ESCRIBE el patrón que descubras. Ese patrón es tu puerta de entrada al flow." },
          { type: "práctica", icon: "🎯", title: "Micro-Flow Intencional", time: "20 min",
            inst: "ELIGE una actividad que te absorba (dibujar, cocinar, un videojuego, tocar un instrumento).\n\nPaso 1 — Hazla durante 20 minutos con atención plena total.\n\nPaso 2 — Cada vez que tu mente se distraiga, OBSERVA a dónde fue y regresa a la actividad.\n\nAl terminar, ESCRIBE en tu cuaderno:\n• ¿Cuántas veces se fue tu mente?\n• ¿A dónde iba? (preocupaciones, celular, otra cosa)\n• ¿Hubo algún momento donde desapareció todo y solo estabas 'ahí'?\n\nEse momento de absorción = micro-flow." },
          { type: "reflexión", icon: "📝", title: "Bitácora del Día", time: "10 min",
            inst: "ESCRIBE en tu cuaderno sin filtro, respondiendo estas preguntas:\n\n1. ¿Lograste entrar en flow aunque sea unos segundos? Describe ese momento.\n2. ¿Qué lo facilitó? (ambiente, nivel de dificultad, interés)\n3. ¿Qué lo interrumpió? (distracción, ansiedad, aburrimiento)\n4. ¿Qué harías diferente mañana para que dure más?\n\nEsta es tu primera bitácora de flow. Guárdala para comparar con tu progreso en los próximos días." },
        ]
      },
      trader: {
        context: "Ya conoces el flow — lo has sentido en tus mejores sesiones. Hoy vas a diseccionar exactamente qué condiciones lo producen en ti.",
        exercises: [
          { type: "reflexión", icon: "✍️", title: "Diagnóstico de Flow", time: "15 min",
            inst: "ESCRIBE en tu cuaderno tus 3 últimas sesiones donde sentiste que estabas 'en la zona'.\n\nPara cada sesión DOCUMENTA:\n• ¿Qué condiciones internas tenías? (estado emocional, nivel de energía, claridad mental)\n• ¿Qué condiciones externas había? (hora del día, ambiente, mercado)\n• ¿Cuánto duró el estado de flow?\n\nAl terminar, OBSERVA: ¿Qué patrón se repite en las 3? ESCRIBE ese patrón — es tu fórmula personal de flow." },
          { type: "práctica", icon: "📊", title: "Sesión de Observación", time: "30 min",
            inst: "Opera con volumen 50% menor de lo habitual. Tu ÚNICO objetivo hoy NO es ganar dinero — es observar tu estado interno.\n\nDurante la sesión, ESCRIBE cada 10-15 minutos:\n• 'Me siento ___ ahora mismo'\n• ¿Estoy en flow, enfocado, ansioso o disperso?\n\nAl cerrar, DOCUMENTA:\n• ¿En qué momento apareció el flow?\n• ¿Qué lo rompió?\n• ¿Tu estado interno cambió con el P&L o se mantuvo estable?" },
          { type: "reflexión", icon: "📝", title: "Bitácora del Trader", time: "10 min",
            inst: "ESCRIBE en tu cuaderno con datos concretos (sin justificaciones):\n\n1. ¿Hubo flow? Sí / No / Parcial.\n2. ¿En qué momento exacto apareció? (hora, trade, situación)\n3. ¿Cuánto duró?\n4. ¿Qué lo rompió? (distracción, pérdida, emoción, notificación)\n5. ¿Qué harás diferente mañana para que dure más?\n\nDatos, no justificaciones. Esta bitácora es tu evidencia objetiva." },
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
            inst: "DIBUJA o ESCRIBE en tu cuaderno cómo te sientes cuando tomas decisiones con dinero.\n\nPuedes hacerlo como dibujo (caras, colores, formas) o como texto. RESPONDE:\n• ¿Qué emoción aparece primero? ¿Miedo? ¿Emoción? ¿Evitación?\n• ¿Dónde sientes esa emoción en tu cuerpo? (estómago, pecho, cabeza)\n• ¿Evitas pensar en dinero o te obsesiona?\n\nESCRIBE sin juicios — solo observa y documenta lo que descubras. Este es tu retrato emocional base." },
          { type: "práctica", icon: "📋", title: "Registro Emocional en Tiempo Real", time: "Durante el día",
            inst: "Cada vez que toques dinero hoy (compra, pago, transferencia), escribe: 'Me siento ___ porque ___'. Mínimo 5 registros." },
          { type: "reflexión", icon: "🔍", title: "Análisis de Patrones", time: "10 min",
            inst: "REVISA todos los registros emocionales que hiciste durante el día y ESCRIBE un análisis:\n\n1. ¿Qué emoción se repite más? (miedo, ansiedad, indiferencia, confianza)\n2. ¿En qué tipo de transacción aparece el miedo?\n3. ¿En cuáles sientes confianza?\n4. ¿Hay alguna que prefieras evitar? ¿Por qué?\n\nESCRIBE al final: 'Mi emoción dominante con el dinero es ___ y aparece cuando ___'. Este es tu mapa emocional base." },
        ]
      },
      trader: {
        context: "Tus emociones ya están operando en cada trade. El FOMO, el revenge trading, la parálisis ante una pérdida — todo es tu mapa emocional en acción.",
        exercises: [
          { type: "jung", icon: "🎭", title: "Mapa Emocional del Trader", time: "20 min",
            inst: "ESCRIBE en tu cuaderno una tabla con 3 columnas: EMOCIÓN | SITUACIÓN | DECISIÓN.\n\nLista tus 6 emociones más frecuentes durante el trading y para cada una RESPONDE:\n\n• ¿En qué situación del mercado aparece? (pérdida, ganancia, lateralidad, etc.)\n• ¿Qué decisión tomas cuando llega? (cierras, abres, mueves stop, no haces nada)\n\nEjemplo:\n• Miedo | Cuando el precio se acerca a mi stop | Muevo el stop para evitar la pérdida\n• Euforia | Después de 2 trades ganadores | Aumento el tamaño de posición\n\nESCRIBE las 6 emociones completas. Este mapa revela tu sistema operativo emocional." },
          { type: "práctica", icon: "📊", title: "Trading con Bitácora Emocional", time: "30 min",
            inst: "Opera normalmente pero cada 5 minutos ESCRIBE en tu cuaderno tu emoción dominante usando esta escala: ⚡Flow | 🎯Enfocado | 😐Neutral | 😰Ansioso | 😤Frustrado | 😨Miedo.\n\nFormato rápido: anota la hora + emoji + resultado del trade (si aplica).\nEjemplo: '10:15 😰 — perdí 20 pips' / '10:30 😤 — entré sin setup'\n\nMínimo 6 registros durante la sesión.\n\nAl cerrar, ESCRIBE: ¿Hay correlación entre tu emoción y el resultado de tus trades? ¿Los trades en flow fueron mejores que los de ansiedad?" },
          { type: "reflexión", icon: "🔍", title: "El Patrón Revelado", time: "10 min",
            inst: "REVISA tus registros de la sesión y ESCRIBE las respuestas a estas preguntas:\n\n1. ¿Cuál es tu emoción dominante cuando GANAS?\n2. ¿Cuál es tu emoción dominante cuando PIERDES?\n3. ¿Cuál emoción te saca del flow con más frecuencia?\n4. ¿Cuál emoción te MANTIENE en flow?\n\nESCRIBE al final: 'Mi puerta de entrada al flow es ___ y mi mayor amenaza al flow es ___'. Este patrón es clave para los próximos días." },
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
            inst: "Crea una rutina de 5 minutos:\n\n1. Respiración 4-7-8 × 3 ciclos.\n2. Escribe tu intención para la sesión.\n3. Apaga notificaciones.\n\nPractícala ahora." },
          { type: "práctica", icon: "🎯", title: "Flow con Ritual", time: "25 min",
            inst: "Paso 1 — EJECUTA tu ritual de entrada completo (el que diseñaste en el ejercicio anterior).\n\nPaso 2 — ELIGE una tarea desafiante (estudiar, resolver un problema, crear algo) y trabaja 20 minutos sin parar.\n\nPaso 3 — Al terminar, ESCRIBE en tu cuaderno:\n• ¿Noté diferencia al empezar con ritual vs sin ritual?\n• ¿Entré en flow más rápido?\n• ¿Cuántas veces me distraje?\n• ¿Qué parte del ritual fue la más útil?" },
          { type: "reflexión", icon: "📝", title: "Evaluación del Ritual", time: "10 min",
            inst: "ESCRIBE en tu cuaderno la evaluación de tu ritual respondiendo:\n\n1. ¿El ritual te ayudó a enfocarte más rápido? (Sí/No/Parcial)\n2. ¿Qué paso del ritual tuvo más impacto?\n3. ¿Qué paso fue innecesario o incómodo?\n4. ¿Qué ajustarías para mañana?\n\nESCRIBE tu ritual actualizado como 'Versión 1.0'. Este documento evolucionará contigo a lo largo del reto." },
        ]
      },
      trader: {
        context: "Tu protocolo pre-trading es tu borde competitivo más subestimado. Los traders en flow no abren la plataforma y empiezan a operar. Preparan su estado interno primero.",
        exercises: [
          { type: "ritual", icon: "🧘", title: "Protocolo Pre-Trading", time: "10 min",
            inst: "Diseña tu protocolo de 5 min:\n\n1. Respiración 4-7-8 × 3 ciclos.\n2. Define tu sesgo del día.\n3. Revisa niveles clave.\n4. Intención escrita.\n\nEjecútalo ahora." },
          { type: "práctica", icon: "📊", title: "Sesión con Protocolo Activo", time: "30 min",
            inst: "Paso 1 — EJECUTA tu ritual pre-trading COMPLETO antes de abrir la plataforma.\n\nPaso 2 — Durante la sesión, OBSERVA tu estado interno y ESCRIBE después de cada trade:\n• ¿Entré al mercado más calmado que de costumbre?\n• ¿Mis decisiones fueron más limpias o igual de reactivas?\n• ¿El ritual impactó la calidad de mi ejecución?\n\nAl cerrar, DOCUMENTA en tu cuaderno un resumen honesto de la diferencia entre operar con ritual vs sin ritual." },
          { type: "reflexión", icon: "📝", title: "Evaluación del Protocolo", time: "10 min",
            inst: "ESCRIBE en tu cuaderno la evaluación de tu protocolo pre-trading:\n\n1. ¿Qué parte del ritual tuvo más impacto en tu sesión?\n2. ¿Qué parte no notaste que hiciera diferencia?\n3. ¿Qué quieres ajustar para mañana?\n\nDOCUMENTA tu protocolo como 'Versión 1.0 del Trader' con los 4 pasos finales que mantendrás. Este es tu protocolo personal — no el de nadie más." },
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
            inst: "ESCRIBE en tu cuaderno sobre una decisión financiera que has estado evitando (invertir, ahorrar más, revisar tus deudas, cambiar de empleo, etc.)\n\nRESPONDE estas preguntas:\n1. ¿Qué decisión financiera estoy evitando?\n2. ¿Qué me dice mi voz interior cuando pienso en hacerla?\n3. ¿Desde cuándo la evito?\n\nFinalmente, ESCRIBE: 'Mi miedo se llama ___ y me dice ___'.\nEjemplo: 'Mi miedo se llama El Protector y me dice que si invierto voy a perder todo.'" },
          { type: "práctica", icon: "🎯", title: "Desafío Óptimo", time: "30 min",
            inst: "El flow ocurre en el canal óptimo: entre el aburrimiento (muy fácil) y la ansiedad (muy difícil).\n\nPaso 1 — ELIGE algo que te cueste pero no te paralice (un curso difícil, un ejercicio financiero, un problema que has postergado).\n\nPaso 2 — Hazlo durante 30 minutos sin rendirte ni distraerte.\n\nPaso 3 — Al terminar, ESCRIBE en tu cuaderno:\n• ¿Sentí flow en algún momento?\n• ¿La dificultad era la correcta o necesito ajustarla?\n• ¿Hubo miedo? ¿O fue más aburrimiento?" },
          { type: "reflexión", icon: "🔍", title: "Diálogo con el Miedo", time: "10 min",
            inst: "ESCRIBE un diálogo con tu miedo en tu cuaderno. Imagina que puede hablar y RESPONDE:\n\n1. Si tu miedo pudiera hablar, ¿qué te diría?\n2. ¿Qué necesita realmente? (seguridad, aprobación, control)\n3. ¿De qué te está protegiendo?\n4. ¿Esa protección sigue siendo necesaria o es obsoleta?\n\nESCRIBE al final: 'Mi miedo me protege de ___, pero el precio que pago es ___'. El miedo es protección mal calibrada — hoy empiezas a recalibrarlo." },
        ]
      },
      trader: {
        context: "Tu miedo ya está operando contigo. Está en el stop loss que mueves, en la posición que no tomas, en el profit que cortas demasiado pronto.",
        exercises: [
          { type: "jung", icon: "🌑", title: "La Sombra del Trader", time: "20 min",
            inst: "IDENTIFICA qué emoción te saca del flow con más frecuencia: ¿miedo, codicia, soberbia, frustración?\n\nESCRIBE en tu cuaderno una carta directa a esa emoción. Dale un nombre propio sin juzgarla.\n\nEstructura:\n'Querido/a [nombre de tu emoción]:\nSé que apareces cuando ___. Cuando llegas, yo hago ___. Entiendo que intentas ___. Pero el precio que pago es ___.\nHoy te nombro para verte con claridad.'\n\nNombrar la emoción le quita poder reactivo. ESCRIBE al menos media página." },
          { type: "práctica", icon: "📊", title: "Operar con Consciencia del Miedo", time: "30 min",
            inst: "Opera normalmente pero aplica esta regla: cada vez que sientas miedo antes de un trade, NÓMBRALO en voz alta antes de decidir.\n\nDi: 'Estoy sintiendo [nombre de la emoción] ahora mismo.'\n\nDespués de nombrarlo, ESCRIBE en tu cuaderno:\n• ¿Cambió la decisión después de nombrarlo?\n• ¿Tomé el trade de todas formas o lo descarté?\n• ¿La emoción tenía información útil o era ruido?\n\nMínimo 3 registros durante la sesión. OBSERVA si nombrar la emoción cambia tu comportamiento." },
          { type: "reflexión", icon: "🔍", title: "El Miedo como Información", time: "10 min",
            inst: "REVISA los registros de tu sesión y ESCRIBE en tu cuaderno:\n\n1. ¿Cuántas veces tu miedo tuvo RAZÓN? (te protegió de un mal trade)\n2. ¿Cuántas veces te SABOTEÓ? (te sacó de un buen trade o te paralizó)\n3. ¿Puedes distinguir la diferencia entre ambos?\n\nESCRIBE: 'Mi miedo es útil cuando ___ y me sabotea cuando ___'.\n\nTu miedo tiene data que tu análisis técnico no. DOCUMENTA esa diferencia — es uno de los insights más valiosos del reto." },
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
            inst: "EJECUTA el primer paso del plan que creaste en el ejercicio anterior.\n\nMientras lo haces, OBSERVA tu estado interno y ESCRIBE después:\n• ¿Hubo flow mientras ejecutaba o sentí resistencia/miedo?\n• ¿La decisión la tomó mi Self (calmado, estratégico) o mi ego (reactivo, miedoso)?\n• ¿Qué sentí al dar el primer paso concreto?\n\nDOCUMENTA la experiencia completa. El primer paso siempre es el más difícil." },
          { type: "pedem", icon: "📝", title: "DOCUMENTAR con Honestidad", time: "10 min",
            inst: "Documenta qué hiciste, cómo te sentiste, y qué aprendiste. Las 3 preguntas PEDEM:\n\n1. ¿Qué salió bien?\n2. ¿Qué falló?\n3. ¿Qué haré diferente?" },
        ]
      },
      trader: {
        context: "Ejecutar PEDEM con consciencia es operar desde el Self y no desde el ego reactivo. Hoy cada parte del ciclo se hace con presencia total.",
        exercises: [
          { type: "pedem", icon: "📋", title: "PLANEAR con Claridad", time: "15 min",
            inst: "Antes de la sesión: define 3 setups (configuraciones o patrones gráficos de entrada), niveles de entrada, stop loss y target. SIN ambigüedad. Si no hay setup claro, el plan es NO operar." },
          { type: "pedem", icon: "📊", title: "EJECUTAR desde el Self", time: "40 min",
            inst: "EJECUTA tu plan con plena consciencia. Antes de cada decisión PREGÚNTATE: '¿Esto lo decide mi análisis o mi emoción?'\n\nDurante la sesión, ESCRIBE junto a cada trade:\n• ✅ ANÁLISIS: si la decisión vino de tu plan\n• ⚠️ EMOCIÓN: si la decisión fue reactiva\n\nAl cerrar, DOCUMENTA: ¿Cuántas decisiones fueron de análisis vs emoción? Opera desde la claridad, no desde la reacción." },
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
            inst: "ESCRIBE en tu cuaderno una conversación entre dos personajes internos:\n\n• EGO FINANCIERO: la parte miedosa, reactiva, que dice 'no puedo', 'es muy riesgoso', 'no soy suficiente'.\n• SELF FINANCIERO: la parte calmada, estratégica, que decide con claridad.\n\nUsa formato de diálogo:\nEGO: '___'\nSELF: '___'\n\nESCRIBE al menos 5 intercambios. Deja que cada uno diga lo que realmente piensa, sin censura. OBSERVA cuál de los dos suena más parecido a cómo tomas decisiones hoy." },
          { type: "ritual", icon: "🧘", title: "Meditación del Observador", time: "10 min",
            inst: "CIERRA LOS OJOS para una meditación de 10 minutos:\n\nPaso 1 — VISUALIZA al ego y al Self como dos personajes sentados frente a ti. El ego grita, se mueve, exige atención. El Self observa en silencio.\n\nPaso 2 — PRACTICA ser el que observa al que grita. No intentes callar al ego — solo obsérvalo sin reaccionar.\n\nPaso 3 — Al terminar, ESCRIBE en tu cuaderno: '¿Pude observar sin reaccionar? ¿En qué momento el ego me atrapó?' Esta habilidad de observar sin reaccionar es la base del trading consciente." },
          { type: "reflexión", icon: "🔍", title: "¿Quién decide hoy?", time: "10 min",
            inst: "ESCRIBE en tu cuaderno las 3 últimas decisiones importantes que tomaste (financieras o de vida).\n\nPara cada una RESPONDE:\n1. ¿Quién la tomó: mi ego (reactivo, miedoso) o mi Self (calmado, estratégico)?\n2. Si la tomó el ego: ¿cómo habría sido diferente desde el Self?\n3. Si la tomó el Self: ¿qué condiciones lo hicieron posible?\n\nESCRIBE al final: 'Para decidir más desde el Self necesito ___'." },
        ]
      },
      trader: {
        context: "En el trading, el ego quiere tener razón. El Self quiere hacer lo correcto. ¿Cuál toma tus decisiones reales?",
        exercises: [
          { type: "jung", icon: "⚖️", title: "El Trader-Self vs El Trader-Ego", time: "15 min",
            inst: "CIERRA LOS OJOS para una meditación de 10 minutos:\n\nPaso 1 — VISUALIZA a tu Trader-Self (la versión calmada, disciplinada, estratégica) separado de tu ego reactivo (el que opera por impulso, miedo o venganza).\n\nPaso 2 — OBSERVA: ¿Cuál de los dos toma tus decisiones reales en el mercado? ¿Cuál quieres que las tome?\n\nAl terminar, ESCRIBE en tu cuaderno:\n• 'Mi ego reactivo decide cuando ___'\n• 'Mi Trader-Self decide cuando ___'\n• 'Quiero que el Self tome las decisiones porque ___'" },
          { type: "práctica", icon: "📊", title: "Operar desde el Self", time: "30 min",
            inst: "Sesión de trading con una regla estricta: antes de cada decisión PREGÚNTATE en voz alta: '¿Esto es ego o Self?'\n\n• Si es EGO → No lo ejecutas. ESCRIBE por qué fue ego.\n• Si es SELF → Ejecútalo con confianza. ESCRIBE por qué fue Self.\n\nDOCUMENTA cada decisión en tu cuaderno con este formato:\nHora | Decisión | ¿Ego o Self? | ¿La ejecuté?\n\nAl cerrar, ESCRIBE qué descubriste sobre la proporción ego/Self en tu trading." },
          { type: "reflexión", icon: "🔍", title: "Evaluación Ego/Self", time: "10 min",
            inst: "REVISA tu registro de la sesión y ESCRIBE las respuestas:\n\n1. ¿Cuántas decisiones fueron del EGO? ___\n2. ¿Cuántas fueron del SELF? ___\n3. ¿Cuáles resultaron en mejores trades?\n4. ¿Hubo algún momento donde el ego 'se disfrazó' de Self?\n\nESCRIBE al final: 'Hoy descubrí que mi ratio ego/Self es ___. La data no miente.' Guarda este dato para comparar con el Día 10." },
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
            inst: "ELIGE una tarea importante que requiera tu mejor concentración.\n\nReglas:\n• Sin móvil (ponlo en otra habitación)\n• Sin redes sociales\n• Sin interrupciones de ningún tipo\n• 30 minutos de foco absoluto\n\nCada vez que surja una distracción interna (pensamiento, impulso de revisar algo), ESCRIBE una marca en tu cuaderno sin dejar la tarea.\n\nAl terminar, CUENTA las marcas y ESCRIBE: '¿Cuántas distracciones tuve? ¿De qué tipo? ¿Hubo momentos de flow?'" },
          { type: "ritual", icon: "⏱️", title: "Protocolo Anti-Distracción", time: "10 min",
            inst: "ESCRIBE en tu cuaderno dos listas:\n\n❌ 3 DISTRACCIONES QUE DEBO ELIMINAR:\n1. ___\n2. ___\n3. ___\n\n✅ 3 CONDICIONES QUE FACILITAN MI CONCENTRACIÓN:\n1. ___\n2. ___\n3. ___\n\nESCRIBE un compromiso: 'Me comprometo a aplicar estas listas durante las próximas 24 horas.' Firma con tu nombre y la fecha." },
          { type: "reflexión", icon: "📝", title: "Nivel de Flow Alcanzado", time: "10 min",
            inst: "ESCRIBE en tu cuaderno la evaluación de tu bloque de concentración:\n\n1. ¿Hubo momentos de flow? ¿En qué minuto aparecieron?\n2. ¿Cuántas veces te distrajiste? (revisa tus marcas)\n3. ¿Desde dónde operaste: ego disperso o Self enfocado?\n4. ¿La concentración mejoró vs. días anteriores?\n\nDOCUMENTA: 'Mi capacidad de concentración hoy fue ___/10.' Compara con los próximos días." },
        ]
      },
      trader: {
        context: "Una sesión de trading sin interrupciones vale más que 10 sesiones dispersas. Hoy entrenas la concentración como si fuera tu hedge.",
        exercises: [
          { type: "práctica", icon: "📊", title: "Sesión Sin Interrupciones", time: "45 min",
            inst: "Sesión de trading completa con reglas estrictas:\n• Sin móvil (en otra habitación)\n• Sin redes sociales\n• Sin interrupciones\n\nCada vez que surja una distracción, ESCRIBE una marca en tu cuaderno sin salir de la sesión.\n\nAl cerrar, DOCUMENTA:\n• Total de distracciones: ___\n• ¿Desde dónde operé hoy: ego disperso o Self enfocado?\n• ¿La calidad de mis trades mejoró sin distracciones?" },
          { type: "ritual", icon: "⏱️", title: "Protocolo de Foco del Trader", time: "10 min",
            inst: "Documenta: ¿Qué condiciones ambientales y mentales necesitas para tu concentración máxima? Este es tu setup (configuración o preparación) no-técnico más importante." },
          { type: "reflexión", icon: "📝", title: "Ratio Flow/Ruido", time: "10 min",
            inst: "CALCULA y ESCRIBE en tu cuaderno tu ratio de flow:\n\n• Minutos totales de sesión: ___\n• Minutos en flow real (concentración total, sin ruido): ___\n• Minutos en ruido mental (distracción, ansiedad, dispersión): ___\n• Tu ratio: ___% flow / ___% ruido\n\nESCRIBE: '¿Este ratio es mejor que la semana pasada? ¿Qué necesito para aumentarlo?' DOCUMENTA este número — lo compararás en el Día 10." },
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
            inst: "Paso 1 — IMPLEMENTA tu protocolo de flow completo (el que documentaste).\n\nPaso 2 — Realiza una tarea que requiera concentración profunda durante 25+ minutos.\n\nPaso 3 — Al terminar, ESCRIBE en tu cuaderno:\n• ¿El sistema funcionó? ¿Entré en flow?\n• ¿Qué parte del protocolo fue clave?\n• ¿Qué ajustaría para la próxima vez?" },
          { type: "reflexión", icon: "📝", title: "Versión 2.0", time: "10 min",
            inst: "ESCRIBE en tu cuaderno tu protocolo actualizado como 'Versión 2.0':\n\n1. Condiciones que mantuve: ___\n2. Condiciones que agregué: ___\n3. Condiciones que eliminé: ___\n\nDOCUMENTA tu sistema completo. Recuerda: tu sistema está vivo — evolucionará contigo. Cada día lo refinas." },
        ]
      },
      trader: {
        context: "7 días de observación no mienten. Ya sabes cuándo entras en flow y cuándo no. Hoy lo conviertes en un sistema replicable.",
        exercises: [
          { type: "pedem", icon: "⚙️", title: "Sistema de Flow del Trader", time: "25 min",
            inst: "Documenta exactamente qué condiciones internas y externas garantizan tu estado óptimo. Hora, setup (configuración o patrón gráfico de entrada), ritual, nivel de riesgo, estado emocional. Este es tu protocolo." },
          { type: "práctica", icon: "📊", title: "Sesión con Sistema Completo", time: "30 min",
            inst: "ACTIVA todos tus protocolos antes y durante la sesión:\n• Ritual de entrada completo\n• Condiciones ambientales óptimas\n• Gestión de riesgo definida\n\nDurante la sesión, ESCRIBE junto a cada trade: '¿Operé desde el sistema o desde el impulso?'\n\nAl cerrar, DOCUMENTA: '¿Qué porcentaje de mis decisiones salieron del sistema? ¿Dónde se coló el impulso?'" },
          { type: "reflexión", icon: "📝", title: "Evaluación del Sistema", time: "10 min",
            inst: "ESCRIBE en tu cuaderno la evaluación del sistema:\n\n1. ¿El sistema mejoró mi sesión vs. operar sin él?\n2. ¿Dónde falló o se quedó corto?\n3. ¿Qué ajusto para mañana?\n\nDOCUMENTA tu 'Versión 2.0 del Sistema de Flow del Trader' con los ajustes. Este documento es tu ventaja competitiva." },
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
            inst: "ESCRIBE en tu cuaderno una carta de integración a tu miedo del Día 4. No lo combatas — incorpóralo.\n\nUsa esta estructura:\n'Querido [nombre de tu miedo]:\nEntiendo que me proteges de ___.\nDurante años te rechacé, pero hoy te integro como ___.\nYa no eres mi enemigo — eres mi ___.\nGracias por cuidarme. Ahora yo tomo las decisiones.'\n\nESCRIBE al menos media página. La integración de la sombra es el paso más transformador del reto." },
          { type: "práctica", icon: "🎯", title: "Acción desde la Integración", time: "15 min",
            inst: "ELIGE una pequeña acción financiera que antes evitabas (revisar tu estado de cuenta, investigar una inversión, presupuestar un gasto).\n\nPaso 1 — EJECÚTALA desde la prudencia (tu sombra integrada), no desde el miedo.\n\nPaso 2 — Al terminar, ESCRIBE en tu cuaderno:\n• ¿Qué acción tomé?\n• ¿La hice desde el miedo o desde la prudencia?\n• ¿Cómo se sintió diferente hacerla desde la integración?" },
          { type: "reflexión", icon: "🔍", title: "Mi Sombra y Mi Fuerza", time: "15 min",
            inst: "ESCRIBE en tu cuaderno dos columnas:\n\nMI SOMBRA (lo que evito, lo que niego de mí):\n• ___\n• ___\n• ___\n\nMI FUERZA (lo que ya soy, lo que me funciona):\n• ___\n• ___\n• ___\n\nESCRIBE al final: 'Cuando integro mi sombra y mi fuerza, la persona que emerge es ___.' Juntas forman a quien vas a ser. Esta es la integración Jungiana en acción." },
        ]
      },
      trader: {
        context: "Vuelve a la sombra del Día 4. ¿Cambió algo en estos 5 días? Tu Trader-Sombra puede convertirse en tu mayor edge.",
        exercises: [
          { type: "jung", icon: "🌗", title: "Carta de Integración al Trader-Sombra", time: "20 min",
            inst: "ESCRIBE una carta de integración desde tu Trader-Self a tu Trader-Sombra (la que descubriste en el Día 4).\n\nUsa esta estructura:\n'Querida Sombra:\nSé que eres mi ___. Te rechacé como ___, pero hoy entiendo que eres ___.\nTu codicia = mi ambición estratégica.\nTu miedo = mi gestión de riesgo intuitiva.\nTu impulsividad = mi capacidad de ejecución rápida.\nYa no te combato. Te integro.'\n\nESCRIBE al menos media página desde el Trader-Self con honestidad." },
          { type: "práctica", icon: "📊", title: "Operar con Sombra Integrada", time: "25 min",
            inst: "Opera reconociendo tu sombra como aliada. Cada vez que aparezca durante la sesión, sigue estos pasos:\n\nPaso 1 — NÓMBRALA: 'Estoy sintiendo mi [codicia/miedo/impulsividad].'\nPaso 2 — AGRADÉCELE: '¿Qué información me estás dando?'\nPaso 3 — DECIDE desde el Self, no desde la reacción.\n\nESCRIBE después de cada trade donde apareció la sombra:\n• ¿Qué sombra fue? ¿Qué información traía? ¿Decidí desde el Self?\n\nDOCUMENTA la experiencia completa al cerrar la sesión." },
          { type: "reflexión", icon: "🔍", title: "El Edge de la Sombra", time: "10 min",
            inst: "ESCRIBE en tu cuaderno respondiendo:\n\n1. ¿Cuál es el 'edge' (ventaja competitiva) que te da tu sombra integrada?\n2. ¿En qué momento de la sesión fue más útil?\n3. ¿Cómo se siente operar CON la sombra vs CONTRA la sombra?\n\nDOCUMENTA tu insight: 'Mi sombra integrada me da un edge en ___ porque ___.'\n\nEste insight es algo que pocos traders tienen. Guárdalo como parte de tu sistema de flow." },
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
            inst: "Escribe tu manifiesto en 3 líneas:\n\n1. Quién soy en flow.\n2. Qué ya no tolero.\n3. Qué haré esta semana para mantener el estado." },
        ]
      },
      trader: {
        context: "Hoy operas como el Trader en Flow. Todos los protocolos, la sombra integrada, el PEDEM consciente — todo se activa. Este es tu día.",
        exercises: [
          { type: "ritual", icon: "🏆", title: "Protocolo Ceremonial Completo", time: "15 min",
            inst: "Activa TODOS tus rituales: respiración, intención, setup (configuración o preparación), revisión del sesgo. Hoy es la versión final de tu protocolo. Ejecútalo con presencia total." },
          { type: "práctica", icon: "⚡", title: "Sesión de Trading en Flow Total", time: "60 min",
            inst: "Esta es tu sesión final del reto. Opera aplicando TODO lo que aprendiste:\n\n• PEDEM consciente: Planear → Ejecutar → Documentar → Evaluar → Mejorar\n• Decide desde el Self, no desde el ego\n• Integra la sombra cuando aparezca (nómbrala, agradécele, decide)\n\nDurante la sesión, ESCRIBE junto a cada trade: '¿Self o ego? ¿Flow o ruido?'\n\nAl cerrar, DOCUMENTA: 'Esta sesión no fue para ganar dinero — fue para demostrar quién ya soy como trader.'" },
          { type: "reflexión", icon: "🌟", title: "Manifiesto del Trader en Flow", time: "15 min",
            inst: "Escribe tu manifiesto:\n\n1. Mi estado óptimo es ___.\n2. Mi sombra integrada me da ___.\n3. Mi protocolo de flow es ___.\n\nEste es tu documento vivo." },
        ]
      }
    }
  },
];
