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

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, prodRes] = await Promise.all([
        inventoryAPI.getAll(),
        productAPI.getAll({ status: 'active' })
      ]);

      if (invRes.data.success) setInventories(invRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductsUsingInventory = (inventoryId) => {
    const usedIn = [];

    products.forEach(product => {
      product.sizes?.forEach(size => {
        size.recipe?.forEach(ingredient => {
          if (ingredient.inventoryItemId === inventoryId) {
            usedIn.push(`${product.name} (${size.size})`);
          }
        });
      });
    });

    return usedIn;
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div style={{ padding: '30px', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>Only administrators can access inventory management.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="inventory-container">
        <h1>Inventory Management</h1>

        {loading ? (
          <p>Loading inventories...</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min</th>
                <th>Max</th>
                <th>Status</th>
                <th>Used In Products</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map(item => {
                const usedIn = getProductsUsingInventory(item._id);
                const lowStock = item.currentStock <= item.minStockLevel;

                return (
                  <tr key={item._id} className={lowStock ? 'low-stock' : ''}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.currentStock} {item.unit}</td>
                    <td>{item.minStockLevel}</td>
                    <td>{item.maxStockLevel}</td>
                    <td>{item.status}</td>
                    <td>
                      {usedIn.length > 0 ? (
                        <ul>
                          {usedIn.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      ) : (
                        <em>Not used</em>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default InventoryManagement;
