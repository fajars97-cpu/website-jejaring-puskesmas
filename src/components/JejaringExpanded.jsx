export default function JejaringExpanded({ data, onClose }) {
  return (
    <section className="bg-white rounded-xl shadow-lg border p-6 animate-expand">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-800">
          {data.namaFasyankes}
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Tutup ✕
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* INFO */}
        <div>
          <p className="text-gray-600">{data.alamat}</p>
        </div>

        {/* MAP */}
        <div className="h-64 bg-gray-100 rounded-lg">
          Map nanti di sini
        </div>
      </div>
    </section>
  );
}
