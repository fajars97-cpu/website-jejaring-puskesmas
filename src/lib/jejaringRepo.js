// src/lib/jejaringRepo.js
import { supabase } from "./supabaseClient";
import { collectPages } from "./pagination.js";

const TABLE = "jejaring_fasyankes";

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

function toNumOrNull(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapRowToJejaring(row) {
  return {
    id: row.id,

    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,

    namaFasyankes: row.nama_fasyankes ?? "",
    jenisFasyankes: row.jenis_fasyankes ?? "",
    tipeFasyankes: row.tipe_fasyankes ?? "",
    status: row.status ?? "",

    // === AKREDITASI ===
   terakreditasi: !!row.terakreditasi,
   nomorAkreditasi: row.nomor_akreditasi ?? "",
   hasilAkreditasi: row.hasil_akreditasi ?? "",

    alamat: row.alamat ?? "",
    kelurahan: row.kelurahan ?? "",
    kecamatan: row.kecamatan ?? "",
    wilayah: row.kota ?? row.wilayah ?? "",

    // ✅ FIX: numeric/string -> number
    lat: toNumOrNull(row.lat),
    lng: toNumOrNull(row.lng),

    gmapsUrl: row.gmaps_url ?? "",
    gmapsEmbedUrl: row.gmaps_embed_url ?? "",

    kelompokPenyelenggara: row.kelompok_penyelenggara ?? "",
    penyelenggara: row.penyelenggara ?? "",

    kodePos: row.kode_pos ?? "",

    pjNama: row.pj_nama ?? "",
    pjTelp: row.telepon ?? row.pj_telp ?? "",
    pj: row.pj ?? row.pj_nama ?? "",

    nomorIzin: row.nomor_izin ?? "",
    izinMulai: row.izin_mulai ?? null,
    izinAkhir: row.izin_berakhir ?? null,

    jumlahSDMK: row.jumlah_sdm ?? row.jumlah_sdmk ?? null,

    kegiatan: parseKegiatan(row.kegiatan),

    mou: {
      nomor: row.mou_nomor ?? "",
      mulai: row.mou_mulai ?? null,
      akhir: row.mou_akhir ?? null,
    },

    foto: row.foto ?? "",
    isVerified: typeof row.is_verified === "boolean" ? row.is_verified : null,

    email: row.email ?? "",
  };
}

export async function fetchJejaringList({
  jenis = "Semua",
  kelurahan = "Semua",
  status = "Semua",
  limit = null,
} = {}) {
  const rows = await collectPages((from, to) => {
    let query = supabase.from(TABLE).select("*", { count: "exact" }).order("id", { ascending: true });
    if (jenis !== "Semua") query = query.eq("jenis_fasyankes", jenis);
    if (kelurahan !== "Semua") query = query.eq("kelurahan", kelurahan);
    if (status !== "Semua") query = query.eq("status", status);
    return query.range(from, to);
  }, { limit });
  return rows.map(mapRowToJejaring);
}

export async function fetchJejaringFilterOptions({ limit = null } = {}) {
  const data = await collectPages((from, to) => supabase
    .from(TABLE)
    .select("jenis_fasyankes, kelurahan, status", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to), { limit });

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

export async function fetchJejaringById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapRowToJejaring(data);
}
