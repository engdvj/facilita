import ApiClient from './api-client';
import { useAuth, useError } from '../contexts';
import toast from 'react-hot-toast';

// Create API client instance
const apiClient = new ApiClient({
  onLoadingStart: () => {
    // This will be handled by a global loading context
    // For now, we'll just track it internally
  },
  onLoadingEnd: () => {
    // Loading end handler
  },
  onError: (error) => {
    // Show error toast for user-facing errors
    if (error.status !== 401 && error.status !== 403) {
      toast.error(error.message);
    }
  },
  onUnauthorized: () => {
    // Handle unauthorized access
    toast.error('Sessão expirada. Faça login novamente.');
    
    // Clear local storage and redirect to login
    localStorage.removeItem('loggedIn');
    sessionStorage.removeItem('loggedIn');
    
    // Redirect to login
    if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/') {
      window.location.href = '/admin/login';
    }
  },
});

// API service methods
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { name: string; username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getProfile: () =>
    apiClient.get('/auth/me'),
  
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password', data),
};

export const linksApi = {
  getAll: () =>
    apiClient.get('/links'),
  
  getById: (id: number) =>
    apiClient.get(`/links/${id}`),
  
  create: (data: any) =>
    apiClient.post('/links', data),
  
  update: (id: number, data: any) =>
    apiClient.patch(`/links/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/links/${id}`),
  
  getStats: () =>
    apiClient.get('/links/stats'),
};

export const categoriesApi = {
  getAll: () =>
    apiClient.get('/categories'),
  
  getById: (id: number) =>
    apiClient.get(`/categories/${id}`),
  
  create: (data: any) =>
    apiClient.post('/categories', data),
  
  update: (id: number, data: any) =>
    apiClient.patch(`/categories/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};

export const colorsApi = {
  getAll: () =>
    apiClient.get('/colors'),
  
  getById: (id: number) =>
    apiClient.get(`/colors/${id}`),
  
  create: (data: any) =>
    apiClient.post('/colors', data),
  
  update: (id: number, data: any) =>
    apiClient.patch(`/colors/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/colors/${id}`),
  
  validate: (color: string) =>
    apiClient.post('/colors/validate', { value: color }),
  
  getPalette: () =>
    apiClient.get('/colors/palette'),
};

export const usersApi = {
  getAll: () =>
    apiClient.get('/users'),
  
  getById: (id: number) =>
    apiClient.get(`/users/${id}`),
  
  create: (data: any) =>
    apiClient.post('/users', data),
  
  update: (id: number, data: any) =>
    apiClient.patch(`/users/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
  
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  updateProfile: (data: any) =>
    apiClient.patch('/users/profile', data),
};

export const schedulesApi = {
  getAll: () =>
    apiClient.get('/schedules'),
  
  getById: (id: number) =>
    apiClient.get(`/schedules/${id}`),
  
  create: (data: any) =>
    apiClient.post('/schedules', data),
  
  update: (id: number, data: any) =>
    apiClient.patch(`/schedules/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/schedules/${id}`),
  
  trackDownload: (id: number) =>
    apiClient.post(`/schedules/${id}/download`),
  
  getStats: () =>
    apiClient.get('/schedules/stats'),
};

export const filesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getInfo: (filename: string) =>
    apiClient.get(`/files/info/${filename}`),
  
  delete: (filename: string) =>
    apiClient.delete(`/files/${filename}`),
  
  list: () =>
    apiClient.get('/files'),
};

export const themeApi = {
  get: () =>
    apiClient.get('/theme'),
  
  save: (theme: Record<string, string>) =>
    apiClient.post('/theme', { theme }),
};

// Export the client for direct use when needed
export { apiClient };

// Export default client (backward compatibility)
export default apiClient;