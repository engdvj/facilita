import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminRoute } from '../auth';
import { ErrorBoundary } from '../common';
import Header from './Header';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background pattern specific for admin */}
        <div className="absolute inset-0 bg-[url('/src/assets/admin-pattern.svg')] bg-repeat opacity-3" />
        
        {/* Darker overlay for admin area */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <ErrorBoundary level="admin">
            <Header />
            
            {/* Admin Content Area */}
            <main className="flex-1">
              <div className="container mx-auto px-4 py-8">
                {/* Admin Header */}
                <div className="mb-8">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                          Painel Administrativo
                        </h1>
                        <p className="text-white/70">
                          Gerencie links, categorias, cores e usuários do sistema
                        </p>
                      </div>
                      
                      {/* Quick Stats or Actions */}
                      <div className="hidden lg:flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300">--</div>
                          <div className="text-xs text-white/60">Links Ativos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-300">--</div>
                          <div className="text-xs text-white/60">Categorias</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300">--</div>
                          <div className="text-xs text-white/60">Usuários</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Content */}
                <div className="space-y-6">
                  {children || <Outlet />}
                </div>
              </div>
            </main>

            {/* Admin Footer */}
            <footer className="mt-auto border-t border-white/10 bg-black/20">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center text-sm text-white/60">
                  <span>Área Administrativa - FACILITA CHVC</span>
                  <span>Acesso restrito a administradores</span>
                </div>
              </div>
            </footer>
          </ErrorBoundary>
        </div>
      </div>
    </AdminRoute>
  );
}