// admin-api — REST API for the admin dashboard
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://genylab.ingresarios.net',
  'http://localhost:5173',
  'http://localhost:4173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-admin-secret",
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TOTAL_ACTIVITIES = 7;
const SITE_URL = "https://genylab.ingresarios.net";

const LEADCONNECTOR_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/9354f7a9-2c5f-4ad8-99b9-cd8714874ca5";

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  if (cleaned.startsWith("+52") && !cleaned.startsWith("+521")) {
    return "+521" + cleaned.slice(3);
  }
  return cleaned;
}

const DEFAULT_AVATAR = "/avatars/avatar_bull.png";

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

// Busca un usuario de auth por email recorriendo la paginación de listUsers
async function findAuthUserByEmail(supabase: any, email: string): Promise<string | null> {
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data?.users || data.users.length === 0) {
      break;
    }
    const found = data.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      return found.id;
    }
    if (data.users.length < perPage) {
      break;
    }
    page++;
  }
  return null;
}

async function createAuthUserAndMagicLink(
  supabase: any,
  email: string,
  name: string
): Promise<{ authUserId: string | null; magicLinkUrl: string | null }> {
  try {
    const existingId = await findAuthUserByEmail(supabase, email);

    let authUserId: string;

    if (existingId) {
      authUserId = existingId;
    } else {
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

    let magicLinkUrl = linkData?.properties?.action_link || null;
    return { authUserId, magicLinkUrl };
  } catch (err) {
    console.error("Auth/magic link error:", err);
    return { authUserId: null, magicLinkUrl: null };
  }
}

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
      `📤 LeadConnector: ${res.status} for ${email} (phone: ${normalizedPhone})`
    );
  } catch (err) {
    console.error("LeadConnector error:", err);
  }
}

const N8N_WEBHOOK_URL = "https://n8n.srv979105.hstgr.cloud/webhook/41e30e1a-bbe8-4996-b328-e4ff2c1b8da5";

// Envía datos al webhook de n8n
async function sendToN8n(opts: {
  name: string;
  email: string;
  phone: string;
  magicLinkUrl?: string | null;
  platform?: string;
  amount?: number | null;
  currency?: string;
  countryName?: string;
}) {
  try {
    const payload = {
      name: opts.name,
      email: opts.email.toLowerCase().trim(),
      phone: normalizePhone(opts.phone),
      magic_link_url: opts.magicLinkUrl || null,
      platform: opts.platform || "manual",
      amount: opts.amount || null,
      currency: opts.currency || null,
      country_name: opts.countryName || null,
      status: "active",
      timestamp: new Date().toISOString()
    };

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(
      `📤 n8n webhook (admin): ${res.status} for ${opts.email} (platform: ${payload.platform})`
    );
  } catch (err) {
    console.error("n8n webhook (admin) error:", err);
  }
}

// json() and unauthorized() are defined inside the handler to access per-request CORS headers

// Verify admin token: check against session_token stored in DB with expiration
async function verifyAdminToken(
  supabase: any,
  token: string
): Promise<{ valid: boolean; adminId?: string; role?: string }> {
  try {
    if (!token || token.length < 32) return { valid: false };

    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, role, is_active, session_expires_at")
      .eq("session_token", token)
      .eq("is_active", true)
      .single();

    if (!admin) return { valid: false };

    // Check expiration
    if (admin.session_expires_at && new Date(admin.session_expires_at) < new Date()) {
      // Token expired — clear it
      await supabase
        .from("admin_users")
        .update({ session_token: null, session_expires_at: null })
        .eq("id", admin.id);
      return { valid: false };
    }

    return { valid: true, adminId: admin.id, role: admin.role };
  } catch {
    return { valid: false };
  }
}

// Generate a cryptographically random session token
function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  function unauthorized() {
    return json({ error: "Unauthorized" }, 401);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "content-type, x-admin-secret, authorization, apikey, x-client-info",
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/admin-api\/?/, "").replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);
  const method = req.method;

  const supabase = createClient(supabaseUrl, serviceKey);

  // ── AUTH ENDPOINT (no token needed) ──
  if (segments[0] === "auth" && method === "POST") {
    try {
      const body = await req.json();
      const { username, password } = body;

      if (!username || !password) {
        return json({ error: "Username and password required" }, 400);
      }

      // Verify credentials against admin_users table using pgcrypto
      const { data: admin, error } = await supabase.rpc("verify_admin_login", {
        p_username: username.toLowerCase().trim(),
        p_password: password,
      });

      // Fallback: direct query if RPC doesn't exist yet
      if (error) {
        // Use direct SQL approach
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("*")
          .eq("username", username.toLowerCase().trim())
          .eq("is_active", true)
          .single();

        if (!adminUser) {
          return json({ error: "Credenciales incorrectas" }, 403);
        }

        // Verify password using SQL function
        const { data: pwCheck } = await supabase.rpc("check_admin_password", {
          p_user_id: adminUser.id,
          p_password: password,
        });

        if (!pwCheck) {
          return json({ error: "Credenciales incorrectas" }, 403);
        }

        // Generate secure session token with 24h expiration
        const token = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from("admin_users")
          .update({ session_token: token, session_expires_at: expiresAt })
          .eq("id", adminUser.id);

        return json({
          success: true,
          token,
          admin: {
            id: adminUser.id,
            username: adminUser.username,
            display_name: adminUser.display_name,
            role: adminUser.role,
          },
        });
      }

      if (!admin || admin.length === 0) {
        return json({ error: "Credenciales incorrectas" }, 403);
      }

      const adminUser = Array.isArray(admin) ? admin[0] : admin;
      // Generate secure session token with 24h expiration
      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("admin_users")
        .update({ session_token: token, session_expires_at: expiresAt })
        .eq("id", adminUser.id);

      return json({
        success: true,
        token,
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          display_name: adminUser.display_name,
          role: adminUser.role,
        },
      });
    } catch (err) {
      console.error("Auth error:", err);
      return json({ error: "Error de autenticación" }, 500);
    }
  }

  // ── PUBLIC RESULTS ENDPOINT (no token needed) ──
  if (segments[0] === "public-results" && method === "GET" && segments.length === 2) {
    const userId = segments[1];
    
    // Fetch user and activities using service_role key
    // Security: only return name and country — no email/phone (PII)
    const { data: user, error: userError } = await supabase
      .from("enrolled_users")
      .select("id, name, country_name, created_at, status")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return json({ error: "User not found" }, 404);
    }

    const { data: activities, error: actError } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (actError) {
      return json({ error: "Failed to load activities" }, 500);
    }

    return json({ user, activities });
  }

  // ── PUBLIC SETTINGS ENDPOINT (no token needed) ──
  if (segments[0] === "site-settings" && method === "GET" && segments.length === 2) {
    const key = segments[1];
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (error || !data) return json({ error: "Setting not found" }, 404);
    return json(data.value);
  }

  // All other endpoints require auth
  const token = req.headers.get("x-admin-secret");
  if (!token) return unauthorized();

  const { valid, adminId, role } = await verifyAdminToken(supabase, token);
  if (!valid) return unauthorized();

  try {
    // ── SITE SETTINGS (admin) ──
    if (segments[0] === "site-settings" && segments.length === 2) {
      const key = segments[1];

      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("site_settings")
          .upsert({ key, value: body, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ success: true, data });
      }
    }

    // ── STATS ──
    if (segments[0] === "stats" && method === "GET") {
      const [usersRes, activityRes, recentRes] = await Promise.all([
        supabase
          .from("enrolled_users")
          .select("id, status, payment_method, created_at"),
        supabase
          .from("user_activity_log")
          .select("activity_id, completed_at"),
        supabase
          .from("enrolled_users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const users = usersRes.data || [];
      const activities = activityRes.data || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const paymentDist: Record<string, number> = {};
      users.forEach((u: any) => {
        const key = u.payment_method || "unknown";
        paymentDist[key] = (paymentDist[key] || 0) + 1;
      });

      const activityDist: Record<string, number> = {};
      activities.forEach((a: any) => {
        activityDist[a.activity_id] = (activityDist[a.activity_id] || 0) + 1;
      });

      const { data: allLogs } = await supabase
        .from("user_activity_log")
        .select("user_id, activity_id");
      const userActSets: Record<string, Set<string>> = {};
      (allLogs || []).forEach((a: any) => {
        if (!userActSets[a.user_id]) userActSets[a.user_id] = new Set();
        userActSets[a.user_id].add(a.activity_id);
      });
      const hotUsers = Object.values(userActSets).filter(
        (s) => s.size >= TOTAL_ACTIVITIES
      ).length;

      return json({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === "active").length,
        usersThisWeek: users.filter(
          (u: any) => new Date(u.created_at) >= weekAgo
        ).length,
        usersThisMonth: users.filter(
          (u: any) => new Date(u.created_at) >= monthAgo
        ).length,
        hotUsers,
        paymentDistribution: paymentDist,
        activityDistribution: activityDist,
        totalActivities: activities.length,
        recentUsers: recentRes.data || [],
      });
    }

    // ── ANALYTICS ──
    if (segments[0] === "analytics") {
      if (method === "GET" && segments.length === 1) {
        const [visitsRes, usersRes] = await Promise.all([
          supabase
            .from("page_visits")
            .select("page_path, visitor_id, ip_country, created_at"),
          supabase
            .from("enrolled_users")
            .select("id, name, email, lead_source, status, created_at")
        ]);

        if (visitsRes.error) return json({ error: visitsRes.error.message }, 500);
        if (usersRes.error) return json({ error: usersRes.error.message }, 500);

        const visits = visitsRes.data || [];
        const enrolled = usersRes.data || [];

        // Group unique visits by path
        const uniqueVisitsByPath: Record<string, Set<string>> = {};
        visits.forEach((v: any) => {
          const path = v.page_path === "/landing" ? "/landing" : "/";
          if (!uniqueVisitsByPath[path]) {
            uniqueVisitsByPath[path] = new Set();
          }
          uniqueVisitsByPath[path].add(v.visitor_id);
        });

        // Filter to relevant lead sources
        const salesPageLeads = enrolled.filter((u: any) => u.lead_source === "sales_page");
        const landingPageLeads = enrolled.filter((u: any) => u.lead_source === "landing_page");

        const stats = {
          salesPage: {
            visits: uniqueVisitsByPath["/"]?.size || 0,
            leads: salesPageLeads.length,
            conversions: salesPageLeads.filter((u: any) => u.status === "active").length,
          },
          landingPage: {
            visits: uniqueVisitsByPath["/landing"]?.size || 0,
            leads: landingPageLeads.length,
            conversions: landingPageLeads.filter((u: any) => u.status === "active").length,
          }
        };

        return json({ stats, rawVisitsCount: visits.length });
      }

      if (method === "POST" && segments.length === 2 && segments[1] === "reset") {
        const [visitsDel, leadsDel, usersUpdate] = await Promise.all([
          supabase
            .from("page_visits")
            .delete()
            .gte("created_at", "1970-01-01T00:00:00Z"),
          supabase
            .from("enrolled_users")
            .delete()
            .eq("status", "lead"),
          supabase
            .from("enrolled_users")
            .update({ lead_source: null })
            .eq("status", "active")
        ]);

        if (visitsDel.error) return json({ error: visitsDel.error.message }, 500);
        if (leadsDel.error) return json({ error: leadsDel.error.message }, 500);
        if (usersUpdate.error) return json({ error: usersUpdate.error.message }, 500);

        return json({ success: true, message: "Métricas reiniciadas con éxito" });
      }
    }

    // ── USERS ──
    if (segments[0] === "users") {
      if (method === "GET" && segments.length === 1) {
        let query = supabase
          .from("enrolled_users")
          .select("*")
          .order("created_at", { ascending: false });

        const status = url.searchParams.get("status");
        if (status) {
          query = query.eq("status", status);
        } else {
          query = query.neq("status", "lead");
        }

        const payment = url.searchParams.get("payment_method");
        if (payment) query = query.eq("payment_method", payment);

        const search = url.searchParams.get("search");
        if (search) {
          // Security: escape PostgREST special chars to prevent filter injection
          const safe = search.replace(/[%,*()\\]/g, "").slice(0, 100);
          if (safe) {
            query = query.or(
              `name.ilike.%${safe}%,email.ilike.%${safe}%`
            );
          }
        }

        const activity = url.searchParams.get("activity");
        if (activity) {
          const { data: actUsers } = await supabase
            .from("user_activity_log")
            .select("user_id")
            .eq("activity_id", activity);
          const ids = (actUsers || []).map((a: any) => a.user_id);
          if (ids.length > 0) {
            query = query.in("id", ids);
          } else {
            return json({ data: [], count: 0 });
          }
        }

        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) return json({ error: error.message }, 500);

        const userIds = (data || []).map((u: any) => u.id);
        const { data: actLogs } = await supabase
          .from("user_activity_log")
          .select("user_id, activity_id")
          .in("user_id", userIds);

        const actMap: Record<string, string[]> = {};
        (actLogs || []).forEach((a: any) => {
          if (!actMap[a.user_id]) actMap[a.user_id] = [];
          if (!actMap[a.user_id].includes(a.activity_id))
            actMap[a.user_id].push(a.activity_id);
        });

        const enriched = (data || []).map((u: any) => {
          const acts = actMap[u.id] || [];
          return {
            ...u,
            completed_activities: acts,
            activity_count: acts.length,
            is_hot: acts.length >= TOTAL_ACTIVITIES,
          };
        });

        const hotFilter = url.searchParams.get("hot");
        const filtered =
          hotFilter === "true"
            ? enriched.filter((u: any) => u.is_hot)
            : enriched;

        return json({ data: filtered, count: filtered.length });
      }

      // GET /users/:id — retrieve single user details
      if (method === "GET" && segments.length === 2) {
        const userId = segments[1];
        const { data, error } = await supabase
          .from("enrolled_users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error retrieving user:", error);
          return json({ error: error.message }, 404);
        }
        return json({ data });
      }

      // POST /users — create manual user
      if (method === "POST" && segments.length === 1) {
        const body = await req.json();
        const { name, email, phone, payment_method, payment_amount, notes } =
          body;
        if (!name || !email)
          return json({ error: "Name and email required" }, 400);

        const normalizedPhone = normalizePhone(phone || "");

        // Generate a permanent access code
        const accessCode = crypto.randomUUID().replace(/-/g, '');
        const permanentUrl = `${SITE_URL}/acceso/${accessCode}`;

        const { authUserId, magicLinkUrl } = await createAuthUserAndMagicLink(
          supabase,
          email,
          name
        );

        const { data, error } = await supabase
          .from("enrolled_users")
          .insert({
            name,
            email: email.toLowerCase().trim(),
            phone: normalizedPhone || null,
            payment_method: payment_method || "efectivo",
            payment_amount: payment_amount || null,
            notes: notes || null,
            status: "active",
            auth_user_id: authUserId || null,
            magic_link_url: permanentUrl,
            access_code: accessCode,
            country_name: countryFromPhone(normalizedPhone) || null,
            avatar_url: DEFAULT_AVATAR,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505")
            return json({ error: "Email already exists" }, 409);
          return json({ error: error.message }, 500);
        }

        sendToLeadConnector(name, email, normalizedPhone, permanentUrl);

        sendToN8n({
          name,
          email,
          phone: normalizedPhone,
          magicLinkUrl: permanentUrl,
          platform: payment_method || "manual",
          amount: payment_amount,
          countryName: countryFromPhone(normalizedPhone) || null
        });

        return json({ data, magic_link_url: permanentUrl }, 201);
      }

      // POST /users/:id/resend-magic-link
      if (
        method === "POST" &&
        segments.length === 3 &&
        segments[2] === "resend-magic-link"
      ) {
        const userId = segments[1];
        const { data: user, error: userError } = await supabase
          .from("enrolled_users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userError || !user) return json({ error: "User not found" }, 404);

        const { authUserId, magicLinkUrl } = await createAuthUserAndMagicLink(
          supabase,
          user.email,
          user.name
        );

        if (magicLinkUrl) {
          // Always generate a fresh access code when regenerating
          const accessCode = crypto.randomUUID().replace(/-/g, '');
          const permanentUrl = `${SITE_URL}/acceso/${accessCode}`;

          await supabase
            .from("enrolled_users")
            .update({
              magic_link_url: permanentUrl,
              access_code: accessCode,
              auth_user_id: authUserId || user.auth_user_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          // Automatically sync the new magic link to the CRM
          sendToLeadConnector(
            user.name,
            user.email,
            user.phone || "",
            permanentUrl
          );

          return json({ success: true, magic_link_url: permanentUrl });
        }

        return json({ success: true, magic_link_url: user.magic_link_url });
      }


      // GET /users/:id/activity
      if (
        method === "GET" &&
        segments.length === 3 &&
        segments[2] === "activity"
      ) {
        const userId = segments[1];
        const { data, error } = await supabase
          .from("user_activity_log")
          .select("*")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      // PATCH /users/:id
      if (method === "PATCH" && segments.length === 2) {
        const userId = segments[1];
        const body = await req.json();
        
        if (body.phone !== undefined) {
          body.phone = body.phone ? normalizePhone(body.phone) : null;
        }

        // If promoting to active, check if we need to provision auth
        const isPromoting = body.status === "active";
        let provisionedAuth = false;

        if (isPromoting) {
          // Fetch current user to check if auth already exists
          const { data: currentUser } = await supabase
            .from("enrolled_users")
            .select("email, name, auth_user_id, access_code, status")
            .eq("id", userId)
            .single();

          if (currentUser && !currentUser.auth_user_id) {
            // Create auth user + magic link
            const { authUserId, magicLinkUrl } = await createAuthUserAndMagicLink(
              supabase,
              currentUser.email,
              currentUser.name || "Sin nombre"
            );

            // Generate permanent access code
            const accessCode = currentUser.access_code || crypto.randomUUID().replace(/-/g, '');
            const permanentUrl = `${SITE_URL}/acceso/${accessCode}`;

            body.auth_user_id = authUserId || null;
            body.magic_link_url = permanentUrl;
            body.access_code = accessCode;
            provisionedAuth = true;

            console.log(`🔑 Auto-provisioned auth for ${currentUser.email}: auth_id=${authUserId}`);
          }
        }

        const { data, error } = await supabase
          .from("enrolled_users")
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq("id", userId)
          .select()
          .single();

        if (error) return json({ error: error.message }, 500);

        // Auto-sync with CRM when user is modified
        sendToLeadConnector(
          data.name,
          data.email,
          data.phone || "",
          data.magic_link_url
        );

        if (isPromoting) {
          sendToN8n({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            magicLinkUrl: data.magic_link_url,
            platform: data.payment_platform || data.payment_method || "manual",
            amount: data.payment_amount,
            countryName: data.country_name || null
          });
        }

        return json({ data, auth_provisioned: provisionedAuth });
      }

      // DELETE /users/:id
      if (method === "DELETE" && segments.length === 2) {
        const userId = segments[1];
        const { error } = await supabase
          .from("enrolled_users")
          .delete()
          .eq("id", userId);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
    }

    // ── ADMIN USERS MANAGEMENT ──
    if (segments[0] === "admins") {
      // Only superadmin can manage admin users
      if (role !== "superadmin") {
        return json({ error: "Solo superadmin puede gestionar administradores" }, 403);
      }

      // GET /admins — list all admin users
      if (method === "GET" && segments.length === 1) {
        const { data, error } = await supabase
          .from("admin_users")
          .select("id, username, display_name, role, is_active, created_at")
          .order("created_at", { ascending: true });
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      // POST /admins — create new admin user
      if (method === "POST" && segments.length === 1) {
        const body = await req.json();
        const { username, password, display_name, admin_role } = body;
        if (!username || !password)
          return json({ error: "Username and password required" }, 400);

        // Hash password using pgcrypto via SQL
        const { data, error } = await supabase.rpc("create_admin_user", {
          p_username: username.toLowerCase().trim(),
          p_password: password,
          p_display_name: display_name || username,
          p_role: admin_role || "admin",
        });

        if (error) {
          if (error.message?.includes("duplicate") || error.message?.includes("unique"))
            return json({ error: "El usuario ya existe" }, 409);
          return json({ error: error.message }, 500);
        }

        return json({ data }, 201);
      }

      // PATCH /admins/:id — update admin user
      if (method === "PATCH" && segments.length === 2) {
        const targetId = segments[1];
        const body = await req.json();

        // If password is being changed, hash it
        if (body.password) {
          const { error } = await supabase.rpc("update_admin_password", {
            p_user_id: targetId,
            p_password: body.password,
          });
          if (error) return json({ error: error.message }, 500);
          delete body.password;
        }

        // Update other fields
        if (Object.keys(body).length > 0) {
          const updateObj: any = { ...body, updated_at: new Date().toISOString() };
          // Only allow safe fields
          const safeFields = ["display_name", "role", "is_active", "updated_at"];
          const cleanUpdate: any = {};
          for (const key of safeFields) {
            if (updateObj[key] !== undefined) cleanUpdate[key] = updateObj[key];
          }

          if (Object.keys(cleanUpdate).length > 0) {
            const { error } = await supabase
              .from("admin_users")
              .update(cleanUpdate)
              .eq("id", targetId);
            if (error) return json({ error: error.message }, 500);
          }
        }

        // Return updated admin
        const { data } = await supabase
          .from("admin_users")
          .select("id, username, display_name, role, is_active, created_at")
          .eq("id", targetId)
          .single();

        return json({ data });
      }

      // DELETE /admins/:id — delete admin user
      if (method === "DELETE" && segments.length === 2) {
        const targetId = segments[1];
        // Prevent deleting yourself
        if (targetId === adminId) {
          return json({ error: "No puedes eliminarte a ti mismo" }, 400);
        }
        const { error } = await supabase
          .from("admin_users")
          .delete()
          .eq("id", targetId);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
    }

    // ── WEBHOOKS ──
    if (segments[0] === "webhooks") {
      if (method === "GET" && segments.length === 1) {
        const { data, error } = await supabase
          .from("admin_webhooks")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      if (method === "POST" && segments.length === 1) {
        const body = await req.json();
        const { data, error } = await supabase
          .from("admin_webhooks")
          .insert({
            name: body.name,
            url: body.url,
            events: body.events || [],
            is_active: body.is_active ?? true,
            secret: body.secret || null,
          })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 201);
      }

      if (
        method === "GET" &&
        segments.length === 3 &&
        segments[2] === "deliveries"
      ) {
        const webhookId = segments[1];
        const { data, error } = await supabase
          .from("webhook_delivery_log")
          .select("*")
          .eq("webhook_id", webhookId)
          .order("delivered_at", { ascending: false })
          .limit(20);
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      if (
        method === "POST" &&
        segments.length === 3 &&
        segments[2] === "test"
      ) {
        const webhookId = segments[1];
        
        const { data: wh, error: whErr } = await supabase
          .from("admin_webhooks")
          .select("*")
          .eq("id", webhookId)
          .single();
          
        if (whErr || !wh) return json({ error: "Webhook not found" }, 404);

        const activityName = wh.events && wh.events.length > 0 ? (wh.events[0] === 'all' ? 'adn' : wh.events[0]) : "actividad_prueba";
        const testPayload = {
          event: "test_connection",
          user: {
            name: "Usuario de Prueba",
            email: "prueba@genylab.com",
          },
          activity: activityName,
          timestamp: new Date().toISOString(),
          is_test: true,
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (wh.secret) headers["x-webhook-secret"] = wh.secret;

        try {
          const res = await fetch(wh.url, {
            method: "POST",
            headers,
            body: JSON.stringify(testPayload),
          });

          const success = res.ok;
          const status = res.status;

          await supabase.from("webhook_delivery_log").insert({
            webhook_id: wh.id,
            event: "test_connection",
            payload: testPayload,
            response_status: status,
            success,
          });

          return json({ success, status });
        } catch (e: any) {
          await supabase.from("webhook_delivery_log").insert({
            webhook_id: wh.id,
            event: "test_connection",
            payload: testPayload,
            response_status: 500,
            success: false,
            error_message: e.message,
          });

          return json({ success: false, error: e.message }, 500);
        }
      }

      if (method === "PATCH" && segments.length === 2) {
        const whId = segments[1];
        const body = await req.json();
        // Security: only allow known fields to be updated
        const allowed = ["name", "url", "events", "is_active", "secret"];
        const filtered: Record<string, any> = {};
        for (const key of allowed) {
          if (key in body) filtered[key] = body[key];
        }
        const { data, error } = await supabase
          .from("admin_webhooks")
          .update(filtered)
          .eq("id", whId)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      if (method === "DELETE" && segments.length === 2) {
        const whId = segments[1];
        const { error } = await supabase
          .from("admin_webhooks")
          .delete()
          .eq("id", whId);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Admin API error:", err);
    // Security: don't expose error details to client
    return json({ error: "Internal error" }, 500);
  }
});
