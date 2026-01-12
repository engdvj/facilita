'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

const pageSize = 8;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCnpj, setFilterCnpj] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useNotifyOnChange(error);
  useNotifyOnChange(formError);

  const loadCompanies = async () => {
    const response = await api.get('/companies');
    setCompanies(response.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!accessToken) {
        setLoading(false);
        setError('Faca login para acessar as empresas.');
        return;
      }
      try {
        await loadCompanies();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar as empresas.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (hasHydrated) {
      load();
    }
    return () => {
      active = false;
    };
  }, [accessToken, hasHydrated]);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();
    return companies.filter((company) => {
      if (
        term &&
        !`${company.name} ${company.cnpj ?? ''}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (company.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterCnpj === 'WITH' && !company.cnpj) {
        return false;
      }
      if (filterCnpj === 'WITHOUT' && company.cnpj) {
        return false;
      }
      return true;
    });
  }, [companies, filterCnpj, filterStatus, search]);

  const activeFilters =
    Number(filterStatus !== 'ALL') + Number(filterCnpj !== 'ALL');

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const paginatedCompanies = filteredCompanies.slice(
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
    setCnpj('');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setName(company.name);
    setCnpj(company.cnpj || '');
    setStatus(company.status || 'ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/companies/${editing.id}`, {
          name,
          cnpj: cnpj || undefined,
          status,
        });
      } else {
        await api.post('/companies', {
          name,
          cnpj: cnpj || undefined,
          status,
        });
      }
      await loadCompanies();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar a empresa.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar empresa.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const toggleCompanyStatus = async (company: Company) => {
    const normalizedStatus = (company.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(company.id);
    setError(null);

    // Atualização otimista
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === company.id ? { ...c, status: nextStatus as any } : c
      )
    );

    try {
      await api.patch(`/companies/${company.id}`, {
        status: nextStatus,
      });
      await loadCompanies();
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...c, status: normalizedStatus as any } : c
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status da empresa.';
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
      await api.delete(`/companies/${deleteTarget.id}`);
      await loadCompanies();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover a empresa.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover empresa.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterCnpj('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Controle de grupos e empresas cadastradas no sistema.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto xl:max-w-[520px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar empresa"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
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
                  CNPJ
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterCnpj}
                  onChange={(event) => {
                    setFilterCnpj(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos</option>
                  <option value="WITH">Com CNPJ</option>
                  <option value="WITHOUT">Sem CNPJ</option>
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
            Nova empresa
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredCompanies.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedCompanies.map((company) => {
            const normalizedStatus = (company.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            return (
              <article
                key={company.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(company)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEdit(company);
                  }
                }}
                className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {company.name}
                    </h3>
                    {company.cnpj && (
                      <span className="text-[11px] text-muted-foreground">
                        {company.cnpj}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Empresa ${isActive ? 'ativa' : 'inativa'}`}
                    title={isActive ? 'Ativa' : 'Inativa'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCompanyStatus(company);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === company.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === company.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </article>
            );
          })}
          {!loading && paginatedCompanies.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma empresa encontrada.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar empresa' : 'Nova empresa'}
        description="Preencha os dados principais da empresa."
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <AdminField label="Nome" htmlFor="company-name">
              <input
                id="company-name"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </AdminField>
          </div>
          <AdminField label="Status" htmlFor="company-status">
            <select
              id="company-status"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="CNPJ" htmlFor="company-cnpj" hint="Opcional">
              <input
                id="company-cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={cnpj}
                onChange={(event) => setCnpj(event.target.value)}
              />
            </AdminField>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover empresa"
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
