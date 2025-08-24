import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

export default function ProgressBar({
  progress,
  size = 'md',
  color = 'blue',
  showPercentage = false,
  label,
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={`
        w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
        ${sizeClasses[size]}
      `}>
        <div
          className={`
            h-full transition-all duration-300 ease-out rounded-full
            ${colorClasses[color]}
          `}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}