import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import { categoryService } from '../../services/categoryService';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryList.css';

function CatgoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
      }, []);

    const fetchCategories = async () => {
        try {
          const response = await categoryService.getAll({ search: searchTerm });
          setCategories(response.data || []);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
          try {
            await categoryService.delete(id);
            fetchCategories();
          } catch (error) {
            alert('Error deleting product');
          }
        }
      };

    if (loading) {
    return <Loading />;
  }
  
  return (
    <div className='category-list'>
      <div className='page-header'>
        <h1>Categories</h1>
        <Button onClick={() => navigate('/categories/new')}>
          Add New Category
        </Button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchCategories()}
        />
        <Button onClick={fetchCategories}>Search</Button>
      </div>

      <div className="category-grid">
        {categories.map((categories) => (
          <Card key={categories._id} className="category-card">
            <h3>{categories.name}</h3>
            <p className="category-description">{categories.description}</p>
            <div className="product-actions">
              <Button
                variant="secondary"
                onClick={() => navigate(`/categories/${categories._id}/detail`)}
              >
                View
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/categories/${categories._id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(categories._id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="no-data">No Categories found</p>
      )}

    </div>
  )
}

export default CatgoryList;
