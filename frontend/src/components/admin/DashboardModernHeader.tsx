import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import * as Icons from 'lucide-react';

interface DashboardModernHeaderProps {
  title: string;
  total: number;
  color: string;
  icon: string;
}

export default function DashboardModernHeader({ title, total, color, icon }: DashboardModernHeaderProps) {
  const pathMap: Record<string, string> = {
    Links: "links",
    Arquivos: "files",
    Categorias: "categories",
    Cores: "colors",
    "Usuários": "users",
  };
  const path = pathMap[title] || title.toLowerCase();
  const IconComponent = (Icons as any)[icon] || Icons.Circle;

  return (
    <div 
      className="p-4" 
      style={{ borderBottom: `1px solid var(--dashboard-list-border)` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--dashboard-stat-icon)' }}
          >
            <IconComponent 
              className="w-3 h-3"
              style={{ color: 'var(--text-on-dark)' }}
            />
          </div>
          <div>
            <h3 
              className="font-medium text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h3>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {total} {total === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>
        <Link
          to={`/admin/${path}`}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
          style={{
            background: 'var(--button-primary)',
            color: 'var(--text-on-dark)',
            '&:hover': { background: 'var(--button-primary-hover)' }
          }}
        >
          <Plus size={12} /> Add
        </Link>
      </div>
    </div>
  );
}