import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import DataImport from './components/DataImport.jsx';
import MapView from './components/MapView.jsx';
import ScenarioList from './components/ScenarioList.jsx';
import About from './components/About.jsx';
import ResourceList from './components/ResourceList.jsx';

export default function App() {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>EV Charging DSS · Istanbul</h1>
        <nav>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/scenarios">Scenarios</NavLink>
          <NavLink to="/import">Data Import</NavLink>
        </nav>
      </header>

      <main className={`app-main${isMapPage ? ' app-main-wide' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/scenarios" element={<ScenarioList />} />
          <Route path="/import" element={<DataImport />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources/:type" element={<ResourceList />} />
        </Routes>
      </main>
    </div>
  );
}