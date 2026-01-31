import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ sidebarMenu = [], isAdmin = false }) {
  return (
    <div className="h-full">
      <div className="h-full flex flex-col">
        {/* Brand section */}
        <div className="px-5 pt-5 pb-4">
          <div className="text-sm font-semibold text-white leading-tight">
            Website Jejaring Puskesmas
          </div>
          <div className="mt-0.5 text-[12px] text-white/70">
            Puskesmas Jagakarsa • DKI Jakarta
          </div>
          <div className="mt-4 h-px bg-white/10" />
        </div>

        {/* Menu */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {sidebarMenu?.length ? (
            <div className="space-y-4">
              {sidebarMenu.map((group) => (
                <div key={group.title || "menu"}>
                  <div className="px-2 pb-2 text-[11px] uppercase tracking-wider text-white/60">
                    {group.title || "Menu"}
                  </div>

                  <nav className="space-y-1">
                    {(group.items || []).map((it) => (
                      <NavLink
                        key={it.path}
                        to={it.path}
                        className={({ isActive }) =>
                          [
                            "relative flex items-center rounded-md px-3 py-2 text-[13px] font-medium",
                            "transition-colors",
                            "text-white/85 hover:text-white hover:bg-white/10",
                            isActive ? "bg-white/12 text-white" : "",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={[
                                "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r",
                                "transition-all",
                                isActive ? "w-1 bg-emerald-200 opacity-100" : "w-0 opacity-0",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                            <span className="truncate">{it.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-[12px] text-white/70">
              Menu belum tersedia.
            </div>
          )}

          <div className="mt-6 h-px bg-white/10" />

          {/* Mode */}
          <div className="mt-4 rounded-lg bg-white/7 px-3 py-3">
            <div className="text-[12px] font-semibold text-white/90">Mode</div>
            <div className="mt-1 text-[12px] text-white/70">
              {isAdmin ? "Admin / Super Admin" : "Pemohon"}
            </div>
          </div>
        </div>

        {/* ✅ HAPUS copyright bawah biar gak double */}
        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/60">
          Sidebar siap diisi fitur lain ✨
        </div>
      </div>
    </div>
  );
}
