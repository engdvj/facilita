'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import AppShell from '@/components/app-shell';
import {
  Category,
  ContentAudience,
  Link as LinkType,
  UploadedSchedule,
} from '@/types';
import { useAuthStore } from '@/stores/auth-store';

type CategoryOption = Category;
type ContentItem = {
  id: string;
  type: 'link' | 'document';
  title: string;
  description?: string | null;
  categoryId?: string | null;
  category?: CategoryOption | null;
  audience: ContentAudience;
  url?: string;
  imageUrl?: string | null;
  imagePosition?: string;
  imageScale?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  accentColor?: string | null;
  favoritesCount: number;
};

const publicCompanyId = process.env.NEXT_PUBLIC_COMPANY_ID || '';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [documents, setDocuments] = useState<UploadedSchedule[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'ALL' | 'LINK' | 'DOCUMENT'>(
    'ALL',
  );
  const [filterVisibility, setFilterVisibility] = useState<
    'ALL' | 'PUBLIC' | 'RESTRICTED'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const getAudience = (link: LinkType): ContentAudience => {
    if (link.isPublic) return 'PUBLIC';
    if (link.audience) return link.audience;
    if (link.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const getDocumentAudience = (document: UploadedSchedule): ContentAudience => {
    if (document.isPublic) return 'PUBLIC';
    if (document.audience) return document.audience;
    if (document.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const matchesTypeFilter = (type: 'link' | 'document') => {
    if (filterType === 'ALL') return true;
    if (filterType === 'LINK') return type === 'link';
    return type === 'document';
  };

  const matchesVisibilityFilter = (audience: ContentAudience) => {
    if (filterVisibility === 'ALL') return true;
    if (filterVisibility === 'PUBLIC') return audience === 'PUBLIC';
    return audience !== 'PUBLIC';
  };

  const isLight = (hex?: string) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
  };

  const toRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const value =
      normalized.length === 3
        ? normalized
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : normalized;
    if (value.length !== 6) return undefined;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return undefined;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    let active = true;
    const isLoggedIn = Boolean(user);
    const companyId = isLoggedIn
      ? isSuperAdmin
        ? undefined
        : user?.companyId
      : publicCompanyId || undefined;
    const canLoad = Boolean(publicCompanyId) || hasHydrated;

    const load = async () => {
      if (!canLoad) return;
      if (isLoggedIn && !companyId && !isSuperAdmin) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const params = new URLSearchParams();
        if (companyId) {
          params.set('companyId', companyId);
        }
        if (!isLoggedIn) {
          params.set('isPublic', 'true');
        }
        const queryString = params.toString();
        const linksEndpoint =
          isLoggedIn && isSuperAdmin ? '/links/admin/list' : '/links';
        const linksRequest = api.get(
          queryString ? `${linksEndpoint}?${queryString}` : linksEndpoint,
        );
        const documentsRequest = isLoggedIn
          ? api.get(
              queryString ? `/schedules?${queryString}` : '/schedules',
            )
          : Promise.resolve({ data: [] });
        const [linksResponse, documentsResponse] = await Promise.all([
          linksRequest,
          documentsRequest,
        ]);
        if (!active) return;
        setLinks(linksResponse.data);
        setDocuments(documentsResponse.data);
      } catch (err: any) {
        if (!active) return;
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError('Sessao expirada. Faca login novamente.');
        } else {
          setError('Nao foi possivel carregar os links e documentos.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, isSuperAdmin, user?.companyId]);

  const visibleLinks = useMemo(() => {
    const canView = (link: LinkType) => {
      const audience = getAudience(link);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (user.role === 'SUPERADMIN') {
        return true;
      }
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') {
        return user.role === 'ADMIN';
      }
      if (audience === 'PRIVATE') {
        return link.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        return Boolean(user.sectorId) && link.sectorId === user.sectorId;
      }
      if (audience === 'COMPANY') {
        return (
          user.role === 'ADMIN' &&
          Boolean(user.companyId) &&
          link.companyId === user.companyId
        );
      }
      return false;
    };

    return links.filter(canView);
  }, [links, user]);

  const visibleDocuments = useMemo(() => {
    const canView = (document: UploadedSchedule) => {
      const audience = getDocumentAudience(document);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (user.role === 'SUPERADMIN') {
        return true;
      }
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') {
        return user.role === 'ADMIN';
      }
      if (audience === 'PRIVATE') {
        return document.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        return Boolean(user.sectorId) && document.sectorId === user.sectorId;
      }
      if (audience === 'COMPANY') {
        return (
          user.role === 'ADMIN' &&
          Boolean(user.companyId) &&
          document.companyId === user.companyId
        );
      }
      return false;
    };

    return documents.filter(canView);
  }, [documents, user]);

  const categories = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      if (link.category) {
        map[link.category.id] = link.category;
      }
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      if (document.category) {
        map[document.category.id] = document.category;
      }
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [
    filterType,
    filterVisibility,
    visibleDocuments,
    visibleLinks,
  ]);

  const visibleCategories = useMemo(() => {
    if (!user) return categories.filter((category) => !category.adminOnly);
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return categories;
    }
    return categories.filter((category) => !category.adminOnly);
  }, [categories, user]);

  const categoryMap = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items: ContentItem[] = [];
    const canUseCategory = (category?: CategoryOption | null) => {
      if (!category) return true;
      return isAdminUser ? true : !category.adminOnly;
    };

    visibleLinks.forEach((link) => {
      const audience = getAudience(link);
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(audience)
      ) {
        return;
      }
      const category = link.categoryId
        ? categoryMap[link.categoryId] ?? link.category
        : link.category;
      if (!canUseCategory(category)) return;
      if (activeCategory !== 'all' && link.categoryId !== activeCategory) {
        return;
      }
      if (term) {
        const haystack = `${link.title} ${link.description ?? ''} ${link.url} ${
          category?.name ?? ''
        }`.toLowerCase();
        if (!haystack.includes(term)) return;
      }
      items.push({
        id: link.id,
        type: 'link',
        title: link.title,
        description: link.description,
        categoryId: link.categoryId,
        category,
        audience,
        url: link.url,
        imageUrl: link.imageUrl || null,
        imagePosition: link.imagePosition,
        imageScale: link.imageScale,
        accentColor: link.color || category?.color || null,
        favoritesCount: link._count?.favorites ?? 0,
      });
    });

    visibleDocuments.forEach((document) => {
      const audience = getDocumentAudience(document);
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(audience)
      ) {
        return;
      }
      const category = document.categoryId
        ? categoryMap[document.categoryId] ?? document.category
        : document.category;
      if (!canUseCategory(category)) return;
      if (activeCategory !== 'all' && document.categoryId !== activeCategory) {
        return;
      }
      if (term) {
        const haystack = `${document.title} ${document.fileName} ${
          category?.name ?? ''
        }`.toLowerCase();
        if (!haystack.includes(term)) return;
      }
      items.push({
        id: document.id,
        type: 'document',
        title: document.title,
        categoryId: document.categoryId,
        category,
        audience,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        imageUrl: document.imageUrl || null,
        imagePosition: document.imagePosition,
        imageScale: document.imageScale,
        accentColor: category?.color || null,
        favoritesCount: document._count?.favorites ?? 0,
      });
    });

    return items.sort((a, b) => a.title.localeCompare(b.title));
  }, [
    activeCategory,
    categoryMap,
    filterType,
    filterVisibility,
    isAdminUser,
    search,
    visibleDocuments,
    visibleLinks,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      if (!link.categoryId) return;
      counts[link.categoryId] = (counts[link.categoryId] || 0) + 1;
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      if (!document.categoryId) return;
      counts[document.categoryId] = (counts[document.categoryId] || 0) + 1;
    });
    return counts;
  }, [filterType, filterVisibility, visibleDocuments, visibleLinks]);

  const favoriteItems = useMemo(() => {
    return filteredItems
      .filter((item) => item.favoritesCount > 0)
      .sort((a, b) => {
        const diff = b.favoritesCount - a.favoritesCount;
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      })
      .slice(0, 8);
  }, [filteredItems]);

  const totalVisibleItems = useMemo(() => {
    const canUseCategory = (category?: CategoryOption | null) => {
      if (!category) return true;
      return isAdminUser ? true : !category.adminOnly;
    };
    let count = 0;
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      const category = link.categoryId
        ? categoryMap[link.categoryId] ?? link.category
        : link.category;
      if (!canUseCategory(category)) return;
      count += 1;
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      const category = document.categoryId
        ? categoryMap[document.categoryId] ?? document.category
        : document.category;
      if (!canUseCategory(category)) return;
      count += 1;
    });
    return count;
  }, [
    categoryMap,
    filterType,
    filterVisibility,
    isAdminUser,
    visibleDocuments,
    visibleLinks,
  ]);

  const renderItemCard = (item: ContentItem) => {
    const categoryColor = item.category?.color;
    const categoryTagStyle = categoryColor
      ? {
          backgroundColor: categoryColor,
          borderColor: categoryColor,
          color: isLight(categoryColor)
            ? 'var(--foreground)'
            : 'var(--primary-foreground)',
        }
      : undefined;
    const accentSoft = item.accentColor
      ? toRgba(item.accentColor, 0.12)
      : undefined;
    const accentStrong = item.accentColor
      ? toRgba(item.accentColor, 0.28)
      : undefined;
    const panelStyle =
      accentSoft && accentStrong
        ? {
            backgroundImage: `linear-gradient(180deg, ${accentSoft} 0%, ${accentStrong} 100%)`,
          }
        : undefined;

    if (item.type === 'link') {
      const imageUrl = item.imageUrl
        ? item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${serverURL}${item.imageUrl}`
        : null;
      return (
        <a
          key={`${item.type}-${item.id}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card/95 shadow-[0_18px_36px_rgba(16,44,50,0.14)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(16,44,50,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <div className="relative h-48 w-full overflow-hidden bg-secondary/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125 contrast-110 saturate-110"
                style={{
                  objectPosition: item.imagePosition || '50% 50%',
                  transform: `scale(${item.imageScale || 1})`,
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
          </div>
          <div
            className="flex flex-1 flex-col gap-2 px-4 py-3"
            style={panelStyle}
          >
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {item.category?.name && (
                <span
                  className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                  style={categoryTagStyle}
                >
                  {item.category.name}
                </span>
              )}
              {item.audience !== 'PUBLIC' && (
                <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                  Restrito
                </span>
              )}
            </div>
          </div>
        </a>
      );
    }

    const fileUrl = item.fileUrl
      ? item.fileUrl.startsWith('http')
        ? item.fileUrl
        : `${serverURL}${item.fileUrl}`
      : '#';
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http')
        ? item.imageUrl
        : `${serverURL}${item.imageUrl}`
      : null;
    return (
      <a
        key={`${item.type}-${item.id}`}
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card/95 shadow-[0_18px_36px_rgba(16,44,50,0.14)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(16,44,50,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
      >
        <div className="relative h-48 w-full overflow-hidden bg-secondary/60">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125 contrast-110 saturate-110"
              style={{
                objectPosition: item.imagePosition || '50% 50%',
                transform: `scale(${item.imageScale || 1})`,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
        </div>
        <div
          className="flex flex-1 flex-col gap-2 px-4 py-3"
          style={panelStyle}
        >
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {item.title}
            </h3>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.category?.name && (
              <span
                className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                style={categoryTagStyle}
              >
                {item.category.name}
              </span>
            )}
            {item.audience !== 'PUBLIC' && (
              <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                Restrito
              </span>
            )}
          </div>
        </div>
      </a>
    );
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Inicio
          </p>
          <h1 className="font-display text-3xl text-foreground">
            Links e documentos do portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Encontre rapidamente documentos, sistemas e atalhos da equipe.
          </p>
        </div>

        <div className="w-full sm:max-w-[360px] space-y-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar link ou documento"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(event) => {
                  setFilterType(event.target.value as 'ALL' | 'LINK' | 'DOCUMENT');
                  setActiveCategory('all');
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
              >
                <option value="ALL">Todos</option>
                <option value="LINK">Links</option>
                <option value="DOCUMENT">Documentos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Visibilidade
              </label>
              <select
                value={filterVisibility}
                onChange={(event) => {
                  setFilterVisibility(
                    event.target.value as 'ALL' | 'PUBLIC' | 'RESTRICTED',
                  );
                  setActiveCategory('all');
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
              >
                <option value="ALL">Todas</option>
                <option value="PUBLIC">Publicos</option>
                <option value="RESTRICTED">Restritos</option>
              </select>
            </div>
          </div>
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
          Todos ({totalVisibleItems})
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

      {favoriteItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Favoritos
            </p>
            <p className="text-xs text-muted-foreground">
              {favoriteItems.length} itens
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteItems.map((item) => renderItemCard(item))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
          Carregando conteudo...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
          Nenhum item encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => renderItemCard(item))}
        </div>
      )}
    </AppShell>
  );
}
