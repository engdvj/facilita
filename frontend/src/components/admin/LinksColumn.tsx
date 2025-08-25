import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LinksColumnProps } from '../../types/admin';
import ModernHeader from './ModernHeader';
import ModernSearchBar from './ModernSearchBar';
import ModernPaginator from './ModernPaginator';

export default function LinksColumn({
  links,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  removeLink,
  categoryMap,
}: LinksColumnProps) {
  return (
    <section 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
    >
      <ModernHeader title="Links" total={total} color="#2563eb" icon="Link2" />
      <div className="p-4">
        <ModernSearchBar value={query} onChange={setQuery} />

        <div className="space-y-2 mt-3">
          {links.length > 0 ? (
            links.map((l) => {
              const CatIcon =
                (Icons as any)[categoryMap[l.categoryId || 0]?.icon || "Link2"];
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-2 p-3 rounded-md transition-colors group"
                  style={{
                    background: 'var(--dashboard-list-item)',
                    border: `1px solid var(--dashboard-list-border)`,
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{
                      backgroundColor: categoryMap[l.categoryId || 0]?.color || 'var(--dashboard-stat-icon)',
                    }}
                  />
                  <div 
                    className="w-7 h-7 rounded-md flex items-center justify-center shadow-sm"
                    style={{ background: 'var(--background-elevated)' }}
                  >
                    {CatIcon && (
                      <CatIcon 
                        size={14} 
                        style={{ color: 'var(--dashboard-stat-icon)' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium truncate text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {l.title}
                    </p>
                    {l.user && (
                      <p 
                        className="text-xs truncate"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        por {l.user}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/admin/links/${l.id}`}
                      className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                      style={{
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => removeLink(l.id)}
                      className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                      style={{
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <div 
                className="w-10 h-10 rounded-md mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'var(--dashboard-empty-state)' }}
              >
                <Icons.Link2 
                  className="w-5 h-5"
                  style={{ color: 'var(--dashboard-empty-icon)' }}
                />
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >Nenhum link encontrado</p>
            </div>
          )}
        </div>
        
        <ModernPaginator currentPage={page} totalPages={pageCount} onPageChange={setPage} />
      </div>
    </section>
  );
}