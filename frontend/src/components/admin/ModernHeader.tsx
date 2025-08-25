import React from 'react';
import * as Icons from 'lucide-react';

interface ModernHeaderProps {
  title: string;
  total: number;
  color: string;
  icon: string;
}

export default function ModernHeader({ title, total, color, icon }: ModernHeaderProps) {
  const Icon = (Icons as any)[icon] || Icons.Circle;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {total} {total === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </div>
      <div 
        className="h-px w-full"
        style={{ backgroundColor: 'var(--border-primary)' }}
      />
    </div>
  );
}