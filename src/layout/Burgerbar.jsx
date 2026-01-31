import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./Sidebar";

export default function Burgerbar({ open, onClose }) {
  // Close on ESC handled in Layout, tapi aman kalau kamu mau keep di sini juga.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={[
        "fixed inset-0 z-[70] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
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
          "absolute left-0 top-0 h-full w-[86%] max-w-[340px]",
          "bg-emerald-800 text-white border-r border-white/10 shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
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
                <div className="mt-0.5 text-[12px] text-white/70 truncate">
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
            <div className="px-2 pb-2 text-[11px] uppercase tracking-wider text-white/60">
              Menu
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  onClick={onClose}
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

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-4 rounded-lg bg-white/7 px-3 py-3">
              <div className="text-[12px] font-semibold text-white/90">Gesture</div>
              <div className="mt-1 text-[12px] text-white/70 leading-relaxed">
                Swipe kiri untuk menutup.
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/60">
            Tap di luar untuk menutup
          </div>
        </div>
      </div>
    </div>
  );
}
