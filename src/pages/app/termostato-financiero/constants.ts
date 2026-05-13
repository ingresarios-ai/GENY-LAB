import { Question, Level, ChallengeDay } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Mentalidad',
    text: '¿Cómo reaccionas ante una pérdida del 5% de tu cuenta en un solo día?',
    options: [
      { text: 'Siento pánico y trato de recuperarlo inmediatamente.', points: 1 },
      { text: 'Me frustro y dejo de operar por el resto del día.', points: 2 },
      { text: 'Lo acepto como parte del negocio y reviso mi plan.', points: 3 },
      { text: 'No me afecta emocionalmente, confío en mi ventaja estadística.', points: 4 }
    ]
  },
  {
    id: 'q2',
    category: 'Gestión',
    text: '¿Cuál es tu regla principal de gestión de riesgo?',
    options: [
      { text: 'No tengo una regla fija, opero por intuición.', points: 1 },
      { text: 'Arriesgo lo que sea necesario para ganar mucho.', points: 2 },
      { text: 'Arriesgo un porcentaje fijo (1-2%) por operación.', points: 3 },
      { text: 'Tengo un límite de pérdida diario y semanal estricto.', points: 4 }
    ]
  },
  {
    id: 'q3',
    category: 'Disciplina',
    text: '¿Con qué frecuencia sigues tu plan de trading al pie de la letra?',
    options: [
      { text: 'Rara vez, me dejo llevar por el mercado.', points: 1 },
      { text: 'A veces, si el mercado se ve muy claro.', points: 2 },
      { text: 'Casi siempre, pero a veces dudo.', points: 3 },
      { text: 'Siempre, sin excepciones.', points: 4 }
    ]
  },
  {
    id: 'q4',
    category: 'Visión',
    text: '¿Cómo ves tu carrera de trading a 5 años?',
    options: [
      { text: 'Espero haberme hecho millonario rápido.', points: 1 },
      { text: 'Espero vivir del trading de forma estable.', points: 2 },
      { text: 'Me veo gestionando capital de terceros y escalando.', points: 3 },
      { text: 'Me veo como un profesional con un sistema robusto y diversificado.', points: 4 }
    ]
  },
  {
    id: 'q5',
    category: 'Entorno',
    text: '¿Cómo influye tu entorno en tu operativa?',
    options: [
      { text: 'Me distraigo fácilmente y opero en cualquier lugar.', points: 1 },
      { text: 'Mi familia/amigos no entienden lo que hago y me presionan.', points: 2 },
      { text: 'Tengo un espacio dedicado pero a veces hay interrupciones.', points: 3 },
      { text: 'Tengo un entorno profesional y apoyo total de mi círculo cercano.', points: 4 }
    ]
  },
  {
    id: 'q6',
    category: 'Mentalidad',
    text: '¿Qué significa para ti una racha ganadora de 10 operaciones?',
    options: [
      { text: 'Soy el mejor trader del mundo, voy a aumentar el riesgo.', points: 1 },
      { text: 'Siento euforia y miedo a perder la racha.', points: 2 },
      { text: 'Es una anomalía estadística positiva, sigo igual.', points: 3 },
      { text: 'Confirma que mi sistema está en fase de expansión, mantengo el plan.', points: 4 }
    ]
  },
  {
    id: 'q7',
    category: 'Gestión',
    text: '¿Cómo manejas el retiro de ganancias?',
    options: [
      { text: 'Retiro todo lo que gano para gastarlo.', points: 1 },
      { text: 'No retiro nada, quiero que la cuenta crezca infinito.', points: 2 },
      { text: 'Retiro un porcentaje fijo mensualmente.', points: 3 },
      { text: 'Reinvierto una parte y retiro otra para mi estilo de vida.', points: 4 }
    ]
  },
  {
    id: 'q8',
    category: 'Disciplina',
    text: '¿Qué haces después de una sesión de trading?',
    options: [
      { text: 'Cierro todo y me olvido hasta mañana.', points: 1 },
      { text: 'Reviso mis ganancias o pérdidas obsesivamente.', points: 2 },
      { text: 'Registro mis operaciones en una bitácora básica.', points: 3 },
      { text: 'Hago un análisis profundo de mis errores y aciertos.', points: 4 }
    ]
  },
  {
    id: 'q9',
    category: 'Visión',
    text: '¿Qué harías si tuvieras una cuenta de 1 millón de dólares?',
    options: [
      { text: 'Operaría con lotajes gigantes para ganar millones.', points: 1 },
      { text: 'Tendría miedo de perder tanto dinero.', points: 2 },
      { text: 'Seguiría mi plan actual con el riesgo ajustado.', points: 3 },
      { text: 'Me enfocaría en la preservación del capital y crecimiento lento.', points: 4 }
    ]
  },
  {
    id: 'q10',
    category: 'Entorno',
    text: '¿Cómo manejas la información de redes sociales y noticias?',
    options: [
      { text: 'Sigo a muchos "gurús" y cambio de estrategia seguido.', points: 1 },
      { text: 'Me afectan las noticias y cambio mi sesgo operativo.', points: 2 },
      { text: 'Filtro la información y solo sigo a unos pocos referentes.', points: 3 },
      { text: 'Ignoro el ruido externo, solo confío en mi análisis y datos.', points: 4 }
    ]
  }
];

export const LEVELS: Level[] = [
  {
    min: 0,
    max: 15,
    title: 'Termostato Frío',
    description: 'Tu mentalidad financiera está en modo supervivencia. El miedo y la falta de sistema te impiden retener ganancias.',
    color: '#00D1FF'
  },
  {
    min: 16,
    max: 25,
    title: 'Termostato Templado',
    description: 'Tienes bases, pero los sesgos emocionales aún dominan tu operativa. Necesitas estructura y disciplina.',
    color: '#00E676'
  },
  {
    min: 26,
    max: 35,
    title: 'Termostato Cálido',
    description: 'Estás cerca de la profesionalización. Tu gestión es buena, pero falta escalar tu visión y entorno.',
    color: '#FEDD04'
  },
  {
    min: 36,
    max: 40,
    title: 'Termostato Hirviendo',
    description: 'Mentalidad de Tiburón. Estás listo para gestionar grandes capitales y escalar tu carrera al máximo nivel.',
    color: '#FF4E00'
  }
];

export const RETO_DAYS: ChallengeDay[] = [
  {
    day: 1,
    title: 'Auditoría de Creencias',
    description: 'Identifica los 3 pensamientos limitantes que tienes sobre el dinero.',
    task: 'Escribe en tu bitácora: "¿Qué es lo peor que pasaría si tuviera 100k en mi cuenta?"',
    completed: false
  },
  {
    day: 2,
    title: 'El Valor del Riesgo',
    description: 'Acepta la pérdida antes de entrar al mercado.',
    task: 'Hoy, antes de cada operación, di en voz alta: "Acepto perder [monto] en este trade".',
    completed: false
  },
  {
    day: 3,
    title: 'Visualización de Escala',
    description: 'Entrena tu mente para ver números grandes sin pánico.',
    task: 'Pasa 10 minutos mirando un gráfico con un lotaje 10 veces mayor al tuyo (en demo o visualmente).',
    completed: false
  },
  {
    day: 4,
    title: 'Limpieza de Entorno',
    description: 'Elimina el ruido que sabotea tu enfoque.',
    task: 'Deja de seguir a 5 cuentas de trading que solo muestran lujos y no técnica.',
    completed: false
  },
  {
    day: 5,
    title: 'Gratitud Financiera',
    description: 'Cambia la escasez por abundancia.',
    task: 'Agradece por 3 gastos que hiciste hoy que mejoraron tu vida o negocio.',
    completed: false
  },
  {
    day: 6,
    title: 'Regla del 1%',
    description: 'Disciplina férrea en la gestión.',
    task: 'No arriesgues más del 1% en ninguna operación hoy, pase lo que pase.',
    completed: false
  },
  {
    day: 7,
    title: 'Desapego del Resultado',
    description: 'Enfócate en el proceso, no en el dinero.',
    task: 'Opera hoy sin mirar el panel de ganancias/pérdidas hasta el final de la sesión.',
    completed: false
  },
  {
    day: 8,
    title: 'Plan de Retiro',
    description: 'Define qué harás con tus ganancias.',
    task: 'Escribe tu plan de retiro de beneficios para los próximos 6 meses.',
    completed: false
  },
  {
    day: 9,
    title: 'Círculo de Poder',
    description: 'Busca referentes que ya estén donde tú quieres estar.',
    task: 'Contacta o estudia a fondo a un trader que gestione más de 100k.',
    completed: false
  },
  {
    day: 10,
    title: 'Expansión de Techo',
    description: 'Rompe tus límites mentales.',
    task: 'Define tu nueva meta de capital para el 2026 y los 3 pasos para llegar ahí.',
    completed: false
  }
];

export const COUNTRIES = [
  'Colombia', 'México', 'España', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Estados Unidos', 'Otros'
];
