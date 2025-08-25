import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  actions?: ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  searchQuery = "",
  onSearchChange,
  page = 1,
  pageSize = 10,
  totalPages = 1,
  onPageChange,
  actions,
  emptyMessage = "Nenhum item encontrado",
  loading = false,
  className = ""
}: DataTableProps<T>) {
  
  const hasSearch = !!onSearchChange;
  const hasPagination = totalPages > 1 && !!onPageChange;
  
  return (
    <div className={`data-table-container ${className}`}>
      {/* Header */}
      {(title || subtitle || hasSearch || actions) && (
        <div 
          className="table-header p-4 border-b"
          style={{ borderColor: 'var(--dashboard-list-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              {title && (
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          {hasSearch && (
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                style={{
                  background: 'var(--search-background)',
                  borderColor: 'var(--search-border)',
                  color: 'var(--search-text)',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              style={{ 
                background: 'var(--table-header)',
                borderBottom: `1px solid var(--table-border)`
              }}
            >
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-sm font-semibold ${column.className || ''}`}
                  style={{ color: 'var(--table-header-text)' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <div 
                        className="h-4 rounded animate-pulse"
                        style={{ background: 'var(--skeleton-base)' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <motion.tr
                  key={index}
                  className="table-row border-b transition-colors"
                  style={{
                    background: index % 2 === 0 ? 'var(--table-row)' : 'var(--table-row-alt)',
                    borderColor: 'var(--table-border)',
                    '&:hover': { background: 'var(--table-row-hover)' }
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'var(--table-row-hover)' }}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-4 py-3 text-sm ${column.className || ''}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {column.render 
                        ? column.render(item, index)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div 
                    className="text-base"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasPagination && (
        <div 
          className="table-footer flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: 'var(--dashboard-list-border)' }}
        >
          <div 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="pagination-btn p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--button-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="pagination-btn p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--button-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}