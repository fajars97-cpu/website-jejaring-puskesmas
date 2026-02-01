// PemohonMoU.jsx (v4)
// - Tambah 3 tab: Pengajuan MoU Baru, Perpanjangan MoU, Riwayat Pengajuan
// - Riwayat menampilkan data lengkap pengajuan + tanggal diajukan
// - Dari riwayat: muat data ke form untuk koreksi (update), atau ekspor ke draft perpanjangan
// - Tampilkan catatan pemeriksa per kolom (note_*) hanya bila terisi

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // sesuaikan path kamu
import { useAuth } from "../context/AuthContext"; // sesuaikan path kamu
import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields"; // sesuaikan path kamu

// Defaults minimal — aman (nggak maksa options).
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

  // admin-only
  is_verified: false,

  // mou fields
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

function fmtDateTime(v) {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function isActiveStatus(status) {
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return false;
  // status yang dianggap "selesai / tidak aktif"
  return !["REJECTED", "CANCELED", "DONE", "FINALIZED"].includes(s);
}

function isEditableStatus(status) {
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return true;
  // status final / arsip tidak bisa diedit oleh pemohon
  return !["DONE", "FINALIZED"].includes(s);
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
  return <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{children}</div>;
}

function NotesPanel({ row }) {
  if (!row) return null;

  // kumpulkan note_* yang berisi
  const noteEntries = Object.entries(row)
    .filter(([k, v]) => {
      const key = String(k || "").toLowerCase();
      const val = String(v ?? "").trim();
      return (key.startsWith("note_") || key.startsWith("catatan_")) && val.length > 0;
    })
    .map(([k, v]) => {
      const raw = String(k);
      const label = raw
        .replace(/^note_/i, "")
        .replace(/^catatan_/i, "")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const title = label ? label.charAt(0).toUpperCase() + label.slice(1) : raw;
      return { key: raw, title, value: String(v ?? "").trim() };
    });

  if (noteEntries.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <div className="text-sm font-semibold text-amber-900">Catatan Pemeriksa</div>
      <div className="mt-1 text-xs text-amber-900/80">Catatan berikut diberikan oleh petugas pemeriksa apabila diperlukan.</div>
      <div className="mt-2 space-y-2">
        {noteEntries.map((n) => (
          <div key={n.key} className="rounded-xl border border-amber-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-800">{n.title}</div>
            <div className="mt-1 text-sm text-slate-800">{n.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PemohonMoU() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({ baru: false, renew: false });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [activeTab, setActiveTab] = useState("baru"); // "baru" | "renew" | "history"

  const [jejaring, setJejaring] = useState(null);
  const [lastBaru, setLastBaru] = useState(null);
  const [lastRenew, setLastRenew] = useState(null);

  const [historyRows, setHistoryRows] = useState([]);
  const [historyOpenId, setHistoryOpenId] = useState(null);

  // edit mode
  const [editBaruId, setEditBaruId] = useState(null);
  const [editRenewId, setEditRenewId] = useState(null);

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
      // 1) Jejaring milik pemohon
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

      // 4) Riwayat (data lengkap)
      const { data: hist, error: he } = await supabase
        .from("permohonan_mou")
        .select("*")
        .eq("pemohon_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (he) throw he;
      setHistoryRows(Array.isArray(hist) ? hist : []);

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
    // kalau sedang edit permohonan BARU yang sama, jangan lock karena anti-spam
    if (editBaruId) return false;

    if (lastRenew?.id) return true;
    if (jejaring?.id) return true;
    if (lastBaru?.id && isActiveStatus(lastBaru.status_pengajuan)) return true;
    return false;
  }, [editBaruId, lastRenew?.id, jejaring?.id, lastBaru]);

  const lockRenew = useMemo(() => {
    // kalau sedang edit permohonan PERPANJANGAN yang sama, jangan lock karena anti-spam
    if (editRenewId) return false;

    if (!jejaring?.id) return true;
    if (!renewWindow.ok) return true;
    if (lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan)) return true;
    return false;
  }, [editRenewId, jejaring?.id, renewWindow.ok, lastRenew]);

  // biar user nggak nyangkut di tab yang terkunci total
  useEffect(() => {
    if (activeTab === "baru" && lockBaru && !lockRenew) setActiveTab("renew");
    if (activeTab === "renew" && lockRenew && !lockBaru) setActiveTab("baru");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockBaru, lockRenew]);

  // UI status
  const statusBaru = lastBaru
    ? `Terakhir diajukan: ${fmtDateTime(lastBaru.created_at)} • Status: ${String(lastBaru.status_pengajuan || "—")}`
    : "Belum ada permohonan MoU Baru.";

  const statusRenew = lastRenew
    ? `Terakhir diajukan: ${fmtDateTime(lastRenew.created_at)} • Status: ${String(lastRenew.status_pengajuan || "—")}`
    : "Belum ada permohonan Perpanjangan.";

  const renewInfo = renewWindow.unlockAt
    ? `Perpanjangan dapat diajukan mulai ${fmtDate(renewWindow.unlockAt)} (H-365 sebelum masa berlaku berakhir).`
    : "Perpanjangan dapat diajukan setelah MoU difinalisasi dan masa berlakunya tersedia.";

  const lockReasonBaru = useMemo(() => {
    if (editBaruId) return "Sedang membuka mode koreksi permohonan. Silakan perbarui data dan simpan perubahan.";
    if (lastRenew?.id) return "Terkunci karena telah terdapat pengajuan perpanjangan sebelumnya.";
    if (jejaring?.id) return "Terkunci karena MoU telah difinalisasi.";
    if (lastBaru?.id && isActiveStatus(lastBaru.status_pengajuan)) {
      return `Terkunci karena masih ada permohonan MoU Baru yang sedang diproses (status: ${lastBaru.status_pengajuan}).`;
    }
    return "—";
  }, [editBaruId, lastRenew?.id, jejaring?.id, lastBaru]);

  const lockReasonRenew = useMemo(() => {
    if (editRenewId) return "Sedang membuka mode koreksi permohonan. Silakan perbarui data dan simpan perubahan.";
    if (!jejaring?.id) return "Terkunci karena belum ada MoU yang difinalisasi.";
    if (!renewWindow.ok) return renewInfo;
    if (lastRenew?.id && isActiveStatus(lastRenew.status_pengajuan)) {
      return `Terkunci karena masih ada permohonan perpanjangan yang sedang diproses (status: ${lastRenew.status_pengajuan}).`;
    }
    return "—";
  }, [editRenewId, jejaring?.id, renewWindow.ok, lastRenew, renewInfo]);

  function resetEdit() {
    setEditBaruId(null);
    setEditRenewId(null);
  }

  function pickFormPayload(form) {
    // payload yang dikirim ke permohonan_mou
    // (usahakan selaras dengan JejaringFormFields)
    const payload = { ...form };
    // normalisasi
    if (payload.lat === "") payload.lat = null;
    if (payload.lng === "") payload.lng = null;
    return payload;
  }

  async function submitBaru() {
    if (!user?.id) return;
    setBusy((p) => ({ ...p, baru: true }));
    setErr("");
    setOk("");

    try {
      const payload = {
        pemohon_id: user.id,
        jenis_pengajuan: "BARU",
        status_pengajuan: "REVIEW_ADMIN",
        gdrive_url: String(gdriveBaru || "").trim() || null,
        ...pickFormPayload(formBaru),
      };

      // UPDATE jika mode edit
      if (editBaruId) {
        const { error } = await supabase.from("permohonan_mou").update(payload).eq("id", editBaruId);
        if (error) throw error;
        setOk("Perubahan permohonan MoU Baru berhasil disimpan.");
      } else {
        const { error } = await supabase.from("permohonan_mou").insert(payload);
        if (error) throw error;
        setOk("Permohonan MoU Baru berhasil diajukan.");
      }

      resetEdit();
      await loadAll();
      setActiveTab("history");
    } catch (e) {
      setErr(e?.message || "Gagal mengirim permohonan.");
    } finally {
      setBusy((p) => ({ ...p, baru: false }));
    }
  }

  async function submitRenew() {
    if (!user?.id) return;
    setBusy((p) => ({ ...p, renew: true }));
    setErr("");
    setOk("");

    try {
      const payload = {
        pemohon_id: user.id,
        jenis_pengajuan: "PERPANJANGAN",
        status_pengajuan: "REVIEW_ADMIN",
        gdrive_url: String(gdriveRenew || "").trim() || null,
        // pastikan renew nempel ke jejaring yang ada
        target_jejaring_id: jejaring?.id || null,
        ...pickFormPayload(formRenew),
      };

      if (editRenewId) {
        const { error } = await supabase.from("permohonan_mou").update(payload).eq("id", editRenewId);
        if (error) throw error;
        setOk("Perubahan permohonan perpanjangan berhasil disimpan.");
      } else {
        const { error } = await supabase.from("permohonan_mou").insert(payload);
        if (error) throw error;
        setOk("Permohonan perpanjangan berhasil diajukan.");
      }

      resetEdit();
      await loadAll();
      setActiveTab("history");
    } catch (e) {
      setErr(e?.message || "Gagal mengirim permohonan.");
    } finally {
      setBusy((p) => ({ ...p, renew: false }));
    }
  }

  function loadRowToBaru(row, { asEdit } = { asEdit: true }) {
    if (!row) return;
    setFormBaru((p) => ({ ...p, ...row, is_verified: false }));
    setGdriveBaru(String(row.gdrive_url || ""));
    setEditBaruId(asEdit ? row.id : null);
    if (!asEdit) setEditBaruId(null);
    setActiveTab("baru");
  }

  function loadRowToRenew(row, { asEdit } = { asEdit: true, keepTarget: true }) {
    if (!row) return;
    setFormRenew((p) => ({ ...p, ...row, is_verified: false }));
    setGdriveRenew(String(row.gdrive_url || ""));
    setEditRenewId(asEdit ? row.id : null);
    setActiveTab("renew");
  }

  function exportRowToRenew(row) {
    if (!row) return;
    // ekspor = muat data ke form perpanjangan sebagai draft baru (bukan edit row lama)
    setFormRenew((p) => ({ ...p, ...row, is_verified: false }));
    setGdriveRenew(String(row.gdrive_url || ""));
    setEditRenewId(null);
    setActiveTab("renew");
  }

  function downloadJson(row) {
    const blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `permohonan_mou_${row?.id || "data"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const historyOpenRow = useMemo(
    () => historyRows.find((r) => String(r.id) === String(historyOpenId)) || null,
    [historyRows, historyOpenId]
  );

  if (!user?.id) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">MoU: Pengajuan & Perpanjangan</div>
        <div className="mt-2 text-sm text-slate-700">Silakan masuk terlebih dahulu untuk mengajukan permohonan.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-xl font-semibold">MoU: Pengajuan & Perpanjangan</div>
        <div className="mt-1 text-sm text-slate-700">
          Sistem menyediakan dua jalur permohonan (MoU Baru dan Perpanjangan). Permohonan akan terbuka atau terkunci secara otomatis sesuai ketentuan.
        </div>

        <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold">Status MoU</div>
          <div className="mt-1 text-sm text-slate-700">{jejaring?.id ? "MoU telah difinalisasi." : "Belum ada MoU yang difinalisasi."}</div>
        </div>

        {err ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div> : null}
        {ok ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{ok}</div> : null}

        {/* Tabs */}
        <div className="mt-6 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("baru")}
              className={[
                "rounded-t-xl border px-4 py-2 text-sm font-semibold",
                activeTab === "baru" ? "border-b-white bg-white" : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              Pengajuan MoU Baru <LockBadge locked={lockBaru} />
            </button>

            <button
              onClick={() => setActiveTab("renew")}
              className={[
                "rounded-t-xl border px-4 py-2 text-sm font-semibold",
                activeTab === "renew" ? "border-b-white bg-white" : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              Perpanjangan MoU <LockBadge locked={lockRenew} />
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={[
                "rounded-t-xl border px-4 py-2 text-sm font-semibold",
                activeTab === "history" ? "border-b-white bg-white" : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              Riwayat Pengajuan <span className="ml-2 rounded-full border bg-white px-2 py-0.5 text-xs">{historyRows.length}</span>
            </button>

            <div className="ml-auto hidden items-center text-xs text-slate-500 md:flex">Pilih salah satu tab untuk melanjutkan.</div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-700">Memuat data…</div>
          ) : null}

          {/* TAB: BARU */}
          {activeTab === "baru" && !loading ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Status Permohonan</div>
                  <div className="mt-1 text-sm text-slate-700">{statusBaru}</div>
                </div>
                {editBaruId ? (
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                    onClick={() => {
                      setEditBaruId(null);
                      setFormBaru(DEFAULT_FORM);
                      setGdriveBaru("");
                    }}
                  >
                    Batalkan Koreksi
                  </button>
                ) : null}
              </div>

              {lockBaru ? (
                <HintBox>
                  <div className="font-semibold">Form terkunci</div>
                  <div className="mt-1">{lockReasonBaru}</div>
                </HintBox>
              ) : (
                <HintBox>
                  <div className="font-semibold">Petunjuk pengisian</div>
                  <div className="mt-1">Lengkapi data fasilitas dan informasi MoU. Pastikan tautan berkas pendukung (misalnya Google Drive) sudah dapat diakses.</div>
                </HintBox>
              )}

              {!lockBaru ? (
                <div className="mt-4">
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="mb-3 text-sm font-semibold">Data Permohonan</div>
                    <JejaringFormFields
                      form={formBaru}
                      setField={setBaruField}
                      mode="pemohon"
                    />

                    <div className="mt-4">
                      <label className="text-sm font-semibold">Tautan Berkas (Google Drive)</label>
                      <input
                        value={gdriveBaru}
                        onChange={(e) => setGdriveBaru(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                      <div className="mt-2 text-xs text-slate-500">Pastikan pengaturan berbagi sudah sesuai (dapat diakses petugas pemeriksa).</div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={submitBaru}
                        disabled={busy.baru}
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {busy.baru ? "Memproses…" : editBaruId ? "Simpan Perubahan" : "Ajukan Permohonan"}
                      </button>
                      <button
                        onClick={() => {
                          setFormBaru(DEFAULT_FORM);
                          setGdriveBaru("");
                          setEditBaruId(null);
                        }}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* TAB: RENEW */}
          {activeTab === "renew" && !loading ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Status Permohonan</div>
                  <div className="mt-1 text-sm text-slate-700">{statusRenew}</div>
                  <div className="mt-1 text-xs text-slate-500">{renewInfo}</div>
                </div>
                {editRenewId ? (
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                    onClick={() => {
                      setEditRenewId(null);
                      setFormRenew(DEFAULT_FORM);
                      setGdriveRenew("");
                      if (jejaring?.id) setFormRenew((p) => ({ ...p, ...jejaring, is_verified: false }));
                    }}
                  >
                    Batalkan Koreksi
                  </button>
                ) : null}
              </div>

              {lockRenew ? (
                <HintBox>
                  <div className="font-semibold">Form terkunci</div>
                  <div className="mt-1">{lockReasonRenew}</div>
                </HintBox>
              ) : (
                <HintBox>
                  <div className="font-semibold">Petunjuk pengisian</div>
                  <div className="mt-1">Periksa kembali data fasilitas, masa berlaku MoU, dan tautan berkas pendukung sebelum mengajukan perpanjangan.</div>
                </HintBox>
              )}

              {!lockRenew ? (
                <div className="mt-4">
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="mb-3 text-sm font-semibold">Data Perpanjangan</div>
                    <JejaringFormFields
                      form={formRenew}
                      setField={setRenewField}
                      mode="pemohon"
                    />

                    <div className="mt-4">
                      <label className="text-sm font-semibold">Tautan Berkas (Google Drive)</label>
                      <input
                        value={gdriveRenew}
                        onChange={(e) => setGdriveRenew(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                      <div className="mt-2 text-xs text-slate-500">Pastikan pengaturan berbagi sudah sesuai (dapat diakses petugas pemeriksa).</div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={submitRenew}
                        disabled={busy.renew}
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {busy.renew ? "Memproses…" : editRenewId ? "Simpan Perubahan" : "Ajukan Perpanjangan"}
                      </button>
                      <button
                        onClick={() => {
                          setFormRenew(DEFAULT_FORM);
                          setGdriveRenew("");
                          setEditRenewId(null);
                          if (jejaring?.id) setFormRenew((p) => ({ ...p, ...jejaring, is_verified: false }));
                        }}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* TAB: HISTORY */}
          {activeTab === "history" && !loading ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Riwayat Pengajuan</div>
                  <div className="mt-1 text-sm text-slate-700">
                    Daftar berikut memuat seluruh permohonan yang pernah diajukan. Riwayat dapat digunakan untuk memahami alasan penguncian form, serta untuk melakukan koreksi apabila diperlukan.
                  </div>
                </div>
                <button onClick={loadAll} className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5">Refresh</button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-semibold">Pengajuan MoU Baru</div>
                  <div className="mt-1 text-xs text-slate-600">{lockBaru ? `Status: Terkunci. ${lockReasonBaru}` : "Status: Dibuka."}</div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-semibold">Perpanjangan MoU</div>
                  <div className="mt-1 text-xs text-slate-600">{lockRenew ? `Status: Terkunci. ${lockReasonRenew}` : "Status: Dibuka."}</div>
                </div>
              </div>

              {historyRows.length === 0 ? (
                <div className="mt-4 rounded-2xl border bg-white p-6 text-sm text-slate-700">Belum terdapat riwayat permohonan.</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {historyRows.map((row) => {
                    const jenis = String(row.jenis_pengajuan || "").toUpperCase();
                    const status = String(row.status_pengajuan || "—");
                    const editable = isEditableStatus(status);
                    return (
                      <div key={row.id} className="rounded-2xl border bg-white p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-sm font-semibold">
                              {jenis === "PERPANJANGAN" ? "Perpanjangan MoU" : "Permohonan MoU Baru"}
                              <span className="ml-2 rounded-lg border bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{status}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-600">Diajukan: {fmtDateTime(row.created_at)}</div>
                            <div className="mt-2 text-sm text-slate-800">
                              <span className="font-semibold">Nama Fasyankes:</span> {row.nama_fasyankes || "—"}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              {row.kelurahan ? `Kelurahan ${row.kelurahan}` : "—"}
                              {row.kecamatan ? ` • Kecamatan ${row.kecamatan}` : ""}
                            </div>
                            {row.gdrive_url ? (
                              <div className="mt-1 text-xs">
                                <a className="text-emerald-700 hover:underline" href={row.gdrive_url} target="_blank" rel="noreferrer">
                                  Tautan berkas pendukung
                                </a>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                              onClick={() => setHistoryOpenId((p) => (String(p) === String(row.id) ? null : row.id))}
                            >
                              {String(historyOpenId) === String(row.id) ? "Tutup Detail" : "Lihat Detail"}
                            </button>

                            <button
                              className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
                              disabled={!editable}
                              onClick={() => {
                                if (jenis === "PERPANJANGAN") loadRowToRenew(row, { asEdit: true });
                                else loadRowToBaru(row, { asEdit: true });
                              }}
                              title={editable ? "" : "Permohonan yang telah difinalisasi/selesai tidak dapat diedit."}
                            >
                              Koreksi (Edit)
                            </button>

                            <button
                              className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                              onClick={() => exportRowToRenew(row)}
                            >
                              Ekspor ke Perpanjangan
                            </button>

                            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5" onClick={() => downloadJson(row)}>
                              Unduh JSON
                            </button>
                          </div>
                        </div>

                        {String(historyOpenId) === String(row.id) ? (
                          <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                            <div className="text-sm font-semibold">Rincian Data yang Diajukan</div>
                            <div className="mt-2 grid gap-2 md:grid-cols-2">
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">Jenis Fasyankes</div>
                                <div className="mt-1 text-sm text-slate-900">{row.jenis_fasyankes || "—"}</div>
                              </div>
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">Tipe Fasyankes</div>
                                <div className="mt-1 text-sm text-slate-900">{row.tipe_fasyankes || "—"}</div>
                              </div>
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">Alamat</div>
                                <div className="mt-1 text-sm text-slate-900">{row.alamat || "—"}</div>
                              </div>
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">Kontak</div>
                                <div className="mt-1 text-sm text-slate-900">
                                  {row.telepon ? `Telp: ${row.telepon}` : "Telp: —"}
                                  {row.email ? ` • Email: ${row.email}` : ""}
                                </div>
                              </div>
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">MoU</div>
                                <div className="mt-1 text-sm text-slate-900">
                                  {row.mou_nomor ? `Nomor: ${row.mou_nomor}` : "Nomor: —"}
                                  <div className="mt-1 text-xs text-slate-600">
                                    Mulai: {fmtDate(row.mou_mulai)} • Berakhir: {fmtDate(row.mou_akhir)}
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-xl border bg-white p-3">
                                <div className="text-xs font-semibold text-slate-700">Lokasi</div>
                                <div className="mt-1 text-sm text-slate-900">
                                  {row.lat && row.lng ? `(${row.lat}, ${row.lng})` : "—"}
                                </div>
                              </div>
                            </div>

                            <NotesPanel row={row} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500">
                Catatan: Apabila terdapat kesalahan data, gunakan tombol <span className="font-semibold">Koreksi (Edit)</span> pada item riwayat terkait, lalu simpan perubahan.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
