import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, FileIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FileData } from '../../types/admin';
import DashboardModernHeader from './DashboardModernHeader';
import DashboardModernSearchBar from './DashboardModernSearchBar';
import DashboardModernPaginator from './DashboardModernPaginator';

interface FilesColumnProps {
  files: FileData[];
  total: number;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  removeFile: (id: number) => Promise<void>;
  categoryMap: Record<number, string>;
  userMap: Record<number, string>;
}

export default function FilesColumn({
  files,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  removeFile,
  categoryMap,
  userMap,
}: FilesColumnProps) {
  return (
    <motion.section 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <DashboardModernHeader title="Arquivos" total={total} color="bg-green-500" icon="FileIcon" />
      <div className="p-4">
        <DashboardModernSearchBar value={query} onChange={setQuery} />

        <motion.div
          className="space-y-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {files.length > 0 ? (
            files.map((f) => (
              <motion.div
                key={f.id}
                layout
                className="flex items-center gap-3 p-3 rounded-md transition-colors group"
                style={{
                  background: 'var(--dashboard-list-item)',
                  border: `1px solid var(--dashboard-list-border)`
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm"
                  style={{ background: 'var(--background-elevated)' }}
                >
                  <Icons.FileIcon 
                    size={14} 
                    style={{ color: 'var(--dashboard-stat-icon)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium truncate text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >{f.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {f.categoryId && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'var(--badge-background)',
                          color: 'var(--badge-text)',
                          border: `1px solid var(--badge-border)`
                        }}
                      >
                        {categoryMap[f.categoryId]}
                      </span>
                    )}
                    {f.userId && (
                      <span style={{ color: 'var(--text-tertiary)' }}>por {userMap[f.userId]}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md transition-colors"
                    style={{
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    <Icons.Download size={14} />
                  </a>
                  <button 
                    onClick={() => removeFile(f.id)} 
                    className="p-1.5 rounded-md transition-colors"
                    style={{
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <div 
                className="w-10 h-10 rounded-md mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'var(--dashboard-empty-state)' }}
              >
                <Icons.FileIcon 
                  className="w-5 h-5"
                  style={{ color: 'var(--dashboard-empty-icon)' }}
                />
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >Nenhum arquivo encontrado</p>
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