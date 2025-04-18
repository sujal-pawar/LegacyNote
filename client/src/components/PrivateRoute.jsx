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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Redirect to email verification page if email is not verified
  if (user && !user.isEmailVerified) {
    console.log('Email verification needed:', user);
    return <Navigate to="/verify-email" />;
  }

  console.log('User authenticated and email verified:', user);
  // If authenticated and email verified, render the children (protected component)
  return children;
};

export default PrivateRoute; 