import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { LinkData } from '../LinkCard';

interface AdminLinkListProps {
  links: LinkData[];
  onEdit: (link: LinkData) => void;
  onDelete: (id: number) => void;
}

export default function AdminLinkList({ links, onEdit, onDelete }: AdminLinkListProps) {
  return (
    <div className="p-3 rounded-lg border overflow-y-auto" style={{ 
      background: 'var(--card-background)', 
      borderColor: 'var(--card-border)',
      height: '100%'
    }}>
      <div className="sticky top-0 pb-2" style={{ background: 'var(--card-background)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Links ({links.length})
        </h3>
      </div>
      {links.map((link) => (
        <div key={link.id} className="p-2 border rounded mb-2" style={{ borderColor: 'var(--card-border)', background: 'var(--card-background)' }}>
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
  );
}