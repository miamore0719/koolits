import { Link, useNavigate } from 'react-router-dom';
import { getUserInfo, logout as authLogout, isAdmin } from '../utils/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = getUserInfo();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authLogout();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/koolits-logo.png" 
              alt="KoolITs Logo" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'white',
                padding: '5px'
              }}
            />
            <div>
              <h1 style={{ fontSize: '20px', margin: 0 }}>KoolITs</h1>
              <p style={{ fontSize: '11px', color: '#e89b3c', margin: 0 }}>
                {isAdmin() ? 'Admin Panel' : 'POS System'}
              </p>
            </div>
          </div>

           <nav style={{ display: 'flex', gap: '10px', marginLeft: '30px' }}>
              {isAdmin() ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="btn btn-secondary btn-small"
                  >
                    <i className="fas fa-chart-line"></i> Dashboard
                  </Link>

                  <Link 
                    to="/admin" 
                    className="btn btn-secondary btn-small"
                  >
                    <i className="fas fa-box"></i> Products
                  </Link>

                  {/* ✅ Inventory Button */}
                  <Link 
                    to="/admin/inventory" 
                    className="btn btn-secondary btn-small"
                  >
                    <i className="fas fa-warehouse"></i> Inventory
                  </Link>

                  <Link 
                    to="/users" 
                    className="btn btn-secondary btn-small"
                  >
                    <i className="fas fa-users"></i> Users
                  </Link>

                  <Link 
                    to="/pos" 
                    className="btn btn-info btn-small"
                  >
                    <i className="fas fa-cash-register"></i> POS
                  </Link>
                </>
              ) : (
                <Link 
                  to="/pos" 
                  className="btn btn-secondary btn-small"
                >
                  <i className="fas fa-cash-register"></i> POS
                </Link>
              )}
        </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            background: 'rgba(232, 155, 60, 0.2)',
            padding: '8px 15px',
            borderRadius: '20px',
            border: '2px solid rgba(232, 155, 60, 0.3)'
          }}>
            <i className="fas fa-user"></i> {user?.fullName || 'User'}
            {user?.role === 'admin' && (
              <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                Admin
              </span>
            )}
          </div>

          <button 
            className="btn btn-danger btn-small"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '15px 30px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        © 2025 KoolITs. All rights reserved. | POS System v1.0
      </footer>
    </div>
  );
};

export default Layout;
