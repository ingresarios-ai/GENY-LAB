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

    // Insert or update activity log
    const activityName = ACTIVITY_NAMES[activity_id] || activity_id;
    const now = new Date().toISOString();
    let logError;

    // Check if activity log already exists
    const { data: existing, error: checkError } = await supabase
      .from("user_activity_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_id", activity_id);

    if (checkError) {
      console.error("Error checking existing activity log:", checkError);
      return json({ error: checkError.message }, 500);
    }

    if (existing && existing.length > 0) {
      // Update existing activity log
      const { error } = await supabase
        .from("user_activity_log")
        .update({
          metadata: metadata || {},
          completed_at: now,
        })
        .eq("id", existing[0].id);
      logError = error;
    } else {
      // Insert new activity log
      const { error } = await supabase
        .from("user_activity_log")
        .insert({
          user_id: user.id,
          activity_id,
          activity_name: activityName,
          metadata: metadata || {},
          completed_at: now,
        });
      logError = error;
    }

    if (logError) {
      console.error("Activity log error:", logError);
      return json({ error: logError.message }, 500);
    }

    // Count distinct core activities completed by this user to check for all_completed
    const { data: userLogs } = await supabase
      .from("user_activity_log")
      .select("activity_id")
      .eq("user_id", user.id);
      
    const completedSet = new Set((userLogs || []).map((l: any) => l.activity_id));
    completedSet.add(activity_id); // ensure current one is counted

    const CORE_ACTIVITIES = ["adn", "gastos", "termostato", "trampas", "pedem", "sombra", "flow"];
    const allCompleted = CORE_ACTIVITIES.every(actId => completedSet.has(actId));

    // Dispatch outgoing webhooks
    const { data: webhooks } = await supabase
      .from("admin_webhooks")
      .select("*")
      .eq("is_active", true);

    const matchingWebhooks = (webhooks || []).filter(
      (w: any) => w.events.includes("all") || w.events.includes(activity_id)
    );

    const payload = {
      event: "activity_completed",
      user: { name: user.name, email: user.email },
      activity: { id: activity_id, name: activityName },
      completed_at: now,
      metadata: metadata || {},
    };

    let allCompletedWebhooks: any[] = [];
    const SITE_URL = Deno.env.get("SITE_URL") || "https://genylab.ingresarios.net";
    const allCompletedPayload = {
      event: "all_completed",
      user: { name: user.name, email: user.email },
      results_url: `${SITE_URL}/resultados/${user.id}`,
      completed_at: now,
    };

    if (allCompleted) {
      allCompletedWebhooks = (webhooks || []).filter(
        (w: any) => w.events.includes("all") || w.events.includes("all_completed")
      );
    }

    // Fire webhooks in parallel (don't block response)
    const deliveryPromises = [
      ...matchingWebhooks.map(async (wh: any) => {
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
      }),
      ...allCompletedWebhooks.map(async (wh: any) => {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (wh.secret) headers["x-webhook-secret"] = wh.secret;

          const res = await fetch(wh.url, {
            method: "POST",
            headers,
            body: JSON.stringify(allCompletedPayload),
          });

          await supabase.from("webhook_delivery_log").insert({
            webhook_id: wh.id,
            event: "all_completed",
            payload: allCompletedPayload,
            response_status: res.status,
            response_body: (await res.text()).slice(0, 500),
            success: res.ok,
          });
        } catch (err) {
          await supabase.from("webhook_delivery_log").insert({
            webhook_id: wh.id,
            event: "all_completed",
            payload: allCompletedPayload,
            response_status: 0,
            response_body: String(err).slice(0, 500),
            success: false,
          });
        }
      })
    ];

    // Don't await — let them fire in background
    Promise.allSettled(deliveryPromises).catch(console.error);

    console.log(`✅ Activity logged: ${user.email} → ${activityName} (${matchingWebhooks.length} webhooks, allCompleted: ${allCompleted}, all_completed webhooks: ${allCompletedWebhooks.length})`);

    return json({ 
      success: true, 
      webhooks_dispatched: matchingWebhooks.length,
      all_completed: allCompleted,
      all_completed_webhooks_dispatched: allCompletedWebhooks.length 
    });
  } catch (err) {
    console.error("Activity error:", err);
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});

