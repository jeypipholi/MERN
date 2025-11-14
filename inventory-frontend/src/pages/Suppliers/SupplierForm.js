import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService } from '../../services/supplierService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/Loading';
import './SupplierForm.css';

const SupplierForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchSupplier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getById(id);
      const supplier = response.data;
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
        postalCode: supplier.postalCode || ''
      });
    } catch (error) {
      setError('Error loading supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await supplierService.update(id, formData);
      } else {
        await supplierService.create(formData);
      }

      navigate('/suppliers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supplier-form">
      {loading ? (
        <Loading />
      ) : (
        <Card title={isEdit ? 'Edit Supplier' : 'Add New Supplier'}>
          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Company Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/suppliers')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SupplierForm;