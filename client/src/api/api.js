import axios from 'axios';

// Determine the appropriate API URL with fallbacks
const determineApiUrl = () => {
  // First try environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // Try production URL first (for deployed apps)
  const prodUrl = 'https://legacy-note-backend.onrender.com/api';
  
  // Fallback to local development URL
  const localUrl = 'http://localhost:5000/api';
  
  // If we're on a deployed frontend (checking if URL is not localhost)
  if (typeof window !== 'undefined' && 
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')) {
    return prodUrl;
  }
  
  return localUrl;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: determineApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second default timeout
});

// Log the API URL being used
console.log('API URL being used:', api.defaults.baseURL);

// Add retry functionality
api.interceptors.response.use(undefined, async (err) => {
  const { config, message } = err;
  
  // If there's no config, or we've already retried, just reject
  if (!config || config.__isRetry) {
    return Promise.reject(err);
  }
  
  // Network error or timeout - retry once (unless it's an abort)
  if (message.includes('Network Error') || message.includes('timeout') || err.code === 'ECONNABORTED') {
    console.log('Network issue detected, retrying request...');
    
    // Mark as retried to prevent infinite loops
    config.__isRetry = true;
    
    // Wait 1.5 seconds before retry
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If we're in a deployed environment, try the production URL on retry
    if (typeof window !== 'undefined' && 
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1')) {
      config.baseURL = 'https://legacy-note-backend.onrender.com/api';
    }
    
    return api(config);
  }
  
  return Promise.reject(err);
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Create a more user-friendly error message
    if (!error.response && error.message && error.message.includes('Network Error')) {
      console.error('Network error detected:', error);
      // Create a more helpful error object
      const enhancedError = new Error(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
      enhancedError.originalError = error;
      enhancedError.isNetworkError = true;
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', email),
  resetPassword: (resetToken, password) => 
    api.put(`/auth/resetpassword/${resetToken}`, { password }),
  googleAuth: (userData) => {
    // Add specific timeout and error handling for Google auth
    return api.post('/auth/google', userData, {
      timeout: 15000, // 15 second timeout for Google auth requests
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Type': 'Google' // Custom header to identify Google auth requests
      }
    }).catch(error => {
      // Enhanced error logging for Google auth issues
      if (error.code === 'ECONNABORTED') {
        console.error('Google auth timeout:', error);
        throw new Error('Google authentication timed out. Please try again.');
      }
      if (error.name === 'AbortError') {
        console.error('Google auth aborted:', error);
        throw new Error('Google authentication was interrupted. Please try again.');
      }
      throw error; // Re-throw other errors
    });
  },
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  verifyEmail: (email, otp) => api.post('/auth/verify-email', { email, otp }),
};

// User API
export const userAPI = {
  updateUser: (userData) => api.put('/users/update', userData),
  updatePassword: (passwordData) => api.put('/users/updatepassword', passwordData),
  deleteAccount: () => api.delete('/users/delete'),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get('/notes'),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: async (noteData) => {
    try {
      // Check if noteData is FormData
      if (noteData instanceof FormData) {
        // Log the data being sent (for debugging)
        if (process.env.NODE_ENV !== 'production') {
          for (let [key, value] of noteData.entries()) {
            if (key !== 'mediaFiles') { // Don't log file binary data
              // Remove commented console.log statements
            } else {
              // Remove commented console.log statements
            }
          }
        }
        
        return await api.post('/notes', noteData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 180000 // Increase timeout to 3 minutes for Render free tier
        });
      }
      
      return await api.post('/notes', noteData, {
        timeout: 30000 // Add a 30 second timeout for JSON requests
      });
    } catch (error) {
      console.error('API error creating note:', error);
      
      // Enhance error message with details
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.error('Response error:', error.response.data);
        throw error;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error - no response received');
        throw new Error('Network error - server did not respond. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  },
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  shareNote: (id) => api.post(`/notes/${id}/share`),
  getSharedNote: (id, accessKey) => {
    // Include the authorization token if available
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return api.get(`/notes/shared/${id}/${accessKey}`, { headers });
  },
};

export default api; 