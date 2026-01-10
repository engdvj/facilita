'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type CSSProperties } from 'react';
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
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);
  const sections = useMemo(() => {
    if (!user) return [];

    if (user.role === 'COLLABORATOR') {
      return [
        {
          label: 'Navegacao',
          items: [
            { href: '/', label: 'Inicio' },
            { href: '/admin/links', label: 'Meus links' },
            { href: '/admin/notes', label: 'Notas' },
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
            { href: '/admin/schedules', label: 'Documentos' },
            { href: '/admin/notes', label: 'Notas' },
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
          { href: '/admin/schedules', label: 'Documentos' },
          { href: '/admin/notes', label: 'Notas' },
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
          { href: '/admin/reset', label: 'Reset do sistema' },
        ],
      },
    ];
  }, [user]);

  return (
    <div className="space-y-4 motion-stagger">
      {sections.map((section, sectionIndex) => (
        <div
          key={section.label}
          className="motion-item space-y-2"
          style={staggerStyle(sectionIndex + 1)}
        >
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/70">
            {section.label}
          </p>
          <nav className="space-y-2">
            {section.items.map((item, itemIndex) => {
              const active = isActive(pathname, item.href);
              const staggerIndex = sectionIndex * 6 + itemIndex + 1;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-active={active ? 'true' : 'false'}
                  style={staggerStyle(staggerIndex)}
                  className={`motion-item motion-press nav-card flex items-center px-3 py-2 text-[12px] ${
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
