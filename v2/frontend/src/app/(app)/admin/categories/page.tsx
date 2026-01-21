'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Company } from '@/types';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import { isUserMode } from '@/lib/app-mode';

const pageSize = 8;

export default function CategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAdminOnly, setFilterAdminOnly] = useState('ALL');
  const [filterUsage, setFilterUsage] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [adminOnly, setAdminOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;
  const canSelectCompany = isSuperAdmin && !isUserMode;
  const resolvedCompanyId = canSelectCompany ? companyId || undefined : user?.companyId;

  useNotifyOnChange(error);
  useNotifyOnChange(formError);

  const loadCategories = async () => {
    if (!resolvedCompanyId && !isSuperAdmin && !isUserMode) return;
    const params = new URLSearchParams();
    if (resolvedCompanyId && !isUserMode) {
      params.set('companyId', resolvedCompanyId);
    }
    if (isAdmin || isSuperAdmin) {
      params.set('includeInactive', 'true');
    }
    const queryString = params.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    const response = await api.get(url);
    setCategories(response.data);
  };

  const loadCompanies = async () => {
    if (!canSelectCompany) return;
    const response = await api.get('/companies');
    setCompanies(response.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;

      if (!user?.companyId && !isSuperAdmin && !isUserMode) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      try {
        if (canSelectCompany) {
          await loadCompanies();
        }
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
  }, [companyId, hasHydrated, canSelectCompany, isSuperAdmin, user?.companyId]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (
        term &&
        !category.name.toLowerCase().includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (category.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterAdminOnly === 'ADMIN' && !category.adminOnly) {
        return false;
      }
      if (filterAdminOnly === 'PUBLIC' && category.adminOnly) {
        return false;
      }
      const totalItems =
        (category._count?.links ?? 0) +
        (category._count?.schedules ?? 0) +
        (category._count?.notes ?? 0);
      if (filterUsage === 'WITH' && totalItems === 0) {
        return false;
      }
      if (filterUsage === 'WITHOUT' && totalItems > 0) {
        return false;
      }
      return true;
    });
  }, [categories, filterAdminOnly, filterStatus, filterUsage, search]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(filterAdminOnly !== 'ALL') +
    Number(filterUsage !== 'ALL');

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
    setAdminOnly(false);
    setFormCompanyId(canSelectCompany ? companyId : '');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setColor(category.color || '#3b82f6');
    setAdminOnly(Boolean(category.adminOnly));
    setFormCompanyId(canSelectCompany ? category.companyId || '' : '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const resolvedCompanyId = canSelectCompany ? formCompanyId : user?.companyId;
    if (!resolvedCompanyId) {
      setFormError(
        isUserMode
          ? 'Nao foi possivel identificar o usuario.'
          : 'Selecione uma empresa.',
      );
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {
        name,
        color: color || undefined,
        adminOnly,
        companyId: resolvedCompanyId,
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

  const toggleCategoryStatus = async (category: Category) => {
    const normalizedStatus = (category.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(category.id);
    setError(null);

    // Atualização otimista do status apenas
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === category.id ? { ...cat, status: nextStatus as any } : cat
      )
    );

    try {
      await api.patch(`/categories/${category.id}`, {
        status: nextStatus,
      });
      // Recarrega para atualizar as contagens (_count)
      await loadCategories();
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === category.id ? { ...cat, status: normalizedStatus as any } : cat
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status da categoria.';
      setError(typeof message === 'string' ? message : 'Erro ao atualizar status.');
    } finally {
      setStatusUpdatingId(null);
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

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterAdminOnly('ALL');
    setFilterUsage('ALL');
    setPage(1);
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
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:w-auto xl:max-w-[640px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar categoria"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          {canSelectCompany && (
            <select
              value={companyId}
              onChange={(event) => {
                setCompanyId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
            >
              <option value="">Todas as empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          )}
          <FilterDropdown activeCount={activeFilters}>
            <div className="grid gap-3 text-xs text-foreground">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterStatus}
                  onChange={(event) => {
                    setFilterStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos</option>
                  <option value="ACTIVE">Ativas</option>
                  <option value="INACTIVE">Inativas</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Acesso
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterAdminOnly}
                  onChange={(event) => {
                    setFilterAdminOnly(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos</option>
                  <option value="PUBLIC">Equipe</option>
                  <option value="ADMIN">Somente admins</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Uso
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterUsage}
                  onChange={(event) => {
                    setFilterUsage(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos</option>
                  <option value="WITH">Com itens</option>
                  <option value="WITHOUT">Sem itens</option>
                </select>
              </div>
              <button
                type="button"
                className="rounded-md border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-foreground/60"
                onClick={clearFilters}
                disabled={activeFilters === 0}
              >
                Limpar filtros
              </button>
            </div>
          </FilterDropdown>
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Nova categoria
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredCategories.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedCategories.map((category) => {
            const linksCount = category._count?.links || 0;
            const schedulesCount = category._count?.schedules || 0;
            const notesCount = category._count?.notes || 0;
            const totalCount = linksCount + schedulesCount + notesCount;
            const normalizedStatus = (category.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            const accessLabel = category.adminOnly ? 'Admins' : 'Equipe';
            const accessClass = category.adminOnly
              ? 'text-amber-700'
              : 'text-muted-foreground';
            const accentColor = category.color || '#94a3b8';
            return (
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
                className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full border border-border/70"
                      style={{ backgroundColor: accentColor }}
                    />
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {category.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Categoria ${isActive ? 'ativa' : 'inativa'}`}
                    title={isActive ? 'Ativa' : 'Inativa'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCategoryStatus(category);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === category.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === category.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className={accessClass}>{accessLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-border/70" />
                  <span>{totalCount} {totalCount === 1 ? 'item' : 'itens'}</span>
                </div>
              </article>
            );
          })}
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
        panelClassName="max-w-4xl"
        footer={
          <>
            {editing && (
              <button
                type="button"
                className="mr-auto rounded-lg border border-destructive/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-destructive"
                onClick={() => {
                  setFormError(null);
                  setModalOpen(false);
                  setDeleteTarget(editing);
                }}
                disabled={formLoading}
              >
                Remover
              </button>
            )}
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Detalhes
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {canSelectCompany && (
                <div className="md:col-span-2">
                  <AdminField label="Empresa" htmlFor="category-company">
                    <select
                      id="category-company"
                      className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                      value={formCompanyId}
                      onChange={(event) => setFormCompanyId(event.target.value)}
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                </div>
              )}
              <div>
                <AdminField label="Nome" htmlFor="category-name">
                  <input
                    id="category-name"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </AdminField>
              </div>
              <div>
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
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Permissoes
            </p>
            <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                id="category-admin-only"
                checked={adminOnly}
                onChange={(event) => setAdminOnly(event.target.checked)}
                className="mt-1 rounded border-border/70"
              />
              <span>Apenas administradores podem ver itens desta categoria</span>
            </label>
          </div>
        </div>
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
      </AdminModal>
    </div>
  );
}
