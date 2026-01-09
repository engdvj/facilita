'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

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
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

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
    if (!search.trim()) return companies;
    const term = search.toLowerCase();
    return companies.filter((company) =>
      `${company.name} ${company.cnpj ?? ''}`.toLowerCase().includes(term),
    );
  }, [companies, search]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Controle de grupos e empresas cadastradas no sistema.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar empresa"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Nova empresa
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
            {loading ? 'Carregando...' : `${filteredCompanies.length} registros`}
          </p>
        </div>
        <div className="grid auto-rows-fr gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedCompanies.map((company) => (
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
              className="group flex h-full cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Empresa
                  </p>
                  <p className="truncate text-base font-semibold text-foreground">
                    {company.name}
                  </p>
                </div>
                <StatusBadge status={company.status} />
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    CNPJ
                  </span>
                  <span className="text-right text-foreground/80">
                    {company.cnpj || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Criado
                  </span>
                  <span className="text-right text-foreground/80">
                    {formatDate(company.createdAt || undefined)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  className="rounded-md border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground transition hover:border-foreground/60"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(company);
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
                    setDeleteTarget(company);
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
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
          <AdminField label="Nome" htmlFor="company-name">
            <input
              id="company-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>
          <AdminField label="CNPJ" htmlFor="company-cnpj" hint="Opcional">
            <input
              id="company-cnpj"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
            />
          </AdminField>
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
        </div>
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
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
        {formError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
