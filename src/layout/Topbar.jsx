import { NavLink } from "react-router-dom";
import BrandLogo from "./parts/BrandLogo";
import MenuLink from "./parts/MenuLink";

export default function Topbar({
  publicMenu,
  user,
  isAdmin,
  loading,
  userLabel,
  mobileOpen,
  onToggleMobile,
  onCloseMobile,
  onSignOut,
  isAppChrome = false,
}) {
  return (
    <header className="portal-topbar">
      <div
        className={
          isAppChrome ? "portal-nav-inner portal-nav-wide" : "portal-nav-inner"
        }
      >
        <NavLink to="/" className="portal-brand" onClick={onCloseMobile}>
          <BrandLogo />
          <span>
            <strong>Jejaring Puskesmas</strong>
            <small>JAGAKARSA &middot; JAKARTA SELATAN</small>
          </span>
        </NavLink>
        <nav className="portal-desktop-nav" aria-label="Navigasi utama">
          {publicMenu.map((item) => (
            <MenuLink key={item.path} to={item.path} end={item.end}>
              {item.label}
            </MenuLink>
          ))}
        </nav>
        <div className="portal-account">
          {loading ? (
            <span className="portal-meta" role="status">
              Memuat...
            </span>
          ) : user ? (
            <>
              <NavLink
                to={isAdmin ? "/admin/permohonan-mou" : "/pemohon/mou"}
                className="portal-account-name"
              >
                {userLabel}
              </NavLink>
              <button onClick={onSignOut} className="portal-signout">
                Keluar
              </button>
            </>
          ) : (
            <NavLink to="/login" className="portal-button portal-button-green">
              Masuk <span aria-hidden="true">&#8599;</span>
            </NavLink>
          )}
        </div>
        <button
          className="portal-menu-toggle"
          onClick={onToggleMobile}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path
              d={
                mobileOpen ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"
              }
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
