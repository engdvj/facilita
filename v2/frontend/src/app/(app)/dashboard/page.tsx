'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import api from '@/lib/api';
import {
  Category,
  ContentAudience,
  Link as LinkType,
  Note,
  UploadedSchedule,
} from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { getUserSectorIds, getUserUnitsBySector } from '@/lib/user-scope';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type CategoryOption = Category;
type DashboardItem = {
  id: string;
  type: 'link' | 'document' | 'note';
  title: string;
  createdAt: string;
  audience: ContentAudience;
  favoritesCount: number;
  categoryId?: string | null;
  category?: CategoryOption | null;
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [documents, setDocuments] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboardRange, setDashboardRange] = useState<
    'ALL' | '7D' | '30D' | '90D'
  >('ALL');
  const [dashboardVisibility, setDashboardVisibility] = useState<
    'ALL' | 'PUBLIC' | 'RESTRICTED'
  >('ALL');
  const [dashboardContent, setDashboardContent] = useState<
    'ALL' | 'LINK' | 'DOCUMENT' | 'NOTE'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const userSectorIds = useMemo(() => getUserSectorIds(user), [user]);
  const userUnitsBySector = useMemo(() => getUserUnitsBySector(user), [user]);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('pt-BR'), []);

  useNotifyOnChange(error);

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

  const getNoteAudience = (note: Note): ContentAudience => {
    if (note.isPublic) return 'PUBLIC';
    if (note.audience) return note.audience;
    if (note.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const matchesDashboardVisibility = (audience: ContentAudience) => {
    if (dashboardVisibility === 'ALL') return true;
    if (dashboardVisibility === 'PUBLIC') return audience === 'PUBLIC';
    return audience !== 'PUBLIC';
  };

  const matchesDashboardContent = (type: 'link' | 'document' | 'note') => {
    if (dashboardContent === 'ALL') return true;
    if (dashboardContent === 'LINK') return type === 'link';
    if (dashboardContent === 'DOCUMENT') return type === 'document';
    return type === 'note';
  };

  const getLinkUnitIds = (link: LinkType) =>
    link.linkUnits?.length
      ? link.linkUnits.map((unit) => unit.unitId)
      : link.unitId
        ? [link.unitId]
        : [];

  const getDocumentUnitIds = (document: UploadedSchedule) =>
    document.scheduleUnits?.length
      ? document.scheduleUnits.map((unit) => unit.unitId)
      : document.unitId
        ? [document.unitId]
        : [];

  const getNoteUnitIds = (note: Note) =>
    note.noteUnits?.length
      ? note.noteUnits.map((unit) => unit.unitId)
      : note.unitId
        ? [note.unitId]
        : [];

  const matchesUnit = (unitIds?: string[], sectorId?: string | null) => {
    if (!unitIds || unitIds.length === 0) return true;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') return true;
    if (!sectorId) return false;
    const allowedUnits = userUnitsBySector.get(sectorId);
    if (!allowedUnits || allowedUnits.size === 0) return true;
    return unitIds.some((unitId) => allowedUnits.has(unitId));
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;
      if (!user) {
        setError('Faca login para acessar o dashboard.');
        setLoading(false);
        return;
      }
      if (!isSuperAdmin) {
        setError('Acesso restrito a superadministradores.');
        setLoading(false);
        return;
      }

      const companyId = isSuperAdmin ? undefined : user.companyId;
      if (!companyId && !isSuperAdmin) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (companyId) {
          params.set('companyId', companyId);
        }
        const queryString = params.toString();
        const linksEndpoint = isSuperAdmin ? '/links/admin/list' : '/links';
        const documentsEndpoint = isSuperAdmin
          ? '/schedules/admin/list'
          : '/schedules';
        const notesEndpoint = isSuperAdmin ? '/notes/admin/list' : '/notes';

        try {
          const linksResponse = await api.get(
            queryString ? `${linksEndpoint}?${queryString}` : linksEndpoint,
          );
          if (!active) return;
          setLinks(linksResponse.data);
        } catch (linkError) {
          console.error('Error loading links:', linkError);
          if (!active) return;
          setLinks([]);
        }

        try {
          const documentsResponse = await api.get(
            queryString ? `${documentsEndpoint}?${queryString}` : documentsEndpoint,
          );
          if (!active) return;
          setDocuments(documentsResponse.data);
        } catch (docError) {
          console.error('Error loading documents:', docError);
          if (!active) return;
          setDocuments([]);
        }

        try {
          const notesResponse = await api.get(
            queryString ? `${notesEndpoint}?${queryString}` : notesEndpoint,
          );
          if (!active) return;
          setNotes(notesResponse.data);
        } catch (noteError) {
          console.error('Error loading notes:', noteError);
          if (!active) return;
          setNotes([]);
        }

        try {
          const usersResponse = await api.get('/users');
          if (!active) return;
          setUsers(usersResponse.data);
        } catch (userError) {
          console.error('Error loading users:', userError);
          if (!active) return;
          setUsers([]);
        }

        try {
          const companiesResponse = await api.get('/companies');
          if (!active) return;
          setCompanies(companiesResponse.data);
        } catch (companyError) {
          console.error('Error loading companies:', companyError);
          if (!active) return;
          setCompanies([]);
        }

        try {
          const sectorsResponse = await api.get('/sectors');
          if (!active) return;
          setSectors(sectorsResponse.data);
        } catch (sectorError) {
          console.error('Error loading sectors:', sectorError);
          if (!active) return;
          setSectors([]);
        }

        try {
          const categoriesResponse = await api.get('/categories');
          if (!active) return;
          setCategories(categoriesResponse.data);
        } catch (categoryError) {
          console.error('Error loading categories:', categoryError);
          if (!active) return;
          setCategories([]);
        }

        if (active) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Unexpected error:', err);
        setError('Nao foi possivel carregar o conteudo.');
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, isSuperAdmin, user]);

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
        return user.role === 'ADMIN' || link.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getLinkUnitIds(link), link.sectorId)) return false;
        return link.sectorId ? userSectorIds.has(link.sectorId) : false;
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
        return user.role === 'ADMIN' || document.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getDocumentUnitIds(document), document.sectorId)) return false;
        return document.sectorId ? userSectorIds.has(document.sectorId) : false;
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

  const visibleNotes = useMemo(() => {
    const canView = (note: Note) => {
      const audience = getNoteAudience(note);
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
        return user.role === 'ADMIN' || note.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getNoteUnitIds(note), note.sectorId)) return false;
        return note.sectorId ? userSectorIds.has(note.sectorId) : false;
      }
      if (audience === 'COMPANY') {
        return (
          user.role === 'ADMIN' &&
          Boolean(user.companyId) &&
          note.companyId === user.companyId
        );
      }
      return false;
    };

    return notes.filter(canView);
  }, [notes, user]);

  const dashboardRangeStart = useMemo(() => {
    if (dashboardRange === 'ALL') return null;
    const days = dashboardRange === '7D' ? 7 : dashboardRange === '30D' ? 30 : 90;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [dashboardRange]);

  const dashboardRangeLabel = useMemo(() => {
    if (dashboardRange === '7D') return 'Ultimos 7 dias';
    if (dashboardRange === '30D') return 'Ultimos 30 dias';
    if (dashboardRange === '90D') return 'Ultimos 90 dias';
    return 'Periodo completo';
  }, [dashboardRange]);

  const dashboardRangeDays = useMemo(() => {
    if (dashboardRange === '7D') return 7;
    if (dashboardRange === '30D') return 30;
    if (dashboardRange === '90D') return 90;
    return null;
  }, [dashboardRange]);

  const dashboardItems = useMemo(() => {
    const items: DashboardItem[] = [];
    const isInRange = (dateString: string) => {
      if (!dashboardRangeStart) return true;
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return false;
      return date >= dashboardRangeStart;
    };

    if (matchesDashboardContent('link')) {
      visibleLinks.forEach((link) => {
        const audience = getAudience(link);
        if (!matchesDashboardVisibility(audience)) return;
        if (!isInRange(link.createdAt)) return;
        items.push({
          id: link.id,
          type: 'link',
          title: link.title,
          createdAt: link.createdAt,
          audience,
          favoritesCount: link._count?.favorites ?? 0,
          categoryId: link.categoryId,
          category: link.category ?? null,
        });
      });
    }

    if (matchesDashboardContent('document')) {
      visibleDocuments.forEach((document) => {
        const audience = getDocumentAudience(document);
        if (!matchesDashboardVisibility(audience)) return;
        if (!isInRange(document.createdAt)) return;
        items.push({
          id: document.id,
          type: 'document',
          title: document.title,
          createdAt: document.createdAt,
          audience,
          favoritesCount: document._count?.favorites ?? 0,
          categoryId: document.categoryId,
          category: document.category ?? null,
        });
      });
    }

    if (matchesDashboardContent('note')) {
      visibleNotes.forEach((note) => {
        const audience = getNoteAudience(note);
        if (!matchesDashboardVisibility(audience)) return;
        if (!isInRange(note.createdAt)) return;
        items.push({
          id: note.id,
          type: 'note',
          title: note.title,
          createdAt: note.createdAt,
          audience,
          favoritesCount: 0,
          categoryId: note.categoryId,
          category: note.category ?? null,
        });
      });
    }

    return items;
  }, [
    dashboardRangeStart,
    dashboardContent,
    dashboardVisibility,
    visibleDocuments,
    visibleLinks,
    visibleNotes,
  ]);

  const dashboardTypeCounts = useMemo(() => {
    return dashboardItems.reduce(
      (acc, item) => {
        acc[item.type] += 1;
        return acc;
      },
      { link: 0, document: 0, note: 0 },
    );
  }, [dashboardItems]);

  const dashboardTotal = dashboardItems.length;

  const dashboardTypePercentages = useMemo(() => {
    const base = dashboardTotal || 1;
    return {
      link: (dashboardTypeCounts.link / base) * 100,
      document: (dashboardTypeCounts.document / base) * 100,
      note: (dashboardTypeCounts.note / base) * 100,
    };
  }, [dashboardTotal, dashboardTypeCounts]);

  const dashboardVisibilityCounts = useMemo(() => {
    return dashboardItems.reduce(
      (acc, item) => {
        if (item.audience === 'PUBLIC') {
          acc.publicCount += 1;
        } else {
          acc.restrictedCount += 1;
        }
        return acc;
      },
      { publicCount: 0, restrictedCount: 0 },
    );
  }, [dashboardItems]);

  const dashboardVisibilityPercentages = useMemo(() => {
    const base =
      dashboardVisibilityCounts.publicCount +
        dashboardVisibilityCounts.restrictedCount || 1;
    return {
      public:
        (dashboardVisibilityCounts.publicCount / base) * 100,
      restricted:
        (dashboardVisibilityCounts.restrictedCount / base) * 100,
    };
  }, [dashboardVisibilityCounts]);

  const dashboardTypeVisibility = useMemo(() => {
    return dashboardItems.reduce(
      (acc, item) => {
        const bucket = acc[item.type];
        if (item.audience === 'PUBLIC') {
          bucket.publicCount += 1;
        } else {
          bucket.restrictedCount += 1;
        }
        return acc;
      },
      {
        link: { publicCount: 0, restrictedCount: 0 },
        document: { publicCount: 0, restrictedCount: 0 },
        note: { publicCount: 0, restrictedCount: 0 },
      },
    );
  }, [dashboardItems]);

  const dashboardFavoritesTotal = useMemo(() => {
    return dashboardItems.reduce(
      (total, item) => total + item.favoritesCount,
      0,
    );
  }, [dashboardItems]);

  const dashboardFavoritesItems = useMemo(() => {
    return dashboardItems.filter((item) => item.favoritesCount > 0).length;
  }, [dashboardItems]);

  const dashboardCategoryStats = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; color?: string; count: number }
    > = {};
    dashboardItems.forEach((item) => {
      const categoryId = item.category?.id ?? item.categoryId;
      if (!categoryId) {
        const key = '__none__';
        if (!map[key]) {
          map[key] = {
            id: key,
            name: 'Sem categoria',
            count: 0,
          };
        }
        map[key].count += 1;
        return;
      }
      if (!map[categoryId]) {
        map[categoryId] = {
          id: categoryId,
          name: item.category?.name ?? 'Categoria',
          color: item.category?.color,
          count: 0,
        };
      }
      map[categoryId].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [dashboardItems]);

  const dashboardCategoryMax = useMemo(() => {
    return dashboardCategoryStats.reduce(
      (max, item) => Math.max(max, item.count),
      0,
    );
  }, [dashboardCategoryStats]);

  const dashboardCategoryScale = dashboardCategoryMax || 1;

  const dashboardTypeEnabled = {
    link: dashboardContent === 'ALL' || dashboardContent === 'LINK',
    document:
      dashboardContent === 'ALL' || dashboardContent === 'DOCUMENT',
    note: dashboardContent === 'ALL' || dashboardContent === 'NOTE',
  };

  const dashboardVisibilityLabel =
    dashboardVisibility === 'ALL'
      ? 'Todas'
      : dashboardVisibility === 'PUBLIC'
        ? 'Publicos'
        : 'Restritos';

  const dashboardLinkRate = useMemo(() => {
    if (!dashboardRangeDays) return null;
    return dashboardTypeCounts.link / dashboardRangeDays;
  }, [dashboardRangeDays, dashboardTypeCounts.link]);

  return (
    <>
      <div
        className="motion-item flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        style={staggerStyle(1)}
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            Indicadores do portal
          </h1>
          <p className="text-[13px] sm:text-sm text-muted-foreground">
            Acompanhe links criados, publicacao e engajamento.
          </p>
        </div>
      </div>

      <section
        className="motion-item mt-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-6"
        style={staggerStyle(2)}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Painel administrativo
            </p>
            <h2 className="font-display text-xl text-foreground sm:text-2xl">
              Dashboard de conteudo
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Filtros e metricas para administracao.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Periodo
              </label>
              <select
                value={dashboardRange}
                onChange={(event) => {
                  setDashboardRange(
                    event.target.value as 'ALL' | '7D' | '30D' | '90D',
                  );
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[11px] text-foreground sm:text-xs"
              >
                <option value="ALL">Todo o periodo</option>
                <option value="7D">Ultimos 7 dias</option>
                <option value="30D">Ultimos 30 dias</option>
                <option value="90D">Ultimos 90 dias</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Visibilidade
              </label>
              <select
                value={dashboardVisibility}
                onChange={(event) => {
                  setDashboardVisibility(
                    event.target.value as 'ALL' | 'PUBLIC' | 'RESTRICTED',
                  );
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[11px] text-foreground sm:text-xs"
              >
                <option value="ALL">Todas</option>
                <option value="PUBLIC">Publicos</option>
                <option value="RESTRICTED">Restritos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Conteudo
              </label>
              <select
                value={dashboardContent}
                onChange={(event) => {
                  setDashboardContent(
                    event.target.value as 'ALL' | 'LINK' | 'DOCUMENT' | 'NOTE',
                  );
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[11px] text-foreground sm:text-xs"
              >
                <option value="ALL">Todos</option>
                <option value="LINK">Links</option>
                <option value="DOCUMENT">Documentos</option>
                <option value="NOTE">Notas</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : loading ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            Carregando dashboard...
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div
                className={`rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)] ${
                  dashboardTypeEnabled.link ? '' : 'opacity-50'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Links criados
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(dashboardTypeCounts.link)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Publicos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.link.publicCount,
                  )}{' '}
                  • Restritos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.link.restrictedCount,
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {dashboardRangeLabel}
                  {dashboardLinkRate !== null
                    ? ` • Media/dia ${dashboardLinkRate.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}`
                    : ''}
                </p>
              </div>

              <div
                className={`rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)] ${
                  dashboardTypeEnabled.document ? '' : 'opacity-50'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Documentos
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(dashboardTypeCounts.document)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Publicos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.document.publicCount,
                  )}{' '}
                  • Restritos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.document.restrictedCount,
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {dashboardRangeLabel}
                </p>
              </div>

              <div
                className={`rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)] ${
                  dashboardTypeEnabled.note ? '' : 'opacity-50'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Notas
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(dashboardTypeCounts.note)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Publicos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.note.publicCount,
                  )}{' '}
                  • Restritos:{' '}
                  {numberFormatter.format(
                    dashboardTypeVisibility.note.restrictedCount,
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {dashboardRangeLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total de itens
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(dashboardTotal)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Categorias:{' '}
                  {numberFormatter.format(categories.length)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {dashboardRangeLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Distribuicao por tipo
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {numberFormatter.format(dashboardTotal)} itens
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full bg-foreground/80"
                      style={{ width: `${dashboardTypePercentages.link}%` }}
                    />
                    <div
                      className="h-full bg-foreground/55"
                      style={{ width: `${dashboardTypePercentages.document}%` }}
                    />
                    <div
                      className="h-full bg-foreground/35"
                      style={{ width: `${dashboardTypePercentages.note}%` }}
                    />
                  </div>
                  <div className="space-y-2 text-[12px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-foreground/80" />
                        Links
                      </span>
                      <span>
                        {numberFormatter.format(dashboardTypeCounts.link)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-foreground/55" />
                        Documentos
                      </span>
                      <span>
                        {numberFormatter.format(dashboardTypeCounts.document)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-foreground/35" />
                        Notas
                      </span>
                      <span>
                        {numberFormatter.format(dashboardTypeCounts.note)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Visibilidade
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {dashboardVisibilityLabel}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full bg-foreground/80"
                      style={{ width: `${dashboardVisibilityPercentages.public}%` }}
                    />
                    <div
                      className="h-full bg-foreground/35"
                      style={{
                        width: `${dashboardVisibilityPercentages.restricted}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-2 text-[12px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-foreground/80" />
                        Publicos
                      </span>
                      <span>
                        {numberFormatter.format(
                          dashboardVisibilityCounts.publicCount,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-foreground/35" />
                        Restritos
                      </span>
                      <span>
                        {numberFormatter.format(
                          dashboardVisibilityCounts.restrictedCount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Categorias em destaque
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {dashboardCategoryStats.length === 0
                      ? 'Sem dados'
                      : `${dashboardCategoryStats.length} categorias`}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {dashboardCategoryStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Sem categorias no periodo selecionado.
                    </p>
                  ) : (
                    dashboardCategoryStats.map((category) => (
                      <div key={category.id} className="flex items-center gap-3">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: category.color || '#94a3b8',
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[12px] text-foreground">
                            <span>{category.name}</span>
                            <span className="text-muted-foreground">
                              {numberFormatter.format(category.count)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-border/60">
                            <div
                              className="h-full rounded-full bg-foreground/70"
                              style={{
                                width: `${
                                  (category.count / dashboardCategoryScale) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section
        className="motion-item mt-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-6"
        style={staggerStyle(3)}
      >
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Cadastros do sistema
          </p>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">
            Usuarios, empresas e configuracoes
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Visao geral dos cadastros e configuracoes do portal.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : loading ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            Carregando cadastros...
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Usuarios
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(users.length)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Ativos:{' '}
                  {numberFormatter.format(
                    users.filter((u) => u.status?.toUpperCase() === 'ACTIVE').length
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total de usuarios cadastrados
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Empresas
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(companies.length)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Ativas:{' '}
                  {numberFormatter.format(
                    companies.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total de empresas cadastradas
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Setores
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(sectors.length)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Ativos:{' '}
                  {numberFormatter.format(
                    sectors.filter((s) => s.status?.toUpperCase() === 'ACTIVE').length
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total de setores cadastrados
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Categorias
                </p>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {numberFormatter.format(categories.length)}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Ativas:{' '}
                  {numberFormatter.format(
                    categories.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total de categorias cadastradas
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Usuarios por empresa
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Top 5
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {companies
                    .map((company) => ({
                      ...company,
                      userCount: users.filter((u) => u.companyId === company.id).length,
                    }))
                    .sort((a, b) => b.userCount - a.userCount)
                    .slice(0, 5)
                    .map((company) => {
                      const maxUsers = Math.max(
                        ...companies.map((c) =>
                          users.filter((u) => u.companyId === c.id).length
                        ),
                        1
                      );
                      return (
                        <div key={company.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[12px] text-foreground">
                              <span className="truncate">{company.name}</span>
                              <span className="ml-2 text-muted-foreground">
                                {numberFormatter.format(company.userCount)}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-border/60">
                              <div
                                className="h-full rounded-full bg-primary/70"
                                style={{
                                  width: `${(company.userCount / maxUsers) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {companies.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma empresa cadastrada.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Usuarios por funcao
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {numberFormatter.format(users.length)} usuarios
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full bg-primary/80"
                      style={{
                        width: `${
                          users.length > 0
                            ? (users.filter((u) => u.role === 'SUPERADMIN').length /
                                users.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-primary/55"
                      style={{
                        width: `${
                          users.length > 0
                            ? (users.filter((u) => u.role === 'ADMIN').length /
                                users.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-primary/35"
                      style={{
                        width: `${
                          users.length > 0
                            ? (users.filter((u) => u.role === 'USER').length /
                                users.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="space-y-2 text-[12px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary/80" />
                        Superadmin
                      </span>
                      <span>
                        {numberFormatter.format(
                          users.filter((u) => u.role === 'SUPERADMIN').length
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary/55" />
                        Admin
                      </span>
                      <span>
                        {numberFormatter.format(
                          users.filter((u) => u.role === 'ADMIN').length
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary/35" />
                        Usuario
                      </span>
                      <span>
                        {numberFormatter.format(
                          users.filter((u) => u.role === 'USER').length
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
