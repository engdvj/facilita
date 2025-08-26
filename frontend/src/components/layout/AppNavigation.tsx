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

interface CustomNavItemProps extends NavItemProps {
  sectionKey?: string;
  activeSection?: string | null;
}

function NavItem({ to, icon, children, onClick, end = false, customAction = false, sectionKey, activeSection }: CustomNavItemProps) {
  if (customAction) {
    const isActive = activeSection === sectionKey;
    return (
      <button
        onClick={onClick}
        className={`nav-link flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all w-full text-left ${isActive ? 'active' : ''}`}
        style={{
          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          background: isActive ? 'var(--sidebar-active-background)' : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-background)';
            e.currentTarget.style.color = 'var(--sidebar-hover-text)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--sidebar-text)';
          }
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
  const [activeSection, setActiveSection] = React.useState<string | null>('dashboard');

  React.useEffect(() => {
    const handleUpdateSelection = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('updateSidebarSelection', handleUpdateSelection as EventListener);
    return () => {
      window.removeEventListener('updateSidebarSelection', handleUpdateSelection as EventListener);
    };
  }, []);
  return (
    <nav className="space-y-0">
      <div className="mt-6">
      {user?.isAdmin ? (
        <NavSection title="Admin">
          <NavItem 
            to="/" 
            icon={<Globe size={16} />} 
            onClick={onLinkClick}
            end
          >
            Início
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<HomeIcon size={16} />} 
            customAction={true}
            sectionKey="dashboard"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              // Set dashboard as active and clear focused section
              window.dispatchEvent(new CustomEvent('focusSection', { detail: null }));
            }}
            end
          >
            Dashboard
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<Link2 size={16} />} 
            customAction={true}
            sectionKey="links"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              // Trigger links section focus on dashboard
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'links' }));
            }}
          >
            Links
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<FileIcon size={16} />} 
            customAction={true}
            sectionKey="files"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'files' }));
            }}
          >
            Arquivos
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<Folder size={16} />} 
            customAction={true}
            sectionKey="categories"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'categories' }));
            }}
          >
            Categorias
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<Palette size={16} />} 
            customAction={true}
            sectionKey="colors"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'colors' }));
            }}
          >
            Cores
          </NavItem>
          <NavItem 
            to="/admin" 
            icon={<Users size={16} />} 
            customAction={true}
            sectionKey="users"
            activeSection={activeSection}
            onClick={() => {
              if (onLinkClick) onLinkClick();
              window.dispatchEvent(new CustomEvent('focusSection', { detail: 'users' }));
            }}
          >
            Usuários
          </NavItem>
        </NavSection>
      ) : (
        <>
          <NavItem 
            to="/" 
            icon={<Globe size={16} />} 
            onClick={onLinkClick}
            end
          >
            Início
          </NavItem>
          <div className="mt-4">
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
          </div>
        </>
      )}
      </div>
    </nav>
  );
}