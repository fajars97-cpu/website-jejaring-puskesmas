import { NavLink } from "react-router-dom";
import { MENU } from "../config/menuConfig";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function NavItem({ to, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
          isActive
            ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]"
            : "text-emerald-50/85 hover:bg-white/10 hover:text-white"
        )
      }
    >
      {/* Active indicator bar */}
      <span
        className={cx(
          "absolute left-0 top-2 bottom-2 w-1 rounded-full transition-opacity",
          "bg-emerald-300",
          "opacity-0 group-[.active]:opacity-100"
        )}
      />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ role, open = false, onClose = () => {} }) {
  const items = MENU[role] || [];

  const handleNavigate = () => {
    // close drawer on mobile after click
    onClose();
  };

  return (
    <>
      {/* Overlay (mobile only) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup menu"
        className={cx(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sidebar */}
      <aside
        className={cx(
          "z-50 w-70 shrink-0",
          // Desktop: sticky card
          "md:sticky md:top-4 md:h-[calc(100vh-32px)] md:rounded-2xl",
          // Mobile: drawer
          "fixed left-0 top-0 h-full md:static",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Theme: match navbar/footer (emerald/dark)
          "bg-emerald-950 text-white shadow-xl md:shadow-sm",
          "ring-1 ring-white/10"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-wide">
              Jejaring Puskesmas
            </div>
            <div className="mt-0.5 text-xs text-emerald-100/70 truncate">
              Puskesmas Jagakarsa • DKI Jakarta
            </div>
          </div>

          {/* Close button (mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition"
            aria-label="Tutup menu"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <nav className="px-3 py-4">
          {items.map((item, idx) => {
            if (item.type === "group") {
              return (
                <div
                  key={`g-${idx}`}
                  className="mt-4 px-2 pb-2 text-[11px] font-semibold tracking-[0.14em] text-emerald-100/55 uppercase"
                >
                  {item.label}
                </div>
              );
            }

            return (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                onNavigate={handleNavigate}
              />
            );
          })}
        </nav>

        {/* Footer hint */}
        <div className="mt-auto px-5 py-4 border-t border-white/10">
          <div className="text-[11px] text-emerald-100/60">
            {role === "super_admin" ? "Mode: Super Admin" : "Mode: Pemohon"}
          </div>
        </div>
      </aside>
    </>
  );
}
