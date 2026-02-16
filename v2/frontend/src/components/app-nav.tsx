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

    if (user.role === 'SUPERADMIN') {
      return [
        {
          label: 'Navegacao',
          description: 'Acompanhamento geral',
          items: [
            { href: '/', label: 'Inicio' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/favoritos', label: 'Favoritos' },
          ],
        },
        {
          label: 'Conteudo',
          description: 'Gestao de materiais',
          items: [
            { href: '/admin/categories', label: 'Categorias' },
            { href: '/admin/links', label: 'Links' },
            { href: '/admin/schedules', label: 'Documentos' },
            { href: '/admin/notes', label: 'Notas' },
            { href: '/admin/images', label: 'Galeria' },
          ],
        },
        {
          label: 'Plataforma',
          description: 'Configuracoes globais',
          items: [
            { href: '/admin/users', label: 'Usuarios' },
            { href: '/admin/permissions', label: 'Permissoes' },
            { href: '/admin/settings', label: 'Configuracoes' },
            { href: '/admin/backup', label: 'Backup' },
            { href: '/admin/restore', label: 'Restauracao' },
            { href: '/admin/reset', label: 'Reset do sistema' },
          ],
        },
      ];
    }

    return [
      {
        label: 'Navegacao',
        description: 'Acesso rapido',
        items: [
          { href: '/', label: 'Inicio' },
          { href: '/favoritos', label: 'Favoritos' },
          { href: '/compartilhados', label: 'Compartilhados' },
        ],
      },
      {
        label: 'Meu Conteudo',
        description: 'Area de trabalho',
        items: [
          { href: '/admin/categories', label: 'Categorias' },
          { href: '/admin/links', label: 'Links' },
          { href: '/admin/schedules', label: 'Documentos' },
          { href: '/admin/notes', label: 'Notas' },
          { href: '/admin/images', label: 'Galeria' },
        ],
      },
    ];
  }, [user]);

  return (
    <div className="space-y-4 sm:space-y-5 motion-stagger lg:rounded-3xl lg:border lg:border-border/70 lg:bg-card/80 lg:p-4 lg:shadow-[0_18px_40px_rgba(16,32,36,0.12)] lg:backdrop-blur-sm">
      {sections.map((section, sectionIndex) => (
        <div
          key={section.label}
          className="motion-item space-y-2"
          style={staggerStyle(sectionIndex + 1)}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:tracking-[0.32em] text-muted-foreground/80 font-display">
            {section.label}
          </p>
          {section.description && (
            <p className="text-[11px] text-muted-foreground/80">{section.description}</p>
          )}
          <nav className="space-y-3">
            {section.items.map((item, itemIndex) => {
              const active = isActive(pathname, item.href);
              const staggerIndex = sectionIndex * 6 + itemIndex + 1;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-disabled={active ? 'true' : undefined}
                  data-active={active ? 'true' : 'false'}
                  style={staggerStyle(staggerIndex)}
                  onClick={(event) => {
                    if (active) {
                      event.preventDefault();
                    }
                  }}
                  className={`motion-item motion-press nav-card flex items-center gap-2 px-4 py-2 text-[12px] font-medium tracking-[0.02em] sm:pl-5 sm:pr-4 sm:py-2.5 sm:text-[13px] ${
                    active
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
