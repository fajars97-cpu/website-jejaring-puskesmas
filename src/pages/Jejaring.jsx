import { useState, useMemo, useEffect, useRef, useCallback } from "react";

/* NOTE: Fallback data lokal tetap dipakai sebagai cadangan (anti white blank) */
import { jejaringList as jejaringFallback } from "../data/jejaring";

/* NOTE: Repo Supabase (adapter snake_case -> camelCase) */
import { fetchJejaringList } from "../lib/jejaringRepo";

import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";
import JejaringExpanded from "../components/JejaringExpanded";
import JejaringMap from "../components/JejaringMap";

/* =========================================================
   SMOOTH SCROLL HELPER
   NOTE: Ini helper lama kamu, dipertahankan apa adanya.
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

export default function Jejaring() {
  /* =========================================================
     FILTER STATE (SINGLE SOURCE OF TRUTH)
     NOTE: Tetap sama, jangan diubah.
  ========================================================= */
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  /* =========================================================
     DATA SOURCE (SUPABASE + FALLBACK)
     NOTE:
     - Default pakai fallback lokal supaya halaman tidak blank.
     - Lalu fetch Supabase (read-only).
     - PERBAIKAN UTAMA: jika Supabase sukses tapi kosong => tetap set []
       (bukan diam-diam balik ke fallback).
     - Fallback hanya jika error beneran.
  ========================================================= */
  const [jejaringList, setJejaringList] = useState(jejaringFallback);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* =========================================================
     ACTIVE CARD STATE
     NOTE: Tetap sama.
  ========================================================= */
  const [activeId, setActiveId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  /* =========================================================
     REF (AUTO SCROLL EXPANDED)
     NOTE: Tetap sama.
  ========================================================= */
  const expandedRef = useRef(null);

  /* =========================================================
     MAP API BRIDGE (imperative, tapi minimal & aman)
     NOTE:
     - Bridge ini kunci untuk sinkronisasi list -> map (flyTo).
     - Dipertahankan.
  ========================================================= */
  const mapApiRef = useRef(null);

  const registerMapApi = useCallback((api) => {
    mapApiRef.current = api;
  }, []);

  /* =========================================================
     FETCH DATA FROM SUPABASE (READ-ONLY)
     NOTE:
     - Hanya ambil data sekali (mount).
     - Anti setState setelah unmount (isMounted guard).
     - PERBAIKAN: sukses fetch => set data walaupun kosong.
     - Fallback hanya saat error.
  ========================================================= */
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchJejaringList();

        // NOTE: sukses fetch => set data walau kosong
        if (isMounted) {
          setJejaringList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Gagal load jejaring dari Supabase:", err);

        // NOTE: fallback hanya saat error
        if (isMounted) {
          setLoadError(err);
          setJejaringList(jejaringFallback);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     FILTER OPTIONS (ANTI DUPLIKASI)
     NOTE:
     - Dependency harus [jejaringList] supaya options ikut update
       saat Supabase load.
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
     FILTERED DATA (MAX 10)
     NOTE:
     - Dependency include jejaringList supaya refresh saat Supabase masuk.
  ========================================================= */
  const filteredData = useMemo(() => {
    return (jejaringList ?? [])
      .filter(
        (item) =>
          (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
          (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
          (filterStatus === "Semua" || item.status === filterStatus)
      )
      .slice(0, 10);
  }, [jejaringList, filterJenis, filterKelurahan, filterStatus]);

  const activeData = filteredData.find((i) => i.id === activeId);

  /* =========================================================
     HANDLER: CARD CLICK (LIST)
     NOTE:
     - tetap expand inline
     - plus: flyTo marker / lokasi bila ada
  ========================================================= */
  const handleCardClick = (id, rowIndex) => {
    if (activeId === id) {
      setActiveId(null);
      setActiveRow(null);
      return;
    }

    setActiveId(id);
    setActiveRow(rowIndex);

    // NOTE: FlyTo ke titik jejaring (kalau ada)
    mapApiRef.current?.flyToJejaringById?.(id);
  };

  /* =========================================================
     HANDLER: MAP → LIST (KELURAHAN)
     NOTE:
     - set filter => list sinkron
     - reset active card biar UX bersih
  ========================================================= */
  const handleKelurahanSelect = (kelurahanName) => {
    setFilterKelurahan(kelurahanName);
    setActiveId(null);
    setActiveRow(null);
  };

  const handleMarkerClick = (id) => {
    // marker click => auto expand card
    const index = filteredData.findIndex((item) => item.id === id);
    if (index === -1) return;

    setActiveId(id);
    setActiveRow(Math.floor(index / 2));
  };

  /* =========================================================
     AUTO SCROLL KE EXPANDED CARD
     NOTE: Tetap sama.
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
     AUTO SCROLL KE ATAS SAAT KELURAHAN DARI MAP / FILTER DIPILIH
     NOTE: Tetap sama.
  ========================================================= */
  useEffect(() => {
    if (filterKelurahan !== "Semua") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filterKelurahan]);

  /* =========================================================
     RENDER
     NOTE:
     - UI utama tidak diubah.
     - indikator loading/error ringan & tidak mengganggu.
  ========================================================= */
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* ================= HEADER ================= */}
        <header>
          <h1 className="text-3xl font-bold text-[#087745]">
            Data Jejaring Fasilitas Kesehatan
          </h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Informasi fasilitas pelayanan kesehatan yang bekerja sama dengan
            Puskesmas dan telah diverifikasi.
          </p>

          {/* NOTE: indikator fetch data (ringan, non-intrusive) */}
          {isLoading && (
            <p className="mt-3 text-sm text-gray-500">Memuat data terbaru…</p>
          )}
          {loadError && !isLoading && (
            <p className="mt-3 text-sm text-orange-600">
              Gagal memuat data terbaru. Menampilkan data cadangan.
            </p>
          )}
        </header>

        {/* ================= FILTER ================= */}
        <section className="bg-white rounded-2xl shadow-md border p-6">
          <JejaringFilter
            jenis={filterJenis}
            setJenis={(v) => {
              setFilterJenis(v);
              setActiveId(null);
              setActiveRow(null);
            }}
            kelurahan={filterKelurahan}
            setKelurahan={(v) => {
              setFilterKelurahan(v);
              setActiveId(null);
              setActiveRow(null);
            }}
            status={filterStatus}
            setStatus={(v) => {
              setFilterStatus(v);
              setActiveId(null);
              setActiveRow(null);
            }}
            jenisOptions={jenisOptions}
            kelurahanOptions={kelurahanOptions}
            statusOptions={statusOptions}
          />
        </section>

        <p className="text-sm text-gray-600">
          Menampilkan <b>{filteredData.length}</b> fasilitas kesehatan
        </p>

        {/* ================= LIST JEJARING ================= */}
        <section className="space-y-8">
          {Array.from({ length: Math.ceil(filteredData.length / 2) }).map(
            (_, rowIndex) => {
              const left = filteredData[rowIndex * 2];
              const right = filteredData[rowIndex * 2 + 1];

              return (
                <div key={rowIndex} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {left && (
                      <JejaringCard
                        data={left}
                        isActive={activeId === left.id}
                        onClick={() => handleCardClick(left.id, rowIndex)}
                      />
                    )}
                    {right && (
                      <JejaringCard
                        data={right}
                        isActive={activeId === right.id}
                        onClick={() => handleCardClick(right.id, rowIndex)}
                      />
                    )}
                  </div>

                  {activeRow === rowIndex && activeData && (
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
              );
            }
          )}

          {filteredData.length === 0 && (
            <p className="text-sm text-gray-500">Data tidak ditemukan.</p>
          )}
        </section>

        {/* ================= MAP ================= */}
        <section className="bg-white rounded-2xl shadow-md border p-6">
          <h2 className="text-xl font-bold text-[#087745] mb-3">
            Peta Jejaring Wilayah Jagakarsa
          </h2>

          <JejaringMap
            data={filteredData}
            activeId={activeId}
            activeKelurahan={filterKelurahan}
            onKelurahanSelect={handleKelurahanSelect}
            onMarkerClick={handleMarkerClick}
            onMapApi={registerMapApi}
          />
        </section>
      </div>
    </main>
  );
}
