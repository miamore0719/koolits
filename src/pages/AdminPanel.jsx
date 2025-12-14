import { useState, useEffect } from 'react';
import { productAPI, inventoryAPI } from '../services/api';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';
import Layout from '../components/Layout';
import '../styles/Admin.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    category: 'lemonade',
    flavor: '',
    description: '',
    sizes: [{ 
      size: 'Small', 
      price: 0,
      ingredients: [] // Array of {inventoryItem, quantity, unit}
    }],
    toppings: [],
    status: 'active'
  });

  useEffect(() => {
    loadProducts();
    loadInventory();
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

const loadInventory = async () => {
  try {
    const response = await inventoryAPI.getAll();
    if (response.data) {
      setInventory(response.data); // NO FILTER
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
};

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'lemonade',
      flavor: '',
      description: '',
      sizes: [{ 
        size: 'Small', 
        price: 0,
        ingredients: []
      }],
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
      sizes: product.sizes.map(size => ({
        ...size,
        ingredients: size.ingredients || []
      })),
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

  // Size management
  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { 
        size: '', 
        price: 0,
        ingredients: []
      }]
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

  // Ingredient management for each size
  const addIngredientToSize = (sizeIndex) => {
    const newSizes = [...formData.sizes];
    if (!newSizes[sizeIndex].ingredients) {
      newSizes[sizeIndex].ingredients = [];
    }
    newSizes[sizeIndex].ingredients.push({
      inventoryItem: '',
      quantity: 0,
      unit: ''
    });
    setFormData({ ...formData, sizes: newSizes });
  };

  const removeIngredientFromSize = (sizeIndex, ingredientIndex) => {
    const newSizes = [...formData.sizes];
    newSizes[sizeIndex].ingredients = newSizes[sizeIndex].ingredients.filter(
      (_, i) => i !== ingredientIndex
    );
    setFormData({ ...formData, sizes: newSizes });
  };

  const updateIngredient = (sizeIndex, ingredientIndex, field, value) => {
    const newSizes = [...formData.sizes];
    const ingredient = newSizes[sizeIndex].ingredients[ingredientIndex];
    
    if (field === 'inventoryItem') {
      ingredient.inventoryItem = value;
      // Auto-fill unit from inventory
      const selectedInventory = inventory.find(inv => inv._id === value);
      if (selectedInventory) {
        ingredient.unit = selectedInventory.unit;
      }
    } else if (field === 'quantity') {
      ingredient.quantity = parseFloat(value) || 0;
    } else {
      ingredient[field] = value;
    }
    
    setFormData({ ...formData, sizes: newSizes });
  };

  // Topping management
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
                <th>Ingredients</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6">
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
                      {product.sizes.some(s => s.ingredients && s.ingredients.length > 0) ? (
                        <span className="badge badge-success">
                          <i className="fas fa-check"></i> Mapped
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <i className="fas fa-exclamation"></i> Not Mapped
                        </span>
                      )}
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
                  {/* Basic Info */}
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
                      rows="2"
                    />
                  </div>

                  {/* Sizes with Ingredients */}
                  <div className="form-group">
                    <label>Sizes, Prices & Ingredients *</label>
                    {formData.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="size-section">
                        {/* Size Name and Price */}
                        <div className="size-row">
                          <input
                            type="text"
                            placeholder="Size (e.g., Small, Medium)"
                            value={size.size}
                            onChange={(e) => updateSize(sizeIndex, 'size', e.target.value)}
                            required
                            style={{ flex: 2 }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            value={size.price}
                            onChange={(e) => updateSize(sizeIndex, 'price', e.target.value)}
                            step="0.01"
                            required
                            style={{ flex: 1 }}
                          />
                          {formData.sizes.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              onClick={() => removeSize(sizeIndex)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>

                        {/* Ingredients for this size */}
                        <div className="ingredients-section">
                          <label className="ingredients-label">
                            <i className="fas fa-flask"></i> Ingredients for {size.size || 'this size'}
                          </label>
                          
                          {size.ingredients && size.ingredients.length > 0 && (
                            <div className="ingredients-list">
                              {size.ingredients.map((ingredient, ingredientIndex) => (
                                <div key={ingredientIndex} className="ingredient-row">
                                  <select
                                    value={ingredient.inventoryItem}
                                    onChange={(e) => updateIngredient(sizeIndex, ingredientIndex, 'inventoryItem', e.target.value)}
                                    required
                                    style={{ flex: 2 }}
                                  >
                                    <option value="">Select Ingredient</option>
                                    {inventory.map(item => (
                                      <option key={item._id} value={item._id}>
                                        {item.name} ({item.quantity} {item.unit} available)
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    value={ingredient.quantity}
                                    onChange={(e) => updateIngredient(sizeIndex, ingredientIndex, 'quantity', e.target.value)}
                                    step="0.01"
                                    required
                                    style={{ flex: 1 }}
                                  />
                                  
                                  <input
                                    type="text"
                                    placeholder="Unit"
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(sizeIndex, ingredientIndex, 'unit', e.target.value)}
                                    readOnly
                                    style={{ flex: 1, background: '#f3f4f6' }}
                                  />
                                  
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-small"
                                    onClick={() => removeIngredientFromSize(sizeIndex, ingredientIndex)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => addIngredientToSize(sizeIndex)}
                            style={{ marginTop: '8px' }}
                          >
                            <i className="fas fa-plus"></i> Add Ingredient
                          </button>
                        </div>
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