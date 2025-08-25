import React, { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

interface SidebarSectionProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function SidebarSection({ icon, title, subtitle, children }: SidebarSectionProps) {
  return (
    <div className="space-y-3">
      <div 
        className="flex items-center gap-2 pb-3" 
        style={{ borderBottom: `1px solid var(--sidebar-border)` }}
      >
        <div 
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: 'var(--dashboard-stat-icon)' }}
        >
          {icon}
        </div>
        <div>
          <h3 
            className="font-medium text-sm"
            style={{ color: 'var(--sidebar-text)' }}
          >
            {title}
          </h3>
          <p 
            className="text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Sidebar({ children, className = "" }: SidebarProps) {
  return (
    <div className={`sidebar-content px-4 pb-4 space-y-0 ${className}`} style={{ paddingTop: '30px' }}>
      {children}
    </div>
  );
}