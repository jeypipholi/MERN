import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import './ProductDetail.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (quantity < 10) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'In Stock', class: 'in-stock' };
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="product-details">
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details">
        <div className="error-message">
          <p>Product not found</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.quantity);

  return (
    <div className="product-details">
      <div className="details-header">
        <h1>Product Details</h1>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/products')}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/products/${id}/edit`)}
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

      <div className="details-content">
        <Card className="details-card">
          <div className="product-header-info">
            <div>
              <h2>{product.name}</h2>
              <p className="product-sku">SKU: {product.sku}</p>
            </div>
            <div className={`stock-badge ${stockStatus.class}`}>
              {stockStatus.text}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Price</label>
              <p className="price">${product.price?.toFixed(2)}</p>
            </div>

            <div className="detail-item">
              <label>Quantity</label>
              <p className={`quantity ${stockStatus.class}`}>
                {product.quantity} units
              </p>
            </div>

            <div className="detail-item">
              <label>Category</label>
              <p>{product.category || 'N/A'}</p>
            </div>

            <div className="detail-item">
              <label>Total Value</label>
              <p className="total-value">
                ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}
              </p>
            </div>

            <div className="detail-item full-width">
              <label>Description</label>
              <p>{product.description || 'No description available'}</p>
            </div>

            {product.createdAt && (
              <div className="detail-item">
                <label>Created At</label>
                <p>{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            )}

            {product.updatedAt && (
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="actions-card" title="Quick Actions">
          <div className="quick-actions">
            <Button
              variant="primary"
              onClick={() => navigate(`/transactions/new?productId=${id}`)}
            >
              Record Transaction
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/transactions?productId=${id}`)}
            >
              View Transaction History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;