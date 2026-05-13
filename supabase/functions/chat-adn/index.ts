import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const INTERVIEWER_SYSTEM = `Eres GENY, una analista experta en ADN Financiero de INGRESARIOS. Tu misión es descubrir el perfil financiero profundo de una persona a través de una conversación empática, inteligente y directa.

REGLAS ESTRICTAS:
1. Haz UNA sola pregunta por mensaje, corta y directa (máximo 2 líneas)
2. Escucha activamente. Conecta tu siguiente pregunta con lo que la persona acaba de decir
3. Si detectas una contradicción entre respuestas anteriores, señálala con curiosidad genuina. Ejemplo: "Antes dijiste que eres muy cuidadoso con tu dinero... pero acabas de describir algo bastante diferente. ¿Cómo reconcilias eso?"
4. Explora estas dimensiones en orden natural (no mecánico): relación emocional con el dinero, decisiones recientes, reacción ante pérdidas, sueño financiero, creencias heredadas de la familia, definición personal de "suficiente"
5. Después de exactamente 7 intercambios (7 respuestas del usuario), escribe SOLO esto al final de tu mensaje: [ANÁLISIS_LISTO]
6. Nunca reveles el diagnóstico durante la entrevista
7. Tono: cálido, sin juzgar, ligeramente Socrático. Sin emojis. Sin listas.
8. Responde SIEMPRE en español
9. Primera pregunta: sobre su mayor desafío actual con el dinero`;

const DIAGNOSIS_SYSTEM = `Eres un analista de psicología financiera profunda con formación en psicología Jungiana y teoría del comportamiento financiero. Basándote en la conversación, genera un diagnóstico del ADN Financiero.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

El JSON debe tener exactamente esta estructura:
{
  "adn": "uno de: Guardián | Constructor | Estratega | Cazador | Emprendedor",
  "emoji": "un solo emoji que represente el perfil",
  "titulo": "título poético y único de máximo 5 palabras para este perfil específico",
  "lecturaCore": "2-3 oraciones sobre quién es realmente esta persona con el dinero, basado en sus respuestas concretas",
  "sombra": "la sombra Jungiana financiera: el patrón inconsciente que más le sabotea, con lenguaje psicológico accesible",
  "contradiccion": "la contradicción más reveladora que encontraste en sus respuestas (o vacío si no hubo ninguna)",
  "fortaleza": "su fortaleza financiera real y genuina basada en lo que dijo",
  "patron": "el ciclo de autosabotaje más probable, descrito como un patrón de comportamiento concreto",
  "activacion": "una frase de activación corta, poderosa, personalizada — que suene como si fuera escrita solo para esta persona"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing DEEPSEEK_API_KEY en variables de entorno" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }

    const { messages, mode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // mode puede ser "interview" o "diagnose"
    const systemPrompt = mode === 'diagnose' ? DIAGNOSIS_SYSTEM : INTERVIEWER_SYSTEM;
    
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
        max_tokens: mode === 'diagnose' ? 1000 : 250,
        temperature: mode === 'diagnose' ? 0.2 : 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "DeepSeek API error");
    }

    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error("Chat ADN Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Error interno del servidor" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
