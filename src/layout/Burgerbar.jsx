import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";

/**
 * Burgerbar = Mobile Drawer
 * - open: boolean
 * - publicMenu: [{ label, path, end? }]
 * - sidebarMenu (grouped): [{ title, items:[{label,path}] }]
 * - user/isAdmin/loading/userLabel/onSignOut
 */
export default function Burgerbar({
  open,
  onClose,
  publicMenu = [],
  sidebarMenu = [],
  user,
  isAdmin,
  loading,
  userLabel,
  onSignOut,
}) {
  if (!open) return null;

  return (
    <div className="md:hidden border-t border-white/10 bg-emerald-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        {/* Header mini (optional) */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold">Menu</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/15 hover:bg-white/15"
            aria-label="Close menu"
          >
            Tutup
          </button>
        </div>

        {/* Public menu */}
        <div>
          <div className="px-1 pb-2 text-[11px] font-extrabold tracking-widest text-white/55">
            NAVIGASI
          </div>
          <div className="space-y-2">
            {publicMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
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

        {/* Sidebar menu (login-only) */}
        {!loading && user && sidebarMenu?.length ? (
          <div>
            <div className="px-1 pb-2 text-[11px] font-extrabold tracking-widest text-white/55">
              {isAdmin ? "ADMIN" : "AKUN"}
            </div>

            <div className="space-y-4">
              {sidebarMenu.map((group, gi) => (
                <div key={gi}>
                  {group?.title ? (
                    <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-white/45">
                      {group.title}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    {(group?.items || []).map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
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
          </div>
        ) : null}

        {/* Auth actions */}
        <div className="pt-2 border-t border-white/10">
          {loading ? (
            <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold ring-1 ring-white/10">
              …
            </div>
          ) : user ? (
            <div className="space-y-2">
              <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm font-extrabold ring-1 ring-white/10">
                {userLabel || "User"}
                <div className="mt-1 text-xs text-white/60">Mode: {isAdmin ? "Super Admin" : "Pemohon"}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut?.();
                }}
                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-extrabold ring-1 ring-white/15 hover:bg-white/15"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <NavLink
                to="/login"
                onClick={onClose}
                className="block w-full rounded-2xl bg-white px-4 py-3 text-center text-sm font-extrabold text-emerald-900 hover:bg-white/95"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                onClick={onClose}
                className="block w-full rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-extrabold ring-1 ring-white/15 hover:bg-white/15"
              >
                Daftar
              </NavLink>
              <NavLink
                to="/login-admin"
                onClick={onClose}
                className="block w-full rounded-2xl bg-white/6 px-4 py-3 text-center text-sm font-extrabold ring-1 ring-white/10 hover:bg-white/12"
              >
                Login Admin
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
