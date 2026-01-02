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

  /* =========================================================
     INIT MAP (ONCE)
  ========================================================= */
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

      map.addLayer(
        {
          id: "mask-fill",
          type: "fill",
          source: "mask",
          paint: {
            "fill-color": "#000",
            "fill-opacity": 0.05,
          },
        },
        "waterway-label" // layer aman di streets-v12
      );

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
          "fill-color": "#86efac",
          "fill-opacity": [
            "case",
            ["==", ["get", "name"], activeKelurahan],
            0.05,
            0.05,
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
            ["==", ["get", "name"], activeKelurahan],
            3,
            2,
          ],
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
        const name = e.features?.[0]?.properties?.name;
        if (name) onKelurahanSelect?.(name);
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
     UPDATE JEJARING DATA (SAFE)
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
     ACTIVE MARKER (SAFE)
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
    <div className="w-full h-105 rounded-2xl overflow-hidden border">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
