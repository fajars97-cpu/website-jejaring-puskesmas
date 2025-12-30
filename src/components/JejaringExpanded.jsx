export default function JejaringExpanded({ data, onClose }) {
  if (!data) return null;

  return (
    <section
      className="
        bg-white
        rounded-2xl
        shadow-xl
        border
        p-6
        animate-[expand_0.35s_ease-out]
      "
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#087745]">
            {data.namaFasyankes}
          </h2>
          <p className="text-sm text-gray-500">
            {data.kelurahan}, Kec. {data.kecamatan}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Tutup ✕
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* DETAIL */}
        <div className="space-y-2 text-sm text-gray-700">
          <p><b>Alamat:</b> {data.alamat}</p>
          <p><b>PJ:</b> {data.pj}</p>
          <p><b>Status:</b> {data.status}</p>
        </div>

        {/* MAP PLACEHOLDER */}
        <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          Map akan ditampilkan di sini
        </div>
      </div>
    </section>
  );
}
