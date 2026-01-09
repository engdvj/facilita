'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const defaultHost =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || `http://${defaultHost}:3001/api`;

// Base URL do servidor (sem /api) para acesso a arquivos estáticos
export const serverURL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || `http://${defaultHost}:3001`;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

const refreshAccessToken = async () => {
  const response = await refreshClient.post('/auth/refresh');
  return response.data.accessToken as string;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
