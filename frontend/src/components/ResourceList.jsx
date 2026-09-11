import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMapLayers, getDemandPoints } from '../api/client.js';
import PageHero from './PageHero.jsx';

const TYPE_CONFIG = {
  existing: {
    title: 'Existing Chargers',
    description: 'Charging stations already active in the city today.',
    sourceType: 'existing',
  },
  candidate: {
    title: 'Possible New Locations',
    description: 'Sites being evaluated as possible spots for a future charging station.',
    sourceType: 'candidate',
  },
  optimized: {
    title: 'Recommended Stations',
    description: 'Station locations suggested by the optimization model.',
    sourceType: 'optimized',
  },
  demand: {
    title: 'High-Demand Areas',
    description: 'City zones where charging is likely needed most, based on traffic and usage data.',
    isDemand: true,
  },
};

export default function ResourceList() {
  const { type } = useParams();
  const config = TYPE_CONFIG[type];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setError(null);

    const request = config.isDemand
  ? getDemandPoints({})
  : getMapLayers(config.sourceType === 'optimized' ? { source_type: 'optimized' } : {});

    request
      .then((data) => {
        const filtered = config.isDemand
          ? data
          : data.filter((s) => s.source_type === config.sourceType);
        setItems(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type]);

  const filteredItems = useMemo(() => {
    if (config?.isDemand) return items;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => s.name?.toLowerCase().includes(q));
  }, [items, search, config]);

  if (!config) {
    return (
      <div className="panel">
        <p>Unknown resource type.</p>
        <Link to="/">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Dashboard
      </Link>

      <PageHero title={config.title} description={config.description} />

      {error && (
        <div className="panel notice">Couldn't load data ({error}).</div>
      )}

      {loading && <div className="panel">Loading…</div>}

      {!loading && !error && (
        <>
          {!config.isDemand && (
            <div className="toolbar">
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
          </p>

          <table className="table">
            <thead>
              {config.isDemand ? (
                <tr>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Demand score</th>
                </tr>
              ) : (
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Capacity (kW)</th>
                  <th>Sockets</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              )}
            </thead>
            <tbody>
              {config.isDemand
                ? filteredItems.map((d) => (
                    <tr key={d.id}>
                      <td>{d.lat.toFixed(5)}</td>
                      <td>{d.lon.toFixed(5)}</td>
                      <td>{d.demand_score}</td>
                    </tr>
                  ))
                : filteredItems.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name || '—'}</td>
                      <td>{s.category || '—'}</td>
                      <td>{s.capacity_kw ?? '—'}</td>
                      <td>{s.socket_count ?? '—'}</td>
                      <td>{s.lat.toFixed(5)}</td>
                      <td>{s.lon.toFixed(5)}</td>
                    </tr>
                  ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={config.isDemand ? 3 : 6} style={{ color: '#9ca3af', textAlign: 'center' }}>
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}