export default function JejaringFilter({
  status,
  setStatus,
  jenis,
  setJenis,
  kelurahan,
  setKelurahan,
  jenisOptions,
  kelurahanOptions,
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
      
      {/* FILTER STATUS */}
      <div>
        <label className="block text-sm mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded px-3 py-2"
        >
          <option value="Semua">Semua</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>

<div>
  <label className="block text-sm mb-1">Kelurahan</label>
  <select
    value={kelurahan}
    onChange={(e) => setKelurahan(e.target.value)}
    className="bg-slate-900 border border-slate-600 rounded px-3 py-2"
  >
    <option value="Semua">Semua</option>
    {kelurahanOptions.map((k) => (
      <option key={k} value={k}>
        {k}
      </option>
    ))}
  </select>
</div>

      {/* FILTER JENIS */}
      <div>
        <label className="block text-sm mb-1">Jenis Fasyankes</label>
        <select
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded px-3 py-2"
        >
          <option value="Semua">Semua</option>
          {jenisOptions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
