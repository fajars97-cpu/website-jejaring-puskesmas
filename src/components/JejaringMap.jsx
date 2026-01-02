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
  onKelurahanClick,
}) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  /* =========================================================
     INIT MAP (ONCE)
  ========================================================= */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [106.82, -6.33], // Jagakarsa
      zoom: 12.5,
      minZoom: 11,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      /* ================= MASK OUTSIDE JAGAKARSA ================= */
      map.addSource("mask-jagakarsa", {
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
        id: "mask-layer",
        type: "fill",
        source: "mask-jagakarsa",
        paint: {
          "fill-color": "#000",
          "fill-opacity": 0.45,
        },
      });

      /* ================= KECAMATAN BOUNDARY ================= */
      map.addSource("kecamatan", {
        type: "geojson",
        data: kecamatanGeo,
      });

      map.addLayer({
        id: "kecamatan-outline",
        type: "line",
        source: "kecamatan",
        paint: {
          "line-color": "#087745",
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
          "fill-color": "#16a34a",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "kelurahan-outline",
        type: "line",
        source: "kelurahan",
        paint: {
          "line-color": "#087745",
          "line-width": 1.5,
        },
      });

      /* ================= JEJARING MARKERS ================= */
      map.addSource("jejaring-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "jejaring-marker",
        type: "circle",
        source: "jejaring-points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#16a34a",
          "circle-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "jejaring-marker-active",
        type: "circle",
        source: "jejaring-points",
        filter: ["==", ["get", "id"], activeId],
        paint: {
          "circle-radius": 9,
          "circle-color": "#065f46",
          "circle-opacity": 1,
        },
      });

      /* ================= INTERACTIONS ================= */
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

      map.on("click", "kelurahan-fill", e => {
        const name = e.features?.[0]?.properties?.name;
        if (name) onKelurahanClick?.(name);
      });
    });
  }, []);

  /* =========================================================
     UPDATE MARKER DATA
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("jejaring-points");
    if (!source) return;

    const features = data
      .filter(item => item.lat && item.lng)
      .map(item => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat],
        },
        properties: {
          id: item.id,
          kelurahan: item.kelurahan,
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
     DIM MARKER & HIGHLIGHT KELURAHAN
  ========================================================= */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Marker dim
    if (map.getLayer("jejaring-marker")) {
      map.setPaintProperty(
        "jejaring-marker",
        "circle-opacity",
        activeKelurahan === "Semua"
          ? 0.9
          : [
              "case",
              ["==", ["get", "kelurahan"], activeKelurahan],
              0.9,
              0.25,
            ]
      );
    }

    // Kelurahan highlight
    if (map.getLayer("kelurahan-fill")) {
      map.setPaintProperty(
        "kelurahan-fill",
        "fill-opacity",
        activeKelurahan === "Semua"
          ? 0.08
          : [
              "case",
              ["==", ["get", "name"], activeKelurahan],
              0.3,
              0.05,
            ]
      );
    }
  }, [activeKelurahan]);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden border">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
