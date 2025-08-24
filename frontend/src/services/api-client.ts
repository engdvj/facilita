import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { parseApiError, logError, AppError } from '../utils/error-utils';

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
  onError?: (error: AppError) => void;
  onUnauthorized?: () => void;
}

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
  retryAttempts?: number;
}

interface QueuedRequest {
  config: RequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private requestQueue: QueuedRequest[] = [];
  private isRefreshing = false;
  private activeRequests = 0;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.client = axios.create({
      baseURL: config.baseURL || import.meta.env.VITE_API_URL || '/api',
      timeout: this.config.timeout,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.activeRequests++;
        if (this.activeRequests === 1) {
          this.config.onLoadingStart?.();
        }

        // Add request timestamp for monitoring
        config.metadata = { startTime: Date.now() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.config.onLoadingEnd?.();
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.config.onLoadingEnd?.();
        }

        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - response.config.metadata?.startTime;
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            duration: `${duration}ms`,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.config.onLoadingEnd?.();
        }

        const config = error.config as RequestConfig;

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          const duration = config?.metadata?.startTime 
            ? Date.now() - config.metadata.startTime 
            : 0;
          console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
            status: error.response?.status,
            duration: `${duration}ms`,
            error: error.response?.data || error.message,
          });
        }

        // Handle 401 errors
        if (error.response?.status === 401 && !config?.skipAuth) {
          return this.handleUnauthorized(error);
        }

        // Handle retryable errors
        if (this.shouldRetry(error, config)) {
          return this.retryRequest(error);
        }

        // Handle error globally unless skipped
        if (!config?.skipErrorHandler) {
          const appError = parseApiError(error);
          logError(appError, 'API Client');
          this.config.onError?.(appError);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError, config?: RequestConfig): boolean {
    if (!config || config.retryAttempts === 0) return false;

    // Don't retry if it's a client error (4xx) except for specific cases
    const status = error.response?.status;
    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }

    // Retry on network errors, 5xx errors, timeouts, and rate limits
    return (
      !error.response || // Network error
      status >= 500 || // Server error
      error.code === 'ECONNABORTED' || // Timeout
      status === 429 // Rate limit
    );
  }

  private async retryRequest(error: AxiosError): Promise<any> {
    const config = error.config as RequestConfig;
    const retryAttempts = config.retryAttempts ?? this.config.retryAttempts ?? 3;
    
    if (retryAttempts > 0) {
      config.retryAttempts = retryAttempts - 1;
      
      // Calculate delay with exponential backoff
      const baseDelay = this.config.retryDelay ?? 1000;
      const delay = baseDelay * Math.pow(2, (this.config.retryAttempts ?? 3) - retryAttempts);
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, totalDelay));
      
      return this.client(config);
    }

    return Promise.reject(error);
  }

  private async handleUnauthorized(error: AxiosError) {
    const config = error.config as RequestConfig;

    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        // Try to refresh authentication
        // This could be a call to refresh token endpoint
        // For now, just trigger the unauthorized callback
        this.config.onUnauthorized?.();
      } finally {
        this.isRefreshing = false;
        this.processQueue();
      }
    }

    // Queue the original request
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        config,
        resolve,
        reject,
      });
    });
  }

  private processQueue() {
    this.requestQueue.forEach(({ config, resolve, reject }) => {
      this.client(config)
        .then(resolve)
        .catch(reject);
    });
    
    this.requestQueue = [];
  }

  // Public methods
  public get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  public setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL;
  }

  public setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  public getActiveRequestsCount(): number {
    return this.activeRequests;
  }

  public cancelAllRequests(message = 'Operation cancelled') {
    // Cancel all pending requests
    const source = axios.CancelToken.source();
    source.cancel(message);
  }
}

export default ApiClient;