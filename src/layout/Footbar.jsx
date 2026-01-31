import React from "react";
import BrandLogo from "./parts/BrandLogo";

export default function Footbar({ variant = "public", SOCIAL_LINKS = [], QUICK_LINKS = [] }) {
  // ===== APP footer (simple, nyambung sama chrome) =====
  if (variant === "app") {
    return (
      <footer className="h-12 border-t border-white/10 bg-emerald-950 text-white">
        <div className="h-full px-4 md:px-6">
          <div className="h-full flex items-center justify-between text-[11px] text-white/70">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="truncate">© {new Date().getFullYear()} Puskesmas Jagakarsa</span>
            </div>
            <div className="truncate text-white/55">Jejaring • Perizinan • Monitoring</div>
          </div>
        </div>
      </footer>
    );
  }

  // ===== PUBLIC footer (rame, konten kamu) =====
  const social = Array.isArray(SOCIAL_LINKS) ? SOCIAL_LINKS : [];
  const quick = Array.isArray(QUICK_LINKS) ? QUICK_LINKS : [];

  return (
    <footer className="border-t border-black/10 bg-emerald-950 text-white">
      <div className="w-full px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* 1: Identitas */}
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo />
              <div>
                <div className="text-base font-extrabold">Puskesmas Jagakarsa</div>
                <div className="text-xs text-white/70">Portal Informasi Jejaring</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div>
                <div className="font-semibold text-white/90">Alamat</div>
                <div>Jl. Sirsak No 1 RT.001/02 Jagakarsa</div>
                <div>Jakarta Selatan, DKI Jakarta 12630</div>
              </div>
              <div>
                <div className="font-semibold text-white/90">Telepon</div>
                <div>081389685271 (Senin–Jumat 07:30–15:00 WIB, IGD 24 Jam)</div>
              </div>
              <div>
                <div className="font-semibold text-white/90">Email Jejaring</div>
                <div className="wrap-break-word">jaring.jejaringjagakarsa@gmail.com</div>
              </div>
            </div>
          </div>

          {/* 2: Sosmed */}
          <div>
            <div className="text-base font-extrabold">Media Sosial</div>
            <div className="mt-3 grid gap-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 active:bg-white/20"
                >
                  {s.label} • {s.text}
                </a>
              ))}
            </div>
          </div>

          {/* 3: Informasi */}
          <div>
            <div className="text-base font-extrabold">Informasi</div>
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-sm font-semibold">Tautan Cepat</div>
                <div className="mt-2 grid gap-2 text-sm">
                  {quick.map((q) => (
                    <a
                      key={q.label}
                      className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15"
                      href={q.href}
                      target={q.href?.startsWith("http") ? "_blank" : undefined}
                      rel={q.href?.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {q.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-sm font-semibold">Catatan</div>
                <div className="mt-1 text-sm text-white/80">
                  Footer ini bisa kamu sesuaikan ke format “portal resmi” tanpa ganggu halaman lain.
                </div>
              </div>
            </div>
          </div>

          {/* 4: Lokasi */}
          <div>
            <div className="text-base font-extrabold">Lokasi</div>
            <div className="mt-3 overflow-hidden rounded-2xl bg-white/10">
              <div className="aspect-4/3">
                <iframe
                  title="Lokasi Puskesmas Jagakarsa"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15861.904188956349!2d106.8188667!3d-6.3323176!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ee7f625bb24b%3A0x7dc3f4d6080c4ee8!2sPUSKESMAS%20KECAMATAN%20JAGAKARSA!5e0!3m2!1sid!2sid!4v1769563441091!5m2!1sid!2sid"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-6 text-sm text-white/75 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Puskesmas Jagakarsa</div>
          <div className="text-white/60">Jejaring • Perizinan • Monitoring</div>
        </div>
      </div>
    </footer>
  );
}
