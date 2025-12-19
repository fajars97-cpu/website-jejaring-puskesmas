import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";

export default function Jejaring() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");

  // 🔹 STATUS (dinamis dari data)
  const daftarStatus = [
    "Semua",
    ...new Set(jejaringList.map((j) => j.status).filter(Boolean)),
  ];

  // 🔹 JENIS (DINAMIS — INI YANG KURANG SEBELUMNYA)
  const daftarJenis = [
    "Semua",
    ...new Set(
      jejaringList
        .map((j) => j.jenisFasyankes)
        .filter(Boolean)
    ),
  ];

  // 🔹 KELURAHAN (sudah benar di kode kamu 👍)
  const daftarKelurahan = [
    "Semua",
    ...new Set(jejaringList.map((j) => j.kelurahan).filter(Boolean)),
  ];

  // 🔹 FILTER LOGIC (field konsisten)
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Data Jejaring Fasilitas Kesehatan
      </h1>

      {/* FILTER */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* STATUS */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          {daftarStatus.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* JENIS (DINAMIS) */}
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          {daftarJenis.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        {/* KELURAHAN */}
        <select
          value={filterKelurahan}
          onChange={(e) => setFilterKelurahan(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          {daftarKelurahan.map((kel) => (
            <option key={kel} value={kel}>
              {kel}
            </option>
          ))}
        </select>
      </div>

      {/* INFO JUMLAH */}
      <p className="text-sm text-slate-400 mb-4">
        Menampilkan {filteredData.length} fasilitas kesehatan
      </p>

      {/* LIST */}
      {filteredData.map((item) => (
        <JejaringCard key={item.id} data={item} />
      ))}

      {filteredData.length === 0 && (
        <p className="text-slate-400">Data tidak ditemukan.</p>
      )}
    </div>
  );
}
