import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Taulers
export const boardService = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  uploadImage: (formData) => {
    return api.post('/boards/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Sales
export const roomService = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  join: (id, playerData) => api.post(`/rooms/${id}/join`, playerData),
  leave: (id, playerId) => api.post(`/rooms/${id}/leave`, { playerId }),
  delete: (id) => api.delete(`/rooms/${id}`)
};
