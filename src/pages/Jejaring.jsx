import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";

export default function Jejaring() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelurahan, setFilterKelurahan] = useState("Semua");

  // ambil daftar kelurahan unik dari data
  const daftarKelurahan = [
    "Semua",
    ...new Set(jejaringList.map((j) => j.kelurahan).filter(Boolean)),
  ];

  const filteredData = jejaringList.filter((item) => {
    const statusOk =
      filterStatus === "Semua" || item.status === filterStatus;

    const jenisOk =
      filterJenis === "Semua" || item.jenis === filterJenis;

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
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>

        {/* Jenis */}
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          <option value="Semua">Semua Jenis</option>
          <option value="Apotek">Apotek</option>
          <option value="Klinik Pratama Umum">Klinik Pratama Umum</option>
          <option value="Tempat Praktik Mandiri Bidan">
            Tempat Praktik Mandiri Bidan
          </option>
        </select>

        {/* Kelurahan */}
        <select
          value={filterKelurahan}
          onChange={(e) => setFilterKelurahan(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
        >
          {daftarKelurahan.map((kel, i) => (
            <option key={i} value={kel}>
              {kel}
            </option>
          ))}
        </select>
      </div>

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
