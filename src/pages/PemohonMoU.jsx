// PemohonMoU.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // <-- sesuaikan path kamu
import { useAuth } from "../context/AuthContext"; // <-- sesuaikan path kamu
import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields"; // <-- sesuaikan path kamu

// Defaults minimal (kamu bisa ganti ke CREATE_DEFAULTS dari constants.js kalau ada)
const DEFAULT_FORM = {
  nama_fasyankes: "",
  jenis_fasyankes: "",
  tipe_fasyankes: "",
  status: "Aktif",
  alamat: "",
  kelurahan: "",
  kecamatan: "",
  kota: "Jakarta Selatan",
  kode_pos: "",
  lat: "",
  lng: "",
  gmaps_url: "",
  gmaps_embed_url: "",
  telepon: "",
  email: "",
  penyelenggara: "Swasta",
  kelompok_penyelenggara: "",
  pj_nama: "",
  jumlah_sdm: "",
  kegiatan: "",
  // admin-only fields keep exist but not used in pemohon:
  is_verified: false,
  mou_nomor: "",
  mou_mulai: "",
  mou_akhir: "",
  terakreditasi: false,
  nomor_akreditasi: "",
  hasil_akreditasi: "",
  foto: "",
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(v) {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return s;
  }
}

function isActiveStatus(status) {
  // sesuaikan status yang kamu pakai di permohonan_mou
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return false;
  return !["REJECTED", "CANCELED", "DONE", "FINALIZED"].includes(s);
}

export default function PemohonMoU() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({ baru: false, renew: false });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [jejaring, setJejaring] = useState(null);
  const [lastBaru, setLastBaru] = useState(null);
  const [lastRenew, setLastRenew] = useState(null);

  const [formBaru, setFormBaru] = useState(DEFAULT_FORM);
  const [formRenew, setFormRenew] = useState(DEFAULT_FORM);
  const [gdriveBaru, setGdriveBaru] = useState("");
  const [gdriveRenew, setGdriveRenew] = useState("");

  const setBaruField = (k, v) => setFormBaru((p) => ({ ...p, [k]: v }));
  const setRenewField = (k, v) => setFormRenew((p) => ({ ...p, [k]: v }));

  async function loadAll() {
    if (!user?.id) return;
    setLoading(true);
    setErr("");
    setOk("");

    try {
      // 1) jejaring milik pemohon (butuh kolom pemohon_id)
      const { data: j, error: je } = await supabase
        .from("jejaring_fasyankes")
        .select("*")
        .eq("pemohon_id", user.id)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (je) throw je;
      setJejaring(j || null);

      // 2) last BARU
      const { data: pb, error: pbe } = await supabase
        .from("permohonan_mou")
        .select("id, created_at, status_pengajuan, jenis_pengajuan, gdrive_url, target_jejaring_id")
        .eq("pemohon_id", user.id)
        .eq("jenis_pengajuan", "BARU")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pbe) throw pbe;
      setLastBaru(pb || null);

      // 3) last PERPANJANGAN
      const { data: pr, error: pre } = await supabase
        .from("permohonan_mou")
        .select("id, created_at, status_pengajuan, jenis_pengajuan, gdrive_url, target_jejaring_id")
        .eq("pemohon_id", user.id)
        .eq("jenis_pengajuan", "PERPANJANGAN")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pre) throw pre;
      setLastRenew(pr || null);

      // Prefill renew form dari jejaring (biar konsisten)
      if (j?.id) {
        setFormRenew((p) => ({ ...p, ...j, is_verified: false }));
      }
    } catch (e) {
      setErr(e?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // window perpanjangan = H-365 sebelum mou_akhir
  const renewWindow = useMemo(() => {
    const akhir = jejaring?.mou_akhir ? new Date(jejaring.mou_akhir) : null;
    if (!akhir || Number.isNaN(akhir.getTime())) return { ok: false, unlockAt: null };
    const unlockAt = addDays(akhir, -365);
    return { ok: new Date() >= unlockAt, unlockAt };
  }, [jejaring?.mou_akhir]);

  // LOCK RULES (sesuai request kamu)
  const lockBaru = useMemo(() => {
    // kalau sudah pernah isi perpanjangan -> lock permanen
    if (lastRenew?.id) return true;

    // kalau sudah ada jejaring (berarti pengajuan BARU sudah finalize) -> lock
    if (jejaring?.id) return true;

    // optional anti-spam: kalau ada permohonan BARU aktif
    if (lastBaru?.id && isActiveStatus(lastBaru.status_pengajuan)) return true;

    return false;
  }, [lastRenew?.id, jejaring?.id, lastBaru]);

  const lockRenew = useMemo(() => {
    // harus punya jejaring finalize dulu
    if (!jejaring?.id) return true;

    // harus masuk window H-365
    if (!renewWindow.ok) return true;

    // optional anti-spam: kalau ada renewal aktif
    if (lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan)) return true;

    return false;
  }, [jejaring?.id, renewWindow.ok, lastRenew]);

  function validateCore(form) {
    // minimal required sesuai kebutuhan
    if (!String(form.nama_fasyankes || "").trim()) return "Nama fasyankes wajib diisi.";
    if (!String(form.jenis_fasyankes || "").trim()) return "Jenis fasyankes wajib diisi.";
    if (!String(form.tipe_fasyankes || "").trim()) return "Tipe fasyankes wajib diisi.";
    if (!String(form.alamat || "").trim()) return "Alamat wajib diisi.";
    if (!String(form.kelurahan || "").trim()) return "Kelurahan wajib diisi.";
    if (!String(form.kecamatan || "").trim()) return "Kecamatan wajib diisi.";
    if (!String(form.kota || "").trim()) return "Kota wajib diisi.";
    if (String(form.lat || "").trim() === "" || String(form.lng || "").trim() === "") return "Lat/Lng wajib diisi.";
    return "";
  }

  async function submitBaru(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (lockBaru) return;
    if (!user?.id) return setErr("Silakan login dulu.");
    if (!String(gdriveBaru).trim()) return setErr("Link Google Drive wajib diisi.");

    const msg = validateCore(formBaru);
    if (msg) return setErr(msg);

    setBusy((p) => ({ ...p, baru: true }));
    try {
      const payload = { ...formBaru, is_verified: false };
      const { error } = await supabase.from("permohonan_mou").insert({
        pemohon_id: user.id,
        jenis_pengajuan: "BARU",
        gdrive_url: String(gdriveBaru).trim(),
        status_pengajuan: "SUBMITTED",
        ...payload,
      });
      if (error) throw error;

      setOk("Pengajuan MoU Baru berhasil dikirim.");
      setGdriveBaru("");
      await loadAll();
    } catch (e2) {
      setErr(e2?.message || "Gagal mengirim pengajuan.");
    } finally {
      setBusy((p) => ({ ...p, baru: false }));
    }
  }

  async function submitRenew(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (lockRenew) return;
    if (!user?.id) return setErr("Silakan login dulu.");
    if (!String(gdriveRenew).trim()) return setErr("Link Google Drive wajib diisi.");
    if (!jejaring?.id) return setErr("Tidak ada data jejaring (MoU belum difinalize).");

    const msg = validateCore(formRenew);
    if (msg) return setErr(msg);

    setBusy((p) => ({ ...p, renew: true }));
    try {
      const payload = { ...formRenew, is_verified: false };
      const { error } = await supabase.from("permohonan_mou").insert({
        pemohon_id: user.id,
        jenis_pengajuan: "PERPANJANGAN",
        target_jejaring_id: jejaring.id,
        gdrive_url: String(gdriveRenew).trim(),
        status_pengajuan: "SUBMITTED",
        ...payload,
      });
      if (error) throw error;

      setOk("Permohonan Perpanjangan MoU berhasil dikirim.");
      setGdriveRenew("");
      await loadAll();
    } catch (e2) {
      setErr(e2?.message || "Gagal mengirim perpanjangan.");
    } finally {
      setBusy((p) => ({ ...p, renew: false }));
    }
  }

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 2xl:px-8 py-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-lg font-semibold text-slate-900">MoU: Pengajuan & Perpanjangan</div>
          <div className="mt-1 text-sm text-slate-600">
            Sistem ini punya 2 layer form. Yang kebuka/terkunci itu otomatis (biar nggak jadi “form rebutan” 😄).
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Status MoU</div>
            {jejaring?.id ? (
              <div className="mt-1 grid gap-1 sm:grid-cols-2">
                <div>
                  <span className="text-slate-500">Fasyankes:</span> {jejaring.nama_fasyankes || "—"}
                </div>
                <div>
                  <span className="text-slate-500">Berlaku s.d.:</span> {fmtDate(jejaring.mou_akhir)}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-slate-600">Belum ada MoU yang difinalize.</div>
            )}
          </div>
        </div>

        {/* Feedback */}
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Memuat…</div> : null}
        {err ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        {ok ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{ok}</div> : null}

        {/* FORM BARU */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Pengajuan MoU Baru</div>
              <div className="mt-1 text-xs text-slate-600">Untuk kerjasama pertama kali.</div>
              {lastBaru?.id ? (
                <div className="mt-2 text-xs text-slate-500">
                  Terakhir: {fmtDate(lastBaru.created_at)} • Status: <span className="font-semibold">{lastBaru.status_pengajuan}</span>
                </div>
              ) : null}
              {lastRenew?.id ? (
                <div className="mt-1 text-xs text-slate-500">Catatan: sudah pernah perpanjangan → pengajuan baru terkunci permanen.</div>
              ) : null}
            </div>
            <div className={`rounded-xl border px-3 py-2 text-xs ${lockBaru ? "border-slate-200 bg-slate-50 text-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
              {lockBaru ? "🔒 Terkunci" : "✅ Dibuka"}
            </div>
          </div>

          <form onSubmit={submitBaru} className="p-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <JejaringFormFields value={formBaru} onChange={setBaruField} variant="pemohon" disabled={lockBaru || busy.baru} />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">Berkas (Google Drive)</div>
                    <div className="mt-1 text-xs text-slate-600">Tempel link folder GDrive yang bisa diakses admin.</div>

                    <label className="mt-3 block">
                      <div className="mb-1 text-xs font-semibold text-slate-700">Link GDrive *</div>
                      <input
                        value={gdriveBaru}
                        onChange={(e) => setGdriveBaru(e.target.value)}
                        disabled={lockBaru || busy.baru}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 disabled:opacity-60"
                        placeholder="https://drive.google.com/…"
                      />
                    </label>

                    {lockBaru ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        Form ini terkunci: sudah finalize / ada proses aktif / atau sudah pernah perpanjangan.
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormBaru(DEFAULT_FORM);
                        setGdriveBaru("");
                      }}
                      disabled={busy.baru}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={lockBaru || busy.baru}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {busy.baru ? "Mengirim…" : "Kirim Pengajuan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* FORM PERPANJANGAN */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Perpanjangan MoU</div>
              <div className="mt-1 text-xs text-slate-600">Dibuka 1 tahun sebelum MoU berakhir.</div>

              {jejaring?.mou_akhir ? (
                <div className="mt-2 text-xs text-slate-500">
                  MoU berakhir: <span className="font-semibold">{fmtDate(jejaring.mou_akhir)}</span> • Dibuka sejak:{" "}
                  {renewWindow.unlockAt ? fmtDate(renewWindow.unlockAt) : "—"}
                </div>
              ) : null}

              {lastRenew?.id ? (
                <div className="mt-2 text-xs text-slate-500">
                  Terakhir: {fmtDate(lastRenew.created_at)} • Status: <span className="font-semibold">{lastRenew.status_pengajuan}</span>
                </div>
              ) : null}
            </div>

            <div className={`rounded-xl border px-3 py-2 text-xs ${lockRenew ? "border-slate-200 bg-slate-50 text-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
              {lockRenew ? "🔒 Terkunci" : "✅ Dibuka"}
            </div>
          </div>

          <form onSubmit={submitRenew} className="p-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <JejaringFormFields value={formRenew} onChange={setRenewField} variant="pemohon" disabled={lockRenew || busy.renew} />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">Berkas Perpanjangan (Google Drive)</div>
                    <div className="mt-1 text-xs text-slate-600">Tempel link folder GDrive berkas perpanjangan.</div>

                    <label className="mt-3 block">
                      <div className="mb-1 text-xs font-semibold text-slate-700">Link GDrive *</div>
                      <input
                        value={gdriveRenew}
                        onChange={(e) => setGdriveRenew(e.target.value)}
                        disabled={lockRenew || busy.renew}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 disabled:opacity-60"
                        placeholder="https://drive.google.com/…"
                      />
                    </label>

                    {!jejaring?.id ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        Perpanjangan belum bisa: MoU belum difinalize jadi data jejaring.
                      </div>
                    ) : !renewWindow.ok ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        Belum masuk masa perpanjangan. Akan terbuka mulai {renewWindow.unlockAt ? fmtDate(renewWindow.unlockAt) : "—"}.
                      </div>
                    ) : lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan) ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        Sudah ada permohonan perpanjangan yang sedang diproses.
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormRenew(DEFAULT_FORM);
                        setGdriveRenew("");
                      }}
                      disabled={busy.renew}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={lockRenew || busy.renew}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {busy.renew ? "Mengirim…" : "Kirim Perpanjangan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="text-xs text-slate-500">
          Catatan: kalau import path kamu beda, tinggal sesuaikan. Logic & struktur UI tetap aman.
        </div>
      </div>
    </div>
  );
}
