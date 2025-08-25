import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Folder } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Category } from '../../types/admin';
import DashboardModernHeader from './DashboardModernHeader';
import DashboardModernSearchBar from './DashboardModernSearchBar';
import DashboardModernPaginator from './DashboardModernPaginator';

interface CategoriesColumnProps {
  cats: Category[];
  total: number;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  startEditCat: (cat: { id: number }) => void;
  removeCat: (id: number) => Promise<void>;
}

export default function CategoriesColumn({
  cats,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  startEditCat,
  removeCat,
}: CategoriesColumnProps) {
  return (
    <motion.section 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <DashboardModernHeader title="Categorias" total={total} color="bg-purple-500" icon="Folder" />
      <div className="p-4">
        <DashboardModernSearchBar value={query} onChange={setQuery} />

        <motion.div
          className="space-y-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cats.length > 0 ? (
            cats.map((c) => {
              const Icon = (Icons as any)[c.icon || "Folder"];
              return (
                <motion.div
                  key={c.id}
                  layout
                  className="flex items-center gap-3 p-3 rounded-md transition-colors group"
                  style={{
                    background: 'var(--dashboard-list-item)',
                    border: `1px solid var(--dashboard-list-border)`
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: c.color }}
                  />
                  <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm"
                    style={{ background: 'var(--background-elevated)' }}
                  >
                    {Icon && <Icon size={14} style={{ color: 'var(--dashboard-stat-icon)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium truncate text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >{c.name}</p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >{c.color}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditCat(c)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeCat(c.id)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <div 
                className="w-10 h-10 rounded-md mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'var(--dashboard-empty-state)' }}
              >
                <Icons.Folder 
                  className="w-5 h-5"
                  style={{ color: 'var(--dashboard-empty-icon)' }}
                />
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >Nenhuma categoria encontrada</p>
            </div>
          )}
        </motion.div>
        
        <DashboardModernPaginator 
          page={page} 
          pageCount={pageCount} 
          setPage={setPage} 
        />
      </div>
    </motion.section>
  );
}