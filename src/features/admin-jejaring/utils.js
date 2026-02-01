// utils.js — Admin Jejaring (build-safe, minimal-invasif)

export function isFiniteNumberString(s) {
  if (s === "" || s === null || s === undefined) return false;
  const n = Number(s);
  return Number.isFinite(n);
}

// ---------- normalizer helpers ----------
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

function toFloatOrNull(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ---------- key helper ----------
export function getRowKey(row) {
  if (!row || typeof row !== "object") return null;

  // prioritas: id (int8), lalu uuid kalau ada
  if (row.id !== undefined && row.id !== null) return { pk: "id", value: row.id };
  if (row.uuid !== undefined && row.uuid !== null) return { pk: "uuid", value: row.uuid };

  // fallback umum kalau suatu saat pakai key lain
  if (row.user_id !== undefined && row.user_id !== null) return { pk: "user_id", value: row.user_id };

  return null;
}

// ---------- validation ----------
export function validateJejaring(form) {
  // required sesuai struktur yang kamu tampilkan + agar insert lolos
  if (!form?.nama_fasyankes?.trim()) return "Nama fasyankes wajib diisi.";
  if (!form?.jenis_fasyankes?.trim()) return "Jenis fasyankes wajib diisi.";
  if (!form?.tipe_fasyankes?.trim()) return "Tipe fasyankes wajib diisi.";
  if (!form?.status?.trim()) return "Status wajib diisi.";

  if (!form?.alamat?.trim()) return "Alamat wajib diisi.";
  if (!form?.kelurahan?.trim()) return "Kelurahan wajib diisi.";
  if (!form?.kecamatan?.trim()) return "Kecamatan wajib diisi.";
  if (!form?.kota?.trim()) return "Kota wajib diisi.";

  if (!form?.penyelenggara?.trim()) return "Penyelenggara wajib diisi.";

  if (!isFiniteNumberString(form?.lat)) return "Latitude (lat) wajib angka valid.";
  if (!isFiniteNumberString(form?.lng)) return "Longitude (lng) wajib angka valid.";

  if (form?.email?.trim() && !form.email.includes("@")) return "Email tidak valid (harus mengandung @).";

  // tanggal optional, tapi kalau diisi harus format basic (yyyy-mm-dd)
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (form?.izin_mulai?.trim() && !dateRe.test(form.izin_mulai.trim())) return "izin_mulai harus YYYY-MM-DD.";
  if (form?.izin_berakhir?.trim() && !dateRe.test(form.izin_berakhir.trim())) return "izin_berakhir harus YYYY-MM-DD.";
  if (form?.mou_mulai?.trim() && !dateRe.test(form.mou_mulai.trim())) return "mou_mulai harus YYYY-MM-DD.";
  if (form?.mou_akhir?.trim() && !dateRe.test(form.mou_akhir.trim())) return "mou_akhir harus YYYY-MM-DD.";

  // jumlah_sdm optional, tapi kalau diisi harus angka
  if (String(form?.jumlah_sdm ?? "").trim() && !Number.isFinite(Number(form.jumlah_sdm))) {
    return "jumlah_sdm harus angka.";
  }

  // akreditasi (boolean + nullable)
  if (form?.terakreditasi) {
    if (!String(form?.nomor_akreditasi ?? "").trim()) {
      return "Nomor akreditasi wajib diisi jika Terakreditasi = Ya.";
    }
  }

  return "";
}

// ---------- payload normalizer (insert/update) ----------
export function normalizeJejaringPayload(form) {
  return {
    // inti
    nama_fasyankes: String(form?.nama_fasyankes || "").trim(),
    jenis_fasyankes: String(form?.jenis_fasyankes || "").trim(),
    tipe_fasyankes: String(form?.tipe_fasyankes || "").trim(),
    status: String(form?.status || "").trim(),

    // lokasi
    alamat: String(form?.alamat || "").trim(),
    kelurahan: String(form?.kelurahan || "").trim(),
    kecamatan: String(form?.kecamatan || "").trim(),
    kota: String(form?.kota || "").trim(),
    kode_pos: toNullIfEmpty(form?.kode_pos),

    // geo
    lat: Number(form?.lat),
    lng: Number(form?.lng),

    // kontak + maps
    telepon: toNullIfEmpty(form?.telepon),
    email: toNullIfEmpty(form?.email),
    gmaps_url: toNullIfEmpty(form?.gmaps_url),
    gmaps_embed_url: toNullIfEmpty(form?.gmaps_embed_url),

    // admin/meta
    is_verified: !!form?.is_verified,
    penyelenggara: String(form?.penyelenggara || "").trim(),
    kelompok_penyelenggara: toNullIfEmpty(form?.kelompok_penyelenggara),

    // PJ + izin
    pj_nama: toNullIfEmpty(form?.pj_nama),
    nomor_izin: toNullIfEmpty(form?.nomor_izin),
    izin_mulai: toDateOrNull(form?.izin_mulai),
    izin_berakhir: toDateOrNull(form?.izin_berakhir),
    jumlah_sdm: toIntOrNull(form?.jumlah_sdm),

    // MoU
    mou_nomor: toNullIfEmpty(form?.mou_nomor),
    mou_mulai: toDateOrNull(form?.mou_mulai),
    mou_akhir: toDateOrNull(form?.mou_akhir),

    // kegiatan + foto
    kegiatan: toNullIfEmpty(form?.kegiatan),
    foto: toNullIfEmpty(form?.foto),

    // akreditasi
    terakreditasi: !!form?.terakreditasi,
    nomor_akreditasi: form?.terakreditasi ? toNullIfEmpty(form?.nomor_akreditasi) : null,
    hasil_akreditasi: form?.terakreditasi ? toNullIfEmpty(form?.hasil_akreditasi) : null,
  };
}

// ---------- UI helpers ----------
export function formatCellValue(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  return s.trim() ? s : "—";
}

export function filterRows(rows, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return Array.isArray(rows) ? rows : [];

  const arr = Array.isArray(rows) ? rows : [];
  return arr.filter((row) => {
    for (const k of Object.keys(row || {})) {
      const val = row?.[k];
      if (val === null || val === undefined) continue;
      const s = String(val).toLowerCase();
      if (s.includes(q)) return true;
    }
    return false;
  });
}

/**
 * pickDisplayColumns
 * - Dulu kamu pakai keys dari row pertama aja.
 * - Itu bikin kolom baru (atau boolean false / text null) sering "nggak kebaca" dan akhirnya gak muncul.
 * - Sekarang: gabung keys dari beberapa row awal (sample), jadi lebih stabil.
 */
export function pickDisplayColumns(rows) {
  const arr = Array.isArray(rows) ? rows : [];
  if (!arr.length) return [];

  // kumpulkan keys dari sample row awal (biar tahan cache lama / row incomplete)
  const keySet = new Set();
  const sampleN = Math.min(arr.length, 25);
  for (let i = 0; i < sampleN; i++) {
    const r = arr[i];
    if (!r || typeof r !== "object") continue;
    Object.keys(r).forEach((k) => keySet.add(k));
  }

  const existing = keySet;

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

    // akreditasi (kolom baru)
    "terakreditasi",
    "nomor_akreditasi",
    "hasil_akreditasi",

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

  // pilih yang memang ada di data
  const cols = preferred.filter((c) => existing.has(c));

  // fallback kalau struktur beda
  if (!cols.length && existing.size) return Array.from(existing).slice(0, 12);

  return cols;
}

// ---------- expiry helpers ----------
export function getExpiryCategory(dateStr) {
  if (!dateStr || dateStr === "—") return { cat: "NA", monthsLeft: null };

  const end = new Date(dateStr);
  if (Number.isNaN(end.getTime())) return { cat: "NA", monthsLeft: null };

  const now = new Date();
  if (end < now) return { cat: "EXPIRED", monthsLeft: -1 };

  const monthsLeft = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());

  // aturan kategori sesuai request
  if (monthsLeft <= 3) return { cat: "3M", monthsLeft };
  if (monthsLeft <= 6) return { cat: "6M", monthsLeft };
  if (monthsLeft <= 12) return { cat: "12M", monthsLeft };
  return { cat: "GT12M", monthsLeft };
}

export function expiryTextClass(dateStr) {
  const { cat } = getExpiryCategory(dateStr);
  switch (cat) {
    case "EXPIRED":
    case "3M":
      return "text-red-600 font-semibold";
    case "6M":
      return "text-yellow-600 font-semibold";
    case "12M":
      return "text-amber-600 font-semibold";
    case "GT12M":
      return "text-emerald-600";
    default:
      return "text-slate-500";
  }
}
