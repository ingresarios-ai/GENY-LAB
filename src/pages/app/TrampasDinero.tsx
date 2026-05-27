import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, CheckCircle, Brain,
  Share2, Copy, Check, Info, HelpCircle, Sliders, Calculator, CheckSquare
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from 'jspdf';
import { saveActivityProgressDB, loadActivityProgressDB, clearActivityProgressDB } from '../../lib/activitySync';
import { initPdfWithHeader, addPdfText, checkPageBreak } from '../../utils/pdfUtils';

import ShareModule from "../../components/ShareModule";
import ResultActions from "../../components/ResultActions";
import CompletionBanner from '../../components/CompletionBanner';
import html2canvas from 'html2canvas-pro';
import confetti from "canvas-confetti";
import { markActivityCompleted } from "../../lib/progressStore";

// ── Question Data ──────────────────────────────────────────────────────────

interface QuestionOption {
  value: string;
  label: string;
  feedback?: string;
}

interface Question {
  type: "comprensión" | "aplicación" | "acción";
  question: string;
  context?: string;
  hint?: string;
  placeholder: string;
  controlType: "text" | "choice" | "slider" | "calculator" | "checklist";
  prefix?: string;
  suffix?: string;
  options?: QuestionOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  calculatorProps?: {
    min1: number;
    max1: number;
    step1: number;
    label1: string;
    prefix1?: string;
    suffix1?: string;
    min2: number;
    max2: number;
    step2: number;
    label2: string;
    prefix2?: string;
    suffix2?: string;
    calcFormula: (val1: number, val2: number) => string;
  };
  checklistProps?: string[];
  quickTemplates?: { label: string; text: string }[];
}

const RETO = {
  name: "TRAMPAS DEL DINERO",
  subtitle: "Tu cerebro está programado evolutivamente para tomar decisiones financieras equivocadas.",
  intro:
    "Las trampas cognitivas sabotean silenciosamente tus decisiones financieras. Este ejercicio te ayudará a identificar cómo te afectan en tu día a día para que puedas neutralizarlas. Responde con total honestidad: esto no es un examen, es un espejo.",
};

const QUESTIONS_TRADER: Question[] = [
  {
    type: "comprensión",
    question: "¿Sabiendo que tu cerebro fue programado para sobrevivir en la sabana (corto plazo) y no para el mercado moderno (largo plazo), cuál de estos dos impulsos sientes que domina tu operativa en momentos críticos?",
    context: "Nuestra mente inconsciente opera bajo un software evolutivo diseñado hace miles de años para la supervivencia en la sabana africana. En ese entorno de escasez constante, la gratificación debía ser inmediata. El mercado financiero moderno, sin embargo, nos exige pensar a largo plazo, lo cual va totalmente en contra de nuestros instintos biológicos básicos.",
    controlType: "choice",
    options: [
      { value: "sabana", label: "El instinto de la sabana: asegurar ganancias rápidas, miedo de quedarme fuera, urgencia por recuperar.", feedback: "¡Exacto! El cerebro prehistórico prioriza sobrevivir hoy por si mañana no hay comida. En trading, eso se traduce en ansiedad e impulsividad." },
      { value: "prefrontal", label: "La corteza prefrontal: paciencia, disciplina, seguir el plan establecido a pesar de la incertidumbre.", feedback: "¡Excelente! Es la meta para alcanzar consistencia, aunque requiere esfuerzo consciente y herramientas mecánicas para acallar el instinto." }
    ],
    placeholder: "Explica brevemente en qué situaciones operativas sientes que el instinto prehistórico secuestra tu disciplina..."
  },
  {
    type: "comprensión",
    question: "Según Kahneman & Tversky: ¿cuántas veces más duele perder $100 que el placer de ganar $100?",
    context: "Los psicólogos Daniel Kahneman y Amos Tversky descubrieron la 'aversión a la pérdida', revelando que el dolor psicológico que experimentamos al perder dinero es asimétrico y mucho más severo que la alegría de ganar la misma cantidad.",
    controlType: "slider",
    min: 1.0,
    max: 5.0,
    step: 0.1,
    placeholder: "2",
    suffix: "veces más"
  },
  {
    type: "aplicación",
    question: "Piensa en tu último trade ganador: ¿lo cerraste antes del target o esperaste?",
    context: "La aversión a la pérdida nos tienta a cerrar prematuramente los trades ganadores para 'asegurar' una pequeña ganancia, debido a la ansiedad o miedo de que el mercado se dé la vuelta y nos la arrebate.",
    controlType: "choice",
    options: [
      { value: "antes", label: "Lo cerré antes de tiempo (por miedo a que la ganancia se esfumara)" },
      { value: "plan", label: "Esperé pacientemente a que tocara mi target o stop planeado" },
      { value: "no_opero", label: "No he tenido operaciones ganadoras recientemente o no hago trading activo" }
    ],
    placeholder: "Describe la emoción o los pensamientos específicos que experimentabas mientras el precio se movía a tu favor..."
  },
  {
    type: "aplicación",
    question: "Piensa en tu último trade perdedor: ¿esperaste más de lo que debías? ¿Por qué?",
    context: "A la inversa, cuando una operación va en contra, la aversión a la pérdida nos empuja a retener posiciones perdedoras esperando 'recuperar' para no hacer real la pérdida, asumiendo un riesgo desmedido.",
    controlType: "choice",
    options: [
      { value: "esperanza", label: "Esperé de más o moví mi stop loss (por esperanza de que el mercado se recuperara)" },
      { value: "corte", label: "Acepté la pérdida rápido y salí exactamente donde decía mi plan" },
      { value: "no_opero", label: "No he tenido operaciones perdedoras recientemente" }
    ],
    placeholder: "¿Qué justificaciones te daba tu mente en ese momento para no cerrar la posición perdedora?"
  },
  {
    type: "comprensión",
    question: "¿Qué tan seguido caes en la trampa de la gratificación instantánea (descuento hiperbólico) al operar?",
    context: "El descuento hiperbólico es nuestra tendencia natural a valorar más las recompensas pequeñas pero inmediatas (asegurar $50 hoy) frente a recompensas mucho más grandes pero futuras ($200 siguiendo el plan). En el trading, esto genera impaciencia y rompe la consistencia.",
    controlType: "choice",
    options: [
      { value: "nunca", label: "Casi nunca: respeto mis targets de largo plazo y planes de salida con total disciplina." },
      { value: "medio", label: "A veces: sobre todo en días de alta volatilidad o cuando llevo una racha negativa." },
      { value: "siempre", label: "Muy seguido: me quema el dinero en las manos y prefiero salir con cualquier ganancia inmediata." }
    ],
    placeholder: "Describe una situación donde la impaciencia por asegurar una ganancia pequeña te costó un movimiento de precio mucho mayor."
  },
  {
    type: "aplicación",
    question: "Si tu target promedio es $200 y cierras en $50: ¿cuánto dejas en la mesa al año? (100 trades)",
    context: "Al ceder sistemáticamente a la gratificación instantánea y salir antes de tiempo, saboteas tu esperanza matemática. Aunque tu tasa de acierto sea alta, el volumen de ganancias que sacrificas a largo plazo es destructivo.",
    controlType: "calculator",
    calculatorProps: {
      min1: 100,
      max1: 1000,
      step1: 50,
      label1: "Target planificado por operación ($)",
      prefix1: "$",
      min2: 10,
      max2: 500,
      step2: 10,
      label2: "Ganancia real promedio que tomas por miedo ($)",
      prefix2: "$",
      calcFormula: (target, actual) => {
        const diff = Math.max(0, target - actual);
        const anual = diff * 100;
        return `Estás dejando ir aproximadamente $${anual.toLocaleString()} USD al año por trade (calculado sobre un promedio de 100 operaciones). Esto destruye cualquier esperanza matemática a largo plazo.`;
      }
    },
    placeholder: "0"
  },
  {
    type: "comprensión",
    question: "¿Cuál es la combinación mortal de FOMO + Costo Hundido en tu operativa?",
    context: "El FOMO (miedo a quedarse fuera) te incita a entrar tarde e impulsivamente en un trade. Una vez dentro de esa mala posición, el Costo Hundido te impide aceptar el error y salir de ella, justificando que 'ya invertiste dinero y esperanza' en esa entrada.",
    controlType: "choice",
    options: [
      { value: "ambos", label: "Escenario A: Entro tarde por euforia (FOMO), y luego aguanto la pérdida borrando el stop loss (Costo Hundido)." },
      { value: "fomo_solo", label: "Escenario B: Cometo errores de entrada por FOMO, pero al menos soy estricto cortando pérdidas." },
      { value: "limpio", label: "Escenario C: Entro bajo plan y salgo bajo plan. He aprendido a neutralizar ambas trampas." }
    ],
    placeholder: "¿Cómo planeas reaccionar la próxima vez que sientas la prisa de comprar porque el precio está subiendo de golpe?"
  },
  {
    type: "aplicación",
    question: "Tu último trade por FOMO: ¿qué viste, qué hiciste, cómo terminó?",
    context: "El FOMO se activa con la dopamina cuando vemos velas grandes subiendo rápido o a otros operadores celebrando ganancias. Reconocer tus propios detonantes emocionales es el primer paso para no volver a caer.",
    controlType: "text",
    placeholder: "Vi que el activo [ticker] estaba subiendo verticalmente, sentí la urgencia de participar, compré sin confirmación en el punto más alto, y el mercado terminó..."
  },
  {
    type: "aplicación",
    question: "Después de 3 trades ganadores seguidos: ¿cuáles de estos síntomas de euforia experimentas?",
    context: "El exceso de confianza tras una racha ganadora (euforia) nos ciega. Creemos que el mercado es fácil y que tenemos 'el toque de Midas'. Es el punto más peligroso de la curva emocional, donde solemos aumentar el riesgo y violar el plan.",
    controlType: "checklist",
    checklistProps: [
      "Aumento el tamaño de mi lote o posición (exceso de confianza)",
      "Opero con más frecuencia o tomo setups (configuraciones o patrones gráficos de entrada) dudosos (sobreoperación)",
      "Ignoro mis filtros de entrada o relajo mis reglas de gestión de riesgo",
      "Mantengo la calma y respeto el plan, entiendo que es solo varianza estadística"
    ],
    placeholder: "¿Cómo te blindarás mental y operativamente contra la euforia tras tu próxima racha ganadora?"
  },
  {
    type: "acción",
    question: "Escribe 1 regla anti-trampa para tu TRAMPA DOMINANTE (la que más te afecta).",
    context: "Las reglas anti-trampas actúan como cortafuegos mecánicos que protegen tu capital de tus propios sesgos cuando la emoción toma las riendas del ratón.",
    controlType: "text",
    quickTemplates: [
      { label: "Cortafuegos de Euforia", text: "Si tengo 2 trades ganadores seguidos, cierro la plataforma de inmediato y no opero más por el día." },
      { label: "Cortafuegos de FOMO", text: "Si el precio ya se ha desplazado más de un 1.5% del punto de entrada planeado, cancelo la orden de inmediato." },
      { label: "Cortafuegos de Costo Hundido", text: "Mi stop loss físico se coloca de forma automática al abrir el trade y tengo terminantemente prohibido moverlo o cancelarlo." }
    ],
    placeholder: "Mi trampa dominante es [FOMO / Aversión / Euforia]. Mi regla anti-trampa es: cuando..."
  }
];

const QUESTIONS_GENERAL: Question[] = [
  {
    type: "comprensión",
    question: "¿Sabiendo que tu cerebro fue programado para la sabana (corto plazo) y no para el largo plazo, cuál de estos dos impulsos sientes que domina tus finanzas hoy?",
    context: "Nuestra mente inconsciente opera bajo un software evolutivo diseñado hace miles de años para la supervivencia en la sabana africana. En ese entorno de escasez constante, la gratificación debía ser inmediata (gastar hoy por si mañana no hay). El ahorro y la inversión moderna nos exigen pensar a largo plazo, lo cual va totalmente en contra de nuestros instintos biológicos básicos.",
    controlType: "choice",
    options: [
      { value: "instinto", label: "El instinto prehistórico: priorizo gastar en el momento o buscar satisfacciones rápidas.", feedback: "¡Es muy normal! Es la programación humana por defecto: buscar dopamina a corto plazo ante la incertidumbre." },
      { value: "estrategia", label: "La estrategia de largo plazo: tengo la capacidad de postergar la recompensa para construir patrimonio.", feedback: "¡Excelente! Requiere dominar al cerebro impulsivo, pero es la llave para la libertad financiera y la tranquilidad." }
    ],
    placeholder: "Explica en qué situaciones de tu vida diaria sientes que el impulso del momento sabotea tus planes financieros..."
  },
  {
    type: "comprensión",
    question: "Según Kahneman & Tversky: ¿cuántas veces más duele perder $100 que el placer de ganar $100?",
    context: "Los psicólogos Daniel Kahneman y Amos Tversky descubrieron la 'aversión a la pérdida', revelando que el dolor psicológico que experimentamos al perder dinero es asimétrico y mucho más severo que la alegría de ganar la misma cantidad.",
    controlType: "slider",
    min: 1.0,
    max: 5.0,
    step: 0.1,
    placeholder: "2",
    suffix: "veces más"
  },
  {
    type: "aplicación",
    question: "Piensa en un negocio, venta (ej. auto, producto) o inversión que hiciste: ¿te apresuraste a vender rápido por miedo a perder la ganancia, o esperaste el valor planeado?",
    context: "La aversión a la pérdida nos tienta a cerrar tratos o vender activos prematuramente para 'asegurar' una pequeña ganancia, debido a la ansiedad de que las cosas empeoren y perdamos lo que ya tenemos.",
    controlType: "choice",
    options: [
      { value: "antes", label: "Acepté un trato inferior o vendí de inmediato por miedo a quedarme sin nada" },
      { value: "plan", label: "Esperé pacientemente al valor justo o planeado del activo antes de cerrar el trato" },
      { value: "no_aplica", label: "No he tenido una experiencia similar o no he realizado inversiones/ventas" }
    ],
    placeholder: "¿Qué emociones pasaron por tu mente y cómo influyeron en tu decisión final?"
  },
  {
    type: "aplicación",
    question: "Piensa en un negocio fallido, mala compra o préstamo a alguien: ¿siguiste metiendo dinero o tiempo esperando que se recuperara (esperanza ciega)?",
    context: "La aversión a la pérdida nos empuja a retener malas inversiones o seguir metiendo dinero en proyectos fallidos solo por no aceptar el hecho de que ya perdimos el dinero inicial.",
    controlType: "choice",
    options: [
      { value: "esperanza", label: "Sostuve la inversión, negocio o préstamo por meses/años esperando recuperar (no acepté la pérdida)" },
      { value: "corte", label: "Acepté la pérdida rápido, corté el flujo de dinero o tiempo y asumí el aprendizaje" },
      { value: "no_aplica", label: "No he tenido una experiencia similar recientemente" }
    ],
    placeholder: "¿Por qué decidiste aguantar de más o cortar de inmediato? Describe la experiencia..."
  },
  {
    type: "comprensión",
    question: "¿Qué tan seguido caes en compras impulsivas o gastos innecesarios hoy, sacrificando tus metas de ahorro a largo plazo?",
    context: "El descuento hiperbólico es nuestra tendencia natural a valorar más las recompensas pequeñas pero inmediatas (comprar ropa, café premium, o salidas hoy) frente a recompensas mucho más grandes pero futuras (independencia financiera, ahorros estables).",
    controlType: "choice",
    options: [
      { value: "nunca", label: "Casi nunca: tengo mis gastos bajo control y ahorro con total disciplina." },
      { value: "medio", label: "A veces: sobre todo cuando estoy bajo estrés o salgo de compras los fines de semana." },
      { value: "siempre", label: "Muy seguido: me quema el dinero en las manos y prefiero la recompensa inmediata del consumo." }
    ],
    placeholder: "Describe una compra por impulso reciente o gasto innecesario del que te hayas arrepentido después."
  },
  {
    type: "aplicación",
    question: "Si gastas dinero en compras por impulso o gastos innecesarios: ¿cuánto dejas de acumular en 5 años?",
    context: "Al ceder a la gratificación instantánea sistemáticamente, destruyes tu capacidad de generar riqueza. Pequeños gastos acumulados y puestos a trabajar con interés compuesto suman una fortuna a largo plazo.",
    controlType: "calculator",
    calculatorProps: {
      min1: 10,
      max1: 500,
      step1: 10,
      label1: "Gasto mensual promedio en compras por impulso / hormiga ($)",
      prefix1: "$",
      min2: 1,
      max2: 10,
      step2: 1,
      label2: "Plazo de proyección en años",
      suffix2: " años",
      calcFormula: (monthly, years) => {
        const totalSavedNoInterest = monthly * 12 * years;
        let totalWithInterest = 0;
        const rate = 0.10; // 10% annual
        for(let i=0; i<years * 12; i++) {
          totalWithInterest = (totalWithInterest + monthly) * (1 + rate/12);
        }
        return `Si invirtieras ese dinero a una tasa conservadora del 10% anual, dejarías de acumular aproximadamente $${Math.round(totalWithInterest).toLocaleString()} USD en ${years} años. Sin intereses, representan $${totalSavedNoInterest.toLocaleString()} USD desperdiciados.`;
      }
    },
    placeholder: "0"
  },
  {
    type: "comprensión",
    question: "¿Has caído en la trampa mortal de FOMO + Costo Hundido en tus compras o suscripciones?",
    context: "Comprar una suscripción cara, membresía de gimnasio o curso porque todo el mundo habla de ello es FOMO. Mantener el pago mensual o forzarse a ir sin provecho solo porque 'ya pagaste la inscripción o anualidad' es la trampa del Costo Hundido.",
    controlType: "choice",
    options: [
      { value: "ambos", label: "Escenario A: Compré algo costoso por impulso de moda (FOMO), y sigo pagándolo para no sentir que tiré el dinero (Costo Hundido)." },
      { value: "solo_fomo", label: "Escenario B: Compro cosas por impulso de ofertas, pero las cancelo o devuelvo rápido si veo que no las utilizo." },
      { value: "limpio", label: "Escenario C: Evito compras de oportunidad o modas. Pago únicamente lo que tengo planificado utilizar." }
    ],
    placeholder: "¿Qué suscripción o gasto tienes hoy que responda a esta combinación? ¿Cómo piensas cortarlo?"
  },
  {
    type: "aplicación",
    question: "Tu última compra impulsada por FOMO: ¿qué viste, qué hiciste y cómo terminó?",
    context: "El FOMO financiero se alimenta de ofertas con 'tiempo limitado' o de ver a otros con el último modelo de celular, ropa o viajes en redes sociales. Nos hace gastar dinero que no planeábamos.",
    controlType: "text",
    placeholder: "Vi una oferta o recomendación en redes sobre..., sentí que me iba a perder la oportunidad de..., gasté dinero no planificado, y al final..."
  },
  {
    type: "aplicación",
    question: "Cuando recibes un dinero extra (bono, aumento o ganancia): ¿cuál de estos comportamientos experimentas?",
    context: "La euforia tras recibir ingresos extraordinarios nos hace sentir falsamente ricos. Aumentamos nuestro nivel de vida de inmediato (inflación del estilo de vida) pensando que esa abundancia temporal será constante.",
    controlType: "checklist",
    checklistProps: [
      "Salgo a celebrar o a comer de inmediato gastando de forma desmedida",
      "Busco qué comprar o qué gadget adquirir para gastar el excedente rápido",
      "Me cuesta mucho ahorrarlo porque siento que 'me lo merezco' por mi esfuerzo",
      "Lo separo para ahorro/inversión el mismo día que lo recibo y mantengo mi estilo de vida intacto"
    ],
    placeholder: "¿Cómo planeas gestionar tu próximo ingreso extra para que no se evapore en gastos emocionales?"
  },
  {
    type: "acción",
    question: "Escribe 1 regla anti-trampa para tu TRAMPA DOMINANTE (la que más te afecta) en tus finanzas.",
    context: "Una regla anti-trampas es un compromiso inquebrantable que automatiza tu toma de decisiones antes de que las emociones del momento te hagan gastar.",
    controlType: "text",
    quickTemplates: [
      { label: "Regla de las 48 Horas", text: "Si veo un artículo no planificado que quiero comprar, me obligo a esperar 48 horas. Si sigo queriéndolo después de ese tiempo, evalúo su compra." },
      { label: "Regla del Ahorro Primero", text: "El mismo día que reciba mis ingresos, el 10% se transferirá de forma automática a mi cuenta de inversión, antes de realizar cualquier otro pago." },
      { label: "Regla de Suscripciones", text: "Cualquier suscripción que no haya utilizado en los últimos 30 días será cancelada de inmediato, sin importar el descuento que me ofrezcan." }
    ],
    placeholder: "Mi trampa dominante es [FOMO / Gastos hormiga / Consumo]. Mi regla anti-trampa es: cuando..."
  }
];

const TOTAL_QUESTIONS = 10;

const TYPE_STYLES: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  comprensión: {
    color: "text-[#00D2FF]",
    bg: "bg-[#00D2FF]/8",
    border: "border-l-[#00D2FF]",
    label: "COMPRENSIÓN",
  },
  aplicación: {
    color: "text-brand-yellow",
    bg: "bg-brand-yellow/8",
    border: "border-l-brand-yellow",
    label: "APLICACIÓN",
  },
  acción: {
    color: "text-brand-green",
    bg: "bg-brand-green/8",
    border: "border-l-brand-green",
    label: "ACCIÓN",
  },
};

function InteractiveSlider({
  q,
  i,
  responses,
  update,
  style
}: {
  q: Question;
  i: number;
  responses: Record<string, string>;
  update: (i: number | string, v: string) => void;
  style: any;
}) {
  const val = parseFloat(responses[i] || "1.0");
  const isTargetRange = val >= 2.0 && val <= 2.5;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={q.min || 1.0}
          max={q.max || 5.0}
          step={q.step || 0.1}
          value={val}
          onChange={(e) => update(i, e.target.value)}
          className="flex-1 accent-[#FF3EB0] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <span className={`text-3xl font-mono font-black w-24 text-right ${isTargetRange ? "text-brand-green" : style.color}`}>
          {val.toFixed(1)}x
        </span>
      </div>
      <div className={`p-4 rounded-xl border text-base leading-relaxed font-mono ${
        isTargetRange
          ? "bg-brand-green/5 border-brand-green/30 text-brand-green"
          : "bg-white/[0.02] border-white/5 text-white/50"
      }`}>
        {val === 1.0 && "1.0x: Sentirías el mismo dolor que placer (emocionalmente neutro). No concuerda con la psicología humana."}
        {val > 1.0 && val < 2.0 && `${val.toFixed(1)}x: Aversión leve. Sientes un dolor moderado, pero los estudios científicos muestran un impacto emocional mayor.`}
        {isTargetRange && `${val.toFixed(1)}x: ¡Rango correcto! Daniel Kahneman demostró que el dolor emocional de perder dinero es entre el doble y 2.5 veces más fuerte que ganar la misma cantidad. Por eso evitamos el riesgo de manera irracional.`}
        {val > 2.5 && `${val.toFixed(1)}x: Aversión severa. Experimentas una resistencia psicológica extrema ante la posibilidad de perder.`}
      </div>
    </div>
  );
}

function formatNumberLocale(val: number, curr: string): string {
  if (curr === 'USD') {
    return val.toLocaleString('en-US');
  }
  // For COP and MXN, use spanish locale formatting (dot as thousands separator)
  return val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrencyValue(value: number, curr: string): string {
  const prefix = "$";
  const formattedNum = formatNumberLocale(value, curr);
  
  if (curr === 'COP') {
    if (value >= 1000000) {
      const millions = value / 1000000;
      const formattedMillions = Number(millions.toFixed(1)).toString().replace('.', ',');
      const text = millions === 1 ? '1 millón' : `${formattedMillions} millones`;
      return `${prefix}${formattedNum} COP (${text})`;
    } else if (value >= 1000) {
      const thousands = Math.round(value / 1000);
      return `${prefix}${formattedNum} COP (${thousands} mil)`;
    }
    return `${prefix}${formattedNum} COP`;
  }
  
  if (curr === 'MXN') {
    return `${prefix}${formattedNum} MXN`;
  }
  
  // USD
  return `${prefix}${formattedNum} USD`;
}

const CURRENCY_CONFIGS: Record<string, {
  label: string;
  prefix: string;
  suffix: string;
  min1: number;
  max1: number;
  step1: number;
  min2: number;
  max2: number;
  step2: number;
  defaultVal1: number;
  defaultVal2: number;
  formatFormula: (monthly: number, years: number) => string;
}> = {
  USD: {
    label: "Dólares (USD)",
    prefix: "$",
    suffix: " USD",
    min1: 10,
    max1: 500,
    step1: 10,
    min2: 1,
    max2: 10,
    step2: 1,
    defaultVal1: 150,
    defaultVal2: 5,
    formatFormula: (monthly, years) => {
      const totalSavedNoInterest = monthly * 12 * years;
      let totalWithInterest = 0;
      for(let i=0; i<years * 12; i++) {
        totalWithInterest = (totalWithInterest + monthly) * (1 + 0.10/12);
      }
      return `Dejas de acumular aproximadamente ${formatCurrencyValue(Math.round(totalWithInterest), 'USD')} en ${years} años (con 10% de rendimiento anual estimado). Sin intereses, serían ${formatCurrencyValue(totalSavedNoInterest, 'USD')}.`;
    }
  },
  COP: {
    label: "Pesos Colombianos (COP)",
    prefix: "$",
    suffix: " COP",
    min1: 50000,
    max1: 2000000,
    step1: 50000,
    min2: 1,
    max2: 10,
    step2: 1,
    defaultVal1: 500000,
    defaultVal2: 5,
    formatFormula: (monthly, years) => {
      const totalSavedNoInterest = monthly * 12 * years;
      let totalWithInterest = 0;
      for(let i=0; i<years * 12; i++) {
        totalWithInterest = (totalWithInterest + monthly) * (1 + 0.10/12);
      }
      return `Dejas de acumular aproximadamente ${formatCurrencyValue(Math.round(totalWithInterest), 'COP')} en ${years} años (con 10% de rendimiento anual estimado). Sin intereses, serían ${formatCurrencyValue(totalSavedNoInterest, 'COP')}.`;
    }
  },
  MXN: {
    label: "Pesos Mexicanos (MXN)",
    prefix: "$",
    suffix: " MXN",
    min1: 200,
    max1: 10000,
    step1: 200,
    min2: 1,
    max2: 10,
    step2: 1,
    defaultVal1: 3000,
    defaultVal2: 5,
    formatFormula: (monthly, years) => {
      const totalSavedNoInterest = monthly * 12 * years;
      let totalWithInterest = 0;
      for(let i=0; i<years * 12; i++) {
        totalWithInterest = (totalWithInterest + monthly) * (1 + 0.10/12);
      }
      return `Dejas de acumular aproximadamente ${formatCurrencyValue(Math.round(totalWithInterest), 'MXN')} en ${years} años (con 10% de rendimiento anual estimado). Sin intereses, serían ${formatCurrencyValue(totalSavedNoInterest, 'MXN')}.`;
    }
  }
};

const TRADER_CURRENCY_CONFIGS: Record<string, {
  label: string;
  prefix: string;
  suffix: string;
  min1: number;
  max1: number;
  step1: number;
  min2: number;
  max2: number;
  step2: number;
  defaultVal1: number;
  defaultVal2: number;
  formatFormula: (target: number, actual: number) => string;
}> = {
  USD: {
    label: "Dólares (USD)",
    prefix: "$",
    suffix: " USD",
    min1: 100,
    max1: 2000,
    step1: 50,
    min2: 10,
    max2: 1000,
    step2: 10,
    defaultVal1: 200,
    defaultVal2: 50,
    formatFormula: (target, actual) => {
      const diff = Math.max(0, target - actual);
      const anual = diff * 100;
      return `Estás dejando ir aproximadamente ${formatCurrencyValue(anual, 'USD')} al año por trade (calculado sobre un promedio de 100 operaciones). Esto destruye tu esperanza matemática.`;
    }
  },
  COP: {
    label: "Pesos Colombianos (COP)",
    prefix: "$",
    suffix: " COP",
    min1: 400000,
    max1: 8000000,
    step1: 200000,
    min2: 40000,
    max2: 4000000,
    step2: 40000,
    defaultVal1: 800000,
    defaultVal2: 200000,
    formatFormula: (target, actual) => {
      const diff = Math.max(0, target - actual);
      const anual = diff * 100;
      return `Estás dejando ir aproximadamente ${formatCurrencyValue(anual, 'COP')} al año por trade (calculado sobre un promedio de 100 operaciones). Esto destruye tu esperanza matemática.`;
    }
  }
};

function InteractiveCalculator({
  q,
  i,
  responses,
  setResponses,
  style
}: {
  q: Question;
  i: number;
  responses: Record<string, string>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  style: any;
}) {
  const isTraderCalc = q.calculatorProps?.min1 === 100;
  
  // Load saved currency or fallback
  const [curr, setCurr] = useState<'USD' | 'COP' | 'MXN'>(() => {
    return (responses[i + '_curr'] as any) || 'USD';
  });

  const config = isTraderCalc 
    ? (TRADER_CURRENCY_CONFIGS[curr] || TRADER_CURRENCY_CONFIGS.USD)
    : (CURRENCY_CONFIGS[curr] || CURRENCY_CONFIGS.USD);

  const [val1, setVal1] = useState(() => {
    const saved = parseInt(responses[i + '_val1'] || "");
    return isNaN(saved) ? config.defaultVal1 : saved;
  });
  const [val2, setVal2] = useState(() => {
    const saved = parseInt(responses[i + '_val2'] || "");
    return isNaN(saved) ? config.defaultVal2 : saved;
  });

  // Whenever currency changes, update sliders to fit new currency ranges
  useEffect(() => {
    setVal1(config.defaultVal1);
    setVal2(config.defaultVal2);
  }, [curr]);

  useEffect(() => {
    const text = config.formatFormula(val1, val2);
    setResponses(prev => ({
      ...prev,
      [i]: text,
      [i + '_val1']: String(val1),
      [i + '_val2']: String(val2),
      [i + '_curr']: curr
    }));
  }, [val1, val2, curr]);

  return (
    <div className="mt-4 space-y-5 bg-[#131924]/60 border border-white/15 rounded-xl p-5">
      {/* Currency Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Selecciona tu moneda:</span>
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
          {Object.keys(isTraderCalc ? TRADER_CURRENCY_CONFIGS : CURRENCY_CONFIGS).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCurr(c as any)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all ${
                curr === c
                  ? "bg-[#FF3EB0] text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-base font-mono text-white/50">
          <span>{isTraderCalc ? q.calculatorProps?.label1 : config.label.includes("Colombianos") ? "Gasto mensual promedio (COP)" : config.label.includes("Mexicanos") ? "Gasto mensual promedio (MXN)" : "Gasto mensual promedio (USD)"}</span>
          <span className="font-bold text-white text-base md:text-lg">
            {formatCurrencyValue(val1, curr)}
          </span>
        </div>
        <input
          type="range"
          min={config.min1}
          max={config.max1}
          step={config.step1}
          value={val1}
          onChange={(e) => setVal1(parseInt(e.target.value))}
          className="w-full accent-[#FF3EB0] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-base font-mono text-white/50">
          <span>{isTraderCalc ? q.calculatorProps?.label2 : "Plazo de proyección"}</span>
          <span className="font-bold text-white text-base md:text-lg">
            {isTraderCalc ? formatCurrencyValue(val2, curr) : `${val2} años`}
          </span>
        </div>
        <input
          type="range"
          min={config.min2}
          max={isTraderCalc ? Math.min(config.max2, val1) : config.max2}
          step={config.step2}
          value={val2}
          onChange={(e) => setVal2(parseInt(e.target.value))}
          className="w-full accent-[#FF3EB0] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="pt-3 border-t border-white/5 flex gap-2.5 items-start">
        <Calculator className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
        <div className="text-base text-brand-yellow font-mono leading-relaxed">
          <span className="font-bold block mb-1">Impacto Proyectado:</span>
          {config.formatFormula(val1, val2)}
        </div>
      </div>
    </div>
  );
}

export default function TrampasDinero() {
  const user = { id: "local-user" };
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userName = 'Trader'?.split(" ")[0] || "Trader";

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<"trader" | "general" | null>(null);
  const [view, setView] = useState<"intro" | "questions" | "completed">("intro");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeQuestions = profile === 'trader' ? QUESTIONS_TRADER : QUESTIONS_GENERAL;

  const answered = activeQuestions.filter(
    (_, idx) => responses[idx] && String(responses[idx]).trim()
  ).length;
  const progress = (answered / TOTAL_QUESTIONS) * 100;
  const allAnswered = answered === TOTAL_QUESTIONS;

  // ── Load saved progress ──
  useEffect(() => {
    (async () => {
      try {
        if (searchParams.get('reset') === 'true') {
          await clearActivityProgressDB('trampas');
          setSearchParams({}, { replace: true });
          setResponses({});
          setProfile(null);
          setView("questions");
          setLoading(false);
          return;
        }
        const saved = await loadActivityProgressDB('trampas');
        if (saved && saved.metadata) {
          const r = saved.metadata;
          if (r.responses) setResponses(r.responses);
          if (r.profile) setProfile(r.profile);
          if (r.completed || saved.completed) {
            setView('completed');
            markActivityCompleted('trampas');
          }
        }
      } catch (e) {
        console.error('Error loading trampas progress:', e);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save progress ──
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveActivityProgressDB('trampas', {
        responses,
        profile,
        completed: view === 'completed'
      }, false).catch(console.error);
    }, 1000);
    return () => clearTimeout(timer);
  }, [responses, view, loading, profile]);

  const update = (i: number | string, v: string) =>
    setResponses((prev) => ({ ...prev, [i]: v }));

  const handleStart = () => { setView("questions"); };

  const handleComplete = async () => {
    setView("completed");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#FF3EB0", "#00FF94", "#FFD93D", "#00D2FF"] });
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
    try {
      await saveActivityProgressDB('trampas', {
        responses,
        profile,
        completed: true,
      }, true);
      markActivityCompleted('trampas');
    } catch (e) {
      console.error('Error saving trampas progress:', e);
    }
  };

  // ── Share ──
  const generateShareUrl = () => {
    const payload = {
      t: "trampas",
      n: userName,
      c: TOTAL_QUESTIONS,
      p: "Completado",
    };
    return `https://genylab.ingresarios.net/resultado/${btoa(JSON.stringify(payload))}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (
    platform: "whatsapp" | "twitter" | "facebook" | "linkedin"
  ) => {
    const text = encodeURIComponent(
      `Acabo de identificar las trampas cognitivas que sabotean mis finanzas con el Reto Trampas del Dinero de GENY LAB. 🧠 Las trampas ya tienen nombre.`
    );
    const url = encodeURIComponent(generateShareUrl());
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  const reset = async () => {
    setResponses({});
    setView("questions");
    await clearActivityProgressDB('trampas');
  };

  const generatePDF = async () => {
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    let y = initPdfWithHeader(doc, 'Trampas del Dinero');
    const W=210,M=18;
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(28); 
    doc.setFont('helvetica', 'bold');
    doc.text('LAS TRAMPAS YA TIENEN NOMBRE', M, y); 
    y += 12;
    
    const intro = "Conocer la trampa no la elimina — la hace visible. Cada vez que aparezcan ahora, vas a poder decir: 'Te vi. No hoy.'";
    y = addPdfText(doc, intro, y, { fontSize: 11, color: [51, 65, 85], lineHeight: 6 });
    y += 4;
    
    activeQuestions.forEach((q, i) => {
      y = checkPageBreak(doc, y, 20);
      
      y = addPdfText(doc, `PREGUNTA ${i+1} (${q.type.toUpperCase()})`, y, { fontSize: 10, color: [255, 62, 176], fontStyle: 'bold' });
      y += 4;
      
      y = addPdfText(doc, q.question, y, { fontSize: 11, color: [15, 23, 42], fontStyle: 'bold', lineHeight: 6 });
      y += 4;
      
      let ansText = String(responses[i] || 'No respondida');
      if (q.controlType === 'choice' && q.options) {
        const opt = q.options.find(o => o.value === responses[i]);
        if (opt) ansText = opt.label;
      } else if (q.controlType === 'slider') {
        ansText = `${parseFloat(responses[i] || "1.0").toFixed(1)}x veces más`;
      }
      
      y = addPdfText(doc, ansText, y, { fontSize: 10, color: [100, 116, 139], fontStyle: 'italic', lineHeight: 6 });
      
      const refText = responses[i + '_text'];
      if (refText) {
        y += 2;
        y = addPdfText(doc, `Justificación: ${refText}`, y, { fontSize: 10, color: [71, 85, 105], lineHeight: 5 });
      }
      y += 6;
    });
    
    doc.save('trampas-del-dinero.pdf');
  };

  // ════════════════════════════════════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-brand-yellow">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Brain className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: INTRO
  // ════════════════════════════════════════════════════════════════════════
  if (view === "intro") {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <Link
          to="/app/leccion/trampas"
          className="inline-flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors uppercase font-black text-xs tracking-[0.2em] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a la Lección
        </Link>
        
        <div className="min-h-[70vh] flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Title & Hook */}
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] tracking-[0.25em] uppercase text-brand-text-muted font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#FF3EB0]" />
                  RETO DE 1 DÍA — GENY LAB
                </div>

                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                  {RETO.name.split(" ").slice(0, 1)}{" "}
                  <span className="title-highlight">
                    {RETO.name.split(" ").slice(1).join(" ")}
                  </span>
                </h1>

                <p className="text-brand-text-muted text-sm md:text-base leading-relaxed mt-4">
                  <span className="text-white font-medium">
                    {RETO.subtitle}
                  </span>
                </p>
              </div>

              {/* Stats bar */}
              <div className="glass-card p-6 flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-8">
                {[
                  { value: "10", label: "Preguntas" },
                  { value: "~20", label: "Minutos" },
                  { value: "1", label: "Día" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {i > 0 && (
                      <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    )}
                    <div className={i > 0 ? "sm:pl-4" : ""}>
                      <div className="text-2xl md:text-3xl font-black font-mono text-[#FF3EB0]">
                        {stat.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Intro text & CTA */}
            <div className="space-y-8 flex flex-col justify-center h-full">
              <div className="glass-card p-10 space-y-8 relative overflow-hidden flex-grow flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF3EB0]/8 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#FF3EB0]/10 blur-[60px] pointer-events-none" />
                
                <p className="relative z-10 text-white/90 text-lg leading-[1.7] font-medium border-l-4 border-[#FF3EB0]/40 pl-5">
                  {RETO.intro}
                </p>

                <div className="space-y-4 pt-4 relative z-10">
                  {/* Start CTA */}
                  <button
                    onClick={handleStart}
                    className="w-full btn-primary py-5 px-10 rounded-xl text-base font-black uppercase tracking-[0.12em] flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    Empezar el reto
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <p className="text-white/30 text-[10px] text-center font-bold uppercase tracking-widest">
                    Tu progreso se guarda automáticamente
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: QUESTIONS
  // ════════════════════════════════════════════════════════════════════════
  if (view === "questions") {
    if (!profile) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12 min-h-[70vh] flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 space-y-8 relative overflow-hidden border-t-2 border-t-[#FF3EB0]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF3EB0]/5 to-transparent pointer-events-none" />
            
            <div className="text-center space-y-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF3EB0] font-black font-mono">
                Configuración Inicial
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                ¿Cómo deseas enfocar <span className="title-highlight">tu reto?</span>
              </h2>
              <p className="text-brand-text-muted text-sm max-w-md mx-auto leading-relaxed font-medium">
                Adaptaremos las preguntas y ejemplos del ejercicio para que hagan clic exacto con tu nivel de experiencia actual.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => setProfile('trader')}
                className="glass-card p-6 text-left border border-white/10 bg-white/[0.02] hover:border-[#FF3EB0]/50 hover:bg-[#FF3EB0]/5 hover:shadow-[0_0_20px_rgba(255,62,176,0.1)] transition-all group flex flex-col justify-between min-h-[160px] cursor-pointer"
              >
                <div>
                  <span className="text-2xl mb-3 block">📈</span>
                  <h3 className="font-bold text-white text-base group-hover:text-[#FF3EB0] transition-colors mb-2">Perfil Trader / Inversionista</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
                    Si ya operas o inviertes activamente en los mercados financieros y quieres optimizar tu psicología operativa (targets, pérdidas, FOMO).
                  </p>
                </div>
              </button>

              <button
                onClick={() => setProfile('general')}
                className="glass-card p-6 text-left border border-white/10 bg-white/[0.02] hover:border-brand-green/50 hover:bg-brand-green/5 hover:shadow-[0_0_20px_rgba(0,230,118,0.1)] transition-all group flex flex-col justify-between min-h-[160px] cursor-pointer"
              >
                <div>
                  <span className="text-2xl mb-3 block">🛍️</span>
                  <h3 className="font-bold text-white text-base group-hover:text-brand-green transition-colors mb-2">Perfil Finanzas Personales</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
                    Si no haces trading y deseas aplicar el ejercicio a tus hábitos diarios, compras por impulso, metas de ahorro y relación general con el dinero.
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Sticky header with progress */}
        <div className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#FF3EB0]" />
              <span className="text-sm font-black text-[#FF3EB0] uppercase tracking-wider hidden sm:inline">
                RETO {RETO.name}
              </span>
              <span className="text-[10px] font-mono text-brand-text-muted tracking-widest uppercase">
                · PERFIL {profile === 'trader' ? 'TRADER' : 'FINANZAS'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-brand-text-muted">
                {String(answered).padStart(2, "0")} / {TOTAL_QUESTIONS}{" "}
                respondidas
              </span>
              <div className="w-28 md:w-36 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF3EB0] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-8"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Page header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-brand-text-muted font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3EB0]" />
                RETO · EVALUACIÓN CLAVE
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                Identifica tus trampas del dinero.
              </h1>
              <p className="text-brand-text-muted text-sm leading-relaxed font-medium">
                10 preguntas interactivas diseñadas para revelar tus patrones de comportamiento inconscientes. Responde con total honestidad.
              </p>
            </div>

            {/* Question cards */}
            {activeQuestions.map((q, i) => {
              const style = TYPE_STYLES[q.type];
              const isAnswered = responses[i] && String(responses[i]).trim();

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card p-6 relative overflow-hidden border-l-[3px] ${style.border}`}
                >
                  {/* Question header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-brand-text-muted font-bold">
                      Q{String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[9px] tracking-[0.2em] uppercase font-black font-mono px-2.5 py-1 rounded ${style.bg} ${style.color}`}
                    >
                      {style.label}
                    </span>
                    {isAnswered && (
                      <span className="text-[10px] text-brand-green font-black font-mono ml-auto flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> RESPONDIDA
                      </span>
                    )}
                  </div>

                  {/* Question text */}
                  <h3 className="text-xl md:text-2xl font-black text-white leading-snug mb-3">
                    {q.question}
                  </h3>

                  {/* Context Block */}
                  {q.context && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 mb-4 text-base md:text-lg text-white/90 leading-relaxed flex gap-3.5 items-start">
                      <Brain className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white text-base md:text-lg block mb-1.5">Concepto clave:</span>
                        {q.context}
                      </div>
                    </div>
                  )}

                  {/* Hint */}
                  {q.hint && (
                    <p className="text-base text-brand-text-muted leading-relaxed mb-4">
                      {q.hint}
                    </p>
                  )}

                  {/* Input Rendering based on controlType */}
                  {q.controlType === "choice" && (
                    <div className="grid gap-2.5 mt-3">
                      {q.options?.map((opt) => {
                        const isSelected = responses[i] === opt.value;
                        return (
                          <div key={opt.value}>
                            <button
                              type="button"
                              onClick={() => update(i, opt.value)}
                              className={`group w-full text-left p-4 rounded-xl border text-base md:text-lg font-bold transition-all flex items-start gap-4 cursor-pointer ${
                                isSelected
                                  ? "bg-[#FF3EB0]/15 border-[#FF3EB0] text-white shadow-[0_0_25px_rgba(255,62,176,0.2)]"
                                  : "bg-[#131924] border-white/15 text-white/80 hover:bg-[#FF3EB0]/5 hover:border-[#FF3EB0]/50 hover:text-white"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                isSelected ? "border-[#FF3EB0] bg-[#FF3EB0]" : "border-white/30 group-hover:border-[#FF3EB0]/50 group-hover:scale-105"
                              }`}>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                              </span>
                              <span className="flex-1 leading-snug">{opt.label}</span>
                            </button>
                            {isSelected && opt.feedback && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-sm md:text-base text-brand-green mt-2.5 ml-2 leading-relaxed font-mono font-bold"
                              >
                                ✓ {opt.feedback}
                              </motion.p>
                            )}
                          </div>
                        );
                      })}

                      {responses[i] && q.placeholder && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                          <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-1.5">↓ Escribe tu reflexión o justificación:</label>
                          <textarea
                            value={responses[i + '_text'] || ""}
                            onChange={(e) => setResponses(prev => ({ ...prev, [i + '_text']: e.target.value }))}
                            placeholder={q.placeholder}
                            rows={q.rows || 3}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-base md:text-lg leading-relaxed focus:outline-none focus:border-[#FF3EB0] focus:bg-[#0f1422] transition-all placeholder:text-white/30 resize-y"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {q.controlType === "slider" && (
                    <InteractiveSlider q={q} i={i} responses={responses} update={update} style={style} />
                  )}

                  {q.controlType === "calculator" && (
                    <InteractiveCalculator q={q} i={i} responses={responses} setResponses={setResponses} style={style} />
                  )}

                  {q.controlType === "checklist" && (
                    <div className="mt-3 space-y-2.5">
                      {q.checklistProps?.map((item) => {
                        const currentSelections = responses[i] ? responses[i].split(" || ") : [];
                        const isChecked = currentSelections.includes(item);
                        const handleCheck = () => {
                          let updated: string[];
                          if (isChecked) {
                            updated = currentSelections.filter(x => x !== item);
                          } else {
                            updated = [...currentSelections, item];
                          }
                          update(i, updated.join(" || "));
                        };

                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={handleCheck}
                            className={`group w-full text-left p-4 rounded-xl border text-base md:text-lg font-bold transition-all flex items-start gap-4 cursor-pointer ${
                              isChecked
                                ? "bg-[#FF3EB0]/15 border-[#FF3EB0] text-white shadow-[0_0_25px_rgba(255,62,176,0.2)]"
                                : "bg-[#131924] border-white/15 text-white/80 hover:bg-[#FF3EB0]/5 hover:border-[#FF3EB0]/50 hover:text-white"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isChecked ? "border-[#FF3EB0] bg-[#FF3EB0]" : "border-white/30 group-hover:border-[#FF3EB0]/50 group-hover:scale-105"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                            </span>
                            <span className="flex-1 leading-snug">{item}</span>
                          </button>
                        );
                      })}

                      {responses[i] && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                          <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-1.5">↓ Escribe tu reflexión o justificación:</label>
                          <textarea
                            value={responses[i + '_text'] || ""}
                            onChange={(e) => setResponses(prev => ({ ...prev, [i + '_text']: e.target.value }))}
                            placeholder={q.placeholder}
                            rows={q.rows || 3}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-base md:text-lg leading-relaxed focus:outline-none focus:border-[#FF3EB0] focus:bg-[#0f1422] transition-all placeholder:text-white/30 resize-y"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {q.controlType === "text" && (
                    <div className="space-y-3 mt-2">
                      {q.quickTemplates && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className="text-xs font-mono text-white/45 uppercase tracking-wider w-full mb-0.5">Plantillas rápidas recomendadas:</span>
                          {q.quickTemplates.map((t) => (
                            <button
                              type="button"
                              key={t.label}
                              onClick={() => update(i, t.text)}
                              className="text-xs font-mono bg-white/[0.04] border border-white/15 rounded px-2.5 py-1 text-white/80 hover:bg-[#FF3EB0]/15 hover:border-[#FF3EB0]/40 hover:text-white transition-colors cursor-pointer"
                            >
                              + {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        value={responses[i] || ""}
                        onChange={(e) => update(i, e.target.value)}
                        placeholder={q.placeholder}
                        rows={q.rows || 3}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-base md:text-lg leading-relaxed focus:outline-none focus:border-[#FF3EB0] focus:bg-[#0f1422] transition-all placeholder:text-white/30 resize-y"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Complete button */}
            <div className="flex items-center gap-5 pt-4 pb-8">
              <button
                onClick={handleComplete}
                disabled={!allAnswered}
                className={`py-4 px-10 rounded-xl text-sm font-black uppercase tracking-[0.12em] flex items-center gap-3 transition-all ${
                  allAnswered
                    ? "btn-primary"
                    : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                Cerrar el reto
                <ChevronRight className="w-5 h-5" />
              </button>
              {!allAnswered && (
                <span className="text-sm text-brand-text-muted font-mono">
                  Responde las {TOTAL_QUESTIONS - answered} que faltan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VIEW: COMPLETED
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <CompletionBanner lessonId="trampas" />

      <ResultActions 
        onDownloadPDF={generatePDF} 
        onReset={reset} 
      />

      <div className="min-h-[70vh] flex flex-col justify-center">
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column: Result Presentation */}
          <div className="flex flex-col h-full justify-center space-y-8">
            <div className="glass-card p-10 md:p-12 text-center border-t-2 border-t-[#FF3EB0] relative overflow-hidden flex-grow flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[#FF3EB0]/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF3EB0]" />

              <div className="relative z-10 space-y-6 w-full">
                <div className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted font-bold font-mono">
                  RETO COMPLETADO
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  Las trampas ya tienen{" "}
                  <span className="title-highlight">nombre.</span>
                </h2>

                <p className="text-white/85 text-base leading-[1.7] font-medium max-w-sm mx-auto">
                  Conocer la trampa no la elimina — la hace visible. Cada vez que
                  aparezcan ahora, vas a poder decir:{" "}
                  <span className="text-[#FF3EB0] font-black">
                    'Te vi. No hoy.'
                  </span>{" "}
                  Aplica tu regla 30 días seguidos.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
                  <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-black font-mono text-brand-green">
                      10/10
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-1">
                      Preguntas
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div className="text-sm font-black font-mono text-[#FF3EB0] leading-snug">
                      {responses[9] ? "REGLA LISTA" : "___"}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mt-1">
                      Tu defensa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Share */}
          <div className="flex flex-col h-full justify-center space-y-8">
            <div className="glass-card p-10 space-y-8 flex-grow flex flex-col justify-center relative overflow-hidden">
              
              <div className="space-y-6">
                {/* Rule anti-trampa */}
                <div className="text-left space-y-2">
                  <span className="text-[10px] tracking-[0.25em] font-mono text-[#00D4FF] font-bold uppercase block">
                    Tu Cortafuegos Personal
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Tu Regla Anti-Trampa:
                  </h3>
                  <div className="p-4 rounded-xl border border-[#FF3EB0]/30 bg-[#FF3EB0]/5 text-sm md:text-base leading-relaxed text-white font-mono italic relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Brain className="w-16 h-16 text-[#FF3EB0]" />
                    </div>
                    "{responses[9] || 'No definida'}"
                  </div>
                </div>

                {/* Calculator results */}
                {responses[5] && (
                  <div className="text-left space-y-2 pt-4 border-t border-white/5">
                    <span className="text-[10px] tracking-[0.25em] font-mono text-brand-yellow font-bold uppercase block">
                      Cálculo de Impacto
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Tu Fuga Financiera:
                    </h3>
                    <p className="text-sm md:text-base text-brand-yellow font-mono leading-relaxed bg-brand-yellow/5 border border-brand-yellow/20 p-4 rounded-xl">
                      {responses[5]}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Activity Redirect Card instead of ShareModule */}
              <div className="pt-6 border-t border-white/5 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 border border-[#01E47E]/30 bg-[#0a1f14]/50 relative overflow-hidden text-center space-y-6"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <span className="text-6xl">📋</span>
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-brand-green/20 text-[#01E47E] uppercase">
                      ¡Nivel Desbloqueado!
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Siguiente Módulo: Mi Primer PEDEM
                    </h3>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Aprende el método estructurado de planificación que separa al 5% consistente del 95% que improvisa.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/app/pedem')}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#01E47E] text-black font-black uppercase tracking-widest text-[10px] hover:bg-[#01E47E]/90 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Ir a Mi Primer PEDEM
                    <ChevronRight className="w-4 h-4 text-black stroke-[3px]" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
