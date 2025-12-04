import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Loading from './components/Loading';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryList from './pages/Categories/CategoryList';
import CategoryForm from './pages/Categories/CategoryForm';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierForm from './pages/Suppliers/SupplierForm';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import TransactionList from './pages/Transactions/TransactionList';
import TransactionForm from './pages/Transactions/TransactionForm';
import ProductDetail from './pages/Products/ProductDetail';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import CategoryDetail from './pages/Categories/CategoryDetail';
import POS from './pages/POS/POS';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role-Based Protected Route Component
const RoleProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasRole(requiredRoles)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirects based on role if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getRedirectPath } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* POS Route - User, Cashier, Admin */}
              <Route
                path="/pos"
                element={
                  <RoleProtectedRoute requiredRoles={['user', 'cashier', 'admin']}>
                    <POS />
                  </RoleProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <Dashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <ProductList />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/products/new"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <ProductForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/products/:id/edit"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <ProductForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/products/:id/detail"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <ProductDetail />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <CategoryList />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/categories/new"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <CategoryForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/categories/:id/edit"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <CategoryForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/categories/:id/detail"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <CategoryDetail />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <SupplierList />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/suppliers/new"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <SupplierForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/suppliers/:id/edit"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <SupplierForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/suppliers/:id/detail"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <SupplierDetail />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <TransactionList />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/transactions/new"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <TransactionForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/edit"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <TransactionForm />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/detail"
                element={
                  <RoleProtectedRoute requiredRoles={['admin']}>
                    <TransactionDetail />
                  </RoleProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;