import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check, X, Palette } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Color } from '../../types/admin';
import DashboardModernHeader from './DashboardModernHeader';
import DashboardModernSearchBar from './DashboardModernSearchBar';
import DashboardModernPaginator from './DashboardModernPaginator';

interface ColorsColumnProps {
  items: Color[];
  total: number;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  editColorId: number | null;
  editColor: string;
  editColorName: string;
  setEditColor: (color: string) => void;
  setEditColorName: (name: string) => void;
  setEditColorId: (id: number | null) => void;
  startEditColor: (c: { id: number; value: string; name?: string }) => void;
  saveColor: () => Promise<void>;
  removeColor: (id: number) => Promise<void>;
  colorInputClass: string;
}

export default function ColorsColumn({
  items,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  editColorId,
  editColor,
  editColorName,
  setEditColor,
  setEditColorName,
  setEditColorId,
  startEditColor,
  saveColor,
  removeColor,
  colorInputClass,
}: ColorsColumnProps) {
  return (
    <motion.section 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <DashboardModernHeader title="Cores" total={total} color="bg-pink-500" icon="Palette" />
      <div className="p-4">
        <DashboardModernSearchBar value={query} onChange={setQuery} />

        <motion.div
          className="space-y-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items.length > 0 ? (
            items.map((c) => (
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
                  className="w-6 h-6 rounded-lg border-2 border-white shadow-sm" 
                  style={{ backgroundColor: c.value }}
                />
                
                {editColorId === c.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e) =>
                        setEditColor(e.target.value)
                      }
                      className="px-3 py-2 rounded-lg font-mono text-sm transition-colors"
                      style={{
                        background: 'var(--input-background)',
                        border: `1px solid var(--input-border)`,
                        color: 'var(--input-text)'
                      }}
                      placeholder="#000000"
                    />
                    <input
                      type="text"
                      placeholder="Nome opcional"
                      value={editColorName}
                      onChange={(e) =>
                        setEditColorName(e.target.value)
                      }
                      className="px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background: 'var(--input-background)',
                        border: `1px solid var(--input-border)`,
                        color: 'var(--input-text)'
                      }}
                    />
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={saveColor} 
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: 'var(--success)' }}
                      >
                        <Icons.Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditColorId(null)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <Icons.X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-mono text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >{c.value}</p>
                      {c.name && (
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >{c.name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditColor(c)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeColor(c.id)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <div 
                className="w-10 h-10 rounded-md mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'var(--dashboard-empty-state)' }}
              >
                <Icons.Palette 
                  className="w-5 h-5"
                  style={{ color: 'var(--dashboard-empty-icon)' }}
                />
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >Nenhuma cor encontrada</p>
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