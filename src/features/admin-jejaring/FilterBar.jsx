import React, { useMemo } from "react";

const EXPIRY_OPTIONS = ["ALL", "GT12M", "12M", "6M", "3M", "EXPIRED", "NA"];

const EXPIRY_LABELS = {
  ALL: "Semua",
  GT12M: "> 1 tahun",
  "12M": "6–12 bulan",
  "6M": "≤ 6 bulan",
  "3M": "≤ 3 bulan",
  EXPIRED: "Expired",
  NA: "NA / Kosong",
};

export default function FilterBar({ rows, filters, setFilters }) {
  const kelurahanOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r.kelurahan).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [rows]);

  const jenisOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r.jenis_fasyankes).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [rows]);

  const statusOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r.status).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [rows]);

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm font-semibold text-slate-800">Filter</div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          label="Kelurahan"
          value={filters.kelurahan}
          onChange={(v) => setFilters((p) => ({ ...p, kelurahan: v }))}
          options={kelurahanOptions}
          labels={{ ALL: "Semua" }}
        />

        <Select
          label="Jenis"
          value={filters.jenis}
          onChange={(v) => setFilters((p) => ({ ...p, jenis: v }))}
          options={jenisOptions}
          labels={{ ALL: "Semua" }}
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          options={statusOptions}
          labels={{ ALL: "Semua" }}
        />

        <Select
          label="MOU"
          value={filters.mou}
          onChange={(v) => setFilters((p) => ({ ...p, mou: v }))}
          options={EXPIRY_OPTIONS}
          labels={EXPIRY_LABELS}
        />

        <Select
          label="Izin"
          value={filters.izin}
          onChange={(v) => setFilters((p) => ({ ...p, izin: v }))}
          options={EXPIRY_OPTIONS}
          labels={EXPIRY_LABELS}
        />

        <button
          type="button"
          onClick={() =>
            setFilters((p) => ({
              ...p,
              kelurahan: "ALL",
              jenis: "ALL",
              status: "ALL",
              mou: "ALL",
              izin: "ALL",
            }))
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, labels }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? (o === "ALL" ? "Semua" : o)}
          </option>
        ))}
      </select>
    </label>
  );
}
