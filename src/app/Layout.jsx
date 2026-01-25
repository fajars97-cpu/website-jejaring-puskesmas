import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Menu publik
 */
const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

/**
 * Warna pedoman (Dinkes style)
 */
const COLORS = {
  green: "#087745",
  greenSoft: "#e6f4ee",
  blue: "#0e7490",
  textDark: "#1f2937",
  textMuted: "#64748b",
  border: "#e5e7eb",
  bgPage: "#f8fafc",
};

function getUserLabel(user) {
  const email = user?.email || "";
  if (!email) return "Admin";
  return email.split("@")[0];
}

export default function Layout() {
  const { user, isAdmin, loading, signOut } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        color: COLORS.textDark,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundColor: COLORS.green,
          color: "#ffffff",
          padding: "14px 24px",
        }}
      >
        <strong style={{ fontSize: 16 }}>Website Jejaring Puskesmas</strong>

        <nav
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {publicMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "#ffffff",
                paddingBottom: 4,
                borderBottom: isActive ? "2px solid #ffffff" : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}

          {/* RIGHT SIDE */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {loading ? (
              <span style={{ fontSize: 13, opacity: 0.85 }}>…</span>
            ) : user && isAdmin ? (
              <>
                <NavLink
                  to="/admin"
                  title={user?.email || ""}
                  style={{
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  {getUserLabel(user)}
                </NavLink>

                <button
                  type="button"
                  onClick={signOut}
                  style={{
                    cursor: "pointer",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              >
                Login
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          backgroundColor: COLORS.bgPage,
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "12px 24px",
          fontSize: 12,
          color: COLORS.textMuted,
          backgroundColor: "#ffffff",
        }}
      >
        © Puskesmas
      </footer>
    </div>
  );
}
