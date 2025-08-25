import React from 'react';
import * as Icons from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  color: string;
  icon: string;
}

export default function StatCard({ title, count, color, icon }: StatCardProps) {
  const Icon = (Icons as any)[icon] || Icons.Circle;
  
  return (
    <div className="stat-card dashboard-card p-4 lg:p-6 rounded-lg border fade-in" style={{ 
      background: 'var(--dashboard-stat-background)', 
      borderColor: 'var(--dashboard-stat-border)' 
    }}>
      <div className="flex items-center">
        <div
          className="rounded-lg p-3 mr-4"
          style={{
            backgroundColor: color,
            color: 'white'
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="stat-number text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {count}
          </p>
        </div>
      </div>
    </div>
  );
}