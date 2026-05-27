import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GHL_WEBHOOK_TOKEN = Deno.env.get("GHL_WEBHOOK_TOKEN") || "temp_default_token_123456";

const SITE_URL = "https://genylab.ingresarios.net";
const LEADCONNECTOR_WEBHOOK =
   Deno.env.get("LEADCONNECTOR_WEBHOOK") || "https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/9354f7a9-2c5f-4ad8-99b9-cd8714874ca5";

const DEFAULT_AVATAR = "/avatars/avatar_bull.png";

// Normalizar números de teléfono
function normalizePhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  if (cleaned.startsWith("+52") && !cleaned.startsWith("+521")) {
    return "+521" + cleaned.slice(3);
  }
  return cleaned;
}

// Obtener país basado en el prefijo telefónico
function countryFromPhone(phone: string): string | null {
  if (!phone) return null;
  const p = phone.trim();
  const map: [string, string][] = [
    ["+593", "Ecuador"], ["+591", "Bolivia"], ["+595", "Paraguay"],
    ["+598", "Uruguay"], ["+502", "Guatemala"], ["+503", "El Salvador"],
    ["+504", "Honduras"], ["+505", "Nicaragua"], ["+506", "Costa Rica"],
    ["+507", "Panamá"], ["+521", "México"], ["+52", "México"],
    ["+57", "Colombia"], ["+54", "Argentina"], ["+56", "Chile"],
    ["+51", "Perú"], ["+58", "Venezuela"], ["+55", "Brasil"],
    ["+34", "España"], ["+1", "Estados Unidos"],
  ];
  for (const [prefix, country] of map) {
    if (p.startsWith(prefix)) return country;
  }
  return null;
}

// Crear cuenta en Supabase Auth
async function createAuthUser(supabase: any, email: string, name: string): Promise<string | null> {
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = (existingUsers?.users || []).find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return existing.id;
    }

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) {
      console.error("Error creating auth user:", createError);
      return null;
    }

    return newUser.user.id;
  } catch (err) {
    console.error("Auth creation exception:", err);
    return null;
  }
}

// Sincronizar datos de vuelta con el webhook de LeadConnector
async function syncToLeadConnector(name: string, email: string, phone: string, magicLinkUrl: string) {
  try {
    const payload = {
      name,
      email: email.toLowerCase().trim(),
      phone: normalizePhone(phone),
      magic_link_url: magicLinkUrl,
      payment_platform: "ghl",
    };

    const res = await fetch(LEADCONNECTOR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log(`📤 GHL Sync response status: ${res.status} for ${email}`);
  } catch (err) {
    console.error("LeadConnector sync error:", err);
  }
}

Deno.serve(async (req: Request) => {
  // Manejo de CORS OPTIONS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // Permitido para webhooks externos como GHL
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
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");

    // Validar token de seguridad
    if (!tokenParam || tokenParam !== GHL_WEBHOOK_TOKEN) {
      console.warn("Unauthorized webhook access attempt.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name || "Sin nombre";
    const normalizedPhone = normalizePhone(phone || "");

    // 1. Obtener o crear cuenta en Supabase Auth
    const authUserId = await createAuthUser(supabase, cleanEmail, cleanName);

    // 2. Verificar si el usuario ya existe en enrolled_users
    const { data: existingUser } = await supabase
      .from("enrolled_users")
      .select("id, access_code, magic_link_url")
      .eq("email", cleanEmail)
      .maybeSingle();

    let accessCode = existingUser?.access_code;
    let permanentUrl = existingUser?.magic_link_url;

    if (!accessCode) {
      // Generar nuevo código de acceso permanente si no tiene uno
      accessCode = crypto.randomUUID().replace(/-/g, "");
      permanentUrl = `${SITE_URL}/acceso/${accessCode}`;
    }

    // 3. Upsert en enrolled_users para dar de alta/activar
    const country = countryFromPhone(normalizedPhone);
    const { error: dbError } = await supabase
      .from("enrolled_users")
      .upsert(
        {
          name: cleanName,
          email: cleanEmail,
          phone: normalizedPhone || null,
          payment_method: "ghl",
          payment_platform: "ghl",
          status: "active",
          auth_user_id: authUserId,
          magic_link_url: permanentUrl,
          access_code: accessCode,
          country_name: country,
          avatar_url: DEFAULT_AVATAR,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database error enrolling user:", dbError);
      return new Response(JSON.stringify({ error: "Database error", detail: dbError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Enviar datos de regreso a GHL (LeadConnector) con el magic_link_url permanente
    // Fire-and-forget: corre en segundo plano para responder rápido a GHL
    syncToLeadConnector(cleanName, cleanEmail, normalizedPhone, permanentUrl!).catch((err) =>
      console.error("Async syncToLeadConnector failed:", err)
    );

    console.log(`✅ CRM Enrolled User: ${cleanEmail} | Link: ${permanentUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User enrolled successfully",
        email: cleanEmail,
        magic_link_url: permanentUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("GHL Webhook Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
