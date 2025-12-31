import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function JejaringMap({
  data = [],
  activeId = null,
  activeKelurahan = "Semua",
  onMarkerClick,
}) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // =========================
  // INIT MAP (ONCE)
  // =========================
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [106.82, -6.33], // Jagakarsa
      zoom: 12.5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      // SOURCE: jejaring points
      mapRef.current.addSource("jejaring-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // LAYER: marker default
      mapRef.current.addLayer({
        id: "jejaring-marker",
        type: "circle",
        source: "jejaring-points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#16a34a", // hijau
          "circle-opacity": 0.9,
        },
      });

      // LAYER: marker active
      mapRef.current.addLayer({
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

      // CLICK HANDLER
      mapRef.current.on("click", "jejaring-marker", e => {
        const feature = e.features?.[0];
        if (!feature) return;

        onMarkerClick?.(feature.properties.id);
      });

      mapRef.current.on("mouseenter", "jejaring-marker", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });

      mapRef.current.on("mouseleave", "jejaring-marker", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
    });
  }, []);

  // =========================
  // UPDATE DATA (MARKER)
  // =========================
  useEffect(() => {
    if (!mapRef.current?.getSource("jejaring-points")) return;

    const features = data
      .filter(item => item.lat && item.lng)
      .map(item => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat], // lng, lat (MAPBOX!)
        },
        properties: {
          id: item.id,
          kelurahan: item.kelurahan,
        },
      }));

    mapRef.current.getSource("jejaring-points").setData({
      type: "FeatureCollection",
      features,
    });
  }, [data]);

  // =========================
  // UPDATE ACTIVE MARKER
  // =========================
  useEffect(() => {
    if (!mapRef.current?.getLayer("jejaring-marker-active")) return;

    mapRef.current.setFilter("jejaring-marker-active", [
      "==",
      ["get", "id"],
      activeId,
    ]);
  }, [activeId]);

  // =========================
  // DIM MARKER BY KELURAHAN
  // =========================
  useEffect(() => {
    if (!mapRef.current?.getLayer("jejaring-marker")) return;

    if (activeKelurahan === "Semua") {
      mapRef.current.setPaintProperty(
        "jejaring-marker",
        "circle-opacity",
        0.9
      );
    } else {
      mapRef.current.setPaintProperty(
        "jejaring-marker",
        "circle-opacity",
        [
          "case",
          ["==", ["get", "kelurahan"], activeKelurahan],
          0.9,
          0.25,
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
