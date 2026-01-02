import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import kecamatanRaw from "../data/jagakarsa-kecamatan.geojson?raw";
import kelurahanRaw from "../data/jagakarsa-kelurahan.geojson?raw";

const kecamatanGeo = JSON.parse(kecamatanRaw);
const kelurahanGeo = JSON.parse(kelurahanRaw);

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function JejaringMap({
  data = [],
  activeId = null,
  activeKelurahan = "Semua",
  onMarkerClick,
  onKelurahanSelect,
  onMapApi, // <-- bridge ke parent (optional)
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const dataById = useMemo(() => {
    const m = new Map();
    for (const d of data) m.set(d.id, d);
    return m;
  }, [data]);

  // Stabilizer: jalankan fungsi hanya ketika style + layer siap
  const runWhenReady = (fn) => {
    const map = mapRef.current;
    if (!map) return;

    const canRun =
      map.isStyleLoaded() &&
      map.getSource("kelurahan") &&
      map.getSource("jejaring") &&
      map.getLayer("kelurahan-fill") &&
      map.getLayer("kelurahan-outline") &&
      map.getLayer("jejaring-marker") &&
      map.getLayer("jejaring-marker-active");

    if (canRun) {
      fn(map);
      return;
    }

    // Tunggu sampai map "idle" (style + tiles + layers settle)
    const onIdle = () => {
      map.off("idle", onIdle);
      // cek lagi (jaga-jaga)
      const ok =
        map.isStyleLoaded() &&
        map.getSource("kelurahan") &&
        map.getSource("jejaring") &&
        map.getLayer("kelurahan-fill") &&
        map.getLayer("kelurahan-outline") &&
        map.getLayer("jejaring-marker") &&
        map.getLayer("jejaring-marker-active");

      if (ok) fn(map);
    };

    map.on("idle", onIdle);
  };

  /* =========================================================
     INIT MAP (ONCE)
  ========================================================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.82, -6.33],
      zoom: 12.8,
      minZoom: 11,
      maxZoom: 18, // 🔥 bisa zoom dekat
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {

        /* ================= LOAD PIN MERAH ================= */
map.loadImage("/icons/pin-red.png", (err, image) => {
  if (err) {
    console.error("❌ gagal load pin-red.png", err);
    return;
  }

  if (!map.hasImage("pin-red")) {
    map.addImage("pin-red", image);
  }
});

      /* ================= MASK LUAR KECAMATAN ================= */
      
      map.addSource("mask", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [105, -5],
                [108, -5],
                [108, -7.5],
                [105, -7.5],
                [105, -5],
              ],
              // hole: kecamatan jagakarsa
              kecamatanGeo.features[0].geometry.coordinates[0],
            ],
          },
        },
      });

      map.addLayer({
        id: "mask-fill",
        type: "fill",
        source: "mask",
        paint: {
          "fill-color": "#000",
          "fill-opacity": 0.45,
        },
      });

      /* ================= KECAMATAN BORDER ================= */
      map.addSource("kecamatan", { type: "geojson", data: kecamatanGeo });

      map.addLayer({
        id: "kecamatan-outline",
        type: "line",
        source: "kecamatan",
        paint: {
          "line-color": "#065f46",
          "line-width": 3,
        },
      });

      /* ================= KELURAHAN ================= */
      map.addSource("kelurahan", { type: "geojson", data: kelurahanGeo });

      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        paint: {
          "fill-color": "#22c55e",
          // default (akan di-update via effect juga)
          "fill-opacity": 0.04,
        },
      });

      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
        },
      });

      /* ================= MARKER JEJARING ================= */
      map.addSource("jejaring", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
      id: "jejaring-marker",
      type: "symbol",
      source: "jejaring",
      layout: {
      "icon-image": "pin-red",
      "icon-size": 0.7,
      "icon-anchor": "bottom", // ini penting, biar ujung pin nempel lokasi
      "icon-allow-overlap": true,
      },
      });

      map.addLayer({
      id: "jejaring-marker-active",
      type: "symbol",
      source: "jejaring",
      filter: ["==", ["get", "id"], -999999],
      layout: {
      "icon-image": "pin-red",
      "icon-size": 0.95,
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
      },
      });

      /* ================= INTERAKSI ================= */
      map.on("click", "kelurahan-fill", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const name = feature?.properties?.name;
        if (!name) return;

        onKelurahanSelect?.(name);

        // fitBounds ke kelurahan
        const coords = feature.geometry?.coordinates?.[0];
        if (!coords || !coords.length) return;

        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );

        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 16,
          duration: 900,
        });
      });

      map.on("click", "jejaring-marker", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const id = f.properties?.id;
        if (id == null) return;

        onMarkerClick?.(id);

        // flyTo titik marker (enak buat orientasi user)
        const coords = f.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          map.flyTo({
            center: coords,
            zoom: Math.max(map.getZoom(), 15.5),
            duration: 850,
            essential: true,
          });
        }
      });

      map.on("mouseenter", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      // expose API ke parent (optional)
      onMapApi?.({
        flyToJejaringById: (id) => {
          const d = dataById.get(id);
          if (!d?.lng || !d?.lat) return;

          runWhenReady((m) => {
            m.flyTo({
              center: [d.lng, d.lat],
              zoom: Math.max(m.getZoom(), 16),
              duration: 900,
              essential: true,
            });
          });
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     UPDATE JEJARING DATA
  ========================================================= */
  useEffect(() => {
    runWhenReady((map) => {
      const source = map.getSource("jejaring");
      if (!source) return;

      source.setData({
        type: "FeatureCollection",
        features: data
          .filter((d) => d.lat && d.lng)
          .map((d) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [d.lng, d.lat] },
            properties: {
              id: d.id,
              kelurahan: d.kelurahan,
            },
          })),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* =========================================================
     ACTIVE MARKER
  ========================================================= */
  useEffect(() => {
    runWhenReady((map) => {
      map.setFilter("jejaring-marker-active", [
        "==",
        ["get", "id"],
        activeId ?? -999999,
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  /* =========================================================
     HIGHLIGHT KELURAHAN (SYNC FILTER ↔ MAP)
     - active kelurahan: lebih dominan
     - lainnya: dim ringan
  ========================================================= */
  useEffect(() => {
    const target = activeKelurahan || "Semua";

    runWhenReady((map) => {
      const isAll = target === "Semua";

      // Fill opacity
      map.setPaintProperty("kelurahan-fill", "fill-opacity", [
        "case",
        isAll,
        0.05,
        ["==", ["get", "name"], target],
        0.14,
        0.03,
      ]);

      // Outline style
      map.setPaintProperty("kelurahan-outline", "line-color", [
        "case",
        isAll,
        "#16a34a",
        ["==", ["get", "name"], target],
        "#065f46",
        "#16a34a",
      ]);

      map.setPaintProperty("kelurahan-outline", "line-width", [
        "case",
        isAll,
        2,
        ["==", ["get", "name"], target],
        3.5,
        2,
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border border-gray-300">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
