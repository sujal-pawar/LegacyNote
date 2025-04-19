import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container flex justify-center items-center" style={{ height: '70vh' }}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if email is verified (only if required)
  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // User is authenticated and email is verified if required
  return children;
};

export default PrivateRoute; 