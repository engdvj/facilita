import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: `
    bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium
    backdrop-blur-md border border-blue-400/30
    hover:from-blue-400 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105
    active:scale-95 active:from-blue-600 active:to-blue-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    transition-all duration-300 ease-out
  `,
  secondary: `
    bg-white/10 backdrop-blur-md text-white font-medium border border-white/20
    hover:bg-white/20 hover:border-white/40 hover:scale-105
    active:scale-95 active:bg-white/25
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    transition-all duration-300 ease-out
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 text-white font-medium
    backdrop-blur-md border border-red-400/30
    hover:from-red-400 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105
    active:scale-95 active:from-red-600 active:to-red-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    transition-all duration-300 ease-out
  `,
  success: `
    bg-gradient-to-r from-green-500 to-green-600 text-white font-medium
    backdrop-blur-md border border-green-400/30
    hover:from-green-400 hover:to-green-500 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105
    active:scale-95 active:from-green-600 active:to-green-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    transition-all duration-300 ease-out
  `,
  ghost: `
    bg-transparent text-white/80 font-medium border border-transparent
    hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-105
    active:scale-95 active:bg-white/15
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    transition-all duration-300 ease-out
  `
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl',
  xl: 'px-8 py-4 text-xl rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent
        relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 size={16} className="animate-spin" />
      )}
      
      {/* Left icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {/* Button text */}
      {children && (
        <span className={loading ? 'opacity-0' : ''}>
          {children}
        </span>
      )}
      
      {/* Right icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}