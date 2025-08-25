import * as Icons from "lucide-react";
import { AdminData } from "../../../hooks/admin";

interface DashboardStatsProps {
  data: AdminData;
}

function StatCard({ title, count, icon }: { title: string; count: number; icon: string }) {
  const IconComponent = (Icons as any)[icon] || Icons.Circle;
  
  return (
    <div 
      className="rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md"
      style={{
        background: 'var(--dashboard-stat-background)',
        border: `1px solid var(--dashboard-stat-border)`
      }}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: 'var(--dashboard-stat-icon-bg)' }}
        >
          <IconComponent 
            className="w-5 h-5"
            style={{ color: 'var(--dashboard-stat-icon)' }}
          />
        </div>
        <div className="space-y-1">
          <p 
            className="text-xl font-bold leading-none"
            style={{ color: 'var(--dashboard-stat-number)' }}
          >
            {count}
          </p>
          <p 
            className="text-xs font-medium"
            style={{ color: 'var(--dashboard-stat-text)' }}
          >
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
      <StatCard title="Links" count={data.links.length} icon="Link2" />
      <StatCard title="Arquivos" count={data.files.length} icon="FileIcon" />
      <StatCard title="Categorias" count={data.categories.length} icon="Folder" />
      <StatCard title="Cores" count={data.colors.length} icon="Palette" />
      <StatCard title="Usuários" count={data.users.length} icon="Users" />
    </div>
  );
}