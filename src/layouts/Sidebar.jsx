import { NavLink } from "react-router-dom";
import { MENU } from "../config/menuConfig";

export default function Sidebar({ role }) {
  const items = MENU[role] || [];

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 font-bold text-blue-600">
        SIMDIKLAT
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item, idx) => {
          if (item.type === "group") {
            return (
              <div key={idx} className="mt-4 text-xs font-semibold text-slate-400 uppercase">
                {item.label}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm
                 ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
