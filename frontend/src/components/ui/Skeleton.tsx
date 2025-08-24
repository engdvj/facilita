import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export default function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${roundedClasses[rounded]}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1">
          <Skeleton height="1rem" width="60%" className="mb-2" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 p-2">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height="1.25rem" width="100%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1rem" width="100%" />
          ))}
        </div>
      ))}
    </div>
  );
}