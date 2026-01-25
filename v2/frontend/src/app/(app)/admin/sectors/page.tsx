'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import ImageSelector from '@/components/admin/image-selector';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type Sector = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  createdAt?: string | null;
  companyId?: string | null;
  company?: { name: string } | null;
  sectorUnits?: {
    unitId: string;
    isPrimary?: boolean | null;
    unit?: { id: string; name: string; companyId?: string | null } | null;
  }[] | null;
};

type CompanyOption = { id: string; name: string };

type UnitOption = { id: string; name: string; companyId?: string | null };

const pageSize = 8;

const getPrimarySectorUnit = (sector: Sector) =>
  sector.sectorUnits?.find((unit) => unit.isPrimary) || sector.sectorUnits?.[0];

const sectorMatchesUnit = (sector: Sector, selectedUnitId: string) =>
  Boolean(sector.sectorUnits?.some((unit) => unit.unitId === selectedUnitId));

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
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [primaryUnitId, setPrimaryUnitId] = useState('');
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
      const unitNames =
        sector.sectorUnits
          ?.map((unit) => unit.unit?.name)
          .filter((name): name is string => Boolean(name))
          .join(' ') || '';
      if (
        term &&
        !`${sector.name} ${unitNames} ${sector.company?.name ?? ''}`
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
      if (filterUnitId && !sectorMatchesUnit(sector, filterUnitId)) {
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

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnitIds((current) => {
      const isSelected = current.includes(unitId);
      if (isSelected) {
        const next = current.filter((id) => id !== unitId);
        setPrimaryUnitId((primary) => (primary === unitId ? (next[0] || '') : primary));
        return next;
      }
      const next = [...current, unitId];
      setPrimaryUnitId((primary) => primary || unitId);
      return next;
    });
  };

  const handlePrimaryUnitChange = (unitId: string) => {
    setPrimaryUnitId(unitId);
    setSelectedUnitIds((current) =>
      current.includes(unitId) ? current : [...current, unitId],
    );
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setCompanyId('');
    setSelectedUnitIds([]);
    setPrimaryUnitId('');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (sector: Sector) => {
    const primaryUnit = getPrimarySectorUnit(sector);
    setEditing(sector);
    setName(sector.name);
    setDescription(sector.description || '');
    setImageUrl(sector.imageUrl || '');
    setCompanyId(sector.companyId || '');
    const unitIds = sector.sectorUnits?.map((unit) => unit.unitId) || [];
    setSelectedUnitIds(unitIds);
    setPrimaryUnitId(primaryUnit?.unitId || unitIds[0] || '');
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
          imageUrl: imageUrl || undefined,
          companyId,
          units: selectedUnitIds.map((unit) => ({
            unitId: unit,
            isPrimary: unit === primaryUnitId,
          })),
          status,
        });
      } else {
        await api.post('/sectors', {
          name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          companyId,
          units: selectedUnitIds.map((unit) => ({
            unitId: unit,
            isPrimary: unit === primaryUnitId,
          })),
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

  const toggleSectorStatus = async (sector: Sector) => {
    const normalizedStatus = (sector.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(sector.id);
    setError(null);

    // Atualização otimista
    setSectors((prev) =>
      prev.map((s) =>
        s.id === sector.id ? { ...s, status: nextStatus as any } : s
      )
    );

    try {
      await api.patch(`/sectors/${sector.id}`, {
        status: nextStatus,
      });
      await loadSectors();
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setSectors((prev) =>
        prev.map((s) =>
          s.id === sector.id ? { ...s, status: normalizedStatus as any } : s
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status do setor.';
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
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedSectors.map((sector) => {
            const normalizedStatus = (sector.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            const primaryUnit = getPrimarySectorUnit(sector);
            return (
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
                className="group flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {sector.name}
                    </h3>
                    {(primaryUnit?.unit?.name || sector.company?.name) && (
                      <span className="text-[11px] text-muted-foreground">
                        {primaryUnit?.unit?.name || sector.company?.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Setor ${isActive ? 'ativo' : 'inativo'}`}
                    title={isActive ? 'Ativo' : 'Inativo'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSectorStatus(sector);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === sector.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === sector.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
        description="Setores organizam times dentro de uma ou mais unidades." 
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
                !companyId ||
                selectedUnitIds.length === 0 ||
                !primaryUnitId
              }
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
          <div className="md:col-span-3">
            <AdminField label="Imagem" htmlFor="sector-image" hint="Opcional">
              <div id="sector-image">
                <ImageSelector
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  companyId={companyId}
                  disabled={formLoading}
                />
              </div>
            </AdminField>
          </div>
          <div className="md:col-span-3">
            <AdminField label="Empresa" htmlFor="sector-company">
              <select
                id="sector-company"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setSelectedUnitIds([]);
                  setPrimaryUnitId('');
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
          <div className="md:col-span-3">
            <AdminField
              label="Unidades"
              htmlFor="sector-units"
              hint={
                !companyId
                  ? 'Selecione uma empresa primeiro.'
                  : 'Escolha uma ou mais unidades e marque a principal.'
              }
            >
              <div
                id="sector-units"
                className="space-y-2 rounded-lg border border-border/70 bg-card/60 p-3"
              >
                {!companyId && (
                  <p className="text-xs text-muted-foreground">
                    Selecione uma empresa para listar unidades.
                  </p>
                )}
                {companyId && filteredUnits.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma unidade encontrada para esta empresa.
                  </p>
                )}
                {companyId && filteredUnits.length > 0 && (
                  <div className="space-y-2">
                    {filteredUnits.map((unit) => {
                      const isSelected = selectedUnitIds.includes(unit.id);
                      const isPrimary = primaryUnitId === unit.id;
                      return (
                        <div
                          key={unit.id}
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
                            onChange={() => toggleUnitSelection(unit.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {unit.name}
                            </p>
                            {isSelected && (
                              <p className="text-[11px] text-muted-foreground">
                                {isPrimary ? 'Unidade principal' : 'Selecionada'}
                              </p>
                            )}
                          </div>
                          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            <input
                              type="radio"
                              name="sector-primary-unit"
                              className="h-4 w-4"
                              checked={isPrimary}
                              onChange={() => handlePrimaryUnitChange(unit.id)}
                              disabled={!isSelected}
                            />
                            Principal
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AdminField>
          </div>
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
