import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [generatedCount, setGeneratedCount] = useState('0');

  useEffect(() => {
    const fetchTotalStats = async () => {
      // 1. Get local count
      const localCount = parseInt(localStorage.getItem('stats_questions_generated') || '0', 10);
      
      try {
        // 2. Check for authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 3. Get count from Supabase
          const { count, error } = await supabase
            .from('saved_questions')
            .select('*', { count: 'exact', head: true });

          if (error) throw error;

          // Sum local and cloud counts
          // Note: This may double-count questions that were generated locally and then saved,
          // but it ensures all cloud-saved questions from other devices are included.
          setGeneratedCount((localCount + (count || 0)).toString());
        } else {
          setGeneratedCount(localCount.toString());
        }
      } catch (error) {
        console.error('Error fetching Supabase stats:', error);
        setGeneratedCount(localCount.toString());
      }
    };

    fetchTotalStats();
  }, []);

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
              <div className="stat-value">{generatedCount}</div>
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
