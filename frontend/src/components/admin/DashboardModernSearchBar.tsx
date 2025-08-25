import React from 'react';
import { Search } from 'lucide-react';

interface DashboardModernSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function DashboardModernSearchBar({
  value,
  onChange,
}: DashboardModernSearchBarProps) {
  return (
    <div className="relative">
      <Search 
        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" 
        style={{ color: 'var(--text-tertiary)' }}
      />
      <input
        className="w-full pl-8 pr-3 py-2 rounded-md transition-colors text-sm"
        style={{
          background: 'var(--input-background)',
          border: `1px solid var(--input-border)`,
          color: 'var(--input-text)'
        }}
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}