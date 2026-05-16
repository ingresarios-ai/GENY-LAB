// admin-api — REST API for the admin dashboard
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TOTAL_ACTIVITIES = 7;

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

async function createAuthUserAndMagicLink(
  supabase: any,
  email: string,
  name: string
): Promise<{ authUserId: string | null; magicLinkUrl: string | null }> {
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = (existingUsers?.users || []).find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let authUserId: string;

    if (existing) {
      authUserId = existing.id;
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
      `\uD83D\uDCE4 LeadConnector: ${res.status} for ${email} (phone: ${normalizedPhone})`
    );
  } catch (err) {
    console.error("LeadConnector error:", err);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

// Verify admin token: token is "admin_id:username" base64 encoded
async function verifyAdminToken(
  supabase: any,
  token: string
): Promise<{ valid: boolean; adminId?: string; role?: string }> {
  try {
    const decoded = atob(token);
    const [adminId, username] = decoded.split(":");
    if (!adminId || !username) return { valid: false };

    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", adminId)
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (!admin) return { valid: false };
    return { valid: true, adminId: admin.id, role: admin.role };
  } catch {
    return { valid: false };
  }
}

Deno.serve(async (req: Request) => {
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

        const token = btoa(`${adminUser.id}:${adminUser.username}`);
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
      const token = btoa(`${adminUser.id}:${adminUser.username}`);
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

  // All other endpoints require auth
  const token = req.headers.get("x-admin-secret");
  if (!token) return unauthorized();

  const { valid, adminId, role } = await verifyAdminToken(supabase, token);
  if (!valid) return unauthorized();

  try {
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

    // ── USERS ──
    if (segments[0] === "users") {
      if (method === "GET" && segments.length === 1) {
        let query = supabase
          .from("enrolled_users")
          .select("*")
          .order("created_at", { ascending: false });

        const status = url.searchParams.get("status");
        if (status) query = query.eq("status", status);

        const payment = url.searchParams.get("payment_method");
        if (payment) query = query.eq("payment_method", payment);

        const search = url.searchParams.get("search");
        if (search)
          query = query.or(
            `name.ilike.%${search}%,email.ilike.%${search}%`
          );

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

      // POST /users — create manual user
      if (method === "POST" && segments.length === 1) {
        const body = await req.json();
        const { name, email, phone, payment_method, payment_amount, notes } =
          body;
        if (!name || !email)
          return json({ error: "Name and email required" }, 400);

        const normalizedPhone = normalizePhone(phone || "");

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
            magic_link_url: magicLinkUrl || null,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505")
            return json({ error: "Email already exists" }, 409);
          return json({ error: error.message }, 500);
        }

        sendToLeadConnector(name, email, normalizedPhone, magicLinkUrl);

        return json({ data, magic_link_url: magicLinkUrl }, 201);
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
          await supabase
            .from("enrolled_users")
            .update({
              magic_link_url: magicLinkUrl,
              auth_user_id: authUserId || user.auth_user_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }

        return json({ success: true, magic_link_url: magicLinkUrl });
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
        const { data, error } = await supabase
          .from("enrolled_users")
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq("id", userId)
          .select()
          .single();

        if (error) return json({ error: error.message }, 500);
        return json({ data });
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

      if (method === "PATCH" && segments.length === 2) {
        const whId = segments[1];
        const body = await req.json();
        const { data, error } = await supabase
          .from("admin_webhooks")
          .update(body)
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
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});
