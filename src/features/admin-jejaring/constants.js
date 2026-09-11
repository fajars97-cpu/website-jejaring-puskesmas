export const PAGE_SIZE = 20;
export const TABLE = "jejaring_fasyankes";

// opsi dropdown (bisa kamu edit belakangan)
export const JENIS_OPTIONS = [
  "Klinik Pratama",
  "Klinik Utama",
  "Apotek",
  "Laboratorium",
  "Optik",
  "Praktik Mandiri",
  "Lainnya",
];

export const TIPE_OPTIONS = [
  "Rumah Sakit",
  "Klinik Umum",
  "Klinik Kecantikan",
  "Klinik Gigi",
  "Apotek",
  "Optik",
  "Lainnya",
];

export const STATUS_OPTIONS = ["Aktif", "Tidak Aktif", "Tutup", "Pindah"];

export const PENYELENGGARA_OPTIONS = ["Swasta", "Pemerintah", "BUMN", "Yayasan", "Lainnya"];
export const KELOMPOK_PENYELENGGARA_OPTIONS = ["Perusahaan", "Perorangan", "Yayasan", "Lainnya"];

export const CREATE_DEFAULTS = {
  // inti
  nama_fasyankes: "",
  jenis_fasyankes: "Klinik Pratama",
  // NOTE: harus match salah satu opsi di TIPE_OPTIONS biar select tidak blank
tipe_fasyankes: "Klinik Umum",
  status: "Aktif",

  alamat: "",
  kelurahan: "",
  kecamatan: "Jagakarsa",
  kota: "Jakarta Selatan",
  kode_pos: "",

  lat: "",
  lng: "",

  // kontak + maps
  telepon: "",
  email: "",
  gmaps_url: "",
  gmaps_embed_url: "",

  gdrive_url: "", // tautan berkas (Google Drive)

  // admin/meta
  is_verified: true,
  penyelenggara: "Swasta",
  kelompok_penyelenggara: "",

  // PJ + izin
  pj_nama: "",
  nomor_izin: "",
  izin_mulai: "",     // yyyy-mm-dd
  izin_berakhir: "",  // yyyy-mm-dd
  jumlah_sdm: "",     // number

  // MoU
  mou_nomor: "",
  mou_mulai: "",
  mou_akhir: "",

  // kegiatan + foto
  kegiatan: "",
  foto: "",
  // === AKREDITASI ===
  terakreditasi: false,
  nomor_akreditasi: "",
  hasil_akreditasi: "",
  akreditasi_berlaku_mulai: "",  // yyyy-mm-dd
  akreditasi_berlaku_sampai: "", // yyyy-mm-dd
};

export const FOTO_MAX_MB = 3;
export const FOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];