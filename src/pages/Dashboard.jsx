import { useState, useEffect } from 'react';
import { dashboardAPI, orderAPI, inventoryAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Layout from '../components/Layout';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, ordersRes] = await Promise.all([
        dashboardAPI.getOverview(),
        orderAPI.getAll({ limit: 10, sort: '-orderDate' })
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }

      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1><i className="fas fa-chart-line"></i> Sales Dashboard</h1>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#22c55e'}}>
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-details">
              <div className="stat-label">Today's Sales</div>
              <div className="stat-value">{formatCurrency(overview?.todaySales || 0)}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: '#3b82f6'}}>
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-details">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{overview?.totalOrders || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: '#f59e0b'}}>
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-details">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{overview?.totalProducts || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: '#8b5cf6'}}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="stat-details">
              <div className="stat-label">Avg Order Value</div>
              <div className="stat-value">{formatCurrency(overview?.avgOrderValue || 0)}</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <i className="fas fa-receipt"></i>
                        <p>No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.items.length} items</td>
                      <td><strong>{formatCurrency(order.total)}</strong></td>
                      <td><span className="badge badge-info">{order.paymentMethod}</span></td>
                      <td><span className="badge badge-success">{order.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        {overview?.bestSellers && overview.bestSellers.length > 0 && (
          <div className="dashboard-section">
            <h2>Best Selling Products</h2>
            <div className="products-list">
              {overview.bestSellers.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-stats">Sold: {product.totalSold} units</div>
                  </div>
                  <div className="product-revenue">
                    {formatCurrency(product.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
