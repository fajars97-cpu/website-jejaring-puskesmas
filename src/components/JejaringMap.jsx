import { useEffect, useRef } from "react";
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
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

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
      maxZoom: 18, // 🔥 BISA ZOOM DEKAT
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
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
          "fill-opacity": 0.45, // dim luar aja
        },
      });

      /* ================= KECAMATAN BORDER ================= */
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

      /* ================= KELURAHAN ================= */
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
          "fill-opacity": [
            "case",
            ["==", ["get", "name"], activeKelurahan],
            0.12,
            0.04,
          ],
        },
      });

      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "name"], activeKelurahan],
            "#065f46",
            "#16a34a",
          ],
          "line-width": [
            "case",
            ["==", ["get", "name"], activeKelurahan],
            3.5,
            2,
          ],
        },
      });

      /* ================= MARKER JEJARING ================= */
      map.addSource("jejaring", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "jejaring-marker",
        type: "circle",
        source: "jejaring",
        paint: {
          "circle-radius": 6,
          "circle-color": "#16a34a",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#065f46",
        },
      });

      map.addLayer({
        id: "jejaring-marker-active",
        type: "circle",
        source: "jejaring",
        filter: ["==", ["get", "id"], activeId],
        paint: {
          "circle-radius": 9,
          "circle-color": "#065f46",
        },
      });

      /* ================= INTERAKSI ================= */
      map.on("click", "kelurahan-fill", e => {
        const feature = e.features?.[0];
        if (!feature) return;

        const name = feature.properties.name;
        onKelurahanSelect?.(name);

        // 🔥 FLY TO KELURAHAN
        const bounds = feature.geometry.coordinates[0].reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(
            feature.geometry.coordinates[0][0],
            feature.geometry.coordinates[0][0]
          )
        );

        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 16,
          duration: 900,
        });
      });

      map.on("click", "jejaring-marker", e => {
        const f = e.features?.[0];
        if (f) onMarkerClick?.(f.properties.id);
      });

      map.on("mouseenter", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "kelurahan-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });
  }, []);

  /* =========================================================
     UPDATE JEJARING DATA
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("jejaring");
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: data
        .filter(d => d.lat && d.lng)
        .map(d => ({
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
  }, [data]);

  /* =========================================================
     ACTIVE MARKER
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("jejaring-marker-active")) return;

    map.setFilter("jejaring-marker-active", [
      "==",
      ["get", "id"],
      activeId,
    ]);
  }, [activeId]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border border-gray-300">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
