// src/pages/Login.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();

  // ambil adminReady (+ adminError kalau ada)
  const { user, isAdmin, loading, adminReady, adminError, signIn, signOut } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handledNonAdminRef = useRef(false);

  const redirectTo = useMemo(() => {
    const from = location?.state?.from?.pathname;
    return from || "/admin";
  }, [location]);

  // Admin -> redirect (tunggu adminReady dulu)
  useEffect(() => {
    if (!loading && user && adminReady && isAdmin) {
      nav(redirectTo, { replace: true });
    }
  }, [loading, user, adminReady, isAdmin, nav, redirectTo]);

  // Non-admin -> auto signOut (HANYA jika adminReady sudah true)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      handledNonAdminRef.current = false;
      return;
    }

    // status admin belum final → jangan ambil keputusan, jangan signOut
    if (!adminReady) return;

    // kalau admin check timeout/lambat, jangan signOut otomatis
    if (String(adminError || "").toLowerCase().includes("timeout")) return;

    if (!isAdmin && !handledNonAdminRef.current) {
      handledNonAdminRef.current = true;
      (async () => {
        try {
          await signOut();
        } finally {
          setErr("Akun ini bukan admin. Silakan login dengan akun admin.");
          setPassword("");
        }
      })();
    }
  }, [loading, user, adminReady, adminError, isAdmin, signOut]);

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
      // redirect / non-admin ditangani useEffect di atas
    } catch (e2) {
      console.error(e2);
      setErr("Gagal login. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[#087745]">Login Admin</h1>
          <p className="text-gray-600 mt-2">
            Khusus pengelola jejaring (akses tambah/ubah/hapus data).
          </p>
        </div>

        {loading && (
          <div className="text-sm text-gray-600">Memeriksa status login...</div>
        )}

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Username atau Email</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="email admin"
                autoComplete="username"
                required
                disabled={busy}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Password</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={busy}
              />
            </div>

            <button
              className="w-full rounded-xl bg-[#087745] text-white py-2 font-medium disabled:opacity-60"
              type="submit"
              disabled={busy}
            >
              {busy ? "Memproses..." : "Masuk"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl border py-2 text-sm disabled:opacity-60"
              disabled={busy}
              title="Membersihkan sesi Supabase di browser."
            >
              Reset sesi
            </button>
          </form>
        )}

        {/* info state */}
        {!loading && user && !adminReady && (
          <div className="text-sm text-gray-600">Memvalidasi akses admin…</div>
        )}

        {!loading && user && adminReady && isAdmin && (
          <div className="text-sm text-gray-700">Sudah login sebagai admin. Mengalihkan…</div>
        )}
      </div>
    </main>
  );
}
