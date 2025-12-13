import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import POS from './pages/POS';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, getUserRole } from './utils/auth';
import InventoryManagement from './pages/InventoryManagement';

function App() {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuth ? (
            <Navigate to={userRole === 'admin' ? '/admin' : '/pos'} replace />
          ) : (
            <Login />
          )} 
        />
        
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } 
        />

      
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/inventory" 
          element={
            <ProtectedRoute requiredRole="admin">
              <InventoryManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <Navigate to={isAuth ? (userRole === 'admin' ? '/admin' : '/pos') : '/login'} replace />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
