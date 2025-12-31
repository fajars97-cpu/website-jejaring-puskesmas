export default function JejaringExpanded({ data, onClose }) {
  if (!data) return null;

  return (
    <div
      className="
        col-span-2
        overflow-hidden
        transition-all
        duration-500
        ease-in-out
        animate-expand
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          shadow-lg
          p-6
          relative
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute
            top-4
            right-4
            text-gray-400
            hover:text-gray-600
            transition
          "
        >
          Tutup ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INFO */}
          <div>
            <h2 className="text-xl font-semibold text-green-700">
              {data.namaFasyankes}
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              {data.kelurahan}, {data.kecamatan}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Alamat:</strong> {data.alamat}</p>
              <p><strong>PJ:</strong> {data.pj}</p>
              <p><strong>Status:</strong> {data.status}</p>
            </div>
          </div>

          {/* MAP */}
          <div
            className="
              bg-gray-100
              rounded-xl
              flex
              items-center
              justify-center
              text-gray-400
              text-sm
            "
          >
            Map akan ditampilkan di sini
          </div>
        </div>
      </div>
    </div>
  );
}
