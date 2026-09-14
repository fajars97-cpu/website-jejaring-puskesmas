import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJejaringList } from "../lib/jejaringRepo";
import { getFacilityIllustration, resolveFacilityImage } from "../lib/facilityIllustration";

const resources = [
  {
    title: "Permenkes Puskesmas",
    desc: "Dokumen ketentuan penyelenggaraan Puskesmas.",
    href: "https://drive.google.com/file/d/1AL-SvFQBR7TBuNqQtf8rszrJ-SS5FY6m/view?usp=drive_link",
  },
  {
    title: "Akreditasi fasilitas kesehatan",
    desc: "Referensi standar dan masa berlaku akreditasi.",
    href: "https://drive.google.com/drive/folders/1K0l6fhubuARHBBvSjMSuyVhudEX-zcF0?usp=sharing",
  },
];

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetchJejaringList()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch(() => {
        if (active)
          setError(
            "Data jejaring belum dapat dimuat. Silakan muat ulang halaman.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const stats = useMemo(
    () => [
      { label: "Fasilitas kesehatan", value: rows.length },
      {
        label: "Fasyankes aktif",
        value: rows.filter((r) => r.status?.toLowerCase() === "aktif").length,
      },
      {
        label: "Terakreditasi",
        value: rows.filter((r) => r.terakreditasi).length,
      },
      {
        label: "Kelurahan terwakili",
        value: new Set(rows.map((r) => r.kelurahan).filter(Boolean)).size,
      },
    ],
    [rows],
  );
  const types = useMemo(() => {
    const counts = new Map();
    rows.forEach((r) => {
      const type = r.tipeFasyankes?.trim() || "Lainnya";
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <div className="portal-home">
      <section className="portal-hero">
        <div className="portal-hero-copy">
          <p className="portal-eyebrow">
            <span className="portal-status-dot" /> PORTAL JEJARING PUSKESMAS
            JAGAKARSA
          </p>
          <h1>
            Terhubung untuk <span>layanan yang lebih baik.</span>
          </h1>
          <p className="portal-hero-description">
            Akses informasi fasilitas kesehatan, jejaring pelayanan, dan
            pengajuan kerja sama dalam satu portal.
          </p>
          <div className="portal-actions">
            <Link to="/jejaring" className="portal-button portal-button-green">
              Jelajahi jejaring <span aria-hidden="true">&#8599;</span>
            </Link>
            <Link to="/perizinan" className="portal-hero-link">
              Informasi perizinan <span aria-hidden="true">&#8599;</span>
            </Link>
          </div>
          <p className="portal-hero-location">
            KECAMATAN JAGAKARSA <span aria-hidden="true">/</span> JAKARTA
            SELATAN
          </p>
        </div>
        <figure className="portal-hero-art">
          <img
            src={import.meta.env.BASE_URL + "illustrations/community-care.jpg"}
            alt="Ilustrasi dokter dan perawat mendampingi keluarga di lingkungan fasilitas kesehatan"
            width="1448"
            height="1086"
            fetchPriority="high"
          />
        </figure>
      </section>
      <section className="portal-services" aria-label="Akses layanan digital">
        <div className="portal-service-panel">
          <div className="portal-services-heading">
            <p className="portal-eyebrow">LAYANAN DIGITAL</p>
            <h2>Mulai dari kebutuhan Anda</h2>
          </div>
          {[
            [
              "01",
              "Temukan fasilitas kesehatan",
              "Direktori dan peta jejaring",
              "/jejaring",
            ],
            [
              "02",
              "Ajukan kerja sama MoU",
              "Pengajuan baru dan perpanjangan",
              "/pemohon/mou",
            ],
            [
              "03",
              "Pelajari alur perizinan",
              "Informasi dan persyaratan",
              "/perizinan",
            ],
          ].map(([n, title, description, path]) => (
            <Link key={n} to={path} className="portal-service-link">
              <span className="portal-service-number">{n}</span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <span aria-hidden="true">&#8599;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-section" aria-labelledby="stats-heading">
        <div className="portal-section-heading">
          <div>
            <p className="portal-eyebrow">JEJARING DALAM ANGKA</p>
            <h2 id="stats-heading">Bersama melayani Jagakarsa</h2>
          </div>
          <span className="portal-meta">
            Berdasarkan data jejaring terdaftar
          </span>
        </div>
        {error ? (
          <p role="alert" className="portal-notice">
            {error}
          </p>
        ) : (
          <div className="portal-stats" aria-busy={loading}>
            {stats.map((s, i) => (
              <div key={s.label} className="portal-stat">
                <span className="portal-stat-index">0{i + 1}</span>
                <strong>
                  {loading ? "\u2014" : s.value.toLocaleString("id-ID")}
                </strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && types.length > 0 && (
          <div className="portal-types">
            {types.map(([type, count]) => (
              <span key={type}>
                {type}
                <b>{count}</b>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="portal-section" aria-labelledby="facilities-heading">
        <div className="portal-section-heading">
          <div>
            <p className="portal-eyebrow">DIREKTORI FASILITAS</p>
            <h2 id="facilities-heading">Kenali jejaring kesehatan kami</h2>
          </div>
          <Link to="/jejaring" className="portal-text-link">
            Lihat semua fasilitas <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
        {loading ? (
          <div className="portal-facility-grid" aria-label="Memuat fasilitas">
            {[1, 2, 3].map((n) => (
              <div className="portal-skeleton" key={n} />
            ))}
          </div>
        ) : rows.length ? (
          <div className="portal-facility-grid">
            {rows.slice(0, 6).map((r) => (
              <Link to="/jejaring" key={r.id} className="portal-facility">
                <div className="portal-facility-image">
                  <img
                    src={resolveFacilityImage(r)}
                    alt={r.foto ? r.namaFasyankes : `Ilustrasi ${r.tipeFasyankes || r.jenisFasyankes || "fasilitas kesehatan"}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getFacilityIllustration(r);
                    }}
                  />
                  {r.terakreditasi && (
                    <span className="portal-accreditation">
                      &#10003; Terakreditasi
                    </span>
                  )}
                </div>
                <div className="portal-facility-body">
                  <p className="portal-facility-type">
                    {r.tipeFasyankes ||
                      r.jenisFasyankes ||
                      "Fasilitas kesehatan"}
                  </p>
                  <h3>{r.namaFasyankes}</h3>
                  <p className="portal-facility-address">
                    {r.alamat || "Alamat belum tersedia"}
                  </p>
                  <div className="portal-facility-bottom">
                    <span>{r.kelurahan || "Jagakarsa"}</span>
                    <span aria-hidden="true">&#8599;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="portal-notice">
            {error
              ? "Direktori sementara belum dapat ditampilkan."
              : "Belum ada fasilitas kesehatan yang ditampilkan."}
          </p>
        )}
      </section>

      <section
        className="portal-resource-section"
        aria-labelledby="resources-heading"
      >
        <div>
          <p className="portal-eyebrow">PUSAT INFORMASI</p>
          <h2 id="resources-heading">
            Referensi untuk
            <br />
            pelayanan yang berkualitas.
          </h2>
          <p>
            Temukan dokumen dan informasi pendukung bagi fasilitas kesehatan
            dalam jejaring.
          </p>
          <Link to="/perizinan" className="portal-text-link">
            Panduan perizinan <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
        <div className="portal-resources">
          {resources.map((r, i) => (
            <a
              href={r.href}
              key={r.title}
              target="_blank"
              rel="noreferrer"
              className="portal-resource"
            >
              <span className="portal-resource-number">0{i + 1}</span>
              <span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <small>
                  Buka dokumen <span className="sr-only">di tab baru</span>
                </small>
              </span>
              <span aria-hidden="true">&#8599;</span>
            </a>
          ))}
        </div>
      </section>
      <section className="portal-partner">
        <div>
          <p className="portal-eyebrow">KEMITRAAN PELAYANAN</p>
          <h2>Bangun kerja sama yang lebih terarah.</h2>
          <p>
            Kelola pengajuan MoU dan perpanjangan kerja sama melalui akun
            pemohon.
          </p>
        </div>
        <Link to="/pemohon/mou" className="portal-button portal-button-green">
          Ajukan kerja sama <span aria-hidden="true">&#8599;</span>
        </Link>
      </section>
    </div>
  );
}
