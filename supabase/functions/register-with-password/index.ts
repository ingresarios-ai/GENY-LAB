// register-with-password — Validates invitation token, creates Supabase Auth user with password
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_AVATAR = "/avatars/avatar_bull.png";

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

Deno.serve(async (req: Request) => {
  // CORS preflight
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
    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token y contraseña son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Look up the invitation by token
    const { data: invitation, error: lookupError } = await supabase
      .from("invitations")
      .select("id, name, email, contact_id, status, expires_at")
      .eq("token", token)
      .single();

    if (lookupError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Token de invitación inválido" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate status
    if (invitation.status === "used") {
      return new Response(
        JSON.stringify({ error: "Esta invitación ya fue utilizada. Intenta iniciar sesión." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invitation.status === "expired") {
      return new Response(
        JSON.stringify({ error: "Esta invitación ha expirado. Contacta al soporte." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration date
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ error: "Esta invitación ha expirado. Contacta al soporte." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanEmail = invitation.email.toLowerCase().trim();
    const cleanName = invitation.name;

    // 3. Create or find Supabase Auth user
    let authUserId: string | null = null;

    // Check if user already exists in auth
    const existingId = await findAuthUserByEmail(supabase, cleanEmail);

    if (existingId) {
      // User already exists — update their password
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingId, {
        password: password,
        email_confirm: true,
        user_metadata: { name: cleanName, password_set: true },
      });

      if (updateError) {
        console.error("Error updating existing auth user:", updateError);
        return new Response(
          JSON.stringify({ error: "Error al actualizar la cuenta. Inténtalo de nuevo." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authUserId = existingId;
      console.log(`🔄 Updated existing auth user password: ${cleanEmail}`);
    } else {
      // Create new auth user with email + password
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { name: cleanName, password_set: true },
      });

      if (createError) {
        console.error("Error creating auth user:", createError);
        return new Response(
          JSON.stringify({ error: "Error al crear la cuenta. Inténtalo de nuevo." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authUserId = newUser.user.id;
      console.log(`✨ Created new auth user: ${cleanEmail}`);
    }

    // 4. Upsert in enrolled_users
    const { error: dbError } = await supabase
      .from("enrolled_users")
      .upsert(
        {
          name: cleanName,
          email: cleanEmail,
          payment_method: "ghl",
          payment_platform: "ghl",
          status: "active",
          auth_user_id: authUserId,
          avatar_url: DEFAULT_AVATAR,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database error enrolling user:", dbError);
      // Don't fail — auth user is already created, enrollment is secondary
    }

    // 5. Mark invitation as used
    const { error: markError } = await supabase
      .from("invitations")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (markError) {
      console.error("Error marking invitation as used:", markError);
      // Don't fail — user is already created
    }

    // 6. Generate session for auto-login
    const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: cleanEmail,
    });

    // Also sign in directly with email+password to get a proper session
    // We use the Supabase REST API to generate tokens
    const { data: sessionData, error: sessionError } = await (async () => {
      // Use the service role to sign in on behalf of the user
      // by creating a temporary client with anon key approach
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": Deno.env.get("SUPABASE_ANON_KEY") || serviceKey,
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Session generation error:", errorBody);
          return { data: null, error: { message: errorBody } };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    })();

    console.log(`✅ Registration complete: ${cleanEmail} | auth_id: ${authUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cuenta creada exitosamente",
        email: cleanEmail,
        session: sessionData || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("register-with-password Error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
