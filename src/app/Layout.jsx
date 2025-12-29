import { Outlet, NavLink } from "react-router-dom";

/**
 * Menu publik
 */
const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

/**
 * Menu auth
 */
const authMenu = [{ label: "Login", path: "/login" }];

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

export default function Layout() {
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
        <strong style={{ fontSize: 16 }}>
          Website Jejaring Puskesmas
        </strong>

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
                borderBottom: isActive
                  ? "2px solid #ffffff"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <div style={{ marginLeft: "auto" }}>
            {authMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </NavLink>
            ))}
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
        {/* container supaya konten tidak nempel pinggir */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
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
