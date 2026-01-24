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
  const receipt = `
YOUR STORE NAME
------------------------------
Order #: ${order.orderNumber || order._id.slice(-6)}
Cashier: ${order.cashier || ''}

${new Date(order.orderDate || order.createdAt).toLocaleString()}

------------------------------
${order.items.map(item =>
  `${item.quantity}x ${item.name}
 ${item.size} @ ${formatCurrency(item.price)}
 ${item.toppings?.length ? '+ ' + item.toppings.map(t => t.name).join(', ') : ''}
 ${formatCurrency(item.subtotal)}
`).join('\n')}

------------------------------
TOTAL: ${formatCurrency(order.total)}
PAID:  ${formatCurrency(order.amountPaid)}
CHANGE:${formatCurrency(order.change)}

------------------------------
THANK YOU!
Please come again
\n\n\n
`;

  if (window.Android && window.Android.printReceipt) {
    window.Android.printReceipt(receipt);
  } else {
    alert('Printer not connected');
  }
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
