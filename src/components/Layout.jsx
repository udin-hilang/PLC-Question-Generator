import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../assets/Layout.css';
import { supabase } from '../lib/supabaseClient';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!isScrolled && currentScrollY > 50) {
        setIsScrolled(true);
      } else if (isScrolled && currentScrollY < 10) {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [isScrolled]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getThemeClass = () => {
    if (location.pathname === '/generator') return 'theme-green';
    return '';
  };

  return (
    <div className={`main-content ${getThemeClass()}`}>
      <div className="global-grid-overlay"></div>
      {/* Top Header / Navbar */}
      <nav className={`navbar navbar-expand-lg navbar-light navbar-custom px-4 ${isScrolled ? 'scrolled' : 'unscrolled'}`}>
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <Link className="navbar-brand brand-logo-container" to="/">
            <div className="brand-logo">PLC Question Generator</div>
            <div className="brand-subtext">by udin_hilang</div>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto gap-2">
              <li className="nav-item">
                <Link to="/" className={`btn btn-sm px-3 btn-glass ${isActive('/') ? 'btn-glass-active' : ''}`}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/generator" className={`btn btn-sm px-3 btn-glass ${isActive('/generator') ? 'btn-glass-active' : ''}`}>
                  Question Generator
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/saved" className={`btn btn-sm px-3 btn-glass ${isActive('/saved') ? 'btn-glass-active' : ''}`}>
                  Saved
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className={`btn btn-sm px-3 btn-glass ${isActive('/settings') ? 'btn-glass-active' : ''}`}>
                  Settings
                </Link>
              </li>
              <li className="nav-item ms-lg-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm px-3 btn-glass text-danger"
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/auth" className={`btn btn-sm px-3 btn-glass ${isActive('/auth') ? 'btn-glass-active' : ''}`}>
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Sidebar (Offcanvas) */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title brand-logo" id="offcanvasNavbarLabel">PLC Question Generator</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav gap-3">
              <li className="nav-item">
                <Link to="/" className={`btn btn-glass w-100 text-start px-3 py-2 ${isActive('/') ? 'btn-glass-active' : ''}`} data-bs-dismiss="offcanvas">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/generator" className={`btn btn-glass w-100 text-start px-3 py-2 ${isActive('/generator') ? 'btn-glass-active' : ''}`} data-bs-dismiss="offcanvas">
                  Question Generator
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/saved" className={`btn btn-glass w-100 text-start px-3 py-2 ${isActive('/saved') ? 'btn-glass-active' : ''}`} data-bs-dismiss="offcanvas">
                  Saved
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className={`btn btn-glass w-100 text-start px-3 py-2 ${isActive('/settings') ? 'btn-glass-active' : ''}`} data-bs-dismiss="offcanvas">
                  Settings
                </Link>
              </li>
              <li className="nav-item mt-4">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); }}
                    className="btn btn-glass w-100 text-start px-3 py-2 text-danger"
                    data-bs-dismiss="offcanvas"
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/auth" className={`btn btn-glass w-100 text-start px-3 py-2 ${isActive('/auth') ? 'btn-glass-active' : ''}`} data-bs-dismiss="offcanvas">
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Page Content */}
      <div className="container-fluid p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
