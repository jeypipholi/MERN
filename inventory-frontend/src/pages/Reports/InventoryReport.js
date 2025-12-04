import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Reports.css';

const InventoryReport = () => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await reportService.getInventoryStatus();
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="reports-page">
      <h2>Inventory Status</h2>
      <Card>
        {loading && <p>Loading...</p>}
        {!loading && inventory && (
          <div>
            <p><strong>Total Products:</strong> {inventory.count}</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10}}>
              {inventory.products.map(p => (
                <div key={p._id} style={{padding:10, borderRadius:6, background:'#fff'}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <div style={{fontSize:12,color:'#6b7280'}}>SKU: {p.sku}</div>
                  <div style={{marginTop:6}}>Qty: {p.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryReport;
