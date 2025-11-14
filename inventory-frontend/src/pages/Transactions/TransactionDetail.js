import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/Loading';
import './TransactionDetails.css';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await transactionService.getById(id);
      setTransaction(response.data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction? This will reverse the stock changes.')) {
      try {
        await transactionService.delete(id);
        navigate('/transactions');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="transaction-details">
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={() => navigate('/transactions')}>
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="transaction-details">
        <div className="error-message">
          <p>Transaction not found</p>
          <Button onClick={() => navigate('/transactions')}>
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-details">
      <div className="details-header">
        <h1>Transaction Details</h1>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/transactions')}
          >
            Back
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
          <div className="transaction-header-info">
            <div>
              <h2>Transaction #{transaction._id?.slice(-8).toUpperCase()}</h2>
              <p className="transaction-date">
                {formatDate(transaction.date || transaction.createdAt)}
              </p>
            </div>
            <div className={`type-badge ${transaction.type}`}>
              {transaction.type === 'in' ? 'Stock In' : 'Stock Out'}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item highlight">
              <label>Product</label>
              <p className="product-name">
                {transaction.productId?.name || 'N/A'}
              </p>
              {transaction.productId?.sku && (
                <p className="product-sku">SKU: {transaction.productId.sku}</p>
              )}
            </div>

            <div className="detail-item highlight">
              <label>Quantity</label>
              <p className={`quantity ${transaction.type}`}>
                {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} units
              </p>
            </div>

            <div className="detail-item">
              <label>Performed By</label>
              <p>{transaction.userId?.username || 'N/A'}</p>
              {transaction.userId?.email && (
                <p className="user-email">{transaction.userId.email}</p>
              )}
            </div>

            <div className="detail-item">
              <label>Transaction Type</label>
              <p className="type-text">
                {transaction.type === 'in' ? 'Stock In (Addition)' : 'Stock Out (Removal)'}
              </p>
            </div>

            {transaction.notes && (
              <div className="detail-item full-width">
                <label>Notes</label>
                <div className="notes-box">
                  <p>{transaction.notes}</p>
                </div>
              </div>
            )}

            <div className="detail-item">
              <label>Transaction ID</label>
              <p className="transaction-id">{transaction._id}</p>
            </div>

            {transaction.createdAt && (
              <div className="detail-item">
                <label>Created At</label>
                <p>{formatDate(transaction.createdAt)}</p>
              </div>
            )}
          </div>
        </Card>

        {transaction.productId && (
          <Card className="actions-card" title="Related Actions">
            <div className="quick-actions">
              <Button
                variant="secondary"
                onClick={() => navigate(`/products/${transaction.productId._id}`)}
              >
                View Product Details
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/transactions?productId=${transaction.productId._id}`)}
              >
                View Product Transaction History
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/transactions/new?productId=${transaction.productId._id}`)}
              >
                New Transaction for This Product
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;