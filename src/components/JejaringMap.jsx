import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import pinRed from "/icons/pin-red.png";

import kecamatanRaw from "../data/jagakarsa-kecamatan.geojson?raw";
import kelurahanRaw from "../data/jagakarsa-kelurahan.geojson?raw";

const kecamatanGeo = JSON.parse(kecamatanRaw);
const kelurahanGeo = JSON.parse(kelurahanRaw);

/* NOTE: Token Mapbox dari Vite env */
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function JejaringMap({
  data = [],
  activeId = null,
  activeKelurahan = "Semua",
  onMarkerClick,
  onKelurahanSelect,
  onMapApi, // NOTE: bridge ke parent (optional)
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  /* =========================================================
     NOTE: dataById untuk lookup cepat (dipakai marker flyTo by id)
  ========================================================= */
  const dataById = useMemo(() => {
    const m = new Map();
    for (const d of data) m.set(d.id, d);
    return m;
  }, [data]);

  /* =========================================================
     NOTE: Anti-stale closure
     - onMapApi biasanya di-set sekali saat map load
     - kalau data berubah (Supabase load), fungsi flyTo harus pakai data terbaru
  ========================================================= */
  const dataByIdRef = useRef(new Map());
  useEffect(() => {
    dataByIdRef.current = dataById;
  }, [dataById]);

  /* =========================================================
     NOTE: Guard supaya fitBounds (dari dropdown) tidak spam
  ========================================================= */
  const lastFittedKelurahanRef = useRef(null);

  /* =========================================================
     NOTE: Stabilizer: jalankan fungsi hanya ketika style + source + layer siap
     - Ini versi rapi dari runWhenReady kamu (fitur tetap sama)
  ========================================================= */
  const runWhenReady = (fn) => {
    const map = mapRef.current;
    if (!map) return;

    const isReady = () =>
      map.isStyleLoaded() &&
      map.getSource("kelurahan") &&
      map.getSource("jejaring") &&
      map.getLayer("kelurahan-fill") &&
      map.getLayer("kelurahan-outline") &&
      map.getLayer("jejaring-marker") &&
      map.getLayer("jejaring-marker-active");

    if (isReady()) {
      fn(map);
      return;
    }

    const onIdle = () => {
      map.off("idle", onIdle);
      if (isReady()) fn(map);
    };

    map.on("idle", onIdle);
  };

  /* =========================================================
     INIT MAP (ONCE)
     NOTE: Semua strategi map kamu dipertahankan:
     - style streets-v12
     - mask luar kecamatan
     - kelurahan fill/outline
     - marker pin merah
     - zoom sampai 18
  ========================================================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.82, -6.33],
      zoom: 12.8,
      minZoom: 11,
      maxZoom: 18, // NOTE: bisa zoom dekat (locked requirement)
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      /* =========================================================
         NOTE: Load image pin merah (symbol layer)
      ========================================================= */
      map.loadImage(pinRed, (err, image) => {
        if (err) {
          console.error("❌ gagal load pin-red.png", err);
          return;
        }
        if (!map.hasImage("pin-red")) {
          map.addImage("pin-red", image);
        }
      });

      /* =========================================================
         NOTE: Mask luar Kecamatan Jagakarsa (dim area luar)
         - Outer polygon (besar)
         - Hole polygon (kecamatan)
      ========================================================= */
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

      /* =========================================================
         NOTE: Border Kecamatan (outline tebal)
      ========================================================= */
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

      /* =========================================================
         NOTE: Kelurahan (fill + outline)
      ========================================================= */
      map.addSource("kelurahan", { type: "geojson", data: kelurahanGeo });

      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.04, // NOTE: default, nanti disinkron via effect
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

      /* =========================================================
         NOTE: Source marker jejaring
      ========================================================= */
      map.addSource("jejaring", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      /* =========================================================
         NOTE: Marker default (pin merah)
      ========================================================= */
      map.addLayer({
        id: "jejaring-marker",
        type: "symbol",
        source: "jejaring",
        layout: {
          "icon-image": "pin-red",
          "icon-size": 0.08,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      /* =========================================================
         NOTE: Marker active (lebih besar)
      ========================================================= */
      map.addLayer({
        id: "jejaring-marker-active",
        type: "symbol",
        source: "jejaring",
        filter: ["==", ["get", "id"], -999999],
        layout: {
          "icon-image": "pin-red",
          "icon-size": 0.1,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      /* =========================================================
         NOTE: Interaksi klik kelurahan
         - highlight + sync filter (via callback)
         - fitBounds ke kelurahan (UX requirement)
      ========================================================= */
      map.on("click", "kelurahan-fill", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const name = feature?.properties?.name;
        if (!name) return;

        onKelurahanSelect?.(name);

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

      /* =========================================================
         NOTE: Interaksi klik marker
         - marker -> expand card (parent handler)
         - flyTo marker untuk orientasi user
      ========================================================= */
      map.on("click", "jejaring-marker", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const id = f.properties?.id;
        if (id == null) return;

        onMarkerClick?.(id);

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

      /* =========================================================
         NOTE: Cursor UX
      ========================================================= */
      map.on("mouseenter", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      /* =========================================================
         NOTE: Expose API ke parent (flyTo dari klik card)
         - pakai dataByIdRef agar selalu latest (anti-stale)
      ========================================================= */
      onMapApi?.({
        flyToJejaringById: (id) => {
          const d = dataByIdRef.current.get(id);
          const lat = Number(d?.lat);
          const lng = Number(d?.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

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

    /* NOTE: Cleanup map instance */
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     UPDATE JEJARING DATA (MARKER SOURCE)
     NOTE: tetap sama, hanya dirapikan
  ========================================================= */
  useEffect(() => {
    runWhenReady((map) => {
      const source = map.getSource("jejaring");
      if (!source) return;

      const features = (data ?? [])
        .map((d) => {
          const lat = Number(d.lat);
          const lng = Number(d.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: { id: d.id, kelurahan: d.kelurahan },
          };
        })
        .filter(Boolean);

      source.setData({
        type: "FeatureCollection",
        features,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* =========================================================
     ACTIVE MARKER (FILTER LAYER)
     NOTE: tetap sama
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
     NOTE:
     - active kelurahan: lebih dominan
     - lainnya: dim ringan
     - PLUS: dropdown pilih kelurahan -> fitBounds otomatis (incremental)
  ========================================================= */
  useEffect(() => {
    const target = activeKelurahan || "Semua";

    runWhenReady((map) => {
      const isAll = target === "Semua";

      // NOTE: Fill opacity
      map.setPaintProperty("kelurahan-fill", "fill-opacity", [
        "case",
        isAll,
        0.05,
        ["==", ["get", "name"], target],
        0.14,
        0.03,
      ]);

      // NOTE: Outline color
      map.setPaintProperty("kelurahan-outline", "line-color", [
        "case",
        isAll,
        "#16a34a",
        ["==", ["get", "name"], target],
        "#065f46",
        "#16a34a",
      ]);

      // NOTE: Outline width
      map.setPaintProperty("kelurahan-outline", "line-width", [
        "case",
        isAll,
        2,
        ["==", ["get", "name"], target],
        3.5,
        2,
      ]);

      /* =========================================================
         NOTE: Dropdown/filter -> fitBounds kelurahan
         - jalan hanya jika target != "Semua"
         - guard supaya tidak fitBounds berulang saat effect rerun
      ========================================================= */
      if (!isAll && target && lastFittedKelurahanRef.current !== target) {
        const feature = kelurahanGeo.features?.find(
          (f) => f?.properties?.name === target
        );

        const coords = feature?.geometry?.coordinates?.[0];
        if (coords && coords.length) {
          const bounds = coords.reduce(
            (b, c) => b.extend(c),
            new mapboxgl.LngLatBounds(coords[0], coords[0])
          );

          map.fitBounds(bounds, {
            padding: 60,
            maxZoom: 16,
            duration: 900,
          });

          lastFittedKelurahanRef.current = target;
        }
      }

      // NOTE: Reset guard saat kembali ke "Semua"
      if (isAll) {
        lastFittedKelurahanRef.current = null;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border border-gray-300">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
