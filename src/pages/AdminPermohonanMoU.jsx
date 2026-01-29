import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

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
    "status_pengajuan",
  ];
  return keys.some((k) => String(row?.[k] ?? "").toLowerCase().includes(q));
}

export default function AdminPermohonanMoU() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

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

  async function updateStatus(row, nextStatus) {
    setErr("");
    try {
      const { error } = await supabase
        .from("permohonan_mou")
        .update({ status_pengajuan: nextStatus })
        .eq("id", row.id);

      if (error) throw error;
      await load({ silent: true });
    } catch (e) {
      setErr(e?.message || "Gagal update status.");
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

      // permohonan terhapus otomatis, reload list
      await load({ silent: true });

      // data = id baru jejaring_fasyankes (bigint)
      // bisa kamu pakai kalau mau nav ke AdminJejaring
      console.log("finalized_new_jejaring_id:", data);
    } catch (e) {
      setFinalizeErr(e?.message || "Gagal finalize.");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Rekap Permohonan MoU</h1>
            <p className="mt-1 text-sm text-slate-600">
              Hanya super admin yang bisa review dan finalize (pindah ke jejaring & hapus permohonan).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              title="Kembali ke tabel Admin Jejaring"
            >
              ← Admin Jejaring
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
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
            {refreshing ? "Refreshing…" : "Refresh"}
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
                  <Th>Jenis</Th>
                  <Th>Tipe</Th>
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
                          onClick={() => {
                            setDetailRow(r);
                            setDetailOpen(true);
                          }}
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
                      </div>
                    </td>

                    <Td title={r.nama_fasyankes}>{formatCell(r.nama_fasyankes)}</Td>
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

      {/* DETAIL MODAL */}
      {detailOpen && detailRow ? (
        <Modal onClose={() => setDetailOpen(false)} title="Detail Permohonan">
          <div className="space-y-2 text-sm text-slate-800">
            <Row label="Nama" value={detailRow.nama_fasyankes} />
            <Row label="Jenis" value={detailRow.jenis_fasyankes} />
            <Row label="Tipe" value={detailRow.tipe_fasyankes} />
            <Row label="Alamat" value={detailRow.alamat} />
            <Row label="Kelurahan" value={detailRow.kelurahan} />
            <Row label="Status Pengajuan" value={detailRow.status_pengajuan} />
            <Row label="Lat/Lng" value={`${detailRow.lat}, ${detailRow.lng}`} />
            <Row label="Telepon" value={detailRow.telepon} />
            <Row label="Email" value={detailRow.email} />
            <Row label="Gmaps URL" value={detailRow.gmaps_url} />
            <Row label="Berkas (GDrive)" value={detailRow.gdrive_url} />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </Modal>
      ) : null}

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
              Finalize akan: insert ke <span className="font-mono">jejaring_fasyankes</span> lalu hapus dari{" "}
              <span className="font-mono">permohonan_mou</span>.
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
              {finalizing ? "Finalizing…" : "Finalize"}
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
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            ✕
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3">
      <div className="w-44 shrink-0 text-xs font-semibold text-slate-600">{label}</div>
      <div className="text-sm text-slate-900 wrap-break-word">{formatCell(value)}</div>
    </div>
  );
}
