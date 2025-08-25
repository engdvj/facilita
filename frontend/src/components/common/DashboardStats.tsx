import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface StatItemProps {
  title: string;
  count: number;
  color: string;
  icon: keyof typeof Icons;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatCard({ title, count, color, icon, trend, delay = 0 }: StatItemProps) {
  const IconComponent = Icons[icon] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  
  return (
    <motion.div
      className="stat-card p-4 rounded-lg border"
      style={{
        background: 'var(--dashboard-stat-background)',
        borderColor: 'var(--dashboard-stat-border)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p 
            className="text-sm font-medium mb-1"
            style={{ color: 'var(--dashboard-stat-text)' }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-bold"
            style={{ color: 'var(--dashboard-stat-number)' }}
          >
            {count.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-xs font-medium"
                style={{ color: trend.isPositive ? 'var(--success)' : 'var(--error)' }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                vs mês anterior
              </span>
            </div>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ 
            background: 'var(--dashboard-stat-icon-bg)',
            color: color
          }}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats: StatItemProps[];
  className?: string;
}

export default function DashboardStats({ stats, className = "" }: DashboardStatsProps) {
  return (
    <div className={`stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard 
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}