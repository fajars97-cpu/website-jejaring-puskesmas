import React, { useMemo, useState } from "react";
import { CREATE_DEFAULTS } from "../features/admin-jejaring/constants";
import { createJejaring, deleteJejaring } from "../features/admin-jejaring/api";
import {
  filterRows,
  normalizeJejaringPayload,
  pickDisplayColumns,
  validateJejaring,
  formatCellValue,
  getRowKey,
} from "../features/admin-jejaring/utils";
import { useJejaringList } from "../features/admin-jejaring/useJejaringList";
import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields";
import EditJejaringModal from "../features/admin-jejaring/EditJejaringModal";
import ConfirmDialog from "../features/admin-jejaring/ConfirmDialog";

export default function AdminJejaring() {
  const { rows, count, page, setPage, pageCount, loading, refreshing, error, fetchPage } = useJejaringList();

  const [search, setSearch] = useState("");
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // delete confirm
  const [delOpen, setDelOpen] = useState(false);
  const [delRow, setDelRow] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState("");

  const displayColumns = useMemo(() => pickDisplayColumns(rows), [rows]);
  const filteredRows = useMemo(() => filterRows(rows, search), [rows, search]);

  async function onCreate(e) {
    e.preventDefault();
    setCreateOk("");
    setCreateError("");

    const v = validateJejaring(createForm);
    if (v) return setCreateError(v);

    const payload = normalizeJejaringPayload(createForm);

    setCreating(true);
    try {
      await createJejaring(payload);
      setCreateOk("Data berhasil ditambahkan.");
      setCreateForm(CREATE_DEFAULTS);
      setPage(1);
      await fetchPage({ isRefresh: true });
    } catch (e2) {
      setCreateError(e2?.message || "Gagal menambahkan data.");
    } finally {
      setCreating(false);
    }
  }

  function requestDelete(row) {
    setDelErr("");
    setDelRow(row);
    setDelOpen(true);
  }

  async function doDelete() {
    setDelErr("");
    if (!delRow) return;

    const key = getRowKey(delRow);
    if (!key) {
      setDelErr("Tidak menemukan primary key (id/uuid) untuk row ini.");
      return;
    }

    setDeleting(true);
    try {
      await deleteJejaring(key.pk, key.value);
      setDelOpen(false);
      setDelRow(null);
      await fetchPage({ isRefresh: true });
    } catch (e2) {
      setDelErr(e2?.message || "Gagal menghapus data.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin Jejaring</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data <span className="font-mono">jejaring_fasyankes</span> (Step 8.3: Delete + confirm).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search (client-side)…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-slate-300"
            />
            <div className="pointer-events-none absolute right-3 top-2.5 text-slate-400">⌕</div>
          </div>

          <button
            type="button"
            onClick={() => fetchPage({ isRefresh: true })}
            disabled={loading || refreshing}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* CREATE */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">Tambah Jejaring</div>
        <div className="mt-1 text-xs text-slate-500">
          Minimal kolom: nama, alamat, kelurahan, kecamatan, lat, lng. Telepon/email opsional.
        </div>

        <form onSubmit={onCreate} className="mt-4 space-y-3">
          <JejaringFormFields
            value={createForm}
            onChange={(k, v) => setCreateForm((p) => ({ ...p, [k]: v }))}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs">
              {createError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                  <span className="font-semibold">Gagal:</span> {createError}
                </div>
              ) : createOk ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                  {createOk}
                </div>
              ) : (
                <div className="text-slate-500">Tips: lat/lng wajib angka.</div>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? "Menyimpan…" : "Tambah"}
            </button>
          </div>
        </form>
      </div>

      {/* STATUS */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            Total data: <span className="font-semibold">{loading ? "…" : count}</span>
            <span className="mx-2 text-slate-300">•</span>
            Page: <span className="font-semibold">{page}</span> / <span className="font-semibold">{pageCount}</span>
            {search.trim() ? (
              <>
                <span className="mx-2 text-slate-300">•</span>
                Hasil filter (di page ini): <span className="font-semibold">{filteredRows.length}</span>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount || loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="font-semibold">Gagal memuat data</div>
            <div className="mt-1">{error}</div>
          </div>
        ) : null}
      </div>

      {/* TABLE */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">Data Jejaring</div>
          <div className="text-xs text-slate-500">
            {displayColumns.length ? `Kolom tampil: ${displayColumns.join(", ")}` : "Menunggu data…"}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading…</div>
        ) : !filteredRows.length ? (
          <div className="p-6 text-sm text-slate-600">
            {rows.length ? "Tidak ada hasil untuk filter di page ini." : "Belum ada data (atau query kosong)."}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-245 border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {/* Aksi di kiri */}
                  <th className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    Aksi
                  </th>

                  {displayColumns.map((col) => (
                    <th key={col} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, idx) => {
                  const keyObj = getRowKey(row);
                  const canMutate = !!keyObj;
                  const rowKey = keyObj ? `${keyObj.pk}:${String(keyObj.value)}` : `${idx}`;

                  return (
                    <tr key={rowKey} className="border-b border-slate-100 hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-4 py-3 align-top text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!canMutate) return;
                              setEditRow(row);
                              setEditOpen(true);
                            }}
                            disabled={!canMutate}
                            className={
                              canMutate
                                ? "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                                : "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-400"
                            }
                            title={canMutate ? "Edit data" : "Tidak ada id/uuid untuk update"}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => canMutate && requestDelete(row)}
                            disabled={!canMutate}
                            className={
                              canMutate
                                ? "rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                                : "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-400"
                            }
                            title={canMutate ? "Hapus data" : "Tidak ada id/uuid untuk delete"}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>

                      {displayColumns.map((col) => (
                        <td key={col} className="max-w-[320px] truncate px-4 py-3 align-top text-sm text-slate-800" title={formatCellValue(row[col])}>
                          {formatCellValue(row[col])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditJejaringModal
        open={editOpen}
        row={editRow}
        onClose={() => {
          setEditOpen(false);
          setEditRow(null);
        }}
        onSaved={() => fetchPage({ isRefresh: true })}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={delOpen}
        title="Konfirmasi Hapus"
        description={
          delRow
            ? `Yakin hapus data ini?\n\n${delRow.nama_fasyankes || "(tanpa nama)"}`
            : "Yakin hapus data ini?"
        }
        confirmText="Ya, hapus"
        cancelText="Batal"
        danger
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDelOpen(false);
          setDelRow(null);
          setDelErr("");
        }}
        onConfirm={doDelete}
      />

      {/* Delete error toast-like (opsional) */}
      {delErr ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="font-semibold">Gagal hapus:</span> {delErr}
        </div>
      ) : null}
    </div>
  );
}
