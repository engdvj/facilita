import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface StatData {
  title: string;
  count: string | number;
  color: string;
  icon: string;
  key: string;
}

interface AdminStatsProps {
  statsData: StatData[];
  focusedSection: string | null;
  onStatClick: (statKey: string) => void;
  loading?: boolean;
}

export default function AdminStats({ statsData, focusedSection, onStatClick, loading }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {statsData.map((stat, index) => {
        const isActive = focusedSection === stat.key;
        return (
          <motion.div 
            key={stat.title}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isActive ? 'ring-2 ring-offset-1' : ''
            }`}
            style={{
              background: 'var(--card-background)',
              borderColor: isActive ? stat.color : 'var(--card-border)',
              ringColor: isActive ? stat.color : 'transparent',
              boxShadow: isActive ? `0 0 20px ${stat.color}40` : 'none'
            }}
            onClick={() => onStatClick(stat.key)}
            whileHover={{ 
              scale: 1.02,
              boxShadow: `0 8px 25px ${stat.color}30`
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: isActive ? 1.05 : 1,
              rotate: isActive ? [0, 1, -1, 0] : 0
            }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: stat.color }}
                whileHover={{ 
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.3 }
                }}
              >
                {(() => {
                  const IconComponent = Icons[stat.icon as keyof typeof Icons];
                  return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                })()}
              </motion.div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {stat.title}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}