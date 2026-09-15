import { getFacilityIllustration, resolveFacilityImage } from "../lib/facilityIllustration";

export default function JejaringCard({ data, isActive, onClick }) {
  const nama = data?.namaFasyankes || "Fasilitas kesehatan";
  const jenis = [data?.jenisFasyankes, data?.tipeFasyankes].filter(Boolean).join(" · ");
  const kelurahan = data?.kelurahan?.trim();
  const kecamatan = data?.kecamatan?.trim();
  const lokasi = kelurahan && kecamatan && kelurahan.toLowerCase() === kecamatan.toLowerCase()
    ? kelurahan
    : [kelurahan, kecamatan].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white p-0 text-left shadow-[0_8px_24px_rgba(23,76,55,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9fc7af] hover:shadow-[0_15px_30px_rgba(23,76,55,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087745]/20 ${
        isActive ? "border-[#087745] ring-2 ring-[#087745]/20" : "border-[#dce8e1]"
      }`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${isActive ? "bg-[#087745]" : "bg-[#d5e8da] group-hover:bg-[#75aa85]"}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e0ebe4] bg-[#f0f7f4]">
            <img
              src={resolveFacilityImage(data)}
              alt={data.foto ? `Foto ${nama}` : `Ilustrasi ${data.tipeFasyankes || data.jenisFasyankes || "fasilitas kesehatan"}`}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.src = getFacilityIllustration(data);
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#075f42]">{nama}</h3>
              <span className="shrink-0 rounded-full bg-[#e8f5ee] px-2.5 py-1 text-[11px] font-bold text-[#087745]">
                {data.status}
              </span>
            </div>

            {jenis && <p className="mt-1.5 truncate text-xs font-semibold text-[#5b7668]">{jenis}</p>}
            {lokasi && <p className="mt-2 truncate text-xs text-slate-600">{lokasi}</p>}
            {data.alamat && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{data.alamat}</p>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#edf2ee] pt-3">
          <span className="truncate text-xs text-slate-500">
            {data.pjNama ? `Penanggung jawab: ${data.pjNama}` : "Lihat detail fasilitas"}
          </span>
          <span className="ml-3 text-sm font-bold text-[#087745]" aria-hidden="true">&rarr;</span>
        </div>

        {data.kegiatan?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.kegiatan.slice(0, 2).map((kegiatan, index) => (
              <span key={index} className="rounded-full bg-[#f0f7f4] px-2.5 py-1 text-[11px] font-medium text-[#287152]">
                {kegiatan}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
