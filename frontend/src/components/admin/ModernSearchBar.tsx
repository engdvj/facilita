import React from 'react';
import { Search } from 'lucide-react';

interface ModernSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ModernSearchBar({ 
  value, 
  onChange, 
  placeholder = "Buscar..." 
}: ModernSearchBarProps) {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 text-sm rounded-lg transition-colors"
        style={{
          background: 'var(--input-background)',
          border: `1px solid var(--input-border)`,
          color: 'var(--input-text)'
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}