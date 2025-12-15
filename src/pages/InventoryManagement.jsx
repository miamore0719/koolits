import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { inventoryAPI, productAPI } from '../services/api';
import { getUserInfo } from '../utils/auth';
import { formatCurrency } from '../utils/helpers';
import '../styles/Inventory.css';

const InventoryManagement = () => {
  const user = getUserInfo();
  const isAdmin = user?.role === 'admin';

  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    category: 'Supplies',
    currentStock: 0,
    minStockLevel: 10,
    maxStockLevel: 100,
    unit: 'pcs',
    costPrice: 0,
    sellingPrice: 0,
    status: 'in-stock',
    alertEnabled: true,
    notes: ''
  });
  
  const [restockData, setRestockData] = useState({
    quantity: 0,
    notes: ''
  });

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

      console.log('RAW Inventory Response:', invRes);
      console.log('RAW Products Response:', prodRes);

      // The custom getAll returns { success: true, data: [...] }
      if (invRes && invRes.success && Array.isArray(invRes.data)) {
        console.log('Setting inventories from custom getAll:', invRes.data);
        setInventories(invRes.data);
      } else {
        console.warn('Unexpected inventory response structure:', invRes);
        setInventories([]);
      }

      // Handle products response
      if (prodRes.data) {
        if (prodRes.data.success) {
          setProducts(prodRes.data.data || []);
        } else if (Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      console.error('Error details:', err.response);
      alert('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getProductsUsingInventory = (inventoryId) => {
    const used = [];

    products.forEach(p => {
      p.sizes?.forEach(s => {
        const ingredients = s.recipe || s.ingredients || [];
        ingredients.forEach(ing => {
          const itemId = ing.inventoryItemId || ing.inventoryItem;
          if (itemId === inventoryId) {
            used.push(`${p.name} (${s.size})`);
          }
        });
      });
    });

    return used;
  };

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return { text: 'Out of Stock', color: '#ef4444' };
    if (item.currentStock <= item.minStockLevel) return { text: 'Low Stock', color: '#f59e0b' };
    if (item.currentStock >= item.maxStockLevel) return { text: 'In Stock', color: '#10b981' };
    return { text: 'Normal', color: '#64748b' };
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Supplies',
      currentStock: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unit: 'pcs',
      costPrice: 0,
      sellingPrice: 0,
      status: 'in-stock',
      alertEnabled: true,
      notes: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unit: item.unit,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      status: item.status,
      alertEnabled: item.alertEnabled !== false,
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setRestockData({ quantity: 0, notes: '' });
    setShowRestockModal(true);
  };

  const handleAdd = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    if (formData.currentStock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    try {
      // Transform data: send 'productName' to backend but keep 'name' for frontend compatibility
      const dataToSend = {
        ...formData,
        productName: formData.name // Backend expects productName
      };
      
      console.log('Adding inventory with data:', dataToSend);
      
      const response = await inventoryAPI.create(dataToSend);
      
      console.log('Add inventory response:', response);
      
      // Handle different response structures
      const success = response.data?.success !== false;
      
      if (success) {
        alert('Inventory item added successfully!');
        setShowAddModal(false);
        await loadData();
      } else {
        throw new Error(response.data?.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to add inventory item';
      alert('Error: ' + errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    try {
      console.log('Updating inventory:', selectedItem._id, formData);
      
      const response = await inventoryAPI.update(selectedItem._id, formData);
      
      console.log('Update response:', response);
      
      const success = response.data?.success !== false;
      
      if (success) {
        alert('Inventory item updated successfully!');
        setShowEditModal(false);
        await loadData();
      } else {
        throw new Error(response.data?.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to update inventory item';
      alert('Error: ' + errorMessage);
    }
  };

  const handleRestock = async () => {
    const qty = parseFloat(restockData.quantity);
    
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const newStock = (selectedItem.quantity || selectedItem.currentStock || 0) + qty;
      
      // Use the existing item data, only update the stock
      const updateData = {
        productName: selectedItem.productName || selectedItem.name,
        category: selectedItem.category,
        quantity: newStock,
        unit: selectedItem.unit,
        minStock: selectedItem.minStock || selectedItem.minStockLevel || 10,
        reorderLevel: selectedItem.reorderLevel || selectedItem.minStockLevel || 10,
        supplier: selectedItem.supplier || '',
        cost: selectedItem.cost || selectedItem.costPrice || 0,
        status: selectedItem.status || 'in-stock',
        notes: restockData.notes || selectedItem.notes || `Restocked ${qty} ${selectedItem.unit}`
      };
      
      console.log('Restocking with data:', updateData);
      
      const response = await inventoryAPI.update(selectedItem._id, updateData);
      
      console.log('Restock response:', response);
      
      const success = response.data?.success !== false;
      
      if (success) {
        alert(`Successfully restocked ${qty} ${selectedItem.unit}!`);
        setShowRestockModal(false);
        await loadData();
      } else {
        throw new Error(response.data?.message || 'Failed to restock');
      }
    } catch (error) {
      console.error('Error restocking:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to restock inventory';
      alert('Error: ' + errorMessage);
    }
  };

  const handleDelete = async (item) => {
    const usedIn = getProductsUsingInventory(item._id);
    
    if (usedIn.length > 0) {
      alert(`Cannot delete! This item is used in: ${usedIn.join(', ')}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      console.log('Deleting inventory:', item._id);
      
      const response = await inventoryAPI.delete(item._id);
      
      console.log('Delete response:', response);
      
      const success = response.data?.success !== false;
      
      if (success) {
        alert('Inventory item deleted successfully!');
        await loadData();
      } else {
        throw new Error(response.data?.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to delete inventory item';
      alert('Error: ' + errorMessage);
    }
  };

  // Filter inventories
  const filteredInventories = inventories.filter(item => {
    const matchCategory = category === 'all' || item.category === category;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Calculate summary stats
  const totalItems = inventories.length;
  const lowStockItems = inventories.filter(i => 
    i.currentStock > 0 && i.currentStock <= i.minStockLevel
  ).length;
  const outOfStockItems = inventories.filter(i => i.currentStock === 0).length;
  const totalValue = inventories.reduce((sum, i) => 
    sum + (i.currentStock * (i.costPrice || 0)), 0
  );

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
            <h1>📦 Inventory Management</h1>
            <p>Track and manage all inventory items</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Add Item
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#e0f2fe' }}>
              <i className="fas fa-boxes" style={{ color: '#0284c7' }}></i>
            </div>
            <div className="summary-info">
              <div className="summary-value">{totalItems}</div>
              <div className="summary-label">Total Items</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>
            </div>
            <div className="summary-info">
              <div className="summary-value">{lowStockItems}</div>
              <div className="summary-label">Low Stock</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fee2e2' }}>
              <i className="fas fa-ban" style={{ color: '#ef4444' }}></i>
            </div>
            <div className="summary-info">
              <div className="summary-value">{outOfStockItems}</div>
              <div className="summary-label">Out of Stock</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dcfce7' }}>
              <i className="fas fa-dollar-sign" style={{ color: '#10b981' }}></i>
            </div>
            <div className="summary-info">
              <div className="summary-value">{formatCurrency(totalValue)}</div>
              <div className="summary-label">Total Value</div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
              <button className="btn btn-primary" onClick={openAddModal}>
                Add First Item
              </button>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Cost/Unit</th>
                  <th>Total Value</th>
                  <th>Used In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.map(item => {
                  const usedIn = getProductsUsingInventory(item._id);
                  const status = getStockStatus(item);
                  const totalValue = item.currentStock * (item.costPrice || 0);

                  return (
                    <tr key={item._id}>
                      <td className="item-name">
                        <strong>{item.name}</strong>
                        {item.notes && <small>{item.notes}</small>}
                      </td>

                      <td>
                        <span className="category-badge">{item.category}</span>
                      </td>

                      <td className="quantity-cell">
                        <strong>{item.currentStock}</strong>
                        <small>Min: {item.minStockLevel}</small>
                      </td>

                      <td>{item.unit}</td>

                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: status.color + '20',
                            color: status.color,
                            border: `1px solid ${status.color}`
                          }}
                        >
                          {status.text}
                        </span>
                      </td>

                      <td>{formatCurrency(item.costPrice || 0)}</td>
                      
                      <td><strong>{formatCurrency(totalValue)}</strong></td>

                      <td>
                        {usedIn.length > 0 ? (
                          <small>{usedIn.join(', ')}</small>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-restock"
                            onClick={() => openRestockModal(item)}
                            title="Restock"
                          >
                            <i className="fas fa-plus-circle"></i>
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                          >
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

        {/* ADD MODAL */}
        {showAddModal && (
          <InventoryModal
            title="Add Inventory Item"
            formData={formData}
            setFormData={setFormData}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAdd}
          />
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
          <InventoryModal
            title="Edit Inventory Item"
            formData={formData}
            setFormData={setFormData}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleUpdate}
            isEdit
          />
        )}

        {/* RESTOCK MODAL */}
        {showRestockModal && selectedItem && (
          <RestockModal
            item={selectedItem}
            restockData={restockData}
            setRestockData={setRestockData}
            onClose={() => setShowRestockModal(false)}
            onSubmit={handleRestock}
          />
        )}
      </div>
    </Layout>
  );
};

// Inventory Form Modal
const InventoryModal = ({ title, formData, setFormData, onClose, onSubmit, isEdit }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Lemon Juice"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="Supplies">Supplies</option>
                <option value="Packaging">Packaging</option>
                <option value="Ingredients">Ingredients</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Stock *</label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => handleChange('currentStock', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="L">Liter (L)</option>
                <option value="mL">Milliliter (mL)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div className="form-group">
              <label>Min Stock Level *</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleChange('minStockLevel', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="10"
              />
            </div>

            <div className="form-group">
              <label>Max Stock Level *</label>
              <input
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => handleChange('maxStockLevel', parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label>Cost Price (₱)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Selling Price (₱)</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="3"
                placeholder="Additional information about this item..."
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmitForm}>
            <i className="fas fa-save"></i> {isEdit ? 'Update' : 'Add'} Item
          </button>
        </div>
      </div>
    </div>
  );
};

// Restock Modal
const RestockModal = ({ item, restockData, setRestockData, onClose, onSubmit }) => {
  const newQuantity = item.currentStock + (parseFloat(restockData.quantity) || 0);

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Restock Item</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="restock-info">
            <h3>{item.name}</h3>
            <div className="restock-stats">
              <div>
                <label>Current Stock:</label>
                <strong>{item.currentStock} {item.unit}</strong>
              </div>
              <div>
                <label>After Restock:</label>
                <strong style={{ color: '#10b981' }}>
                  {newQuantity} {item.unit}
                </strong>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Quantity to Add *</label>
            <input
              type="number"
              value={restockData.quantity}
              onChange={(e) => setRestockData(prev => ({
                ...prev,
                quantity: e.target.value
              }))}
              min="0.1"
              step="0.1"
              placeholder="Enter quantity"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={restockData.notes}
              onChange={(e) => setRestockData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="e.g., Delivery from Supplier X"
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-success" 
            onClick={onSubmit}
            disabled={!restockData.quantity || restockData.quantity <= 0}
          >
            <i className="fas fa-check"></i> Confirm Restock
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;