import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import ActionButton from './ActionButton';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon | ReactNode;
  iconColor?: string;
  iconBg?: string;
  imageUrl?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  actions?: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
  }>;
  onClick?: () => void;
  href?: string;
  target?: string;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
}

const getBadgeStyles = (variant: string) => {
  const styles = {
    success: {
      background: 'var(--success-bg)',
      color: 'var(--success)',
      borderColor: 'var(--success-border)'
    },
    warning: {
      background: 'var(--warning-bg)',
      color: 'var(--warning)',
      borderColor: 'var(--warning-border)'
    },
    error: {
      background: 'var(--error-bg)',
      color: 'var(--error)',
      borderColor: 'var(--error-border)'
    },
    info: {
      background: 'var(--info-bg)',
      color: 'var(--info)',
      borderColor: 'var(--info-border)'
    },
    default: {
      background: 'var(--badge-background)',
      color: 'var(--badge-text)',
      borderColor: 'var(--badge-border)'
    }
  };
  return styles[variant as keyof typeof styles] || styles.default;
};

export default function ListItem({
  title,
  subtitle,
  description,
  icon,
  iconColor,
  iconBg,
  imageUrl,
  badge,
  actions = [],
  onClick,
  href,
  target,
  className = "",
  style,
  index = 0
}: ListItemProps) {
  const isClickable = !!(onClick || href);
  const Component = href ? 'a' : 'div';
  
  const IconComponent = typeof icon === 'function' ? icon : null;
  const badgeStyles = badge ? getBadgeStyles(badge.variant || 'default') : {};

  return (
    <Component
      className={`
        flex items-center gap-2 p-1.5 rounded transition-all group text-xs
        ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${className}
      `}
      style={{
        background: 'var(--card-background)',
        ...style
      }}
      onClick={onClick}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {/* Icon or Image */}
      {(imageUrl || icon || IconComponent) && (
        <div 
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ 
            background: imageUrl ? 'transparent' : (iconBg || 'var(--dashboard-stat-icon-bg)'),
            color: iconColor || 'var(--dashboard-stat-icon)'
          }}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Se a imagem falhar, mostrar o ícone padrão
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && (icon || IconComponent)) {
                  parent.style.background = iconBg || 'var(--dashboard-stat-icon-bg)';
                  const iconElement = React.isValidElement(icon) ? icon : 
                    IconComponent ? React.createElement(IconComponent, { className: "w-3 h-3" }) : null;
                  if (iconElement) {
                    const container = document.createElement('div');
                    parent.appendChild(container);
                  }
                }
              }}
            />
          ) : (
            React.isValidElement(icon) ? icon : 
            IconComponent ? <IconComponent className="w-3 h-3" /> : null
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 
          className="font-medium text-xs truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h4>
        {subtitle && (
          <p 
            className="text-xs truncate opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle.length > 30 ? subtitle.substring(0, 30) + '...' : subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions.slice(0, 2).map((action, actionIndex) => (
            <button
              key={actionIndex}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              disabled={action.disabled}
              title={action.label}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              style={{ color: action.variant === 'danger' ? 'var(--error)' : 'var(--text-tertiary)' }}
            >
              {React.createElement(action.icon, { className: "w-3 h-3" })}
            </button>
          ))}
        </div>
      )}
    </Component>
  );
}