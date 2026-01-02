import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import kecamatanGeoRaw from "../data/jagakarsa-kecamatan.geojson?raw";
import kelurahanGeoRaw from "../data/jagakarsa-kelurahan.geojson?raw";

const kecamatanGeo = JSON.parse(kecamatanGeoRaw);
const kelurahanGeo = JSON.parse(kelurahanGeoRaw);

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
  const [hoveredKelurahan, setHoveredKelurahan] = useState(null);

  /* =========================================================
     INIT MAP (ONCE)
  ========================================================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [106.82, -6.33],
      zoom: 12.5,
      minZoom: 11,
      maxZoom: 15,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      /* ================= MASK LUAR ================= */
      map.addSource("mask", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [105.5, -5.5],
                [107.5, -5.5],
                [107.5, -7.2],
                [105.5, -7.2],
                [105.5, -5.5],
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
          "fill-opacity": 0.38,
        },
      });

      /* ================= KECAMATAN ================= */
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

      // Fill: hampir transparan → hanya hint area
      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.06,
        },
      });

      // Outline: aktor utama
      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: {
          "line-color": "#16a34a",
          "line-width": 1.4,
          "line-opacity": 0.9,
        },
      });

      /* ================= JEJARING MARKER ================= */
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
          "circle-opacity": 0.85,
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
          "circle-opacity": 1,
        },
      });

      /* ================= INTERACTIONS ================= */
      map.on("click", "kelurahan-fill", e => {
        const name = e.features?.[0]?.properties?.name;
        if (name) onKelurahanSelect?.(name);
      });

      map.on("mousemove", "kelurahan-fill", e => {
        const name = e.features?.[0]?.properties?.name;
        setHoveredKelurahan(name || null);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "kelurahan-fill", () => {
        setHoveredKelurahan(null);
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "jejaring-marker", e => {
        const feature = e.features?.[0];
        if (!feature) return;
        onMarkerClick?.(feature.properties.id);
      });

      map.on("mouseenter", "jejaring-marker", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "jejaring-marker", () => {
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

    const features = data
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
      }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [data]);

  /* =========================================================
     ACTIVE MARKER
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("jejaring-marker-active")) return;

    map.setFilter("jejaring-marker-active", [
      "==",
      ["get", "id"],
      activeId,
    ]);
  }, [activeId]);

  /* =========================================================
     VISUAL STATE (HOVER / ACTIVE)
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Fill sangat subtle
    if (map.getLayer("kelurahan-fill")) {
      map.setPaintProperty("kelurahan-fill", "fill-opacity", [
        "case",
        ["==", ["get", "name"], hoveredKelurahan],
        0.14,
        ["==", ["get", "name"], activeKelurahan],
        0.10,
        0.05,
      ]);
    }

    // Outline tegas untuk aktif
    if (map.getLayer("kelurahan-outline")) {
      map.setPaintProperty("kelurahan-outline", "line-width", [
        "case",
        ["==", ["get", "name"], activeKelurahan],
        3,
        1.4,
      ]);
    }

    // Marker dim jika filter aktif
    if (map.getLayer("jejaring-marker")) {
      map.setPaintProperty("jejaring-marker", "circle-opacity", [
        "case",
        activeKelurahan === "Semua",
        0.85,
        ["==", ["get", "kelurahan"], activeKelurahan],
        0.85,
        0.2,
      ]);
    }
  }, [activeKelurahan, hoveredKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
