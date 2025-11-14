import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import './CategoryDetails.css';

const CategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      const categoryResponse = await categoryService.getById(id);
      setCategory(categoryResponse.data);

      // Fetch products in this category
      const productsResponse = await productService.getAll({ category: categoryResponse.data.name });
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (products.length > 0) {
      alert(`Cannot delete category with ${products.length} product(s). Please reassign or delete the products first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.delete(id);
        navigate('/categories');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const calculateTotalValue = () => {
    return products.reduce((total, product) => {
      return total + (product.price || 0) * (product.quantity || 0);
    }, 0);
  };

  const calculateTotalStock = () => {
    return products.reduce((total, product) => {
      return total + (product.quantity || 0);
    }, 0);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="category-details">
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={() => navigate('/categories')}>
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-details">
        <div className="error-message">
          <p>Category not found</p>
          <Button onClick={() => navigate('/categories')}>
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-details">
      <div className="details-header">
        <h1>Category Details</h1>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/categories')}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/categories/${id}/edit`)}
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
          <div className="category-header-info">
            <div>
              <h2>{category.name}</h2>
              <p className="product-count">{products.length} product(s)</p>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item full-width">
              <label>Description</label>
              <p>{category.description || 'No description available'}</p>
            </div>

            <div className="detail-item highlight">
              <label>Total Products</label>
              <p className="stat-number">{products.length}</p>
            </div>

            <div className="detail-item highlight">
              <label>Total Stock Units</label>
              <p className="stat-number">{calculateTotalStock()}</p>
            </div>

            <div className="detail-item highlight full-width-mobile">
              <label>Total Inventory Value</label>
              <p className="stat-value">${calculateTotalValue().toFixed(2)}</p>
            </div>

            {category.createdAt && (
              <div className="detail-item">
                <label>Created At</label>
                <p>{new Date(category.createdAt).toLocaleDateString()}</p>
              </div>
            )}

            {category.updatedAt && (
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{new Date(category.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="products-card" title={`Products in ${category.name}`}>
          {products.length > 0 ? (
            <div className="products-list">
              {products.map((product) => (
                <div key={product._id} className="product-item">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-sku">SKU: {product.sku}</p>
                  </div>
                  <div className="product-stats">
                    <span className="price">${product.price?.toFixed(2)}</span>
                    <span className="stock">Stock: {product.quantity}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate(`/products/${product._id}/detail`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products in this category yet.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/products/new')}
              >
                Add First Product
              </Button>
            </div>
          )}
        </Card>

        <Card className="actions-card" title="Quick Actions">
          <div className="quick-actions">
            <Button
              variant="primary"
              onClick={() => navigate(`/products/new?category=${category.name}`)}
            >
              Add Product to Category
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/products?category=${category.name}`)}
            >
              View All Products in Category
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDetails;