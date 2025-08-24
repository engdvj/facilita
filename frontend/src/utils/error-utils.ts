import { AxiosError } from 'axios';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: string;
  id: string;
}

export function createAppError(
  message: string, 
  code?: string, 
  status?: number, 
  details?: any
): AppError {
  return {
    message,
    code,
    status,
    details,
    timestamp: new Date().toISOString(),
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

export function parseApiError(error: unknown): AppError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Handle different error response formats
    if (data) {
      if (typeof data === 'string') {
        return createAppError(data, 'API_ERROR', status);
      }
      
      if (data.message) {
        return createAppError(
          data.message, 
          data.error || data.code || 'API_ERROR', 
          status,
          data.details || data.errors
        );
      }
      
      if (data.error) {
        return createAppError(data.error, 'API_ERROR', status);
      }
    }
    
    // Fallback to axios error message
    return createAppError(
      error.message || 'Network error occurred',
      'NETWORK_ERROR',
      status
    );
  }
  
  if (error instanceof Error) {
    return createAppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return createAppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}

export function getErrorMessage(error: unknown): string {
  const appError = parseApiError(error);
  return appError.message;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response || error.code === 'NETWORK_ERROR';
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 422;
  }
  return false;
}

export function logError(error: AppError, context?: string) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    console.error('ID:', error.id);
    console.error('Timestamp:', error.timestamp);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.groupEnd();
  }
  
  // TODO: Send to error tracking service in production
  // errorTrackingService.log(error, context);
}

export class RetryableError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public errors?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleAsyncError<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = parseApiError(error);
      logError(appError, fn.name);
      
      // Re-throw specific errors that should be handled by components
      if (isAuthError(error)) {
        throw new AuthenticationError(appError.message);
      }
      
      if (isValidationError(error)) {
        throw new ValidationError(appError.message, undefined, appError.details);
      }
      
      if (isNetworkError(error)) {
        throw new NetworkError(appError.message);
      }
      
      // For other errors, return null and let component handle gracefully
      return null;
    }
  };
}