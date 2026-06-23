// ghl-register-webhook — Receives GHL webhook, creates invitation token, returns magic link
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SITE_URL = "https://genylab.ingresarios.net";
const LEADCONNECTOR_WEBHOOK =
  Deno.env.get("LEADCONNECTOR_WEBHOOK") ||
  "https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/9354f7a9-2c5f-4ad8-99b9-cd8714874ca5";
const GHL_API_KEY = Deno.env.get("GHL_API_KEY") || "pit-4f9e4d51-644f-4612-ae1b-4059e72225ee";

// Actualiza el campo custom del contacto en GHL directamente via API
async function updateGHLContactField(contactId: string, magicLinkUrl: string) {
  if (!GHL_API_KEY || !contactId) {
    console.log("⏭️ Skipping GHL API update (no API key or contact_id)");
    return;
  }

  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Version": "2021-07-28",
        },
        body: JSON.stringify({
          customFields: [
            {
              key: "webhook_magic_link_geny_lab",
              value: magicLinkUrl,
            },
          ],
        }),
      }
    );

    console.log(`📤 GHL Contact API update: ${res.status} for ${contactId}`);
  } catch (err) {
    console.error("GHL Contact API error:", err);
  }
}

// Envía el magic link de vuelta a GHL via LeadConnector webhook
async function syncMagicLinkToGHL(
  name: string,
  email: string,
  contactId: string,
  magicLinkUrl: string
) {
  try {
    const payload = {
      name,
      email: email.toLowerCase().trim(),
      contact_id: contactId,
      magic_link_url: magicLinkUrl,
      type: "invitation_created",
    };

    const res = await fetch(LEADCONNECTOR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log(`📤 GHL Sync (magic link) response: ${res.status} for ${email}`);
  } catch (err) {
    console.error("GHL sync error:", err);
  }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    console.log("📩 ghl-register-webhook payload:", JSON.stringify(body));

    // Extract fields with fallbacks (GHL can send in various formats)
    const contact = body?.contact || body || {};

    const email = contact.email || body?.email || "";
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let parsedName = contact.name || body?.name || contact.nombre || body?.nombre || "";
    if (!parsedName) {
      const firstName = contact.first_name || body?.first_name || contact.firstName || body?.firstName || "";
      const lastName = contact.last_name || body?.last_name || contact.lastName || body?.lastName || "";
      parsedName = `${firstName} ${lastName}`.trim();
    }

    const contactId = contact.contact_id || body?.contact_id || contact.id || body?.id || "";

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = parsedName || "Sin nombre";

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id, token, status")
      .eq("email", cleanEmail)
      .eq("status", "pending")
      .maybeSingle();

    let invitationToken: string;

    if (existingInvitation) {
      // Reuse existing pending invitation token
      invitationToken = existingInvitation.token;
      console.log(`♻️ Reusing existing invitation for ${cleanEmail}`);
    } else {
      // Create new invitation
      const { data: newInvitation, error: insertError } = await supabase
        .from("invitations")
        .insert({
          name: cleanName,
          email: cleanEmail,
          contact_id: contactId || null,
        })
        .select("token")
        .single();

      if (insertError || !newInvitation) {
        console.error("Error creating invitation:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create invitation", detail: insertError?.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      invitationToken = newInvitation.token;
      console.log(`✨ New invitation created for ${cleanEmail}`);
    }

    // Build the magic link
    const magicLinkUrl = `${SITE_URL}/registro?token=${invitationToken}`;

    // Send magic link back to GHL (fire-and-forget)
    if (contactId) {
      // 1. Update custom field directly via GHL API
      updateGHLContactField(contactId, magicLinkUrl).catch((err) =>
        console.error("Async GHL API update failed:", err)
      );
      // 2. Also sync via LeadConnector webhook
      syncMagicLinkToGHL(cleanName, cleanEmail, contactId, magicLinkUrl).catch((err) =>
        console.error("Async GHL sync failed:", err)
      );
    }

    console.log(`✅ Invitation ready: ${cleanEmail} | Link: ${magicLinkUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation created",
        email: cleanEmail,
        magic_link_url: magicLinkUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("ghl-register-webhook Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
