// payment-webhook — Receives payment confirmations from Hotmart, Whop, etc.
// Creates Supabase Auth user with magic link + forwards data to LeadConnector
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const LEADCONNECTOR_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/9354f7a9-2c5f-4ad8-99b9-cd8714874ca5";

// Normaliza teléfonos mexicanos: +52 sin el 1 → +521
function normalizePhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  if (cleaned.startsWith("+52") && !cleaned.startsWith("+521")) {
    return "+521" + cleaned.slice(3);
  }
  return cleaned;
}

// País: código ISO + nombre para mostrar
const COUNTRY_DATA: Record<string, { iso: string; name: string }> = {
  "MX": { iso: "MX", name: "México" },
  "CO": { iso: "CO", name: "Colombia" },
  "AR": { iso: "AR", name: "Argentina" },
  "CL": { iso: "CL", name: "Chile" },
  "PE": { iso: "PE", name: "Perú" },
  "EC": { iso: "EC", name: "Ecuador" },
  "VE": { iso: "VE", name: "Venezuela" },
  "BO": { iso: "BO", name: "Bolivia" },
  "PY": { iso: "PY", name: "Paraguay" },
  "UY": { iso: "UY", name: "Uruguay" },
  "GT": { iso: "GT", name: "Guatemala" },
  "CR": { iso: "CR", name: "Costa Rica" },
  "PA": { iso: "PA", name: "Panamá" },
  "HN": { iso: "HN", name: "Honduras" },
  "SV": { iso: "SV", name: "El Salvador" },
  "NI": { iso: "NI", name: "Nicaragua" },
  "DO": { iso: "DO", name: "Rep. Dominicana" },
  "CU": { iso: "CU", name: "Cuba" },
  "PR": { iso: "PR", name: "Puerto Rico" },
  "US": { iso: "US", name: "Estados Unidos" },
  "ES": { iso: "ES", name: "España" },
  "BR": { iso: "BR", name: "Brasil" },
  "CA": { iso: "CA", name: "Canadá" },
};

// Mapeo de nombres comunes → ISO
const NAME_TO_ISO: Record<string, string> = {
  "mexico": "MX", "méxico": "MX", "colombia": "CO", "argentina": "AR",
  "chile": "CL", "peru": "PE", "perú": "PE", "ecuador": "EC",
  "venezuela": "VE", "bolivia": "BO", "paraguay": "PY", "uruguay": "UY",
  "guatemala": "GT", "costa rica": "CR", "panama": "PA", "panamá": "PA",
  "honduras": "HN", "el salvador": "SV", "nicaragua": "NI",
  "republica dominicana": "DO", "república dominicana": "DO",
  "cuba": "CU", "puerto rico": "PR",
  "estados unidos": "US", "eeuu": "US",
  "españa": "ES", "espana": "ES",
  "brasil": "BR", "canada": "CA", "canadá": "CA",
  "united states": "US", "usa": "US", "united states of america": "US",
  "spain": "ES", "brazil": "BR", "dominican republic": "DO",
};

function normalizeCountry(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  const key = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return NAME_TO_ISO[trimmed.toLowerCase()] || NAME_TO_ISO[key] || trimmed.toUpperCase().slice(0, 2);
}

function getCountryName(iso: string): string {
  if (!iso) return "";
  return COUNTRY_DATA[iso.toUpperCase()]?.name || iso;
}

// Crea cuenta en Supabase Auth y genera magic link
async function createAuthUserAndMagicLink(
  supabase: any,
  email: string,
  name: string
): Promise<{ authUserId: string | null; magicLinkUrl: string | null }> {
  try {
    // Try to create the auth user (will fail silently if already exists)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = (existingUsers?.users || []).find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let authUserId: string;

    if (existing) {
      authUserId = existing.id;
    } else {
      // Create new auth user — email auto-confirmed, no password
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          email_confirm: true,
          user_metadata: { name },
        });

      if (createError) {
        console.error("Auth user creation error:", createError);
        return { authUserId: null, magicLinkUrl: null };
      }
      authUserId = newUser.user.id;
    }

    // Generate magic link — redirect to custom domain after verification
    const SITE_URL = "https://genylab.ingresarios.net";
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email.toLowerCase().trim(),
        options: { redirectTo: `${SITE_URL}/app` },
      });

    if (linkError) {
      console.error("Magic link generation error:", linkError);
      return { authUserId, magicLinkUrl: null };
    }

    const magicLinkUrl = linkData?.properties?.action_link || null;

    return { authUserId, magicLinkUrl };
  } catch (err) {
    console.error("Auth/magic link error:", err);
    return { authUserId: null, magicLinkUrl: null };
  }
}

// Envía datos al webhook de LeadConnector
async function sendToLeadConnector(
  name: string,
  email: string,
  phone: string,
  magicLinkUrl?: string | null
) {
  try {
    const normalizedPhone = normalizePhone(phone);
    const payload: Record<string, string> = {
      name,
      email: email.toLowerCase().trim(),
      phone: normalizedPhone,
    };
    if (magicLinkUrl) {
      payload.magic_link_url = magicLinkUrl;
    }
    const res = await fetch(LEADCONNECTOR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(
      `📤 LeadConnector webhook: ${res.status} for ${email} (phone: ${normalizedPhone})`
    );
  } catch (err) {
    console.error("LeadConnector webhook error:", err);
  }
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "content-type, x-hotmart-hottok, x-whop-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl, serviceKey);

    // Detect platform from headers or payload
    const hotmartToken = req.headers.get("x-hotmart-hottok");
    const whopSig =
      req.headers.get("webhook-signature") ||
      req.headers.get("x-whop-signature");

    let name = "";
    let email = "";
    let phone = "";
    let country = "";
    let platform = "unknown";
    let transactionId = "";
    let amount: number | null = null;
    let currency = "MXN";

    if (
      hotmartToken ||
      body?.event === "PURCHASE_APPROVED" ||
      body?.data?.buyer
    ) {
      // ── HOTMART FORMAT ──
      platform = "hotmart";
      const buyer = body?.data?.buyer || body?.buyer || {};
      name = buyer.name || body?.data?.buyer?.name || "";
      email = buyer.email || body?.data?.buyer?.email || "";
      phone = buyer.checkout_phone || "";
      country = buyer.address?.country || buyer.country || "";
      transactionId =
        body?.data?.purchase?.transaction || body?.transaction || "";
      amount = body?.data?.purchase?.price?.value || null;
      currency = body?.data?.purchase?.price?.currency_code || "MXN";
    } else if (
      whopSig ||
      body?.type === "payment.succeeded" ||
      body?.type === "membership.activated" ||
      body?.data?.user
    ) {
      // ── WHOP FORMAT ──
      // Whop nests user info inside data.user and data.member
      platform = "whop";
      const paymentData = body?.data || {};
      const user = paymentData?.user || {};
      const member = paymentData?.member || {};
      const billing = paymentData?.billing_address || {};

      name = user.name || user.username || "";
      email = user.email || "";
      phone = member.phone || "";
      country = billing.country || "";
      transactionId = paymentData.id || body?.id || "";
      amount = paymentData.total != null ? paymentData.total : null;
      currency = (paymentData.currency || "USD").toUpperCase();
    } else {
      // ── GENERIC FORMAT ──
      platform = body?.platform || "generic";
      name = body?.name || body?.nombre || "";
      email = body?.email || body?.correo || "";
      phone = body?.phone || body?.telefono || "";
      country = body?.country || body?.pais || "";
      transactionId = body?.transaction_id || "";
      amount = body?.amount || body?.monto || null;
      currency = body?.currency || "MXN";
    }

    // Validate minimum data
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    // Create Supabase Auth user + generate magic link
    const { authUserId, magicLinkUrl } = await createAuthUserAndMagicLink(
      supabase,
      email,
      name || "Sin nombre"
    );

    // Upsert user (don't duplicate if same email)
    const { data, error } = await supabase
      .from("enrolled_users")
      .upsert(
        {
          name: name || "Sin nombre",
          email: email.toLowerCase().trim(),
          phone: normalizedPhone || null,
          country: normalizeCountry(country) || null,
          country_name: getCountryName(normalizeCountry(country)) || null,
          payment_method: "webhook",
          payment_platform: platform,
          transaction_id: transactionId || null,
          payment_amount: amount,
          payment_currency: currency,
          status: "active",
          auth_user_id: authUserId || null,
          magic_link_url: magicLinkUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      return new Response(
        JSON.stringify({ error: "Database error", detail: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send data to LeadConnector webhook (fire and forget)
    sendToLeadConnector(name || "Sin nombre", email, normalizedPhone, magicLinkUrl);

    console.log(
      `✅ User enrolled: ${email} via ${platform} | auth_id: ${authUserId} | magic_link: ${magicLinkUrl ? "yes" : "no"}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        user_id: data.id,
        email,
        magic_link_url: magicLinkUrl,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
