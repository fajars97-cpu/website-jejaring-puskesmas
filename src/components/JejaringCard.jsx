export default function JejaringCard({ data }) {
  const statusColor =
    data.status === "Aktif"
      ? "bg-emerald-600"
      : "bg-rose-600";

  return (
    <div className="border border-slate-600 rounded-lg p-4 mb-4 flex gap-4">

      {/* FOTO */}
      {data.foto && (
        <img
          src={data.foto}
          alt={data.namaFasyankes}
          className="w-32 h-32 object-cover rounded border"
        />
      )}

      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">
            {data.namaFasyankes}
          </h3>
          <span className={`px-3 py-1 text-sm rounded-full ${statusColor}`}>
            {data.status}
          </span>
        </div>

        <p className="text-sm text-slate-300">
          {data.jenisFasyankes} • {data.tipeFasyankes}
        </p>

        <p className="text-sm mt-1">
          Kel. {data.kelurahan}, Kec. {data.kecamatan}
        </p>

        <p className="text-sm mt-1">{data.alamat}</p>

        <p className="text-sm mt-1">
          PJ: {data.pjNama} ({data.pjTelp})
        </p>

        {/* KEGIATAN */}
        <div className="mt-2 flex flex-wrap gap-2">
          {data.kegiatan.map((k, i) => (
            <span
              key={i}
              className="text-xs bg-sky-700 px-2 py-1 rounded"
            >
              {k}
            </span>
          ))}
        </div>

        {/* MOU */}
        {data.mou?.nomor && (
          <p className="text-xs text-slate-400 mt-2">
            MOU: {data.mou.nomor} ({data.mou.mulai} – {data.mou.akhir})
          </p>
        )}
      </div>
    </div>
  );
}
