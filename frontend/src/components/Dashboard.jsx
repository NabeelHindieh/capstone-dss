import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/client.js';
import PageHero from './PageHero.jsx';

const SECTIONS = [
  {
    title: '⚡ What Already Exists',
    description: 'Charging stations already built and running in Istanbul today.',
    cards: [
      {
        key: 'existing_stations',
        label: 'Existing chargers',
        caption: 'Stations already active in the city',
        linkType: 'existing',
      },
    ],
  },
  {
    title: '📍 Places We\'re Considering',
    description: 'Locations being evaluated as possible spots for new charging stations, based on where demand is highest.',
    cards: [
      {
        key: 'candidate_sites',
        label: 'Possible new locations',
        caption: 'Sites being evaluated for a future station',
        linkType: 'candidate',
      },
      {
        key: 'demand_points',
        label: 'High-demand areas',
        caption: 'City zones where charging is likely needed most',
        linkType: 'demand',
      },
      {
        key: 'avg_demand_score',
        label: 'Average demand level',
        caption: 'A score showing how badly an area needs a charger — higher means more urgent',
        format: (v) => (v != null ? Number(v).toFixed(2) : '—'),
      },
    ],
  },
  {
    title: '📊 What the Model Recommends',
    description: 'Results produced by the optimization model, once it has been run for a planning scenario.',
    cards: [
      {
        key: 'optimized_stations',
        label: 'Recommended stations',
        caption: 'Station locations suggested by the model, across all scenarios',
        linkType: 'optimized',
      },
      {
        key: 'scenarios',
        label: 'Planning scenarios',
        caption: 'Different "what-if" plans being compared',
        linkPath: '/scenarios',
      },
    ],
  },
];

function CardContent({ label, caption, displayValue }) {
  return (
    <>
      <span className="card-value">{displayValue}</span>
      <span className="card-label">{label}</span>
      <span className="card-caption">{caption}</span>
    </>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="panel">
        <p>Couldn't reach the API ({error}). Is `php artisan serve` running?</p>
      </div>
    );
  }

  if (!summary) return <div className="panel">Loading…</div>;

  return (
    <div>
      <PageHero
  title="Overview"
  description="This page summarizes the current state of EV charging planning for Istanbul: what's already built, what locations are being considered, and what the optimization model suggests. Click a card to see the full list."
/>

      {SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.15rem' }}>{section.title}</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0, marginBottom: '0.75rem' }}>
            {section.description}
          </p>
          <div className="card-grid">
            {section.cards.map(({ key, label, caption, format, linkType, linkPath }) => {
  const rawValue = summary[key];
  const displayValue = format ? format(rawValue) : rawValue ?? '—';
  const to = linkPath || (linkType ? `/resources/${linkType}` : null);

  if (to) {
    return (
      <Link
        to={to}
        className="card"
        key={key}
        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      >
        <CardContent label={label} caption={caption} displayValue={displayValue} />
      </Link>
    );
  }

  return (
    <div className="card" key={key}>
      <CardContent label={label} caption={caption} displayValue={displayValue} />
    </div>
  );
})}
          </div>
        </div>
      ))}
    </div>
  );
}