import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardModernPaginatorProps {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}

export default function DashboardModernPaginator({
  page,
  pageCount,
  setPage,
}: DashboardModernPaginatorProps) {
  if (pageCount <= 1) return null;
  return (
    <div 
      className="flex justify-center items-center gap-2 mt-4 pt-3"
      style={{ borderTop: `1px solid var(--dashboard-list-border)` }}
    >
      <button
        disabled={page === 1}
        onClick={() => setPage(Math.max(1, page - 1))}
        className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{
          border: `1px solid var(--input-border)`,
          color: 'var(--text-tertiary)',
          background: 'var(--input-background)'
        }}
      >
        <ChevronLeft size={14} />
      </button>
      <span 
        className="px-3 py-1.5 text-xs font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {page} de {pageCount}
      </span>
      <button
        disabled={page === pageCount}
        onClick={() => setPage(Math.min(pageCount, page + 1))}
        className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{
          border: `1px solid var(--input-border)`,
          color: 'var(--text-tertiary)',
          background: 'var(--input-background)'
        }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}