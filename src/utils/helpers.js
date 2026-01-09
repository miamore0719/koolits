// Helper utility functions

export const formatCurrency = (amount) => {
  return `₱${parseFloat(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryIcon = (category) => {
  const icons = {
    lemonade: '🍋',
    waffle: '🧇',
    fries: '🍟',
    'soft-ice-cream': '🍦',
    others: '🍴'
  };
  return icons[category] || '📦';
};

export const getCategoryColor = (category) => {
  const colors = {
    lemonade: '#fbbf24',
    waffle: '#f97316',
    fries: '#ef4444',
    'soft-ice-cream': '#8b5cf6',
    others: '#6b7280'
  };
  return colors[category] || '#6b7280';
};

export const getStatusColor = (status) => {
  const colors = {
    active: '#22c55e',
    inactive: '#ef4444',
    completed: '#22c55e',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    preparing: '#3b82f6',
    'in-stock': '#22c55e',
    'low-stock': '#f59e0b',
    'out-of-stock': '#ef4444'
  };
  return colors[status] || '#6b7280';
};

export const calculateCartTotal = (cart) => {
  return cart.reduce((total, item) => total + item.subtotal, 0);
};

export const calculateTax = (subtotal, taxRate = 0) => {
  return subtotal * (taxRate / 100);
};

export const calculateDiscount = (subtotal, discountPercent = 0) => {
  return subtotal * (discountPercent / 100);
};

export const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.getFullYear() + 
                 String(date.getMonth() + 1).padStart(2, '0') + 
                 String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }
};

export const printReceipt = (order) => {
  const printWindow = window.open('', '', 'width=300,height=600');
  
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt #${order.orderNumber || order._id?.slice(-6)}</title>
      <style>
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        body {
          width: 58mm;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.4;
          padding: 5mm;
          margin: 0;
          color: #000;
        }
        
        .center {
          text-align: center;
        }
        
        .bold {
          font-weight: bold;
        }
        
        .large {
          font-size: 14px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        
        .store-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .store-info {
          font-size: 9px;
          line-height: 1.3;
        }
        
        .section {
          margin: 10px 0;
        }
        
        .divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        
        .double-divider {
          border-top: 1px solid #000;
          margin: 8px 0;
        }
        
        .row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        
        .item-row {
          margin: 5px 0;
        }
        
        .item-name {
          font-weight: bold;
        }
        
        .item-details {
          font-size: 9px;
          margin-left: 5px;
          color: #333;
        }
        
        .totals {
          margin-top: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .grand-total {
          font-size: 14px;
          font-weight: bold;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 5px 0;
          margin: 8px 0;
        }
        
        .payment-info {
          margin: 10px 0;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 9px;
          padding-top: 10px;
          border-top: 1px dashed #000;
        }
        
        .no-print {
          display: none;
        }
        
        @media screen {
          body {
            background: #f0f0f0;
            padding: 20px;
          }
          
          .no-print {
            display: block;
            text-align: center;
            margin: 20px 0;
          }
          
          .print-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
          }
          
          .print-btn:hover {
            background: #45a049;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
      </div>
      
      <div class="header">
        <div class="store-name">YOUR STORE NAME</div>
        <div class="store-info">
          123 Main Street<br>
          City, State 12345<br>
          Tel: (123) 456-7890
        </div>
      </div>
      
      <div class="section center">
        <div class="bold">ORDER #${order.orderNumber || order._id?.slice(-6)}</div>
        <div style="font-size: 9px;">
          ${new Date(order.orderDate || order.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        ${order.cashier ? `<div style="font-size: 9px;">Cashier: ${order.cashier}</div>` : ''}
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        ${order.items.map(item => `
          <div class="item-row">
            <div class="row">
              <span class="item-name">${item.name}</span>
              <span class="bold">${formatCurrency(item.subtotal)}</span>
            </div>
            <div class="item-details">
              ${item.flavor ? `${item.flavor} / ` : ''}${item.size} x ${item.quantity} @ ${formatCurrency(item.price)}
            </div>
            ${item.toppings && item.toppings.length > 0 ? `
              <div class="item-details">
                + ${item.toppings.map(t => t.name).join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="double-divider"></div>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(order.subtotal)}</span>
        </div>
        ${order.discount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-${formatCurrency(order.discount)}</span>
          </div>
        ` : ''}
        ${order.tax > 0 ? `
          <div class="total-row">
            <span>Tax:</span>
            <span>${formatCurrency(order.tax)}</span>
          </div>
        ` : ''}
        
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <div class="row">
          <span>Payment Method:</span>
          <span class="bold">${order.paymentMethod.toUpperCase()}</span>
        </div>
        ${order.paymentMethod === 'cash' ? `
          <div class="row">
            <span>Amount Paid:</span>
            <span>${formatCurrency(order.amountPaid)}</span>
          </div>
          <div class="row bold">
            <span>Change:</span>
            <span>${formatCurrency(order.change)}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <div class="bold" style="margin-bottom: 5px;">THANK YOU!</div>
        <div>Please come again</div>
        <div style="margin-top: 8px;">---</div>
      </div>
      
      <script>
        // Auto-print when loaded
        window.onload = function() {
          // Small delay to ensure content is rendered
          setTimeout(() => {
            window.print();
          }, 250);
        };
        
        // Close window after printing
        window.onafterprint = function() {
          setTimeout(() => {
            window.close();
          }, 100);
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};

// Helper function for currency formatting (if not already in your utils)


export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};
