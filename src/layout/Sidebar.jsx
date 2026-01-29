import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";

/**
 * sidebarMenu format:
 * [
 *   { title: null | "PERMOHONAN", items: [{ label, path }] }
 * ]
 */
export default function Sidebar({ sidebarMenu = [], isAdmin }) {
  return (
    <aside className="hidden md:block w-72 shrink-0">
      <div className="sticky top-20">
        <div className="overflow-hidden rounded-2xl bg-emerald-950 text-white ring-1 ring-white/10 shadow-sm">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <div className="text-base font-extrabold leading-tight">Jejaring Puskesmas</div>
            <div className="mt-1 text-xs text-white/70">Puskesmas Jagakarsa • DKI Jakarta</div>
          </div>

          {/* Nav groups */}
          <div className="px-3 py-4">
            {sidebarMenu.map((group, gi) => (
              <div key={gi} className={cn(gi === 0 ? "" : "mt-4")}>
                {group?.title ? (
                  <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-white/55">
                    {group.title}
                  </div>
                ) : null}

                <div className="space-y-2">
                  {(group?.items || []).map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                          "ring-1 ring-white/10",
                          isActive ? "bg-white/12 text-white" : "bg-white/6 text-white/90 hover:bg-white/12"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer mode */}
          <div className="px-5 py-4 border-t border-white/10 text-xs text-white/60">
            Mode: {isAdmin ? "Super Admin" : "Pemohon"}
          </div>
        </div>
      </div>
    </aside>
  );
}
