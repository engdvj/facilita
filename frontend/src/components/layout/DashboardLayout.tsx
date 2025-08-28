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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hasSidebar = !!sidebar;

  return (
    <div 
      className="h-screen max-h-screen overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--background-main)' }}
    >
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {hasSidebar && (
          <motion.aside
            className="w-60 transform transition-all fixed left-0 z-20 hover:shadow-lg"
            style={{
              top: '76px',
              height: 'calc(100vh - 76px)',
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
              x: sidebarOpen ? 0 : -240
            }}
            transition={{ 
              type: "tween",
              duration: 0.2,
              ease: "easeOut"
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar">
              {sidebar}
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-500 overflow-y-auto custom-scrollbar ${
            hasSidebar && sidebarOpen ? 'lg:ml-60' : ''
          }`}
        >
          <div 
            className={`mx-auto p-2 lg:p-3 ${contentClassName}`} 
            style={{ maxWidth }}
          >
            {/* Header Section */}
            <motion.div 
              className="mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-1">
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