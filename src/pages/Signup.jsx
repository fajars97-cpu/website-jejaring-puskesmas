import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // sesuaikan path kamu

export default function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setErr(error.message || "Gagal sign up.");
        return;
      }

      // Kalau email confirm OFF, biasanya langsung dapat session.
      // Kalau ON, user diminta cek email.
      if (data?.session) {
        setMsg("Akun berhasil dibuat. Mengalihkan…");
        nav("/pemohon/mou", { replace: true });
      } else {
        setMsg("Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu login.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#087745]">Buat Akun Pemohon</h1>
      <p className="mt-2 text-sm text-gray-600">
        Setelah daftar, akun otomatis menjadi <b>pemohon</b>.
      </p>

      {err && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {msg && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</div>}

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input className="w-full rounded-xl border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Password</label>
          <input className="w-full rounded-xl border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="w-full rounded-xl bg-[#087745] py-2 font-medium text-white disabled:opacity-60" disabled={busy}>
          {busy ? "Memproses..." : "Daftar"}
        </button>

        <div className="text-xs text-gray-600">
          Sudah punya akun?{" "}
          <Link className="font-semibold text-[#087745] hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
