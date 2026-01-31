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
      <div className="h-full rounded-2xl bg-emerald-950 text-white ring-1 ring-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <div className="text-sm font-extrabold leading-tight">Website Jejaring Puskesmas</div>
          <div className="mt-1 text-xs text-white/70">Puskesmas Jagakarsa • DKI Jakarta</div>
        </div>

        {/* Nav (scrollable if long) */}
        <nav className="h-[calc(100%-72px-44px)] overflow-y-auto px-2 py-3">
          {sidebarMenu.map((group, gi) => (
            <div key={gi} className={gi === 0 ? "" : "mt-4"}>
              {group?.title ? (
                <div className="px-3 pb-2 text-[11px] font-extrabold tracking-widest text-white/45">
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
                        "group relative block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        isActive
                          ? "bg-white/12 text-white"
                          : "text-white/85 hover:bg-white/10"
                      )
                    }
                  >
                    {/* Active/hover strip */}
                    <span
                      className={cn(
                        "absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full transition",
                        "bg-transparent group-hover:bg-white/30"
                      )}
                    />
                    <span className="pl-2">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Mode */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/60">
          Mode: {isAdmin ? "Super Admin" : "Pemohon"}
        </div>
      </div>
    </aside>
  );
}
