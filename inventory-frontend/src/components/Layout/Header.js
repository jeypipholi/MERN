import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine what title to show
  const getTitle = () => {
    if (!isAuthenticated) return "Inventory System";

    if (hasRole("admin")) return "Inventory System";
    if (hasRole(["user", "cashier"])) return "Point of Sale";

    return "Inventory System"; // fallback
  };

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('click', handleDocClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen(prev => !prev);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          {getTitle()}
        </Link>

        <nav className="nav">
          {isAuthenticated ? (
            <>
              {/* Admin Navigation */}
              {hasRole('admin') && (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/products">Products</Link>
                  <Link to="/categories">Categories</Link>
                  <Link to="/suppliers">Suppliers</Link>
                  <Link to="/transactions">Transactions</Link>

                  <div className={`nav-dropdown ${open ? 'open' : ''}`} ref={dropdownRef}>
                    <button className="dropdown-toggle" onClick={toggleDropdown} aria-expanded={open} aria-haspopup="menu">
                      Reports ▾
                    </button>
                    <div className="dropdown-menu" role="menu">
                      <Link to="/reports/sales" onClick={() => setOpen(false)}>Sales</Link>
                      <Link to="/reports/inventory" onClick={() => setOpen(false)}>Inventory Status</Link>
                      <Link to="/reports/stock" onClick={() => setOpen(false)}>Stock Report</Link>
                    </div>
                  </div>
                </>
              )}

              {/* User or Cashier Navigation */}
              {hasRole(['user', 'cashier']) && (
                <>
                  <Link to="/pos">POS</Link>
                </>
              )}

              <div className="user-info">
                <span>Welcome, {user?.firstName} ({user?.role})</span>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
