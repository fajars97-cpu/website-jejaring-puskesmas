import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();

  // optional: tampilkan title sederhana berdasarkan route
  const title = (() => {
    const p = location.pathname;
    if (p.includes("pemohon")) return "Portal Pemohon";
    if (p.includes("admin")) return "Dashboard Admin";
    return "Website Jejaring Puskesmas";
  })();

  return (
    <header className="h-14 bg-emerald-800 text-white border-b border-white/10">
      <div className="h-full px-3 md:px-5 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 transition"
            aria-label="Buka menu"
          >
            ☰
          </button>

          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">{title}</div>
            <div className="text-[11px] text-white/70 truncate">
              Puskesmas Jagakarsa • DKI Jakarta
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink
            to="/"
            className="px-3 py-1.5 rounded-md text-[13px] text-white/85 hover:text-white hover:bg-white/10 transition"
          >
            Home
          </NavLink>
          <NavLink
            to="/jejaring"
            className="px-3 py-1.5 rounded-md text-[13px] text-white/85 hover:text-white hover:bg-white/10 transition"
          >
            Jejaring
          </NavLink>
          <NavLink
            to="/perizinan"
            className="px-3 py-1.5 rounded-md text-[13px] text-white/85 hover:text-white hover:bg-white/10 transition"
          >
            Perizinan
          </NavLink>

          <div className="w-px h-6 bg-white/15 mx-1" />

          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-[13px] bg-white/10 hover:bg-white/15 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile right action */}
        <div className="md:hidden">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-[13px] bg-white/10 hover:bg-white/15 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
