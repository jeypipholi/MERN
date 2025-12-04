import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Sales.css';

const Sales = () => {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async (p = period) => {
    try {
      setLoading(true);
      const res = await reportService.getSales(p);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch('daily'); }, []);

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h2>Sales</h2>
        <div className="sales-filters">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <Button onClick={() => fetch(period)}>Apply</Button>
        </div>
      </div>

      <div className="sales-content">
        <Card>
          {loading && <p>Loading...</p>}
          {!loading && data && (
            <div className="sales-summary">
              <div className="summary-item"><strong>Period:</strong> {data.period}</div>
              <div className="summary-item"><strong>Sales Count:</strong> {data.count}</div>
              <div className="summary-item"><strong>Items Sold:</strong> {data.totalItems}</div>
              <div className="summary-item"><strong>Subtotal:</strong> ₱{data.subtotal}</div>
              <div className="summary-item"><strong>Tax:</strong> ₱{data.tax}</div>
              <div className="summary-item"><strong>Total:</strong> ₱{data.total}</div>
            </div>
          )}
        </Card>

        {data && data.sales && (
          <div className="sales-list">
            {data.sales.map(s => (
              <Card key={s._id} className="sale-card">
                <div className="sale-top">
                  <div><strong>Sale ID:</strong> {s._id}</div>
                  <div><strong>Cashier:</strong> {s.cashier ? `${s.cashier.firstName} ${s.cashier.lastName}` : 'N/A'}</div>
                </div>
                <div className="sale-items">
                  {s.items.map((it, i) => (
                    <div key={i} className="sale-item-row">
                      <div>{it.productName}</div>
                      <div>Qty: {it.quantity}</div>
                      <div>₱{Number(it.itemTotal).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
