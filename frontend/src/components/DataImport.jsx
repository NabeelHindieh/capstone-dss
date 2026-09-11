import { useEffect, useState } from 'react';
import PageHero from './PageHero.jsx';
import {
  clearDataset,
  getImportHistory,
  uploadCandidatePois,
  uploadExistingChargers,
  uploadSockets,
  uploadTrafficDemand,
} from '../api/imports.js';

const DATASETS = [
  {
    key: 'candidate_pois',
    label: 'Possible New Locations',
    icon: '📍',
    description: 'Places in the city that could potentially host a new charging station (parking lots, malls, points of interest, etc.).',
    columns: 'kategori, ad, lat, lon, osm_id',
    upload: uploadCandidatePois,
  },
  {
    key: 'existing_chargers',
    label: 'Existing Chargers',
    icon: '⚡',
    description: 'Charging stations that are already built and operating in Istanbul today.',
    columns: 'istasyon_no, ad, adres, dagitim_sirketi, operator, marka, hizmet_sekli, lon, lat',
    upload: uploadExistingChargers,
  },
  {
    key: 'sockets',
    label: 'Charger Sockets',
    icon: '🔌',
    description: 'Detailed info about each individual plug/socket at existing chargers (type, power level). Upload existing chargers first.',
    columns: 'ISTASYON_NO, SOKET_GUCU, SOKET_NO, SOKET_TIPI, SOKET_TURU',
    upload: uploadSockets,
  },
  {
    key: 'traffic_demand',
    label: 'Traffic & Demand Data',
    icon: '📊',
    description: 'Traffic and usage data used to figure out which areas of the city need charging stations the most.',
    columns: 'GEOHASH, lat, lon, total_vehicles, mean_vehicles_per_hour, demand_score, ...',
    upload: uploadTrafficDemand,
  },
];

function statusColor(message) {
  if (!message) return '#64748b';
  if (message.startsWith('Failed')) return '#dc2626';
  if (message.startsWith('Uploading')) return '#2563eb';
  return '#166534';
}

export default function DataImport() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({});
  const [openColumns, setOpenColumns] = useState({});

  const refresh = () => getImportHistory().then(setHistory).catch(() => setHistory([]));

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (dataset, file) => {
    if (!file) return;
    setStatus((s) => ({ ...s, [dataset.key]: 'Uploading…' }));
    try {
      const log = await dataset.upload(file);
      setStatus((s) => ({
        ...s,
        [dataset.key]: `Imported ${log.valid_rows}/${log.total_rows} rows (${log.invalid_rows} rejected).`,
      }));
      refresh();
    } catch (err) {
      setStatus((s) => ({ ...s, [dataset.key]: `Failed: ${err.response?.data?.message || err.message}` }));
    }
  };

  const handleClear = async (dataset) => {
  if (!window.confirm(`Delete ALL ${dataset.label} data? This cannot be undone.`)) return;
  try {
    const result = await clearDataset(dataset.key);
    setStatus((s) => ({ ...s, [dataset.key]: `Cleared ${result.deleted} rows.` }));
    refresh();
  } catch (err) {
    setStatus((s) => ({ ...s, [dataset.key]: `Clear failed: ${err.response?.data?.message || err.message}` }));
  }
};

  const toggleColumns = (key) => {
    setOpenColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <PageHero
  title="Data Import"
  description="Upload or refresh the base datasets here instead of re-running the CLI import — useful once your Industrial Engineering / EEE teammates start sending updated files, or when correcting a bad row. Re-uploading a file updates existing records rather than duplicating them."
/>

      <div className="card-grid">
        {DATASETS.map((d) => (
          <div className="panel" key={d.key} style={{ marginBottom: 0 }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.35rem' }}>
              {d.icon} {d.label}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0, marginBottom: '0.75rem' }}>
              {d.description}
            </p>
            <input type="file" accept=".csv" onChange={(e) => handleUpload(d, e.target.files[0])} />
            {status[d.key] && (
              <p style={{ fontSize: '0.85rem', marginTop: '0.6rem', marginBottom: 0, color: statusColor(status[d.key]) }}>
                {status[d.key]}
              </p>
            )}
            <button
              type="button"
              onClick={() => toggleColumns(d.key)}
              style={{
                background: 'none',
                color: '#94a3b8',
                padding: 0,
                fontSize: '0.75rem',
                marginTop: '0.6rem',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {openColumns[d.key] ? 'Hide' : 'Show'} required file format
            </button>
            {openColumns[d.key] && (
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', marginBottom: 0 }}>
                Columns: {d.columns}
              </p>
            )}
            <button
  type="button"
  onClick={() => handleClear(d)}
  style={{
    background: '#dc2626',
    marginTop: '0.75rem',
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    display: 'block',
  }}
>
  Clear all {d.label.toLowerCase()}
</button>
            
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Import History</h3>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>File</th>
              <th>Valid</th>
              <th>Invalid</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 500 }}>{h.dataset_type}</td>
                <td>{h.original_filename}</td>
                <td>{h.valid_rows}</td>
                <td style={{ color: h.invalid_rows > 0 ? '#dc2626' : 'inherit' }}>{h.invalid_rows}</td>
                <td>{h.imported_at ? new Date(h.imported_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
                  No imports yet — upload a dataset above to get started
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}