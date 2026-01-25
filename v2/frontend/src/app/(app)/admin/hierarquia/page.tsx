'use client';

import { useEffect, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  logoUrl?: string | null;
  status?: string | null;
};

type Unit = {
  id: string;
  name: string;
  cnpj?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  companyId?: string | null;
};

type Sector = {
  id: string;
  name: string;
  imageUrl?: string | null;
  status?: string | null;
  companyId?: string | null;
  sectorUnits?: {
    unitId: string;
    isPrimary?: boolean | null;
    unit?: { id: string; name: string; companyId?: string | null } | null;
  }[] | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  companyId?: string | null;
  avatarUrl?: string | null;
};

type UserItem = {
  id: string;
  title: string;
  type: 'link' | 'document' | 'note';
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

type HeaderValue = string | string[] | number | boolean | null | undefined;

const pageSize = 6;

type ResponseLike = {
  headers?: unknown;
  data?: unknown;
};

const resolveTotalCount = (response: ResponseLike) => {
  const headerSource = response.headers;
  let rawHeader: HeaderValue | undefined;

  if (headerSource && typeof headerSource === 'object') {
    const headerGetter = (
      headerSource as { get?: (name: string) => HeaderValue }
    ).get;
    if (typeof headerGetter === 'function') {
      rawHeader = headerGetter('x-total-count');
    } else {
      const headerRecord = headerSource as Record<string, HeaderValue>;
      rawHeader =
        headerRecord['x-total-count'] ?? headerRecord['X-Total-Count'];
    }
  }

  const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const parsed =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number.parseInt(raw, 10)
        : Number.NaN;
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return Array.isArray(response.data) ? response.data.length : 0;
};

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const getPrimarySectorUnit = (sector?: Sector | null) =>
  sector?.sectorUnits?.find((unit) => unit.isPrimary) || sector?.sectorUnits?.[0];

const normalizeImagePosition = (position?: string | null) => {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const withPercent = (value: string) =>
    value.includes('%') ? value : `${value}%`;
  return `${withPercent(x)} ${withPercent(y)}`;
};

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${serverURL}${imageUrl}`;
};

const cardGradients = [
  'from-[#f4b26b]/70 via-[#fdf7ef]/70 to-[#9bb3aa]/70',
  'from-[#102c32]/35 via-[#fdf7ef]/70 to-[#f4b26b]/60',
  'from-[#9bb3aa]/55 via-[#fdf7ef]/70 to-[#102c32]/35',
  'from-[#f4b26b]/55 via-[#fdf7ef]/70 to-[#102c32]/30',
];

const hashString = (value: string) =>
  value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

const getCardGradient = (seed: string) =>
  cardGradients[Math.abs(hashString(seed)) % cardGradients.length];

const getInitial = (value: string) =>
  value.trim().charAt(0).toUpperCase() || '?';

type VisualCardProps = {
  id: string;
  title: string;
  subtitle?: string | null;
  typeLabel: string;
  status?: string | null;
  imageUrl?: string | null;
  selected?: boolean;
  onClick: () => void;
};

function VisualCard({
  id,
  title,
  subtitle,
  typeLabel,
  status,
  imageUrl,
  selected,
  onClick,
}: VisualCardProps) {
  const resolvedImageUrl = resolveImageUrl(imageUrl);
  const gradient = getCardGradient(id);
  const initial = getInitial(title);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`motion-item group flex w-full flex-col gap-3 rounded-xl border bg-card/95 p-3 text-left shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
        selected
          ? 'border-foreground/50 shadow-[0_18px_36px_rgba(16,44,50,0.18)] ring-2 ring-primary/20'
          : 'border-border/70 hover:-translate-y-0.5 hover:border-foreground/30'
      }`}
    >
      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-secondary/60">
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 contrast-110 saturate-110 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        {!resolvedImageUrl && (
          <span className="pointer-events-none absolute -right-3 -top-4 text-6xl font-display text-white/25">
            {initial}
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div
          className="absolute left-3 top-3 z-10 max-w-[calc(100%-120px)] truncate rounded-[12px] border border-black/5 bg-white/95 px-2 py-1 text-[11px] font-semibold text-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          title={title}
        >
          {title}
        </div>
        {status && (
          <div className="absolute right-3 top-3 z-10">
            <StatusBadge status={status} />
          </div>
        )}
        {subtitle && (
          <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-120px)] truncate rounded-[10px] border border-black/5 bg-white/90 px-2 py-1 text-[10px] text-[#111] shadow-[0_2px_5px_rgba(0,0,0,0.06)]">
            {subtitle}
          </div>
        )}
        <div className="absolute bottom-3 right-3 z-10 rounded-[10px] border border-black/5 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111] shadow-[0_2px_5px_rgba(0,0,0,0.06)]">
          {typeLabel}
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
      </div>
    </button>
  );
}

export default function HierarquiaPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<UserItem[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [companyTotalCount, setCompanyTotalCount] = useState(0);
  const [unitTotalCount, setUnitTotalCount] = useState(0);
  const [sectorTotalCount, setSectorTotalCount] = useState(0);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [itemTotalCount, setItemTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [unitPage, setUnitPage] = useState(1);
  const [sectorPage, setSectorPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [itemPage, setItemPage] = useState(1);
  const [sectorSearch, setSectorSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useNotifyOnChange(error);
  const canLoad = hasHydrated && Boolean(accessToken) && isSuperAdmin;

  useEffect(() => {
    let active = true;

    const loadCompanies = async () => {
      if (!accessToken) {
        setCompaniesLoading(false);
        setError('Faca login para acessar a hierarquia.');
        return;
      }
      if (!isSuperAdmin) {
        setCompaniesLoading(false);
        return;
      }
      try {
        setCompaniesLoading(true);
        const response = await api.get(
          `/companies${buildQuery({ page: companyPage, pageSize })}`,
        );
        if (!active) return;
        setCompanies(response.data);
        setCompanyTotalCount(resolveTotalCount(response));
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar a hierarquia.');
          }
        }
      } finally {
        if (active) {
          setCompaniesLoading(false);
        }
      }
    };

    if (hasHydrated) {
      loadCompanies();
    }
    return () => {
      active = false;
    };
  }, [accessToken, companyPage, hasHydrated, isSuperAdmin]);

  useEffect(() => {
    let active = true;

    if (!canLoad) return () => {
      active = false;
    };

    if (!selectedCompanyId) {
      setUnits([]);
      setUnitTotalCount(0);
      setUnitsLoading(false);
      return () => {
        active = false;
      };
    }

    const loadUnits = async () => {
      try {
        setUnitsLoading(true);
        const response = await api.get(
          `/units${buildQuery({
            companyId: selectedCompanyId,
            page: unitPage,
            pageSize,
          })}`,
        );
        if (!active) return;
        setUnits(response.data);
        setUnitTotalCount(resolveTotalCount(response));
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
          setUnitsLoading(false);
        }
      }
    };

    loadUnits();
    return () => {
      active = false;
    };
  }, [canLoad, selectedCompanyId, unitPage]);

  useEffect(() => {
    let active = true;

    if (!canLoad) return () => {
      active = false;
    };

    if (!selectedUnitId) {
      setSectors([]);
      setSectorTotalCount(0);
      setSectorsLoading(false);
      return () => {
        active = false;
      };
    }

    const loadSectors = async () => {
      try {
        setSectorsLoading(true);
        const response = await api.get(
          `/sectors${buildQuery({
            unitId: selectedUnitId,
            page: sectorPage,
            pageSize,
            search: sectorSearch,
          })}`,
        );
        if (!active) return;
        setSectors(response.data);
        setSectorTotalCount(resolveTotalCount(response));
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
          setSectorsLoading(false);
        }
      }
    };

    loadSectors();
    return () => {
      active = false;
    };
  }, [canLoad, sectorPage, sectorSearch, selectedUnitId]);

  useEffect(() => {
    let active = true;

    if (!canLoad) return () => {
      active = false;
    };

    if (!selectedSectorId) {
      setUsers([]);
      setUserTotalCount(0);
      setUsersLoading(false);
      return () => {
        active = false;
      };
    }

    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await api.get(
          `/users${buildQuery({
            sectorId: selectedSectorId,
            unitId: selectedUnitId,
            page: userPage,
            pageSize,
            search: userSearch,
          })}`,
        );
        if (!active) return;
        setUsers(response.data);
        setUserTotalCount(resolveTotalCount(response));
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
          setUsersLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      active = false;
    };
  }, [canLoad, selectedSectorId, selectedUnitId, userPage, userSearch]);

  useEffect(() => {
    let active = true;

    if (!canLoad) return () => {
      active = false;
    };

    if (!selectedUserId || !selectedSectorId) {
      setItems([]);
      setItemTotalCount(0);
      setItemsLoading(false);
      return () => {
        active = false;
      };
    }

    const loadItems = async () => {
      try {
        setItemsLoading(true);
        const response = await api.get(
          `/users/${selectedUserId}/access-items${buildQuery({
            sectorId: selectedSectorId,
            unitId: selectedUnitId,
            page: itemPage,
            pageSize,
          })}`,
        );
        if (!active) return;
        setItems(response.data);
        setItemTotalCount(resolveTotalCount(response));
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os itens.');
          }
        }
      } finally {
        if (active) {
          setItemsLoading(false);
        }
      }
    };

    loadItems();
    return () => {
      active = false;
    };
  }, [canLoad, itemPage, selectedSectorId, selectedUnitId, selectedUserId]);

  const companyTotalPages = Math.max(
    1,
    Math.ceil(companyTotalCount / pageSize),
  );
  const unitTotalPages = Math.max(1, Math.ceil(unitTotalCount / pageSize));
  const sectorTotalPages = Math.max(1, Math.ceil(sectorTotalCount / pageSize));
  const userTotalPages = Math.max(1, Math.ceil(userTotalCount / pageSize));
  const itemTotalPages = Math.max(1, Math.ceil(itemTotalCount / pageSize));

  useEffect(() => {
    if (companyPage > companyTotalPages) {
      setCompanyPage(companyTotalPages);
    }
  }, [companyPage, companyTotalPages]);

  useEffect(() => {
    if (unitPage > unitTotalPages) {
      setUnitPage(unitTotalPages);
    }
  }, [unitPage, unitTotalPages]);

  useEffect(() => {
    if (sectorPage > sectorTotalPages) {
      setSectorPage(sectorTotalPages);
    }
  }, [sectorPage, sectorTotalPages]);

  useEffect(() => {
    if (userPage > userTotalPages) {
      setUserPage(userTotalPages);
    }
  }, [userPage, userTotalPages]);

  useEffect(() => {
    if (itemPage > itemTotalPages) {
      setItemPage(itemTotalPages);
    }
  }, [itemPage, itemTotalPages]);

  const handleSelectCompany = (companyId: string) => {
    const nextCompanyId = selectedCompanyId === companyId ? '' : companyId;
    setSelectedCompanyId(nextCompanyId);
    setSelectedUnitId('');
    setSelectedSectorId('');
    setSelectedUserId('');
    setSectorSearch('');
    setUserSearch('');
    setUnitPage(1);
    setSectorPage(1);
    setUserPage(1);
    setItemPage(1);
    setUnits([]);
    setSectors([]);
    setUsers([]);
    setItems([]);
    setUnitTotalCount(0);
    setSectorTotalCount(0);
    setUserTotalCount(0);
    setItemTotalCount(0);
  };

  const handleSelectUnit = (unitId: string) => {
    const nextUnitId = selectedUnitId === unitId ? '' : unitId;
    setSelectedUnitId(nextUnitId);
    setSelectedSectorId('');
    setSelectedUserId('');
    setSectorSearch('');
    setUserSearch('');
    setSectorPage(1);
    setUserPage(1);
    setItemPage(1);
    setSectors([]);
    setUsers([]);
    setItems([]);
    setSectorTotalCount(0);
    setUserTotalCount(0);
    setItemTotalCount(0);
  };

  const handleSelectSector = (sectorId: string) => {
    const nextSectorId = selectedSectorId === sectorId ? '' : sectorId;
    setSelectedSectorId(nextSectorId);
    setSelectedUserId('');
    setUserSearch('');
    setUserPage(1);
    setItemPage(1);
    setUsers([]);
    setItems([]);
    setUserTotalCount(0);
    setItemTotalCount(0);
  };

  const handleSelectUser = (userId: string) => {
    const nextUserId = selectedUserId === userId ? '' : userId;
    setSelectedUserId(nextUserId);
    setItemPage(1);
    if (!nextUserId) {
      setItems([]);
      setItemTotalCount(0);
    }
  };

  if (hasHydrated && user && user.role !== 'SUPERADMIN') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Hierarquia</h1>
          <p className="text-sm text-muted-foreground">
            Esta visualizacao e exclusiva para superadmin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-foreground">Hierarquia</h1>
        <p className="text-sm text-muted-foreground">
          Explore empresas, unidades, setores, usuarios e seus itens.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Empresas
            </p>
            <p className="text-xs text-muted-foreground">
              {companiesLoading
                ? 'Carregando...'
                : `${companyTotalCount} registros`}
            </p>
          </div>
          <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
            {companies.map((company) => {
              const isSelected = company.id === selectedCompanyId;
              return (
                <VisualCard
                  key={company.id}
                  id={company.id}
                  title={company.name}
                  subtitle={company.cnpj || undefined}
                  status={company.status}
                  imageUrl={company.logoUrl || undefined}
                  typeLabel="EMPRESA"
                  selected={isSelected}
                  onClick={() => handleSelectCompany(company.id)}
                />
              );
            })}
            {!companiesLoading && companies.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhuma empresa encontrada.
              </div>
            )}
          </div>
          <AdminPager
            page={companyPage}
            totalPages={companyTotalPages}
            onPageChange={setCompanyPage}
          />
        </div>

        <div className="surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Unidades
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedCompanyId
                ? unitsLoading
                  ? 'Carregando...'
                  : `${unitTotalCount} registros`
                : 'Selecione uma empresa'}
            </p>
          </div>
          <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
            {!selectedCompanyId && !companiesLoading && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione uma empresa para listar unidades.
              </div>
            )}
            {selectedCompanyId &&
              units.map((unit) => {
                const isSelected = unit.id === selectedUnitId;
                return (
                  <VisualCard
                    key={unit.id}
                    id={unit.id}
                    title={unit.name}
                    subtitle={unit.cnpj || undefined}
                    status={unit.status}
                    imageUrl={unit.imageUrl || undefined}
                    typeLabel="UNIDADE"
                    selected={isSelected}
                    onClick={() => handleSelectUnit(unit.id)}
                  />
                );
              })}
            {selectedCompanyId && !unitsLoading && units.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhuma unidade encontrada para esta empresa.
              </div>
            )}
          </div>
          <AdminPager
            page={unitPage}
            totalPages={unitTotalPages}
            onPageChange={setUnitPage}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Setores
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedUnitId
                ? sectorsLoading
                  ? 'Carregando...'
                  : `${sectorTotalCount} registros`
                : 'Selecione uma unidade'}
            </p>
          </div>
          <div className="px-4 pt-4 sm:px-6">
            <input
              value={sectorSearch}
              onChange={(event) => {
                setSectorSearch(event.target.value);
                setSectorPage(1);
                setSelectedSectorId('');
                setSelectedUserId('');
                setUserSearch('');
                setUsers([]);
                setItems([]);
                setUserTotalCount(0);
                setItemTotalCount(0);
              }}
              placeholder={
                selectedUnitId ? 'Buscar setor' : 'Selecione uma unidade'
              }
              disabled={!selectedUnitId}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
            {!selectedUnitId && !unitsLoading && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione uma unidade para listar setores.
              </div>
            )}
            {selectedUnitId &&
              sectors.map((sector) => {
                const primaryUnit = getPrimarySectorUnit(sector);
                const isSelected = sector.id === selectedSectorId;
                return (
                  <VisualCard
                    key={sector.id}
                    id={sector.id}
                    title={sector.name}
                    subtitle={primaryUnit?.unit?.name || undefined}
                    status={sector.status}
                    imageUrl={sector.imageUrl || undefined}
                    typeLabel="SETOR"
                    selected={isSelected}
                    onClick={() => handleSelectSector(sector.id)}
                  />
                );
              })}
            {selectedUnitId && !sectorsLoading && sectors.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhum setor encontrado para esta unidade.
              </div>
            )}
          </div>
          <AdminPager
            page={sectorPage}
            totalPages={sectorTotalPages}
            onPageChange={setSectorPage}
          />
        </div>

        <div className="surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Usuarios
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedSectorId
                ? usersLoading
                  ? 'Carregando...'
                  : `${userTotalCount} registros`
                : 'Selecione um setor'}
            </p>
          </div>
          <div className="px-4 pt-4 sm:px-6">
            <input
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
                setUserPage(1);
                setSelectedUserId('');
                setItems([]);
                setItemTotalCount(0);
              }}
              placeholder={
                selectedSectorId ? 'Buscar usuario' : 'Selecione um setor'
              }
              disabled={!selectedSectorId}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
          <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
            {!selectedSectorId && !sectorsLoading && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione um setor para listar usuarios.
              </div>
            )}
            {selectedSectorId &&
              users.map((item) => {
                const isSelected = item.id === selectedUserId;
                return (
                  <VisualCard
                    key={item.id}
                    id={item.id}
                    title={item.name}
                    subtitle={item.email}
                    status={item.status}
                    imageUrl={item.avatarUrl || undefined}
                    typeLabel={item.role}
                    selected={isSelected}
                    onClick={() => handleSelectUser(item.id)}
                  />
                );
              })}
            {selectedSectorId && !usersLoading && users.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhum usuario encontrado para este setor.
              </div>
            )}
          </div>
          <AdminPager
            page={userPage}
            totalPages={userTotalPages}
            onPageChange={setUserPage}
          />
        </div>
      </div>

      <div className="surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Itens
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedUserId
              ? itemsLoading
                ? 'Carregando...'
                : `${itemTotalCount} registros`
              : 'Selecione um usuario'}
          </p>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          {!selectedUserId && !usersLoading && (
            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
              Selecione um usuario para listar itens.
            </div>
          )}
          {selectedUserId && items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const typeLabel =
                  item.type === 'link'
                    ? 'LINK'
                    : item.type === 'document'
                      ? 'DOC'
                      : 'NOTA';
                const imageUrl = resolveImageUrl(item.imageUrl);
                const isInactive = item.status
                  ? item.status.toUpperCase() !== 'ACTIVE'
                  : false;
                const baseClass =
                  'group relative flex h-28 overflow-hidden rounded-lg bg-card/95 ring-1 ring-black/5 shadow-[0_12px_24px_rgba(16,44,50,0.12)] sm:h-32';
                return (
                  <div key={`${item.type}-${item.id}`} className={baseClass}>
                    <div className="relative h-full w-full overflow-hidden bg-secondary/60">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full object-cover transition-transform duration-500 contrast-110 saturate-110 ${
                            isInactive
                              ? 'grayscale opacity-60'
                              : 'group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125'
                          }`}
                          style={{
                            objectPosition: normalizeImagePosition(item.imagePosition),
                            transform: `scale(${item.imageScale || 1})`,
                            transformOrigin: normalizeImagePosition(item.imagePosition),
                          }}
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 ${
                            isInactive ? 'grayscale opacity-60' : ''
                          }`}
                        />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                      <div className="absolute bottom-2 right-2 z-10 rounded-[10px] border border-black/5 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111] shadow-[0_2px_5px_rgba(0,0,0,0.06)]">
                        {typeLabel}
                      </div>
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedUserId && !itemsLoading && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhum item encontrado para este usuario.
            </div>
          )}
        </div>
        <AdminPager
          page={itemPage}
          totalPages={itemTotalPages}
          onPageChange={setItemPage}
        />
      </div>
    </div>
  );
}
