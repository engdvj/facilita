'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    label: 'Navegacao',
    items: [
      { href: '/', label: 'Inicio' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
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
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNav() {
  const pathname = usePathname();

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
