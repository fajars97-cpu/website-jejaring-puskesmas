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
    <aside className="h-full">
      <div className="h-full rounded-2xl bg-white/70 backdrop-blur border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-200 bg-white">
          <div className="text-sm font-extrabold text-slate-900">Jejaring Puskesmas</div>
          <div className="text-xs text-slate-500">Puskesmas Jagakarsa • DKI Jakarta</div>
        </div>

        {/* Nav (scrollable jika panjang) */}
        <nav className="h-[calc(100%-52px-44px)] overflow-y-auto px-2 py-3">
          {sidebarMenu.map((group, gi) => (
            <div key={gi} className={gi === 0 ? "" : "mt-4"}>
              {group?.title ? (
                <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-slate-400">
                  {group.title}
                </div>
              ) : null}

              <div className="space-y-1">
                {(group?.items || []).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "group relative block rounded-xl px-3 py-2 text-sm font-semibold transition",
                        isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-100"
                      )
                    }
                  >
                    {/* strip indicator */}
                    <span
                      className={({ isActive }) =>
                        cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full transition",
                          isActive ? "bg-emerald-500" : "bg-transparent group-hover:bg-slate-300"
                        )
                      }
                    />
                    <span className="pl-2">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Mode */}
        <div className="px-4 py-3 border-t border-slate-200 bg-white text-xs text-slate-500">
          Mode: {isAdmin ? "Super Admin" : "Pemohon"}
        </div>
      </div>
    </aside>
  );
}
