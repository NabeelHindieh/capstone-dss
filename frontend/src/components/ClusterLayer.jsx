import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

export default function ClusterLayer({ markers, chunkedLoading = true, maxClusterRadius = 50, disableClusteringAtZoom = 16 }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    // Create the cluster group once, add it to the map
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading,
      maxClusterRadius,
      disableClusteringAtZoom,
    });
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroupRef.current = null;
    };
  }, [map, chunkedLoading, maxClusterRadius, disableClusteringAtZoom]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    markers.forEach(({ position, icon, popupContent }) => {
      const marker = L.marker(position, { icon });
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      clusterGroup.addLayer(marker);
    });
  }, [markers]);

  return null;
}