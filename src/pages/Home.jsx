import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchJejaringList } from "../lib/jejaringRepo";

function cn(...c) {
  return c.filter(Boolean).join(" ");
}

/* ---------- DASHBOARD CARD ---------- */
function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-black/60">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-emerald-900">{value}</div>
    </div>
  );
}

/* ---------- BADGE ---------- */
function Badge({ children }) {
  return (
    <span className="rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

/* ---------- CAROUSEL CONTROLS ---------- */
function CarouselControls({ containerRef }) {
  const scroll = (dir) => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    containerRef.current.scrollBy({
      left: dir === "left" ? -w : w,
      behavior: "smooth",
    });
  };

  return (
    <div className="hidden md:flex gap-2">
      <button
        onClick={() => scroll("left")}
        className="rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5"
      >
        ◀
      </button>
      <button
        onClick={() => scroll("right")}
        className="rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5"
      >
        ▶
      </button>
    </div>
  );
}

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const jejaringRef = useRef(null);
  const regulasiRef = useRef(null);

  useEffect(() => {
    fetchJejaringList()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- DASHBOARD HITUNGAN ---------- */
  const stats = useMemo(() => {
    const total = rows.length;

    const byJenis = (jenis) =>
      rows.filter((r) => r?.jenisFasyankes === jenis).length;

    const terakreditasi = rows.filter(
      (r) =>
        r?.statusAkreditasi === "Terakreditasi" ||
        r?.akreditasi === true
    ).length;

    return {
      total,
      terakreditasi,
      klinikUmum: byJenis("Klinik Umum"),
      klinikGigi: byJenis("Klinik Gigi"),
      apotek: byJenis("Apotek"),
    };
  }, [rows]);

  /* ---------- DATA REGULASI (DUMMY LINK) ---------- */
  const regulasi = [
    {
      title: "Permenkes Puskesmas",
      desc: "Ketentuan penyelenggaraan Puskesmas",
      url: "https://drive.google.com/",
    },
    {
      title: "Akreditasi Fasyankes",
      desc: "Standar & masa berlaku akreditasi",
      url: "https://drive.google.com/",
    },
    {
      title: "Jejaring & Rujukan",
      desc: "Pengaturan jejaring pelayanan",
      url: "https://drive.google.com/",
    },
    {
      title: "SISDMK",
      desc: "Sistem Informasi SDM Kesehatan",
      url: "https://drive.google.com/",
    },
  ];

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-emerald-900">
          Website Jejaring & Perizinan Puskesmas
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-black/60">
          Sistem informasi jejaring dan perizinan fasilitas kesehatan
          Kecamatan Jagakarsa.
        </p>
      </section>

      {/* DASHBOARD */}
      <section>
        <h2 className="mb-3 text-lg font-extrabold">Ringkasan Jejaring</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Fasyankes" value={loading ? "…" : stats.total} />
          <StatCard
            title="Terakreditasi"
            value={loading ? "…" : stats.terakreditasi}
          />
          <StatCard
            title="Klinik Umum"
            value={loading ? "…" : stats.klinikUmum}
          />
          <StatCard
            title="Klinik Gigi"
            value={loading ? "…" : stats.klinikGigi}
          />
          <StatCard title="Apotek" value={loading ? "…" : stats.apotek} />
        </div>
      </section>

      {/* JEJARING CAROUSEL */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Sorotan Jejaring</h2>
          <CarouselControls containerRef={jejaringRef} />
        </div>

        <div
          ref={jejaringRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden"
        >
          {rows.slice(0, 10).map((r) => (
            <NavLink
              key={r.id}
              to="/jejaring"
              className="snap-start w-[80%] sm:w-90 rounded-3xl border border-black/10 bg-white shadow-sm"
            >
              <div className="relative h-40 overflow-hidden rounded-t-3xl bg-black/5">
  {r.foto ? (
    <img
      src={r.foto}
      alt={r.namaFasyankes}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xs text-black/40">
      Tanpa Foto
    </div>
  )}

  {/* BADGE TERAKREDITASI (future-proof) */}
  {(r.statusAkreditasi === "Terakreditasi" ||
    r.akreditasi === true ||
    r.isTerakreditasi === true) && (
    <div className="absolute top-2 right-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow">
      ✓ TERAKREDITASI
    </div>
  )}
</div>

              <div className="p-4 space-y-2">
                <div className="flex gap-2">
                  <Badge>{r.jenisFasyankes}</Badge>
                  {r.kelurahan && <Badge>Kel. {r.kelurahan}</Badge>}
                </div>
                <div className="font-extrabold text-black/90">
                  {r.namaFasyankes}
                </div>
                <div className="text-sm text-black/60 line-clamp-2">
                  {r.alamat || "Alamat belum diisi"}
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* REGULASI CAROUSEL */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Regulasi & Peraturan</h2>
          <CarouselControls containerRef={regulasiRef} />
        </div>

        <div
          ref={regulasiRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden"
        >
          {regulasi.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="snap-start w-[80%] sm:w-90 rounded-3xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <div className="text-sm font-extrabold">{r.title}</div>
              <div className="mt-1 text-sm text-black/60">{r.desc}</div>
              <div className="mt-3 text-sm font-semibold text-emerald-900">
                Buka Dokumen →
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
