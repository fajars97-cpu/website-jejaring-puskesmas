export function formatCellValue(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (typeof v === "number") return Number.isFinite(v) ? v : "—";
  if (typeof v === "string") return v.trim() ? v : "—";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function pickDisplayColumns(rows) {
  if (!rows?.length) return [];
  const keys = Object.keys(rows[0] || {});
  if (!keys.length) return [];

  const preferred = [
    "nama_fasyankes",
    "alamat",
    "kelurahan",
    "kecamatan",
    "telepon",
    "email",
    "website",
    "jenis",
    "kategori",
    "lat",
    "lng",
    "created_at",
    "updated_at",
    "id",
    "uuid",
  ];

  const preferredExist = preferred.filter((k) => keys.includes(k));
  const fallback = keys.filter((k) => !preferredExist.includes(k)).slice(0, 6);
  return Array.from(new Set([...preferredExist, ...fallback])).slice(0, 10);
}

export function isFiniteNumberString(s) {
  if (s === "" || s === null || s === undefined) return false;
  const n = Number(s);
  return Number.isFinite(n);
}

export function getRowKey(row) {
  if (row?.id !== null && row?.id !== undefined) return { pk: "id", value: row.id };
  if (row?.uuid) return { pk: "uuid", value: row.uuid };
  return null;
}

export function validateJejaring(form) {
  if (!form.nama_fasyankes?.trim()) return "Nama fasyankes wajib diisi.";
  if (!form.alamat?.trim()) return "Alamat wajib diisi.";
  if (!form.kelurahan?.trim()) return "Kelurahan wajib diisi.";
  if (!form.kecamatan?.trim()) return "Kecamatan wajib diisi.";
  if (!isFiniteNumberString(form.lat)) return "Latitude (lat) wajib angka valid.";
  if (!isFiniteNumberString(form.lng)) return "Longitude (lng) wajib angka valid.";
  if (form.email?.trim() && !form.email.includes("@")) return "Email tidak valid (harus mengandung @).";
  return "";
}

export function normalizeJejaringPayload(form) {
  return {
    nama_fasyankes: String(form.nama_fasyankes || "").trim(),
    alamat: String(form.alamat || "").trim(),
    kelurahan: String(form.kelurahan || "").trim(),
    kecamatan: String(form.kecamatan || "").trim(),
    telepon: String(form.telepon || "").trim() || null,
    email: String(form.email || "").trim() || null,
    lat: Number(form.lat),
    lng: Number(form.lng),
  };
}

export function filterRows(rows, search) {
  const q = (search || "").trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((r) => {
    try {
      const blob = Object.values(r)
        .map((v) => {
          if (v === null || v === undefined) return "";
          if (typeof v === "string") return v;
          if (typeof v === "number" || typeof v === "boolean") return String(v);
          return "";
        })
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    } catch {
      return false;
    }
  });
}
