import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Saved from './pages/Saved';
import Auth from './pages/Auth';

// Placeholder pages for future development
const Settings = () => <div className="py-4"><h2>Settings Page</h2><p>This page is under construction.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
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
