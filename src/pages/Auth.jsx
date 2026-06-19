import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../pages/Generator.css';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your email for the confirmation link!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/saved');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="col-lg-5">
          <div className="config-card text-center">
            <h2 className="mb-4 text-white">Welcome Back</h2>
            <p className="text-white-50 mb-4">Login to access your global saved questions</p>
            
            <form onSubmit={handleLogin} className="mb-4">
              <div className="form-group-custom text-start">
                <label className="form-label-custom">Email</label>
                <input
                  type="email"
                  className="form-control-custom"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-custom text-start mb-4">
                <label className="form-label-custom">Password</label>
                <input
                  type="password"
                  className="form-control-custom"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-generate w-100" disabled={loading}>
                {loading ? 'Processing...' : 'Login'}
              </button>
            </form>

            <div className="divider my-4">
              <span className="bg-dark px-3 text-white-50">OR</span>
            </div>

            <button 
              className="btn btn-outline-light w-100" 
              onClick={(e) => {
                e.preventDefault();
                handleSignUp(e);
              }}
              disabled={loading}
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
