import React from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LinkData } from '../LinkCard';

interface AdminLinkListProps {
  links: LinkData[];
  onEdit: (link: LinkData) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminLinkList({ links, onEdit, onDelete, currentPage, totalPages, onPageChange }: AdminLinkListProps) {
  return (
    <div className="rounded-lg border" style={{ 
      background: 'var(--card-background)', 
      borderColor: 'var(--card-border)',
      height: '410px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="p-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Meus Links
        </h3>
      </div>
      <div className="p-2 space-y-2 flex-1 overflow-y-auto">
        {links.map((link) => (
        <div key={link.id} className="p-1.5 border rounded mb-1.5" style={{ borderColor: 'var(--card-border)', background: 'var(--card-background)' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>
                {link.title}
              </h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {link.url}
              </p>
              {link.fileUrl && (
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  📎 Arquivo anexo
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <button 
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={() => onEdit(link)}
              >
                <Pencil size={12} />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 text-red-500"
                onClick={() => onDelete(link.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>
      
      {/* Paginação fixa no final */}
      <div className="flex justify-center items-center gap-3 px-2 py-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
          style={{ background: 'var(--button-secondary)', color: 'var(--text-primary)' }}
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
          style={{ background: 'var(--button-secondary)', color: 'var(--text-primary)' }}
          title="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}