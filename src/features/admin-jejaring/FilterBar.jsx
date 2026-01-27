import React, { useMemo } from "react";

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
        />
        <Select
          label="Jenis"
          value={filters.jenis}
          onChange={(v) => setFilters((p) => ({ ...p, jenis: v }))}
          options={jenisOptions}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          options={statusOptions}
        />
        <Select
          label="MOU"
          value={filters.mou}
          onChange={(v) => setFilters((p) => ({ ...p, mou: v }))}
          options={["ALL", "GREEN", "AMBER", "YELLOW", "RED", "EXPIRED", "NA"]}
        />

        <button
          type="button"
          onClick={() =>
            setFilters({
              kelurahan: "ALL",
              jenis: "ALL",
              status: "ALL",
              mou: "ALL",
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
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
            {o === "ALL" ? "Semua" : o}
          </option>
        ))}
      </select>
    </label>
  );
}
