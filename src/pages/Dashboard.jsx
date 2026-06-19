import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-5">
        <h1 className="dashboard-header">Dashboard</h1>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-title">Questions Generated</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-title">Categories Used</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-title">Exported PDFs</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="hero-card">
          <h2 className="hero-title">Welcome to PLC Question Generator!</h2>
          <p className="hero-subtitle">
            Elevate your educational content with AI-powered professional PLC questions. 
            Create, customize, and export high-quality assessments in seconds.
          </p>
          <button 
            className="btn btn-hero px-5" 
            onClick={() => navigate('/generator')}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
