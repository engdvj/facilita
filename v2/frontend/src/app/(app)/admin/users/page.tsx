'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string | null;
  companyId?: string | null;
  unitId?: string | null;
  sectorId?: string | null;
};

type CompanyOption = { id: string; name: string };

type UnitOption = { id: string; name: string; companyId?: string | null };

type SectorOption = { id: string; name: string; unitId?: string | null };

const pageSize = 8;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [status, setStatus] = useState('ACTIVE');
  const [companyId, setCompanyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const loadUsers = async () => {
    const [usersResponse, companiesResponse, unitsResponse, sectorsResponse] =
      await Promise.all([
        api.get('/users'),
        api.get('/companies'),
        api.get('/units'),
        api.get('/sectors'),
      ]);
    setUsers(usersResponse.data);
    setCompanies(companiesResponse.data);
    setUnits(unitsResponse.data);
    setSectors(sectorsResponse.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!accessToken) {
        setLoading(false);
        setError('Faca login para acessar os usuarios.');
        return;
      }
      try {
        await loadUsers();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os usuarios.');
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

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(term),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
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

  const filteredSectors = useMemo(() => {
    if (!unitId) return sectors;
    return sectors.filter((sector) => sector.unitId === unitId);
  }, [unitId, sectors]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('ADMIN');
    setStatus('ACTIVE');
    setCompanyId('');
    setUnitId('');
    setSectorId('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setName(user.name);
    setUsername(user.email);
    setPassword('');
    setRole(user.role);
    setStatus(user.status);
    setCompanyId(user.companyId || '');
    setUnitId(user.unitId || '');
    setSectorId(user.sectorId || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        name,
        username,
        role,
        status,
        companyId: companyId || undefined,
        unitId: unitId || undefined,
        sectorId: sectorId || undefined,
      };

      if (!editing || password.trim()) {
        payload.password = password;
      }

      if (editing) {
        await api.patch(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      await loadUsers();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar o usuario.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar usuario.',
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
      await api.delete(`/users/${deleteTarget.id}`);
      await loadUsers();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover o usuario.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover usuario.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 min-w-0 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Perfis, papeis e acessos da equipe administrativa.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar usuario"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Novo usuario
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
            {loading ? 'Carregando...' : `${filteredUsers.length} registros`}
          </p>
        </div>
        <div className="grid auto-rows-fr gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedUsers.map((user) => (
            <article
              key={user.id}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(user)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openEdit(user);
                }
              }}
              className="group flex h-full cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Usuario
                  </p>
                  <p className="truncate text-base font-semibold text-foreground">
                    {user.name}
                  </p>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="break-all text-foreground/80">{user.email}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Role
                  </span>
                  <span className="text-right text-foreground/80">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Criado
                  </span>
                  <span className="text-right text-foreground/80">
                    {formatDate(user.createdAt || undefined)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  className="rounded-md border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground transition hover:border-foreground/60"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(user);
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
                    setDeleteTarget(user);
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
          {!loading && paginatedUsers.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum usuario encontrado.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar usuario' : 'Novo usuario'}
        description="Configure credenciais e vinculos do usuario." 
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
              disabled={
                formLoading ||
                !name.trim() ||
                !username.trim() ||
                (!editing && !password.trim())
              }
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nome" htmlFor="user-name">
            <input
              id="user-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>
          <AdminField label="Usuario" htmlFor="user-username">
            <input
              id="user-username"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </AdminField>
          <AdminField
            label="Senha"
            htmlFor="user-password"
            hint={editing ? 'Deixe em branco para manter.' : undefined}
          >
            <input
              id="user-password"
              type="password"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </AdminField>
          <AdminField label="Role" htmlFor="user-role">
            <select
              id="user-role"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="COORDINATOR">COORDINATOR</option>
              <option value="MANAGER">MANAGER</option>
              <option value="COLLABORATOR">COLLABORATOR</option>
            </select>
          </AdminField>
          <AdminField label="Status" htmlFor="user-status">
            <select
              id="user-status"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </AdminField>
          <AdminField label="Empresa" htmlFor="user-company" hint="Opcional">
            <select
              id="user-company"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={companyId}
              onChange={(event) => {
                setCompanyId(event.target.value);
                setUnitId('');
                setSectorId('');
              }}
            >
              <option value="">Sem vinculo</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Unidade" htmlFor="user-unit" hint="Opcional">
            <select
              id="user-unit"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={unitId}
              onChange={(event) => {
                setUnitId(event.target.value);
                setSectorId('');
              }}
            >
              <option value="">Sem vinculo</option>
              {filteredUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Setor" htmlFor="user-sector" hint="Opcional">
            <select
              id="user-sector"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={sectorId}
              onChange={(event) => setSectorId(event.target.value)}
            >
              <option value="">Sem vinculo</option>
              {filteredSectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
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
        title="Remover usuario"
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
