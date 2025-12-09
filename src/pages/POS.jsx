import { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import { getUserInfo } from '../utils/auth';
import { formatCurrency, getCategoryIcon, calculateCartTotal, printReceipt } from '../utils/helpers';
import Layout from '../components/Layout';
import '../styles/POS.css';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Orders view with date filtering
  const [showOrdersView, setShowOrdersView] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const user = getUserInfo();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({ status: 'active' });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async (useCustomDates = false) => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getAll({ limit: 100, sort: '-orderDate' });
      
      if (response.data.success) {
        let ordersToDisplay = response.data.data;
        
        if (useCustomDates && startDate && endDate) {
          // Filter by custom date range
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          
          ordersToDisplay = ordersToDisplay.filter(order => {
            const orderDate = new Date(order.orderDate || order.createdAt);
            return orderDate >= start && orderDate <= end;
          });
        } else {
          // Default: Show only today's latest 5 orders
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          
          ordersToDisplay = ordersToDisplay.filter(order => {
            const orderDate = new Date(order.orderDate || order.createdAt);
            return orderDate >= today && orderDate <= todayEnd;
          });
          
          // Take only the latest 5
          ordersToDisplay = ordersToDisplay.slice(0, 5);
        }
        
        setRecentOrders(ordersToDisplay);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDateFilterApply = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date');
      return;
    }
    
    loadRecentOrders(true);
  };

  const handleDateFilterClear = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
    loadRecentOrders(false); // Load default (today's latest 5)
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.flavor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || null);
    setSelectedToppings([]);
    setQuantity(1);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedToppings([]);
    setQuantity(1);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleToppingToggle = (topping) => {
    if (selectedToppings.find(t => t.name === topping.name)) {
      setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const addToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const itemPrice = selectedSize.price + toppingsTotal;
    const subtotal = itemPrice * quantity;

    const cartItem = {
      productId: selectedProduct._id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      type: selectedProduct.type,
      flavor: selectedProduct.flavor,
      size: selectedSize.size,
      price: itemPrice,
      quantity: quantity,
      toppings: selectedToppings,
      subtotal: subtotal
    };

    setCart([...cart, cartItem]);
    closeProductModal();
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
    }
  };

  const cartTotal = calculateCartTotal(cart);

  const openPaymentModal = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setShowPaymentModal(true);
    setAmountPaid('');
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentMethod('cash');
    setAmountPaid('');
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return paid - cartTotal;
  };

  const processOrder = async () => {
    const paid = parseFloat(amountPaid) || 0;
    
    if (paymentMethod === 'cash' && paid < cartTotal) {
      alert('Insufficient payment amount');
      return;
    }

    setProcessingPayment(true);

    try {
      const orderData = {
        items: cart,
        subtotal: cartTotal,
        tax: 0,
        discount: 0,
        total: cartTotal,
        paymentMethod: paymentMethod,
        amountPaid: paid,
        change: paymentMethod === 'cash' ? calculateChange() : 0,
        cashier: user.fullName || user.username,
        status: 'completed'
      };

      const response = await orderAPI.create(orderData);

      if (response.data.success) {
        alert('Order completed successfully!');
        
        if (window.confirm('Print receipt?')) {
          printReceipt(response.data.data);
        }

        setCart([]);
        closePaymentModal();
        
        if (showOrdersView) {
          loadRecentOrders(showDateFilter);
        }
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  const toggleOrdersView = () => {
    if (!showOrdersView) {
      loadRecentOrders(false); // Load default view
    }
    setShowOrdersView(!showOrdersView);
  };

  const filteredProducts = filterProducts();

  return (
    <Layout>
      <div className="pos-container">
        {/* Left Side - Products */}
        <div className="products-section">
          <div className="search-filter-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="category-tabs">
            <button
              className={`category-tab ${currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('all')}
            >
              <i className="fas fa-th"></i> All
            </button>
            <button
              className={`category-tab ${currentCategory === 'lemonade' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('lemonade')}
            >
              🍋 Lemonade
            </button>
            <button
              className={`category-tab ${currentCategory === 'waffle' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('waffle')}
            >
              🧇 Waffle
            </button>
            <button
              className={`category-tab ${currentCategory === 'fries' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('fries')}
            >
              🍟 Fries
            </button>
            <button
              className={`category-tab ${currentCategory === 'soft-ice-cream' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('soft-ice-cream')}
            >
              🍦 Ice Cream
            </button>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => openProductModal(product)}
                >
                  <div className="product-icon">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    {product.flavor && (
                      <div className="product-flavor">{product.flavor} Flavor</div>
                    )}
                  </div>
                  <div className="product-price">
                    {product.sizes.length > 1 && 'From '}
                    {formatCurrency(product.sizes[0]?.price || 0)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Cart and Checkout */}
        <div className="cart-section">
          <div className="cart-header">
            <h2>
              <i className="fas fa-shopping-cart"></i> Current Order
            </h2>
            <button
              className="btn btn-info btn-small"
              onClick={toggleOrdersView}
            >
              <i className="fas fa-history"></i> {showOrdersView ? 'Hide' : 'Show'} Orders
            </button>
          </div>

          {showOrdersView ? (
            <div className="orders-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>
                  {showDateFilter && startDate && endDate 
                    ? `Orders (${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()})`
                    : 'Latest 5 Orders Today'
                  }
                </h3>
                <button
                  className="btn btn-small"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  style={{ 
                    background: showDateFilter ? '#10b981' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  <i className="fas fa-calendar-alt"></i> {showDateFilter ? 'Hide' : 'Filter'}
                </button>
              </div>

              {showDateFilter && (
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#475569' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#475569' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDateFilterApply}
                      disabled={!startDate || !endDate}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: (!startDate || !endDate) ? 0.5 : 1
                      }}
                    >
                      <i className="fas fa-filter"></i> Apply
                    </button>
                    <button
                      onClick={handleDateFilterClear}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <i className="fas fa-times"></i> Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="orders-list" style={{ maxHeight: showDateFilter ? '400px' : '550px', overflowY: 'auto' }}>
                {loadingOrders ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-receipt"></i>
                    <p>No orders found</p>
                    <small>
                      {showDateFilter && startDate && endDate 
                        ? 'Try a different date range'
                        : 'No orders today yet'
                      }
                    </small>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="order-item">
                      <div className="order-header">
                        <strong>#{order.orderNumber || order._id?.slice(-6)}</strong>
                        <span className="badge badge-success">{order.status}</span>
                      </div>
                      <div className="order-details">
                        <small>
                          {new Date(order.orderDate || order.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                        <strong>{formatCurrency(order.total)}</strong>
                      </div>
                      <div className="order-items">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-detail">
                            {item.quantity}x {item.name} ({item.size})
                          </div>
                        ))}
                      </div>
                      {order.cashier && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                          Cashier: {order.cashier}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <i className="fas fa-shopping-cart"></i>
                    <p>Cart is empty</p>
                    <small>Add items to get started</small>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">
                          {item.name}
                          {item.flavor && ` - ${item.flavor}`}
                        </div>
                        <div className="cart-item-details">
                          Size: {item.size} | Qty: {item.quantity}
                        </div>
                        {item.toppings.length > 0 && (
                          <div className="cart-item-toppings">
                            Toppings: {item.toppings.map(t => t.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-item-price">
                          {formatCurrency(item.subtotal)}
                        </div>
                        <button
                          className="btn-remove"
                          onClick={() => removeFromCart(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
              </div>

              <div className="cart-actions">
                <button
                  className="btn btn-danger"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <i className="fas fa-trash"></i> Clear
                </button>
                <button
                  className="btn btn-success btn-large"
                  onClick={openPaymentModal}
                  disabled={cart.length === 0}
                >
                  <i className="fas fa-check-circle"></i> Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          selectedSize={selectedSize}
          selectedToppings={selectedToppings}
          quantity={quantity}
          onClose={closeProductModal}
          onSizeChange={handleSizeChange}
          onToppingToggle={handleToppingToggle}
          onQuantityChange={setQuantity}
          onAddToCart={addToCart}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          cartTotal={cartTotal}
          paymentMethod={paymentMethod}
          amountPaid={amountPaid}
          change={calculateChange()}
          processing={processingPayment}
          onClose={closePaymentModal}
          onPaymentMethodChange={setPaymentMethod}
          onAmountPaidChange={setAmountPaid}
          onProcessOrder={processOrder}
        />
      )}
    </Layout>
  );
};

// Product Modal and Payment Modal components remain the same
const ProductModal = ({
  product,
  selectedSize,
  selectedToppings,
  quantity,
  onClose,
  onSizeChange,
  onToppingToggle,
  onQuantityChange,
  onAddToCart
}) => {
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const itemPrice = (selectedSize?.price || 0) + toppingsTotal;
  const subtotal = itemPrice * quantity;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>{getCategoryIcon(product.category)}</span> {product.name}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {product.description && (
            <p style={{ marginBottom: '20px', color: '#64748b' }}>
              {product.description}
            </p>
          )}

          <div className="form-group">
            <label>Select Size *</label>
            <div className="size-options">
              {product.sizes.map((size, idx) => (
                <button
                  key={idx}
                  className={`size-btn ${selectedSize?.size === size.size ? 'active' : ''}`}
                  onClick={() => onSizeChange(size)}
                >
                  <div>{size.size}</div>
                  <div>{formatCurrency(size.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {product.toppings && product.toppings.length > 0 && (
            <div className="form-group">
              <label>Add Toppings (Optional)</label>
              <div className="toppings-list">
                {product.toppings.map((topping, idx) => (
                  <label key={idx} className="topping-item">
                    <input
                      type="checkbox"
                      checked={selectedToppings.some(t => t.name === topping.name)}
                      onChange={() => onToppingToggle(topping)}
                    />
                    <span>{topping.name}</span>
                    <span className="topping-price">+{formatCurrency(topping.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Quantity</label>
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
              <button
                className="qty-btn"
                onClick={() => onQuantityChange(quantity + 1)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Item Price:</span>
              <span>{formatCurrency(itemPrice)}</span>
            </div>
            <div className="price-row total">
              <span>Subtotal:</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onAddToCart}>
            <i className="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({
  cartTotal,
  paymentMethod,
  amountPaid,
  change,
  processing,
  onClose,
  onPaymentMethodChange,
  onAmountPaidChange,
  onProcessOrder
}) => {
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'fa-money-bill-wave' },
    { id: 'card', name: 'Card', icon: 'fa-credit-card' },
    { id: 'gcash', name: 'GCash', icon: 'fa-mobile-alt' },
    { id: 'paymaya', name: 'PayMaya', icon: 'fa-mobile-alt' }
  ];

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-cash-register"></i> Payment
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="payment-total">
            <h3>Total Amount</h3>
            <div className="total-amount">{formatCurrency(cartTotal)}</div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => onPaymentMethodChange(method.id)}
                >
                  <i className={`fas ${method.icon}`}></i>
                  <span>{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="form-group">
              <label>Amount Paid</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => onAmountPaidChange(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                autoFocus
              />
              {change >= 0 && amountPaid && (
                <div className="change-display">
                  Change: {formatCurrency(change)}
                </div>
              )}
              {change < 0 && amountPaid && (
                <div className="insufficient-payment">
                  Insufficient: {formatCurrency(Math.abs(change))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={onProcessOrder}
            disabled={processing || (paymentMethod === 'cash' && change < 0)}
          >
            {processing ? (
              <>
                <div className="loading"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Complete Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;