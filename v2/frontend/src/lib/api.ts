'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { AppMode, getAppMode } from '@/lib/app-mode';

const getDefaultHost = () =>
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const getModeApiUrl = (mode: AppMode): string | undefined => {
  if (mode === 'user') {
    return process.env.NEXT_PUBLIC_API_URL_USER;
  }
  return process.env.NEXT_PUBLIC_API_URL_COMPANY;
};

const getBaseURL = (mode: AppMode): string => {
  const modeUrl = getModeApiUrl(mode);
  if (modeUrl) return modeUrl;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl;
  return `http://${getDefaultHost()}:3001/api`;
};

const getServerURL = (mode: AppMode): string => {
  const apiUrl = getBaseURL(mode);

  // If API URL is relative (e.g., /api), use current origin
  if (apiUrl?.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  // If API URL is absolute, remove /api suffix
  if (apiUrl) {
    return apiUrl.replace('/api', '');
  }

  return `http://${getDefaultHost()}:3001`;
};

const resolveBaseURL = () => getBaseURL(getAppMode());

// Base URL do servidor (sem /api) para acesso a arquivos estáticos
export const serverURL = getServerURL(getAppMode());
export const getServerURLForMode = () => getServerURL(getAppMode());

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

type NotificationConfig = RetryConfig & {
  skipNotify?: boolean;
};

const mutationMethods = new Set(['post', 'put', 'patch', 'delete']);
const ignoredNotifyPaths = ['/auth/refresh'];

const resolveEntityLabel = (url?: string) => {
  if (!url) return 'Operacao';
  const normalized = url.toLowerCase();
  if (normalized.includes('/auth/login')) return 'Login';
  if (normalized.includes('/auth/logout')) return 'Logout';
  if (normalized.includes('/permissions')) return 'Permissoes';
  if (normalized.includes('/links')) return 'Link';
  if (normalized.includes('/categories')) return 'Categoria';
  if (normalized.includes('/schedules')) return 'Documento';
  if (normalized.includes('/notes')) return 'Nota';
  if (normalized.includes('/users')) return 'Usuario';
  if (normalized.includes('/sectors')) return 'Setor';
  if (normalized.includes('/units')) return 'Unidade';
  if (normalized.includes('/companies')) return 'Empresa';
  if (normalized.includes('/uploads')) return 'Arquivo';
  if (normalized.includes('/system-config')) return 'Configuracoes';
  return 'Operacao';
};

const resolveAction = (method?: string, url?: string) => {
  if (url?.includes('/auth/login') || url?.includes('/auth/logout')) {
    return { past: 'realizado', infinitive: 'realizar' };
  }
  if (url?.includes('/permissions')) {
    return { past: 'atualizadas', infinitive: 'atualizar' };
  }
  if (url?.includes('/restore')) {
    return { past: 'restaurado', infinitive: 'restaurar' };
  }

  switch (method) {
    case 'post':
      return { past: 'criado', infinitive: 'criar' };
    case 'put':
    case 'patch':
      return { past: 'atualizado', infinitive: 'atualizar' };
    case 'delete':
      return { past: 'removido', infinitive: 'remover' };
    default:
      return { past: 'salvo', infinitive: 'salvar' };
  }
};

const shouldNotify = (config?: NotificationConfig) => {
  const method = config?.method?.toLowerCase();
  if (!method || !mutationMethods.has(method)) return false;
  if (config?.skipNotify) return false;
  const url = config?.url ?? '';
  return !ignoredNotifyPaths.some((path) => url.includes(path));
};

const parseErrorMessage = (error: AxiosError) => {
  const apiMessage = error.response?.data as { message?: unknown } | undefined;
  if (!apiMessage?.message) return error.message;
  if (typeof apiMessage.message === 'string') return apiMessage.message;
  if (Array.isArray(apiMessage.message)) {
    return apiMessage.message.join(', ');
  }
  return error.message;
};

api.interceptors.request.use((config) => {
  config.baseURL = resolveBaseURL();
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

const refreshAccessToken = async () => {
  refreshClient.defaults.baseURL = resolveBaseURL();
  const response = await refreshClient.post('/auth/refresh');
  const user = response.data?.user;
  if (user) {
    useAuthStore.getState().setUser(user);
  }
  return response.data.accessToken as string;
};

api.interceptors.response.use(
  (response) => {
    const config = response.config as NotificationConfig;
    if (shouldNotify(config)) {
      const entity = resolveEntityLabel(config.url);
      const action = resolveAction(config.method, config.url);
      const message =
        entity === 'Operacao'
          ? 'Operacao concluida.'
          : `${entity} ${action.past} com sucesso.`;
      useNotificationStore
        .getState()
        .push({ variant: 'success', message });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as NotificationConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        useAuthStore.getState().setAccessToken(newAccessToken);

        // @ts-expect-error - headers is always defined in axios requests
        originalRequest.headers?.set('Authorization', `Bearer ${newAccessToken}`);

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
      }
    }

    if (shouldNotify(originalRequest)) {
      const entity = resolveEntityLabel(originalRequest?.url);
      const action = resolveAction(originalRequest?.method, originalRequest?.url);
      const fallback =
        entity === 'Operacao'
          ? 'Nao foi possivel concluir a operacao.'
          : `Falha ao ${action.infinitive.toLowerCase()} ${entity.toLowerCase()}.`;
      const message = parseErrorMessage(error) || fallback;
      useNotificationStore
        .getState()
        .push({ variant: 'error', message });
    }

    return Promise.reject(error);
  },
);

export default api;
