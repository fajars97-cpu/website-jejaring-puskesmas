import { useState } from "react";
import { jejaringList } from "../data/jejaring";
import JejaringCard from "../components/JejaringCard";
import JejaringFilter from "../components/JejaringFilter";

export default function Jejaring() {
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
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">Jenis Fasyankes</label>
            <select className="ui-select">
              <option>Semua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Kelurahan</label>
            <select className="ui-select">
              <option>Semua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="ui-select">
              <option>Semua</option>
            </select>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SIDEBAR (OPSIONAL) */}
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-slate-800/40 rounded-xl p-4 text-sm text-slate-400">
            Menampilkan daftar fasilitas kesehatan jejaring
            yang telah terdaftar dan diverifikasi.
          </div>
        </aside>

        {/* LIST */}
        <div className="md:col-span-2 space-y-4">
          {/* JejaringCard di sini */}
          <div className="bg-slate-800 rounded-xl p-6">
            Card Placeholder
          </div>
        </div>

      </section>

    </div>
  );
}
