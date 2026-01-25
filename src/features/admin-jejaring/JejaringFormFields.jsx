import React from "react";
import {
  JENIS_OPTIONS,
  TIPE_OPTIONS,
  STATUS_OPTIONS,
  PENYELENGGARA_OPTIONS,
  KELOMPOK_PENYELENGGARA_OPTIONS,
} from "./constants";

export default function JejaringFormFields({ value, onChange }) {
  const set = (k) => (e) => onChange(k, e.target.type === "checkbox" ? e.target.checked : e.target.value);

  const inputBase =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300";
  const labelBase = "text-xs font-medium text-slate-700";

  return (
    <div className="space-y-4">
      {/* Identitas */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Identitas</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>Nama fasyankes *</label>
            <input value={value.nama_fasyankes || ""} onChange={set("nama_fasyankes")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Jenis fasyankes *</label>
            <select value={value.jenis_fasyankes || ""} onChange={set("jenis_fasyankes")} className={inputBase}>
              {JENIS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Tipe fasyankes *</label>
            <select value={value.tipe_fasyankes || ""} onChange={set("tipe_fasyankes")} className={inputBase}>
              {TIPE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Status *</label>
            <select value={value.status || ""} onChange={set("status")} className={inputBase}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!value.is_verified} onChange={set("is_verified")} />
              <span className="text-slate-700">Verified</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lokasi */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Lokasi</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>Alamat *</label>
            <input value={value.alamat || ""} onChange={set("alamat")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Kelurahan *</label>
            <input value={value.kelurahan || ""} onChange={set("kelurahan")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Kecamatan *</label>
            <input value={value.kecamatan || ""} onChange={set("kecamatan")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Kota *</label>
            <input value={value.kota || ""} onChange={set("kota")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Kode pos</label>
            <input value={value.kode_pos ?? ""} onChange={set("kode_pos")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Latitude (lat) *</label>
            <input value={String(value.lat ?? "")} onChange={set("lat")} inputMode="decimal" className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Longitude (lng) *</label>
            <input value={String(value.lng ?? "")} onChange={set("lng")} inputMode="decimal" className={inputBase} />
          </div>
        </div>
      </div>

      {/* Kontak & Maps */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Kontak & Maps</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelBase}>Telepon</label>
            <input value={value.telepon ?? ""} onChange={set("telepon")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Email</label>
            <input value={value.email ?? ""} onChange={set("email")} className={inputBase} />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Google Maps URL (gmaps_url)</label>
            <input value={value.gmaps_url ?? ""} onChange={set("gmaps_url")} className={inputBase} />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Google Maps Embed URL (gmaps_embed_url)</label>
            <input value={value.gmaps_embed_url ?? ""} onChange={set("gmaps_embed_url")} className={inputBase} />
          </div>
        </div>
      </div>

      {/* Penyelenggara */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Penyelenggara</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelBase}>Penyelenggara *</label>
            <select value={value.penyelenggara || ""} onChange={set("penyelenggara")} className={inputBase}>
              {PENYELENGGARA_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Kelompok penyelenggara</label>
            <select
              value={value.kelompok_penyelenggara ?? ""}
              onChange={set("kelompok_penyelenggara")}
              className={inputBase}
            >
              <option value="">—</option>
              {KELOMPOK_PENYELENGGARA_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Perizinan & PJ */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Perizinan & Penanggung Jawab</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelBase}>PJ Nama (pj_nama)</label>
            <input value={value.pj_nama ?? ""} onChange={set("pj_nama")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Nomor Izin (nomor_izin)</label>
            <input value={value.nomor_izin ?? ""} onChange={set("nomor_izin")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Izin Mulai (izin_mulai)</label>
            <input type="date" value={value.izin_mulai ?? ""} onChange={set("izin_mulai")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Izin Berakhir (izin_berakhir)</label>
            <input type="date" value={value.izin_berakhir ?? ""} onChange={set("izin_berakhir")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Jumlah SDM (jumlah_sdm)</label>
            <input value={value.jumlah_sdm ?? ""} onChange={set("jumlah_sdm")} inputMode="numeric" className={inputBase} />
          </div>
        </div>
      </div>

      {/* MoU */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">MoU</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>MoU Nomor (mou_nomor)</label>
            <input value={value.mou_nomor ?? ""} onChange={set("mou_nomor")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>MoU Mulai (mou_mulai)</label>
            <input type="date" value={value.mou_mulai ?? ""} onChange={set("mou_mulai")} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>MoU Akhir (mou_akhir)</label>
            <input type="date" value={value.mou_akhir ?? ""} onChange={set("mou_akhir")} className={inputBase} />
          </div>
        </div>
      </div>

      {/* Lainnya */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900">Lainnya</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>Kegiatan</label>
            <input value={value.kegiatan ?? ""} onChange={set("kegiatan")} className={inputBase} />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Foto (URL/path)</label>
            <input value={value.foto ?? ""} onChange={set("foto")} className={inputBase} />
          </div>
        </div>
      </div>
    </div>
  );
}
