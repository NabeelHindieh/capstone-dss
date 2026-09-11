import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function DemandLayer({ points }) {
  const map = useMap();
  const layerGroupRef = useRef(null);

  useEffect(() => {
    const layerGroup = L.layerGroup();
    map.addLayer(layerGroup);
    layerGroupRef.current = layerGroup;

    return () => {
      map.removeLayer(layerGroup);
      layerGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    points.forEach((d) => {
      const circle = L.circleMarker([d.lat, d.lon], {
        radius: 2 + d.demand_score * 6,
        color: '#f97316',
        weight: 0,
        fillOpacity: 0.35,
      });
      circle.bindPopup(`Demand score: ${d.demand_score}`);
      layerGroup.addLayer(circle);
    });
  }, [points]);

  return null;
}