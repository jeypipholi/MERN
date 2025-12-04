import React from 'react';
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
