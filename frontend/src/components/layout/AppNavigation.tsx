import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Link2, 
  FileIcon, 
  Folder, 
  Palette, 
  Users,
  Plus,
  Globe
} from 'lucide-react';

interface AppNavigationProps {
  user: any;
  onLinkClick?: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  end?: boolean;
  customAction?: boolean;
}

function NavItem({ to, icon, children, onClick, end = false, customAction = false }: NavItemProps) {
  if (customAction) {
    return (
      <button
        onClick={onClick}
        className="nav-link flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all w-full text-left"
        style={{
          color: 'var(--sidebar-text)',
          background: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-background)';
          e.currentTarget.style.color = 'var(--sidebar-hover-text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-link flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          isActive ? 'active' : ''
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        background: isActive ? 'var(--sidebar-active-background)' : 'transparent'
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-background)';
          e.currentTarget.style.color = 'var(--sidebar-hover-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }
      }}
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="space-y-0">
      <div 
        className="px-3 py-0 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {title}
      </div>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export default function AppNavigation({ user, onLinkClick }: AppNavigationProps) {
  return (
    <nav className="space-y-0">
      <NavItem 
        to="/" 
        icon={<Globe size={16} />} 
        onClick={onLinkClick}
        end
      >
        Início
      </NavItem>
      
      <div className="mt-6">
      {user?.isAdmin ? (
        <NavSection title="Admin">
          <NavItem 
            to="/admin" 
            icon={<HomeIcon size={16} />} 
            onClick={onLinkClick}
            end
          >
            Dashboard
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<Link2 size={16} />} 
            onClick={() => {
              if (onLinkClick) onLinkClick();
              // Trigger links section focus on dashboard
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'links' }));
            }}
          >
            Links
          </NavItem>
          <NavItem 
            to="/admin/files" 
            icon={<FileIcon size={16} />} 
            onClick={onLinkClick}
          >
            Arquivos
          </NavItem>
          <NavItem 
            to="/admin/categories" 
            icon={<Folder size={16} />} 
            onClick={onLinkClick}
          >
            Categorias
          </NavItem>
          <NavItem 
            to="/admin/colors" 
            icon={<Palette size={16} />} 
            onClick={onLinkClick}
          >
            Cores
          </NavItem>
          <NavItem 
            to="/admin/users" 
            icon={<Users size={16} />} 
            onClick={onLinkClick}
          >
            Usuários
          </NavItem>
        </NavSection>
      ) : (
        <NavSection title="Usuário">
          <NavItem 
            to="/user/links" 
            icon={<Link2 size={16} />} 
            onClick={onLinkClick}
          >
            Meus Links
          </NavItem>
          <NavItem 
            to="/user/links/new" 
            icon={<Plus size={16} />} 
            onClick={onLinkClick}
          >
            Novo Link
          </NavItem>
        </NavSection>
      )}
      </div>
    </nav>
  );
}