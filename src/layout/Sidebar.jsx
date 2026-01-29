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
    <aside className="hidden md:block w-64 shrink-0">
      <div className="sticky top-20">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header (minimal, calm) */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-200">
            <div className="text-sm font-extrabold text-slate-900">Jejaring Puskesmas</div>
            <div className="text-xs text-slate-500">Puskesmas Jagakarsa • DKI Jakarta</div>
          </div>

          {/* Groups */}
          <div className="px-3 py-3 space-y-4">
            {sidebarMenu.map((group, gi) => (
              <div key={gi}>
                {group?.title ? (
                  <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-slate-400">
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
                          "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                          "border",
                          isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
          <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
            Mode: {isAdmin ? "Super Admin" : "Pemohon"}
          </div>
        </div>
      </div>
    </aside>
  );
}
