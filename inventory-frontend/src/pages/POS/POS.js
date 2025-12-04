import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { posService } from '../../services/posService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/Loading';
import './POS.css';

const POS = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Payment method is always cash
  const paymentMethod = "cash";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);

        const uniqueCategories = [...new Set(response.data.map(p => p.category))].filter(Boolean);
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity === 0) {
      setError('Product out of stock');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      if (existingItem.cartQty < product.quantity) {
        setCart(cart.map(item =>
          item._id === product._id
            ? { ...item, cartQty: item.cartQty + 1 }
            : item
        ));
      } else {
        setError(`Only ${product.quantity} items available`);
        setTimeout(() => setError(''), 3000);
      }
    } else {
      setCart([...cart, { ...product, cartQty: 1 }]);
    }
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const product = cart.find(item => item._id === productId);
    if (newQty > product.quantity) {
      setError(`Only ${product.quantity} items available`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, cartQty: newQty }
        : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
    const tax = subtotal * 0.02;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      setLoading(true);

      const items = cart.map(item => ({
        productId: item._id,
        quantity: item.cartQty
      }));

      const response = await posService.checkout(items, paymentMethod);

      if (response.success) {
        setReceipt(response.data.receipt);
        setCart([]);
        setShowCheckout(false);
        fetchProducts();
      } else {
        setError(response.message || 'Checkout failed');
      }
    } catch (err) {
      setError('Checkout failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '', 'width=600,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Sales Receipt</h2>
          <p><strong>Cashier:</strong> ${receipt.cashier}</p>
          <p><strong>Date:</strong> ${new Date(receipt.date).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> CASH</p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items
                .map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td class="center">${item.quantity}</td>
                    <td>₱${item.unitPrice}</td>
                    <td>₱${item.itemTotal}</td>
                  </tr>
                `)
                .join('')}
            </tbody>
          </table>

          <h3>Total: ₱${receipt.total}</h3>

          <p class="center">Thank you for your purchase!</p>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
  };

  const { subtotal, tax, total } = calculateTotals();

  if (receipt) {
    return (
      <div className="receipt-view">
        <div className="receipt-container">
          <div className="receipt-header">
            <h2>Sales Receipt</h2>
            <button className="close-receipt" onClick={handleCloseReceipt}>✕</button>
          </div>

          <div className="receipt-content">
            <p><strong>Cashier:</strong> {receipt.cashier}</p>
            <p><strong>Date/Time:</strong> {new Date(receipt.date).toLocaleString()}</p>
            <p><strong>Payment:</strong> CASH</p>

            <table className="receipt-items">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>₱{item.unitPrice}</td>
                    <td>₱{item.itemTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-summary">
              <div className="summary-row"><span>Subtotal:</span> <span>₱{receipt.subtotal}</span></div>
              <div className="summary-row"><span>Tax (2%):</span> <span>₱{receipt.tax}</span></div>
              <div className="summary-row total"><span>TOTAL:</span> <span>₱{receipt.total}</span></div>
            </div>

            <div className="receipt-actions">
              <Button variant="primary" onClick={handlePrintReceipt}>Print Receipt</Button>
              <Button variant="secondary" onClick={handleCloseReceipt}>New Sale</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return <Loading message="Loading products..." />;
  }

  return (
    <div className="pos-container">
      <div className="pos-header">
        <p className="pos-user">Cashier: {user?.firstName} {user?.lastName}</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="pos-layout">
        <div className="products-section">
          <Card title="Products" className="products-card">
            <Input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search Products"
            />

            <div className="category-filters">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </button>

              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <p className="no-products">No products found</p>
              ) : (
                filteredProducts.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="product-sku">SKU: {product.sku}</p>
                      {product.category && (
                        <p className="product-category">{product.category}</p>
                      )}
                      <p className="product-price">₱{product.price.toFixed(2)}</p>
                      <p className={`product-stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        Stock: {product.quantity}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="cart-section-fixed">
          <Card title={`Shopping Cart (${cart.length})`} className="cart-card">
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-info">
                      <h5>{item.name}</h5>
                      <p className="item-sku">SKU: {item.sku}</p>
                      <p className="item-price">₱{item.price.toFixed(2)} each</p>
                    </div>

                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => handleUpdateQty(item._id, item.cartQty - 1)}>−</button>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={item.cartQty}
                        onChange={(e) => handleUpdateQty(item._id, parseInt(e.target.value) || 1)}
                        className="qty-input"
                      />
                      <button className="qty-btn" onClick={() => handleUpdateQty(item._id, item.cartQty + 1)}>+</button>
                    </div>

                    <div className="cart-item-total">₱{(item.price * item.cartQty).toFixed(2)}</div>

                    <button className="remove-btn" onClick={() => handleRemoveFromCart(item._id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (2%):</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>

                {!showCheckout ? (
                  <Button
                    variant="primary"
                    className="full-width"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div className="checkout-form">
                    <div className="checkout-buttons">
                      <Button variant="secondary" onClick={() => setShowCheckout(false)}>Back</Button>
                      <Button variant="primary" onClick={handleCheckout} disabled={loading}>
                        {loading ? 'Processing...' : 'Complete Sale (Cash)'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POS;
