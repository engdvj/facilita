import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function ErrorFallback({ 
  error, 
  resetError, 
  message = "Algo deu errado",
  action,
  className = "" 
}: ErrorFallbackProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center p-6 text-center rounded-lg
      bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800
      ${className}
    `}>
      <AlertTriangle className="text-red-500 mb-3" size={32} />
      
      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
        {message}
      </h3>
      
      {error && (
        <p className="text-red-600 dark:text-red-300 text-sm mb-4 max-w-md">
          {error.message}
        </p>
      )}
      
      <div className="flex gap-2">
        {resetError && (
          <Button
            size="sm"
            variant="secondary"
            onClick={resetError}
            icon={<RefreshCw size={14} />}
          >
            Tentar novamente
          </Button>
        )}
        
        {action && (
          <Button
            size="sm"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}