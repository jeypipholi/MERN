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


import './App.css';
import ProductDetails from './pages/Products/ProductDetail';
import CategoryDetails from './pages/Categories/CategoryDetail';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
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

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/new"
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id/detail"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/new"
                element={
                  <ProtectedRoute>
                    <CategoryForm/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:id/edit"
                element={
                  <ProtectedRoute>
                    <CategoryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:id/detail"
                element={
                  <ProtectedRoute>
                    <CategoryDetail/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute>
                    <SupplierList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers/new"
                element={
                  <ProtectedRoute>
                    <SupplierForm/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers/:id/edit"
                element={
                  <ProtectedRoute>
                    <SupplierForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers/:id/detail"
                element={
                  <ProtectedRoute>
                    <SupplierDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/new"
                element={
                  <ProtectedRoute>
                    <TransactionForm/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/edit"
                element={
                  <ProtectedRoute>
                    <TransactionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id/detail"
                element={
                  <ProtectedRoute>
                    <TransactionDetail/>
                  </ProtectedRoute>
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