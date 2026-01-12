'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type Sector = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  companyId?: string | null;
  unitId?: string | null;
  company?: { name: string } | null;
  unit?: { name: string } | null;
};

type CompanyOption = { id: string; name: string };

type UnitOption = { id: string; name: string; companyId?: string | null };

const pageSize = 8;

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterUnitId, setFilterUnitId] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sector | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<Sector | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useNotifyOnChange(error);
  useNotifyOnChange(formError);

  const loadSectors = async () => {
    const [sectorsResponse, companiesResponse, unitsResponse] =
      await Promise.all([api.get('/sectors'), api.get('/companies'), api.get('/units')]);
    setSectors(sectorsResponse.data);
    setCompanies(companiesResponse.data);
    setUnits(unitsResponse.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!accessToken) {
        setLoading(false);
        setError('Faca login para acessar os setores.');
        return;
      }
      try {
        await loadSectors();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os setores.');
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

  const filteredSectors = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sectors.filter((sector) => {
      if (
        term &&
        !`${sector.name} ${sector.unit?.name ?? ''} ${sector.company?.name ?? ''}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (sector.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterCompanyId && sector.companyId !== filterCompanyId) {
        return false;
      }
      if (filterUnitId && sector.unitId !== filterUnitId) {
        return false;
      }
      return true;
    });
  }, [
    filterCompanyId,
    filterStatus,
    filterUnitId,
    search,
    sectors,
  ]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(Boolean(filterCompanyId)) +
    Number(Boolean(filterUnitId));

  const totalPages = Math.max(1, Math.ceil(filteredSectors.length / pageSize));
  const paginatedSectors = filteredSectors.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const filteredUnits = useMemo(() => {
    if (!companyId) return units;
    return units.filter((unit) => unit.companyId === companyId);
  }, [companyId, units]);

  const filteredFilterUnits = useMemo(() => {
    if (!filterCompanyId) return units;
    return units.filter((unit) => unit.companyId === filterCompanyId);
  }, [filterCompanyId, units]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setCompanyId('');
    setUnitId('');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (sector: Sector) => {
    setEditing(sector);
    setName(sector.name);
    setDescription(sector.description || '');
    setCompanyId(sector.companyId || '');
    setUnitId(sector.unitId || '');
    setStatus(sector.status || 'ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/sectors/${editing.id}`, {
          name,
          description: description || undefined,
          companyId,
          unitId,
          status,
        });
      } else {
        await api.post('/sectors', {
          name,
          description: description || undefined,
          companyId,
          unitId,
          status,
        });
      }
      await loadSectors();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar o setor.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar setor.',
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
      await api.delete(`/sectors/${deleteTarget.id}`);
      await loadSectors();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover o setor.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover setor.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterCompanyId('');
    setFilterUnitId('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Setores</h1>
          <p className="text-sm text-muted-foreground">
            Organize departamentos e areas com permissao por setor.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto xl:max-w-[520px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar setor"
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
                  <option value="ACTIVE">Ativos</option>
                  <option value="INACTIVE">Inativos</option>
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
                    setFilterUnitId('');
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
                  Unidade
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterUnitId}
                  onChange={(event) => {
                    setFilterUnitId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todas</option>
                  {filteredFilterUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
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
            Novo setor
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredSectors.length} registros`}
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedSectors.map((sector) => (
            <article
              key={sector.id}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(sector)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openEdit(sector);
                }
              }}
              className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Setor
                </p>
                <StatusBadge status={sector.status} />
              </div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                {sector.name}
              </h3>
              {(sector.unit?.name || sector.company?.name) && (
                <span className="text-[10px] text-muted-foreground">
                  {sector.unit?.name || sector.company?.name}
                </span>
              )}
            </article>
          ))}
          {!loading && paginatedSectors.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum setor encontrado.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar setor' : 'Novo setor'}
        description="Setores organizam times dentro de uma unidade." 
        onClose={() => setModalOpen(false)}
        panelClassName="max-w-5xl"
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
              disabled={formLoading || !name.trim() || !companyId || !unitId}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <AdminField label="Nome" htmlFor="sector-name">
              <input
                id="sector-name"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </AdminField>
          </div>
          <AdminField label="Status" htmlFor="sector-status">
            <select
              id="sector-status"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </AdminField>
          <div className="md:col-span-3">
            <AdminField label="Descricao" htmlFor="sector-description" hint="Opcional">
              <textarea
                id="sector-description"
                rows={3}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </AdminField>
          </div>
          <div className="md:col-span-2">
            <AdminField label="Empresa" htmlFor="sector-company">
              <select
                id="sector-company"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setUnitId('');
                }}
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
          <AdminField
            label="Unidade"
            htmlFor="sector-unit"
            hint={!companyId ? 'Selecione uma empresa primeiro.' : undefined}
          >
            <select
              id="sector-unit"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-70"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              disabled={!companyId}
            >
              <option value="">Selecione</option>
              {filteredUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </AdminField>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover setor"
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
