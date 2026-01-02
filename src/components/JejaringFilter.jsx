export default function JejaringFilter({
  status,
  setStatus,
  jenis,
  setJenis,
  kelurahan,
  setKelurahan,
  statusOptions = [],
  jenisOptions = [],
  kelurahanOptions = [],
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Filter Fasilitas Kesehatan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/** Jenis */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Jenis Fasyankes
          </label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#087745]"
          >
            <option value="Semua">Semua</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/** Kelurahan */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kelurahan</label>
          <select
            value={kelurahan}
            onChange={(e) => setKelurahan(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#087745]"
          >
            <option value="Semua">Semua</option>
            {kelurahanOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/** Status */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#087745]"
          >
            <option value="Semua">Semua</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
