import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";

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
    <div
      className="md:hidden fixed inset-0 z-[60] bg-black/40"
      onClick={onClose}
    >
      {/* Drawer */}
      <div
        className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-emerald-950 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold">Website Jejaring Puskesmas</div>
            <div className="mt-1 text-xs text-white/70">Puskesmas Jagakarsa • DKI Jakarta</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/15 hover:bg-white/15"
          >
            Tutup
          </button>
        </div>

        <div className="h-[calc(100%-72px)] overflow-y-auto px-3 py-4 space-y-5">
          {/* Public */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-white/45">
              NAVIGASI
            </div>
            <div className="space-y-1">
              {publicMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      isActive ? "bg-white/12 text-white" : "text-white/85 hover:bg-white/10"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Login-only */}
          {!loading && user && sidebarMenu?.length ? (
            <div>
              <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-white/45">
                {isAdmin ? "ADMIN" : "AKUN"}
              </div>

              <div className="space-y-4">
                {sidebarMenu.map((group, gi) => (
                  <div key={gi}>
                    {group?.title ? (
                      <div className="px-2 pb-2 text-[11px] font-extrabold tracking-widest text-white/35">
                        {group.title}
                      </div>
                    ) : null}

                    <div className="space-y-1">
                      {(group?.items || []).map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                              isActive ? "bg-white/12 text-white" : "text-white/85 hover:bg-white/10"
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
          <div className="pt-3 border-t border-white/10">
            {loading ? (
              <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">…</div>
            ) : user ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                  <div className="font-extrabold">{userLabel || "User"}</div>
                  <div className="text-xs text-white/60">Mode: {isAdmin ? "Super Admin" : "Pemohon"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut?.();
                  }}
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <NavLink
                  to="/login"
                  onClick={onClose}
                  className="block rounded-xl bg-white px-3 py-2 text-center text-sm font-extrabold text-emerald-900"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={onClose}
                  className="block rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-extrabold ring-1 ring-white/15 hover:bg-white/15"
                >
                  Daftar
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
