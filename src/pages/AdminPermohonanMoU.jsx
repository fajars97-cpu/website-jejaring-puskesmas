import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields";
import { CREATE_DEFAULTS } from "../features/admin-jejaring/constants";

const STATUS = [
  "SUBMITTED",
  "REVIEW_ADMIN",
  "SCHEDULED_VISIT",
  "VISIT_DONE",
  "FOLLOW_UP",
  "EVIDENCE_UPLOADED",
  "VERIFIED",
  "SIGNING_INVITED",
];

function isLikelyUrl(url) {
  const s = String(url ?? "").trim();
  if (!s) return false;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function formatCell(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  const s = String(v);
  return s.trim() ? s : "—";
}

function includesQ(row, q) {
  if (!q) return true;
  const keys = [
    "nama_fasyankes",
    "jenis_fasyankes",
    "tipe_fasyankes",
    "kelurahan",
    "alamat",
    "email",
    "telepon",
    "jenis_pengajuan",
    "status_pengajuan",
  ];
  return keys.some((k) => String(row?.[k] ?? "").toLowerCase().includes(q));
}

function toIdDate(isoLike) {
  const s = String(isoLike ?? "");
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.slice(0, 10);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function normalizeRowForForm(row) {
  // memastikan semua field form tampil (walau null / tidak ada)
  return {
    ...CREATE_DEFAULTS,
    ...(row || {}),
  };
}

export default function AdminPermohonanMoU() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  // drawer detail
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  // admin note (single note) stored in admin_notes.note
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteErr, setNoteErr] = useState("");

  // finalize (tetap pakai flow existing kamu)
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalizeRow, setFinalizeRow] = useState(null);
  const [mouNomor, setMouNomor] = useState("");
  const [mouMulai, setMouMulai] = useState("");
  const [mouAkhir, setMouAkhir] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeErr, setFinalizeErr] = useState("");

  async function load({ silent = false } = {}) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setErr("");
    try {
      const { data, error } = await supabase
        .from("permohonan_mou")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat permohonan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (status === "ALL" ? true : r.status_pengajuan === status))
      .filter((r) => includesQ(r, qq));
  }, [rows, q, status]);

  function openDetail(row) {
    setErr("");
    setNoteErr("");
    setDetailRow({
    ...CREATE_DEFAULTS,
    ...row,
  });
    const existing = row?.admin_notes;
    const note = typeof existing === "object" && existing ? (existing.note ?? "") : "";
    setNoteDraft(String(note ?? ""));
    setDrawerOpen(true);
  }

  function closeDetail() {
    setDrawerOpen(false);
    setDetailRow(null);
    setNoteErr("");
    setNoteDraft("");
  }

  async function updateStatus(row, nextStatus) {
    setErr("");
    try {
      const { error } = await supabase
        .from("permohonan_mou")
        .update({ status_pengajuan: nextStatus })
        .eq("id", row.id);

      if (error) throw error;

      // update local list quickly
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status_pengajuan: nextStatus } : r)));

      // if row is open in drawer, keep in sync
      if (detailRow?.id === row.id) {
        setDetailRow((d) => ({ ...(d || {}), status_pengajuan: nextStatus }));
      }
    } catch (e) {
      setErr(e?.message || "Gagal memperbarui status pengajuan.");
    }
  }

  async function saveAdminNote() {
    if (!detailRow?.id) return;
    setNoteErr("");

    try {
      setNoteSaving(true);

      const prev = detailRow?.admin_notes;
      const base = typeof prev === "object" && prev ? { ...prev } : {};
      const nextNote = String(noteDraft ?? "").trim();

      if (nextNote) base.note = nextNote;
      else delete base.note;

      const { data, error } = await supabase
        .from("permohonan_mou")
        .update({ admin_notes: base })
        .eq("id", detailRow.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      const updated = data || { ...detailRow, admin_notes: base };
      setDetailRow(updated);
      setRows((prevRows) => prevRows.map((r) => (r.id === detailRow.id ? updated : r)));
    } catch (e) {
      setNoteErr(e?.message || "Gagal menyimpan catatan pemeriksa.");
    } finally {
      setNoteSaving(false);
    }
  }

  function openFinalize(row) {
    setFinalizeErr("");
    setFinalizeRow(row);
    setMouNomor("");
    setMouMulai("");
    setMouAkhir("");
    setFinalizeOpen(true);
  }

  async function doFinalize() {
    setFinalizeErr("");
    if (!finalizeRow?.id) return;

    if (!mouNomor.trim()) return setFinalizeErr("Nomor MoU wajib diisi.");
    if (!mouMulai) return setFinalizeErr("Tanggal mulai wajib diisi.");
    if (!mouAkhir) return setFinalizeErr("Tanggal akhir wajib diisi.");

    setFinalizing(true);
    try {
      const { data, error } = await supabase.rpc("finalize_permohonan_to_jejaring", {
        p_permohonan_id: finalizeRow.id,
        p_mou_nomor: mouNomor.trim(),
        p_mou_mulai: mouMulai,
        p_mou_akhir: mouAkhir,
      });

      if (error) throw error;

      setFinalizeOpen(false);
      setFinalizeRow(null);

      await load({ silent: true });
      console.log("finalized_new_jejaring_id:", data);
    } catch (e) {
      setFinalizeErr(e?.message || "Gagal finalize.");
    } finally {
      setFinalizing(false);
    }
  }

  const noteExists = (r) => {
    const n = r?.admin_notes;
    if (!n || typeof n !== "object") return false;
    return String(n.note ?? "").trim().length > 0;
  };

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 2xl:px-8 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Rekap Permohonan MoU</h1>
            <p className="mt-1 text-sm text-slate-600">
              Halaman ini menampilkan seluruh permohonan yang diajukan. Super admin dapat meninjau detail, memberikan catatan, memperbarui status, dan melakukan finalisasi.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pencarian…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 sm:w-80"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 sm:w-64"
            >
              <option value="ALL">Semua status</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Memuat ulang…" : "Refresh"}
          </button>
        </div>

        {err ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
          Data Permohonan ({loading ? "…" : filtered.length})
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600">Memuat…</div>
        ) : !filtered.length ? (
          <div className="p-6 text-sm text-slate-600">Tidak ada data.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse md:min-w-240">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-30 whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    Aksi
                  </th>
                  <Th>Nama</Th>
                  <Th>Jenis Pengajuan</Th>
                  <Th>Jenis Fasyankes</Th>
                  <Th>Tipe Fasyankes</Th>
                  <Th>Kelurahan</Th>
                  <Th>Berkas</Th>
                  <Th>Status</Th>
                  <Th>Diajukan</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="sticky left-0 z-20 whitespace-nowrap border-r border-slate-200 bg-white px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(r)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          Detail
                        </button>

                        <button
                          type="button"
                          onClick={() => openFinalize(r)}
                          className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Finalize
                        </button>

                        {noteExists(r) ? (
                          <span className="ml-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                            Ada catatan
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <Td title={r.nama_fasyankes}>{formatCell(r.nama_fasyankes)}</Td>
                    <Td>{formatCell(r.jenis_pengajuan)}</Td>
                    <Td>{formatCell(r.jenis_fasyankes)}</Td>
                    <Td>{formatCell(r.tipe_fasyankes)}</Td>
                    <Td>{formatCell(r.kelurahan)}</Td>
                    <Td>
                      {isLikelyUrl(r.gdrive_url) ? (
                        <a
                          href={r.gdrive_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        >
                          Buka
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </Td>

                    <Td>
                      <select
                        value={r.status_pengajuan}
                        onChange={(e) => updateStatus(r, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                      >
                        {STATUS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Td>

                    <Td>{String(r.submitted_at || r.created_at || "").slice(0, 10) || "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAWER DETAIL */}
      <Drawer open={drawerOpen} onClose={closeDetail} title={detailRow?.nama_fasyankes || "Detail Permohonan"}>
        {detailRow ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">Jenis Pengajuan:</span> {formatCell(detailRow.jenis_pengajuan)}
                  <span className="mx-2">•</span>
                  <span className="font-semibold">Diajukan:</span> {toIdDate(detailRow.submitted_at || detailRow.created_at)}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Status:</span>
                  </div>
                  <select
                    value={detailRow.status_pengajuan}
                    onChange={(e) => updateStatus(detailRow, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none sm:w-64"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Berkas (Google Drive) - akan dipindahkan ke form fields nanti */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Berkas (Google Drive)</div>
                {isLikelyUrl(detailRow.gdrive_url) ? (
                  <a
                    href={detailRow.gdrive_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  >
                    Buka Tautan
                  </a>
                ) : null}
              </div>
              <div className="mt-2 text-sm text-slate-700 wrap-break-word">
                {isLikelyUrl(detailRow.gdrive_url) ? detailRow.gdrive_url : "—"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Tautan berkas digunakan sebagai referensi pemeriksaan. Pastikan pengaturan akses tautan sesuai ketentuan.
              </div>
            </div>

            {/* Form lengkap (read-only) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">Rincian Data yang Diajukan</div>
              <div className="mt-3">
                <JejaringFormFields
                  value={normalizeRowForForm(detailRow)}
                  onChange={() => {}}
                  variant="admin"
                  disabled={true}
                  sections={{ verified: true, perizinan: true, mou: true, akreditasi: true, foto: true }}
                />
              </div>
            </div>

            {/* Catatan Pemeriksa (single note) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Catatan Pemeriksa</div>
                <div className="text-xs text-slate-500">Opsional</div>
              </div>

              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Tuliskan catatan apabila diperlukan (misalnya klarifikasi data, perbaikan berkas, atau tindak lanjut)."
                className="mt-3 min-h-27.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              />

              {noteErr ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{noteErr}</div>
              ) : null}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={saveAdminNote}
                  disabled={noteSaving}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {noteSaving ? "Menyimpan…" : "Simpan Catatan"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* FINALIZE MODAL */}
      {finalizeOpen && finalizeRow ? (
        <Modal
          onClose={() => (finalizing ? null : setFinalizeOpen(false))}
          title={`Finalize MoU — ${finalizeRow.nama_fasyankes}`}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nomor MoU *" value={mouNomor} onChange={setMouNomor} />
            <div />

            <Field label="MoU Mulai (YYYY-MM-DD) *" value={mouMulai} onChange={setMouMulai} type="date" />
            <Field label="MoU Akhir (YYYY-MM-DD) *" value={mouAkhir} onChange={setMouAkhir} type="date" />
          </div>

          {finalizeErr ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{finalizeErr}</div>
          ) : (
            <div className="mt-3 text-xs text-slate-500">
              Finalisasi akan memindahkan data ke <span className="font-mono">jejaring_fasyankes</span> dan menghapus data dari <span className="font-mono">permohonan_mou</span> (sesuai mekanisme saat ini).
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFinalizeOpen(false)}
              disabled={finalizing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={doFinalize}
              disabled={finalizing}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {finalizing ? "Memproses…" : "Finalize"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-700">
      {children}
    </th>
  );
}

function Td({ children, title }) {
  return (
    <td title={title} className="max-w-[320px] truncate px-4 py-3 align-top text-sm text-slate-800">
      {children}
    </td>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-700">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
      />
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-180 bg-slate-50 shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">{title}</div>
              <div className="mt-0.5 text-xs text-slate-500">Tinjau data dan catatan pemeriksa.</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
