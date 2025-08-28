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
  color?: string;
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

const getGradientByColor = (color: string) => {
  switch(color) {
    case "#2563eb": // Links - Azul
      return "linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)";
    case "#16a34a": // Arquivos - Verde  
      return "linear-gradient(135deg, #22c55e 0%, #15803d 50%, #166534 100%)";
    case "#9333ea": // Categorias - Roxo
      return "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)";
    case "#e11d48": // Cores - Rosa
      return "linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be185d 100%)";
    case "#6366f1": // Usuários - Índigo
      return "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)";
    default:
      return `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%)`;
  }
};

export default function DashboardColumn({
  title,
  subtitle,
  icon,
  total,
  color = "#6b7280",
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
      <motion.div 
        className="relative p-4 flex items-center justify-center overflow-hidden"
        style={{ 
          background: getGradientByColor(color),
          boxShadow: `0 2px 10px ${color}30`
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Número central */}
        <motion.div 
          className="relative z-10 flex items-center justify-center text-white font-bold text-lg"
          style={{ 
            textShadow: `0 1px 4px rgba(0,0,0,0.4)`
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ 
            scale: 1.05
          }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "?" : total || 0}
        </motion.div>
      </motion.div>

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