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
    if (typeof parsed?.isAdmin !== "boolean") return null;

    // cache valid 7 hari
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (parsed?.ts && Date.now() - parsed.ts > maxAgeMs) return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeAdminCache(uid, isAdmin) {
  try {
    localStorage.setItem(adminCacheKey(uid), JSON.stringify({ isAdmin, ts: Date.now() }));
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
  const [adminReady, setAdminReady] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [loading, setLoading] = useState(true);

  // guard anti race
  const seqRef = useRef(0);

  // IMPORTANT: untuk mencegah re-check admin saat tab focus / token refresh
  const lastUserIdRef = useRef(null);

  async function resolveIsAdmin(userId) {
    if (!userId) return { ok: false, err: "" };

    try {
      const ADMIN_TIMEOUT_MS = 15000;

      const q = supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      const { data, error } = await withTimeout(q, ADMIN_TIMEOUT_MS, "admin check timeout");
      if (error) return { ok: false, err: error.message || "admin check error" };
      return { ok: !!data, err: "" };
    } catch (e) {
      return { ok: false, err: e?.message || "admin check error" };
    }
  }

  // exposed: paksa cek admin ulang
  async function refreshAdminCheck() {
    if (!user?.id) return;
    const mySeq = ++seqRef.current;

    setAdminError("");
    setAdminReady(false);

    const cached = readAdminCache(user.id);
    if (cached?.isAdmin === true) {
      // optimistik: jangan drop akses saat recheck
      setIsAdmin(true);
      setAdminReady(true);
    }

    const res = await resolveIsAdmin(user.id);
    if (mySeq !== seqRef.current) return;

    // timeout/slow: jangan paksa non-admin
    if (String(res.err || "").toLowerCase().includes("timeout")) {
      setAdminError(res.err);
      setAdminReady(true);
      return;
    }

    setIsAdmin(res.ok);
    setAdminError(res.err || "");
    setAdminReady(true);

    if (res.ok) writeAdminCache(user.id, true);
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

    // signed out / no user
    if (!nextId) {
      lastUserIdRef.current = null;
      setIsAdmin(false);
      setAdminReady(true);
      return;
    }

    // ===== KEY CHANGE =====
    // Kalau userId sama dan tidak dipaksa, JANGAN re-check admin.
    if (!forceAdminCheck && lastUserIdRef.current === nextId) {
      // kita anggap status admin terakhir masih valid (cache/hasil sebelumnya)
      setAdminReady(true);
      return;
    }

    lastUserIdRef.current = nextId;

    // 1) optimistik dari cache
    const cached = readAdminCache(nextId);
    if (cached?.isAdmin === true) {
      setIsAdmin(true);
      setAdminReady(true);
    }

    // 2) validate sekali untuk user ini
    const res = await resolveIsAdmin(nextId);
    if (mySeq !== seqRef.current) return;

    if (String(res.err || "").toLowerCase().includes("timeout")) {
      setAdminError(res.err);
      setAdminReady(true);
      return;
    }

    setIsAdmin(res.ok);
    setAdminError(res.err || "");
    setAdminReady(true);

    if (res.ok) writeAdminCache(nextId, true);
    else clearAdminCache(nextId);
  }

  useEffect(() => {
    let mounted = true;

    // fail-safe agar UI tidak nyangkut lama
    const failSafeTimer = setTimeout(() => {
      if (!mounted) return;
      setAdminReady((v) => (v ? v : true));
      setLoading((v) => (v ? false : v));
      setAdminError((v) => v || "verification slow");
    }, 8000);

    async function init() {
      setLoading(true);
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

        await applySession(data.session, { forceAdminCheck: true }); // init cek sekali
      } catch (e) {
        if (!mounted) return;
        setAdminReady(true);
        setAdminError((prev) => prev || (e?.message || "init failed"));
      } finally {
        if (mounted) setLoading(false);
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
        setAdminReady(true);
        setAdminError("");
        setLoading(false);
        return;
      }

      // TOKEN_REFRESHED / SIGNED_IN / USER_UPDATED dll:
      // hanya re-check admin kalau userId berubah
      setLoading(true);
      try {
        await applySession(newSession, { forceAdminCheck: event === "SIGNED_IN" });
      } catch (e) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // jangan banting ke non-admin kalau event cuma refresh
        setAdminReady(true);
        setAdminError(e?.message || "applySession error");
      } finally {
        if (mounted) setLoading(false);
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
    return supabase.auth.signInWithPassword({ email, password });
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
      setAdminReady(true);
      setAdminError("");
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      adminReady,
      adminError,
      loading,
      signIn,
      signOut,
      refreshAdminCheck,
    }),
    [session, user, isAdmin, adminReady, adminError, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
