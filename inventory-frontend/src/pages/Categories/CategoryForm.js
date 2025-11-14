import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/Loading';
import './CategoryForm.css';

const CategoryForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoryService.getById(id);
      const category = response.data;
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    } catch (error) {
      setError('Error loading category');
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
        await categoryService.update(id, formData);
      } else {
        await categoryService.create(formData);
      }

      navigate('/categories');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form">
      <Card title={isEdit ? 'Edit Category' : 'Add New Category'}>
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/categories')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CategoryForm;