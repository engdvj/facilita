'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import { getUserUnitsBySector } from '@/lib/user-scope';

type ContentAudience =
  | 'PUBLIC'
  | 'COMPANY'
  | 'SECTOR'
  | 'PRIVATE'
  | 'ADMIN'
  | 'SUPERADMIN';

type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  status?: string | null;
};

type Unit = {
  id: string;
  name: string;
  cnpj?: string | null;
  status?: string | null;
  companyId?: string | null;
};

type Sector = {
  id: string;
  name: string;
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
  userSectors?: {
    sectorId: string;
    isPrimary?: boolean | null;
    role?: string | null;
    userSectorUnits?: {
      unitId: string;
    }[] | null;
    sector?: {
      id: string;
      name: string;
      companyId?: string | null;
      sectorUnits?: {
        unitId: string;
        isPrimary?: boolean | null;
        unit?: { id: string; name: string } | null;
      }[] | null;
    } | null;
  }[] | null;
};

type LinkItem = {
  id: string;
  title: string;
  companyId?: string | null;
  sectorId?: string | null;
  unitId?: string | null;
  linkUnits?: { unitId: string }[] | null;
  userId?: string | null;
  isPublic?: boolean | null;
  audience?: ContentAudience | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

type ScheduleItem = {
  id: string;
  title: string;
  companyId?: string | null;
  sectorId?: string | null;
  unitId?: string | null;
  scheduleUnits?: { unitId: string }[] | null;
  userId?: string | null;
  isPublic?: boolean | null;
  audience?: ContentAudience | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

type NoteItem = {
  id: string;
  title: string;
  companyId?: string | null;
  sectorId?: string | null;
  unitId?: string | null;
  noteUnits?: { unitId: string }[] | null;
  userId?: string | null;
  isPublic?: boolean | null;
  audience?: ContentAudience | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  status?: string | null;
  createdAt?: string | null;
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

const pageSize = 6;

const getPrimarySectorUnit = (sector?: Sector | null) =>
  sector?.sectorUnits?.find((unit) => unit.isPrimary) || sector?.sectorUnits?.[0];

const sectorMatchesUnit = (sector: Sector, selectedUnitId: string) =>
  Boolean(sector.sectorUnits?.some((unit) => unit.unitId === selectedUnitId));

const getLinkUnitIds = (link: LinkItem) =>
  link.linkUnits?.length
    ? link.linkUnits.map((unit) => unit.unitId)
    : link.unitId
      ? [link.unitId]
      : [];

const getScheduleUnitIds = (schedule: ScheduleItem) =>
  schedule.scheduleUnits?.length
    ? schedule.scheduleUnits.map((unit) => unit.unitId)
    : schedule.unitId
      ? [schedule.unitId]
      : [];

const getNoteUnitIds = (note: NoteItem) =>
  note.noteUnits?.length
    ? note.noteUnits.map((unit) => unit.unitId)
    : note.unitId
      ? [note.unitId]
      : [];

const userMatchesSector = (user: User, selectedSectorId: string) =>
  Boolean(
    user.userSectors?.some((userSector) => userSector.sectorId === selectedSectorId),
  );

const matchesSelectedSector = (sectorId?: string | null, selectedSectorId?: string) =>
  !selectedSectorId || sectorId === selectedSectorId;

const parseTimestamp = (value?: string | null) =>
  value ? Date.parse(value) : 0;

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

const getLinkAudience = (link: LinkItem): ContentAudience => {
  if (link.isPublic) return 'PUBLIC';
  if (link.audience) return link.audience;
  if (link.sectorId) return 'SECTOR';
  return 'COMPANY';
};

const getScheduleAudience = (schedule: ScheduleItem): ContentAudience => {
  if (schedule.isPublic) return 'PUBLIC';
  if (schedule.audience) return schedule.audience;
  if (schedule.sectorId) return 'SECTOR';
  return 'COMPANY';
};

const getNoteAudience = (note: NoteItem): ContentAudience => {
  if (note.isPublic) return 'PUBLIC';
  if (note.audience) return note.audience;
  if (note.sectorId) return 'SECTOR';
  return 'COMPANY';
};

const canUserAccessItem = (
  subject: User,
  audience: ContentAudience,
  item: {
    companyId?: string | null;
    sectorId?: string | null;
    userId?: string | null;
    unitIds?: string[];
  },
  sectorIds: Set<string>,
  unitsBySector: Map<string, Set<string>>,
) => {
  if (audience === 'PUBLIC') return true;
  if (subject.role === 'SUPERADMIN') return true;
  if (audience === 'SUPERADMIN') return false;

  const hasCompanyMatch =
    Boolean(subject.companyId && item.companyId && subject.companyId === item.companyId);

  if (item.companyId && subject.companyId && !hasCompanyMatch) {
    return false;
  }

  if (audience === 'ADMIN') {
    return subject.role === 'ADMIN';
  }

  if (audience === 'PRIVATE') {
    return item.userId === subject.id;
  }

  if (audience === 'SECTOR') {
    if (subject.role === 'ADMIN') return true;
    if (!item.sectorId || !sectorIds.has(item.sectorId)) {
      return false;
    }
    if (item.unitIds && item.unitIds.length > 0) {
      const allowedUnits = unitsBySector.get(item.sectorId);
      if (allowedUnits && allowedUnits.size > 0) {
        return item.unitIds.some((unitId) => allowedUnits.has(unitId));
      }
    }
    return true;
  }

  if (audience === 'COMPANY') {
    return hasCompanyMatch;
  }

  return false;
};

export default function HierarquiaPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  useNotifyOnChange(error);

  const loadHierarchy = async () => {
    const [
      companiesResponse,
      unitsResponse,
      sectorsResponse,
      usersResponse,
      linksResponse,
      schedulesResponse,
      notesResponse,
    ] = await Promise.all([
      api.get('/companies'),
      api.get('/units'),
      api.get('/sectors'),
      api.get('/users'),
      api.get('/links/admin/list'),
      api.get('/schedules/admin/list'),
      api.get('/notes/admin/list'),
    ]);
    setCompanies(companiesResponse.data);
    setUnits(unitsResponse.data);
    setSectors(sectorsResponse.data);
    setUsers(usersResponse.data);
    setLinks(linksResponse.data);
    setSchedules(schedulesResponse.data);
    setNotes(notesResponse.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!accessToken) {
        setLoading(false);
        setError('Faca login para acessar a hierarquia.');
        return;
      }
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }
      try {
        await loadHierarchy();
        if (!active) return;
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
  }, [accessToken, hasHydrated, isSuperAdmin]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId],
  );
  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) || null,
    [selectedUnitId, units],
  );
  const selectedSector = useMemo(
    () => sectors.find((sector) => sector.id === selectedSectorId) || null,
    [selectedSectorId, sectors],
  );
  const selectedUser = useMemo(
    () => users.find((item) => item.id === selectedUserId) || null,
    [selectedUserId, users],
  );

  const filteredUnits = useMemo(() => {
    if (!selectedCompanyId) return [];
    return units.filter((unit) => unit.companyId === selectedCompanyId);
  }, [selectedCompanyId, units]);

  const filteredSectors = useMemo(() => {
    if (!selectedUnitId) return [];
    return sectors.filter((sector) => sectorMatchesUnit(sector, selectedUnitId));
  }, [selectedUnitId, sectors]);

  const filteredUsers = useMemo(() => {
    if (!selectedSectorId) return [];
    return users.filter((item) => userMatchesSector(item, selectedSectorId));
  }, [selectedSectorId, users]);

  const filteredItems = useMemo<UserItem[]>(() => {
    if (!selectedUser) return [];
    const sectorIds = new Set(
      selectedUser.userSectors?.map((userSector) => userSector.sectorId) ?? [],
    );
    const unitsBySector = getUserUnitsBySector(selectedUser);

    const userLinks = links
      .filter((link) =>
        matchesSelectedSector(link.sectorId, selectedSectorId) &&
        canUserAccessItem(
          selectedUser,
          getLinkAudience(link),
          {
            companyId: link.companyId,
            sectorId: link.sectorId,
            userId: link.userId,
            unitIds: getLinkUnitIds(link),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((link) => ({
        id: link.id,
        title: link.title,
        type: 'link' as const,
        imageUrl: link.imageUrl,
        imagePosition: link.imagePosition,
        imageScale: link.imageScale,
        status: link.status,
        createdAt: link.createdAt,
      }));
    const userSchedules = schedules
      .filter((schedule) =>
        matchesSelectedSector(schedule.sectorId, selectedSectorId) &&
        canUserAccessItem(
          selectedUser,
          getScheduleAudience(schedule),
          {
            companyId: schedule.companyId,
            sectorId: schedule.sectorId,
            userId: schedule.userId,
            unitIds: getScheduleUnitIds(schedule),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        type: 'document' as const,
        imageUrl: schedule.imageUrl,
        imagePosition: schedule.imagePosition,
        imageScale: schedule.imageScale,
        status: schedule.status,
        createdAt: schedule.createdAt,
      }));
    const userNotes = notes
      .filter((note) =>
        matchesSelectedSector(note.sectorId, selectedSectorId) &&
        canUserAccessItem(
          selectedUser,
          getNoteAudience(note),
          {
            companyId: note.companyId,
            sectorId: note.sectorId,
            userId: note.userId,
            unitIds: getNoteUnitIds(note),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((note) => ({
        id: note.id,
        title: note.title,
        type: 'note' as const,
        imageUrl: note.imageUrl,
        imagePosition: note.imagePosition,
        imageScale: note.imageScale,
        status: note.status,
        createdAt: note.createdAt,
      }));
    const items = [...userLinks, ...userSchedules, ...userNotes];
    return items.sort((a, b) => {
      const diff = parseTimestamp(b.createdAt) - parseTimestamp(a.createdAt);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });
  }, [links, notes, schedules, selectedSectorId, selectedUser]);

  const companyTotalPages = Math.max(1, Math.ceil(companies.length / pageSize));
  const unitTotalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const sectorTotalPages = Math.max(1, Math.ceil(filteredSectors.length / pageSize));
  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const itemTotalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedCompanies = companies.slice(
    (companyPage - 1) * pageSize,
    companyPage * pageSize,
  );
  const paginatedUnits = filteredUnits.slice(
    (unitPage - 1) * pageSize,
    unitPage * pageSize,
  );
  const paginatedSectors = filteredSectors.slice(
    (sectorPage - 1) * pageSize,
    sectorPage * pageSize,
  );
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize,
  );
  const paginatedItems = filteredItems.slice(
    (itemPage - 1) * pageSize,
    itemPage * pageSize,
  );

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
    setSelectedCompanyId((current) => (current === companyId ? '' : companyId));
    setSelectedUnitId('');
    setSelectedSectorId('');
    setSelectedUserId('');
    setUnitPage(1);
    setSectorPage(1);
    setUserPage(1);
    setItemPage(1);
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId((current) => (current === unitId ? '' : unitId));
    setSelectedSectorId('');
    setSelectedUserId('');
    setSectorPage(1);
    setUserPage(1);
    setItemPage(1);
  };

  const handleSelectSector = (sectorId: string) => {
    setSelectedSectorId((current) => (current === sectorId ? '' : sectorId));
    setSelectedUserId('');
    setUserPage(1);
    setItemPage(1);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId((current) => (current === userId ? '' : userId));
    setItemPage(1);
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
              {loading ? 'Carregando...' : `${companies.length} registros`}
            </p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {paginatedCompanies.map((company) => {
              const isSelected = company.id === selectedCompanyId;
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-foreground/50 bg-card shadow-[0_12px_24px_rgba(16,44,50,0.12)]'
                      : 'border-border/80 bg-card/90 hover:border-foreground/30 hover:bg-card'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {company.name}
                    </p>
                    {company.cnpj && (
                      <p className="text-[11px] text-muted-foreground">{company.cnpj}</p>
                    )}
                  </div>
                  <StatusBadge status={company.status} />
                </button>
              );
            })}
            {!loading && paginatedCompanies.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
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
              {selectedCompany
                ? `${filteredUnits.length} registros`
                : 'Selecione uma empresa'}
            </p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {!selectedCompanyId && !loading && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione uma empresa para listar unidades.
              </div>
            )}
            {selectedCompanyId &&
              paginatedUnits.map((unit) => {
                const isSelected = unit.id === selectedUnitId;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => handleSelectUnit(unit.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-foreground/50 bg-card shadow-[0_12px_24px_rgba(16,44,50,0.12)]'
                        : 'border-border/80 bg-card/90 hover:border-foreground/30 hover:bg-card'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {unit.name}
                      </p>
                      {unit.cnpj && (
                        <p className="text-[11px] text-muted-foreground">{unit.cnpj}</p>
                      )}
                    </div>
                    <StatusBadge status={unit.status} />
                  </button>
                );
              })}
            {selectedCompanyId && !loading && paginatedUnits.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
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
              {selectedUnit
                ? `${filteredSectors.length} registros`
                : 'Selecione uma unidade'}
            </p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {!selectedUnitId && !loading && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione uma unidade para listar setores.
              </div>
            )}
            {selectedUnitId &&
              paginatedSectors.map((sector) => {
                const primaryUnit = getPrimarySectorUnit(sector);
                const isSelected = sector.id === selectedSectorId;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => handleSelectSector(sector.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-foreground/50 bg-card shadow-[0_12px_24px_rgba(16,44,50,0.12)]'
                        : 'border-border/80 bg-card/90 hover:border-foreground/30 hover:bg-card'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {sector.name}
                      </p>
                      {primaryUnit?.unit?.name && (
                        <p className="text-[11px] text-muted-foreground">
                          {primaryUnit.unit.name}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={sector.status} />
                  </button>
                );
              })}
            {selectedUnitId && !loading && paginatedSectors.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
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
              {selectedSector
                ? `${filteredUsers.length} registros`
                : 'Selecione um setor'}
            </p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {!selectedSectorId && !loading && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
                Selecione um setor para listar usuarios.
              </div>
            )}
            {selectedSectorId &&
              paginatedUsers.map((item) => {
                const isSelected = item.id === selectedUserId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectUser(item.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-foreground/50 bg-card shadow-[0_12px_24px_rgba(16,44,50,0.12)]'
                        : 'border-border/80 bg-card/90 hover:border-foreground/30 hover:bg-card'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                );
              })}
            {selectedSectorId && !loading && paginatedUsers.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
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
            {selectedUser
              ? `${filteredItems.length} registros`
              : 'Selecione um usuario'}
          </p>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          {!selectedUserId && !loading && (
            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-8 text-center text-sm text-muted-foreground">
              Selecione um usuario para listar itens.
            </div>
          )}
          {selectedUserId && paginatedItems.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((item) => {
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
          {selectedUserId && !loading && paginatedItems.length === 0 && (
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
