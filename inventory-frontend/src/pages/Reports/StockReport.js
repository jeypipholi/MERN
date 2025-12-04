import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Reports.css';

const StockReport = () => {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await reportService.getStockReport();
      setStock(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="reports-page">
      <h2>Stock Report</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16}}>
        <Card title="Low Stock">
          {loading && <p>Loading...</p>}
          {!loading && stock && (
            <div>
              {stock.lowStock.map(p => (
                <div key={p._id} style={{padding:8, borderBottom:'1px solid #eee'}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <div style={{fontSize:12,color:'#6b7280'}}>SKU: {p.sku}</div>
                  <div>Qty: {p.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Out Of Stock">
          {loading && <p>Loading...</p>}
          {!loading && stock && (
            <div>
              {stock.outOfStock.map(p => (
                <div key={p._id} style={{padding:8, borderBottom:'1px solid #eee'}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <div style={{fontSize:12,color:'#6b7280'}}>SKU: {p.sku}</div>
                  <div>Qty: {p.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StockReport;
