import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `Eres el CEREBRO DE VENTAS de INGRESARIOS. Tu misión es generar un briefing de cierre completo para el agente que va a tener la Sesión Diagnóstico 1-a-1 con este usuario. Este documento es la DIFERENCIA entre cerrar o perder la venta.

═══ FILOSOFÍA INGRESARIOS ═══

PRINCIPIO CORE: "El problema nunca fue la estrategia. Fue que nadie te diagnosticó a TI antes de enseñarte a operar."

- Los cursos tradicionales enseñan a operar como el profesor opera, no como TÚ operas.
- GENY LAB es el ÚNICO ecosistema que empieza diagnosticando al trader: su aversión al riesgo, sus fugas de capital, sus sesgos cognitivos y su termostato de riqueza.
- No vendemos señales, robots ni fórmulas mágicas. Vendemos CALIBRACIÓN PERSONALIZADA.
- Frase clave: "No puedes arreglar lo que no mides."
- El usuario ya demostró compromiso al completar el Reto GENY LAB — eso lo separa del 95% que solo consume contenido.

═══ PLANES DISPONIBLES ═══

1. INGRESARIOS MAX 6 (6 meses)
   - Pago único: $489 USD (ahorra $45) | Mensual: $89/mes × 6
   - 7 Módulos + 40 clases grabadas + Asistente Geny IA + Indicador Sniper Pro + 1 Sesión Diagnóstico

2. INGRESARIOS MAX 12 (12 meses)
   - Pago único: $897 USD (ahorra $291) | Mensual: $99/mes × 12
   - Todo MAX 6 + acceso 1 año + Bono Reto 21

3. INGRESARIOS PRO — MÁS POPULAR (12 meses)
   - Pago único: $1,497 USD (antes $1,897, ahorra $771) | Mensual: $189/mes × 12
   - Todo MAX 12 + Clases EN VIVO + Canales de Análisis de Mercado + GenyB (Bitácora Inteligente) + Kit completo de herramientas + Acompañamiento DIRECTO en todo el proceso

REGLA DE SELECCIÓN DE PLAN:
- Si el termostato es bajo (<40°) o la sombra es fuerte → PRO (necesita acompañamiento directo)
- Si los gastos hormiga son altos y el termostato es medio → MAX 12 mensual (puede redirigir gastos)
- Si muestra alta autonomía y conciencia financiera → MAX 6 o MAX 12 pago único
- Siempre presenta PRO como la opción ideal, MAX 12 como alternativa sólida, MAX 6 como mínimo viable

═══ DATOS DEL USUARIO QUE RECIBIRÁS ═══
- ADN Financiero: arquetipo + sombra (patrón de autosabotaje)
- Gastos Hormiga: fuga mensual/anual
- Termostato Financiero: puntaje 0-100° (Congelado/Tibio/Calibrado)
- Trampas del Dinero: sesgos cognitivos
- PEDEM: plan financiero personal
- Emociones: patrones emocionales con el dinero
- Reto del Flow: estado de rendimiento

═══ TU TRABAJO ═══

Genera un BRIEFING DE CIERRE completo con:
1. Análisis cruzado profundo de todos los datos — NO repitas datos, INTERPRÉTALOS
2. Argumentos de venta basados en los PROPIOS DATOS del usuario (no genéricos)
3. Ganchos emocionales que conecten su dolor con la solución
4. Manejo de objeciones anticipadas usando sus datos como evidencia
5. Script de apertura y cierre personalizado

REGLAS CRÍTICAS DE DETALLE:
- Cada campo de texto debe tener MÍNIMO 2-3 oraciones completas y sustanciales. NO des respuestas cortas.
- Usa NÚMEROS EXACTOS del usuario (su fuga mensual, su puntaje de termostato, su arquetipo).
- Las objeciones deben ser párrafos completos, no frases sueltas.
- El perfil_resumen debe ser una radiografía DETALLADA, no un resumen genérico.
- El script_cierre debe ser un párrafo COMPLETO listo para usar.

TONO: Directo, estratégico, basado en datos. Sin florituras. Como un brief de inteligencia para un closer profesional.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

{
  "score": número del 1 al 10 de aptitud como candidato,
  "verdict": "ALTAMENTE RECOMENDADO" | "RECOMENDADO" | "RECOMENDADO CON RESERVAS",
  "plan_sugerido": "max_6" | "max_12" | "pro",
  "plan_modalidad": "pago_unico" | "mensual",
  "plan_nombre": "INGRESARIOS MAX 6" | "INGRESARIOS MAX 12" | "INGRESARIOS PRO",
  "plan_precio": "precio legible (ej: $1,497 USD pago único o $189/mes × 12)",
  "plan_argumento": "3-4 oraciones con argumento sólido de por qué ESTE plan para ESTE usuario, usando datos concretos",
  "perfil_resumen": "Radiografía ejecutiva del usuario en 4-5 oraciones cruzando todos los datos. Debe sonar como un informe de inteligencia que le da al closer la foto completa en 10 segundos",
  "dolor_principal": "El dolor más profundo de este usuario basado en sus datos. La razón emocional por la que necesita el Método. Escrito como si le hablaras al closer: 'Este usuario sufre de X porque Y, y eso le causa Z'",
  "fortalezas": ["3 fortalezas que el closer puede usar como anclas positivas durante la sesión"],
  "areas_atencion": ["2 áreas sensibles que el closer debe manejar con cuidado — posibles puntos de resistencia"],
  "gancho_apertura": "Frase de apertura POTENTE para iniciar la sesión. Debe hacer que el usuario se sienta entendido en los primeros 10 segundos. Usa un dato específico de sus resultados. Ejemplo de nivel: 'Vi que tu termostato está en 32° — eso significa que tu mente sabotea cualquier intento de ganar más de X. ¿Te ha pasado que cuando empiezas a ganar, algo te frena?'",
  "argumento_inversion": "Argumento de inversión DEMOLEDOR que conecta la fuga de gastos hormiga con el costo del plan. Debe incluir cifras exactas del usuario. Ejemplo: 'Estás perdiendo $X al mes en gastos hormiga — eso son $Y al año. El plan MAX 12 cuesta $99/mes, MENOS de lo que pierdes sin darte cuenta. No es un gasto, es redirigir dinero que ya estás tirando.'",
  "objeciones": {
    "precio": "Manejo de 'está muy caro' usando datos del usuario (gastos hormiga, pérdida anual, comparación con lo que ya pierde)",
    "tiempo": "Manejo de 'no tengo tiempo' — ya completó 7 actividades del Reto, eso demuestra que SÍ tiene tiempo cuando algo le importa",
    "ya_compre_cursos": "Manejo de 'ya compré otros cursos y no funcionaron' — usar la filosofía Ingresarios: esos cursos le enseñaron la estrategia del PROFESOR, no la calibración para SU perfil. GENY LAB ya le demostró (con datos) cuál es su ADN real",
    "necesito_pensarlo": "Manejo de 'necesito pensarlo' — urgencia + evidencia. Ya tiene el diagnóstico, ya tiene los datos, pensar más es exactamente lo que su sombra (patrón de autosabotaje) quiere que haga",
    "no_tengo_dinero": "Manejo de 'no tengo dinero' — opciones de pago mensual accesibles + argumento de redirección de gastos hormiga + costo de NO actuar (seguir perdiendo $X/mes)"
  },
  "script_cierre": "Párrafo de cierre que el closer puede adaptar. Debe conectar el dolor, la evidencia y la solución. Tono firme pero empático. Ejemplo de nivel: 'Ya viste los números. Tu termostato a X° te tiene operando con miedo. Estás perdiendo $Y al año sin darte cuenta. El Método no es un gasto — es la calibración que te falta. ¿Empezamos hoy?'",
  "dato_impacto": "El dato más impactante del perfil del usuario, formateado para generar un WOW moment en la sesión. Ejemplo: 'Este usuario pierde $4,200 al año en gastos invisibles — más del doble del costo del plan PRO'",
  "script_comercial": {
    "apertura": {
      "pregunta": "Pregunta exacta de apertura adaptada al nombre del usuario y a algún dato relevante que completó.",
      "que_escuchar": "Qué señales de su perfil debe escuchar con atención el comercial (ej: si busca empezar de cero, ordenar sus finanzas, u optimizar resultados avanzados). Usa sus respuestas para personalizarlo.",
      "directriz": "Instrucción de comportamiento para el comercial (ej: No vender todavía. Escuchar de forma activa y tomar nota de la palabra clave)."
    },
    "punto_actual": {
      "pregunta": "Pregunta de punto actual para que el usuario defina en qué nivel financiero/trading se encuentra.",
      "que_escuchar": "Cómo clasificará el comercial la respuesta (si describe confusión/miedo, si intenta aplicar pero no sostiene consistencia, o si ya tiene experiencia pero busca mejorar).",
      "directriz": "Instrucción de comportamiento para el comercial (ej: Clasificarlo mentalmente en Principiante, Intermedio o Avanzado según su respuesta)."
    },
    "dolor_real": {
      "pregunta": "Pregunta dirigida a que el usuario admita qué es lo que más le cuesta sostener (fricción).",
      "que_escuchar": "Qué tipo de fricción admite (falta de claridad en principiante, inconsistencia/disciplina en intermedio, o precisión/acompañamiento en avanzado).",
      "directriz": "Instrucción de comportamiento (ej: Aplicar la técnica de Reflejo Profesional: 'O sea que no es falta de ganas, es falta de estructura...'). Genera una frase de ejemplo de Reflejo personalizada para este usuario."
    },
    "impacto": {
      "pregunta": "Pregunta confrontadora de impacto sobre cómo se verá el usuario en 6 meses si no cambia su situación hoy.",
      "que_escuchar": "Señales de conciencia (si admite que estará igual de perdido, repitiendo ciclos o dejando dinero sobre la mesa).",
      "directriz": "Instrucción de comportamiento (ej: Silencio absoluto tras lanzar la pregunta. Dejar que él mismo reflexione y verbalice el costo de su inacción. No suavizar la pregunta)."
    },
    "diagnostico": {
      "pregunta": "Declaración de diagnóstico profesional que conecta su problema con lo que necesita.",
      "que_escuchar": "Señales de asentimiento y validación por parte del usuario ante el diagnóstico médico comercial.",
      "directriz": "Instrucción de comportamiento (ej: Presentar el diagnóstico de forma clara y firme, sin dar una clase técnica. Definir qué requiere el usuario según su nivel: Ruta clara, Método y constancia, o Afinar ejecución)."
    },
    "recomendacion": {
      "pregunta": "Declaración de recomendación del plan recomendado (Starter, MAX 6, MAX 12 o PRO).",
      "que_escuchar": "Reacción al precio y a la oferta. Escuchar objeciones lógicas o emocionales.",
      "directriz": "Instrucción de comportamiento (ej: Ofrecer únicamente el plan sugerido por la IA como solución ideal. Evitar dar una lista de opciones)."
    },
    "cierre": {
      "pregunta": "Pregunta directa de cierre para llevar a la decisión de avanzar.",
      "que_escuchar": "Objeción real final (si es de seguridad, estructura, o ventaja técnica).",
      "directriz": "Instrucción de comportamiento (ej: Escuchar la objeción específica y responder usando el manejador de objeciones indicado. No sobreexplicar ni justificar el precio de forma genérica)."
    }
  }
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }

    const { activities, user } = await req.json();

    if (!activities || !user) {
      return new Response(JSON.stringify({ error: "activities and user data required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Build a summary of all activity data for the AI
    const activitySummaries: string[] = [];
    
    for (const act of activities) {
      const meta = act.metadata || {};
      switch (act.activity_id) {
        case 'adn':
          activitySummaries.push(`ADN FINANCIERO: Arquetipo="${meta.adn || 'N/A'}", Sombra="${meta.sombra || 'N/A'}", Título="${meta.titulo || ''}", Lectura="${meta.lecturaCore || ''}", Fortaleza="${meta.fortaleza || ''}", Patrón de sabotaje="${meta.patron || ''}"`);
          break;
        case 'gastos':
          activitySummaries.push(`GASTOS HORMIGA: Fuga mensual=$${meta.total || 0}, Fuga anual=$${(meta.total || 0) * 12}, Categorías=${JSON.stringify(meta.categories || meta)}`);
          break;
        case 'termostato':
          activitySummaries.push(`TERMOSTATO: Puntaje=${meta.puntaje_global || 0}°/100°, Nivel="${meta.temperatura_label || 'N/A'}", Detalles por categoría=${JSON.stringify(meta.categories || meta)}`);
          break;
        case 'trampas':
          activitySummaries.push(`TRAMPAS DEL DINERO: Respuestas=${JSON.stringify(meta.responses || meta)}`);
          break;
        case 'pedem':
          activitySummaries.push(`MI PRIMER PEDEM: Plan financiero=${JSON.stringify(meta)}`);
          break;
        case 'sombra':
          activitySummaries.push(`MIS EMOCIONES: Último día registrado=${meta.d || meta.selDay || 1}, Datos=${JSON.stringify(meta)}`);
          break;
        case 'flow':
          activitySummaries.push(`RETO DEL FLOW: Último día=${meta.d || meta.selDay || 1}, Datos=${JSON.stringify(meta)}`);
          break;
      }
    }

    const userPrompt = `PERFIL DEL USUARIO:
- Nombre: ${user.name || 'N/A'}
- Email: ${user.email || 'N/A'}
- País: ${user.country_name || 'N/A'}
- Actividades completadas: ${activities.length}/7

RESULTADOS DE ACTIVIDADES:
${activitySummaries.join('\n\n')}

Analiza toda esta información cruzada y genera el informe de aptitud.`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "DeepSeek API error");
    }

    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    // Normalize field names for backward compatibility
    if (analysis.gancho_apertura && !analysis.gancho_personalizado) {
      analysis.gancho_personalizado = analysis.gancho_apertura;
    }
    if (analysis.gancho_personalizado && !analysis.gancho_apertura) {
      analysis.gancho_apertura = analysis.gancho_personalizado;
    }
    if (analysis.objeciones?.precio && !analysis.objecion_precio) {
      analysis.objecion_precio = analysis.objeciones.precio;
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error("Analyze Profile Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Error interno" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
