import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.success) {
        // Save token and user info
        setToken(response.data.data.token);
        setUser(response.data.data.user);

        // Redirect based on role
        if (response.data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/pos');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Unable to connect to server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img src="/koolits-logo.png" alt="KoolITs Logo" />
          </div>
          <h1>Welcome Back!</h1>
          <p>Sign in to access your POS system</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="demo-accounts">
            <h4>
              <i className="fas fa-info-circle"></i> Demo Accounts (First Time Setup)
            </h4>
            <div className="demo-account">
              <strong>Admin:</strong> username: <code>admin</code> / password: <code>admin123</code>
            </div>
            <div className="demo-account">
              <strong>Note:</strong> Run <code>POST /api/auth/setup</code> to create admin account
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>&copy; 2025 KoolITs. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
