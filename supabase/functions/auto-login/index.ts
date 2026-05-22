// auto-login — Validates an access code and generates a fresh magic link
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://genylab.ingresarios.net";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Invalid access code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up user by access_code
    const { data: user, error: lookupError } = await supabase
      .from("enrolled_users")
      .select("id, email, name, auth_user_id, status")
      .eq("access_code", code)
      .single();

    if (lookupError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid access code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (user.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Account is not active" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure auth user exists
    let authUserId = user.auth_user_id;

    if (!authUserId) {
      // Create auth user if missing
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: user.email.toLowerCase().trim(),
        email_confirm: true,
        user_metadata: { name: user.name },
      });

      if (createErr) {
        // User might already exist in auth but not linked
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = (existingUsers?.users || []).find(
          (u: any) => u.email?.toLowerCase() === user.email.toLowerCase()
        );
        if (existing) {
          authUserId = existing.id;
          // Link it
          await supabase
            .from("enrolled_users")
            .update({ auth_user_id: existing.id })
            .eq("id", user.id);
        } else {
          console.error("Failed to create auth user:", createErr);
          return new Response(
            JSON.stringify({ error: "Could not create auth session" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        authUserId = newUser.user.id;
        await supabase
          .from("enrolled_users")
          .update({ auth_user_id: authUserId })
          .eq("id", user.id);
      }
    }

    // Generate a fresh magic link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email.toLowerCase().trim(),
      options: { redirectTo: `${SITE_URL}/app` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Magic link generation error:", linkError);
      return new Response(
        JSON.stringify({ error: "Could not generate login link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ action_link: linkData.properties.action_link }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Auto-login error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
