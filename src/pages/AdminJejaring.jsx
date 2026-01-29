import React, { useEffect, useMemo, useState } from "react";
import { CREATE_DEFAULTS } from "../features/admin-jejaring/constants";
import { createJejaring, deleteJejaring } from "../features/admin-jejaring/api";
import { exportRowsToExcel } from "../features/admin-jejaring/exportExcel";
import {
  filterRows,
  normalizeJejaringPayload,
  pickDisplayColumns,
  validateJejaring,
  formatCellValue,
  getRowKey,
  getExpiryCategory,
  expiryTextClass,
} from "../features/admin-jejaring/utils";
import { useJejaringList } from "../features/admin-jejaring/useJejaringList";
import JejaringFormFields from "../features/admin-jejaring/JejaringFormFields";
import EditJejaringModal from "../features/admin-jejaring/EditJejaringModal";
import ConfirmDialog from "../features/admin-jejaring/ConfirmDialog";
import FilterBar from "../features/admin-jejaring/FilterBar";
import { useAuth } from "../context/AuthContext";

function userLabel(user) {
  const email = user?.email || "";
  return email || "Admin";
}

function slug(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

const CREATE_DRAFT_KEY = "jp_admin_create_jejaring_draft_v1";
const CREATE_AUTOSAVE_MS = 1000; // 1 detik setelah user berhenti ngetik

export default function AdminJejaring() {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { rows, count, page, setPage, pageCount, loading, refreshing, error, fetchPage } =
    useJejaringList();

  const [search, setSearch] = useState("");

  // FILTER state
  const [filters, setFilters] = useState({
    kelurahan: "ALL",
    jenis: "ALL",
    status: "ALL",
    mou: "ALL",
    izin: "ALL",
  });

  // MOBILE: filter collapse
  const [showFilters, setShowFilters] = useState(false);

  // CREATE
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(CREATE_DEFAULTS);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");

  // ===== Draft autosave (CREATE) =====
  useEffect(() => {
    // restore draft sekali saat mount
    const saved = sessionStorage.getItem(CREATE_DRAFT_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      // merge ke defaults biar field baru tetap ada
      setCreateForm({ ...CREATE_DEFAULTS, ...(parsed || {}) });
    } catch {
      // ignore corrupted draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(createForm));
      } catch {
        // ignore
      }
    }, CREATE_AUTOSAVE_MS);

    return () => clearTimeout(t);
  }, [createForm]);

  // EDIT
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // EXPORT
  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState("");

  // DELETE
  const [delOpen, setDelOpen] = useState(false);
  const [delRow, setDelRow] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState("");

  const displayColumns = useMemo(() => pickDisplayColumns(rows), [rows]);

  const filteredRows = useMemo(() => {
    let out = filterRows(rows, search);

    out = out.filter((r) => {
      if (filters.kelurahan !== "ALL" && r.kelurahan !== filters.kelurahan) return false;
      if (filters.jenis !== "ALL" && r.jenis_fasyankes !== filters.jenis) return false;
      if (filters.status !== "ALL" && r.status !== filters.status) return false;

      if (filters.mou !== "ALL") {
        const cat = getExpiryCategory(r?.mou_akhir ?? null).cat;
        if (cat !== filters.mou) return false;
      }

      if (filters.izin !== "ALL") {
        const cat = getExpiryCategory(r?.izin_berakhir ?? null).cat;
        if (cat !== filters.izin) return false;
      }

      return true;
    });

    return out;
  }, [rows, search, filters]);

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
      sessionStorage.removeItem(CREATE_DRAFT_KEY);
      setCreateForm(CREATE_DEFAULTS);
      setPage(1);
      await fetchPage({ isRefresh: true });
      setShowCreate(false);
    } catch (e2) {
      const msg = e2?.message || "Gagal menambahkan data.";
      setCreateError(
        msg.includes("violates not-null constraint")
          ? `${msg}\n\nCatatan: database punya kolom wajib (NOT NULL) yang belum ada di form. Tambahkan field tersebut di form sebelum insert bisa berhasil.`
          : msg
      );
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

  async function onExportExcel() {
    setExportErr("");
    setExporting(true);

    try {
      const rowsToExport = filteredRows;

      if (!rowsToExport?.length) {
        setExportErr("Tidak ada data untuk diexport (hasil filter kosong).");
        return;
      }

      const tagKel = filters.kelurahan !== "ALL" ? `_kel-${slug(filters.kelurahan)}` : "";
      const tagJenis = filters.jenis !== "ALL" ? `_jenis-${slug(filters.jenis)}` : "";
      const tagStatus = filters.status !== "ALL" ? `_status-${slug(filters.status)}` : "";
      const tagMou = filters.mou !== "ALL" ? `_mou-${filters.mou}` : "";
      const tagIzin = filters.izin !== "ALL" ? `_izin-${filters.izin}` : "";

      await exportRowsToExcel(rowsToExport, {
        filename: `jejaring${tagKel}${tagJenis}${tagStatus}${tagMou}${tagIzin}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
        sheetName: "Jejaring (Filtered)",
      });
    } catch (e) {
      setExportErr(e?.message || "Gagal export Excel.");
    } finally {
      setExporting(false);
    }
  }

  function renderCell(col, value) {
    const text = formatCellValue(value);
    if (col === "mou_akhir" || col === "izin_berakhir") {
      return <span className={expiryTextClass(value)}>{text}</span>;
    }
    return text;
  }

  const anyFilterActive =
    !!search.trim() ||
    filters.kelurahan !== "ALL" ||
    filters.jenis !== "ALL" ||
    filters.status !== "ALL" ||
    filters.mou !== "ALL" ||
    filters.izin !== "ALL";

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-6">
      {/* Admin bar (mobile compact + desktop detailed) */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
        {/* MOBILE */}
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Admin
            </span>
            <span className="min-w-0 truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              {userLabel(user)}
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        {/* DESKTOP/TABLET */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Mode: Admin
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              Signed in: <span className="font-semibold">{userLabel(user)}</span>
            </span>
            {!isAdmin ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Warning: bukan admin
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={signOut}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin Jejaring</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data <span className="font-mono">jejaring_fasyankes</span>.
          </p>
        </div>

        {/* Actions (mobile-friendly) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search full width on mobile */}
          <div className="relative w-full sm:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search (client-side)…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-slate-300 sm:w-65"
            />
            <div className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
              ⌕
            </div>
          </div>

          {/* Buttons: grid on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">

            <button
              type="button"
              onClick={() => fetchPage({ isRefresh: true })}
              disabled={loading || refreshing}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              disabled={exporting || loading}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
              title="Export sesuai filter yang aktif"
            >
              {exporting ? "Export…" : "Export"}
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(CREATE_DRAFT_KEY);
                setCreateOk("");
                setCreateError("");
                setShowCreate((v) => !v);
              }}
              className="col-span-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {showCreate ? "Tutup" : "+ Tambah"}
            </button>
          </div>
        </div>
      </div>

      {exportErr ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="font-semibold">Export gagal:</span> {exportErr}
        </div>
      ) : null}

      {/* FILTER BAR (collapsible on mobile) */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 sm:hidden"
        >
          {showFilters ? "Tutup Filter" : "Tampilkan Filter"}
        </button>

        <div className={showFilters ? "block" : "hidden sm:block"}>
          <FilterBar rows={rows} filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* CREATE */}
      {showCreate ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">Tambah Fasyankes</div>
          <div className="mt-1 text-xs text-slate-500">* Bertanda bintang wajib diisi.</div>

          <form onSubmit={onCreate} className="mt-4 space-y-3">
            <JejaringFormFields
              value={createForm}
              onChange={(k, v) => setCreateForm((p) => ({ ...p, [k]: v }))}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="whitespace-pre-line text-xs">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm(CREATE_DEFAULTS);
                    setCreateOk("");
                    setCreateError("");
                    setShowCreate(false);
                  }}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {creating ? "Menyimpan…" : "Tambah"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {/* Status */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            Total data: <span className="font-semibold">{loading ? "…" : count}</span>
            <span className="mx-2 text-slate-300">•</span>
            Page: <span className="font-semibold">{page}</span> /{" "}
            <span className="font-semibold">{pageCount}</span>
            {anyFilterActive ? (
              <>
                <span className="mx-2 text-slate-300">•</span>
                Hasil filter (di page ini):{" "}
                <span className="font-semibold">{filteredRows.length}</span>
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

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">Data Jejaring</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading…</div>
        ) : !filteredRows.length ? (
          <div className="p-6 text-sm text-slate-600">
            {rows.length
              ? "Tidak ada hasil untuk filter di page ini."
              : "Belum ada data (atau query kosong)."}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse md:min-w-245">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-30 whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    Aksi
                  </th>
                  {displayColumns.map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-700"
                    >
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
                      <td className="sticky left-0 z-20 whitespace-nowrap border-r border-slate-200 bg-white px-4 py-3 align-top text-sm">
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
                          >
                            Hapus
                          </button>
                        </div>
                      </td>

                      {displayColumns.map((col) => (
                        <td
                          key={col}
                          className="max-w-[320px] truncate px-4 py-3 align-top text-sm text-slate-800"
                          title={formatCellValue(row[col])}
                        >
                          {renderCell(col, row[col])}
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

      {/* Modals */}
      <EditJejaringModal
        open={editOpen}
        row={editRow}
        onClose={() => {
          setEditOpen(false);
          setEditRow(null);
        }}
        onSaved={() => fetchPage({ isRefresh: true })}
      />

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

      {delErr ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="font-semibold">Gagal hapus:</span> {delErr}
        </div>
      ) : null}
    </div>
  );
}
