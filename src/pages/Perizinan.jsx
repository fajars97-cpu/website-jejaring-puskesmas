import React, { useMemo, useState } from "react";

/**
 * Halaman Perizinan (Infografis)
 * - 3 kartu besar: (1) MOU Jejaring (Puskesmas), (2) Registrasi Fasyankes (Kemenkes),
 *   (3) Akun SISDMK (Sudinkes Jaksel)
 * - Klik kartu -> expand detail (accordion style)
 * - Tailwind v4 only
 *
 * NOTE LOGO:
 * Taruh logo di: public/icons/
 * - logo-puskesmas-jagakarsa.png
 * - logo-kemenkes.png
 * - logo-sudinkes-jaksel.jpg
 *
 * Pakai BASE_URL untuk deploy subpath (GitHub Pages).
 */

function Badge({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        "border border-black/10 bg-white/60 text-black/80",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={[
        "h-5 w-5 shrink-0 transition-transform duration-200",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
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

function LogoCircle({ src, alt, fallback }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-black/70">
            {fallback}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-black/90">{alt}</div>
        <div className="truncate text-xs text-black/60">Otoritas / Wewenang</div>
      </div>
    </div>
  );
}

function DetailList({ title, items }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
      <div className="mb-2 text-sm font-semibold text-black/80">{title}</div>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex gap-2 text-sm text-black/75">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/35" />
            {/* item boleh string atau ReactNode (mis. link) */}
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BASE = import.meta.env.BASE_URL; // penting untuk deploy subpath (GitHub Pages)

export default function Perizinan() {
  const [openId, setOpenId] = useState("mou"); // default buka 1st card biar ga “kosong”
  const cards = useMemo(
    () => [
      {
        id: "mou",
        title: "Pembuatan MOU Fasyankes Jejaring ↔ Puskesmas Jagakarsa",
        subtitle:
          "Untuk kerja sama jejaring (rujukan, layanan, kolaborasi program).",
        authority: "Puskesmas Jagakarsa",
        logoSrc: `${BASE}icons/logo-puskesmas-jagakarsa.png`,
        logoAlt: "Puskesmas Jagakarsa",
        logoFallback: "PKM",
        theme: {
          wrap: "bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50",
          ring: "ring-emerald-200/60",
          accent: "text-emerald-700",
          badge: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
        },
        details: {
          Ringkasannya: [
            "MOU/PKS dipakai sebagai dasar formal kerja sama jejaring dengan Puskesmas (program, rujukan, layanan, edukasi, dll).",
            "Proses biasanya melibatkan penyiapan draft, verifikasi dokumen, paraf, penandatanganan, dan arsip.",
          ],
          "Yang biasanya diminta": [
            "Profil fasyankes (nama, alamat, penanggung jawab, kontak).",
            "Legalitas fasyankes (izin operasional / NIB / dokumen relevan).",
            "Ruang lingkup kerja sama (layanan/program yang disepakati).",
            "Draft MOU/PKS (bila sudah punya) atau gunakan template Puskesmas.",
          ],
          "Alur singkat": [
            "Fasyankes mengajukan permohonan kerja sama (email/WA/surat resmi).",
            "Puskesmas verifikasi dokumen + klarifikasi ruang lingkup.",
            "Penyusunan / finalisasi draft MOU/PKS.",
            "Penandatanganan + penomoran + arsip digital/fisik.",
          ],
          Output: ["Dokumen MOU/PKS aktif + arsip (PDF) untuk monitoring."],
          Catatan: [
            "Isi detail persyaratan bisa beda tergantung jenis kerja sama.",
            "Kalau butuh cepat: siapkan data PJ, ruang lingkup, dan legalitas dari awal (biar nggak bolak-balik 🤝).",
          ],
        },
      },
      {
        id: "registrasi",
        title: "Registrasi Fasyankes (Kemenkes)",
        subtitle:
          "Pendataan/registrasi fasilitas kesehatan sesuai sistem Kemenkes.",
        authority: "Kementerian Kesehatan RI",
        logoSrc: `${BASE}icons/logo-kemenkes.png`,
        logoAlt: "Kementerian Kesehatan RI",
        logoFallback: "KMK",
        theme: {
          wrap: "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50",
          ring: "ring-blue-200/60",
          accent: "text-blue-700",
          badge: "border-blue-200 bg-blue-50/70 text-blue-700",
        },
        details: {
          Ringkasannya: [
            "Registrasi Fasyankes adalah pencatatan resmi fasilitas pelayanan kesehatan di Kemenkes dan menghasilkan kode fasyankes (sesuai jenis fasilitas).",
            "Akses aplikasi berbasis web melalui portal Registrasi Fasyankes.",
          ],
          "Website resmi": [
            <a
              key="regfasyankes"
              href="https://registrasifasyankes.kemkes.go.id/Landing"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800"
            >
              Buka portal Registrasi Fasyankes (Kemenkes)
            </a>,
          ],
          "Yang perlu disiapkan": [
            "Email aktif (ini akan jadi username) + nomor HP aktif untuk notifikasi/verifikasi.",
            "Data identitas fasyankes (nama, jenis/kelas, alamat, wilayah).",
            "Data penanggung jawab/pimpinan (NIK, nama, jabatan) — sesuai ketentuan aplikasi.",
            "Dokumen softcopy (umumnya PDF, ukuran terbatas) seperti surat permohonan registrasi dan izin operasional/sertifikat standar (sesuai jenis fasyankes).",
          ],
          "Alur singkat (sesuai mekanisme aplikasi)": [
            "Daftar User Fasyankes: isi formulir pendaftaran user untuk mendapat akun (username = email, password dibuat saat daftar).",
            "Verifikasi pendaftaran user: Dinkes Kab/Kota memverifikasi (kalau valid, sistem mengirim tautan aktivasi ke email).",
            "Aktivasi akun: klik tautan aktivasi dari email (cek spam kalau belum masuk).",
            "Login → Registrasi fasyankes: lengkapi form registrasi sesuai jenis fasyankes, upload dokumen, lalu kirim untuk validasi.",
            "Validasi/Perbaikan: jika diminta perbaikan, lakukan revisi sesuai catatan verifikator; jika disetujui, kode registrasi/kode fasyankes muncul dan biasanya diberitahukan via email.",
          ],
          Output: [
            "Kode registrasi/kode fasyankes terbit + data fasyankes tercatat dan tervalidasi di sistem.",
          ],
          "Catatan penting": [
            "Validasi mengikuti kewenangan/jenis fasilitas (umumnya melibatkan Dinkes Kab/Kota, dan pada jenis tertentu bisa berjenjang ke Provinsi/Kemenkes).",
            "Paling sering gagal karena: dokumen tidak sesuai format/ukuran, email tidak aktif, atau data PJ tidak konsisten.",
          ],
        },
      },
      {
        id: "sisdmk",
        title: "Pembuatan Akun SISDMK",
        subtitle:
          "Akses sistem SDM Kesehatan untuk fasyankes/tenaga (sesuai kebutuhan).",
        authority: "Sudinkes Jakarta Selatan",
        logoSrc: `${BASE}icons/logo-sudinkes-jaksel.jpg`,
        logoAlt: "Sudinkes Jakarta Selatan",
        logoFallback: "SDK",
        theme: {
          wrap: "bg-gradient-to-br from-fuchsia-50 via-purple-50 to-violet-50",
          ring: "ring-purple-200/60",
          accent: "text-purple-700",
          badge: "border-purple-200 bg-purple-50/70 text-purple-700",
        },
        details: {
          Ringkasannya: [
            "Akun SISDMK dibutuhkan untuk akses/administrasi data SDM kesehatan sesuai ketentuan yang berlaku.",
            "Kewenangan fasilitasi akun/koordinasi biasanya melalui Sudinkes setempat (Jaksel).",
          ],
          "Yang biasanya diminta": [
            "Data fasyankes (nama, alamat, jenis, kontak admin).",
            "Data admin/PJ yang akan memegang akun (email, nomor aktif).",
            "Dokumen legalitas fasilitas (bila diminta untuk verifikasi).",
          ],
          "Alur singkat": [
            "Fasyankes mengajukan permohonan akun/aktivasi melalui jalur koordinasi Sudinkes Jaksel.",
            "Sudinkes verifikasi data dasar (jika diperlukan).",
            "Akun dibuat/diaktifkan + kredensial diberikan ke admin fasyankes.",
            "Login awal + ganti password + uji akses modul yang diperlukan.",
          ],
          Output: ["Akun SISDMK aktif untuk admin fasyankes/tenaga sesuai kewenangan."],
          Catatan: [
            "Pastikan admin akun itu orang yang beneran pegang operasional, bukan ‘anak magang yang besok cabut’ 🫠.",
            "Simpan kredensial di password manager (atau minimal catatan aman).",
          ],
        },
      },
    ],
    []
  );

  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-black/90 md:text-3xl">
          Perizinan & Registrasi Fasyankes
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-black/60 md:text-base">
          Pilih kartu di bawah untuk melihat ringkasan{" "}
          <span className="font-semibold">alur</span> dan{" "}
          <span className="font-semibold">dokumen umum</span> yang dibutuhkan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {cards.map((c) => {
          const open = openId === c.id;
          return (
            <div
              key={c.id}
              className={[
                "rounded-3xl border border-black/10 shadow-sm",
                "overflow-hidden",
                "ring-1",
                c.theme.ring,
                c.theme.wrap,
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === c.id ? "" : c.id))}
                className={[
                  "w-full text-left",
                  "p-5 md:p-6",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                ].join(" ")}
                aria-expanded={open ? "true" : "false"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge className={c.theme.badge}>{c.authority}</Badge>
                      <Badge>Infografis</Badge>
                    </div>
                    <h2 className="text-lg font-bold leading-snug text-black/90 md:text-xl">
                      {c.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">
                      {c.subtitle}
                    </p>
                  </div>
                  <div className="mt-1">
                    <Chevron open={open} />
                  </div>
                </div>

                <div className="mt-5">
                  <LogoCircle
                    src={c.logoSrc}
                    alt={c.logoAlt}
                    fallback={c.logoFallback}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className={c.theme.badge}>Klik untuk detail</Badge>
                  <Badge className="bg-white/70">
                    Status:{" "}
                    <span
                      className={[
                        "ml-1 font-semibold",
                        c.theme.accent,
                      ].join(" ")}
                    >
                      Informasi
                    </span>
                  </Badge>
                </div>
              </button>

              <div
                className={[
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-black/10 bg-white/30 p-5 md:p-6">
                    <div className="grid gap-3">
                      {Object.entries(c.details).map(([sectionTitle, items]) => (
                        <DetailList
                          key={sectionTitle}
                          title={sectionTitle}
                          items={items}
                        />
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-black/50">
                      *Catatan: ini ringkasan umum. Jika kamu mau, aku bisa
                      sesuaikan detailnya dengan SOP/format internal Jagakarsa biar
                      100% “sesuai lapangan”.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-black/65">
        <span className="font-semibold text-black/80">Tip:</span> Bila ada
        pertanyaan lebih lanjut, bisa menghubungi admin jejaring.
      </div>
    </div>
  );
}
