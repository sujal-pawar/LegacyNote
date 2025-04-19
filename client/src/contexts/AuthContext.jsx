import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/api';
import { showSuccessToast, showErrorToast, showAuthErrorToast, showInfoToast } from '../utils/toast';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getUser();
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.register(userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      showSuccessToast('Account created successfully! Welcome to LegacyNote.');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      showAuthErrorToast(err.response?.data?.error || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.login(userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      showSuccessToast(`Welcome back, ${res.data.user.name || 'User'}!`);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage;
      
      if (err.response && err.response.data) {
        // Server returned an error response
        errorMessage = err.response.data.error || 'Invalid credentials';
      } else if (err.request) {
        // No response received
        errorMessage = 'No response from server. Please try again later.';
      } else {
        // Request setup error
        errorMessage = 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      showAuthErrorToast(errorMessage); 
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google login/register
  const googleLogin = async (userData) => {
    try {
      setLoading(true);
      
      // Validate input data
      if (!userData || !userData.email) {
        setError('Invalid Google authentication data');
        showAuthErrorToast('Invalid Google authentication data. Please try again.');
        return false;
      }
      
      const res = await authAPI.googleAuth(userData);
      
      if (!res || !res.data || !res.data.token) {
        setError('Invalid response from server during Google authentication');
        showAuthErrorToast('Something went wrong with Google authentication. Please try again.');
        return false;
      }
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      showSuccessToast(`Welcome, ${res.data.user.name || 'User'}! Google login successful.`);
      return true;
    } catch (err) {
      console.error('Google authentication error:', err);
      
      let errorMessage = 'Google login failed';
      
      // More detailed error handling
      if (err.name === 'AbortError') {
        errorMessage = 'Google login was interrupted. Please try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showAuthErrorToast(errorMessage || 'Google login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    showInfoToast('You have been logged out successfully.');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword({ email });
      showSuccessToast('Password reset email sent! Please check your inbox and follow the instructions.');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
      showErrorToast(err.response?.data?.error || 'Unable to send reset email. Please verify your email address.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setLoading(true);
      await authAPI.resetPassword(resetToken, password);
      showSuccessToast('Your password has been reset successfully! Please login with your new password.');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      showErrorToast(err.response?.data?.error || 'Password reset failed. The link may have expired.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.updateUser(userData);
      setUser(res.data.data);
      showSuccessToast('Your profile has been updated successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      showErrorToast(err.response?.data?.error || 'Unable to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      setLoading(true);
      const res = await authAPI.verifyEmail(email, otp);
      
      // Update user in state with verified email
      if (user) {
        setUser({
          ...user,
          isEmailVerified: true
        });
      }
      
      // Handle the response from server
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        
        // Reload user data from server to ensure we have the latest state
        try {
          const userRes = await authAPI.getUser();
          setUser(userRes.data.data);
        } catch (userErr) {
          console.error('Error refreshing user data:', userErr);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Email verification error:', err);
      let errorMessage;
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || 'Invalid or expired verification code';
      } else if (err.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = 'An error occurred during verification.';
      }
      
      setError(errorMessage);
      showAuthErrorToast(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getUser();
      setUser(res.data.data);
      return true;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        verifyEmail,
        refreshUser,
        clearErrors,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 