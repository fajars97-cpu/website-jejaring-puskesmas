import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils/cn";

export default function Burgerbar({
  open,
  publicMenu,
  sidebarMenu,
  onClose,
  user,
  isAdmin,
  loading,
  userLabel,
  onSignOut,
}) {
  return (
    <div className={cn("md:hidden border-t border-white/10 bg-emerald-950", open ? "block" : "hidden")}>
      <div className="mx-auto max-w-6xl px-4 py-3 space-y-3">
        {/* Public menu */}
        <div className="space-y-2">
          {publicMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                  isActive ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/10"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Sidebar menu (login-only) */}
        {!loading && user && sidebarMenu?.length ? (
          <div className="pt-2">
            <div className="mb-2 text-xs font-bold tracking-wide text-white/60">
              {isAdmin ? "ADMIN MENU" : "AKUN"}
            </div>
            <div className="space-y-2">
              {sidebarMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                      isActive ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/10"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}

        {/* Auth actions */}
        <div className="pt-2">
          {loading ? (
            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/15">
              …
            </div>
          ) : user ? (
            <div className="space-y-2">
              <NavLink
                to={isAdmin ? "/admin" : "/pemohon/mou"}
                onClick={onClose}
                className="block rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                {userLabel}
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <NavLink
                to="/login"
                onClick={onClose}
                className="block w-full rounded-xl bg-white px-3 py-2 text-center text-sm font-bold text-emerald-900 hover:bg-white/95"
              >
                Login
              </NavLink>
              <NavLink
                to="/login-admin"
                onClick={onClose}
                className="block w-full rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
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
