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

export const printReceipt = (orderData) => {
  const printWindow = window.open('', '', 'height=600,width=400');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${orderData.orderNumber}</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; margin: 10px 0; }
          td { padding: 5px; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>KoolITs</h2>
          <p>Official Receipt</p>
        </div>
        <div class="line"></div>
        <p><strong>Order #:</strong> ${orderData.orderNumber}</p>
        <p><strong>Date:</strong> ${formatDateTime(orderData.orderDate)}</p>
        <p><strong>Cashier:</strong> ${orderData.cashier}</p>
        <div class="line"></div>
        <table>
          ${orderData.items.map(item => `
            <tr>
              <td>${item.quantity}x ${item.name} (${item.size})</td>
              <td class="right">${formatCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr>
            <td class="bold">Subtotal:</td>
            <td class="right bold">${formatCurrency(orderData.subtotal)}</td>
          </tr>
          ${orderData.discount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td class="right">-${formatCurrency(orderData.discount)}</td>
            </tr>
          ` : ''}
          ${orderData.tax > 0 ? `
            <tr>
              <td>Tax:</td>
              <td class="right">${formatCurrency(orderData.tax)}</td>
            </tr>
          ` : ''}
          <tr>
            <td class="bold">Total:</td>
            <td class="right bold">${formatCurrency(orderData.total)}</td>
          </tr>
          <tr>
            <td>Amount Paid:</td>
            <td class="right">${formatCurrency(orderData.amountPaid)}</td>
          </tr>
          <tr>
            <td>Change:</td>
            <td class="right">${formatCurrency(orderData.change)}</td>
          </tr>
        </table>
        <div class="line"></div>
        <div class="center">
          <p>Thank you for your purchase!</p>
          <p>Please come again!</p>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

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
