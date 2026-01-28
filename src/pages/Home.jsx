import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchJejaringList } from "../lib/jejaringRepo";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({ title, value, sub, tone = "emerald" }) {
  const tones = {
    emerald: "border-emerald-200/60 bg-white",
    blue: "border-blue-200/60 bg-white",
    amber: "border-amber-200/60 bg-white",
    violet: "border-violet-200/60 bg-white",
    slate: "border-black/10 bg-white",
  };
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", tones[tone] || tones.slate)}>
      <div className="text-sm font-semibold text-black/70">{title}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-black/90">{value}</div>
      {sub ? <div className="mt-1 text-xs text-black/55">{sub}</div> : null}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-black/70">
      {children}
    </span>
  );
}

function Photo({ src, alt }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/5 text-xs font-semibold text-black/40">
        Tanpa Foto
      </div>
    );
  }
  return <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setErrMsg("");

      try {
        // Ikuti sumber data yang SUDAH stabil dipakai Jejaring.jsx
        const data = await fetchJejaringList();
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErrMsg(e?.message || "Gagal memuat data dari database.");
        setRows([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;

    const byJenis = rows.reduce((acc, r) => {
      const jenis = r?.jenisFasyankes || "Lainnya";
      acc[jenis] = (acc[jenis] || 0) + 1;
      return acc;
    }, {});

    const kelSet = new Set(
      rows
        .map((r) => r?.kelurahan || "")
        .filter(Boolean)
        .map((x) => String(x).toLowerCase())
    );

    const topJenis = Object.entries(byJenis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total,
      kelurahanCount: kelSet.size,
      byJenis,
      topJenis,
    };
  }, [rows]);

  const featured = useMemo(() => rows.slice(0, 12), [rows]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-900 md:text-3xl">
          Website Jejaring & Perizinan Puskesmas
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60 md:text-base">
          Fondasi sistem informasi jejaring dan perizinan fasilitas kesehatan untuk mendukung pelayanan
          dan pengawasan yang terintegrasi di Kecamatan Jagakarsa.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <NavLink
            to="/jejaring"
            className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
          >
            Lihat Jejaring
          </NavLink>
          <NavLink
            to="/perizinan"
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-900 ring-1 ring-black/10 hover:bg-black/5"
          >
            Info Perizinan
          </NavLink>
        </div>

        {errMsg ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Ada kendala memuat data dashboard: <span className="font-semibold">{errMsg}</span>
          </div>
        ) : null}
      </section>

      {/* DASHBOARD */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-black/90">Ringkasan Jejaring Jagakarsa</h2>
            <p className="text-sm text-black/55">Snapshot cepat untuk monitoring.</p>
          </div>
          <div className="text-xs text-black/45">{loading ? "Memuat…" : "Terbaru"}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Fasyankes" value={loading ? "…" : stats.total} sub="Terdaftar di sistem" tone="emerald" />
          <StatCard title="Jumlah Kelurahan" value={loading ? "…" : stats.kelurahanCount} sub="Ada fasyankes jejaring" tone="blue" />
          <StatCard
            title="Top Jenis #1"
            value={loading ? "…" : (stats.topJenis[0]?.[0] || "—")}
            sub={loading ? "" : (stats.topJenis[0] ? `${stats.topJenis[0][1]} fasyankes` : "Tidak ada data")}
            tone="amber"
          />
          <StatCard
            title="Top Jenis #2"
            value={loading ? "…" : (stats.topJenis[1]?.[0] || "—")}
            sub={loading ? "" : (stats.topJenis[1] ? `${stats.topJenis[1][1]} fasyankes` : "—")}
            tone="violet"
          />
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-black/80">Breakdown Jenis Fasyankes</div>
            <NavLink to="/jejaring" className="text-sm font-semibold text-emerald-900 hover:underline">
              Buka halaman Jejaring →
            </NavLink>
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Memuat ringkasan…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-black/50">Belum ada data fasyankes.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byJenis)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([jenis, n]) => (
                  <Badge key={jenis}>
                    {jenis} • {n}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-black/90">Sorotan Jejaring</h2>
            <p className="text-sm text-black/55">Geser untuk lihat beberapa fasyankes terbaru.</p>
          </div>
          <NavLink to="/jejaring" className="text-sm font-semibold text-emerald-900 hover:underline">
            Lihat semua →
          </NavLink>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex gap-4 overflow-x-auto pb-2",
              "snap-x snap-mandatory",
              "[-ms-overflow-style:none] [scrollbar-width:none]",
              "[&::-webkit-scrollbar]:hidden"
            )}
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-[78%] sm:w-90 rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden"
                >
                  <div className="h-40 bg-black/5 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-2/3 bg-black/10 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-black/10 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-black/10 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : featured.length === 0 ? (
              <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm">
                Belum ada fasyankes untuk ditampilkan.
              </div>
            ) : (
              featured.map((r) => {
                const id = r.id;
                const nama = r?.namaFasyankes || "Nama belum diisi";
                const jenis = r?.jenisFasyankes || "—";
                const kel = r?.kelurahan ? `Kel. ${r.kelurahan}` : "—";
                const alamat = r?.alamat || "";
                const foto = r?.foto || "";

                return (
                  <NavLink
                    key={id}
                    to="/jejaring"
                    className="snap-start shrink-0 w-[78%] sm:w-90 rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                    title={nama}
                  >
                    <div className="h-44 bg-black/5">
                      <Photo src={foto} alt={nama} />
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{jenis}</Badge>
                        <Badge>{kel}</Badge>
                      </div>

                      <div className="mt-2 text-base font-extrabold text-black/90 line-clamp-2">{nama}</div>

                      {alamat ? (
                        <div className="mt-1 text-sm text-black/60 line-clamp-2">{alamat}</div>
                      ) : (
                        <div className="mt-1 text-sm text-black/40">Alamat belum diisi</div>
                      )}

                      <div className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-900">
                        Lihat di peta & detail →
                      </div>
                    </div>
                  </NavLink>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
