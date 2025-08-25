import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: ButtonVariant) => {
  const styles = {
    primary: {
      background: 'var(--button-primary)',
      color: 'var(--button-primary-text)',
      borderColor: 'var(--button-primary)',
      '&:hover': {
        background: 'var(--button-primary-hover)',
      }
    },
    secondary: {
      background: 'var(--button-secondary)',
      color: 'var(--button-secondary-text)',
      borderColor: 'var(--border-primary)',
      '&:hover': {
        background: 'var(--button-secondary-hover)',
      }
    },
    danger: {
      background: 'var(--button-danger)',
      color: 'var(--button-danger-text)',
      borderColor: 'var(--button-danger)',
      '&:hover': {
        background: 'var(--button-danger-hover)',
      }
    },
    success: {
      background: 'var(--success)',
      color: 'var(--text-on-dark)',
      borderColor: 'var(--success)',
      '&:hover': {
        background: 'var(--success-dark)',
      }
    },
    warning: {
      background: 'var(--warning)',
      color: 'var(--text-on-dark)',
      borderColor: 'var(--warning)',
      '&:hover': {
        background: 'var(--warning-dark)',
      }
    },
    info: {
      background: 'var(--info)',
      color: 'var(--text-on-dark)',
      borderColor: 'var(--info)',
      '&:hover': {
        background: 'var(--info-dark)',
      }
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'transparent',
      '&:hover': {
        background: 'var(--hover-overlay)',
      }
    }
  };
  return styles[variant];
};

const getSizeStyles = (size: ButtonSize, iconOnly: boolean) => {
  const styles = {
    sm: iconOnly ? 'p-1.5' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2' : 'px-4 py-2 text-sm',
    lg: iconOnly ? 'p-3' : 'px-6 py-3 text-base',
  };
  return styles[size];
};

export default function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  disabled = false,
  loading = false,
  onClick,
  className = "",
  title,
  type = 'button'
}: ActionButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeClasses = getSizeStyles(size, iconOnly);
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        action-button inline-flex items-center justify-center gap-2 
        border rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        ${sizeClasses} ${className}
      `}
      style={{
        background: variantStyles.background,
        color: variantStyles.color,
        borderColor: variantStyles.borderColor,
      }}
      title={title}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className={iconOnly ? 'w-4 h-4' : `w-4 h-4 ${children ? '' : ''}`} />
      ) : null}
      
      {!iconOnly && children && (
        <span>{children}</span>
      )}
    </motion.button>
  );
}