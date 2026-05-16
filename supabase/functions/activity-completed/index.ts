// activity-completed — Logs user activity and dispatches outgoing webhooks
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ACTIVITY_NAMES: Record<string, string> = {
  adn: "ADN Financiero",
  gastos: "Gastos Hormiga",
  termostato: "Termostato Financiero",
  trampas: "Trampas del Dinero",
  pedem: "Mi Primer PEDEM",
  sombra: "Mis Emociones",
  flow: "Reto del Flow",
  geny: "Geny Opciones",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { email, activity_id, metadata } = await req.json();

    if (!email || !activity_id) {
      return json({ error: "email and activity_id required" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Find user by email
    const { data: user } = await supabase
      .from("enrolled_users")
      .select("id, name, email")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!user) {
      return json({ error: "User not found", detail: "Email not enrolled" }, 404);
    }

    // Check if already logged (avoid duplicates)
    const { data: existing } = await supabase
      .from("user_activity_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_id", activity_id)
      .limit(1);

    if (existing && existing.length > 0) {
      return json({ success: true, already_logged: true });
    }

    // Insert activity log
    const activityName = ACTIVITY_NAMES[activity_id] || activity_id;
    const { error: logError } = await supabase
      .from("user_activity_log")
      .insert({
        user_id: user.id,
        activity_id,
        activity_name: activityName,
        metadata: metadata || {},
      });

    if (logError) {
      console.error("Activity log error:", logError);
      return json({ error: logError.message }, 500);
    }

    // Dispatch outgoing webhooks
    const { data: webhooks } = await supabase
      .from("admin_webhooks")
      .select("*")
      .eq("is_active", true);

    const matchingWebhooks = (webhooks || []).filter(
      (w: any) => w.events.includes("all") || w.events.includes(activity_id)
    );

    const now = new Date().toISOString();
    const payload = {
      event: "activity_completed",
      user: { name: user.name, email: user.email },
      activity: { id: activity_id, name: activityName },
      completed_at: now,
      metadata: metadata || {},
    };

    // Fire webhooks in parallel (don't block response)
    const deliveryPromises = matchingWebhooks.map(async (wh: any) => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (wh.secret) headers["x-webhook-secret"] = wh.secret;

        const res = await fetch(wh.url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        await supabase.from("webhook_delivery_log").insert({
          webhook_id: wh.id,
          event: activity_id,
          payload,
          response_status: res.status,
          response_body: (await res.text()).slice(0, 500),
          success: res.ok,
        });
      } catch (err) {
        await supabase.from("webhook_delivery_log").insert({
          webhook_id: wh.id,
          event: activity_id,
          payload,
          response_status: 0,
          response_body: String(err).slice(0, 500),
          success: false,
        });
      }
    });

    // Don't await — let them fire in background
    Promise.allSettled(deliveryPromises).catch(console.error);

    console.log(`✅ Activity logged: ${user.email} → ${activityName} (${matchingWebhooks.length} webhooks)`);

    return json({ success: true, webhooks_dispatched: matchingWebhooks.length });
  } catch (err) {
    console.error("Activity error:", err);
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});
