import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to monitoring service (implement as needed)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Here you would typically send to a service like Sentry, LogRocket, etc.
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundaryLevel: this.props.level || 'component',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // For now, just log to console
      console.error('Error logged:', errorData);
      
      // TODO: Implement actual error logging service
      // errorLoggingService.log(errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render different error UIs based on level
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI() {
    const { error, errorInfo, errorId } = this.state;
    const { level = 'component' } = this.props;

    const isGlobalError = level === 'global';
    const isPageError = level === 'page';

    return (
      <div className={`
        flex flex-col items-center justify-center p-8 text-center
        ${isGlobalError ? 'min-h-screen bg-[var(--background-main)]' : 'min-h-[300px]'}
        ${isPageError ? 'min-h-[400px]' : ''}
      `}>
        <div className="max-w-md mx-auto">
          <AlertCircle 
            className="mx-auto mb-4 text-red-500" 
            size={isGlobalError ? 64 : 48} 
          />
          
          <h2 className={`font-bold mb-2 ${isGlobalError ? 'text-2xl' : 'text-xl'}`}>
            {isGlobalError ? 'Algo deu errado!' : 'Erro neste componente'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isGlobalError 
              ? 'Ocorreu um erro inesperado. Tente recarregar a página.'
              : 'Este componente encontrou um problema e não pode ser exibido.'
            }
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Detalhes do erro (desenvolvimento)
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Erro:</strong> {error.message}
                </div>
                {errorId && (
                  <div>
                    <strong>ID:</strong> {errorId}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={this.handleRetry}
              icon={<RefreshCw size={16} />}
            >
              Tentar novamente
            </Button>
            
            {isGlobalError && (
              <>
                <Button
                  variant="secondary"
                  onClick={this.handleReload}
                >
                  Recarregar página
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  icon={<Home size={16} />}
                >
                  Ir para início
                </Button>
              </>
            )}
          </div>

          {errorId && (
            <p className="mt-4 text-xs text-gray-500">
              ID do erro: {errorId}
            </p>
          )}
        </div>
      </div>
    );
  }
}