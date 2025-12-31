export default function JejaringExpanded({ data, onClose }) {
  if (!data) return null;

  const mapSrc =
    data.gmapsEmbedUrl ||
    (typeof data.gmapsUrl === "string" && data.gmapsUrl.startsWith("https://www.google.com/maps")
      ? data.gmapsUrl.replace(
          "https://www.google.com/maps",
          "https://www.google.com/maps/embed"
        )
      : null);

  const openUrl = data.gmapsUrl || data.gmapsEmbedUrl || "#";

  return (
    <div className="col-span-2 overflow-hidden transition-all duration-500 ease-in-out animate-expand">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-gray-400 hover:text-red-500 transition"
        >
          Tutup ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-green-700">{data.namaFasyankes}</h2>

            <p className="text-sm text-gray-600 mt-1">
              {data.kelurahan}, Kec. {data.kecamatan}
            </p>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><strong>Alamat:</strong> {data.alamat}</p>
              <p><strong>PJ:</strong> {data.pj || "-"}</p>
              <p><strong>Status:</strong> {data.status}</p>
            </div>

            <div className="mt-4">
              <a
                href={openUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#087745] hover:underline"
              >
                Buka di Google Maps ↗
              </a>
            </div>
          </div>

          {/* MAP */}
          <div className="w-full h-65 rounded-xl overflow-hidden border bg-gray-100">
            {mapSrc ? (
              <iframe
                title={`Map ${data.namaFasyankes}`}
                src={mapSrc}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-6">
                Embed map belum tersedia. Pakai tombol “Buka di Google Maps”.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
