export function isFiniteNumberString(s) {
  if (s === "" || s === null || s === undefined) return false;
  const n = Number(s);
  return Number.isFinite(n);
}

function toNullIfEmpty(v) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function toDateOrNull(v) {
  const s = String(v ?? "").trim();
  return s ? s : null; // Supabase date menerima "YYYY-MM-DD"
}

function toIntOrNull(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function getRowKey(row) {
  if (!row || typeof row !== "object") return null;

  // prioritas: id (int8), lalu uuid kalau ada
  if (row.id !== undefined && row.id !== null) return { pk: "id", value: row.id };
  if (row.uuid !== undefined && row.uuid !== null) return { pk: "uuid", value: row.uuid };

  // fallback umum kalau suatu saat pakai key lain
  if (row.user_id !== undefined && row.user_id !== null) return { pk: "user_id", value: row.user_id };

  return null;
}

export function validateJejaring(form) {
  // required sesuai struktur yang kamu tampilkan + agar insert lolos
  if (!form.nama_fasyankes?.trim()) return "Nama fasyankes wajib diisi.";
  if (!form.jenis_fasyankes?.trim()) return "Jenis fasyankes wajib diisi.";
  if (!form.tipe_fasyankes?.trim()) return "Tipe fasyankes wajib diisi.";
  if (!form.status?.trim()) return "Status wajib diisi.";

  if (!form.alamat?.trim()) return "Alamat wajib diisi.";
  if (!form.kelurahan?.trim()) return "Kelurahan wajib diisi.";
  if (!form.kecamatan?.trim()) return "Kecamatan wajib diisi.";
  if (!form.kota?.trim()) return "Kota wajib diisi.";

  if (!form.penyelenggara?.trim()) return "Penyelenggara wajib diisi.";

  if (!isFiniteNumberString(form.lat)) return "Latitude (lat) wajib angka valid.";
  if (!isFiniteNumberString(form.lng)) return "Longitude (lng) wajib angka valid.";

  if (form.email?.trim() && !form.email.includes("@")) return "Email tidak valid (harus mengandung @).";

  // tanggal optional, tapi kalau diisi harus format basic (yyyy-mm-dd)
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (form.izin_mulai?.trim() && !dateRe.test(form.izin_mulai.trim())) return "izin_mulai harus YYYY-MM-DD.";
  if (form.izin_berakhir?.trim() && !dateRe.test(form.izin_berakhir.trim())) return "izin_berakhir harus YYYY-MM-DD.";
  if (form.mou_mulai?.trim() && !dateRe.test(form.mou_mulai.trim())) return "mou_mulai harus YYYY-MM-DD.";
  if (form.mou_akhir?.trim() && !dateRe.test(form.mou_akhir.trim())) return "mou_akhir harus YYYY-MM-DD.";

  // jumlah_sdm optional, tapi kalau diisi harus angka
  if (String(form.jumlah_sdm ?? "").trim() && !Number.isFinite(Number(form.jumlah_sdm))) return "jumlah_sdm harus angka.";

  return "";
}

export function normalizeJejaringPayload(form) {
  return {
    // inti
    nama_fasyankes: String(form.nama_fasyankes || "").trim(),
    jenis_fasyankes: String(form.jenis_fasyankes || "").trim(),
    tipe_fasyankes: String(form.tipe_fasyankes || "").trim(),
    status: String(form.status || "").trim(),

    // lokasi
    alamat: String(form.alamat || "").trim(),
    kelurahan: String(form.kelurahan || "").trim(),
    kecamatan: String(form.kecamatan || "").trim(),
    kota: String(form.kota || "").trim(),
    kode_pos: toNullIfEmpty(form.kode_pos),

    // geo
    lat: Number(form.lat),
    lng: Number(form.lng),

    // kontak + maps
    telepon: toNullIfEmpty(form.telepon),
    email: toNullIfEmpty(form.email),
    gmaps_url: toNullIfEmpty(form.gmaps_url),
    gmaps_embed_url: toNullIfEmpty(form.gmaps_embed_url),

    // admin/meta
    is_verified: !!form.is_verified,
    penyelenggara: String(form.penyelenggara || "").trim(),
    kelompok_penyelenggara: toNullIfEmpty(form.kelompok_penyelenggara),

    // PJ + izin
    pj_nama: toNullIfEmpty(form.pj_nama),
    nomor_izin: toNullIfEmpty(form.nomor_izin),
    izin_mulai: toDateOrNull(form.izin_mulai),
    izin_berakhir: toDateOrNull(form.izin_berakhir),
    jumlah_sdm: toIntOrNull(form.jumlah_sdm),

    // kegiatan + MoU + foto
    kegiatan: toNullIfEmpty(form.kegiatan),
    mou_nomor: toNullIfEmpty(form.mou_nomor),
    mou_mulai: toDateOrNull(form.mou_mulai),
    mou_akhir: toDateOrNull(form.mou_akhir),
    foto: toNullIfEmpty(form.foto),
  };
}

// ====== helper UI/table (dibutuhkan AdminJejaring.jsx) ======

export function formatCellValue(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  return s.trim() ? s : "—";
}

export function filterRows(rows, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return rows || [];
  const arr = Array.isArray(rows) ? rows : [];
  return arr.filter((row) => {
    // cari di semua value primitive
    for (const k of Object.keys(row || {})) {
      const val = row?.[k];
      if (val === null || val === undefined) continue;
      const s = String(val).toLowerCase();
      if (s.includes(q)) return true;
    }
    return false;
  });
}

// pilih kolom tampil yang aman + relevan
export function pickDisplayColumns(rows) {
  const arr = Array.isArray(rows) ? rows : [];
  const first = arr[0] || {};

  // prioritas kolom (sesuai tabel supabase kamu)
  const preferred = [
    "nama_fasyankes",
    "jenis_fasyankes",
    "tipe_fasyankes",
    "status",
    "alamat",
    "kelurahan",
    "kecamatan",
    "kota",
    "telepon",
    "email",
    "lat",
    "lng",
    "is_verified",
    "penyelenggara",
    "kelompok_penyelenggara",
    "pj_nama",
    "nomor_izin",
    "izin_mulai",
    "izin_berakhir",
    "mou_nomor",
    "mou_mulai",
    "mou_akhir",
    "kode_pos",
    "gmaps_url",
    "gmaps_embed_url",
    "jumlah_sdm",
    "kegiatan",
    "foto",
    "created_at",
    "updated_at",
    "id",
  ];

  const existing = new Set(Object.keys(first));
  const cols = preferred.filter((c) => existing.has(c));

  // fallback kalau row kosong / struktur beda
  if (!cols.length && existing.size) {
    return Array.from(existing).slice(0, 12);
  }

  return cols;
}
