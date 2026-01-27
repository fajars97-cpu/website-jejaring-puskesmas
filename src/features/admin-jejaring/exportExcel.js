// Export rows (array of objects) -> .xlsx download (client-side)
export async function exportRowsToExcel(rows, opts = {}) {
  const {
    filename = `jejaring_fasyankes_${new Date().toISOString().slice(0, 10)}.xlsx`,
    sheetName = "Jejaring",
  } = opts;

  // lazy load biar bundle nggak berat pas initial load
  const XLSX = await import("xlsx");

  const safeRows = Array.isArray(rows) ? rows : [];
  const normalized = normalizeRows(safeRows);

  const ws = XLSX.utils.json_to_sheet(normalized);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, filename);
}

function normalizeRows(rows) {
  // gabung semua key biar kolomnya stabil
  const keys = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r || {}).forEach((k) => s.add(k));
      return s;
    }, new Set())
  ).sort();

  return rows.map((r) => {
    const out = {};
    for (const k of keys) out[k] = toCellValue(r?.[k]);
    return out;
  });
}

function toCellValue(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;

  // Date object
  if (v instanceof Date) return v.toISOString();

  // array/object -> stringify biar nggak [object Object]
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
