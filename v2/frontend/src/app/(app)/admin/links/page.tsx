'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import ImageSelector from '@/components/admin/image-selector';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Company, ContentAudience, Link, Sector } from '@/types';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

const pageSize = 8;

const emptyFormData = {
  title: '',
  url: '',
  description: '',
  categoryId: '',
  sectorId: '',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  audience: 'COMPANY' as ContentAudience,
  order: 0,
};

export default function LinksPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<Link[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterSectorId, setFilterSectorId] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Link | null>(null);
  const [formData, setFormData] = useState({ ...emptyFormData });
  const [companyId, setCompanyId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTab, setFormTab] = useState<'basic' | 'category' | 'visual'>('basic');
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isCollaborator = user?.role === 'COLLABORATOR';
  const resolvedCompanyId =
    isSuperAdmin ? companyId || undefined : user?.companyId;
  const formResolvedCompanyId = isSuperAdmin
    ? formCompanyId || ''
    : (user?.companyId || '');
  useNotifyOnChange(error);
  useNotifyOnChange(formError);
  const visibleSectors = useMemo(() => {
    let scopedSectors = sectors;
    if (resolvedCompanyId) {
      scopedSectors = scopedSectors.filter(
        (sector) => sector.companyId === resolvedCompanyId,
      );
    }
    if (!user || isAdmin || isSuperAdmin) {
      return scopedSectors;
    }
    return scopedSectors.filter((sector) => sector.id === user.sectorId);
  }, [isAdmin, isSuperAdmin, resolvedCompanyId, sectors, user]);

  const formCategories = useMemo(() => {
    if (isSuperAdmin && !formCompanyId) {
      return [];
    }
    if (!formResolvedCompanyId) {
      return categories;
    }
    return categories.filter(
      (category) => category.companyId === formResolvedCompanyId,
    );
  }, [categories, formCompanyId, formResolvedCompanyId, isSuperAdmin]);

  const formSectors = useMemo(() => {
    if (isCollaborator) {
      return visibleSectors;
    }
    if (isSuperAdmin && !formCompanyId) {
      return [];
    }
    if (!formResolvedCompanyId) {
      return visibleSectors;
    }
    return visibleSectors.filter(
      (sector) => sector.companyId === formResolvedCompanyId,
    );
  }, [
    formCompanyId,
    formResolvedCompanyId,
    isCollaborator,
    isSuperAdmin,
    visibleSectors,
  ]);

  const getAudience = (link: Link): ContentAudience => {
    if (link.isPublic) return 'PUBLIC';
    if (link.audience) return link.audience;
    if (link.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const getAudienceLabel = (audience: ContentAudience) => {
    if (audience === 'PUBLIC') return 'Publico';
    if (audience === 'COMPANY') return 'Empresa';
    if (audience === 'SECTOR') return 'Setor';
    if (audience === 'PRIVATE') return 'Privado';
    if (audience === 'ADMIN') return 'Admins';
    return 'Superadmins';
  };

  const normalizeImagePosition = (position?: string) => {
    if (!position) return '50% 50%';
    const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
    const withPercent = (value: string) =>
      value.includes('%') ? value : `${value}%`;
    return `${withPercent(x)} ${withPercent(y)}`;
  };

  const canViewLink = (link: Link) => {
    const audience = getAudience(link);
    if (audience === 'PUBLIC') return true;
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (audience === 'SUPERADMIN') return false;
    if (audience === 'ADMIN') return isAdmin;
    if (audience === 'PRIVATE') return link.userId === user.id;
    if (audience === 'SECTOR') {
      return isAdmin ? true : link.sectorId === user.sectorId;
    }
    if (audience === 'COMPANY') {
      return isAdmin;
    }
    return false;
  };

  const audienceOptions = useMemo(() => {
    if (isCollaborator) {
      return [{ value: 'PRIVATE', label: 'Privado (apenas voce)' }];
    }
    if (isAdmin) {
      return [
        { value: 'COMPANY', label: 'Empresa' },
        { value: 'SECTOR', label: 'Setor' },
      ];
    }
    return [
      { value: 'PUBLIC', label: 'Publico' },
      { value: 'COMPANY', label: 'Empresa' },
      { value: 'SECTOR', label: 'Setor' },
      { value: 'ADMIN', label: 'Somente admins' },
      { value: 'SUPERADMIN', label: 'Somente superadmins' },
      { value: 'PRIVATE', label: 'Privado (apenas voce)' },
    ];
  }, [isAdmin, isCollaborator]);

  const loadData = async () => {
    if (!resolvedCompanyId && !isSuperAdmin) return;
    const linksPath = isAdmin || isSuperAdmin ? '/links/admin/list' : '/links';
    const linksQuery = resolvedCompanyId ? `?companyId=${resolvedCompanyId}` : '';
    const [linksRes, catsRes, sectorsRes] = await Promise.all([
      api.get(`${linksPath}${linksQuery}`),
      resolvedCompanyId
        ? api.get(`/categories?companyId=${resolvedCompanyId}`)
        : isSuperAdmin
          ? api.get('/categories')
          : Promise.resolve({ data: [] }),
      !isCollaborator
        ? resolvedCompanyId
          ? api.get(`/sectors?companyId=${resolvedCompanyId}`)
          : isSuperAdmin
            ? api.get('/sectors')
            : Promise.resolve({ data: [] })
        : Promise.resolve({ data: [] }),
    ]);
    setLinks(linksRes.data);
    setCategories(catsRes.data);
    setSectors(sectorsRes.data);
  };

  const loadCompanies = async () => {
    if (!isSuperAdmin) return;
    const response = await api.get('/companies');
    setCompanies(response.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;

      if (!user?.companyId && !isSuperAdmin) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      try {
        if (isSuperAdmin) {
          await loadCompanies();
        }
        await loadData();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os links.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [companyId, hasHydrated, isSuperAdmin, user?.companyId]);

  const visibleLinks = useMemo(() => {
    const scoped = links.filter((link) => canViewLink(link));
    if (isCollaborator && user) {
      return scoped.filter((link) => link.userId === user.id);
    }
    return scoped;
  }, [canViewLink, isCollaborator, links, user]);

  const filteredLinks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visibleLinks.filter((link) => {
      if (
        term &&
        !`${link.title} ${link.url} ${link.category?.name ?? ''} ${link.sector?.name ?? ''}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (link.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterCategoryId && link.categoryId !== filterCategoryId) {
        return false;
      }
      if (filterSectorId && link.sectorId !== filterSectorId) {
        return false;
      }
      return true;
    });
  }, [
    filterCategoryId,
    filterSectorId,
    filterStatus,
    search,
    visibleLinks,
  ]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(Boolean(filterCategoryId)) +
    Number(Boolean(filterSectorId));

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / pageSize));
  const paginatedLinks = filteredLinks.slice(
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
    setFormData({
      ...emptyFormData,
      audience: isCollaborator ? 'PRIVATE' : 'COMPANY',
      sectorId: '',
    });
    setFormCompanyId(
      isSuperAdmin ? companyId : user?.companyId || '',
    );
    setFormError(null);
    setFormTab('basic');
    setModalOpen(true);
  };

  const openEdit = (link: Link) => {
    setEditing(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      categoryId: link.categoryId || '',
      sectorId: link.sectorId || '',
      imageUrl: link.imageUrl || '',
      imagePosition: normalizeImagePosition(link.imagePosition),
      imageScale: link.imageScale || 1,
      audience: getAudience(link),
      order: link.order,
    });
    setFormCompanyId(link.companyId || '');
    setFormError(null);
    setFormTab('basic');
    setModalOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/uploads/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipNotify: true,
      });
      setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
    } catch (uploadError) {
      setFormError('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formResolvedCompanyId) {
      setFormError('Selecione uma empresa.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const allowedAudiences = new Set(
        audienceOptions.map((option) => option.value as ContentAudience),
      );
      const shouldSendAudience = allowedAudiences.has(formData.audience);
      const normalizedAudience = shouldSendAudience
        ? isCollaborator
          ? 'PRIVATE'
          : isAdmin
            ? formData.audience === 'SECTOR'
              ? 'SECTOR'
              : 'COMPANY'
            : formData.audience
        : undefined;

      if (normalizedAudience === 'SECTOR' && !formData.sectorId) {
        setFormError('Selecione um setor para links de setor.');
        setFormLoading(false);
        return;
      }

      const dataToSend = {
        companyId: formResolvedCompanyId,
        categoryId: formData.categoryId || undefined,
        sectorId:
          normalizedAudience === 'SECTOR'
            ? formData.sectorId || undefined
            : undefined,
        imageUrl: formData.imageUrl || undefined,
        imagePosition: formData.imageUrl ? formData.imagePosition : undefined,
        imageScale: formData.imageUrl ? formData.imageScale : undefined,
        ...(shouldSendAudience && normalizedAudience
          ? {
              audience: normalizedAudience,
              isPublic: normalizedAudience === 'PUBLIC',
            }
          : {}),
        title: formData.title,
        url: formData.url,
        description: formData.description,
        order: formData.order,
      };

      console.log('[LinksPage] Dados sendo enviados:', {
        formCompanyId,
        formResolvedCompanyId,
        userCompanyId: user?.companyId,
        isSuperAdmin,
        dataToSend,
      });

      if (editing) {
        await api.patch(`/links/${editing.id}`, dataToSend);
      } else {
        await api.post('/links', dataToSend);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar o link.';
      setFormError(typeof message === 'string' ? message : 'Erro ao salvar link.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleLinkStatus = async (link: Link) => {
    const normalizedStatus = (link.status || 'INACTIVE').toUpperCase();
    const nextStatus = normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setStatusUpdatingId(link.id);
    setError(null);

    // Atualização otimista
    setLinks((prev) =>
      prev.map((l) =>
        l.id === link.id ? { ...l, status: nextStatus as any } : l
      )
    );

    try {
      await api.patch(`/links/${link.id}`, {
        status: nextStatus,
      });
    } catch (err: any) {
      // Reverte a mudança otimista em caso de erro
      setLinks((prev) =>
        prev.map((l) =>
          l.id === link.id ? { ...l, status: normalizedStatus as any } : l
        )
      );
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel atualizar o status do link.';
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
      await api.delete(`/links/${deleteTarget.id}`);
      await loadData();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover o link.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover link.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterCategoryId('');
    setFilterSectorId('');
    setPage(1);
  };

  const updateOrder = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      order: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const updateAudience = (value: ContentAudience) => {
    setFormData((prev) => ({
      ...prev,
      audience: value,
      sectorId: value === 'SECTOR' ? prev.sectorId : '',
    }));
  };

  const previewTitle = formData.title.trim() || 'Nome do link';
  const previewImageUrl = formData.imageUrl
    ? formData.imageUrl.startsWith('http')
      ? formData.imageUrl
      : `${serverURL}${formData.imageUrl}`
    : '';
  const previewImagePosition = normalizeImagePosition(formData.imagePosition);
  const [previewPosX, previewPosY] = previewImagePosition.split(' ');
  const shouldShowSectorField = formData.audience === 'SECTOR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Links</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os links que aparecem no portal.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:w-auto xl:max-w-[720px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar link"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          {isSuperAdmin && (
            <select
              value={companyId}
              onChange={(event) => {
                setCompanyId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
            >
              <option value="">Todas as empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          )}
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
                  Categoria
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterCategoryId}
                  onChange={(event) => {
                    setFilterCategoryId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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
                  {visibleSectors.map((sector) => (
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
            Novo link
          </button>
        </div>
      </div>

      <div className="surface animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Lista
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredLinks.length} registros`}
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedLinks.map((link) => {
            const canEdit =
              user?.role === 'ADMIN' ||
              user?.role === 'SUPERADMIN' ||
              link.userId === user?.id;
            const normalizedStatus = (link.status || 'INACTIVE').toUpperCase();
            const isActive = normalizedStatus === 'ACTIVE';
            return (
              <article
              key={link.id}
              role={canEdit ? 'button' : undefined}
              tabIndex={canEdit ? 0 : undefined}
              onClick={canEdit ? () => openEdit(link) : undefined}
              onKeyDown={
                canEdit
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openEdit(link);
                      }
                    }
                  : undefined
              }
              className={`group flex flex-col rounded-xl border border-border/70 bg-card/90 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                canEdit ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {link.imageUrl && (
                <div className="overflow-hidden rounded-t-xl">
                  <div className="relative h-20 w-full overflow-hidden bg-secondary/60">
                    <img
                      src={`${serverURL}${link.imageUrl}`}
                      alt={link.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{
                        objectPosition: normalizeImagePosition(link.imagePosition),
                        transform: `scale(${link.imageScale || 1})`,
                        transformOrigin: normalizeImagePosition(link.imagePosition),
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="min-w-0 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                      {link.title}
                    </h3>
                    {link.category?.name && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {link.category.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Link ${isActive ? 'ativo' : 'inativo'}`}
                    title={isActive ? 'Ativo' : 'Inativo'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleLinkStatus(link);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    disabled={statusUpdatingId === link.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                      isActive
                        ? 'border-emerald-500/70 bg-emerald-500/80'
                        : 'border-border/70 bg-muted/60'
                    } ${statusUpdatingId === link.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </article>
            );
          })}
          {!loading && paginatedLinks.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum link encontrado.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar link' : 'Novo link'}
        description="Atualize os principais dados do link."
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
                uploading ||
                !formData.title.trim() ||
                !formData.url.trim()
              }
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        {/* Navegação de abas */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card/60 p-2">
          <button
            type="button"
            onClick={() => setFormTab('basic')}
            className={`flex-1 min-w-[140px] rounded-xl px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors ${
              formTab === 'basic'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            Básico
          </button>
          <button
            type="button"
            onClick={() => setFormTab('category')}
            className={`flex-1 min-w-[140px] rounded-xl px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors ${
              formTab === 'category'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            Categorização
          </button>
          <button
            type="button"
            onClick={() => setFormTab('visual')}
            className={`flex-1 min-w-[140px] rounded-xl px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors ${
              formTab === 'visual'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            Visual
          </button>
        </div>

        {/* Aba Básico */}
        {formTab === 'basic' && (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
            <div className="space-y-5">
              {isSuperAdmin && (
                <AdminField label="Empresa" htmlFor="link-company">
                  <select
                    id="link-company"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={formCompanyId}
                    onChange={(event) => {
                      const nextCompanyId = event.target.value;
                      setFormCompanyId(nextCompanyId);
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: '',
                        sectorId: '',
                      }));
                    }}
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Titulo" htmlFor="link-title">
                  <input
                    id="link-title"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </AdminField>
                <AdminField label="URL" htmlFor="link-url">
                  <input
                    id="link-url"
                    type="url"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={formData.url}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, url: event.target.value }))
                    }
                    placeholder="https://exemplo.com"
                  />
                </AdminField>
              </div>
              <AdminField label="Descricao" htmlFor="link-description" hint="Opcional">
                <textarea
                  id="link-description"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  rows={4}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </AdminField>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                <AdminField label="Visibilidade" htmlFor="link-audience">
                  {!isSuperAdmin &&
                  !audienceOptions.some((option) => option.value === formData.audience) ? (
                    <div className="rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground">
                      {getAudienceLabel(formData.audience)} (somente superadmin)
                    </div>
                  ) : (
                    <select
                      id="link-audience"
                      className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                      value={formData.audience}
                      onChange={(event) =>
                        updateAudience(event.target.value as ContentAudience)
                      }
                      disabled={isCollaborator}
                    >
                      {audienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </AdminField>
                <AdminField label="Ordem" htmlFor="link-order">
                  <input
                    id="link-order"
                    type="number"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={formData.order}
                    onChange={(event) => updateOrder(event.target.value)}
                  />
                </AdminField>
              </div>
            </div>
          </div>
        )}

        {/* Aba Categorização */}
        {formTab === 'category' && (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
            <div
              className={`grid gap-4 ${
                shouldShowSectorField ? 'md:grid-cols-2' : 'md:grid-cols-1'
              }`}
            >
              <AdminField label="Categoria" htmlFor="link-category">
                <select
                  id="link-category"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                  disabled={isSuperAdmin && !formCompanyId}
                >
                  <option value="">Sem categoria</option>
                  {formCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </AdminField>
              {shouldShowSectorField && (
                <AdminField label="Setor" htmlFor="link-sector">
                  <select
                    id="link-sector"
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                    value={formData.sectorId}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        sectorId: event.target.value,
                      }))
                    }
                    disabled={isSuperAdmin && !formCompanyId}
                  >
                    <option value="">Todos os setores</option>
                    {formSectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
              )}
            </div>
          </div>
        )}

        {/* Aba Visual */}
        {formTab === 'visual' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
              <div className="space-y-5">
                <AdminField label="Imagem" htmlFor="link-image" hint="Opcional">
                  <ImageSelector
                    value={formData.imageUrl || ''}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, imageUrl: url }))
                    }
                    companyId={formResolvedCompanyId}
                    disabled={uploading}
                  />
                  {formData.imageUrl && (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 p-4">
                        <p className="text-xs font-medium text-foreground">
                          Ajustar enquadramento
                        </p>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Posicao Horizontal</span>
                            <span className="text-foreground">
                              {previewPosX}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(previewPosX)}
                            onChange={(e) => {
                              const y = previewPosY;
                              setFormData((prev) => ({
                                ...prev,
                                imagePosition: `${e.target.value}% ${y}`,
                              }));
                            }}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Posicao Vertical</span>
                            <span className="text-foreground">
                              {previewPosY}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(previewPosY)}
                            onChange={(e) => {
                              const x = previewPosX;
                              setFormData((prev) => ({
                                ...prev,
                                imagePosition: `${x} ${e.target.value}%`,
                              }));
                            }}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Zoom</span>
                            <span className="text-foreground">
                              {formData.imageScale.toFixed(1)}x
                            </span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={formData.imageScale}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                imageScale: parseFloat(e.target.value),
                              }));
                            }}
                            className="w-full"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              imagePosition: '50% 50%',
                              imageScale: 1,
                            }));
                          }}
                          className="mt-2 w-full rounded-md border border-border/70 px-3 py-1.5 text-xs text-foreground transition hover:border-foreground/60"
                        >
                          Resetar enquadramento
                        </button>
                      </div>
                    </div>
                  )}
                </AdminField>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Previa do card
              </p>
              <div className="flex justify-center">
                <div className="w-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card/95 ring-1 ring-black/5 shadow-[0_18px_36px_rgba(16,44,50,0.14)]">
                    <div className="relative h-52 w-full overflow-hidden bg-secondary/60">
                      {previewImageUrl ? (
                        <img
                          src={previewImageUrl}
                          alt="Preview do card"
                          className="h-full w-full object-cover"
                          style={{
                            objectPosition: previewImagePosition,
                            transform: `scale(${formData.imageScale})`,
                            transformOrigin: previewImagePosition,
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40" />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/30 via-black/12 to-transparent" />
                      <div
                        className="absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] truncate rounded-[12px] border border-black/5 bg-white/95 px-2 py-1.5 text-[13px] font-semibold text-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                        title={previewTitle}
                      >
                        {previewTitle}
                      </div>
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover link"
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
          <span className="text-foreground">{deleteTarget?.title}</span>.
        </p>
      </AdminModal>
    </div>
  );
}
