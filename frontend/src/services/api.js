import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const itemService = {
  analyzeAndSave: async (formData) => {
    const response = await api.post('/items/analyze-and-save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDonorItems: async (donorId) => {
    const response = await api.get(`/items/donor/${donorId}`);
    return response.data;
  },

  getItemDetails: async (itemId) => {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  },
};

export default api;
