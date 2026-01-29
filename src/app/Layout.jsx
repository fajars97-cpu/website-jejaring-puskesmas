import React, { useMemo, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE = import.meta.env.BASE_URL; // penting untuk deploy subpath (GitHub Pages)

/**
 * ====== KONFIGURASI LINK (INI YANG KAMU EDIT) ======
 */
const SOCIAL_LINKS = [
  { label: "Instagram", text: "Puskesmas Jagakarsa", href: "https://instagram.com/pkmjagakarsa" },
  { label: "Facebook", text: "Puskesmas Jagakarsa", href: "https://facebook.com/pkmjagakarsa" },
  { label: "YouTube", text: "Puskesmas Jagakarsa", href: "https://www.youtube.com/channel/UC6inZ3DXzmX_ha-Sc8j3qgA/featured" },
  { label: "TikTok", text: "Puskesmas Jagakarsa", href: "https://www.tiktok.com/@pkmjagakarsa?_t=8Wn1WIynL4z&_r=1" },
];

const QUICK_LINKS = [
  { label: "Profil", href: "https://www.pkmjagakarsa.com/" },
  { label: "Layanan", href: "https://fajars97-cpu.github.io/alurlayanan/" },
  { label: "PPID", href: "https://ppid-dinkes.jakarta.go.id/sudinkes-jaksel/" },
];

/**
 * Menu publik
 */
const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

function getUserLabel(user) {
  const email = user?.email || "";
  if (!email) return "User";
  return email.split("@")[0];
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function BrandLogo() {
  const src = `${BASE}icons/logo-puskesmas-jagakarsa.png`;
  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
      <img
        src={src}
        alt="Puskesmas Jagakarsa"
        className="h-full w-full object-contain p-1.5"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const p = e.currentTarget.parentElement;
          if (!p) return;
          p.classList.add("flex", "items-center", "justify-center", "text-xs", "font-bold", "text-white/80");
          p.textContent = "PJ";
        }}
      />
    </div>
  );
}

function MenuLink({ to, end, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "relative text-sm font-semibold tracking-tight transition",
          "text-white/85 hover:text-white",
          "after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:rounded-full after:transition",
          isActive ? "text-white after:bg-white" : "after:bg-transparent"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = useMemo(() => getUserLabel(user), [user]);

  return (
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-emerald-900">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Brand */}
            <NavLink to="/" className="flex items-center gap-3 min-w-0" onClick={() => setMobileOpen(false)}>
              <BrandLogo />
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">Website Jejaring Puskesmas</div>
                <div className="truncate text-xs text-white/70">Puskesmas Jagakarsa • DKI Jakarta</div>
              </div>
            </NavLink>

            {/* Desktop menu */}
            <nav className="hidden md:flex items-center gap-6">
              {publicMenu.map((item) => (
                <MenuLink key={item.path} to={item.path} end={item.end}>
                  {item.label}
                </MenuLink>
              ))}
            </nav>

            {/* Right actions (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <span className="text-sm text-white/80">…</span>
              ) : user ? (
                <>
                  <NavLink
                    to={isAdmin ? "/admin" : "/pemohon/mou"}
                    title={user?.email || ""}
                    className={cn(
                      "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white",
                      "ring-1 ring-white/15 hover:bg-white/15"
                    )}
                  >
                    {userLabel}
                  </NavLink>

                  <button
                    type="button"
                    onClick={signOut}
                    className={cn(
                      "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white",
                      "ring-1 ring-white/15 hover:bg-white/15"
                    )}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-emerald-900 hover:bg-white/95"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/login-admin"
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                    title="Khusus admin/super admin"
                  >
                    Login Admin
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden rounded-xl bg-white/10 p-2 ring-1 ring-white/15 text-white"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen ? "true" : "false"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={cn("md:hidden border-t border-white/10 bg-emerald-950", mobileOpen ? "block" : "hidden")}>
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-2">
            {publicMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/10"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-2">
              {loading ? (
                <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/15">
                  …
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <NavLink
                    to={isAdmin ? "/admin" : "/pemohon/mou"}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                  >
                    {userLabel}
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <NavLink
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl bg-white px-3 py-2 text-center text-sm font-bold text-emerald-900 hover:bg-white/95"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/login-admin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                  >
                    Login Admin
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 bg-slate-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-emerald-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
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
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
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
                    {QUICK_LINKS.map((q) => (
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
    </div>
  );
}
