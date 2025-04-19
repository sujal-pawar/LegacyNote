import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
  googleAuth: (userData) => api.post('/auth/google', userData),
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
          timeout: 60000 // Add a 60 second timeout
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