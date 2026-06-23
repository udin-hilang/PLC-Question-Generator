import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardRoutes from './routes/DashboardRoutes';
import Generator from './pages/Generator';
import Saved from './pages/Saved';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

// Placeholder pages for future development
const Settings = () => (
  <div className="py-4">
    <h2>Settings Page</h2>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wraps all inner pages */}
        <Route path="/" element={<Layout />}>
          {/* Landing page as the default route */}
          <Route index element={<Landing />} />
          {/* Dashboard routes are now handled in a separate module */}
          <Route path="dashboard/*" element={<DashboardRoutes />} />
          <Route path="generator" element={<Generator />} />
          <Route path="saved" element={<Saved />} />
          <Route path="auth" element={<Auth />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
