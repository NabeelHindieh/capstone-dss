import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import ClusterLayer from './ClusterLayer.jsx';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { getDemandPoints, getMapLayers, getScenarios } from '../api/client.js';
import { ISTANBUL_DISTRICTS, isInDistrict } from '../data/istanbulDistricts.js';
import DemandLayer from './DemandLayer.jsx';

const ISTANBUL_CENTER = [41.0082, 28.9784];

const STYLE_BY_SOURCE = {
  existing: { color: '#2563eb', radius: 8, label: 'Existing chargers' },
  candidate: { color: '#7c3aed', radius: 6, label: 'Candidate sites' },
  optimized: { color: '#16a34a', radius: 10, label: 'Optimized stations' },
};

function circleIcon(color, radius) {
  const size = radius * 2;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;opacity:0.85;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function RecenterOnDistrict({ district }) {
  const map = useMap();
  useEffect(() => {
    if (district) map.setView([district.lat, district.lon], 13);
  }, [district, map]);
  return null;
}

export default function MapView() {
  const [scenarios, setScenarios] = useState([]);
  const [scenarioId, setScenarioId] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [search, setSearch] = useState('');
  const [stations, setStations] = useState([]);
  const [demand, setDemand] = useState([]);
  const [loading, setLoading] = useState(false);

  const district = useMemo(
    () => ISTANBUL_DISTRICTS.find((d) => d.name === districtName) || null,
    [districtName]
  );

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ISTANBUL_DISTRICTS;
    return ISTANBUL_DISTRICTS.filter((d) => d.name.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    getScenarios().then(setScenarios).catch(() => setScenarios([]));
  }, []);

  useEffect(() => {
    if (!district) {
      setStations([]);
      setDemand([]);
      return;
    }
    setLoading(true);
    Promise.all([
      getMapLayers(scenarioId ? { scenario_id: scenarioId } : {}),
      getDemandPoints({ min_score: 0.5 }),
    ])
      .then(([stationData, demandData]) => {
        setStations(stationData.filter((s) => isInDistrict(s.lat, s.lon, district)));
        setDemand(demandData.filter((d) => isInDistrict(d.lat, d.lon, district)));
      })
      .finally(() => setLoading(false));
  }, [district, scenarioId]);

  const stationsBySource = useMemo(() => {
    const grouped = { existing: [], candidate: [], optimized: [] };
    for (const s of stations) {
      if (grouped[s.source_type]) grouped[s.source_type].push(s);
    }
    return grouped;
  }, [stations]);

  return (
    <div style={{ display: 'flex', height: '80vh', gap: '1rem' }}>
      {/* MAP */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={ISTANBUL_CENTER}
          zoom={district ? 13 : 11}
          preferCanvas
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <RecenterOnDistrict district={district} />
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          />

          <DemandLayer points={demand} />

          {['existing', 'candidate', 'optimized'].map((sourceType) => (
            <ClusterLayer
              key={sourceType}
              markers={stationsBySource[sourceType].map((s) => ({
                position: [s.lat, s.lon],
                icon: circleIcon(STYLE_BY_SOURCE[sourceType].color, STYLE_BY_SOURCE[sourceType].radius),
                popupContent: s.name,
              }))}
            />
          ))}
        </MapContainer>

        {!district && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.95)',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#374151',
              pointerEvents: 'none',
            }}
          >
            Select a district from the panel to load its data →
          </div>
        )}

        {loading && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
            Loading…
          </div>
        )}
      </div>

      {/* MAP KEY SIDEBAR */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          borderLeft: '1px solid #e5e7eb',
          paddingLeft: '1rem',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Map Key</h3>

        <input
          type="text"
          placeholder="Search district…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.4rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
        />

        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '1rem' }}>
          {filteredDistricts.map((d) => (
            <div
              key={d.name}
              onClick={() => setDistrictName(d.name)}
              style={{
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                background: d.name === districtName ? '#dbeafe' : 'transparent',
                fontWeight: d.name === districtName ? 600 : 400,
              }}
            >
              {d.name}
            </div>
          ))}
          {filteredDistricts.length === 0 && (
            <div style={{ padding: '0.6rem', color: '#9ca3af' }}>No matches</div>
          )}
        </div>

        {district && (
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Scenario
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              style={{ width: '100%', marginTop: '0.25rem', padding: '0.3rem' }}
            >
              <option value="">Base layer only</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <h4 style={{ marginBottom: '0.5rem' }}>Legend</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
          {Object.entries(STYLE_BY_SOURCE).map(([key, s]) => (
            <li key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: s.color,
                  marginRight: '0.5rem',
                }}
              />
              {s.label}
            </li>
          ))}
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#f97316',
                opacity: 0.5,
                marginRight: '0.5rem',
              }}
            />
            High-demand area
          </li>
        </ul>
      </div>
    </div>
  );
}