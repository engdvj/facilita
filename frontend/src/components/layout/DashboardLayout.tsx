import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../Header';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  title: string;
  subtitle: string;
  stats?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
}

export default function DashboardLayout({ 
  children, 
  sidebar, 
  title, 
  subtitle, 
  stats,
  actions,
  className = "",
  contentClassName = "",
  maxWidth = "1920px"
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasSidebar = !!sidebar;

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--background-main)' }}
    >
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {hasSidebar && (
          <motion.aside
            className="w-60 transform transition-all fixed top-0 bottom-0 left-0 z-20 lg:relative lg:z-auto hover:shadow-lg"
            style={{
              background: 'var(--sidebar-background)',
              borderRight: `1px solid var(--sidebar-border)`,
              boxShadow: `0 4px 12px var(--card-shadow)`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover-background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-background)';
            }}
            initial={false}
            animate={{ 
              x: sidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -240) 
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar">
              {sidebar}
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 overflow-hidden custom-scrollbar ${
            hasSidebar ? 'lg:ml-0' : ''
          }`}
        >
          <div className={`mx-auto p-4 lg:p-6 ${contentClassName}`} style={{ maxWidth }}>
            {/* Header Section */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <h1 
                    className="text-xl lg:text-2xl font-bold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </h1>
                  <p 
                    className="text-sm lg:text-base"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {subtitle}
                  </p>
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {actions}
                  </div>
                )}
              </div>

              {/* Stats Section */}
              {stats && (
                <motion.div 
                  className="stats-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {stats}
                </motion.div>
              )}
            </motion.div>
            
            {/* Content */}
            <motion.div 
              className={`dashboard-content ${className}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Sidebar Overlay for mobile */}
        {hasSidebar && sidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
    </div>
  );
}