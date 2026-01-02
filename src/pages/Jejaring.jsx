import { useState, useMemo, useEffect, useRef } from "react";
import { jejaringList } from "../data/jejaring";

import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";
import JejaringExpanded from "../components/JejaringExpanded";
import JejaringMap from "../components/JejaringMap";

/* =========================================================
   SMOOTH SCROLL HELPER
========================================================= */
function smoothScrollTo(targetY, duration = 750) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export default function Jejaring() {
  /* =========================================================
     FILTER STATE (SINGLE SOURCE OF TRUTH)
  ========================================================= */
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

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
     FILTER OPTIONS (ANTI DUPLIKASI)
  ========================================================= */
  const jenisOptions = useMemo(
    () =>
      [...new Set(jejaringList.map(i => i.jenisFasyankes).filter(Boolean))],
    []
  );

  const kelurahanOptions = useMemo(
    () =>
      [...new Set(jejaringList.map(i => i.kelurahan).filter(Boolean))],
    []
  );

  const statusOptions = useMemo(
    () =>
      [...new Set(jejaringList.map(i => i.status).filter(Boolean))],
    []
  );

  /* =========================================================
     FILTERED DATA (MAX 10)
  ========================================================= */
  const filteredData = useMemo(() => {
    return jejaringList
      .filter(item =>
        (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
        (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
        (filterStatus === "Semua" || item.status === filterStatus)
      )
      .slice(0, 10);
  }, [filterJenis, filterKelurahan, filterStatus]);

  const activeData = filteredData.find(i => i.id === activeId);

  /* =========================================================
     HANDLER: CARD CLICK (LIST)
  ========================================================= */
  const handleCardClick = (id, rowIndex) => {
    if (activeId === id) {
      setActiveId(null);
      setActiveRow(null);
    } else {
      setActiveId(id);
      setActiveRow(rowIndex);
    }
  };

  /* =========================================================
     HANDLER: MAP → LIST (MARKER / POLYGON)
  ========================================================= */
  const handleKelurahanSelect = kelurahanName => {
    setFilterKelurahan(kelurahanName);
    setActiveId(null);
    setActiveRow(null);
  };

  const handleMarkerClick = id => {
    const index = filteredData.findIndex(item => item.id === id);
    if (index === -1) return;

    setActiveId(id);
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

      const isVisible =
        rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (isVisible) return;

      const targetY = window.scrollY + rect.top - 24;
      smoothScrollTo(targetY, 800);
    }, 140);

    return () => clearTimeout(timer);
  }, [activeId, activeRow]);

  /* =========================================================
     AUTO SCROLL KE ATAS SAAT KELURAHAN DARI MAP DIPILIH
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
        </header>

        {/* ================= FILTER ================= */}
        <section className="bg-white rounded-2xl shadow-md border p-6">
          <JejaringFilter
            jenis={filterJenis}
            setJenis={setFilterJenis}
            kelurahan={filterKelurahan}
            setKelurahan={setFilterKelurahan}
            status={filterStatus}
            setStatus={setFilterStatus}
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
                        onClick={() =>
                          handleCardClick(left.id, rowIndex)
                        }
                      />
                    )}
                    {right && (
                      <JejaringCard
                        data={right}
                        isActive={activeId === right.id}
                        onClick={() =>
                          handleCardClick(right.id, rowIndex)
                        }
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
            <p className="text-sm text-gray-500">
              Data tidak ditemukan.
            </p>
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
          />
        </section>

      </div>
    </main>
  );
}
