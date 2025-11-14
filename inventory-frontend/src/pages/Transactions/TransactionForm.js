import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { productService } from '../../services/productService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/Loading';
import './TransactionForm.css';

const TransactionForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productId: '',
    type: '',
    quantity: '',
    notes: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // Update selected product when productId changes
    if (name === 'productId') {
      const product = products.find(p => p._id === value);
      setSelectedProduct(product);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      await transactionService.create(data);
      navigate('/transactions');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <Card title="New Transaction">
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>
              Product <span className="required">*</span>
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="select-input"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.sku} (Stock: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="product-info">
              <p><strong>Current Stock:</strong> {selectedProduct.quantity}</p>
              <p><strong>Price:</strong> ${selectedProduct.price}</p>
            </div>
          )}

          <div className="input-group">
            <label>
              Transaction Type <span className="required">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="select-input"
              required
            >
              <option value="">Select type</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />

          <div className="input-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="textarea-input"
              rows="4"
              placeholder="Add notes about this transaction..."
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/transactions')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TransactionForm;