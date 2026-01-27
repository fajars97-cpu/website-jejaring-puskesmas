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

  const lastFittedKelurahanRef = useRef(null);

  // Keep latest data in ref (anti stale & untuk sync saat style refresh)
  const latestDataRef = useRef([]);
  useEffect(() => {
    latestDataRef.current = Array.isArray(data) ? data : [];
  }, [data]);

  const dataById = useMemo(() => {
    const m = new Map();
    for (const d of data) m.set(d.id, d);
    return m;
  }, [data]);

  const dataByIdRef = useRef(new Map());
  useEffect(() => {
    dataByIdRef.current = dataById;
  }, [dataById]);

  // ========= GeoJSON builder (marker source) =========
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

  // ========= Pin loader (only once) =========
  const pinReadyRef = useRef(false);
  const pinLoadingRef = useRef(false);

  const ensurePin = (map) =>
    new Promise((resolve) => {
      if (map.hasImage("pin-red")) {
        pinReadyRef.current = true;
        resolve(true);
        return;
      }
      if (pinReadyRef.current) {
        resolve(true);
        return;
      }
      if (pinLoadingRef.current) {
        // wait a bit; styledata/idle will call sync again
        resolve(false);
        return;
      }

      pinLoadingRef.current = true;
      map.loadImage(pinRed, (err, image) => {
        pinLoadingRef.current = false;

        if (err || !image) {
          console.error("❌ gagal load pin-red.png", err);
          resolve(false);
          return;
        }

        try {
          if (!map.hasImage("pin-red")) map.addImage("pin-red", image);
          pinReadyRef.current = true;
          resolve(true);
        } catch (e) {
          // if style reload happens mid-addImage, we just retry later
          console.warn("⚠️ addImage pin-red retry later:", e?.message || e);
          resolve(false);
        }
      });
    });

  // ========= Ensure source + layers exist (idempotent) =========
  const ensureJejaringLayers = async (map) => {
    // must have pin first for symbol layer
    const okPin = await ensurePin(map);
    if (!okPin) return false;

    // Source
    if (!map.getSource("jejaring")) {
      map.addSource("jejaring", {
        type: "geojson",
        data: buildFeatureCollection(latestDataRef.current),
      });
    } else {
      // always sync latest data
      map.getSource("jejaring").setData(buildFeatureCollection(latestDataRef.current));
    }

    // Default marker layer
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

    // Active marker layer
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

    return true;
  };

  // ========= Sync markers (safe to call anytime) =========
  const syncMarkers = async () => {
    const map = mapRef.current;
    if (!map) return;

    // Only proceed if style is loaded enough to accept sources/layers
    if (!map.isStyleLoaded()) return;

    try {
      const ok = await ensureJejaringLayers(map);
      if (!ok) return;

      // Active filter (always re-apply)
      if (map.getLayer("jejaring-marker-active")) {
        map.setFilter("jejaring-marker-active", [
          "==",
          ["get", "id"],
          activeId ?? -999999,
        ]);
      }
    } catch (e) {
      // style might be reloading; we'll try again on styledata/idle
      // keep silent-ish to avoid noise
      // console.warn("syncMarkers skipped:", e?.message || e);
    }
  };

  // ========= Init map =========
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

    const onLoad = () => {
      // MASK
      if (!map.getSource("mask")) {
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
      }

      // OUTLINE KECAMATAN
      if (!map.getSource("kecamatan")) {
        map.addSource("kecamatan", { type: "geojson", data: kecamatanGeo });
        map.addLayer({
          id: "kecamatan-outline",
          type: "line",
          source: "kecamatan",
          paint: { "line-color": "#065f46", "line-width": 3 },
        });
      }

      // KELURAHAN
      if (!map.getSource("kelurahan")) {
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

        // Click kelurahan -> callback + fitBounds
        map.on("click", "kelurahan-fill", (e) => {
          const feature = e.features?.[0];
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

        // Cursor UX
        map.on("mouseenter", "kelurahan-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "kelurahan-fill", () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // Marker click (handler once; layer may be recreated later but handler remains)
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

      // Expose API (flyTo from card)
      onMapApi?.({
        flyToJejaringById: (id) => {
          const d = dataByIdRef.current.get(id);
          const lat = Number(d?.lat);
          const lng = Number(d?.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

          map.flyTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), 16),
            duration: 900,
            essential: true,
          });
        },
      });

      // IMPORTANT: sync markers right after load
      syncMarkers();
    };

    // Re-sync when style changes (Mapbox can reset sources/layers)
    const onStyleData = () => syncMarkers();
    const onIdle = () => syncMarkers();

    map.on("load", onLoad);
    map.on("styledata", onStyleData);
    map.on("idle", onIdle);

    return () => {
      map.off("load", onLoad);
      map.off("styledata", onStyleData);
      map.off("idle", onIdle);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when data changes
  useEffect(() => {
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Sync when activeId changes (re-apply filter even if style refresh)
  useEffect(() => {
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Kelurahan highlight + dropdown fitBounds (same behavior as you had)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (!map.getLayer("kelurahan-fill") || !map.getLayer("kelurahan-outline")) return;

    const target = activeKelurahan || "Semua";
    const isAll = target === "Semua";

    try {
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

      if (isAll) lastFittedKelurahanRef.current = null;
    } catch {
      // style might be mid-refresh; styledata/idle will re-run
    }
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border border-gray-300">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
