// ===== PUBLIC MENU (selalu tampil) =====
export const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

// ===== Footer links (dipakai Footbar) =====
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

// ===== Sidebar menu (login only, grouped) =====
export function getSidebarMenu({ isAdmin }) {
  if (isAdmin) {
    return [
      { title: null, items: [{ label: "Beranda", path: "/" }] },
      { title: "PERMOHONAN", items: [{ label: "Rekap Permohonan MoU", path: "/admin/permohonan-mou" }] },
      { title: "DATABASE", items: [{ label: "Database", path: "/admin/jejaring" }] },
    ];
  }

  return [
    { title: null, items: [{ label: "Beranda", path: "/" }] },
    { title: "PERMOHONAN", items: [{ label: "Pengajuan MoU", path: "/pemohon/mou" }] },
  ];
}
