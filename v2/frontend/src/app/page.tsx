'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import { Category, Link } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

type CategoryOption = Category;

const publicCompanyId = process.env.NEXT_PUBLIC_COMPANY_ID || '';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLight = (hex?: string) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
  };

  useEffect(() => {
    let active = true;
    const companyId = user?.companyId || publicCompanyId || undefined;
    const canLoad = Boolean(publicCompanyId) || hasHydrated;

    const load = async () => {
      if (!canLoad) return;
      try {
        setError(null);
        const params = new URLSearchParams();
        if (companyId) {
          params.set('companyId', companyId);
        }
        params.set('isPublic', 'true');
        const response = await api.get(`/links?${params.toString()}`);
        if (!active) return;
        setLinks(response.data);
      } catch (err: any) {
        if (!active) return;
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError('Sessao expirada. Faca login novamente.');
        } else {
          setError('Nao foi possivel carregar os links.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, user?.companyId]);

  const categories = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    links.forEach((link) => {
      if (link.category) {
        map[link.category.id] = link.category;
      }
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [links]);

  const visibleCategories = useMemo(() => {
    if (!user) return categories.filter((category) => !category.adminOnly);
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return categories;
    }
    return categories.filter((category) => !category.adminOnly);
  }, [categories, user]);

  const filteredLinks = useMemo(() => {
    const term = search.trim().toLowerCase();
    const isAdmin =
      user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
    const categoryMap: Record<string, CategoryOption> = {};
    categories.forEach((category) => {
      categoryMap[category.id] = category;
    });
    return links
      .filter((link) => {
        const linkedCategory = link.categoryId
          ? categoryMap[link.categoryId]
          : null;
        if (!isAdmin && linkedCategory?.adminOnly) {
          return false;
        }
        if (activeCategory !== 'all' && link.categoryId !== activeCategory) {
          return false;
        }
        if (!term) return true;
        const title = link.title.toLowerCase();
        const desc = link.description?.toLowerCase() || '';
        return title.includes(term) || desc.includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [activeCategory, categories, links, search, user?.role]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((link) => {
      if (!link.categoryId) return;
      counts[link.categoryId] = (counts[link.categoryId] || 0) + 1;
    });
    return counts;
  }, [links]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-foreground">
              Facilita V2
            </span>
            <span className="text-xs text-muted-foreground">Portal</span>
          </div>
          <a
            href="/login"
            className="rounded-lg border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
          >
            Login
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] space-y-6 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inicio
            </p>
            <h1 className="font-display text-3xl text-foreground">
              Links do portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Encontre rapidamente documentos, sistemas e atalhos da equipe.
            </p>
          </div>

          <div className="w-full sm:max-w-[360px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar link ou palavra-chave"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.22em] transition ${
              activeCategory === 'all'
                ? 'border-transparent bg-foreground text-background'
                : 'border-border/70 bg-card/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            Todos ({links.length})
          </button>
          {visibleCategories.map((category) => {
            const active = activeCategory === category.id;
            const activeStyle =
              active && category.color
                ? {
                    backgroundColor: category.color,
                    color: isLight(category.color)
                      ? 'var(--foreground)'
                      : 'var(--primary-foreground)',
                  }
                : undefined;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.22em] transition ${
                  active
                    ? 'border-transparent bg-foreground text-background'
                    : 'border-border/70 bg-card/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                }`}
                style={activeStyle}
              >
                {category.name} ({categoryCounts[category.id] || 0})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            Carregando links...
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhum link encontrado.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLinks.map((link) => {
              const imageUrl = link.imageUrl
                ? link.imageUrl.startsWith('http')
                  ? link.imageUrl
                  : `${serverURL}${link.imageUrl}`
                : null;
              const category = link.category;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_14px_28px_rgba(16,44,50,0.1)] transition hover:-translate-y-1 hover:border-foreground/40"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-secondary/60">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={link.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {category?.name && (
                        <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                          {category.name}
                        </span>
                      )}
                      {!link.isPublic && (
                        <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                          Restrito
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
