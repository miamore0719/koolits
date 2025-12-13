import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { inventoryAPI, productAPI } from '../services/api';
import { getUserInfo } from '../utils/auth';
import '../styles/Inventory.css';

const InventoryManagement = () => {
  const user = getUserInfo();
  const isAdmin = user?.role === 'admin';

  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, prodRes] = await Promise.all([
        inventoryAPI.getAll(),
        productAPI.getAll()
      ]);

      if (invRes.data.success) setInventories(invRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductsUsingInventory = (inventoryId) => {
    const used = [];

    products.forEach(p => {
      p.sizes?.forEach(s => {
        s.recipe?.forEach(r => {
          if (r.inventoryItemId === inventoryId) {
            used.push(`${p.name} (${s.size})`);
          }
        });
      });
    });

    return used;
  };

  const filteredInventories =
    category === 'all'
      ? inventories
      : inventories.filter(i => i.category === category);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="empty-state">
          <i className="fas fa-lock"></i>
          <p>Admin access only</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="inventory-container">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1>Inventory Management</h1>
            <p>Track and manage all inventory items</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-section">
          <select
            className="filter-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {[...new Set(inventories.map(i => i.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="inventory-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading inventory...</p>
            </div>
          ) : filteredInventories.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <p>No inventory items found</p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Used In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.map(item => {
                  const usedIn = getProductsUsingInventory(item._id);
                  const low = item.currentStock <= item.minStockLevel;

                  return (
                    <tr key={item._id}>
                      <td className="item-name">
                        <strong>{item.name}</strong>
                        <small>{item.unit}</small>
                      </td>

                      <td>
                        <span className="category-badge">{item.category}</span>
                      </td>

                      <td className="quantity-cell">
                        <strong>{item.currentStock}</strong>
                        <small>Min: {item.minStockLevel}</small>
                      </td>

                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: low ? '#fee2e2' : '#dcfce7',
                            color: low ? '#ef4444' : '#10b981'
                          }}
                        >
                          {low ? 'Low Stock' : 'OK'}
                        </span>
                      </td>

                      <td>
                        {usedIn.length > 0 ? usedIn.join(', ') : '—'}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-restock">
                            <i className="fas fa-plus"></i>
                          </button>
                          <button className="btn-icon btn-edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn-icon btn-delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default InventoryManagement;
