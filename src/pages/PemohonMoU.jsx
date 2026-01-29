import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // <-- sesuaikan path kalau beda
import { useAuth } from "../context/AuthContext";

const DEFAULTS = {
  nama_fasyankes: "",
  jenis_fasyankes: "",
  tipe_fasyankes: "",
  status: "Aktif",

  alamat: "",
  kelurahan: "",
  kecamatan: "Jagakarsa",
  kota: "Jakarta Selatan",
  kode_pos: "",

  lat: "",
  lng: "",

  telepon: "",
  email: "",
  gmaps_url: "",
  gmaps_embed_url: "",

  penyelenggara: "",
  kelompok_penyelenggara: "",
};

function isFiniteNumberString(s) {
  if (s === "" || s === null || s === undefined) return false;
  const n = Number(s);
  return Number.isFinite(n);
}

function toNullIfEmpty(v) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function validate(form) {
  if (!form.nama_fasyankes.trim()) return "Nama fasyankes wajib diisi.";
  if (!form.jenis_fasyankes.trim()) return "Jenis fasyankes wajib diisi.";
  if (!form.tipe_fasyankes.trim()) return "Tipe fasyankes wajib diisi.";
  if (!form.alamat.trim()) return "Alamat wajib diisi.";
  if (!form.kelurahan.trim()) return "Kelurahan wajib diisi.";
  if (!form.kecamatan.trim()) return "Kecamatan wajib diisi.";
  if (!form.kota.trim()) return "Kota wajib diisi.";
  if (!isFiniteNumberString(form.lat)) return "Latitude wajib angka.";
  if (!isFiniteNumberString(form.lng)) return "Longitude wajib angka.";
  if (form.email.trim() && !form.email.includes("@")) return "Email tidak valid.";
  return "";
}

export default function PemohonMoU() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [activeErr, setActiveErr] = useState("");

  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function loadActive() {
    setActiveErr("");
    setLoading(true);
    try {
      if (!user) {
        setActive(null);
        return;
      }
      const { data, error } = await supabase
        .from("permohonan_mou")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      setActive(data?.[0] ?? null);
    } catch (e) {
      setActiveErr(e?.message || "Gagal memuat status permohonan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const canSubmit = useMemo(() => !!user, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!user) {
      setErr("Silakan login terlebih dahulu.");
      return;
    }

    const v = validate(form);
    if (v) {
      setErr(v);
      return;
    }

    const payload = {
      pemohon_id: user.id,
      nama_fasyankes: form.nama_fasyankes.trim(),
      jenis_fasyankes: form.jenis_fasyankes.trim(),
      tipe_fasyankes: form.tipe_fasyankes.trim(),
      status: form.status.trim() || "Aktif",

      alamat: form.alamat.trim(),
      kelurahan: form.kelurahan.trim(),
      kecamatan: form.kecamatan.trim(),
      kota: form.kota.trim(),
      kode_pos: toNullIfEmpty(form.kode_pos),

      lat: Number(form.lat),
      lng: Number(form.lng),

      telepon: toNullIfEmpty(form.telepon),
      email: toNullIfEmpty(form.email),
      gmaps_url: toNullIfEmpty(form.gmaps_url),
      gmaps_embed_url: toNullIfEmpty(form.gmaps_embed_url),

      penyelenggara: toNullIfEmpty(form.penyelenggara),
      kelompok_penyelenggara: toNullIfEmpty(form.kelompok_penyelenggara),

      status_pengajuan: "SUBMITTED",
      submitted_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      const { error } = await supabase.from("permohonan_mou").insert(payload);
      if (error) throw error;

      setOk("Pengajuan berhasil dikirim. Silakan tunggu review Puskesmas.");
      setForm(DEFAULTS);
      await loadActive();
    } catch (e2) {
      setErr(e2?.message || "Gagal mengirim pengajuan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">Pengajuan MoU Fasyankes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Isi data fasyankes untuk diajukan ke Puskesmas. Status pengajuan bisa dilihat di bawah.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">Status Permohonan Terakhir</div>

        {loading ? (
          <div className="mt-2 text-sm text-slate-600">Memuat…</div>
        ) : activeErr ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {activeErr}
          </div>
        ) : !active ? (
          <div className="mt-2 text-sm text-slate-600">Belum ada permohonan.</div>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-semibold text-slate-900">{active.nama_fasyankes}</div>
            <div className="mt-1 text-slate-700">
              Status: <span className="font-semibold">{active.status_pengajuan}</span>
            </div>
            <div className="mt-1 text-slate-600">
              Diajukan: {String(active.submitted_at || active.created_at || "").slice(0, 10) || "—"}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">Form Pengajuan</div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nama Fasyankes *" value={form.nama_fasyankes} onChange={(v) => setForm((p) => ({ ...p, nama_fasyankes: v }))} />
            <Field label="Penyelenggara" value={form.penyelenggara} onChange={(v) => setForm((p) => ({ ...p, penyelenggara: v }))} />

            <Field label="Jenis Fasyankes *" value={form.jenis_fasyankes} onChange={(v) => setForm((p) => ({ ...p, jenis_fasyankes: v }))} />
            <Field label="Tipe Fasyankes *" value={form.tipe_fasyankes} onChange={(v) => setForm((p) => ({ ...p, tipe_fasyankes: v }))} />

            <Field label="Telepon" value={form.telepon} onChange={(v) => setForm((p) => ({ ...p, telepon: v }))} />
            <Field label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />

            <div className="sm:col-span-2">
              <Field label="Alamat *" value={form.alamat} onChange={(v) => setForm((p) => ({ ...p, alamat: v }))} />
            </div>

            <Field label="Kelurahan *" value={form.kelurahan} onChange={(v) => setForm((p) => ({ ...p, kelurahan: v }))} />
            <Field label="Kecamatan *" value={form.kecamatan} onChange={(v) => setForm((p) => ({ ...p, kecamatan: v }))} />

            <Field label="Kota *" value={form.kota} onChange={(v) => setForm((p) => ({ ...p, kota: v }))} />
            <Field label="Kode Pos" value={form.kode_pos} onChange={(v) => setForm((p) => ({ ...p, kode_pos: v }))} />

            <Field label="Latitude (lat) *" value={form.lat} onChange={(v) => setForm((p) => ({ ...p, lat: v }))} />
            <Field label="Longitude (lng) *" value={form.lng} onChange={(v) => setForm((p) => ({ ...p, lng: v }))} />

            <Field label="Google Maps URL" value={form.gmaps_url} onChange={(v) => setForm((p) => ({ ...p, gmaps_url: v }))} />
            <Field label="Gmaps Embed URL" value={form.gmaps_embed_url} onChange={(v) => setForm((p) => ({ ...p, gmaps_embed_url: v }))} />

            <Field label="Kelompok Penyelenggara" value={form.kelompok_penyelenggara} onChange={(v) => setForm((p) => ({ ...p, kelompok_penyelenggara: v }))} />
            <Field label="Status" value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} />
          </div>

          {err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
          ) : ok ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{ok}</div>
          ) : (
            <div className="text-xs text-slate-500">
              Catatan: Setelah pembinaan, upload bukti tindak lanjut akan kita tambah di step berikutnya.
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setForm(DEFAULTS)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Mengirim…" : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-700">{label}</div>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
      />
    </label>
  );
}
