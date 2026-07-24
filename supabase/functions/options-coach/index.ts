import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }

    const { trade, symbol, spot, iv, dte } = await req.json()

    if (!trade) {
      return new Response(JSON.stringify({ error: "Missing trade data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    // ── Input sanitization (prevents prompt injection) ──
    const safeSymbol = String(symbol || 'N/A').replace(/[^A-Z0-9]/gi, '').substring(0, 10);
    const safeSpot  = Math.abs(parseFloat(spot)  || 0).toFixed(2);
    const safeIv    = Math.min(Math.max(parseFloat(iv) || 0, 0), 999).toFixed(1);
    const safeDte   = Math.min(Math.max(parseInt(dte)  || 0, 0), 999);
    const safePnl   = parseFloat(trade.pnl) || 0;
    const safePnlPct = parseFloat(trade.pnlPct) || 0;
    const safeQty   = Math.min(Math.abs(parseInt(trade.qty) || 1), 9999);
    const safeStrike = Math.abs(parseFloat(trade.strike) || 0).toFixed(2);
    const safePrice  = Math.abs(parseFloat(trade.price)  || 0).toFixed(4);
    const safeDelta  = parseFloat(trade.delta) || 0;
    const safeOt    = ['call', 'put'].includes(String(trade.ot).toLowerCase()) ? String(trade.ot).toUpperCase() : 'CALL';
    const safeSide  = trade.side === 'buy' ? 'COMPRÓ' : 'VENDIÓ';

    const action = trade.isClose
      ? `CERRÓ P&L:$${safePnl}(${safePnlPct}%)`
      : `${safeSide} ${safeQty}x $${safeStrike} ${safeOt} @$${safePrice} Δ${safeDelta}`;
    const prompt = `Coach opciones. Español. 3 oraciones: mecánica, concepto clave con números, paso accionable. ${safeSymbol} $${safeSpot} IV${safeIv}% ${safeDte}DTE. ${action}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "system", content: "Eres Geny, coach de opciones financieras de INGRESARIOS. Responde en español, 3 oraciones concisas." }, { role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "DeepSeek API error")
    }

    const message = data.choices?.[0]?.message?.content || 
      "¡Buena operación! Monitorea tus griegas y siempre conoce tu pérdida máxima antes de entrar."

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (error: any) {
    console.error("Options Coach Error:", error)
    return new Response(JSON.stringify({ 
      message: "¡Sólida ejecución! Observa el delta de tu posición — te dice cuántas acciones equivalentes tienes expuestas. Revisa el diagrama de payoff para visualizar tus zonas de ganancia." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })
  }
})
