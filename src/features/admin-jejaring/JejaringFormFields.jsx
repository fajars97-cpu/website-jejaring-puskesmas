// JejaringFormFields.jsx
import React, { useMemo } from "react";

// Kalau kamu sudah punya constants, boleh ganti ini jadi import dari constants.js
const STATUS_OPTIONS = ["Aktif", "Tidak Aktif"];
const PENYELENGGARA_OPTIONS = ["Swasta", "Pemerintah", "Lainnya"];
const KELOMPOK_PENYELENGGARA_OPTIONS = ["Perusahaan", "Perorangan", "Yayasan", "Lainnya"];

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 disabled:opacity-60";
const labelBase = "text-xs font-semibold text-slate-700";
const sectionWrap = "rounded-2xl border border-slate-200 bg-white p-4";
const sectionTitle = "text-sm font-semibold text-slate-900";

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <div className={labelBase}>{label}</div>
        {hint ? <div className="text-[11px] text-slate-500">{hint}</div> : null}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function JejaringFormFields({
  value,
  onChange,
  form,
  setField,
  mode,
  variant = "admin", // "pemohon"
  disabled = false,
  sections, // optional: { verified:true, perizinan:true, mou:true, akreditasi:true, foto:true }
}) {
  const isPemohon = variant === "pemohon";

  const show = useMemo(() => {
    const base = {
      verified: !isPemohon,
      perizinan: !isPemohon,
      mou: !isPemohon,
      akreditasi: !isPemohon,
      foto: !isPemohon,
    };
    return { ...base, ...(sections || {}) };
  }, [isPemohon, sections]);

  const set = (k) => (e) => {
    if (disabled) return;
    const t = e?.target;
    const v = t?.type === "checkbox" ? !!t.checked : t?.value;
    onChange?.(k, v);
  };

  return (
    <div className="space-y-4">
      {/* Identitas */}
      <div className={sectionWrap}>
        <div className={sectionTitle}>Identitas Fasyankes</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Nama fasyankes *">
              <input value={value?.nama_fasyankes ?? ""} onChange={set("nama_fasyankes")} disabled={disabled} className={inputBase} />
            </Field>
          </div>

          <Field label="Jenis fasyankes *" hint="contoh: Klinik Pratama">
            <input value={value?.jenis_fasyankes ?? ""} onChange={set("jenis_fasyankes")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Tipe fasyankes *" hint="contoh: Klinik Gigi">
            <input value={value?.tipe_fasyankes ?? ""} onChange={set("tipe_fasyankes")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Status *">
            <select value={value?.status ?? "Aktif"} onChange={set("status")} disabled={disabled} className={inputBase}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          {show.verified ? (
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!value?.is_verified} onChange={set("is_verified")} disabled={disabled} />
                Verified
              </label>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Lokasi */}
      <div className={sectionWrap}>
        <div className={sectionTitle}>Lokasi</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Alamat *">
              <input value={value?.alamat ?? ""} onChange={set("alamat")} disabled={disabled} className={inputBase} />
            </Field>
          </div>

          <Field label="Kelurahan *">
            <input value={value?.kelurahan ?? ""} onChange={set("kelurahan")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Kecamatan *">
            <input value={value?.kecamatan ?? ""} onChange={set("kecamatan")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Kota *">
            <input value={value?.kota ?? ""} onChange={set("kota")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Kode pos">
            <input value={value?.kode_pos ?? ""} onChange={set("kode_pos")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Latitude (lat) *">
            <input value={value?.lat ?? ""} onChange={set("lat")} disabled={disabled} inputMode="decimal" className={inputBase} />
          </Field>

          <Field label="Longitude (lng) *">
            <input value={value?.lng ?? ""} onChange={set("lng")} disabled={disabled} inputMode="decimal" className={inputBase} />
          </Field>
        </div>
      </div>

      {/* Kontak & Maps */}
      <div className={sectionWrap}>
        <div className={sectionTitle}>Kontak & Maps</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Telepon">
            <input value={value?.telepon ?? ""} onChange={set("telepon")} disabled={disabled} className={inputBase} />
          </Field>

          <Field label="Email">
            <input value={value?.email ?? ""} onChange={set("email")} disabled={disabled} className={inputBase} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Tautan Berkas (Google Drive)" hint="Pastikan akses tautan dapat dibuka oleh pemeriksa (mis. 'Siapa saja yang memiliki tautan').">
              <input value={value?.gdrive_url ?? ""} onChange={set("gdrive_url")} disabled={disabled} className={inputBase} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Google Maps URL (gmaps_url)">
              <input value={value?.gmaps_url ?? ""} onChange={set("gmaps_url")} disabled={disabled} className={inputBase} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Google Maps Embed URL (gmaps_embed_url)">
              <input
                value={value?.gmaps_embed_url ?? ""}
                onChange={set("gmaps_embed_url")}
                disabled={disabled}
                className={inputBase}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Penyelenggara */}
      <div className={sectionWrap}>
        <div className={sectionTitle}>Penyelenggara</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Penyelenggara *">
            <select value={value?.penyelenggara ?? "Swasta"} onChange={set("penyelenggara")} disabled={disabled} className={inputBase}>
              {PENYELENGGARA_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kelompok penyelenggara">
            <select
              value={value?.kelompok_penyelenggara ?? ""}
              onChange={set("kelompok_penyelenggara")}
              disabled={disabled}
              className={inputBase}
            >
              <option value="">—</option>
              {KELOMPOK_PENYELENGGARA_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Perizinan & PJ (admin-only by default) */}
      {show.perizinan ? (
        <div className={sectionWrap}>
          <div className={sectionTitle}>Perizinan & Penanggung Jawab</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="PJ Nama (pj_nama)">
              <input value={value?.pj_nama ?? ""} onChange={set("pj_nama")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="Nomor Izin (nomor_izin)">
              <input value={value?.nomor_izin ?? ""} onChange={set("nomor_izin")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="Izin Mulai (izin_mulai)">
              <input type="date" value={value?.izin_mulai ?? ""} onChange={set("izin_mulai")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="Izin Berakhir (izin_berakhir)">
              <input
                type="date"
                value={value?.izin_berakhir ?? ""}
                onChange={set("izin_berakhir")}
                disabled={disabled}
                className={inputBase}
              />
            </Field>

            <Field label="Jumlah SDM (jumlah_sdm)">
              <input value={value?.jumlah_sdm ?? ""} onChange={set("jumlah_sdm")} disabled={disabled} inputMode="numeric" className={inputBase} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Kegiatan">
                <input value={value?.kegiatan ?? ""} onChange={set("kegiatan")} disabled={disabled} className={inputBase} />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        // Pemohon tetap bisa isi PJ + SDM + kegiatan (karena ini core data)
        <div className={sectionWrap}>
          <div className={sectionTitle}>Penanggung Jawab & Kegiatan</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="PJ Nama (pj_nama)">
              <input value={value?.pj_nama ?? ""} onChange={set("pj_nama")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="Jumlah SDM (jumlah_sdm)">
              <input value={value?.jumlah_sdm ?? ""} onChange={set("jumlah_sdm")} disabled={disabled} inputMode="numeric" className={inputBase} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Kegiatan">
                <input value={value?.kegiatan ?? ""} onChange={set("kegiatan")} disabled={disabled} className={inputBase} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Akreditasi (admin-only) */}
      {show.akreditasi ? (
        <div className={sectionWrap}>
          <div className={sectionTitle}>Akreditasi</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Terakreditasi">
              <select
                value={value?.terakreditasi ? "YA" : "TIDAK"}
                onChange={(e) => onChange?.("terakreditasi", e.target.value === "YA")}
                disabled={disabled}
                className={inputBase}
              >
                <option value="TIDAK">Tidak</option>
                <option value="YA">Ya</option>
              </select>
            </Field>

            <Field label="Nomor Akreditasi">
              <input value={value?.nomor_akreditasi ?? ""} onChange={set("nomor_akreditasi")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="Hasil Akreditasi">
              <input value={value?.hasil_akreditasi ?? ""} onChange={set("hasil_akreditasi")} disabled={disabled} className={inputBase} />
            </Field>
          </div>
        </div>
      ) : null}

      {/* MoU (admin-only) */}
      {show.mou ? (
        <div className={sectionWrap}>
          <div className={sectionTitle}>MoU</div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="MoU Nomor">
              <input value={value?.mou_nomor ?? ""} onChange={set("mou_nomor")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="MoU Mulai">
              <input type="date" value={value?.mou_mulai ?? ""} onChange={set("mou_mulai")} disabled={disabled} className={inputBase} />
            </Field>

            <Field label="MoU Akhir">
              <input type="date" value={value?.mou_akhir ?? ""} onChange={set("mou_akhir")} disabled={disabled} className={inputBase} />
            </Field>
          </div>
        </div>
      ) : null}

      {/* Foto (admin-only) */}
      {show.foto ? (
        <div className={sectionWrap}>
          <div className={sectionTitle}>Foto</div>
          <div className="mt-3">
            <Field label="URL Foto">
              <input value={value?.foto ?? ""} onChange={set("foto")} disabled={disabled} className={inputBase} placeholder="https://..." />
            </Field>
            <div className="mt-2 text-xs text-slate-500">
              (Upload Cloudinary / isi URL. Pemohon nggak perlu bagian ini.)
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
