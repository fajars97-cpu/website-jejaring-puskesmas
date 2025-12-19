import { Outlet, NavLink } from "react-router-dom";

/**
 * Menu publik (tanpa login)
 * Nanti ini bisa dilihat semua orang
 */
const publicMenu = [
  { label: "Home", path: "/", end: true },
  { label: "Jejaring", path: "/jejaring" },
  { label: "Perizinan", path: "/perizinan" },
];

/**
 * Menu auth / internal
 * Sekarang hanya Login
 * Nanti bisa berkembang jadi Dashboard, Admin, dll
 */
const authMenu = [
  { label: "Login", path: "/login" },
];

/**
 * Style dasar (sementara, sebelum Tailwind)
 */
const linkStyle = {
  textDecoration: "none",
  padding: "6px 10px",
  color: "#cbd5e1",
};

const activeStyle = {
  fontWeight: "bold",
  borderBottom: "2px solid #38bdf8",
  color: "#ffffff",
};

export default function Layout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1f2933",
        color: "#ffffff",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #374151",
        }}
      >
        <strong>Website Jejaring Puskesmas</strong>

        {/* NAVIGATION */}
        <nav
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* MENU PUBLIK */}
          {publicMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeStyle }
                  : linkStyle
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* MENU AUTH (KANAN) */}
          <div style={{ marginLeft: "auto" }}>
            {authMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) =>
                  isActive
                    ? { ...linkStyle, ...activeStyle }
                    : linkStyle
                }
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
         padding: "24px",
         width: "100%",
         boxSizing: "border-box",
        }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #374151",
          fontSize: 12,
        }}
      >
        © Puskesmas
      </footer>
    </div>
  );
}
