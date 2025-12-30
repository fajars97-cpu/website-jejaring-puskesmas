import { useState } from "react";
import { jejaringList } from "../data/jejaring";

import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";
import JejaringExpanded from "../components/JejaringExpanded";

export default function Jejaring() {
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // 🔥 STATE BARU: FASYANKES YANG SEDANG TERBUKA
  const [activeId, setActiveId] = useState(null);

  // OPTIONS
  const jenisOptions = Array.from(
    new Set(
      jejaringList
        .map(i => i.jenisFasyankes)
        .filter(v => v && v !== "Semua")
    )
  );

  const kelurahanOptions = Array.from(
    new Set(
      jejaringList
        .map(i => i.kelurahan)
        .filter(v => v && v !== "Semua")
    )
  );

  const statusOptions = Array.from(
    new Set(
      jejaringList
        .map(i => i.status)
        .filter(v => v && v !== "Semua")
    )
  );

  // FILTER DATA
  const filteredData = jejaringList.filter(item =>
    (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
    (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
    (filterStatus === "Semua" || item.status === filterStatus)
  );

  // HANDLER CARD CLICK
  const handleToggle = (id) => {
    setActiveId(prev => (prev === id ? null : id));
  };

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
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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

        {/* INFO */}
        <p className="text-sm text-gray-600">
          Menampilkan <b>{filteredData.length}</b> fasilitas kesehatan
        </p>

        {/* LIST */}
        <section className="space-y-6">
          {filteredData.map(item => (
            <div key={item.id} className="space-y-4">

              {/* CARD */}
              <JejaringCard
                data={item}
                isActive={activeId === item.id}
                onClick={() => handleToggle(item.id)}
              />

              {/* EXPANDED */}
              {activeId === item.id && (
                <JejaringExpanded data={item} />
              )}

            </div>
          ))}

          {filteredData.length === 0 && (
            <p className="text-sm text-gray-500">
              Data tidak ditemukan.
            </p>
          )}
        </section>

      </div>
    </main>
  );
}
