import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const { user, restoring } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch (err) {
      setError(err?.message || "Gagal memperbarui password. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#087745]">Atur ulang password</h1>
      {restoring ? <p className="mt-4" role="status">Memeriksa tautan pemulihan...</p> : done ? (
        <div className="mt-4" role="status">
          <p>Password berhasil diperbarui.</p>
          <Link className="mt-3 inline-block font-semibold text-[#087745]" to="/">Kembali ke beranda</Link>
        </div>
      ) : !user ? (
        <div className="mt-4" role="alert">
          <p>Tautan pemulihan tidak valid atau sudah kedaluwarsa. Minta admin mengirim tautan baru.</p>
          <Link className="mt-3 inline-block text-[#087745]" to="/login">Kembali ke login</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">Masukkan password baru untuk {user.email}.</p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div>
            <label htmlFor="new-password" className="text-sm">Password baru</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength={8}
              value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy}
              className="mt-1 w-full rounded-xl border px-3 py-2" />
            <p className="mt-1 text-xs text-gray-600">Minimal 8 karakter.</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-sm">Konfirmasi password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8}
              value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy}
              className="mt-1 w-full rounded-xl border px-3 py-2" />
          </div>
          <button disabled={busy} className="w-full rounded-xl bg-[#087745] py-2 font-medium text-white disabled:opacity-60">
            {busy ? "Menyimpan..." : "Simpan password"}
          </button>
        </form>
      )}
    </div>
  );
}
