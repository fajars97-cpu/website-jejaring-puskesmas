export default function JejaringCard({ data }) {
  return (
    <div
      className="
        relative
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-md
        hover:shadow-xl
        transition
        hover:-translate-y-0.5
        overflow-hidden
      "
    >
      {/* ACCENT STRIP */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[#087745]" />

      <div className="p-6 pl-7">
        <div className="flex gap-4">

          {/* FOTO */}
          <div className="w-24 h-20 bg-[#f0f7f4] rounded-xl flex items-center justify-center text-xs text-gray-500">
            Foto
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <div className="flex justify-between items-start gap-3">
              <h3 className="text-lg font-semibold text-[#087745]">
                {data.namaFasyankes}
              </h3>

              <span className="
                text-xs
                px-3 py-1
                rounded-full
                bg-[#e6f4ee]
                text-[#087745]
                font-medium
              ">
                {data.status}
              </span>
            </div>

            <p className="text-sm text-gray-700 mt-1">
              {data.jenisFasyankes} • {data.tipeFasyankes}
            </p>

            <p className="text-sm text-gray-800 mt-1">
              Kel. {data.kelurahan}, Kec. {data.kecamatan}
            </p>

            <p className="text-sm text-gray-600 mt-2">
              {data.alamat}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              PJ: {data.pjNama}
            </p>
          </div>
        </div>

        {/* TAG KEGIATAN */}
        {data.kegiatan?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.kegiatan.map((k, i) => (
              <span
                key={i}
                className="
                  text-xs
                  bg-[#f0f7f4]
                  text-[#087745]
                  px-3 py-1
                  rounded-full
                "
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
