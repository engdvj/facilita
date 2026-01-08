'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

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
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
    if (!search.trim()) return units;
    const term = search.toLowerCase();
    return units.filter((unit) =>
      `${unit.name} ${unit.company?.name ?? ''}`.toLowerCase().includes(term),
    );
  }, [units, search]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Unidades</h1>
          <p className="text-sm text-muted-foreground">
            Filiais e unidades operacionais vinculadas a cada empresa.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar unidade"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Nova unidade
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
            {loading ? 'Carregando...' : `${filteredUnits.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedUnits.map((unit) => (
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
              className="group cursor-pointer rounded-2xl border border-border/70 bg-card/80 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {unit.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Empresa: {unit.company?.name || '--'}
                  </p>
                </div>
                <StatusBadge status={unit.status} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Criado</span>
                <span>{formatDate(unit.createdAt || undefined)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(unit);
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
                    setDeleteTarget(unit);
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
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
              disabled={formLoading || !name.trim() || !companyId}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nome" htmlFor="unit-name">
            <input
              id="unit-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>
          <AdminField label="CNPJ" htmlFor="unit-cnpj" hint="Opcional">
            <input
              id="unit-cnpj"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
            />
          </AdminField>
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
        </div>
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
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
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
