import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import './Dashboard.css'; // reuse hero styles

/**
 * Landing page – currently empty placeholder.
 * Feel free to add content later.
 */
const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <div className="hero-card">
        <h1 className="hero-title">PLC Question Generator</h1>
        <p className="hero-subtitle">
          Generate professional PLC‑style exam questions instantly with AI.
        </p>
        <button
          className="btn btn-hero px-5"
          onClick={() => navigate('/generator')}
        >
          Start Generating
        </button>
      </div>
    </div>
  );
};

export default Landing;
