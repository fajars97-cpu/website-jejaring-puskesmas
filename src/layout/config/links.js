/**
 * ====== KONFIGURASI LINK (INI YANG KAMU EDIT) ======
 */
export const SOCIAL_LINKS = [
  { label: "Instagram", text: "Puskesmas Jagakarsa", href: "https://instagram.com/pkmjagakarsa" },
  { label: "Facebook", text: "Puskesmas Jagakarsa", href: "https://facebook.com/pkmjagakarsa" },
  { label: "YouTube", text: "Puskesmas Jagakarsa", href: "https://www.youtube.com/channel/UC6inZ3DXzmX_ha-Sc8j3qgA/featured" },
  { label: "TikTok", text: "Puskesmas Jagakarsa", href: "https://www.tiktok.com/@pkmjagakarsa?_t=8Wn1WIynL4z&_r=1" },
];

export const QUICK_LINKS = [
  { label: "Profil", href: "https://www.pkmjagakarsa.com/" },
  { label: "Layanan", href: "https://fajars97-cpu.github.io/alurlayanan/" },
  { label: "PPID", href: "https://ppid-dinkes.jakarta.go.id/sudinkes-jaksel/" },
];

/**
 * Menu publik (tetap muncul untuk semua user)
 */
export const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

/**
 * Menu sidebar (hanya muncul untuk user login)
 * Minimal dulu biar aman. Nanti tinggal nambah item.
 */
export function getSidebarMenu({ isAdmin }) {
  if (isAdmin) {
    return [
      { label: "Dashboard", path: "/admin" },
      { label: "Permohonan MoU", path: "/admin/permohonan-mou" },
      // next: jejaring management, perizinan management, dsb
    ];
  }

  return [
    { label: "Pengajuan MoU", path: "/pemohon/mou" },
    // next: status pengajuan, profil, riwayat, dsb
  ];
}
