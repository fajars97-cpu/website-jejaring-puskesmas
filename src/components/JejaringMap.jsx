import { useEffect, useRef } from "react";
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

  /* ================= INIT MAP ================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.82, -6.33],
      zoom: 12.5,
      minZoom: 11,
      maxZoom: 15,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      /* ===== MASK ===== */
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

      map.addLayer(
        {
          id: "mask-fill",
          type: "fill",
          source: "mask",
          paint: {
            "fill-color": "#000",
            "fill-opacity": 0.3,
          },
        },
        "waterway-label" // 🔑 STABIL
      );

      /* ===== KELURAHAN ===== */
      map.addSource("kelurahan", {
        type: "geojson",
        data: kelurahanGeo,
      });

      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        paint: {
          "fill-color": "#86efac",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.5,
            ["boolean", ["feature-state", "active"], false],
            0.45,
            0.25,
          ],
        },
      });

      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: {
          "line-color": "#065f46",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "active"], false],
            3,
            2,
          ],
        },
      });

      /* ===== MARKER ===== */
      map.addSource("jejaring", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
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

      map.on("click", "kelurahan-fill", e => {
        const feature = e.features?.[0];
        if (!feature) return;

        onKelurahanSelect?.(feature.properties.name);
      });

      let hoveredId = null;

      map.on("mousemove", "kelurahan-fill", e => {
        const feature = e.features?.[0];
        if (!feature) return;

        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "kelurahan", id: hoveredId },
            { hover: false }
          );
        }

        hoveredId = feature.id;
        map.setFeatureState(
          { source: "kelurahan", id: hoveredId },
          { hover: true }
        );
      });

      map.on("mouseleave", "kelurahan-fill", () => {
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "kelurahan", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = null;
      });

      map.on("click", "jejaring-marker", e => {
        const f = e.features?.[0];
        if (f) onMarkerClick?.(f.properties.id);
      });
    });
  }, []);

  /* ================= UPDATE DATA ================= */
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
          },
        })),
    });
  }, [data]);

  /* ================= ACTIVE KELURAHAN ================= */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    kelurahanGeo.features.forEach(f => {
      map.setFeatureState(
        { source: "kelurahan", id: f.id },
        { active: f.properties.name === activeKelurahan }
      );
    });
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
