'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const sections = useMemo(() => {
    if (!user) return [];

    if (user.role === 'COLLABORATOR') {
      return [
        {
          label: 'Navegacao',
          items: [
            { href: '/', label: 'Inicio' },
            { href: '/admin/links', label: 'Meus links' },
          ],
        },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        {
          label: 'Portal',
          items: [
            { href: '/', label: 'Inicio' },
            { href: '/admin/categories', label: 'Categorias' },
            { href: '/admin/links', label: 'Links' },
            { href: '/admin/schedules', label: 'Agendas/Documentos' },
          ],
        },
      ];
    }

    return [
      {
        label: 'Navegacao',
        items: [{ href: '/', label: 'Inicio' }],
      },
      {
        label: 'Portal',
        items: [
          { href: '/admin/categories', label: 'Categorias' },
          { href: '/admin/links', label: 'Links' },
          { href: '/admin/schedules', label: 'Agendas/Documentos' },
        ],
      },
      {
        label: 'Administracao',
        items: [
          { href: '/admin/companies', label: 'Empresas' },
          { href: '/admin/units', label: 'Unidades' },
          { href: '/admin/sectors', label: 'Setores' },
          { href: '/admin/users', label: 'Usuarios' },
          { href: '/admin/permissions', label: 'Permissoes' },
          { href: '/admin/backup', label: 'Backup e restauracao' },
        ],
      },
    ];
  }, [user]);

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.label} className="space-y-2">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/70">
            {section.label}
          </p>
          <nav className="space-y-2">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-active={active ? 'true' : 'false'}
                  className={`nav-card flex items-center px-3 py-2 text-[12px] ${
                    active
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
