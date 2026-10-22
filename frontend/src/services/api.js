import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  try {
    const donor = JSON.parse(localStorage.getItem('donor') || 'null');
    const receiver = JSON.parse(localStorage.getItem('receiver') || 'null');
    const token = receiver?.token || donor?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    return Promise.reject(error);
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('donor');
      localStorage.removeItem('receiver');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => (await api.post('/auth/register', userData)).data,
  login: async (credentials) => (await api.post('/auth/login', credentials)).data,
  logout: async () => (await api.post('/auth/logout')).data,
  registerReceiver: async (userData) => (await api.post('/auth/receiver/register', userData)).data,
  loginReceiver: async (credentials) => (await api.post('/auth/receiver/login', credentials)).data,
};

export const itemService = {
  analyzeAndSave: async (formData) => {
    const response = await api.post('/items/analyze-and-save', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getDonorItems: async (donorId) => (await api.get(`/items/donor/${donorId}`)).data,
  getItemDetails: async (itemId) => (await api.get(`/items/${itemId}`)).data,
  getAvailableDonations: async (filters = {}) => (await api.get('/items/available', { params: filters })).data,
};

export const donationRequestService = {
  create: async (itemId, note) => (await api.post('/donation-requests', { itemId, note })).data,
  getMine: async () => (await api.get('/donation-requests/mine')).data,
  decide: async (requestId, decision) => (
    await api.patch(`/donation-requests/${requestId}/decision`, null, { params: { decision } })
  ).data,
  schedulePickup: async (requestId, scheduledAt, pickupLocation) => (
    await api.put(`/donation-requests/${requestId}/pickup`, { scheduledAt, pickupLocation })
  ).data,
  markPickedUp: async (requestId) => (
    await api.patch(`/donation-requests/${requestId}/pickup/complete`)
  ).data,
};

export const notificationService = {
  getMine: async () => (await api.get('/notifications/mine')).data,
  markRead: async (notificationId) => (
    await api.patch(`/notifications/${notificationId}/read`)
  ).data,
};

export default api;
