import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If user is not the required role, redirect to appropriate page
    return <Navigate to={userRole === 'admin' ? '/admin' : '/pos'} replace />;
  }

  return children;
};

export default ProtectedRoute;
