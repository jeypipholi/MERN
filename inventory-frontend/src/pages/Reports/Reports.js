import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Reports.css';

const Reports = () => {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDaily();
      setDaily(res.data);
    } catch (err) {
      setError('Failed to fetch daily report');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    try {
      setLoading(true);
      const d = new Date();
      const res = await reportService.getMonthly(d.getMonth() + 1, d.getFullYear());
      setMonthly(res.data);
    } catch (err) {
      setError('Failed to fetch monthly report');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await reportService.getInventoryStatus();
      setInventory(res.data);
    } catch (err) {
      setError('Failed to fetch inventory status');
    } finally {
      setLoading(false);
    }
  };

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await reportService.getStockReport();
      setStock(res.data);
    } catch (err) {
      setError('Failed to fetch stock report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    // If a specific tab is requested, only fetch that (others can be loaded on demand)
    if (tab === 'daily') {
      fetchDaily();
    } else if (tab === 'monthly') {
      fetchMonthly();
    } else if (tab === 'inventory') {
      fetchInventory();
    } else if (tab === 'stock') {
      fetchStock();
    } else {
      fetchDaily();
      fetchMonthly();
      fetchInventory();
      fetchStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="reports-page">
      <h2>Reports</h2>
      {error && <div className="error">{error}</div>}

      <div className="reports-grid">
        <Card title="Daily Sales">
          {loading && !daily ? (
            <p>Loading...</p>
          ) : daily ? (
            <div>
              <p><strong>Date:</strong> {daily.date}</p>
              <p><strong>Transactions:</strong> {daily.totalTransactions}</p>
              <p><strong>Items Sold:</strong> {daily.totalItems}</p>
              <p><strong>Subtotal:</strong> ₱{daily.subtotal}</p>
              <p><strong>Tax:</strong> ₱{daily.tax}</p>
              <p><strong>Total:</strong> ₱{daily.total}</p>
            </div>
          ) : <p>No data</p>}
          <div className="card-actions">
            <Button onClick={fetchDaily}>Refresh</Button>
          </div>
        </Card>

        <Card title="Monthly Sales">
          {loading && !monthly ? (
            <p>Loading...</p>
          ) : monthly ? (
            <div>
              <p><strong>Month:</strong> {monthly.month}/{monthly.year}</p>
              <p><strong>Sales:</strong> {monthly.totalSales}</p>
              <p><strong>Items:</strong> {monthly.totalItems}</p>
              <p><strong>Subtotal:</strong> ₱{monthly.subtotal}</p>
              <p><strong>Tax:</strong> ₱{monthly.tax}</p>
              <p><strong>Total:</strong> ₱{monthly.total}</p>
            </div>
          ) : <p>No data</p>}
          <div className="card-actions">
            <Button onClick={fetchMonthly}>Refresh</Button>
          </div>
        </Card>

        <Card title="Inventory Status">
          {loading && !inventory ? (
            <p>Loading...</p>
          ) : inventory ? (
            <div>
              <p><strong>Total Products:</strong> {inventory.count}</p>
              <div className="inventory-list">
                {inventory.products.slice(0, 10).map(p => (
                  <div key={p._id} className="inv-row">
                    <span>{p.name} ({p.sku})</span>
                    <span>Qty: {p.quantity}</span>
                  </div>
                ))}
                {inventory.products.length > 10 && <p>Showing first 10 products...</p>}
              </div>
            </div>
          ) : <p>No data</p>}
          <div className="card-actions">
            <Button onClick={fetchInventory}>Refresh</Button>
          </div>
        </Card>

        <Card title="Stock Report">
          {loading && !stock ? (
            <p>Loading...</p>
          ) : stock ? (
            <div>
              <p><strong>Low Stock:</strong> {stock.lowStockCount}</p>
              <p><strong>Out Of Stock:</strong> {stock.outOfStockCount}</p>
              <div className="stock-list">
                <h4>Low Stock</h4>
                {stock.lowStock.slice(0,5).map(p => (
                  <div key={p._id} className="inv-row">
                    <span>{p.name} ({p.sku})</span>
                    <span>Qty: {p.quantity}</span>
                  </div>
                ))}
                <h4>Out Of Stock</h4>
                {stock.outOfStock.slice(0,5).map(p => (
                  <div key={p._id} className="inv-row">
                    <span>{p.name} ({p.sku})</span>
                    <span>Qty: {p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p>No data</p>}
          <div className="card-actions">
            <Button onClick={fetchStock}>Refresh</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
