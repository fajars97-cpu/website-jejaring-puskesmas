import React from "react";

export default function Footbar({ variant = "app" }) {
  if (variant === "public") {
    return (
      <footer className="border-t border-black/10 bg-emerald-800 text-white">
        <div className="w-full px-4 py-10 md:px-6">
          <div className="mx-auto w-full max-w-300">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="text-sm font-semibold">Puskesmas Jagakarsa</div>
                <div className="mt-2 text-[12px] text-white/75 leading-relaxed">
                  Portal informasi jejaring & perizinan.
                </div>

                <div className="mt-4 text-[12px] text-white/75 leading-relaxed">
                  <div className="font-semibold text-white/90">Alamat</div>
                  <div>Jagakarsa, Jakarta Selatan</div>
                </div>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-white/90">Media Sosial</div>
                <ul className="mt-2 space-y-2 text-[12px] text-white/75">
                  <li>Instagram • Puskesmas Jagakarsa</li>
                  <li>Facebook • Puskesmas Jagakarsa</li>
                  <li>YouTube • Puskesmas Jagakarsa</li>
                  <li>TikTok • Puskesmas Jagakarsa</li>
                </ul>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-white/90">Informasi</div>
                <ul className="mt-2 space-y-2 text-[12px] text-white/75">
                  <li>Profil</li>
                  <li>Layanan</li>
                  <li>PPID</li>
                  <li>Kontak</li>
                </ul>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-white/90">Catatan</div>
                <div className="mt-2 text-[12px] text-white/75 leading-relaxed">
                  Footer publik boleh lengkap. Untuk halaman kerja, footer dibuat simple dan fixed.
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-4 text-[11px] text-white/65 md:flex-row md:items-center md:justify-between">
              <div>© {new Date().getFullYear()} Puskesmas Jagakarsa</div>
              <div className="text-white/60">Jejaring • Perizinan • Monitoring</div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // APP footer: fixed, simple, workplace vibe (height ~56px)
  return (
    <footer className="h-14 border-t border-black/10 bg-white">
      <div className="h-full px-4 md:px-6">
        <div className="mx-auto h-full w-full max-w-350 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
            <span className="truncate">© {new Date().getFullYear()} Puskesmas Jagakarsa</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline">Versi</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">v1</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">Jejaring • Perizinan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
