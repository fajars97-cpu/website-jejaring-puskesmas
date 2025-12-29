import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";

export default function Jejaring() {
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const jenisOptions = ["Semua", ...new Set(jejaringList.map(i => i.jenisFasyankes).filter(Boolean))];
  const kelurahanOptions = ["Semua", ...new Set(jejaringList.map(i => i.kelurahan).filter(Boolean))];
  const statusOptions = ["Semua", ...new Set(jejaringList.map(i => i.status).filter(Boolean))];

  const filteredData = jejaringList.filter(item =>
    (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
    (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
    (filterStatus === "Semua" || item.status === filterStatus)
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-[#087745]">
            Data Jejaring Fasilitas Kesehatan
          </h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Informasi fasilitas pelayanan kesehatan yang bekerja sama dengan
            Puskesmas dan telah diverifikasi.
          </p>
        </div>

        {/* FILTER PANEL */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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
        </div>

        {/* INFO */}
        <p className="text-sm text-gray-600">
          Menampilkan <b>{filteredData.length}</b> fasilitas kesehatan
        </p>

        {/* CARD LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredData.map(item => (
            <JejaringCard key={item.id} data={item} />
          ))}

          {filteredData.length === 0 && (
            <p className="text-sm text-gray-500">
              Data tidak ditemukan.
            </p>
          )}
        </div>

      </div>
    </main>
  );
}
