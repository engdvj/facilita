'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import { Category } from '@/types';

const pageSize = 8;

export default function CategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('');
  const [adminOnly, setAdminOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadCategories = async () => {
    if (!user?.companyId) return;
    const response = await api.get(`/categories?companyId=${user.companyId}`);
    setCategories(response.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;

      if (!user?.companyId) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      try {
        await loadCategories();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar as categorias.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, user?.companyId]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter((category) =>
      `${category.name} ${category.icon ?? ''}`.toLowerCase().includes(term),
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setColor('#3b82f6');
    setIcon('');
    setAdminOnly(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setColor(category.color || '#3b82f6');
    setIcon(category.icon || '');
    setAdminOnly(Boolean(category.adminOnly));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user?.companyId) {
      setFormError('Usuario sem empresa associada.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {
        name,
        color: color || undefined,
        icon: icon || undefined,
        adminOnly,
        companyId: user.companyId,
      };

      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      await loadCategories();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar a categoria.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar categoria.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      await loadCategories();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover a categoria.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover categoria.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as categorias usadas no portal.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar categoria"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Nova categoria
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredCategories.length} registros`}
          </p>
        </div>
        <div className="grid auto-rows-fr gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedCategories.map((category) => (
            <article
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(category)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openEdit(category);
                }
              }}
              className="group flex h-full cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Categoria
                  </p>
                  <p className="truncate text-base font-semibold text-foreground">
                    {category.name}
                  </p>
                </div>
                <StatusBadge status={category.status} />
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Icone
                  </span>
                  <span className="text-right text-foreground/80">
                    {category.icon || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Cor
                  </span>
                  <span className="flex items-center gap-2 text-right text-foreground/80">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-border/70"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    {category.color || '#3b82f6'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Uso
                  </span>
                  <span className="text-right text-foreground/80">
                    {category._count?.links || 0} links,{' '}
                    {category._count?.schedules || 0} agendas
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Acesso
                  </span>
                  <span className="text-right text-foreground/80">
                    {category.adminOnly ? 'Somente admin' : 'Todos'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Criado
                  </span>
                  <span className="text-right text-foreground/80">
                    {formatDate(category.createdAt || undefined)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  className="rounded-md border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground transition hover:border-foreground/60"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(category);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-md border border-destructive/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-destructive transition hover:border-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFormError(null);
                    setDeleteTarget(category);
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
          {!loading && paginatedCategories.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma categoria encontrada.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        description="Categorias organizam links e documentos."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground"
              onClick={() => setModalOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              onClick={handleSave}
              disabled={formLoading || !name.trim()}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nome" htmlFor="category-name">
            <input
              id="category-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>
          <AdminField label="Icone" htmlFor="category-icon" hint="Opcional">
            <input
              id="category-icon"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
            />
          </AdminField>
          <AdminField label="Cor" htmlFor="category-color">
            <input
              id="category-color"
              type="color"
              className="h-11 w-full rounded-lg border border-border/70 bg-white/80"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </AdminField>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            id="category-admin-only"
            checked={adminOnly}
            onChange={(event) => setAdminOnly(event.target.checked)}
            className="rounded border-border/70"
          />
          <label htmlFor="category-admin-only">
            Apenas administradores podem criar nesta categoria
          </label>
        </div>
        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover categoria"
        description="Essa acao nao pode ser desfeita."
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground"
              onClick={() => setDeleteTarget(null)}
              disabled={formLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-destructive px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              onClick={confirmDelete}
              disabled={formLoading}
            >
              {formLoading ? 'Removendo' : 'Remover'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirme a exclusao de{' '}
          <span className="text-foreground">{deleteTarget?.name}</span>.
        </p>
        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
