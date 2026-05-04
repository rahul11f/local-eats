import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://local-eats-api-wpyj.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addAddress: (data) => api.post('/auth/address', data),
  getAddresses: () => api.get('/auth/addresses'),
  updateAddress: (id, data) => api.put(`/auth/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};

// Restaurant API calls
export const restaurantAPI = {
  getAllRestaurants: (params) => api.get('/restaurants', { params }),
  getRestaurant: (id) => api.get(`/restaurants/${id}`),
  getDashboard: (id) => api.get(`/restaurants/${id}/dashboard`),
  getOrders: (id, params) => api.get(`/restaurants/${id}/orders`, { params }),
  updateOrderStatus: (id, orderId, data) =>
    api.put(`/restaurants/${id}/orders/${orderId}/status`, data),
  getSubscription: (id) => api.get(`/restaurants/${id}/subscription`),
  upgradeSubscription: (id, data) =>
    api.post(`/restaurants/${id}/subscription/upgrade`, data),
};

// Menu API calls
export const menuAPI = {
  getMenuItems: (restaurantId, params) =>
    api.get(`/restaurants/${restaurantId}/menu`, { params }),
  addMenuItem: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    api.put(`/restaurants/${restaurantId}/menu/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),
  toggleAvailability: (restaurantId, itemId) =>
    api.put(`/restaurants/${restaurantId}/menu/${itemId}/toggle`),
  searchMenuItems: (restaurantId, q) =>
    api.get(`/restaurants/${restaurantId}/menu/search`, { params: { q } }),
};

// Order API calls
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  rateOrder: (id, data) => api.put(`/orders/${id}/rate`, data),
  updateDriverLocation: (id, data) =>
    api.put(`/orders/${id}/driver-location`, data),
};

// Admin API calls
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  getRestaurants: () => api.get('/admin/restaurants'),
  getPendingRestaurants: () => api.get('/admin/restaurants/pending'),
  approveRestaurant: (id, data) => api.put(`/admin/restaurants/${id}/approve`, data),
  getOrders: () => api.get('/admin/orders/monitoring'),
  getDrivers: () => api.get('/admin/drivers'),
  approveDriver: (id, data) => api.put(`/admin/drivers/${id}/approve`, data),
};

export default api;
