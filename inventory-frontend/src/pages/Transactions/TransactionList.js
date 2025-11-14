import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import { transactionService } from '../../services/transactionService';
import './TransactionList.css';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.type]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await transactionService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type,
        search: filters.searchTerm
      });
      setTransactions(response.data || []);
      setPagination({
        ...pagination,
        total: response.total,
        pages: response.pages
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This will reverse the stock changes.')) {
      try {
        await transactionService.delete(id);
        setTransactions(transactions.filter(transaction => transaction._id !== id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchTransactions();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading && transactions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="transaction-list">
      <div className="page-header">
        <h1>Transactions</h1>
        <Button onClick={() => navigate('/transactions/new')}>
          New Transaction
        </Button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            name="searchTerm"
            placeholder="Search transactions..."
            value={filters.searchTerm}
            onChange={handleFilterChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="filter-group">
          <label>Filter by Type:</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>
      </div>

      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>User</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="date-cell">
                  {formatDate(transaction.date || transaction.createdAt)}
                </td>
                <td>
                  <div className="product-info">
                    <strong>{transaction.productId?.name || 'N/A'}</strong>
                    <span className="sku">{transaction.productId?.sku}</span>
                  </div>
                </td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type === 'in' ? 'Stock In' : 'Stock Out'}
                  </span>
                </td>
                <td className={`quantity ${transaction.type}`}>
                  {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                </td>
                <td>{transaction.userId?.username || 'N/A'}</td>
                <td className="notes-cell">{transaction.notes || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/transactions/${transaction._id}/detail`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && transactions.length === 0 && (
        <div className="no-data">
          <p>No transactions found</p>
          {(filters.searchTerm || filters.type) && (
            <Button 
              variant="secondary" 
              onClick={() => {
                setFilters({ type: '', searchTerm: '' });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransactionList;