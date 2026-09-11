import { Link } from 'react-router-dom';
import PageHero from './PageHero.jsx';
import './About.css';

const TEAM = [
  {
    icon: '🏭',
    title: 'Industrial Engineering',
    description: 'Builds the optimization model that recommends where charging stations should go.',
  },
  {
    icon: '🔋',
    title: 'Electrical & Electronics Engineering',
    description: 'Simulates technical feasibility — solar generation, battery storage, energy performance.',
  },
  {
    icon: '💻',
    title: 'Software Engineering',
    description: 'Built this platform, bringing both teams\' results together in one place.',
  },
];

const STEPS = [
  {
    title: 'Dashboard',
    path: '/',
    description: 'A quick overview of the numbers — what\'s already built, what\'s being considered, and what the model recommends. Click any card to see the full list.',
  },
  {
    title: 'Map',
    path: '/map',
    description: 'Pick a district to see existing chargers, candidate sites, model recommendations, and high-demand areas plotted on an interactive map.',
  },
  {
    title: 'Scenarios',
    path: '/scenarios',
    description: 'Create different "what-if" planning scenarios, upload optimization and simulation results for each, and compare them side by side.',
  },
  {
    title: 'Data Import',
    path: '/import',
    description: 'Upload or refresh the underlying datasets that power everything else in the app.',
  },
];

const STACK = ['React', 'Leaflet', 'Laravel', 'MySQL', 'OpenStreetMap', 'Esri'];

export default function About() {
  return (
    <div>
      <PageHero
        title="Planning tomorrow's charging network, today."
        description="A Decision Support System for placing mobile renewable-energy EV charging stations across Istanbul — combining real traffic demand with candidate locations, so planners can compare their options and make an informed call."
      />

      <div className="about-section">
        <h2>Who built it</h2>
        <div className="about-team-grid">
          {TEAM.map((t) => (
            <div className="about-team-card" key={t.title}>
              <span className="role-icon">{t.icon}</span>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>How to use each page</h2>
        <div className="about-steps">
          {STEPS.map((s, i) => (
            <Link to={s.path} className="about-step" key={s.title}>
              <span className="about-step-number">{i + 1}</span>
              <div className="about-step-text">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>Built with</h2>
        <div className="about-stack-row">
          {STACK.map((s) => (
            <span className="about-stack-badge" key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}