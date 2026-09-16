import { useState } from "react";

const BASE = import.meta.env.BASE_URL;

function Chevron({ open }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AuthorityLogo({ src, alt, fallback }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce8e1] bg-[#f6faf7]">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-contain p-2" loading="lazy" />
        ) : (
          <span className="text-xs font-bold text-[#176548]">{fallback}</span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5b806b]">Otoritas layanan</p>
        <p className="mt-0.5 text-sm font-bold text-[#163f31]">{alt}</p>
      </div>
    </div>
  );
}

function DetailSection({ title, items }) {
  return (
    <section className="rounded-xl border border-[#e1ebe5] bg-[#f8fbf9] p-4">
      <h3 className="text-sm font-bold text-[#173f31]">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-6 text-slate-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b9a73]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const guides = [
  {
    id: "mou",
    number: "01",
    title: "Kerja sama MOU / PKS jejaring",
    summary: "Panduan pengajuan kerja sama layanan, rujukan, program, atau edukasi bersama Puskesmas Jagakarsa.",
    authority: "Puskesmas Jagakarsa",
    logoSrc: `${BASE}icons/logo-puskesmas-jagakarsa.png`,
    fallback: "PKM",
    requirements: [
      "Profil fasyankes, alamat, penanggung jawab, dan kontak aktif.",
      "Legalitas fasilitas yang relevan, seperti izin operasional atau NIB.",
      "Ruang lingkup kerja sama yang ingin diajukan.",
      "Draft MOU / PKS bila sudah tersedia.",
    ],
    steps: [
      "Kirim pengajuan kerja sama melalui kanal resmi Puskesmas Jagakarsa.",
      "Puskesmas memverifikasi kelengkapan dan melakukan klarifikasi ruang lingkup.",
      "Draft disusun atau disempurnakan bersama, lalu diparaf pihak terkait.",
      "Dokumen ditandatangani, diberi nomor, dan diarsipkan.",
    ],
    outcome: ["MOU / PKS aktif sebagai dasar pelaksanaan dan monitoring kerja sama."],
  },
  {
    id: "registrasi",
    number: "02",
    title: "Registrasi Fasyankes Kementerian Kesehatan",
    summary: "Pencatatan resmi fasilitas kesehatan melalui sistem Registrasi Fasyankes Kementerian Kesehatan.",
    authority: "Kementerian Kesehatan RI",
    logoSrc: `${BASE}icons/logo-kemenkes.png`,
    fallback: "KEM",
    requirements: [
      "Email dan nomor telepon aktif untuk akun serta notifikasi.",
      "Identitas fasyankes: nama, jenis, alamat, dan wilayah.",
      "Data penanggung jawab atau pimpinan sesuai ketentuan sistem.",
      "Dokumen pendukung dalam format dan ukuran yang dipersyaratkan.",
    ],
    steps: [
      "Daftarkan pengguna fasyankes menggunakan email aktif.",
      "Tunggu verifikasi pendaftaran oleh Dinas Kesehatan sesuai kewenangan.",
      "Aktifkan akun melalui tautan yang dikirim ke email.",
      "Lengkapi registrasi, unggah dokumen, lalu kirim untuk validasi.",
    ],
    outcome: [
      "Data fasilitas tervalidasi dan kode registrasi atau kode fasyankes diterbitkan.",
      <a
        key="registrasi-fasyankes"
        href="https://registrasifasyankes.kemkes.go.id/Landing"
        target="_blank"
        rel="noreferrer"
        className="font-bold text-[#087745] underline underline-offset-4 hover:text-[#07513d]"
      >
        Buka portal Registrasi Fasyankes Kemenkes
      </a>,
    ],
  },
  {
    id: "sisdmk",
    number: "03",
    title: "Pembuatan akun SISDMK",
    summary: "Akses administrasi Sistem Informasi SDM Kesehatan untuk fasilitas atau tenaga kesehatan sesuai kebutuhan.",
    authority: "Sudinkes Jakarta Selatan",
    logoSrc: `${BASE}icons/logo-sudinkes-jaksel.jpg`,
    fallback: "SDK",
    requirements: [
      "Data dasar fasyankes: nama, jenis, alamat, dan kontak admin.",
      "Data admin atau penanggung jawab akun, termasuk email dan nomor aktif.",
      "Dokumen legalitas fasilitas bila diperlukan pada proses verifikasi.",
    ],
    steps: [
      "Ajukan permohonan akun atau aktivasi melalui jalur koordinasi Sudinkes Jakarta Selatan.",
      "Sudinkes memverifikasi data dasar sesuai kebutuhan layanan.",
      "Akun dibuat atau diaktifkan untuk admin fasyankes yang ditunjuk.",
      "Lakukan login awal, ganti kata sandi, dan periksa akses modul.",
    ],
    outcome: ["Akun SISDMK aktif untuk pengelolaan data sesuai kewenangan pengguna."],
  },
];

export default function Perizinan() {
  const [openId, setOpenId] = useState("mou");

  return (
    <div className="w-full space-y-7">
      <header className="overflow-hidden rounded-[24px] border border-[#0b5c45] bg-[#07513d] px-6 py-7 text-white shadow-[0_18px_45px_rgba(10,81,61,0.18)] md:px-8 md:py-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d3e7ac]">Panduan layanan</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Perizinan & registrasi fasyankes</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8ebe1] md:text-base">
            Ringkasan persiapan dokumen dan alur layanan untuk membantu fasilitas kesehatan memulai proses administrasi.
          </p>
        </div>

        <div className="mt-7 grid max-w-3xl grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/8">
          {[
            ["01", "Pilih layanan"],
            ["02", "Siapkan dokumen"],
            ["03", "Ikuti alur"],
          ].map(([number, label]) => (
            <div key={number} className="px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#b9d9c9]">{number}</p>
              <p className="mt-1 text-sm font-bold text-white sm:text-base">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <section aria-labelledby="panduan-heading">
        <div className="flex flex-col gap-2 border-b border-[#dce8e1] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4e8067]">Langkah administrasi</p>
            <h2 id="panduan-heading" className="mt-1 text-xl font-bold text-[#153f30]">Pilih panduan yang diperlukan</h2>
          </div>
          <p className="max-w-lg text-sm text-slate-600">Buka setiap layanan untuk melihat persiapan, alur, dan hasil proses.</p>
        </div>

        <div className="mt-5 space-y-4">
          {guides.map((guide) => {
            const open = openId === guide.id;
            return (
              <article
                key={guide.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(23,76,55,0.06)] transition ${
                  open ? "border-[#8fbfa0]" : "border-[#dce8e1]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId((current) => (current === guide.id ? "" : guide.id))}
                  aria-expanded={open}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 p-5 text-left transition hover:bg-[#f8fbf9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087745]/15 md:items-center md:gap-6 md:p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f5ed] text-sm font-extrabold text-[#087745]">
                    {guide.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold leading-snug text-[#153f30]">{guide.title}</span>
                    <span className="mt-1.5 block max-w-3xl text-sm leading-6 text-slate-600">{guide.summary}</span>
                  </span>
                  <span className="mt-1 rounded-lg border border-[#dce8e1] p-2 text-[#176548]" aria-hidden="true">
                    <Chevron open={open} />
                  </span>
                </button>

                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-[#e4ece7] bg-[#fcfdfc] p-5 md:p-6">
                      <AuthorityLogo src={guide.logoSrc} alt={guide.authority} fallback={guide.fallback} />
                      <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <DetailSection title="Yang perlu disiapkan" items={guide.requirements} />
                        <DetailSection title="Alur singkat" items={guide.steps} />
                        <DetailSection title="Hasil proses" items={guide.outcome} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-[#d5e7da] bg-[#eef7f0] px-5 py-4 text-sm leading-6 text-[#315b46]">
        <span className="font-bold text-[#176548]">Perlu bantuan?</span> Siapkan data fasilitas dan dokumen dasar terlebih dahulu, lalu hubungi admin jejaring untuk arahan layanan yang sesuai.
      </aside>
    </div>
  );
}
