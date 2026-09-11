import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

export default function Burgerbar({
  open,
  onClose,
  publicMenu = [],
  sidebarMenu = [],
  user,
  loading,
  userLabel,
  isAdmin,
  onSignOut,
}) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const focusable = () => [...(panelRef.current?.querySelectorAll('a[href], button:not([disabled])') || [])];
    focusable()[0]?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  const isAuthed = !!user && !loading;

  const renderLink = (to, label) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      onClick={onClose}
      className={({ isActive }) =>
        [
          "relative flex items-center rounded-md px-3 py-2 text-xs font-medium",
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
              "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r transition-all",
              isActive ? "w-1 bg-emerald-200 opacity-100" : "w-0 opacity-0",
            ].join(" ")}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div
      className={[
        "fixed inset-0 z-70 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "absolute left-0 top-0 h-full w-[86%] max-w-85",
          "bg-emerald-900 text-white border-r border-white/10 shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        id="mobile-navigation"
        ref={panelRef}
        aria-label="Menu navigasi"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-tight">
                  Website Jejaring Puskesmas
                </div>
                <div className="mt-0.5 text-xs text-white/70 truncate">
                  Puskesmas Jagakarsa • DKI Jakarta
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 transition"
                aria-label="Tutup menu"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 h-px bg-white/10" />
          </div>

          {/* Menu */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            <div className="px-2 pb-2 text-xs uppercase tracking-wider text-white/60">
              {isAuthed ? "Apps" : "Menu"}
            </div>

            {isAuthed ? (
              <div className="space-y-4">
                <nav aria-label="Navigasi publik" className="space-y-1">
                  {publicMenu.map((it) => renderLink(it.path, it.label))}
                </nav>
                {sidebarMenu.map((group) => (
                  <div key={group.title || "app"}>
                    <div className="px-2 pb-2 text-xs uppercase tracking-wider text-white/50">
                      {group.title || "Menu"}
                    </div>
                    <nav className="space-y-1">
                      {(group.items || []).map((it) => renderLink(it.path, it.label))}
                    </nav>
                  </div>
                ))}

                <div className="mt-6 h-px bg-white/10" />

                <div className="rounded-lg bg-white/7 px-3 py-3">
                  <div className="text-xs font-semibold text-white/90">Akun</div>
                  <div className="mt-1 text-xs text-white/70 truncate">
                    {userLabel || user?.email}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {isAdmin ? "Admin / Super Admin" : "Pemohon"}
                  </div>
                </div>
              </div>
            ) : (
              <nav className="space-y-1">
                {publicMenu.map((it) => renderLink(it.path, it.label))}
                {renderLink("/login", "Login")}
              </nav>
            )}
          </div>

          {/* Bottom actions */}
          <div className="px-5 py-4 border-t border-white/10">
            {isAuthed ? (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onSignOut?.();
                }}
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                Logout
              </button>
            ) : (
              <div className="text-xs text-white/60">Swipe kiri / tap luar untuk menutup</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
