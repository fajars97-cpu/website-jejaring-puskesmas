// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

async function withTimeout(promise, ms, label = "timeout") {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

function adminCacheKey(uid) {
  return `jp_admin_cache:${uid}`;
}

function readAdminCache(uid) {
  try {
    const raw = localStorage.getItem(adminCacheKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (typeof parsed?.isAdmin !== "boolean" && typeof parsed?.role !== "string")) return null;

    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 hari
    if (parsed?.ts && Date.now() - parsed.ts > maxAgeMs) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeAdminCache(uid, { isAdmin, isSuperAdmin, role }) {
  try {
    localStorage.setItem(
      adminCacheKey(uid),
      JSON.stringify({ isAdmin: !!isAdmin, isSuperAdmin: !!isSuperAdmin, role: role || "", ts: Date.now() })
    );
  } catch {}
}

function clearAdminCache(uid) {
  try {
    localStorage.removeItem(adminCacheKey(uid));
  } catch {}
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState("");
  const [adminReady, setAdminReady] = useState(false);
  const [adminError, setAdminError] = useState("");

  // loading: hanya untuk "restore awal" / "proses login" yang memang layak blocking
  const [loading, setLoading] = useState(true);

  // UX: restoring = true hanya saat app baru load dan memulihkan session pertama kali
  const [restoring, setRestoring] = useState(true);

  // optional: indikator sync background (tidak dipakai guard)
  const [bgSyncing, setBgSyncing] = useState(false);

  const seqRef = useRef(0);
  const lastUserIdRef = useRef(null);

  async function resolveRoleAndAdmin(userId) {
    if (!userId) return { ok: false, err: "" };

    try {
      const ADMIN_TIMEOUT_MS = 15000;

      // 1) Prefer: profiles.role (super_admin / admin / pemohon)
      // NOTE: sebagian schema pakai profiles.id, sebagian pakai profiles.user_id
      // Coba id dulu (paling umum), fallback user_id supaya nggak break.
      const qRoleById = supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      let roleRes = await withTimeout(qRoleById, ADMIN_TIMEOUT_MS, "admin check timeout");

      // kalau tidak ada row/role dan tidak error -> coba fallback user_id
      const foundRoleById = (roleRes?.data?.role || "").trim();
      if (!roleRes?.error && !foundRoleById) {
        const qRoleByUserId = supabase
          .from("profiles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        roleRes = await withTimeout(qRoleByUserId, ADMIN_TIMEOUT_MS, "admin check timeout");
      }

      if (roleRes?.error) {
        return { ok: false, err: roleRes.error.message || "admin check error", role: "", isSuper: false };
      }

      const foundRole = (roleRes?.data?.role || "").trim();
      if (foundRole) {
        const isSuper = foundRole === "super_admin";
        const isAdm = foundRole === "admin" || foundRole === "super_admin";
        return { ok: isAdm, err: "", role: foundRole, isSuper };
      }

      // 2) Fallback legacy: admin_users (biar admin lama tetap jalan)
      const qLegacy = supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      const legacyRes = await withTimeout(qLegacy, ADMIN_TIMEOUT_MS, "admin check timeout");
      if (legacyRes?.error) return { ok: false, err: legacyRes.error.message || "admin check error", role: "", isSuper: false };
      return { ok: !!legacyRes?.data, err: "", role: legacyRes?.data ? "admin" : "pemohon", isSuper: false };
    } catch (e) {
      return { ok: false, err: e?.message || "admin check error", role: "", isSuper: false };
    }
  }

  async function refreshAdminCheck() {
    if (!user?.id) return;
    const mySeq = ++seqRef.current;

    setAdminError("");
    setAdminReady(false);

    const cached = readAdminCache(user.id);
    if (cached?.isAdmin === true) {
      setIsAdmin(true);
      setIsSuperAdmin(!!cached?.isSuperAdmin);
      setRole(cached?.role || "");
      setAdminReady(true);
    }

    const res = await resolveRoleAndAdmin(user.id);
    if (mySeq !== seqRef.current) return;

    if (String(res.err || "").toLowerCase().includes("timeout")) {
      setAdminError(res.err);
      setAdminReady(true);
      return;
    }

    setIsAdmin(!!res.ok);
    setIsSuperAdmin(!!res.isSuper);
    setRole(res.role || "");
    setAdminError(res.err || "");
    setAdminReady(true);

    if (res.ok) writeAdminCache(user.id, { isAdmin: true, isSuperAdmin: !!res.isSuper, role: res.role || "" });
    else clearAdminCache(user.id);
  }

  async function applySession(newSession, { forceAdminCheck = false } = {}) {
    const mySeq = ++seqRef.current;

    setSession(newSession);
    const nextUser = newSession?.user ?? null;
    setUser(nextUser);

    setAdminError("");
    setAdminReady(false);

    const nextId = nextUser?.id ?? null;

    if (!nextId) {
      lastUserIdRef.current = null;
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRole("");
      setAdminReady(true);
      return;
    }

    // Jangan re-check admin bila userId sama (kecuali dipaksa)
    if (!forceAdminCheck && lastUserIdRef.current === nextId) {
      setAdminReady(true);
      return;
    }

    lastUserIdRef.current = nextId;

    // Optimistik dari cache
    const cached = readAdminCache(nextId);
    if (cached?.isAdmin === true) {
      setIsAdmin(true);
      setIsSuperAdmin(!!cached?.isSuperAdmin);
      setRole(cached?.role || "");
      setAdminReady(true);
    }

    const res = await resolveRoleAndAdmin(nextId);
    if (mySeq !== seqRef.current) return;

    if (String(res.err || "").toLowerCase().includes("timeout")) {
      setAdminError(res.err);
      setAdminReady(true);
      return;
    }

    setIsAdmin(!!res.ok);
    setIsSuperAdmin(!!res.isSuper);
    setRole(res.role || "");
    setAdminError(res.err || "");
    setAdminReady(true);

    if (res.ok) writeAdminCache(nextId, { isAdmin: true, isSuperAdmin: !!res.isSuper, role: res.role || "" });
    else clearAdminCache(nextId);
  }

  function applySessionSoft(newSession) {
    setSession(newSession);
    setUser(newSession?.user ?? null);
  }

  useEffect(() => {
    let mounted = true;

    setRestoring(true);
    setLoading(true);

    const failSafeTimer = setTimeout(() => {
      if (!mounted) return;
      // jangan nyangkut
      setAdminReady((v) => (v ? v : true));
      setLoading((v) => (v ? false : v));
      setRestoring((v) => (v ? false : v));
      setAdminError((v) => v || "verification slow");
    }, 8000);

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAdminReady(true);
          setAdminError(error.message || "");
          return;
        }

        // init: cek admin sekali
        await applySession(data.session, { forceAdminCheck: true });
      } catch (e) {
        if (!mounted) return;
        setAdminReady(true);
        setAdminError((prev) => prev || (e?.message || "init failed"));
      } finally {
        if (!mounted) return;
        setLoading(false);
        setRestoring(false);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
  if (!mounted) return;

  if (event === "SIGNED_OUT") {
    const uid = user?.id;
    if (uid) clearAdminCache(uid);

    lastUserIdRef.current = null;
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setRole("");
    setAdminReady(true);
    setAdminError("");
    setLoading(false);
    setRestoring(false);
    setBgSyncing(false);
    return;
  }

  const nextId = newSession?.user?.id ?? null;
  const prevId = lastUserIdRef.current;

  // ✅ Background event + userId sama:
  // hanya update session/user secara soft (NO reset adminReady -> NO unmount -> form aman)
  const isBackground = event !== "SIGNED_IN";
  const sameUser = !!nextId && !!prevId && nextId === prevId;

  if (isBackground && sameUser) {
    setBgSyncing(true);
    try {
      applySessionSoft(newSession);
    } finally {
      if (!mounted) return;
      setBgSyncing(false);
      setRestoring(false);
    }
    return;
  }

  // Selain itu (login baru / user berubah) -> boleh verifikasi admin
  const isForegroundBlocking = event === "SIGNED_IN";

  if (isForegroundBlocking) setLoading(true);
  else setBgSyncing(true);

  try {
    await applySession(newSession, { forceAdminCheck: event === "SIGNED_IN" });
  } catch (e) {
    // kalau gagal, tetap jangan banting UI
    applySessionSoft(newSession);
    setAdminReady(true);
    setAdminError(e?.message || "applySession error");
  } finally {
    if (!mounted) return;
    if (isForegroundBlocking) setLoading(false);
    else setBgSyncing(false);
    setRestoring(false);
  }
});

    return () => {
      mounted = false;
      clearTimeout(failSafeTimer);
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email, password) {
    // login memang boleh blocking
    setLoading(true);
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } finally {
      const uid = user?.id;
      if (uid) clearAdminCache(uid);

      lastUserIdRef.current = null;
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRole("");
      setAdminReady(true);
      setAdminError("");
      setLoading(false);
      setRestoring(false);
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      isSuperAdmin,
      role,
      adminReady,
      adminError,
      loading,
      restoring,   // 👈 baru (dipakai guard)
      bgSyncing,   // 👈 opsional untuk indikator kecil
      signIn,
      signOut,
      refreshAdminCheck,
    }),
    [session, user, isAdmin, isSuperAdmin, role, adminReady, adminError, loading, restoring, bgSyncing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
