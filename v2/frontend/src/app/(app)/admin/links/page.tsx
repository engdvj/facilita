'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Company, ContentAudience, Link, Sector } from '@/types';

const pageSize = 8;
const audienceFilterOptions: ContentAudience[] = [
  'PUBLIC',
  'COMPANY',
  'SECTOR',
  'ADMIN',
  'SUPERADMIN',
  'PRIVATE',
];

const emptyFormData = {
  title: '',
  url: '',
  description: '',
  categoryId: '',
  sectorId: '',
  color: '',
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
  const [filterAudience, setFilterAudience] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Link | null>(null);
  const [formData, setFormData] = useState({ ...emptyFormData });
  const [companyId, setCompanyId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isCollaborator = user?.role === 'COLLABORATOR';
  const resolvedCompanyId =
    isSuperAdmin ? companyId || undefined : user?.companyId;
  const formResolvedCompanyId = isSuperAdmin ? formCompanyId : user?.companyId;
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

  const isLight = (hex?: string) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
  };

  const toRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const value =
      normalized.length === 3
        ? normalized
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : normalized;
    if (value.length !== 6) return undefined;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return undefined;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
      if (
        filterAudience !== 'ALL' &&
        getAudience(link) !== filterAudience
      ) {
        return false;
      }
      return true;
    });
  }, [
    filterAudience,
    filterCategoryId,
    filterSectorId,
    filterStatus,
    getAudience,
    search,
    visibleLinks,
  ]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(Boolean(filterCategoryId)) +
    Number(Boolean(filterSectorId)) +
    Number(filterAudience !== 'ALL');

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
      color: link.color || '',
      imageUrl: link.imageUrl || '',
      imagePosition: link.imagePosition || '50% 50%',
      imageScale: link.imageScale || 1,
      audience: getAudience(link),
      order: link.order,
    });
    setFormCompanyId(link.companyId || '');
    setFormError(null);
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
        color: formData.color || undefined,
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
    setFilterAudience('ALL');
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

  const previewCategory = formData.categoryId
    ? formCategories.find((category) => category.id === formData.categoryId) ||
      categories.find((category) => category.id === formData.categoryId)
    : undefined;
  const previewTitle = formData.title.trim() || 'Nome do link';
  const previewDescription = formData.description.trim();
  const previewAccentColor = formData.color || previewCategory?.color || '';
  const previewCategoryStyle = previewCategory?.color
    ? {
        backgroundColor: previewCategory.color,
        borderColor: previewCategory.color,
        color: isLight(previewCategory.color)
          ? 'var(--foreground)'
          : 'var(--primary-foreground)',
      }
    : undefined;
  const accentSoft = previewAccentColor
    ? toRgba(previewAccentColor, 0.08)
    : undefined;
  const accentStrong = previewAccentColor
    ? toRgba(previewAccentColor, 0.22)
    : undefined;
  const previewPanelStyle =
    accentSoft && accentStrong
      ? {
          backgroundImage: `linear-gradient(180deg, ${accentSoft} 0%, ${accentStrong} 100%)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }
      : {
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        };
  const previewImageUrl = formData.imageUrl
    ? formData.imageUrl.startsWith('http')
      ? formData.imageUrl
      : `${serverURL}${formData.imageUrl}`
    : '';

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
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Visibilidade
                </label>
                <select
                  className="w-full rounded-md border border-border/70 bg-white/80 px-3 py-2 text-xs text-foreground"
                  value={filterAudience}
                  onChange={(event) => {
                    setFilterAudience(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Todas</option>
                  {audienceFilterOptions.map((audience) => (
                    <option key={audience} value={audience}>
                      {getAudienceLabel(audience)}
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
            {loading ? 'Carregando...' : `${filteredLinks.length} registros`}
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedLinks.map((link) => {
            const canEdit =
              user?.role === 'ADMIN' ||
              user?.role === 'SUPERADMIN' ||
              link.userId === user?.id;
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
                        objectPosition: link.imagePosition || '50% 50%',
                        transform: `scale(${link.imageScale || 1})`,
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {link.title}
                  </h3>
                  <StatusBadge status={link.status} />
                </div>
                {link.category?.name && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {link.category.name}
                  </span>
                )}
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
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
              rows={3}
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </AdminField>
          <div className="grid gap-4 md:grid-cols-3">
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
                disabled={
                  formData.audience !== 'SECTOR' ||
                  (isSuperAdmin && !formCompanyId)
                }
              >
                <option value="">Todos os setores</option>
                {formSectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Cor" htmlFor="link-color" hint="Opcional">
              <input
                id="link-color"
                type="color"
                className="h-11 w-full rounded-lg border border-border/70 bg-white/80"
                value={formData.color || '#3b82f6'}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, color: event.target.value }))
                }
              />
            </AdminField>
          </div>
          <AdminField label="Imagem" htmlFor="link-image" hint="Opcional">
            <input
              id="link-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
            />
            {uploading && (
              <p className="mt-2 text-xs text-muted-foreground">
                Fazendo upload...
              </p>
            )}
            {formData.imageUrl && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2 rounded-lg border border-border/70 bg-card/50 p-3">
                  <p className="text-xs font-medium text-foreground">
                    Ajustar enquadramento
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Posição Horizontal</span>
                      <span className="text-foreground">{formData.imagePosition.split(' ')[0]}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(formData.imagePosition.split(' ')[0])}
                      onChange={(e) => {
                        const y = formData.imagePosition.split(' ')[1];
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
                      <span>Posição Vertical</span>
                      <span className="text-foreground">{formData.imagePosition.split(' ')[1]}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(formData.imagePosition.split(' ')[1])}
                      onChange={(e) => {
                        const x = formData.imagePosition.split(' ')[0];
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
                      <span className="text-foreground">{formData.imageScale.toFixed(1)}x</span>
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
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
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
                className="w-full rounded-lg border border-border/70 bg-white/80 px-2 py-2 text-sm text-foreground"
                value={formData.order}
                onChange={(event) => updateOrder(event.target.value)}
              />
            </AdminField>
          </div>
          </div>

          <div className="space-y-4 motion-fade-up">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Previa do card
              </p>
              <div className="mt-3 flex justify-center">
                <div className="w-full max-w-[360px]">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card/95 ring-1 ring-black/5 shadow-[0_18px_36px_rgba(16,44,50,0.14)]">
                    <div className="relative h-52 w-full overflow-hidden bg-secondary/60">
                      {previewImageUrl ? (
                        <img
                          src={previewImageUrl}
                          alt="Preview do card"
                          className="h-full w-full object-cover"
                          style={{
                            objectPosition: formData.imagePosition,
                            transform: `scale(${formData.imageScale})`,
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40" />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
                    </div>
                    <div
                      className="flex flex-1 flex-col gap-2 px-4 py-3 bg-card/80"
                      style={previewPanelStyle}
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {previewTitle}
                        </h3>
                        {previewDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {previewDescription}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {previewCategory?.name && (
                          <span
                            className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                            style={previewCategoryStyle}
                          >
                            {previewCategory.name}
                          </span>
                        )}
                        {formData.audience !== 'PUBLIC' && (
                          <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                            Restrito
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
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
        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
