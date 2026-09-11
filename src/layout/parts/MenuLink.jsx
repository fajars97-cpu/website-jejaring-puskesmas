import { NavLink } from "react-router-dom";
export default function MenuLink({ to, end, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        "portal-nav-link" + (isActive ? " is-active" : "")
      }
    >
      {children}
    </NavLink>
  );
}
