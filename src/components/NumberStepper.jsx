import React from 'react';

const NumberStepper = ({ label, value, onChange, name }) => {
  const increment = () => onChange(Number(value) + 1);
  const decrement = () => {
    if (value > 0) onChange(Number(value) - 1);
  };

  return (
    <div className="form-group-custom">
      <label className="form-label-custom">{label}</label>
      <div className="stepper-container">
        <button 
          type="button" 
          className="stepper-btn" 
          onClick={decrement}
          aria-label="Decrease"
        >
          <span className="stepper-icon">−</span>
        </button>
        <input 
          type="number" 
          className="stepper-input" 
          name={name}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        />
        <button 
          type="button" 
          className="stepper-btn" 
          onClick={increment}
          aria-label="Increase"
        >
          <span className="stepper-icon">+</span>
        </button>
      </div>
    </div>
  );
};

export default NumberStepper;
