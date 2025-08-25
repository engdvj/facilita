import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function DashboardCard({ 
  children, 
  className = "", 
  hover = true,
  onClick,
  style 
}: DashboardCardProps) {
  return (
    <motion.div
      className={`dashboard-card rounded-lg border overflow-hidden transition-all duration-200 ${
        hover ? 'hover:shadow-lg cursor-pointer' : ''
      } ${className}`}
      style={{
        background: 'var(--card-background)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        ...style
      }}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}