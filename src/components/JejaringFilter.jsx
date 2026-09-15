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
  onReset,
}) {
  const isFiltered = jenis !== "Semua" || kelurahan !== "Semua" || status !== "Semua";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#dce8e1] bg-white shadow-[0_14px_34px_rgba(20,70,51,0.08)]">
      <div className="flex flex-col gap-3 border-b border-[#e6eee9] bg-[#f7faf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#39745c]">Pencarian direktori</p>
          <h3 className="mt-1 text-base font-bold text-[#163f31]">Filter fasilitas kesehatan</h3>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-fit items-center rounded-lg border border-[#bed4c6] bg-white px-3 py-2 text-xs font-bold text-[#176548] transition hover:border-[#176548] hover:bg-[#edf7f1]"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            Jenis Fasyankes
          </label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#d7e3dc] bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#087745] focus:ring-4 focus:ring-[#087745]/10"
          >
            <option value="Semua">Semua</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Kelurahan</label>
          <select
            value={kelurahan}
            onChange={(e) => setKelurahan(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#d7e3dc] bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#087745] focus:ring-4 focus:ring-[#087745]/10"
          >
            <option value="Semua">Semua</option>
            {kelurahanOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status operasional</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#d7e3dc] bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#087745] focus:ring-4 focus:ring-[#087745]/10"
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
