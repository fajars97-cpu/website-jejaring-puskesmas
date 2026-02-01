// PemohonMoU.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // sesuaikan path kamu
import { useAuth } from "../context/AuthContext"; // sesuaikan path kamu
import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields"; // sesuaikan path kamu

// Defaults minimal — aman (nggak maksa options). Kalau mau, nanti bisa kamu ganti ke CREATE_DEFAULTS dari constants.js
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

  // admin-only (biarin ada, tapi pemohon nggak ngubah)
  is_verified: false,

  // mou fields (pemohon bisa isi, nanti admin finalize)
  mou_nomor: "",
  mou_mulai: "",
  mou_akhir: "",

  // akreditasi
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
  // sesuaikan status kamu di permohonan_mou
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return false;
  // status yang dianggap "selesai / tidak aktif"
  return !["REJECTED", "CANCELED", "DONE", "FINALIZED"].includes(s);
}

function LockBadge({ locked }) {
  return (
    <span
      className={[
        "ml-2 inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
        locked ? "border-slate-200 bg-slate-50 text-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-800",
      ].join(" ")}
    >
      {locked ? "🔒 Terkunci" : "✅ Dibuka"}
    </span>
  );
}

function HintBox({ children }) {
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      {children}
    </div>
  );
}

export default function PemohonMoU() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({ baru: false, renew: false });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [activeTab, setActiveTab] = useState("baru"); // "baru" | "renew" | "riwayat"

  const [jejaring, setJejaring] = useState(null);
  const [lastBaru, setLastBaru] = useState(null);
  const [lastRenew, setLastRenew] = useState(null);

  const [historyRows, setHistoryRows] = useState([]);

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
      // 1) Jejaring milik pemohon (butuh kolom pemohon_id)
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

      // 2) Last BARU
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

      // 3) Last PERPANJANGAN
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

      // 4) Riwayat (BARU + PERPANJANGAN)
      // Ambil kolom yang diperlukan untuk "ekspor/prefill" (gunakan select("*") kalau skema kamu berubah-ubah)
      const { data: hist, error: histe } = await supabase
        .from("permohonan_mou")
        .select(
          "id, created_at, status_pengajuan, jenis_pengajuan, gdrive_url, target_jejaring_id," +
            " nama_fasyankes, jenis_fasyankes, tipe_fasyankes, status," +
            " alamat, kelurahan, kecamatan, kota, kode_pos," +
            " lat, lng, gmaps_url, gmaps_embed_url," +
            " telepon, email, penyelenggara, kelompok_penyelenggara," +
            " pj_nama, jumlah_sdm, kegiatan," +
            " mou_nomor, mou_mulai, mou_akhir," +
            " terakreditasi, nomor_akreditasi, hasil_akreditasi, foto"
        )
        .eq("pemohon_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (histe) throw histe;
      setHistoryRows(hist || []);

      // Prefill renew dari jejaring (biar konsisten)
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

  // LOCK RULES
  const lockBaru = useMemo(() => {
    // kalau sudah pernah perpanjangan -> lock permanen
    if (lastRenew?.id) return true;

    // kalau sudah ada jejaring finalize -> lock
    if (jejaring?.id) return true;

    // anti-spam: kalau ada permohonan BARU aktif
    if (lastBaru?.id && isActiveStatus(lastBaru.status_pengajuan)) return true;

    return false;
  }, [lastRenew?.id, jejaring?.id, lastBaru]);

  const lockRenew = useMemo(() => {
    // harus punya jejaring finalize dulu
    if (!jejaring?.id) return true;

    // harus masuk window H-365
    if (!renewWindow.ok) return true;

    // anti-spam: kalau ada renewal aktif
    if (lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan)) return true;

    return false;
  }, [jejaring?.id, renewWindow.ok, lastRenew]);

  // biar user nggak nyangkut di tab yang terkunci total
  useEffect(() => {
    if (activeTab === "riwayat") return;
    if (activeTab === "baru" && lockBaru && !lockRenew) setActiveTab("renew");
    if (activeTab === "renew" && lockRenew && !lockBaru) setActiveTab("baru");
  }, [activeTab, lockBaru, lockRenew]);

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
      setErr(e2?.message || "Gagal mengirim pengajuan BARU.");
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

    const msg = validateCore(formRenew);
    if (msg) return setErr(msg);

    setBusy((p) => ({ ...p, renew: true }));
    try {
      const payload = { ...formRenew, is_verified: false };

      const { error } = await supabase.from("permohonan_mou").insert({
        pemohon_id: user.id,
        jenis_pengajuan: "PERPANJANGAN",
        gdrive_url: String(gdriveRenew).trim(),
        // pakai target_jejaring_id sesuai skema kamu yang sudah ada
        target_jejaring_id: jejaring?.id ?? null,
        status_pengajuan: "SUBMITTED",
        ...payload,
      });

      if (error) throw error;

      setOk("Pengajuan Perpanjangan berhasil dikirim.");
      setGdriveRenew("");
      await loadAll();
    } catch (e2) {
      setErr(e2?.message || "Gagal mengirim pengajuan PERPANJANGAN.");
    } finally {
      setBusy((p) => ({ ...p, renew: false }));
    }
  }

  const statusBaru = lastBaru
    ? `Terakhir: ${fmtDate(lastBaru.created_at)} • Status: ${lastBaru.status_pengajuan}`
    : "Belum ada permohonan BARU.";

  const statusRenew = lastRenew
    ? `Terakhir: ${fmtDate(lastRenew.created_at)} • Status: ${lastRenew.status_pengajuan}`
    : "Belum ada permohonan PERPANJANGAN.";

  const statusMou = jejaring?.id
    ? `MoU aktif sampai: ${fmtDate(jejaring.mou_akhir)}`
    : "Belum ada MoU yang difinalize.";


  const lockReasonBaru = useMemo(() => {
    if (lastRenew?.id) return "Terkunci karena sudah pernah melakukan perpanjangan.";
    if (jejaring?.id) return "Terkunci karena MoU sudah difinalize (data sudah masuk jejaring).";
    if (lastBaru?.id && isActiveStatus(lastBaru.status_pengajuan)) {
      return `Terkunci karena masih ada permohonan BARU aktif (status: ${lastBaru.status_pengajuan}).`;
    }
    return "";
  }, [lastRenew?.id, jejaring?.id, lastBaru]);

  const lockReasonRenew = useMemo(() => {
    if (!jejaring?.id) return "Terkunci karena belum ada MoU yang difinalize.";
    if (!renewWindow.ok) return `Terkunci karena belum masuk window perpanjangan (dibuka ${fmtDate(renewWindow.unlockAt)} / H-365).`;
    if (lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan)) {
      return `Terkunci karena masih ada permohonan PERPANJANGAN aktif (status: ${lastRenew.status_pengajuan}).`;
    }
    return "";
  }, [jejaring?.id, renewWindow.ok, renewWindow.unlockAt, lastRenew]);

  function pickFormFromHistoryRow(row) {
    // ambil hanya field yang ada di DEFAULT_FORM supaya aman
    const out = { ...DEFAULT_FORM };
    Object.keys(out).forEach((k) => {
      if (row?.[k] !== undefined) out[k] = row[k];
    });
    // pemohon tidak boleh mengubah verified dari sisi UI
    out.is_verified = false;
    return out;
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportToTab(row, tab) {
    setErr("");
    setOk("");

    const form = pickFormFromHistoryRow(row);
    const gdrive = String(row?.gdrive_url || "").trim();

    if (tab === "baru") {
      setFormBaru(form);
      setGdriveBaru(gdrive);
      setActiveTab("baru");
      setOk("Data riwayat berhasil dimuat ke tab Pengajuan MoU Baru.");
      return;
    }

    if (tab === "renew") {
      setFormRenew(form);
      setGdriveRenew(gdrive);
      setActiveTab("renew");
      setOk("Data riwayat berhasil dimuat ke tab Perpanjangan MoU.");
      return;
    }
  }

  return (
    // FULL width + padding nyaman (nggak nempel tepi)
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-lg font-semibold text-slate-900">MoU: Pengajuan & Perpanjangan</div>
        <div className="mt-1 text-sm text-slate-600">
          Sistem ini punya 2 layer form. Pilih salah satu tab di bawah, lalu isi form dan kirim pengajuan. Terbuka dan terkunci secara otomatis.
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-800">Status MoU</div>
          <div className="mt-1 text-sm text-slate-700">{statusMou}</div>

          {jejaring?.id && !renewWindow.ok ? (
            <div className="mt-2 text-xs text-slate-600">
              Perpanjangan dibuka mulai: <span className="font-semibold">{fmtDate(renewWindow.unlockAt)}</span> (H-365).
            </div>
          ) : null}
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Memuat data…</div>
        ) : null}

        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
        ) : null}

        {ok ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{ok}</div>
        ) : null}
      </div>

      {/* Tabs container */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Tab bar */}
        <div className="flex items-end gap-2 border-b border-slate-200 bg-white px-3 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("baru")}
            className={[
              "relative rounded-t-xl px-4 py-2 text-sm font-semibold",
              activeTab === "baru"
                ? "bg-white text-slate-900 border border-slate-200 border-b-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent",
            ].join(" ")}
          >
            Pengajuan MoU Baru
            <LockBadge locked={lockBaru} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("renew")}
            className={[
              "relative rounded-t-xl px-4 py-2 text-sm font-semibold",
              activeTab === "renew"
                ? "bg-white text-slate-900 border border-slate-200 border-b-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent",
            ].join(" ")}
          >
            Perpanjangan MoU
            <LockBadge locked={lockRenew} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("riwayat")}
            className={[
              "relative rounded-t-xl px-4 py-2 text-sm font-semibold",
              activeTab === "riwayat"
                ? "bg-white text-slate-900 border border-slate-200 border-b-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent",
            ].join(" ")}
          >
            Riwayat Pengajuan
            <span className="ml-2 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {historyRows?.length ?? 0}
            </span>
          </button>

          <div className="flex-1" />
          <div className="pb-2 pr-2 text-xs text-slate-500">Pilih tab → isi satu jalur aja.</div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "baru" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Pengajuan MoU Baru</div>
                  <div className="text-xs text-slate-600">Untuk kerjasama pertama kali.</div>
                  <div className="mt-1 text-xs text-slate-600">{statusBaru}</div>
                </div>
                {lockBaru ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    🔒 Terkunci
                  </span>
                ) : null}
              </div>

              <form onSubmit={submitBaru} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* kiri (fields) */}
                <div className="lg:col-span-2">
                  <JejaringFormFields
                    value={formBaru}
                    onChange={setBaruField}
                    mode="pemohon"
                    disabled={loading || busy.baru || lockBaru}
                    hide={{
                      verified: true,
                    }}
                  />
                </div>

                {/* kanan (gdrive + action) */}
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">Berkas (Google Drive)</div>
                    <div className="mt-1 text-xs text-slate-600">
                      Tempel link folder GDrive yang bisa diakses admin.
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-700">Link GDrive *</label>
                      <input
                        value={gdriveBaru}
                        onChange={(e) => setGdriveBaru(e.target.value)}
                        disabled={loading || busy.baru || lockBaru}
                        placeholder="https://drive.google.com/..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    {lockBaru ? (
                      <HintBox>
                        Form ini terkunci: sudah finalize / ada proses aktif / atau sudah pernah perpanjangan.
                      </HintBox>
                    ) : (
                      <HintBox>
                        Pastikan link GDrive bisa diakses admin (minimal “Anyone with the link” atau share ke email admin).
                      </HintBox>
                    )}

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormBaru(DEFAULT_FORM);
                          setGdriveBaru("");
                          setErr("");
                          setOk("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                        disabled={busy.baru}
                      >
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={loading || busy.baru || lockBaru}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {busy.baru ? "Mengirim…" : "Kirim Pengajuan"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : activeTab === "renew" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Perpanjangan MoU</div>
                  <div className="text-xs text-slate-600">Terbuka H-365 sebelum MoU berakhir.</div>
                  <div className="mt-1 text-xs text-slate-600">{statusRenew}</div>
                </div>
                {lockRenew ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    🔒 Terkunci
                  </span>
                ) : null}
              </div>

              <form onSubmit={submitRenew} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* kiri (fields) */}
                <div className="lg:col-span-2">
                  <JejaringFormFields
                    value={formRenew}
                    onChange={setRenewField}
                    mode="pemohon"
                    disabled={loading || busy.renew || lockRenew}
                    hide={{
                      verified: true,
                    }}
                  />
                </div>

                {/* kanan (gdrive + action) */}
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">Berkas (Google Drive)</div>
                    <div className="mt-1 text-xs text-slate-600">
                      Upload berkas perpanjangan ke GDrive, lalu tempel link foldernya.
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-700">Link GDrive *</label>
                      <input
                        value={gdriveRenew}
                        onChange={(e) => setGdriveRenew(e.target.value)}
                        disabled={loading || busy.renew || lockRenew}
                        placeholder="https://drive.google.com/..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    {lockRenew ? (
                      <HintBox>
                        {jejaring?.id
                          ? renewWindow.ok
                            ? "Masih terkunci karena ada proses renewal aktif."
                            : `Belum masuk window perpanjangan. Dibuka mulai ${fmtDate(renewWindow.unlockAt)} (H-365).`
                          : "Belum ada MoU finalize, jadi perpanjangan belum bisa."}
                      </HintBox>
                    ) : (
                      <HintBox>
                        Data di sini akan dipakai admin untuk update record jejaring saat finalize perpanjangan.
                      </HintBox>
                    )}

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // reset renew: prefer kembali ke jejaring kalau ada
                          if (jejaring?.id) setFormRenew((p) => ({ ...DEFAULT_FORM, ...jejaring, is_verified: false }));
                          else setFormRenew(DEFAULT_FORM);
                          setGdriveRenew("");
                          setErr("");
                          setOk("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                        disabled={busy.renew}
                      >
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={loading || busy.renew || lockRenew}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {busy.renew ? "Mengirim…" : "Kirim Perpanjangan"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Riwayat Pengajuan</div>
                  <div className="text-xs text-slate-600">
                    Semua permohonan yang pernah kamu submit. Kamu bisa pakai riwayat ini buat ngeh kenapa form terkunci dan buat ekspor data.
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Total: <span className="font-semibold">{historyRows.length}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">Kenapa bisa terkunci?</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-700">Pengajuan MoU Baru</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {lockBaru ? lockReasonBaru || "Terkunci." : "Saat ini terbuka."}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-700">Perpanjangan MoU</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {lockRenew ? lockReasonRenew || "Terkunci." : "Saat ini terbuka."}
                    </div>
                  </div>
                </div>
              </div>

              {historyRows.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Belum ada riwayat pengajuan.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRows.map((row) => {
                    const jenis = String(row.jenis_pengajuan || "").toUpperCase();
                    const status = String(row.status_pengajuan || "").toUpperCase();
                    const isBaru = jenis === "BARU";
                    const submittedAt = row.created_at ? new Date(row.created_at).toLocaleString("id-ID") : "—";

                    return (
                      <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={[
                                  "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                                  isBaru ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200",
                                ].join(" ")}
                              >
                                {isBaru ? "MoU Baru" : "Perpanjangan"}
                              </span>
                              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                {status || "—"}
                              </span>
                              <span className="text-xs text-slate-500">Submit: {submittedAt}</span>
                            </div>

                            <div className="mt-2 text-sm font-semibold text-slate-900">
                              {row.nama_fasyankes || "—"}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              {row.jenis_fasyankes || "—"} • {row.tipe_fasyankes || "—"} • {row.kecamatan || "—"}, {row.kelurahan || "—"}
                            </div>

                            {row.gdrive_url ? (
                              <div className="mt-2 text-xs text-slate-600">
                                GDrive:{" "}
                                <a
                                  href={row.gdrive_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                                >
                                  Buka link
                                </a>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <button
                              type="button"
                              onClick={() => exportToTab(row, isBaru ? "baru" : "renew")}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                            >
                              {isBaru ? "Muat ke MoU Baru" : "Muat ke Perpanjangan"}
                            </button>

                            <button
                              type="button"
                              onClick={() => exportToTab(row, "renew")}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                              title="Buat draft perpanjangan dari data riwayat ini"
                            >
                              Ekspor ke Perpanjangan
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const form = pickFormFromHistoryRow(row);
                                downloadJson(
                                  `permohonan_${jenis.toLowerCase()}_${row.id}.json`,
                                  {
                                    jenis_pengajuan: row.jenis_pengajuan,
                                    status_pengajuan: row.status_pengajuan,
                                    created_at: row.created_at,
                                    gdrive_url: row.gdrive_url,
                                    target_jejaring_id: row.target_jejaring_id,
                                    form,
                                  }
                                );
                              }}
                              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Download JSON
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* footer note kecil */}
      <div className="mt-4 text-xs text-slate-500">
        Tips: kalau tab terasa “nggak full”, itu biasanya karena wrapper page sebelumnya pakai max-width. Di versi ini sudah full-width + padding.
      </div>
    </div>
  );
}
