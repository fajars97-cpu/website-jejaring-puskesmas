import BrandLogo from "./parts/BrandLogo";
export default function Footbar({
  variant = "public",
  SOCIAL_LINKS = [],
  QUICK_LINKS = [],
}) {
  if (variant === "app")
    return (
      <footer className="portal-app-footer">
        <span>&copy; {new Date().getFullYear()} Puskesmas Jagakarsa</span>
        <span>Jejaring &middot; Perizinan &middot; Monitoring</span>
      </footer>
    );
  return (
    <footer className="portal-footer">
      <div className="portal-footer-inner">
        <div className="portal-footer-grid">
          <div>
            <div className="portal-brand portal-brand-footer">
              <BrandLogo />
              <span>
                <strong>Puskesmas Jagakarsa</strong>
                <small>PORTAL INFORMASI JEJARING</small>
              </span>
            </div>
            <p className="portal-footer-description">
              Menghubungkan fasilitas kesehatan untuk mendukung pelayanan
              masyarakat di Kecamatan Jagakarsa.
            </p>
            <a
              className="portal-footer-map"
              href="https://maps.google.com/?q=Puskesmas+Kecamatan+Jagakarsa"
              target="_blank"
              rel="noreferrer"
            >
              Lihat lokasi Puskesmas <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
          <div>
            <h2>Hubungi kami</h2>
            <address>
              Jl. Sirsak No. 1, RT.001/02, Jagakarsa
              <br />
              Jakarta Selatan, DKI Jakarta 12630
            </address>
            <a href="tel:+6281389685271">0813 8968 5271</a>
            <a href="mailto:jaring.jejaringjagakarsa@gmail.com">
              jaring.jejaringjagakarsa@gmail.com
            </a>
            <p className="portal-footer-hours">
              Senin&ndash;Jumat, 07.30&ndash;15.00 WIB
              <br />
              IGD 24 jam
            </p>
          </div>
          <div>
            <h2>Informasi & layanan</h2>
            {QUICK_LINKS.map((q) => (
              <a key={q.label} href={q.href} target="_blank" rel="noreferrer">
                {q.label} <span aria-hidden="true">&#8599;</span>
              </a>
            ))}
            <h2 className="portal-social-heading">Ikuti kami</h2>
            <div className="portal-social-links">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="portal-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Puskesmas Jagakarsa</span>
          <span>Jejaring kesehatan, lebih dekat dengan masyarakat.</span>
        </div>
      </div>
    </footer>
  );
}
