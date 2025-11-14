import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService } from '../../services/supplierService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import './SupplierDetail.css';

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupplier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const response = await supplierService.getById(id);
      setSupplier(response.data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      setError('Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.delete(id);
        navigate('/suppliers');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier. Please try again.');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="supplier-details">
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={() => navigate('/suppliers')}>
            Back to Suppliers
          </Button>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="supplier-details">
        <div className="error-message">
          <p>Supplier not found</p>
          <Button onClick={() => navigate('/suppliers')}>
            Back to Suppliers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-details">
      <div className="details-header">
        <h1>Supplier Details</h1>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/suppliers')}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/suppliers/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="details-card">
        <div className="details-grid">
          <div className="detail-item">
            <label>Company Name</label>
            <p>{supplier.name}</p>
          </div>

          <div className="detail-item">
            <label>Email</label>
            <p className="email-link">
              {supplier.email ? (
                <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="detail-item">
            <label>Phone</label>
            <p className="phone-link">
              {supplier.phone ? (
                <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="detail-item full-width">
            <label>Address</label>
            <p>{supplier.address || 'N/A'}</p>
          </div>

          {supplier.createdAt && (
            <div className="detail-item">
              <label>Created At</label>
              <p>{new Date(supplier.createdAt).toLocaleDateString()}</p>
            </div>
          )}

          {supplier.updatedAt && (
            <div className="detail-item">
              <label>Last Updated</label>
              <p>{new Date(supplier.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SupplierDetails;