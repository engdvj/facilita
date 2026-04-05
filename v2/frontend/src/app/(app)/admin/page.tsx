'use client';

import Link from 'next/link';
import { ArrowRight, Lock, type LucideIcon } from 'lucide-react';
import AdminPanelHeaderBar from '@/components/admin/panel-header-bar';
import {
  APP_ROUTES,
  canAccessRoute,
  hasPermission,
  type AppRoute,
} from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

type AdminRouteGroup = {
  label: string;
  items: AppRoute[];
};

const labelCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export default function AdminHomePage() {
  const user = useAuthStore((state) => state.user);
  const canAccessAdmin = hasPermission(user, 'canAccessAdmin');

  if (!canAccessAdmin) {
    return <div className="fac-error-state">Acesso restrito.</div>;
  }

  const adminRoutes = APP_ROUTES.filter(
    (route) =>
      route.href.startsWith('/admin/') &&
      canAccessRoute(user, route),
  );

  const grouped = adminRoutes.reduce<AdminRouteGroup[]>((acc, route) => {
    const label = route.navGroup ?? 'Administracao';
    const current = acc.find((group) => group.label === label);

    if (current) {
      current.items.push(route);
      return acc;
    }

    acc.push({ label, items: [route] });
    return acc;
  }, [])
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) =>
        labelCollator.compare(left.label, right.label),
      ),
    }))
    .sort((left, right) => labelCollator.compare(left.label, right.label));

  return (
    <div className="fac-page">
      <section className="fac-panel">
        <AdminPanelHeaderBar title="Admin" count={adminRoutes.length} />

        <div className="fac-panel-body space-y-4">
          <section className="fac-form-card">
            <div className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                  Acesso administrativo
                </span>
                <div>
                  <h2 className="text-[24px] font-display leading-none text-foreground">
                    Modulos liberados
                  </h2>
                  <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
                    Esta pagina existe para evitar o estado vazio quando a role tem
                    <span className="mx-1 font-medium text-foreground">Acessar admin</span>
                    ativo, mas ainda depende de permissoes especificas para cada modulo.
                  </p>
                </div>
              </div>

              <div className="rounded-[16px] border border-border bg-white/55 px-4 py-3 dark:bg-secondary/55">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Modulos visiveis
                </p>
                <p className="mt-2 text-[18px] font-semibold text-foreground">
                  {adminRoutes.length}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Rotas de admin disponiveis para este usuario.
                </p>
              </div>
            </div>

            {grouped.length === 0 ? (
              <div className="mt-4 rounded-[18px] border border-dashed border-border/70 bg-background/35 px-4 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">
                  Nenhum modulo especifico liberado.
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Para o admin mostrar paginas, ative tambem permissoes como
                  <span className="mx-1 font-medium text-foreground">Ver categorias</span>,
                  <span className="mx-1 font-medium text-foreground">Ver links</span> ou
                  <span className="mx-1 font-medium text-foreground">Ver usuarios</span>.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {grouped.map((group) => (
                  <section
                    key={group.label}
                    className="rounded-[18px] border border-border bg-white/55 p-4 dark:bg-secondary/55"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {group.label}
                        </p>
                        <p className="mt-2 text-[18px] font-semibold text-foreground">
                          {group.items.length} modulo(s)
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-2">
                      {group.items.map((route) => {
                        const Icon = route.icon as LucideIcon;

                        return (
                          <Link
                            key={route.href}
                            href={route.href}
                            className="group rounded-[16px] border border-border/70 bg-card/80 px-4 py-4 transition hover:border-primary/35 hover:bg-primary/[0.06]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-foreground">
                                  <Icon className="h-5 w-5" />
                                </span>

                                <div className="min-w-0">
                                  <p className="text-[14px] font-semibold text-foreground">
                                    {route.label}
                                  </p>
                                  {route.subtitle ? (
                                    <p className="mt-1 text-[12px] text-muted-foreground">
                                      {route.subtitle}
                                    </p>
                                  ) : null}
                                  {route.description ? (
                                    <p className="mt-2 text-[12px] text-muted-foreground">
                                      {route.description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
