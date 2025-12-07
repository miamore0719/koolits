import axios from 'axios';
import { getToken, logout } from '../utils/auth';

// Base API URL - can be overridden with environment variable
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-vert-delta-99.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized - logout user
      logout();
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  setup: (adminData) => api.post('/auth/setup', adminData),
  verify: () => api.get('/auth/verify'),
  getUsers: () => api.get('/auth/users'),
  createUser: (userData) => api.post('/auth/users', userData),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  resetPassword: (id, data) => api.post(`/auth/users/${id}/reset-password`, data),
};

// ==================== PRODUCT ENDPOINTS ====================

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  seedProducts: () => api.post('/seed-products'),
};

// ==================== ORDER ENDPOINTS ====================

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getDailySales: () => api.get('/reports/daily-sales'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
};

// ==================== INVENTORY ENDPOINTS ====================

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  getByProduct: (productId) => api.get(`/inventory/product/${productId}`),
  create: (itemData) => api.post('/inventory', itemData),
  update: (id, itemData) => api.put(`/inventory/${id}`, itemData),
  delete: (id) => api.delete(`/inventory/${id}`),
  restock: (id, data) => api.post(`/inventory/${id}/restock`, data),
  getMovements: (id) => api.get(`/inventory/${id}/movements`),
  getAlerts: () => api.get('/inventory/alerts/summary'),
};

// ==================== DASHBOARD ENDPOINTS ====================

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getSalesByDate: (params) => api.get('/dashboard/sales-by-date', { params }),
  getSalesTrends: () => api.get('/dashboard/sales-trends'),
};

// ==================== SALES ENDPOINTS ====================

export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => api.post('/sales', saleData),
};

export default api;
