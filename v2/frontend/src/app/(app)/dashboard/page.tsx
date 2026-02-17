'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Link, Note, UploadedSchedule, User } from '@/types';

type PeriodFilter = 'ALL' | '30' | '7';
type VisibilityFilter = 'ALL' | 'PUBLIC' | 'PRIVATE';
type ContentFilter = 'ALL' | 'LINK' | 'SCHEDULE' | 'NOTE';

function filterByDate<T extends { createdAt: string }>(items: T[], period: PeriodFilter) {
  if (period === 'ALL') return items;
  const days = Number(period);
  const limit = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt).getTime() >= limit);
}

function getErrorMessage(error: unknown, fallback: string) {
  const payload = error as { response?: { data?: { message?: unknown } } };
  const message = payload.response?.data?.message;
  return typeof message === 'string' ? message : fallback;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodFilter>('ALL');
  const [visibility, setVisibility] = useState<VisibilityFilter>('ALL');
  const [content, setContent] = useState<ContentFilter>('ALL');

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;
      if (!user) {
        setLoading(false);
        setError('Faca login para acessar o dashboard.');
        return;
      }
      if (user.role !== 'SUPERADMIN') {
        setLoading(false);
        setError('Acesso restrito ao superadmin.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [usersRes, linksRes, schedulesRes, notesRes] = await Promise.all([
          api.get('/users'),
          api.get('/links/admin/list', { params: { includeInactive: true } }),
          api.get('/schedules/admin/list', { params: { includeInactive: true } }),
          api.get('/notes/admin/list', { params: { includeInactive: true } }),
        ]);

        if (!active) return;

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setLinks(Array.isArray(linksRes.data) ? linksRes.data : []);
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      } catch (err: unknown) {
        if (!active) return;
        setError(getErrorMessage(err, 'Nao foi possivel carregar o dashboard.'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [hasHydrated, user]);

  const filteredLinks = useMemo(() => {
    const byDate = filterByDate(links, period);
    if (visibility === 'ALL') return byDate;
    return byDate.filter((item) => item.visibility === visibility);
  }, [links, period, visibility]);

  const filteredSchedules = useMemo(() => {
    const byDate = filterByDate(schedules, period);
    if (visibility === 'ALL') return byDate;
    return byDate.filter((item) => item.visibility === visibility);
  }, [schedules, period, visibility]);

  const filteredNotes = useMemo(() => {
    const byDate = filterByDate(notes, period);
    if (visibility === 'ALL') return byDate;
    return byDate.filter((item) => item.visibility === visibility);
  }, [notes, period, visibility]);

  const visibleByContent = useMemo(() => {
    if (content === 'LINK') return { links: filteredLinks, schedules: [], notes: [] as Note[] };
    if (content === 'SCHEDULE')
      return { links: [] as Link[], schedules: filteredSchedules, notes: [] as Note[] };
    if (content === 'NOTE') return { links: [] as Link[], schedules: [] as UploadedSchedule[], notes: filteredNotes };
    return { links: filteredLinks, schedules: filteredSchedules, notes: filteredNotes };
  }, [content, filteredLinks, filteredNotes, filteredSchedules]);

  const stats = useMemo(() => {
    const linksList = visibleByContent.links;
    const schedulesList = visibleByContent.schedules;
    const notesList = visibleByContent.notes;

    const linkPublic = linksList.filter((item) => item.visibility === 'PUBLIC').length;
    const schedulePublic = schedulesList.filter((item) => item.visibility === 'PUBLIC').length;
    const notePublic = notesList.filter((item) => item.visibility === 'PUBLIC').length;

    const linkPrivate = linksList.length - linkPublic;
    const schedulePrivate = schedulesList.length - schedulePublic;
    const notePrivate = notesList.length - notePublic;

    const allItems: Array<Link | UploadedSchedule | Note> = [
      ...linksList,
      ...schedulesList,
      ...notesList,
    ];

    const categoryMap = new Map<string, number>();
    allItems.forEach((item) => {
      const name = item.category?.name;
      if (!name) return;
      categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      users: users.length,
      usersActive: users.filter((item) => item.status === 'ACTIVE').length,
      links: linksList.length,
      linkPublic,
      linkPrivate,
      schedules: schedulesList.length,
      schedulePublic,
      schedulePrivate,
      notes: notesList.length,
      notePublic,
      notePrivate,
      totalItems: allItems.length,
      topCategories,
    };
  }, [users, visibleByContent]);

  const periodLabel = period === 'ALL' ? 'Periodo completo' : `Ultimos ${period} dias`;

  if (loading) {
    return <div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">Carregando dashboard...</div>;
  }

  if (error) {
    return <div className="fac-panel border-red-400 bg-red-50 px-6 py-4 text-[14px] text-red-700">{error}</div>;
  }

  return (
    <div className="fac-page">
      <section>
        <p className="fac-kicker">Dashboard</p>
        <h1 className="fac-subtitle">Indicadores do portal</h1>
        <p className="text-[15px] text-muted-foreground">Acompanhe links criados, publicacao e engajamento.</p>
      </section>

      <section className="fac-panel">
        <div className="fac-panel-body space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="fac-kicker">Painel administrativo</p>
              <h2 className="fac-title-md">Dashboard de conteudo</h2>
              <p className="text-[14px] text-muted-foreground">Filtros e metricas para administracao.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="fac-label">Periodo</label>
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value as PeriodFilter)}
                  className="fac-select"
                >
                  <option value="ALL">Todo o periodo</option>
                  <option value="30">Ultimos 30 dias</option>
                  <option value="7">Ultimos 7 dias</option>
                </select>
              </div>

              <div>
                <label className="fac-label">Visibilidade</label>
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as VisibilityFilter)}
                  className="fac-select"
                >
                  <option value="ALL">Todas</option>
                  <option value="PUBLIC">Publicas</option>
                  <option value="PRIVATE">Restritas</option>
                </select>
              </div>

              <div>
                <label className="fac-label">Conteudo</label>
                <select
                  value={content}
                  onChange={(event) => setContent(event.target.value as ContentFilter)}
                  className="fac-select"
                >
                  <option value="ALL">Todos</option>
                  <option value="LINK">Links</option>
                  <option value="SCHEDULE">Documentos</option>
                  <option value="NOTE">Notas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <article className="fac-form-card">
              <p className="fac-kicker">Links criados</p>
              <p className="text-[42px] leading-none text-foreground">{stats.links}</p>
              <p className="text-[14px] text-muted-foreground">
                Publicos: {stats.linkPublic} • Restritos: {stats.linkPrivate}
              </p>
              <p className="text-[14px] text-muted-foreground">{periodLabel}</p>
            </article>

            <article className="fac-form-card">
              <p className="fac-kicker">Documentos</p>
              <p className="text-[42px] leading-none text-foreground">{stats.schedules}</p>
              <p className="text-[14px] text-muted-foreground">
                Publicos: {stats.schedulePublic} • Restritos: {stats.schedulePrivate}
              </p>
              <p className="text-[14px] text-muted-foreground">{periodLabel}</p>
            </article>

            <article className="fac-form-card">
              <p className="fac-kicker">Notas</p>
              <p className="text-[42px] leading-none text-foreground">{stats.notes}</p>
              <p className="text-[14px] text-muted-foreground">
                Publicos: {stats.notePublic} • Restritos: {stats.notePrivate}
              </p>
              <p className="text-[14px] text-muted-foreground">{periodLabel}</p>
            </article>

            <article className="fac-form-card">
              <p className="fac-kicker">Total de itens</p>
              <p className="text-[42px] leading-none text-foreground">{stats.totalItems}</p>
              <p className="text-[14px] text-muted-foreground">Categorias: {stats.topCategories.length}</p>
              <p className="text-[14px] text-muted-foreground">{periodLabel}</p>
            </article>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <article className="fac-form-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="fac-kicker">Distribuicao por tipo</p>
                <p className="text-[13px] text-muted-foreground">{stats.totalItems} itens</p>
              </div>
              <div className="mb-3 h-2 rounded-full bg-muted/80" />
              <div className="space-y-2 text-[14px] text-foreground">
                <p className="flex items-center justify-between">
                  <span>Links</span>
                  <strong>{stats.links}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Documentos</span>
                  <strong>{stats.schedules}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Notas</span>
                  <strong>{stats.notes}</strong>
                </p>
              </div>
            </article>

            <article className="fac-form-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="fac-kicker">Visibilidade</p>
                <p className="text-[13px] text-muted-foreground">{visibility === 'ALL' ? 'Todas' : visibility}</p>
              </div>
              <div className="mb-3 h-2 rounded-full bg-muted/80" />
              <div className="space-y-2 text-[14px] text-foreground">
                <p className="flex items-center justify-between">
                  <span>Publicos</span>
                  <strong>{stats.linkPublic + stats.schedulePublic + stats.notePublic}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Restritos</span>
                  <strong>{stats.linkPrivate + stats.schedulePrivate + stats.notePrivate}</strong>
                </p>
              </div>
            </article>

            <article className="fac-form-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="fac-kicker">Categorias em destaque</p>
                <p className="text-[13px] text-muted-foreground">
                  {stats.topCategories.length > 0 ? `${stats.topCategories.length} categorias` : 'Sem dados'}
                </p>
              </div>

              {stats.topCategories.length === 0 ? (
                <p className="text-[14px] text-muted-foreground">Sem categorias no periodo selecionado.</p>
              ) : (
                <ul className="space-y-2 text-[14px] text-foreground">
                  {stats.topCategories.map((category) => (
                    <li key={category.name} className="flex items-center justify-between">
                      <span className="line-clamp-1">{category.name}</span>
                      <strong>{category.count}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          <div className="text-[13px] text-muted-foreground">
            Usuarios ativos: {stats.usersActive} de {stats.users}.
          </div>
        </div>
      </section>
    </div>
  );
}

