import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";

export default function Sidebar({ sidebarMenu, userLabel, isAdmin }) {
  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="sticky top-20">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">{userLabel}</div>
              <div className="text-xs text-slate-500">{isAdmin ? "Admin Area" : "Pemohon Area"}</div>
            </div>
            <div className="rounded-xl bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
              {isAdmin ? "ADMIN" : "USER"}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {sidebarMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 border-t border-black/10 pt-3 text-xs text-slate-500">
            Nav ini khusus user login. Nanti kita bisa tambah fitur di sini tanpa nyentuh topbar.
          </div>
        </div>
      </div>
    </aside>
  );
}
