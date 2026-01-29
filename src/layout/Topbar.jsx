import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";
import BrandLogo from "./parts/BrandLogo";
import MenuLink from "./parts/MenuLink";

export default function Topbar({
  publicMenu,
  user,
  isAdmin,
  loading,
  userLabel,
  mobileOpen,
  onToggleMobile,
  onCloseMobile,
  onSignOut,
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-emerald-900">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3 min-w-0" onClick={onCloseMobile}>
            <BrandLogo />
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-white">Website Jejaring Puskesmas</div>
              <div className="truncate text-xs text-white/70">Puskesmas Jagakarsa • DKI Jakarta</div>
            </div>
          </NavLink>

          {/* Desktop menu (publik) */}
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
                  onClick={onSignOut}
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
            onClick={onToggleMobile}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen ? "true" : "false"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
