import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

export default function MenuLink({ to, end, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "relative text-sm font-semibold tracking-tight transition",
          "text-white/85 hover:text-white",
          "after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:rounded-full after:transition",
          isActive ? "text-white after:bg-white" : "after:bg-transparent"
        )
      }
    >
      {children}
    </NavLink>
  );
}
