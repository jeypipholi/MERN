import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import { supplierService } from '../../services/supplierService';
import './SupplierList.css';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await supplierService.getAll({ search: searchTerm });
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.delete(id);
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier. Please try again.');
      }
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      fetchSuppliers();
    }
  };

  if (loading && suppliers.length === 0) {
    return <Loading />;
  }

  return (
    <div className="supplier-list">
      <div className="page-header">
        <h1>Suppliers</h1>
        <Button onClick={() => navigate('/suppliers/new')}>
          Add New Supplier
        </Button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="supplier-grid">
        {suppliers.map((supplier) => (
          <Card key={supplier._id} className="supplier-card">
            <h3>{supplier.name}</h3>
            <div className="supplier-info">
              {supplier.email && (
                <p className="supplier-email">
                  <strong>Email:</strong> {supplier.email}
                </p>
              )}
              {supplier.phone && (
                <p className="supplier-phone">
                  <strong>Phone:</strong> {supplier.phone}
                </p>
              )}
              {supplier.address && (
                <p className="supplier-address">
                  <strong>Address:</strong> {supplier.address}
                  {supplier.city && `, ${supplier.city}`}
                  {supplier.country && `, ${supplier.country}`}
                </p>
              )}
            </div>
            <div className="supplier-actions">
              <Button
                variant="secondary"
                onClick={() => navigate(`/suppliers/${supplier._id}/detail`)}
              >
                View
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/suppliers/${supplier._id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(supplier._id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && suppliers.length === 0 && (
        <div className="no-data">
          <p>No Suppliers found</p>
          {searchTerm && (
            <Button 
              variant="secondary" 
              onClick={() => {
                setSearchTerm('');
                fetchSuppliers();
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplierList;