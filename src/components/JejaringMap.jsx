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
  onMapApi,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const dataById = useMemo(() => {
    const m = new Map();
    data.forEach((d) => m.set(d.id, d));
    return m;
  }, [data]);

  /* =========================================================
     HELPER: run when map ready
  ========================================================= */
  const runWhenReady = (fn) => {
    const map = mapRef.current;
    if (!map) return;

    if (
      map.isStyleLoaded() &&
      map.getSource("jejaring") &&
      map.getLayer("jejaring-marker") &&
      map.getLayer("jejaring-marker-active")
    ) {
      fn(map);
      return;
    }

    const onIdle = () => {
      map.off("idle", onIdle);
      if (
        map.isStyleLoaded() &&
        map.getSource("jejaring") &&
        map.getLayer("jejaring-marker") &&
        map.getLayer("jejaring-marker-active")
      ) {
        fn(map);
      }
    };

    map.on("idle", onIdle);
  };

  /* =========================================================
     INIT MAP
  ========================================================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.82, -6.33],
      zoom: 12.8,
      minZoom: 11,
      maxZoom: 18,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      /* =====================================================
         LOAD PIN IMAGE (WAJIB)
      ===================================================== */
      map.loadImage("/icons/pin-red.png", (err, image) => {
        if (err) {
          console.error("❌ gagal load pin-red.png", err);
          return;
        }

        if (!map.hasImage("pin-red")) {
          map.addImage("pin-red", image);
        }

        /* =====================================================
           MASK LUAR KECAMATAN (HOLE FIXED)
        ===================================================== */
        map.addSource("mask", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                // OUTER RING
                [
                  [105, -5],
                  [108, -5],
                  [108, -7.5],
                  [105, -7.5],
                  [105, -5],
                ],
                // INNER RING (HOLE) — WAJIB REVERSE
                kecamatanGeo.features[0].geometry.coordinates[0]
                  .slice()
                  .reverse(),
              ],
            },
          },
        });

        /* =====================================================
           KELURAHAN
        ===================================================== */
        map.addSource("kelurahan", {
          type: "geojson",
          data: kelurahanGeo,
        });

        map.addLayer({
          id: "kelurahan-fill",
          type: "fill",
          source: "kelurahan",
          paint: {
            "fill-color": "#22c55e",
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

        /* =====================================================
           MASK LAYER (DI BAWAH KELURAHAN)
        ===================================================== */
        map.addLayer(
          {
            id: "mask-fill",
            type: "fill",
            source: "mask",
            paint: {
              "fill-color": "#000",
              "fill-opacity": 0.45,
            },
          },
          "kelurahan-fill" // ⬅️ KUNCI: posisi layer
        );

        /* =====================================================
           KECAMATAN BORDER
        ===================================================== */
        map.addSource("kecamatan", {
          type: "geojson",
          data: kecamatanGeo,
        });

        map.addLayer({
          id: "kecamatan-outline",
          type: "line",
          source: "kecamatan",
          paint: {
            "line-color": "#065f46",
            "line-width": 3,
          },
        });

        /* =====================================================
           JEJARING SOURCE
        ===================================================== */
        map.addSource("jejaring", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        /* =====================================================
           MARKER PIN MERAH
        ===================================================== */
        map.addLayer({
          id: "jejaring-marker",
          type: "symbol",
          source: "jejaring",
          layout: {
            "icon-image": "pin-red",
            "icon-size": 0.7,
            "icon-anchor": "bottom",
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

        /* =====================================================
           INTERAKSI
        ===================================================== */
        map.on("click", "kelurahan-fill", (e) => {
          const f = e.features?.[0];
          if (!f) return;

          const name = f.properties?.name;
          if (!name) return;

          onKelurahanSelect?.(name);

          const coords = f.geometry.coordinates[0];
          const bounds = coords.reduce(
            (b, c) => b.extend(c),
            new mapboxgl.LngLatBounds(coords[0], coords[0])
          );

          map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
        });

        map.on("click", "jejaring-marker", (e) => {
          const f = e.features?.[0];
          if (!f) return;

          const id = f.properties?.id;
          if (id == null) return;

          onMarkerClick?.(id);

          const [lng, lat] = f.geometry.coordinates;
          map.flyTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), 15.5),
            duration: 800,
          });
        });

        map.on("mouseenter", "kelurahan-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "kelurahan-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        /* =====================================================
           EXPOSE API
        ===================================================== */
        onMapApi?.({
          flyToJejaringById: (id) => {
            const d = dataById.get(id);
            if (!d?.lng || !d?.lat) return;

            map.flyTo({
              center: [d.lng, d.lat],
              zoom: Math.max(map.getZoom(), 16),
              duration: 900,
            });
          },
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dataById, onKelurahanSelect, onMarkerClick, onMapApi]);

  /* =========================================================
     UPDATE DATA
  ========================================================= */
  useEffect(() => {
    runWhenReady((map) => {
      map.getSource("jejaring")?.setData({
        type: "FeatureCollection",
        features: data
          .filter((d) => d.lat && d.lng)
          .map((d) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [d.lng, d.lat],
            },
            properties: {
              id: d.id,
              kelurahan: d.kelurahan,
            },
          })),
      });
    });
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
  }, [activeId]);

  /* =========================================================
     HIGHLIGHT KELURAHAN
  ========================================================= */
  useEffect(() => {
    runWhenReady((map) => {
      const isAll = activeKelurahan === "Semua";

      map.setPaintProperty("kelurahan-fill", "fill-opacity", [
        "case",
        isAll,
        0.05,
        ["==", ["get", "name"], activeKelurahan],
        0.14,
        0.03,
      ]);
    });
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border border-gray-300">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
