import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";

export default function Jejaring() {
  /* ================= STATE FILTER ================= */
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  /* ================= OPTION FILTER (DINAMIS) ================= */
  const jenisOptions = [
    "Semua",
    ...new Set(
      jejaringList
        .map((item) => item.jenisFasyankes)
        .filter(Boolean)
    ),
  ];

  const kelurahanOptions = [
    "Semua",
    ...new Set(
      jejaringList
        .map((item) => item.kelurahan)
        .filter(Boolean)
    ),
  ];

  const statusOptions = [
    "Semua",
    ...new Set(
      jejaringList
        .map((item) => item.status)
        .filter(Boolean)
    ),
  ];

  /* ================= FILTERED DATA (INI YANG HILANG SEBELUMNYA) ================= */
  const filteredData = jejaringList.filter((item) => {
    const jenisOk =
      filterJenis === "Semua" ||
      item.jenisFasyankes === filterJenis;

    const kelurahanOk =
      filterKelurahan === "Semua" ||
      item.kelurahan === filterKelurahan;

    const statusOk =
      filterStatus === "Semua" ||
      item.status === filterStatus;

    return jenisOk && kelurahanOk && statusOk;
  });

  /* ================= RENDER ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* ================= HEADER ================= */}
      <section>
        <h1 className="text-3xl font-bold">
          Data Jejaring Fasilitas Kesehatan
        </h1>
        <p className="text-slate-400 mt-2 max-w-3xl">
          Informasi fasilitas pelayanan kesehatan yang bekerja sama
          dengan Puskesmas, digunakan sebagai rujukan pelayanan
          dan pemantauan perizinan.
        </p>
      </section>

      {/* ================= FILTER BAR ================= */}
      <section className="bg-slate-800/60 rounded-xl p-4">
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

      {/* ================= CONTENT ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SIDEBAR INFO */}
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-slate-800/40 rounded-xl p-4 text-sm text-slate-400">
            Menampilkan {filteredData.length} fasilitas kesehatan
            jejaring yang telah terdaftar dan diverifikasi.
          </div>
        </aside>

        {/* LIST CARD */}
        <div className="md:col-span-2 space-y-4">
          {filteredData.map((item) => (
            <JejaringCard key={item.id} data={item} />
          ))}

          {filteredData.length === 0 && (
            <div className="text-slate-400 text-sm">
              Data tidak ditemukan.
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
