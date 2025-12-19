export default function JejaringCard({ data }) {
  const statusColor =
    data.status === "Aktif"
      ? "bg-emerald-500"
      : "bg-rose-500";

  return (
    <div className="bg-slate-800 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition">

      <div className="flex gap-4">
        {/* FOTO */}
        <div className="w-32 h-24 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
          {data.foto ? (
            <img
              src={data.foto}
              alt={data.namaFasyankes}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-400 text-sm">
              Foto Fasyankes
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold leading-tight">
              {data.namaFasyankes}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full text-white ${statusColor}`}
            >
              {data.status}
            </span>
          </div>

          {/* META */}
          <p className="text-sm text-slate-300 mt-1">
            {data.jenisFasyankes} • {data.tipeFasyankes}
          </p>

          <p className="text-sm mt-1 text-slate-400">
            Kel. {data.kelurahan}, Kec. {data.kecamatan}
          </p>

          <p className="text-sm mt-2">
            {data.alamat}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            PJ: {data.pjNama}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      {data.kegiatan?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.kegiatan.map((k, i) => (
            <span
              key={i}
              className="text-xs bg-sky-700/30 text-sky-300 px-2 py-1 rounded-full"
            >
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
