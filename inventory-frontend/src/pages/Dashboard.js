import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import { reportService } from '../services/reportService';
import Card from '../components/common/Card';
import Loading from '../components/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalTransactions: 0
  });
  const [salesStats, setSalesStats] = useState({
    today: { subtotal: '0.00', total: '0.00', count: 0 },
    month: { subtotal: '0.00', total: '0.00', count: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, transactionsRes, dailySalesRes, monthlySalesRes, stockRes] = await Promise.all([
        productService.getAll(),
        transactionService.getAll({ limit: 1 }),
        reportService.getSales('daily'),
        reportService.getSales('monthly'),
        reportService.getStockReport()
      ]);

      const products = productsRes.data || [];
      const lowStock = products.filter(p => p.quantity < 10).length;
      const outOfStock = (stockRes.data && stockRes.data.outOfStockCount) || 0;

      setStats({
        totalProducts: products.length,
        lowStock,
        outOfStock,
        totalTransactions: transactionsRes.total || 0
      });

      setSalesStats({
        today: dailySalesRes.data || { subtotal: '0.00', total: '0.00', count: 0 },
        month: monthlySalesRes.data || { subtotal: '0.00', total: '0.00', count: 0 }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.firstName}!</h1>
      
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </Card>

        <Card className="stat-card warning">
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">Low Stock Items</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-value">{stats.totalTransactions}</div>
          <div className="stat-label">Total Transactions</div>
        </Card>
        
        <Card className="stat-card highlight">
          <div className="stat-value">₱{Number(salesStats.today.subtotal || 0).toLocaleString()}</div>
          <div className="stat-label">Today's Sales (Subtotal)</div>
        </Card>

        <Card className="stat-card highlight">
          <div className="stat-value">₱{Number(salesStats.month.subtotal || 0).toLocaleString()}</div>
          <div className="stat-label">This Month (Subtotal)</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-value">{stats.outOfStock ?? 0}</div>
          <div className="stat-label">Out of Stock</div>
        </Card>
      </div>

    
    </div>
  );
};

export default Dashboard;