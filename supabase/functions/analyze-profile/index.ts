import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `Eres un analista financiero experto de INGRESARIOS. Tu trabajo es analizar la radiografía financiera completa de un candidato al Método Ingresarios y generar un informe de aptitud para el agente de ventas.

EL MÉTODO INGRESARIOS:
- Programa avanzado de trading y finanzas personales
- Precio total: $1,397 USD
- Planes de pago disponibles:
  1. PAGO ÚNICO: $1,397 USD (mejor precio, ahorro total)
  2. PLAN 3 CUOTAS: $497 USD × 3 meses = $1,491 USD
  3. PLAN 6 CUOTAS: $267 USD × 6 meses = $1,602 USD

DATOS QUE RECIBIRÁS:
- ADN Financiero: arquetipo (perfil de inversionista) y sombra (debilidad)
- Gastos Hormiga: fuga mensual y anual en gastos invisibles
- Termostato Financiero: puntaje (0-100°) y nivel de techo de riqueza
- Trampas del Dinero: sesgos cognitivos detectados
- PEDEM: plan financiero personal
- Emociones: patrones emocionales con el dinero
- Reto del Flow: estado de rendimiento

INSTRUCCIONES:
1. Analiza todos los datos disponibles del usuario de forma cruzada.
2. Determina si es un buen candidato para el Método Ingresarios basándote en: nivel de compromiso demostrado (completó las actividades), conciencia financiera, potencial de mejora, y capacidad de pago estimada.
3. Sugiere el plan de pago más adecuado basándote en su fuga mensual de gastos (si la fuga mensual es alta, el usuario puede redirigir ese dinero a inversión en educación).
4. Sé persuasivo pero honesto. Ayuda al agente con argumentos personalizados.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

El JSON debe tener exactamente esta estructura:
{
  "score": número del 1 al 10 indicando qué tan buen candidato es,
  "verdict": "ALTAMENTE RECOMENDADO" | "RECOMENDADO" | "RECOMENDADO CON RESERVAS",
  "plan_sugerido": "pago_unico" | "3_cuotas" | "6_cuotas",
  "plan_precio": "$1,397 USD" | "$497 × 3" | "$267 × 6",
  "plan_argumento": "2-3 oraciones explicando por qué este plan es ideal para este usuario específico, usando sus datos",
  "perfil_resumen": "3-4 oraciones que resumen quién es este usuario financieramente, cruzando ADN + termostato + gastos",
  "fortalezas": ["lista de 2-3 fortalezas detectadas que lo hacen buen candidato"],
  "areas_atencion": ["lista de 1-2 áreas que el agente debe manejar con cuidado en la sesión"],
  "gancho_personalizado": "una frase de apertura que el agente puede usar en la sesión, personalizada con los datos del usuario",
  "argumento_inversion": "2-3 oraciones que conectan la fuga de gastos hormiga o el termostato bajo con la oportunidad del Método como inversión en sí mismo"
}`;

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
        max_tokens: 1200,
        temperature: 0.3
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
