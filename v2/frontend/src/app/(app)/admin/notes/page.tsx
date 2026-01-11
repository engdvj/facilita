'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import FilterDropdown from '@/components/admin/filter-dropdown';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Company, ContentAudience, Note, Sector } from '@/types';

const pageSize = 8;

const emptyFormData = {
  title: '',
  content: '',
  categoryId: '',
  sectorId: '',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  audience: 'COMPANY' as ContentAudience,
};

export default function NotesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [notes, setNotes] = useState<Note[]>([]);
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
  const [editing, setEditing] = useState<Note | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ ...emptyFormData });
  const [companyId, setCompanyId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTab, setFormTab] = useState<'basic' | 'category' | 'visual'>('basic');
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

  const getAudience = (note: Note): ContentAudience => {
    if (note.isPublic) return 'PUBLIC';
    if (note.audience) return note.audience;
    if (note.sectorId) return 'SECTOR';
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

  const canViewNote = (note: Note) => {
    const audience = getAudience(note);
    if (audience === 'PUBLIC') return true;
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (audience === 'SUPERADMIN') return false;
    if (audience === 'ADMIN') return isAdmin;
    if (audience === 'PRIVATE') return note.userId === user.id;
    if (audience === 'SECTOR') {
      return isAdmin ? true : note.sectorId === user.sectorId;
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
    const notesPath = isAdmin || isSuperAdmin ? '/notes/admin/list' : '/notes';
    const notesQuery = resolvedCompanyId ? `?companyId=${resolvedCompanyId}` : '';
    const [notesRes, catsRes, sectorsRes] = await Promise.all([
      api.get(`${notesPath}${notesQuery}`),
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
    setNotes(notesRes.data);
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
            setError('Nao foi possivel carregar as notas.');
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

  const visibleNotes = useMemo(() => {
    const canView = (note: Note) => {
      const audience = getAudience(note);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (isSuperAdmin) return true;
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') return isAdmin;
      if (audience === 'PRIVATE') return note.userId === user.id;
      if (audience === 'SECTOR') {
        return isAdmin ? true : note.sectorId === user.sectorId;
      }
      if (audience === 'COMPANY') {
        return isAdmin;
      }
      return false;
    };

    return notes.filter(canView);
  }, [notes, user, isAdmin, isSuperAdmin]);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visibleNotes.filter((note) => {
      if (
        term &&
        !`${note.title} ${note.content} ${note.category?.name ?? ''} ${
          note.sector?.name ?? ''
        }`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      const normalizedStatus = (note.status || 'INACTIVE').toUpperCase();
      if (filterStatus !== 'ALL' && normalizedStatus !== filterStatus) {
        return false;
      }
      if (filterCategoryId && note.categoryId !== filterCategoryId) {
        return false;
      }
      if (filterSectorId && note.sectorId !== filterSectorId) {
        return false;
      }
      return true;
    });
  }, [
    filterCategoryId,
    filterSectorId,
    filterStatus,
    search,
    visibleNotes,
  ]);

  const activeFilters =
    Number(filterStatus !== 'ALL') +
    Number(Boolean(filterCategoryId)) +
    Number(Boolean(filterSectorId));

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / pageSize));
  const paginatedNotes = filteredNotes.slice(
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
    setFormCompanyId(isSuperAdmin ? companyId : user?.companyId || '');
    setFormError(null);
    setFormTab('basic');
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setFormData({
      title: note.title,
      content: note.content,
      categoryId: note.categoryId || '',
      sectorId: note.sectorId || '',
      imageUrl: note.imageUrl || '',
      imagePosition: note.imagePosition || '50% 50%',
      imageScale: note.imageScale || 1,
      audience: getAudience(note),
    });
    setFormCompanyId(note.companyId || '');
    setFormError(null);
    setFormTab('basic');
    setModalOpen(true);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setImageUploading(true);
      const response = await api.post('/uploads/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipNotify: true,
      });
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.data.url,
      }));
    } catch (uploadError) {
      setFormError('Erro ao fazer upload da imagem.');
    } finally {
      setImageUploading(false);
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
        setFormError('Selecione um setor para notas de setor.');
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
        title: formData.title,
        content: formData.content,
        ...(shouldSendAudience && normalizedAudience
          ? {
              audience: normalizedAudience,
              isPublic: normalizedAudience === 'PUBLIC',
            }
          : {}),
      };

      if (editing) {
        await api.patch(`/notes/${editing.id}`, dataToSend);
      } else {
        await api.post('/notes', dataToSend);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar a nota.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar nota.',
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
      await api.delete(`/notes/${deleteTarget.id}`);
      await loadData();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover a nota.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover nota.',
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

  const updateAudience = (value: ContentAudience) => {
    setFormData((prev) => ({
      ...prev,
      audience: value,
      sectorId: value === 'SECTOR' ? prev.sectorId : '',
    }));
  };

  const previewTitle = formData.title.trim() || 'Nome da nota';
  const previewImageUrl = formData.imageUrl
    ? formData.imageUrl.startsWith('http')
      ? formData.imageUrl
      : `${serverURL}${formData.imageUrl}`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">Notas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie notas pessoais e compartilhadas no portal.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:w-auto xl:max-w-[720px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar nota"
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
                  <option value="ACTIVE">Ativas</option>
                  <option value="INACTIVE">Inativas</option>
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
            Nova nota
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
            {loading ? 'Carregando...' : `${filteredNotes.length} registros`}
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedNotes.map((note) => {
            const canEdit =
              user?.role === 'ADMIN' ||
              user?.role === 'SUPERADMIN' ||
              note.userId === user?.id;
            return (
              <article
                key={note.id}
                role={canEdit ? 'button' : undefined}
                tabIndex={canEdit ? 0 : undefined}
                onClick={canEdit ? () => openEdit(note) : undefined}
                onKeyDown={
                  canEdit
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openEdit(note);
                        }
                      }
                    : undefined
                }
                className={`group flex flex-col rounded-xl border border-border/70 bg-card/90 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                  canEdit ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {note.imageUrl && (
                  <div className="overflow-hidden rounded-t-xl">
                    <div className="relative h-20 w-full overflow-hidden bg-secondary/60">
                      <img
                        src={`${serverURL}${note.imageUrl}`}
                        alt={note.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{
                          objectPosition: note.imagePosition || '50% 50%',
                          transform: `scale(${note.imageScale || 1})`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                      {note.title}
                    </h3>
                    <StatusBadge status={note.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  {note.category?.name && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {note.category.name}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
          {!loading && paginatedNotes.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma nota encontrada.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar nota' : 'Nova nota'}
        description="Crie notas pessoais ou compartilhadas."
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
                imageUploading ||
                !formData.title.trim() ||
                !formData.content.trim()
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
                <AdminField label="Empresa" htmlFor="note-company">
                  <select
                    id="note-company"
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
              <AdminField label="Titulo" htmlFor="note-title">
                <input
                  id="note-title"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </AdminField>
              <AdminField label="Conteudo" htmlFor="note-content">
                <textarea
                  id="note-content"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  rows={5}
                  value={formData.content}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, content: event.target.value }))
                  }
                />
              </AdminField>
              <AdminField label="Visibilidade" htmlFor="note-audience">
                {!isSuperAdmin &&
                !audienceOptions.some((option) => option.value === formData.audience) ? (
                  <div className="rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground">
                    {getAudienceLabel(formData.audience)} (somente superadmin)
                  </div>
                ) : (
                  <select
                    id="note-audience"
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
            </div>
          </div>
        )}

        {/* Aba Categorização */}
        {formTab === 'category' && (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Categoria" htmlFor="note-category">
                <select
                  id="note-category"
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
              <AdminField label="Setor" htmlFor="note-sector">
                <select
                  id="note-sector"
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
                    (isSuperAdmin && !formCompanyId) ||
                    isCollaborator
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
            </div>
          </div>
        )}

        {/* Aba Visual */}
        {formTab === 'visual' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
              <div className="space-y-5">
                <AdminField label="Imagem" htmlFor="note-image" hint="Opcional">
                  <input
                    id="note-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                  />
                  {imageUploading && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Fazendo upload...
                    </p>
                  )}
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
                              {formData.imagePosition.split(' ')[0]}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(formData.imagePosition.split(' ')[0])}
                            onChange={(event) => {
                              const y = formData.imagePosition.split(' ')[1];
                              setFormData((prev) => ({
                                ...prev,
                                imagePosition: `${event.target.value}% ${y}`,
                              }));
                            }}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Posicao Vertical</span>
                            <span className="text-foreground">
                              {formData.imagePosition.split(' ')[1]}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(formData.imagePosition.split(' ')[1])}
                            onChange={(event) => {
                              const x = formData.imagePosition.split(' ')[0];
                              setFormData((prev) => ({
                                ...prev,
                                imagePosition: `${x} ${event.target.value}%`,
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
                            onChange={(event) => {
                              setFormData((prev) => ({
                                ...prev,
                                imageScale: parseFloat(event.target.value),
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
                            objectPosition: formData.imagePosition,
                            transform: `scale(${formData.imageScale})`,
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

        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>
      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover nota"
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
