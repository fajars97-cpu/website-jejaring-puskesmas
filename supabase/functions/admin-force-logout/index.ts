// supabase/functions/admin-force-logout/index.ts
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

  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
    return json(500, { error: "Missing env secrets" });
  }

  const token = getBearerToken(req);
  if (!token) return json(401, { error: "Missing bearer token" });

  // Client untuk verifikasi user (pakai anon key + JWT dari user)
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: "Invalid session" });

  const actorId = userData.user.id;

  const body = await req.json().catch(() => null);
  const targetUserId = body?.target_user_id as string | undefined;
  if (!targetUserId) return json(400, { error: "target_user_id is required" });

  // Service client untuk admin ops
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  // cek role actor
  const { data: actorProfile, error: actorProfileErr } = await adminClient
    .from("profiles")
    .select("role")
    .eq("user_id", actorId)
    .single();

  if (actorProfileErr) return json(500, { error: "Failed to read actor profile" });
  if (actorProfile?.role !== "super_admin") return json(403, { error: "Forbidden" });

  // cek role target
  const { data: targetProfile, error: targetProfileErr } = await adminClient
    .from("profiles")
    .select("role")
    .eq("user_id", targetUserId)
    .single();

  if (targetProfileErr) return json(404, { error: "Target not found" });
  if (targetProfile?.role === "super_admin") {
    return json(403, { error: "Cannot manage super_admin" });
  }

  // FORCE LOGOUT (sign out all sessions)
  const { error: signoutErr } = await adminClient.auth.admin.signOut(targetUserId);
  if (signoutErr) return json(500, { error: "Failed to sign out target user" });

  // audit log
  await adminClient.from("admin_audit_logs").insert({
    actor_id: actorId,
    target_id: targetUserId,
    action: "FORCE_LOGOUT",
    meta: {},
  });

  return json(200, { ok: true });
});
