import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../assets/Layout.css';
import { supabase } from '../lib/supabaseClient';
import { Offcanvas } from 'bootstrap';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const offcanvasRef = useRef(null);
  const offcanvasInstance = useRef(null);

  useEffect(() => {
    // Initialize Bootstrap Offcanvas
    if (offcanvasRef.current) {
      offcanvasInstance.current = new Offcanvas(offcanvasRef.current);
    }
  }, []);

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

  const closeOffcanvas = () => {
    if (offcanvasInstance.current) {
      offcanvasInstance.current.hide();
    }
  };

  const toggleOffcanvas = () => {
    if (offcanvasInstance.current) {
      offcanvasInstance.current.toggle();
    } else if (offcanvasRef.current) {
      offcanvasInstance.current = new Offcanvas(offcanvasRef.current);
      offcanvasInstance.current.toggle();
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getThemeClass = () => {
    if (location.pathname === '/generator') return 'theme-green';
    return '';
  };

  const NavLinks = ({ isMobile = false }) => (
    <>
      <li className="nav-item">
        <Link
          to="/"
          className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2' : 'px-3'} ${isActive('/') ? 'btn-glass-active' : ''}`}
          onClick={isMobile ? closeOffcanvas : undefined}
        >
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="/generator"
          className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2' : 'px-3'} ${isActive('/generator') ? 'btn-glass-active' : ''}`}
          onClick={isMobile ? closeOffcanvas : undefined}
        >
          Question Generator
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="/saved"
          className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2' : 'px-3'} ${isActive('/saved') ? 'btn-glass-active' : ''}`}
          onClick={isMobile ? closeOffcanvas : undefined}
        >
          Saved
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="/settings"
          className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2' : 'px-3'} ${isActive('/settings') ? 'btn-glass-active' : ''}`}
          onClick={isMobile ? closeOffcanvas : undefined}
        >
          Settings
        </Link>
      </li>
      <li className={`nav-item ${isMobile ? 'mt-4' : 'ms-lg-3'}`}>
        {user ? (
          <button
            onClick={() => {
              if (isMobile) closeOffcanvas();
              handleLogout();
            }}
            className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2 text-danger' : 'px-3 text-danger'}`}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/auth"
            className={`btn btn-glass ${isMobile ? 'w-100 text-start px-3 py-2' : 'px-3'} ${isActive('/auth') ? 'btn-glass-active' : ''}`}
            onClick={isMobile ? closeOffcanvas : undefined}
          >
            Login
          </Link>
        )}
      </li>
    </>
  );
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

          <button className="navbar-toggler" type="button" onClick={toggleOffcanvas} aria-controls="offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop Navigation - only visible on lg+ */}
          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
            <ul className="navbar-nav gap-3 align-items-center">
              <NavLinks isMobile={false} />
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Offcanvas (Outside nav to avoid backdrop-filter containing block issue) */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        ref={offcanvasRef}
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title brand-logo" id="offcanvasNavbarLabel">PLC Question Generator</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav gap-3">
            <NavLinks isMobile={true} />
          </ul>
        </div>
      </div>

      {/* Page Content */}
      <div className="container-fluid p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
