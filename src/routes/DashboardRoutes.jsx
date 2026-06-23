import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

/**
 * Separate routing module for Dashboard related pages.
 * Additional Dashboard sub‑routes can be added here in the future.
 */
const DashboardRoutes = () => {
  return (
    <Routes>
      {/* The main dashboard page */}
      <Route index element={<Dashboard />} />
      {/* Example of a future sub‑route:
          <Route path="stats" element={<DashboardStats />} />
      */}
    </Routes>
  );
};

export default DashboardRoutes;
