'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type CompanyOption = { id: string; name: string };

type UnitOption = { id: string; name: string; companyId?: string | null };

type SectorOption = {
  id: string;
  name: string;
  companyId?: string | null;
  sectorUnits?: {
    unitId: string;
    isPrimary?: boolean | null;
    unit?: UnitOption | null;
  }[] | null;
};

type SectorRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

type UserSector = {
  sectorId: string;
  isPrimary?: boolean | null;
  role?: SectorRole | null;
  userSectorUnits?: { unitId: string }[] | null;
  sector?: SectorOption | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string | null;
  companyId?: string | null;
  userSectors?: UserSector[] | null;
};

type UserSectorSelection = {
  sectorId: string;
  role: SectorRole;
  isPrimary: boolean;
  unitIds: string[];
};

const pageSize = 8;

const getPrimaryUserSector = (user: User) =>
  user.userSectors?.find((sector) => sector.isPrimary) || user.userSectors?.[0];

const getPrimarySectorUnit = (sector?: SectorOption | null) =>
  sector?.sectorUnits?.find((unit) => unit.isPrimary) ||
  sector?.sectorUnits?.[0];

const getUserSectorUnitIds = (userSector: UserSector) => {
  const explicitUnitIds =
    userSector.userSectorUnits
      ?.map((unit) => unit.unitId)
      .filter((unitId): unitId is string => Boolean(unitId)) || [];
  if (explicitUnitIds.length > 0) {
    return explicitUnitIds;
  }
  return (
    userSector.sector?.sectorUnits
      ?.map((unit) => unit.unitId)
      .filter((unitId): unitId is string => Boolean(unitId)) || []
  );
};

const userMatchesUnit = (user: User, selectedUnitId: string) =>
  Boolean(
    user.userSectors?.some((userSector) =>
      getUserSectorUnitIds(userSector).some(
        (unitId) => unitId === selectedUnitId,
      ),
    )
  );

const userMatchesSector = (user: User, selectedSectorId: string) =>
  Boolean(
    user.userSectors?.some((userSector) => userSector.sectorId === selectedSectorId)
  );

const sectorMatchesUnit = (sector: SectorOption, selectedUnitId: string) =>
  Boolean(sector.sectorUnits?.some((unit) => unit.unitId === selectedUnitId));

const sectorRoleOptions: SectorRole[] = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];

const getSectorUnitNames = (sector?: SectorOption | null) =>
  sector?.sectorUnits
    ?.map((unit) => unit.unit?.name)
    .filter((name): name is string => Boolean(name))
    .join(', ') || '';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterUnitId, setFilterUnitId] = useState('');
  const [filterSectorId, setFilterSectorId] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COLLABORATOR');
  const [status, setStatus] = useState('ACTIVE');
  const [companyId, setCompanyId] = useState('');
  const [sectorUnitFilterId, setSectorUnitFilterId] = useState('');
  const [sectorSelections, setSectorSelections] = useState<UserSectorSelection[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useNotifyOnChange(error);
  useNotifyOnChange(formError);

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
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (
        term &&
        !`${user.name} ${user.email}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (user.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterRole !== 'ALL' && user.role !== filterRole) {
        return false;
      }
      if (filterCompanyId && user.companyId !== filterCompanyId) {
        return false;
      }
      if (filterUnitId && !userMatchesUnit(user, filterUnitId)) {
        return false;
      }
      if (filterSectorId && !userMatchesSector(user, filterSectorId)) {
        return false;
      }
      return true;
    });
  }, [
    filterCompanyId,
    filterRole,
    filterSectorId,
    filterStatus,
    filterUnitId,
    search,
    users,
  ]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(filterRole !== 'ALL') +
    Number(Boolean(filterCompanyId)) +
    Number(Boolean(filterUnitId)) +
    Number(Boolean(filterSectorId));

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

  const filteredFilterUnits = useMemo(() => {
    if (!filterCompanyId) return units;
    return units.filter((unit) => unit.companyId === filterCompanyId);
  }, [filterCompanyId, units]);

  const filteredFilterSectors = useMemo(() => {
    if (!filterUnitId) return sectors;
    return sectors.filter((sector) => sectorMatchesUnit(sector, filterUnitId));
  }, [filterUnitId, sectors]);

  const sectorSelectionMap = useMemo(() => {
    const map = new Map<string, UserSectorSelection>();
    sectorSelections.forEach((selection) => {
      map.set(selection.sectorId, selection);
    });
    return map;
  }, [sectorSelections]);

  const availableSectors = useMemo(() => {
    let scoped = sectors;
    if (companyId) {
      scoped = scoped.filter((sector) => sector.companyId === companyId);
    }
    if (sectorUnitFilterId) {
      scoped = scoped.filter((sector) =>
        sectorMatchesUnit(sector, sectorUnitFilterId),
      );
    }

    const selectedIds = new Set(sectorSelections.map((selection) => selection.sectorId));
    const selectedExtras = sectors.filter(
      (sector) => selectedIds.has(sector.id) && !scoped.some((item) => item.id === sector.id),
    );

    return [...selectedExtras, ...scoped];
  }, [companyId, sectorSelections, sectorUnitFilterId, sectors]);

  const toggleSectorSelection = (sectorId: string) => {
    setSectorSelections((current) => {
      const existing = current.find((selection) => selection.sectorId === sectorId);
      if (existing) {
        const next = current.filter((selection) => selection.sectorId !== sectorId);
        if (existing.isPrimary && next.length > 0) {
          return next.map((selection, index) => ({
            ...selection,
            isPrimary: index === 0,
          }));
        }
        return next;
      }

      const nextSelection: UserSectorSelection = {
        sectorId,
        role: 'MEMBER',
        isPrimary: current.length === 0,
        unitIds: [],
      };
      return [...current, nextSelection];
    });
  };

  const handlePrimarySectorChange = (sectorId: string) => {
    setSectorSelections((current) => {
      const hasSelection = current.some((selection) => selection.sectorId === sectorId);
      if (!hasSelection) {
        return [
          ...current.map((selection) => ({ ...selection, isPrimary: false })),
          {
            sectorId,
            role: 'MEMBER',
            isPrimary: true,
            unitIds: [],
          },
        ];
      }
      return current.map((selection) => ({
        ...selection,
        isPrimary: selection.sectorId === sectorId,
      }));
    });
  };

  const handleSectorRoleChange = (sectorId: string, role: SectorRole) => {
    setSectorSelections((current) => {
      const hasSelection = current.some((selection) => selection.sectorId === sectorId);
      if (!hasSelection) {
        return [
          ...current,
          {
            sectorId,
            role,
            isPrimary: current.length === 0,
            unitIds: [],
          },
        ];
      }
      return current.map((selection) =>
        selection.sectorId === sectorId ? { ...selection, role } : selection,
      );
    });
  };

  const toggleSectorUnitSelection = (sectorId: string, unitId: string) => {
    setSectorSelections((current) =>
      current.map((selection) => {
        if (selection.sectorId !== sectorId) {
          return selection;
        }
        const nextUnitIds = new Set(selection.unitIds);
        if (nextUnitIds.has(unitId)) {
          nextUnitIds.delete(unitId);
        } else {
          nextUnitIds.add(unitId);
        }
        return { ...selection, unitIds: Array.from(nextUnitIds) };
      }),
    );
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('COLLABORATOR');
    setStatus('ACTIVE');
    setCompanyId('');
    setSectorUnitFilterId('');
    setSectorSelections([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    const primaryUserSector = getPrimaryUserSector(user);
    const primarySectorUnit = getPrimarySectorUnit(primaryUserSector?.sector);
    const primaryUserUnitId = primaryUserSector?.userSectorUnits?.[0]?.unitId;
    const selections =
      user.userSectors?.map((sector) => ({
        sectorId: sector.sectorId,
        role: sector.role || 'MEMBER',
        isPrimary: Boolean(sector.isPrimary),
        unitIds: sector.userSectorUnits?.map((unit) => unit.unitId) || [],
      })) || [];
    const hasPrimary = selections.some((selection) => selection.isPrimary);
    const normalizedSelections = hasPrimary
      ? selections
      : selections.map((selection, index) => ({
          ...selection,
          isPrimary: index === 0,
        }));
    setEditing(user);
    setName(user.name);
    setUsername(user.email);
    setPassword('');
    setRole(user.role);
    setStatus(user.status);
    setCompanyId(user.companyId || '');
    setSectorUnitFilterId(primaryUserUnitId || primarySectorUnit?.unitId || '');
    setSectorSelections(normalizedSelections);
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
        sectors: sectorSelections.map((selection) => ({
          sectorId: selection.sectorId,
          isPrimary: selection.isPrimary,
          role: selection.role,
          unitIds: selection.unitIds,
        })),
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

  const toggleUserStatus = async (user: User) => {
    const normalizedStatus = (user.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(user.id);
    setError(null);

    // Atualização otimista
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: nextStatus as any } : u
      )
    );

    try {
      await api.patch(`/users/${user.id}`, {
        status: nextStatus,
      });
      await loadUsers();
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: normalizedStatus as any } : u
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status do usuario.';
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

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterRole('ALL');
    setFilterCompanyId('');
    setFilterUnitId('');
    setFilterSectorId('');
    setPage(1);
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
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto xl:max-w-[560px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar usuario"
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
                  Role
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterRole}
                  onChange={(event) => {
                    setFilterRole(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todos</option>
                  <option value="SUPERADMIN">Superadmin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="COLLABORATOR">Colaborador</option>
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
                    setFilterSectorId('');
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
                    setFilterSectorId('');
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
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Setor
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterSectorId}
                  onChange={(event) => {
                    setFilterSectorId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos</option>
                  {filteredFilterSectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
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
            Novo usuario
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredUsers.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedUsers.map((user) => {
            const normalizedStatus = (user.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            return (
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
                className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {user.name}
                    </h3>
                    {user.email && (
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {user.email}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Usuario ${isActive ? 'ativo' : 'inativo'}`}
                    title={isActive ? 'Ativo' : 'Inativo'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleUserStatus(user);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === user.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === user.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Identidade
            </p>
            <div className="mt-3 grid gap-4">
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
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Vinculos
            </p>
            <div className="mt-3 grid gap-4">
              <AdminField label="Empresa" htmlFor="user-company" hint="Opcional">
                <select
                  id="user-company"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  value={companyId}
                  onChange={(event) => {
                    setCompanyId(event.target.value);
                    setSectorUnitFilterId('');
                    setSectorSelections([]);
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
              <AdminField
                label="Unidade (filtro)"
                htmlFor="user-unit-filter"
                hint={
                  !companyId
                    ? 'Selecione uma empresa primeiro.'
                    : 'Opcional. Filtra a lista de setores.'
                }
              >
                <select
                  id="user-unit-filter"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                  value={sectorUnitFilterId}
                  onChange={(event) => setSectorUnitFilterId(event.target.value)}
                  disabled={!companyId}
                >
                  <option value="">Todas</option>
                  {filteredUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField
                label="Setores"
                htmlFor="user-sectors"
                hint="Selecione setores, unidades, principal e papel."
              >
                <div
                  id="user-sectors"
                  className="space-y-2 rounded-lg border border-border/70 bg-card/60 p-3"
                >
                  {!companyId && (
                    <p className="text-xs text-muted-foreground">
                      Selecione uma empresa para listar setores.
                    </p>
                  )}
                  {companyId && availableSectors.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum setor disponivel para esta empresa.
                    </p>
                  )}
                  {companyId && availableSectors.length > 0 && (
                    <div className="space-y-2">
                      {availableSectors.map((sector) => {
                        const selection = sectorSelectionMap.get(sector.id);
                        const isSelected = Boolean(selection);
                        const unitNames = getSectorUnitNames(sector);
                        const selectedUnitIds = selection?.unitIds ?? [];
                        const sectorUnits = sector.sectorUnits ?? [];
                        return (
                          <div
                            key={sector.id}
                            className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${
                              isSelected
                                ? 'border-foreground/30 bg-white/90'
                                : 'border-border/70 bg-card/70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-border/70"
                              checked={isSelected}
                              onChange={() => toggleSectorSelection(sector.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {sector.name}
                              </p>
                              {unitNames && (
                                <p className="text-[11px] text-muted-foreground">
                                  {unitNames}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                <input
                                  type="radio"
                                  name="user-primary-sector"
                                  className="h-4 w-4"
                                  checked={selection?.isPrimary ?? false}
                                  onChange={() => handlePrimarySectorChange(sector.id)}
                                />
                                Principal
                              </label>
                              <select
                                className="rounded-md border border-border/70 bg-white/80 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground disabled:opacity-70"
                                value={selection?.role ?? 'MEMBER'}
                                onChange={(event) =>
                                  handleSectorRoleChange(
                                    sector.id,
                                    event.target.value as SectorRole,
                                  )
                                }
                                disabled={!isSelected}
                              >
                                {sectorRoleOptions.map((roleOption) => (
                                  <option key={roleOption} value={roleOption}>
                                    {roleOption}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {isSelected && (
                              <div className="w-full border-t border-border/60 pt-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                  <span>Unidades com acesso</span>
                                  {selectedUnitIds.length > 0 ? (
                                    <span>{selectedUnitIds.length} selecionada(s)</span>
                                  ) : (
                                    <span>Todas as unidades</span>
                                  )}
                                </div>
                                {sectorUnits.length === 0 && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    Nenhuma unidade vinculada a este setor.
                                  </p>
                                )}
                                {sectorUnits.length > 0 && (
                                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {sectorUnits.map((sectorUnit) => {
                                      const unitId = sectorUnit.unitId;
                                      const unitLabel =
                                        sectorUnit.unit?.name || unitId;
                                      const isUnitSelected = selectedUnitIds.includes(unitId);
                                      return (
                                        <label
                                          key={unitId}
                                          className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${
                                            isUnitSelected
                                              ? 'border-foreground/30 bg-white/80 text-foreground'
                                              : 'border-border/70 bg-card/70 text-muted-foreground'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-border/70"
                                            checked={isUnitSelected}
                                            onChange={() =>
                                              toggleSectorUnitSelection(sector.id, unitId)
                                            }
                                          />
                                          <span className="truncate">{unitLabel}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                  Se nenhuma unidade for marcada, o usuario tem acesso a todas as unidades do setor.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </AdminField>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Acesso
            </p>
            <div className="mt-3 grid gap-4">
              <AdminField label="Role" htmlFor="user-role">
                <select
                  id="user-role"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  <option value="ADMIN">ADMIN</option>
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
            </div>
          </div>
        </div>
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
      </AdminModal>
    </div>
  );
}
