import { useState, useMemo, useEffect, useRef, useCallback } from "react";

/* NOTE: Repo Supabase (adapter snake_case -> camelCase) */
import { fetchJejaringList } from "../lib/jejaringRepo";
import { getFacilityIllustration, resolveFacilityImage } from "../lib/facilityIllustration";

import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";
import JejaringExpanded from "../components/JejaringExpanded";
import JejaringMap from "../components/JejaringMap";

/* =========================================================
   SMOOTH SCROLL HELPER
   NOTE: helper lama kamu, dipertahankan apa adanya.
========================================================= */
function smoothScrollTo(targetY, duration = 750) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const FACILITIES_PER_PAGE = 10;

function getVisiblePageNumbers(totalPages, currentPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, Math.min(currentPage - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(currentPage + 1, 5));
  const pages = [1];

  if (start > 2) pages.push("start-ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("end-ellipsis");

  pages.push(totalPages);
  return pages;
}

/* =========================================================
   MOBILE CARD (Traveloka-like)
   - Foto di atas (object-cover)
   - Detail di bawah
   - Badge status di atas foto
   - Minimal dan aman (no dependency)
========================================================= */
function JejaringCardTK({ data, isActive, onClick }) {
  const foto = resolveFacilityImage(data);
  const fallbackIllustration = getFacilityIllustration(data);
  const nama = data?.namaFasyankes || "-";
  const isAkreditasi = data?.terakreditasi === true;
  const hasilAkreditasi = data?.hasilAkreditasi || "";
  const status = data?.status || "—";
  const jenis = data?.jenisFasyankes || "—";
  const tipe = data?.tipeFasyankes || "—";
  const kel = data?.kelurahan ? `Kel. ${data.kelurahan}` : "";
  const kec = data?.kecamatan ? `Kec. ${data.kecamatan}` : "";
  const alamat = data?.alamat || "";

  const statusLower = String(status).toLowerCase();
  const statusClass =
    statusLower === "aktif"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition active:scale-[0.99] " +
        (isActive
          ? "border-emerald-300 ring-2 ring-emerald-200"
          : "border-slate-200 hover:shadow-sm")
      }
    >
      {/* Foto */}
      <div className="relative h-48 w-full bg-slate-100">
        <img
          src={foto}
          alt={data?.foto ? nama : `Ilustrasi ${tipe || jenis}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = fallbackIllustration;
          }}
        />
        {/* Badge akreditasi */}
          {isAkreditasi && (
          <div className="absolute right-3 top-3">
          <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
          Terakreditasi {hasilAkreditasi}
          </span>
          </div>
       )}
        {/* Badge status */}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Detail */}
      <div className="p-4">
        <div className="text-lg font-semibold text-slate-900 leading-snug">
          {nama}
        </div>

        <div className="mt-1 text-sm text-slate-600">
          {jenis} <span className="text-slate-300">•</span> {tipe}
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-700">
          <div className="text-slate-600">{[kel, kec].filter(Boolean).join(", ")}</div>

          {/* Alamat (2 baris-ish) */}
          <div className="text-slate-700">
            <span className="block overflow-hidden text-ellipsis">{alamat}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Jejaring() {
  /* =========================================================
     FILTER STATE (SINGLE SOURCE OF TRUTH)
     NOTE: Tetap sama, jangan diubah.
  ========================================================= */
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================================================
     DATA SOURCE (SUPABASE ONLY)
     NOTE:
     - Tidak ada fallback lokal.
     - Anti white blank: pakai loading + error state.
  ========================================================= */
  const [jejaringList, setJejaringList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* =========================================================
     ACTIVE CARD STATE
  ========================================================= */
  const [activeId, setActiveId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  /* =========================================================
     REF (AUTO SCROLL EXPANDED)
  ========================================================= */
  const expandedRef = useRef(null);

  /* =========================================================
     MAP API BRIDGE (imperative, tapi minimal & aman)
  ========================================================= */
  const mapApiRef = useRef(null);
  const registerMapApi = useCallback((api) => {
    mapApiRef.current = api;
  }, []);

  /* =========================================================
     FETCH DATA FROM SUPABASE (READ-ONLY)
  ========================================================= */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await fetchJejaringList();
      setJejaringList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal load jejaring dari Supabase:", err);
      setLoadError(err);
      setJejaringList([]);
      setActiveId(null);
      setActiveRow(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadData();
    })();
    return () => {
      mounted = false;
    };
  }, [loadData]);

  /* =========================================================
     FILTER OPTIONS (ANTI DUPLIKASI)
  ========================================================= */
  const jenisOptions = useMemo(() => {
    return [...new Set((jejaringList ?? []).map((i) => i.jenisFasyankes).filter(Boolean))];
  }, [jejaringList]);

  const kelurahanOptions = useMemo(() => {
    return [...new Set((jejaringList ?? []).map((i) => i.kelurahan).filter(Boolean))];
  }, [jejaringList]);

  const statusOptions = useMemo(() => {
    return [...new Set((jejaringList ?? []).map((i) => i.status).filter(Boolean))];
  }, [jejaringList]);

  /* =========================================================
     FILTERED DATA & PAGINATION
  ========================================================= */
  const filteredData = useMemo(() => {
    return (jejaringList ?? [])
      .filter(
        (item) =>
          (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
          (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
          (filterStatus === "Semua" || item.status === filterStatus)
      );
  }, [jejaringList, filterJenis, filterKelurahan, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / FACILITIES_PER_PAGE));
  const pageStart = (currentPage - 1) * FACILITIES_PER_PAGE;
  const paginatedData = filteredData.slice(pageStart, pageStart + FACILITIES_PER_PAGE);
  const activeData = paginatedData.find((i) => i.id === activeId);
  const visiblePageNumbers = getVisiblePageNumbers(totalPages, currentPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setActiveId(null);
      setActiveRow(null);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setActiveId(null);
    setActiveRow(null);
  };

  /* =========================================================
     HANDLER: CARD CLICK (LIST)
  ========================================================= */
  const handleCardClick = (id, rowIndex) => {
    if (activeId === id) {
      setActiveId(null);
      setActiveRow(null);
      return;
    }

    setActiveId(id);
    setActiveRow(rowIndex);

    // FlyTo ke titik jejaring (kalau ada)
    mapApiRef.current?.flyToJejaringById?.(id);
  };

  /* =========================================================
     HANDLER: MAP → LIST (KELURAHAN)
  ========================================================= */
  const handleKelurahanSelect = (kelurahanName) => {
    setFilterKelurahan(kelurahanName);
    setCurrentPage(1);
    setActiveId(null);
    setActiveRow(null);
  };

  const handleMarkerClick = (id) => {
    const index = paginatedData.findIndex((item) => item.id === id);
    if (index === -1) return;

    setActiveId(id);

    // MOBILE sekarang 1 kolom => rowIndex = index
    // DESKTOP 2 kolom => rowIndex = floor(index/2)
    // Kita set aman untuk dua mode: pakai floor(index/2) tetap ok.
    setActiveRow(Math.floor(index / 2));
  };

  /* =========================================================
     AUTO SCROLL KE EXPANDED CARD
  ========================================================= */
  useEffect(() => {
    if (!activeId || activeRow === null) return;

    const timer = setTimeout(() => {
      if (!expandedRef.current) return;

      const rect = expandedRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isVisible) return;

      const targetY = window.scrollY + rect.top - 24;
      smoothScrollTo(targetY, 800);
    }, 140);

    return () => clearTimeout(timer);
  }, [activeId, activeRow]);

  /* =========================================================
     AUTO SCROLL KE ATAS SAAT KELURAHAN DIPILIH
  ========================================================= */
  useEffect(() => {
    if (filterKelurahan !== "Semua") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filterKelurahan]);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen">
      {/* padding mobile dikecilkan biar gak “sumpek” */}
      <div className="w-full space-y-6">
        {/* ================= HEADER ================= */}
        <header className="portal-page-heading">
          <p className="portal-eyebrow mb-2">DIREKTORI & PETA JEJARING</p>
          <h1 className="text-2xl font-bold text-[#087745] md:text-3xl">
            Data Jejaring Fasilitas Kesehatan
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 md:text-base">
            Informasi fasilitas pelayanan kesehatan dalam jejaring
            Puskesmas Jagakarsa.
          </p>

          {isLoading && (
            <p className="mt-3 text-sm text-gray-500">Memuat data dari database…</p>
          )}

          {loadError && !isLoading && (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-sm text-orange-700">
                Gagal memuat data dari database. Coba lagi.
              </p>
              <button
                type="button"
                onClick={loadData}
                className="mt-2 rounded-lg bg-orange-700 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
              >
                Coba lagi
              </button>
            </div>
          )}
        </header>

        {/* ================= FILTER ================= */}
        <section className="rounded-2xl border bg-white p-4 shadow-md md:p-6">
          <JejaringFilter
            jenis={filterJenis}
            setJenis={(v) => {
              setFilterJenis(v);
              setCurrentPage(1);
              setActiveId(null);
              setActiveRow(null);
            }}
            kelurahan={filterKelurahan}
            setKelurahan={(v) => {
              setFilterKelurahan(v);
              setCurrentPage(1);
              setActiveId(null);
              setActiveRow(null);
            }}
            status={filterStatus}
            setStatus={(v) => {
              setFilterStatus(v);
              setCurrentPage(1);
              setActiveId(null);
              setActiveRow(null);
            }}
            jenisOptions={jenisOptions}
            kelurahanOptions={kelurahanOptions}
            statusOptions={statusOptions}
          />
        </section>

        <p className="text-sm text-gray-600">
          {filteredData.length > 0 ? (
            <>
              Menampilkan <b>{pageStart + 1}&ndash;{Math.min(pageStart + FACILITIES_PER_PAGE, filteredData.length)}</b> dari <b>{filteredData.length}</b> fasilitas kesehatan
            </>
          ) : (
            <>Menampilkan <b>0</b> fasilitas kesehatan</>
          )}
        </p>

        {/* ================= LIST JEJARING ================= */}
        <section className="space-y-6 md:space-y-8">
          {/* MOBILE: 1 kolom (Traveloka style), DESKTOP: 2 kolom (existing) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paginatedData.map((item, index) => (
              <div key={item.id ?? index} className="space-y-4">
                {/* Mobile card */}
                <div className="md:hidden">
                  <JejaringCardTK
                    data={item}
                    isActive={activeId === item.id}
                    onClick={() => handleCardClick(item.id, index)}
                  />
                </div>

                {/* Desktop card (existing) */}
                <div className="hidden md:block">
                  <JejaringCard
                    data={item}
                    isActive={activeId === item.id}
                    onClick={() => handleCardClick(item.id, Math.floor(index / 2))}
                  />
                </div>

                {/* Expanded: show right after the active card (works for mobile & desktop) */}
                {activeId === item.id && activeData && (
                  <div ref={expandedRef}>
                    <JejaringExpanded
                      data={activeData}
                      onClose={() => {
                        setActiveId(null);
                        setActiveRow(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isLoading && !loadError && filteredData.length === 0 && (
            <p className="text-sm text-gray-500">Data tidak ditemukan.</p>
          )}

          {!isLoading && filteredData.length > FACILITIES_PER_PAGE && (
            <nav
              aria-label="Navigasi halaman fasilitas kesehatan"
              className="flex flex-wrap items-center justify-center gap-2 pt-1 md:justify-end"
            >
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
              >
                &larr; Sebelumnya
              </button>

              <div className="flex items-center gap-1" aria-label="Nomor halaman">
                {visiblePageNumbers.map((page) =>
                  typeof page === "string" ? (
                    <span key={page} className="flex h-10 w-6 items-center justify-center text-slate-400" aria-hidden="true">
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={page === currentPage ? "page" : undefined}
                      aria-label={`Halaman ${page}`}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                        page === currentPage
                          ? "border-[#087745] bg-[#087745] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
              >
                Berikutnya &rarr;
              </button>
            </nav>
          )}
        </section>

        {/* ================= MAP ================= */}
        <section className="rounded-2xl border bg-white p-4 shadow-md md:p-6">
          <h2 className="mb-3 text-lg font-bold text-[#087745] md:text-xl">
            Peta Jejaring Wilayah Jagakarsa
          </h2>

          <JejaringMap
            data={paginatedData}
            activeId={activeId}
            activeKelurahan={filterKelurahan}
            onKelurahanSelect={handleKelurahanSelect}
            onMarkerClick={handleMarkerClick}
            onMapApi={registerMapApi}
          />
        </section>
      </div>
    </div>
  );
}
