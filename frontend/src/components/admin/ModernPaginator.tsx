import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModernPaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ModernPaginator({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ModernPaginatorProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--button-secondary)',
            border: `1px solid var(--border-primary)`,
            color: 'var(--text-primary)'
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--button-secondary)',
            border: `1px solid var(--border-primary)`,
            color: 'var(--text-primary)'
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}