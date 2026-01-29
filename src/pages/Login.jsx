// src/pages/Login.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();

  const { user, isAdmin, loading, adminReady, signIn, signOut } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo = useMemo(() => {
    const from = location?.state?.from?.pathname;
    // kalau user datang dari page yang di-guard, balik ke sana
    if (from) return from;
    // default: admin -> /admin, pemohon -> /pemohon/mou
    return isAdmin ? "/admin" : "/pemohon/mou";
  }, [location, isAdmin]);

  // Kalau sudah login & status role sudah siap => redirect
  useEffect(() => {
    if (!loading && user && adminReady) {
      nav(redirectTo, { replace: true });
    }
  }, [loading, user, adminReady, nav, redirectTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const raw = String(usernameOrEmail).trim().toLowerCase();
      const email = raw.includes("@") ? raw : `${raw}@jejaring.local`;

      const { error } = await signIn(email, password);
      if (error) {
        setErr("Username/email atau password salah.");
        return;
      }
      // redirect ditangani useEffect ketika adminReady sudah true
    } catch (e2) {
      console.error(e2);
      setErr("Gagal login. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetSession() {
    setErr("");
    setBusy(true);
    try {
      await signOut();
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  const showForm = !loading && !user;

  // NB: Karena login sekarang ikut Layout, jangan pakai min-h-screen lagi (biar nggak double layout).
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#087745]">Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Login untuk pemohon maupun admin pengelola jejaring.
        </p>
      </div>

      {loading && <div className="text-sm text-gray-600">Memeriksa status login...</div>}

      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Username atau Email</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="email / username"
              autoComplete="username"
              required
              disabled={busy}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Password</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </div>

          <button
            className="w-full rounded-xl bg-[#087745] py-2 font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={busy}
          >
            {busy ? "Memproses..." : "Masuk"}
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            className="w-full rounded-xl border py-2 text-sm disabled:opacity-60"
            disabled={busy}
            title="Membersihkan sesi Supabase di browser."
          >
            Reset sesi
          </button>
        </form>
      )}

      {/* Info state */}
      {!loading && user && !adminReady && (
        <div className="mt-3 text-sm text-gray-600">Memvalidasi akses…</div>
      )}

      {!loading && user && adminReady && (
        <div className="mt-3 text-sm text-gray-700">
          Sudah login. Mengalihkan…
        </div>
      )}
    </div>
  );
}
