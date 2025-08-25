import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home as HomeIcon } from 'lucide-react';

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UserLinksNavigation({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: NavigationProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <NavLink 
        to="/" 
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ 
          color: 'var(--text-secondary)',
          '&:hover': { color: 'var(--text-primary)' }
        }}
      >
        <HomeIcon className="w-4 h-4" />
        Voltar para início
      </NavLink>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--button-secondary)',
              border: `1px solid var(--border-primary)`,
              color: 'var(--text-primary)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span 
            className="text-sm px-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--button-secondary)',
              border: `1px solid var(--border-primary)`,
              color: 'var(--text-primary)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}