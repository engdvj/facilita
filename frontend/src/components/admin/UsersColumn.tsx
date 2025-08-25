import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, User, Users } from 'lucide-react';
import * as Icons from 'lucide-react';
import { User as UserType } from '../../types/admin';
import DashboardModernHeader from './DashboardModernHeader';
import DashboardModernSearchBar from './DashboardModernSearchBar';
import DashboardModernPaginator from './DashboardModernPaginator';

interface UsersColumnProps {
  users: UserType[];
  total: number;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  startEditUser: (u: { id: number }) => void;
  removeUser: (id: number) => Promise<void>;
}

export default function UsersColumn({
  users,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  startEditUser,
  removeUser,
}: UsersColumnProps) {
  return (
    <motion.section 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <DashboardModernHeader title="Usuários" total={total} color="bg-indigo-500" icon="Users" />
      <div className="p-4">
        <DashboardModernSearchBar value={query} onChange={setQuery} />

        <motion.div 
          className="space-y-3 mt-4" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          {users.length > 0 ? (
            users.map((u) => (
              <motion.div
                key={u.id}
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
                  <Icons.User 
                    size={14} 
                    style={{ color: 'var(--dashboard-stat-icon)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >{u.username}</p>
                  {u.isAdmin && (
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                      style={{
                        background: 'var(--badge-background)',
                        color: 'var(--badge-text)',
                        border: `1px solid var(--badge-border)`
                      }}
                    >
                      Administrador
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEditUser(u)} 
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => removeUser(u.id)} 
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
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
                <Icons.Users 
                  className="w-5 h-5"
                  style={{ color: 'var(--dashboard-empty-icon)' }}
                />
              </div>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >Nenhum usuário encontrado</p>
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