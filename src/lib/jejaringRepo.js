// src/lib/jejaringRepo.js
import { supabase } from "./supabaseClient";

// Nama tabel sesuai Supabase kamu
const TABLE = "jejaring_fasyankes";

/**
 * Parse kegiatan dari DB:
 * - kalau sudah array => pakai
 * - kalau string => split pakai koma / titik koma / newline
 * - kalau null => []
 */
function parseKegiatan(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    return value
      .split(/,|;|\n/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Adapter snake_case (DB) -> camelCase (frontend contract)
 * Plus: fallback field yang dibutuhkan UI
 */
function mapRowToJejaring(row) {
  return {
    // ID: biarkan number (int8)
    id: row.id,

    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,

    namaFasyankes: row.nama_fasyankes ?? "",
    jenisFasyankes: row.jenis_fasyankes ?? "",
    tipeFasyankes: row.tipe_fasyankes ?? "",
    status: row.status ?? "",

    alamat: row.alamat ?? "",
    kelurahan: row.kelurahan ?? "",
    kecamatan: row.kecamatan ?? "",
    wilayah: row.kota ?? row.wilayah ?? "",

    lat: typeof row.lat === "number" ? row.lat : null,
    lng: typeof row.lng === "number" ? row.lng : null,

    gmapsUrl: row.gmaps_url ?? "",
    gmapsEmbedUrl: row.gmaps_embed_url ?? "",

    kelompokPenyelenggara: row.kelompok_penyelenggara ?? "",
    penyelenggara: row.penyelenggara ?? "",

    kodePos: row.kode_pos ?? "",

    pjNama: row.pj_nama ?? "",
    pjTelp: row.telepon ?? row.pj_telp ?? "",
    // BUG-FIX via adapter: JejaringExpanded.jsx pakai data.pj
    pj: row.pj ?? row.pj_nama ?? "",

    nomorIzin: row.nomor_izin ?? "",
    izinMulai: row.izin_mulai ?? null,
    izinAkhir: row.izin_berakhir ?? null,

    jumlahSDMK: row.jumlah_sdm ?? row.jumlah_sdmk ?? null,

    kegiatan: parseKegiatan(row.kegiatan),

    // MOU kamu sudah pecah kolom; kita satukan lagi seperti contract lama
    mou: {
      nomor: row.mou_nomor ?? "",
      mulai: row.mou_mulai ?? null,
      akhir: row.mou_akhir ?? null,
    },

    foto: row.foto ?? "",
    isVerified: typeof row.is_verified === "boolean" ? row.is_verified : null,

    // simpan juga email kalau suatu saat dipakai
    email: row.email ?? "",
  };
}

/**
 * List jejaring (read-only)
 * - bisa tambah filter server-side kalau mau (jenis/kelurahan/status)
 * - default urut id asc
 */
export async function fetchJejaringList({
  jenis = "Semua",
  kelurahan = "Semua",
  status = "Semua",
  limit = 500, // kamu di UI slice(0,10), tapi ambil agak banyak supaya filter client-side enak
} = {}) {
  let query = supabase.from(TABLE).select("*").order("id", { ascending: true });

  // Optional server-side filter: aman dipakai kalau datamu besar
  if (jenis !== "Semua") query = query.eq("jenis_fasyankes", jenis);
  if (kelurahan !== "Semua") query = query.eq("kelurahan", kelurahan);
  if (status !== "Semua") query = query.eq("status", status);

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(mapRowToJejaring);
}

// NOTE: Ambil opsi filter (jenis/kelurahan/status) dari Supabase tanpa mengunduh semua kolom
export async function fetchJejaringFilterOptions({ limit = 2000 } = {}) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("jenis_fasyankes, kelurahan, status")
    .order("kelurahan", { ascending: true })
    .limit(limit);

  if (error) throw error;

  const jenis = new Set();
  const kelurahan = new Set();
  const status = new Set();

  for (const row of data ?? []) {
    if (row.jenis_fasyankes) jenis.add(row.jenis_fasyankes);
    if (row.kelurahan) kelurahan.add(row.kelurahan);
    if (row.status) status.add(row.status);
  }

  return {
    jenisOptions: [...jenis],
    kelurahanOptions: [...kelurahan],
    statusOptions: [...status],
  };
}

/**
 * Ambil detail by id (opsional, kalau nanti kamu mau fetch detail)
 */
export async function fetchJejaringById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapRowToJejaring(data);
}
