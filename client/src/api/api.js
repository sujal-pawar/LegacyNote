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
  createNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  shareNote: (id) => api.post(`/notes/${id}/share`),
  getSharedNote: (id, accessKey) => api.get(`/notes/shared/${id}/${accessKey}`),
};

export default api; 