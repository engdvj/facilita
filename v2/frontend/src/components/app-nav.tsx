'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  FileText,
  Folder,
  HardDrive,
  Home,
  ImageIcon,
  LayoutDashboard,
  Link2,
  Power,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  Star,
  StickyNote,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { NavMode } from '@/stores/ui-store';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type AppNavProps = {
  collapsed?: boolean;
  navMode?: NavMode;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

export default function AppNav({
  collapsed = false,
  navMode = 'manual',
  onToggleCollapse,
  onNavigate,
}: AppNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const groups = useMemo<NavGroup[]>(() => {
    if (!user) return [];

    if (user.role === 'SUPERADMIN') {
      return [
        {
          label: 'Navegacao',
          items: [
            { href: '/', icon: Home, label: 'Inicio' },
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/favoritos', icon: Star, label: 'Favoritos' },
          ],
        },
        {
          label: 'Portal',
          items: [
            { href: '/admin/categories', icon: Folder, label: 'Categorias' },
            { href: '/admin/links', icon: Link2, label: 'Links' },
            { href: '/admin/schedules', icon: FileText, label: 'Documentos' },
            { href: '/admin/notes', icon: StickyNote, label: 'Notas' },
            { href: '/admin/images', icon: ImageIcon, label: 'Galeria' },
          ],
        },
        {
          label: 'Cadastros',
          items: [
            { href: '/admin/users', icon: Users, label: 'Usuarios' },
            { href: '/admin/permissions', icon: Shield, label: 'Permissoes' },
            { href: '/admin/settings', icon: Settings, label: 'Configuracoes' },
            { href: '/admin/backup', icon: HardDrive, label: 'Backup' },
            { href: '/admin/restore', icon: RefreshCw, label: 'Restauracao' },
            { href: '/admin/reset', icon: Power, label: 'Reset' },
          ],
        },
      ];
    }

    return [
      {
        label: 'Navegacao',
        items: [
          { href: '/', icon: Home, label: 'Inicio' },
          { href: '/favoritos', icon: Star, label: 'Favoritos' },
          { href: '/compartilhados', icon: Share2, label: 'Compartilhados' },
        ],
      },
      {
        label: 'Portal',
        items: [
          { href: '/admin/categories', icon: Folder, label: 'Categorias' },
          { href: '/admin/links', icon: Link2, label: 'Links' },
          { href: '/admin/schedules', icon: FileText, label: 'Documentos' },
          { href: '/admin/notes', icon: StickyNote, label: 'Notas' },
          { href: '/admin/images', icon: ImageIcon, label: 'Galeria' },
        ],
      },
    ];
  }, [user]);

  return (
    <div className="fac-nav-panel" data-collapsed={collapsed ? 'true' : 'false'}>
      <div className="fac-nav-brand-shell">
        <button
          type="button"
          className="fac-nav-brand"
          aria-label={
            navMode === 'manual'
              ? collapsed
                ? 'Expandir barra lateral'
                : 'Recolher barra lateral'
              : 'Modo automatico ativo'
          }
          title={
            navMode === 'manual'
              ? collapsed
                ? 'Expandir barra lateral'
                : 'Recolher barra lateral'
              : 'Modo automatico ativo'
          }
          onClick={() => {
            if (onToggleCollapse) {
              onToggleCollapse();
              return;
            }

            onNavigate?.();
          }}
        >
          {collapsed ? 'F' : 'FACILITA'}
        </button>
      </div>

      <div className="fac-nav-sections">
        {groups.map((group) => (
          <section key={group.label} className="fac-nav-group">
            {!collapsed ? <p className="fac-nav-label">{group.label}</p> : null}
            <nav className="fac-nav-list">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={active ? 'true' : 'false'}
                    className="fac-nav-item"
                    aria-label={collapsed ? item.label : undefined}
                    onClick={(event) => {
                      if (active) {
                        event.preventDefault();
                      }
                      onNavigate?.();
                    }}
                    aria-current={active ? 'page' : undefined}
                    aria-disabled={active}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="fac-nav-item-icon" />
                    <span className="fac-nav-item-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </section>
        ))}
      </div>
    </div>
  );
}
