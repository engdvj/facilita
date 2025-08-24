import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800 dark:text-green-200',
    messageColor: 'text-green-700 dark:text-green-300',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800 dark:text-red-200',
    messageColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800 dark:text-yellow-200',
    messageColor: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-200',
    messageColor: 'text-blue-700 dark:text-blue-300',
  },
};

export default function Toast({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className={`
      max-w-sm w-full rounded-lg border p-4 shadow-lg
      ${config.bgColor} ${config.borderColor}
    `}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </p>
          )}
          <p className={`text-sm ${title ? 'mt-1' : ''} ${config.messageColor}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2
                ${config.iconColor} hover:opacity-75
              `}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}