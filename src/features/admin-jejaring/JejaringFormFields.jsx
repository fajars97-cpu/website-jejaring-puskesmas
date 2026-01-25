import React from "react";

export default function JejaringFormFields({ value, onChange }) {
  const set = (k) => (e) => onChange(k, e.target.value);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-700">Nama fasyankes</label>
        <input
          value={value.nama_fasyankes || ""}
          onChange={set("nama_fasyankes")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-700">Alamat</label>
        <input
          value={value.alamat || ""}
          onChange={set("alamat")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Kelurahan</label>
        <input
          value={value.kelurahan || ""}
          onChange={set("kelurahan")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Kecamatan</label>
        <input
          value={value.kecamatan || ""}
          onChange={set("kecamatan")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Telepon</label>
        <input
          value={value.telepon ?? ""}
          onChange={set("telepon")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Email</label>
        <input
          value={value.email ?? ""}
          onChange={set("email")}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Latitude (lat)</label>
        <input
          value={String(value.lat ?? "")}
          onChange={set("lat")}
          inputMode="decimal"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700">Longitude (lng)</label>
        <input
          value={String(value.lng ?? "")}
          onChange={set("lng")}
          inputMode="decimal"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
        />
      </div>
    </div>
  );
}
