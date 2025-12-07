import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';
import Layout from '../components/Layout';
import '../styles/Admin.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    category: 'lemonade',
    flavor: '',
    description: '',
    sizes: [{ size: 'Small', price: 0 }],
    toppings: [],
    status: 'active'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
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

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'lemonade',
      flavor: '',
      description: '',
      sizes: [{ size: 'Small', price: 0 }],
      toppings: [],
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      flavor: product.flavor || '',
      description: product.description || '',
      sizes: product.sizes,
      toppings: product.toppings || [],
      status: product.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        alert('Product updated successfully!');
      } else {
        await productAPI.create(formData);
        alert('Product created successfully!');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.delete(id);
      alert('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', price: 0 }]
    });
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    });
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addTopping = () => {
    setFormData({
      ...formData,
      toppings: [...formData.toppings, { name: '', price: 0 }]
    });
  };

  const removeTopping = (index) => {
    setFormData({
      ...formData,
      toppings: formData.toppings.filter((_, i) => i !== index)
    });
  };

  const updateTopping = (index, field, value) => {
    const newToppings = [...formData.toppings];
    newToppings[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, toppings: newToppings });
  };

  const filteredProducts = currentCategory === 'all' 
    ? products 
    : products.filter(p => p.category === currentCategory);

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1><i className="fas fa-box"></i> Product Management</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Add New Product
          </button>
        </div>

        {/* Category Filter */}
        <div className="filter-bar">
          {['all', 'lemonade', 'waffle', 'fries', 'soft-ice-cream', 'others'].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => setCurrentCategory(cat)}
            >
              {cat === 'all' ? 'All Products' : cat.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Sizes & Prices</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <p>No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-icon">{getCategoryIcon(product.category)}</span>
                        <div>
                          <div className="product-name">{product.name}</div>
                          {product.flavor && <small>{product.flavor}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{product.category}</span>
                    </td>
                    <td>
                      {product.sizes.map((s, i) => (
                        <div key={i} className="size-tag">
                          {s.size}: {formatCurrency(s.price)}
                        </div>
                      ))}
                    </td>
                    <td>
                      <span className={`badge badge-${product.status === 'active' ? 'success' : 'danger'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-info btn-small"
                        onClick={() => openEditModal(product)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(product._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay active" onClick={() => setShowModal(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-box"></i> {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        required
                      >
                        <option value="lemonade">Lemonade</option>
                        <option value="waffle">Waffle</option>
                        <option value="fries">Fries</option>
                        <option value="soft-ice-cream">Soft Ice Cream</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Flavor (Optional)</label>
                      <input
                        type="text"
                        value={formData.flavor}
                        onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                    />
                  </div>

                  {/* Sizes */}
                  <div className="form-group">
                    <label>Sizes & Prices *</label>
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="size-row">
                        <input
                          type="text"
                          placeholder="Size (e.g., Small, Medium)"
                          value={size.size}
                          onChange={(e) => updateSize(index, 'size', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={size.price}
                          onChange={(e) => updateSize(index, 'price', e.target.value)}
                          step="0.01"
                          required
                        />
                        {formData.sizes.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => removeSize(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-small" onClick={addSize}>
                      <i className="fas fa-plus"></i> Add Size
                    </button>
                  </div>

                  {/* Toppings */}
                  <div className="form-group">
                    <label>Toppings (Optional)</label>
                    {formData.toppings.map((topping, index) => (
                      <div key={index} className="size-row">
                        <input
                          type="text"
                          placeholder="Topping name"
                          value={topping.name}
                          onChange={(e) => updateTopping(index, 'name', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={topping.price}
                          onChange={(e) => updateTopping(index, 'price', e.target.value)}
                          step="0.01"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => removeTopping(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-small" onClick={addTopping}>
                      <i className="fas fa-plus"></i> Add Topping
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i> Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
