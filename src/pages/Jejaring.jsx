import { useState, useMemo } from "react";
import { jejaringList } from "../data/jejaring";

import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";
import JejaringExpanded from "../components/JejaringExpanded";

export default function Jejaring() {
  // FILTER STATE
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // ACTIVE CARD & ROW
  const [activeId, setActiveId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // OPTIONS (ANTI DUPLIKASI)
  const jenisOptions = useMemo(
    () => [...new Set(jejaringList.map(i => i.jenisFasyankes).filter(Boolean))],
    []
  );
  const kelurahanOptions = useMemo(
    () => [...new Set(jejaringList.map(i => i.kelurahan).filter(Boolean))],
    []
  );
  const statusOptions = useMemo(
    () => [...new Set(jejaringList.map(i => i.status).filter(Boolean))],
    []
  );

  // FILTERED DATA (MAX 10)
  const filteredData = useMemo(() => {
    return jejaringList
      .filter(item =>
        (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
        (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
        (filterStatus === "Semua" || item.status === filterStatus)
      )
      .slice(0, 10);
  }, [filterJenis, filterKelurahan, filterStatus]);

  // CLICK HANDLER
  const handleClick = (id, rowIndex) => {
    if (activeId === id) {
      setActiveId(null);
      setActiveRow(null);
    } else {
      setActiveId(id);
      setActiveRow(rowIndex);
    }
  };

  const activeData = filteredData.find(i => i.id === activeId);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* HEADER */}
        <header>
          <h1 className="text-3xl font-bold text-[#087745]">
            Data Jejaring Fasilitas Kesehatan
          </h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Informasi fasilitas pelayanan kesehatan yang bekerja sama dengan
            Puskesmas dan telah diverifikasi.
          </p>
        </header>

        {/* FILTER */}
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

        {/* GRID 2 KOLOM + EXPAND PER ROW */}
        <section className="space-y-8">
          {Array.from({ length: Math.ceil(filteredData.length / 2) }).map(
            (_, rowIndex) => {
              const left = filteredData[rowIndex * 2];
              const right = filteredData[rowIndex * 2 + 1];

              return (
                <div key={rowIndex} className="space-y-4">

                  {/* ROW */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {left && (
                      <JejaringCard
                        data={left}
                        isActive={activeId === left.id}
                        onClick={() => handleClick(left.id, rowIndex)}
                      />
                    )}
                    {right && (
                      <JejaringCard
                        data={right}
                        isActive={activeId === right.id}
                        onClick={() => handleClick(right.id, rowIndex)}
                      />
                    )}
                  </div>

                  {/* EXPANDED */}
                  {activeRow === rowIndex && activeData && (
                    <JejaringExpanded
                      data={activeData}
                      onClose={() => {
                        setActiveId(null);
                        setActiveRow(null);
                      }}
                    />
                  )}

                </div>
              );
            }
          )}

          {filteredData.length === 0 && (
            <p className="text-sm text-gray-500">Data tidak ditemukan.</p>
          )}
        </section>

      </div>
    </main>
  );
}
