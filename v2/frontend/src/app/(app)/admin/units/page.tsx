'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import { isUserMode } from '@/lib/app-mode';

type Unit = {
  id: string;
  name: string;
  cnpj?: string | null;
  status?: string | null;
  createdAt?: string | null;
  companyId?: string | null;
  company?: {
    name: string;
  } | null;
};

type CompanyOption = {
  id: string;
  name: string;
};

const pageSize = 8;

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterCnpj, setFilterCnpj] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useNotifyOnChange(error);
  useNotifyOnChange(formError);

  const loadUnits = async () => {
    const [unitsResponse, companiesResponse] = await Promise.all([
      api.get('/units'),
      api.get('/companies'),
    ]);
    setUnits(unitsResponse.data);
    setCompanies(companiesResponse.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (isUserMode) {
        setLoading(false);
        return;
      }
      if (!accessToken) {
        setLoading(false);
        setError('Faca login para acessar as unidades.');
        return;
      }
      try {
        await loadUnits();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar as unidades.');
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

  const filteredUnits = useMemo(() => {
    const term = search.trim().toLowerCase();
    return units.filter((unit) => {
      if (
        term &&
        !`${unit.name} ${unit.company?.name ?? ''}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (unit.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterCompanyId && unit.companyId !== filterCompanyId) {
        return false;
      }
      if (filterCnpj === 'WITH' && !unit.cnpj) {
        return false;
      }
      if (filterCnpj === 'WITHOUT' && unit.cnpj) {
        return false;
      }
      return true;
    });
  }, [filterCnpj, filterCompanyId, filterStatus, search, units]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(Boolean(filterCompanyId)) +
    Number(filterCnpj !== 'ALL');

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const paginatedUnits = filteredUnits.slice(
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
    setCompanyId('');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (unit: Unit) => {
    setEditing(unit);
    setName(unit.name);
    setCnpj(unit.cnpj || '');
    setCompanyId(unit.companyId || '');
    setStatus(unit.status || 'ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/units/${editing.id}`, {
          name,
          cnpj: cnpj || undefined,
          companyId,
          status,
        });
      } else {
        await api.post('/units', {
          name,
          cnpj: cnpj || undefined,
          companyId,
          status,
        });
      }
      await loadUnits();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar a unidade.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar unidade.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const toggleUnitStatus = async (unit: Unit) => {
    const normalizedStatus = (unit.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(unit.id);
    setError(null);

    // Atualização otimista
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unit.id ? { ...u, status: nextStatus as any } : u
      )
    );

    try {
      await api.patch(`/units/${unit.id}`, {
        status: nextStatus,
      });
      await loadUnits();
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setUnits((prev) =>
        prev.map((u) =>
          u.id === unit.id ? { ...u, status: normalizedStatus as any } : u
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status da unidade.';
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
      await api.delete(`/units/${deleteTarget.id}`);
      await loadUnits();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover a unidade.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover unidade.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterCompanyId('');
    setFilterCnpj('ALL');
    setPage(1);
  };

  if (isUserMode) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
        Modo usuario ativo. Cadastros de unidades ficam disponiveis apenas no modo empresa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Unidades</h1>
          <p className="text-sm text-muted-foreground">
            Filiais e unidades operacionais vinculadas a cada empresa.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto xl:max-w-[520px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar unidade"
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
                  Empresa
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterCompanyId}
                  onChange={(event) => {
                    setFilterCompanyId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
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
            Nova unidade
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredUnits.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedUnits.map((unit) => {
            const normalizedStatus = (unit.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            return (
              <article
                key={unit.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(unit)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEdit(unit);
                  }
                }}
                className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {unit.name}
                    </h3>
                    {unit.company?.name && (
                      <span className="text-[11px] text-muted-foreground">
                        {unit.company.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Unidade ${isActive ? 'ativa' : 'inativa'}`}
                    title={isActive ? 'Ativa' : 'Inativa'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleUnitStatus(unit);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === unit.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === unit.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
          {!loading && paginatedUnits.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma unidade encontrada.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar unidade' : 'Nova unidade'}
        description="Unidades pertencem a uma empresa." 
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
              disabled={formLoading || !name.trim() || !companyId}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <AdminField label="Nome" htmlFor="unit-name">
              <input
                id="unit-name"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </AdminField>
          </div>
          <AdminField label="Status" htmlFor="unit-status">
            <select
              id="unit-status"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="Empresa" htmlFor="unit-company">
              <select
                id="unit-company"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              >
                <option value="">Selecione</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField label="CNPJ" htmlFor="unit-cnpj" hint="Opcional">
            <input
              id="unit-cnpj"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
            />
          </AdminField>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover unidade"
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
