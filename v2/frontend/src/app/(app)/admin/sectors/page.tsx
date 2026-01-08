'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

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
    if (!search.trim()) return sectors;
    const term = search.toLowerCase();
    return sectors.filter((sector) =>
      `${sector.name} ${sector.unit?.name ?? ''} ${sector.company?.name ?? ''}`
        .toLowerCase()
        .includes(term),
    );
  }, [sectors, search]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Setores</h1>
          <p className="text-sm text-muted-foreground">
            Organize departamentos e areas com permissao por setor.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar setor"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Novo setor
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
            {loading ? 'Carregando...' : `${filteredSectors.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
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
              className="group cursor-pointer rounded-2xl border border-border/70 bg-card/80 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {sector.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Unidade: {sector.unit?.name || '--'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Empresa: {sector.company?.name || '--'}
                  </p>
                </div>
                <StatusBadge status={sector.status} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Criado</span>
                <span>{formatDate(sector.createdAt || undefined)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(sector);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-destructive/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFormError(null);
                    setDeleteTarget(sector);
                  }}
                >
                  Remover
                </button>
              </div>
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
              disabled={formLoading || !name.trim() || !companyId || !unitId}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nome" htmlFor="sector-name">
            <input
              id="sector-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>
          <AdminField label="Descricao" htmlFor="sector-description" hint="Opcional">
            <input
              id="sector-description"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </AdminField>
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
          <AdminField label="Unidade" htmlFor="sector-unit">
            <select
              id="sector-unit"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
            >
              <option value="">Selecione</option>
              {filteredUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </AdminField>
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
        </div>
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
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
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
