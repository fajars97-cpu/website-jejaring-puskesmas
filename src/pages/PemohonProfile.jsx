import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PemohonProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    nama: "",
    telp: "",
    alamat: "",
    instansi: "",
    jabatan: "",
    notes: "", // kalau kamu mau pemohon lihat notes admin (read-only nanti bisa)
  });

  async function load() {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const { data: authRes, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authRes?.user;
      if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");

      const { data, error } = await supabase
        .from("profiles")
        .select("nama,telp,alamat,instansi,jabatan,notes")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setForm({
        nama: data?.nama || "",
        telp: data?.telp || "",
        alamat: data?.alamat || "",
        instansi: data?.instansi || "",
        jabatan: data?.jabatan || "",
        notes: data?.notes || "",
      });
    } catch (e) {
      setErr(e?.message || "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange(k, v) {
    setOk("");
    setErr("");
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const { data: authRes, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authRes?.user;
      if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");

      const payload = {
        nama: form.nama?.trim() || null,
        telp: form.telp?.trim() || null,
        alamat: form.alamat?.trim() || null,
        instansi: form.instansi?.trim() || null,
        jabatan: form.jabatan?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id);
      if (error) throw error;

      setOk("Profil berhasil disimpan.");
    } catch (e2) {
      setErr(e2?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full px-4 py-6 md:px-6">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-extrabold">Profil Pemohon</div>
            <div className="text-sm text-black/60">
              Perbarui data akun pemohon. Pastikan nomor telepon aktif untuk komunikasi.
            </div>
          </div>

          {loading ? (
            <div className="mt-5 text-sm text-black/60">Memuat…</div>
          ) : (
            <>
              {err ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
                </div>
              ) : null}

              {ok ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {ok}
                </div>
              ) : null}

              <form onSubmit={onSave} className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-black/70">Nama</label>
                  <input
                    value={form.nama}
                    onChange={(e) => onChange("nama", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-black/70">Telepon</label>
                  <input
                    value={form.telp}
                    onChange={(e) => onChange("telp", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-black/70">Jabatan</label>
                  <input
                    value={form.jabatan}
                    onChange={(e) => onChange("jabatan", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    placeholder="Contoh: Penanggung Jawab"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-black/70">Instansi</label>
                  <input
                    value={form.instansi}
                    onChange={(e) => onChange("instansi", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    placeholder="Nama fasyankes/instansi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-black/70">Alamat</label>
                  <textarea
                    value={form.alamat}
                    onChange={(e) => onChange("alamat", e.target.value)}
                    className="mt-1 min-h-24 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
                    placeholder="Alamat singkat"
                  />
                </div>

                {/* Notes dari admin (opsional). Kalau kamu mau read-only saja. */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-black/70">Catatan Admin</label>
                  <textarea
                    value={form.notes}
                    readOnly
                    className="mt-1 min-h-20 w-full cursor-not-allowed rounded-xl border border-black/10 bg-black/2 px-3 py-2 text-sm text-black/60"
                    placeholder="—"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={load}
                    className="h-10 rounded-xl border border-black/15 bg-white px-4 text-sm font-semibold hover:bg-black/3"
                    disabled={saving}
                  >
                    Refresh
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
