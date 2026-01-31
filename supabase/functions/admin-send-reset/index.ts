// supabase/functions/admin-send-reset/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const APP_URL = Deno.env.get("APP_URL") || undefined;

  const token = getBearerToken(req);
  if (!token) return json(401, { error: "Missing bearer token" });

  // verify actor session
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: "Invalid session" });

  const actorId = userData.user.id;

  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const targetUserId = body?.target_user_id as string | undefined; // optional, tapi recommended

  if (!email) return json(400, { error: "email is required" });

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  // role actor must be super_admin
  const { data: actorProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("user_id", actorId)
    .single();

  if (actorProfile?.role !== "super_admin") return json(403, { error: "Forbidden" });

  // kalau ada target_user_id, kita cek target role supaya super_admin gak bisa reset super_admin
  if (targetUserId) {
    const { data: targetProfile, error: tErr } = await adminClient
      .from("profiles")
      .select("role")
      .eq("user_id", targetUserId)
      .single();

    if (tErr) return json(404, { error: "Target not found" });
    if (targetProfile?.role === "super_admin") {
      return json(403, { error: "Cannot manage super_admin" });
    }
  }

  // Trigger built-in Supabase reset email
  const { error: resetErr } = await adminClient.auth.resetPasswordForEmail(email, {
    redirectTo: APP_URL ? `${APP_URL}#/reset-password` : undefined,
  });

  if (resetErr) return json(500, { error: "Failed to send reset email" });

  // audit log
  if (targetUserId) {
    await adminClient.from("admin_audit_logs").insert({
      actor_id: actorId,
      target_id: targetUserId,
      action: "SEND_RESET",
      meta: { email },
    });
  }

  return json(200, { ok: true });
});
