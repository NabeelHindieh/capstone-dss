import { useEffect, useState } from 'react';
import PageHero from './PageHero.jsx';
import {
  compareScenarios,
  createScenario,
  deleteScenario,
  getScenarios,
  uploadOptimizationResults,
  uploadSimulationResults,
} from '../api/client.js';

const STATUS_COLORS = {
  draft: { bg: '#f1f5f9', color: '#475569' },
  active: { bg: '#dcfce7', color: '#166534' },
  archived: { bg: '#fee2e2', color: '#991b1b' },
};

function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

export default function ScenarioList() {
  const [scenarios, setScenarios] = useState([]);
  const [name, setName] = useState('');
  const [comparison, setComparison] = useState([]);
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState('');

  const refresh = () => getScenarios().then(setScenarios);

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createScenario({ name, status: 'draft' });
    setName('');
    refresh();
  };

  const handleUpload = async (scenarioId, kind, file) => {
    if (!file) return;
    setStatus(`Uploading ${kind} for scenario ${scenarioId}…`);
    try {
      const log =
        kind === 'optimization'
          ? await uploadOptimizationResults(scenarioId, file)
          : await uploadSimulationResults(scenarioId, file);
      setStatus(`Imported ${log.valid_rows}/${log.total_rows} rows (${log.invalid_rows} rejected).`);
      refresh();
    } catch (err) {
      setStatus(`Upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id, scenarioName) => {
    if (!window.confirm(`Delete "${scenarioName}"? This cannot be undone.`)) return;
    try {
      await deleteScenario(id);
      setSelected((prev) => prev.filter((x) => x !== id));
      refresh();
    } catch (err) {
      setStatus(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleSelected = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runCompare = () => {
    if (selected.length < 2) return;
    compareScenarios(selected).then(setComparison);
  };

  return (
    <div>
      <PageHero
  title="Scenarios"
  description="Create planning scenarios, upload optimization and simulation results for each, then compare them side by side."
/>

      <form className="panel" onSubmit={handleCreate}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Create a new scenario</h3>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.35rem' }}>
          Scenario name
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            style={{ flex: 1 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. High-demand priority, 50 stations"
          />
          <button type="submit">Create</button>
        </div>
      </form>

      {status && <div className="panel notice">{status}</div>}

      <div className="panel notice" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
  Upload each scenario's optimization CSV first — the simulation CSV links
  to it by ID and will fail to import if uploaded first.
</div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        
        <table className="table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Name</th>
              <th>Status</th>
              <th>Optimized stations</th>
              <th>Upload optimization CSV</th>
              <th>Upload simulation CSV</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.id}>
                <td>
                  <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelected(s.id)} />
                </td>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>{s.optimization_results_count ?? 0}</td>
                <td>
                  <input type="file" accept=".csv" onChange={(e) => handleUpload(s.id, 'optimization', e.target.files[0])} />
                </td>
                <td>
                  <input type="file" accept=".csv" onChange={(e) => handleUpload(s.id, 'simulation', e.target.files[0])} />
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    style={{ background: '#dc2626', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {scenarios.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
                  No scenarios yet — create one above to get started
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
        <button disabled={selected.length < 2} onClick={runCompare}>
          Compare selected scenarios
        </button>
        {selected.length < 2 && (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Select at least 2 scenarios above to compare them
          </span>
        )}
      </div>

      {comparison.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Comparison Results</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Stations</th>
                <th>Total capacity (kW)</th>
                <th>Total cost</th>
                <th>Avg. demand coverage</th>
                <th>Total emissions (kg)</th>
                <th>Feasible share</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.station_count}</td>
                  <td>{c.total_capacity_kw}</td>
                  <td>{c.total_operational_cost}</td>
                  <td>{c.avg_demand_coverage ?? '—'}</td>
                  <td>{c.total_estimated_emissions_kg}</td>
                  <td>{c.feasible_share ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}