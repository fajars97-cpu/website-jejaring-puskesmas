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
      // NOTE: Sidebar khusus APP (login). Link Jejaring/Perizinan/Public sudah ada di Topbar.
      { title: "ADMIN", items: [
        { label: "Permohonan MoU", path: "/admin/permohonan-mou" },
        { label: "Admin Jejaring", path: "/admin/jejaring" },
        { label: "Kelola Akun", path: "/admin/accounts" },
      ]},
    ];
  }

  return [
     { title: "PEMOHON", items: [
      { label: "Pengajuan MoU", path: "/pemohon/mou" },
      { label: "Profil", path: "/pemohon/profile" },
    ]},
  ];
}
