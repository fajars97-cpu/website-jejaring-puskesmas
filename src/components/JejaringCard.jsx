export default function JejaringCard({ data }) {
  const statusStyle =
    data.status === "Aktif"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-600";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex gap-4">

        {/* FOTO */}
        <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
          {data.foto ? (
            <img
              src={data.foto}
              alt={data.namaFasyankes}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs text-center px-2">
              Foto Fasyankes
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1">

          {/* HEADER */}
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-lg font-semibold text-[#087745] leading-tight">
              {data.namaFasyankes}
            </h3>

            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle}`}
            >
              {data.status}
            </span>
          </div>

          {/* META */}
          <p className="text-sm text-gray-600 mt-1">
            {data.jenisFasyankes} • {data.tipeFasyankes}
          </p>

          <p className="text-sm text-gray-700 mt-1">
            Kel. {data.kelurahan}, Kec. {data.kecamatan}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            {data.alamat}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            PJ: {data.pjNama}
          </p>
        </div>
      </div>

      {/* KEGIATAN */}
      {data.kegiatan?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.kegiatan.map((k, i) => (
            <span
              key={i}
              className="text-xs bg-[#e6f4ee] text-[#087745] px-3 py-1 rounded-full"
            >
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
