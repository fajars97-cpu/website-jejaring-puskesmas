import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";

export default function Jejaring() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");

  const daftarStatus = [
    "Semua",
    ...new Set(jejaringList.map((j) => j.status).filter(Boolean)),
  ];

  const daftarJenis = [
    "Semua",
    ...new Set(
      jejaringList.map((j) => j.jenisFasyankes).filter(Boolean)
    ),
  ];

  const daftarKelurahan = [
    "Semua",
    ...new Set(jejaringList.map((j) => j.kelurahan).filter(Boolean)),
  ];

  const filteredData = jejaringList.filter((item) => {
    const statusOk =
      filterStatus === "Semua" || item.status === filterStatus;
    const jenisOk =
      filterJenis === "Semua" ||
      item.jenisFasyankes === filterJenis;
    const kelurahanOk =
      filterKelurahan === "Semua" ||
      item.kelurahan === filterKelurahan;

    return statusOk && jenisOk && kelurahanOk;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Data Jejaring Fasilitas Kesehatan
        </h1>
        <p className="text-slate-400 mt-1">
          Informasi fasilitas pelayanan kesehatan yang bekerja sama
          dengan Puskesmas
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR FILTER */}
        <aside className="md:col-span-1">
          <JejaringFilter
            status={filterStatus}
            setStatus={setFilterStatus}
            jenis={filterJenis}
            setJenis={setFilterJenis}
            kelurahan={filterKelurahan}
            setKelurahan={setFilterKelurahan}
            statusOptions={daftarStatus}
            jenisOptions={daftarJenis}
            kelurahanOptions={daftarKelurahan}
          />
        </aside>

        {/* RESULT */}
        <section className="md:col-span-3">
          <p className="text-sm text-slate-400 mb-4">
            Menampilkan {filteredData.length} fasilitas kesehatan
          </p>

          <div className="space-y-4">
            {filteredData.map((item) => (
              <JejaringCard key={item.id} data={item} />
            ))}
          </div>

          {filteredData.length === 0 && (
            <p className="text-slate-400 mt-4">
              Data tidak ditemukan.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
