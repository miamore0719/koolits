import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getUserInfo } from '../utils/auth';
import { formatDate } from '../utils/helpers';
import Layout from '../components/Layout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const currentUser = getUserInfo();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'staff',
    email: '',
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      password: '',
      role: 'staff',
      email: '',
      phone: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      password: '',
      role: user.role,
      email: user.email || '',
      phone: user.phone || '',
      status: user.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { ...formData };
      
      // Remove password if editing and not changing it
      if (editingUser && !data.password) {
        delete data.password;
      }

      if (editingUser) {
        await authAPI.updateUser(editingUser._id, data);
        alert('User updated successfully!');
      } else {
        await authAPI.createUser(data);
        alert('User created successfully!');
      }
      
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (!window.confirm(`${newStatus === 'active' ? 'Activate' : 'Deactivate'} this user?`)) {
      return;
    }

    try {
      await authAPI.updateUser(userId, { status: newStatus });
      alert('User status updated!');
      loadUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1><i className="fas fa-users"></i> User Management</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-user-plus"></i> Add New User
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.fullName}</strong>
                      {user._id === currentUser.id && (
                        <span className="badge badge-info" style={{marginLeft: '8px'}}>YOU</span>
                      )}
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`badge badge-${user.role === 'admin' ? 'warning' : 'info'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user._id !== currentUser.id ? (
                        <>
                          <button 
                            className="btn btn-info btn-small"
                            onClick={() => openEditModal(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-warning btn-small"
                            onClick={() => toggleStatus(user._id, user.status)}
                          >
                            <i className={`fas fa-${user.status === 'active' ? 'ban' : 'check'}`}></i>
                          </button>
                        </>
                      ) : (
                        <small style={{opacity: 0.5}}>Can't edit yourself</small>
                      )}
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
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-user"></i> {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Password {!editingUser && '*'}</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                        placeholder={editingUser ? 'Leave blank to keep current' : ''}
                      />
                    </div>

                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        required
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
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

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i> Save User
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

export default UserManagement;
