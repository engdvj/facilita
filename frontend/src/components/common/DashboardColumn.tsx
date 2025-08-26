import React, { ReactNode } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardCard from './DashboardCard';
import ActionButton from './ActionButton';

interface DashboardColumnProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  total?: number;
  query?: string;
  onQueryChange?: (query: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DashboardColumn({
  title,
  subtitle,
  icon,
  total,
  query = "",
  onQueryChange,
  onAdd,
  addLabel = "Adicionar",
  page = 1,
  pageCount = 1,
  onPageChange,
  children,
  actions,
  className = "",
  loading = false,
  emptyMessage = "Nenhum item encontrado"
}: DashboardColumnProps) {
  
  const hasSearch = !!onQueryChange;
  const hasPagination = pageCount > 1 && !!onPageChange;
  
  return (
    <DashboardCard className={`flex flex-col h-[380px] ${className}`} hover={false}>
      {/* Header */}
      <div className="p-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {title} ({total || 0})
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 space-y-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
          ))
        ) : React.Children.count(children) > 0 ? (
          children
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasPagination && (
        <div className="p-2 border-t flex items-center justify-center gap-2" style={{ borderColor: 'var(--card-border)' }}>
          <ActionButton
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page === 1}
            iconOnly
            title="Página anterior"
          />
          <span className="text-xs px-2" style={{ color: 'var(--text-secondary)' }}>
            {page}/{pageCount}
          </span>
          <ActionButton
            variant="secondary"
            size="sm"
            icon={ChevronRight}
            onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            iconOnly
            title="Próxima página"
          />
        </div>
      )}
    </DashboardCard>
  );
}