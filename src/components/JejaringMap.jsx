import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import pinRed from "/icons/pin-red.png";

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
    for (const d of data) m.set(d.id, d);
    return m;
  }, [data]);

  const dataByIdRef = useRef(new Map());
  useEffect(() => {
    dataByIdRef.current = dataById;
  }, [dataById]);

  const lastFittedKelurahanRef = useRef(null);

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
      map.getLayer("jejaring-marker-active") &&
      map.hasImage("pin-red");

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

  // helper: build feature collection (dipakai init + update)
  const buildFeatureCollection = (rows) => {
    const features = (rows ?? [])
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

    return { type: "FeatureCollection", features };
  };

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
      // 1) MASK
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
              kecamatanGeo.features[0].geometry.coordinates[0],
            ],
          },
        },
      });

      map.addLayer({
        id: "mask-fill",
        type: "fill",
        source: "mask",
        paint: { "fill-color": "#000", "fill-opacity": 0.45 },
      });

      // 2) OUTLINE KECAMATAN
      map.addSource("kecamatan", { type: "geojson", data: kecamatanGeo });
      map.addLayer({
        id: "kecamatan-outline",
        type: "line",
        source: "kecamatan",
        paint: { "line-color": "#065f46", "line-width": 3 },
      });

      // 3) KELURAHAN
      map.addSource("kelurahan", { type: "geojson", data: kelurahanGeo });

      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.04 },
      });

      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: { "line-color": "#16a34a", "line-width": 2 },
      });

      // 4) LOAD IMAGE PIN dulu, baru bikin source+layer jejaring
      map.loadImage(pinRed, (err, image) => {
        if (err) {
          console.error("❌ gagal load pin-red.png", err);
          return;
        }
        if (!map.hasImage("pin-red")) {
          map.addImage("pin-red", image);
        }

        // 5) SOURCE JEJARING (isi awal langsung dari data terbaru)
        if (!map.getSource("jejaring")) {
          map.addSource("jejaring", {
            type: "geojson",
            data: buildFeatureCollection(data),
          });
        }

        // 6) LAYER MARKER DEFAULT
        if (!map.getLayer("jejaring-marker")) {
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
        }

        // 7) LAYER MARKER ACTIVE
        if (!map.getLayer("jejaring-marker-active")) {
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
        }

        // 8) Interaksi marker (baru aman dipasang setelah layer ada)
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

        // 9) Expose API ke parent (flyTo dari klik card)
        onMapApi?.({
          flyToJejaringById: (id) => {
            const d = dataByIdRef.current.get(id);
            const lat = Number(d?.lat);
            const lng = Number(d?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            runWhenReady((m) => {
              m.flyTo({
                center: [lng, lat],
                zoom: Math.max(m.getZoom(), 16),
                duration: 900,
                essential: true,
              });
            });
          },
        });
      });

      // Klik kelurahan (tetap)
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

      // Cursor UX (tetap)
      map.on("mouseenter", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* UPDATE JEJARING DATA (MARKER SOURCE) */
  useEffect(() => {
    runWhenReady((map) => {
      const source = map.getSource("jejaring");
      if (!source) return;

      source.setData(buildFeatureCollection(data));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ACTIVE MARKER (FILTER LAYER) */
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

  /* HIGHLIGHT KELURAHAN + FITBOUNDS DROPDOWN */
  useEffect(() => {
    const target = activeKelurahan || "Semua";

    runWhenReady((map) => {
      const isAll = target === "Semua";

      map.setPaintProperty("kelurahan-fill", "fill-opacity", [
        "case",
        isAll,
        0.05,
        ["==", ["get", "name"], target],
        0.14,
        0.03,
      ]);

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
