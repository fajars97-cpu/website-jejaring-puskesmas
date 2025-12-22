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

  const filteredData = jejaringList.filter(item => {
    return (
      (filterJenis === "Semua" || item.jenisFasyankes === filterJenis) &&
      (filterKelurahan === "Semua" || item.kelurahan === filterKelurahan) &&
      (filterStatus === "Semua" || item.status === filterStatus)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

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

      {/* FILTER */}
      <div className="bg-[#e6f4ee] border border-[#087745]/20 rounded-xl p-5">
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
      <div className="text-sm text-gray-600">
        Menampilkan <b>{filteredData.length}</b> fasilitas kesehatan
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map(item => (
          <JejaringCard key={item.id} data={item} />
        ))}

        {filteredData.length === 0 && (
          <div className="text-gray-500 text-sm">
            Data tidak ditemukan.
          </div>
        )}
      </div>

    </div>
  );
}
