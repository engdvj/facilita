'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { serverURL } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/format';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPager from '@/components/admin/pager';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Sector, UploadedSchedule } from '@/types';

const pageSize = 8;

const emptyFormData = {
  title: '',
  categoryId: '',
  sectorId: '',
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  isPublic: true,
};

export default function SchedulesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UploadedSchedule | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UploadedSchedule | null>(null);
  const [formData, setFormData] = useState({ ...emptyFormData });

  const loadData = async () => {
    if (!user?.companyId) return;
    const [schedulesRes, catsRes, sectorsRes] = await Promise.all([
      api.get(`/schedules?companyId=${user.companyId}`),
      api.get(`/categories?companyId=${user.companyId}`),
      api.get(`/sectors?companyId=${user.companyId}`),
    ]);
    setSchedules(schedulesRes.data);
    setCategories(catsRes.data);
    setSectors(sectorsRes.data);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;

      if (!user?.companyId) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      try {
        await loadData();
        if (!active) return;
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os documentos.');
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
  }, [hasHydrated, user?.companyId]);

  const filteredSchedules = useMemo(() => {
    if (!search.trim()) return schedules;
    const term = search.toLowerCase();
    return schedules.filter((schedule) =>
      `${schedule.title} ${schedule.fileName} ${schedule.category?.name ?? ''} ${
        schedule.sector?.name ?? ''
      }`
        .toLowerCase()
        .includes(term),
    );
  }, [schedules, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const paginatedSchedules = filteredSchedules.slice(
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
    setFormData({ ...emptyFormData });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (schedule: UploadedSchedule) => {
    setEditing(schedule);
    setFormData({
      title: schedule.title,
      categoryId: schedule.categoryId || '',
      sectorId: schedule.sectorId || '',
      fileUrl: schedule.fileUrl,
      fileName: schedule.fileName,
      fileSize: schedule.fileSize,
      isPublic: schedule.isPublic,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/uploads/document', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        fileUrl: response.data.url,
        fileName: response.data.originalName,
        fileSize: response.data.size,
      }));
    } catch (uploadError) {
      setFormError('Erro ao fazer upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.companyId) {
      setFormError('Usuario sem empresa associada.');
      return;
    }

    if (!formData.fileUrl) {
      setFormError('Envie um arquivo para continuar.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const dataToSend = {
        ...formData,
        companyId: user.companyId,
        categoryId: formData.categoryId || undefined,
        sectorId: formData.sectorId || undefined,
      };

      if (editing) {
        await api.patch(`/schedules/${editing.id}`, dataToSend);
      } else {
        await api.post('/schedules', dataToSend);
      }

      await loadData();
      setModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel salvar o documento.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao salvar documento.',
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
      await api.delete(`/schedules/${deleteTarget.id}`);
      await loadData();
      setDeleteTarget(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel remover o documento.';
      setFormError(
        typeof message === 'string' ? message : 'Erro ao remover documento.',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">
            Agendas e Documentos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os arquivos publicados no portal.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar documento"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] sm:w-auto"
            onClick={openCreate}
          >
            Novo documento
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
            {loading ? 'Carregando...' : `${filteredSchedules.length} registros`}
          </p>
        </div>
        <div className="grid auto-rows-fr gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedSchedules.map((schedule) => (
            <article
              key={schedule.id}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(schedule)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openEdit(schedule);
                }
              }}
              className="group flex h-full cursor-pointer flex-col rounded-xl border border-border/70 bg-card/90 p-4 text-left shadow-[0_10px_24px_rgba(16,44,50,0.08)] transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Documento
                  </p>
                  <p className="truncate text-base font-semibold text-foreground">
                    {schedule.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {schedule.fileName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-md border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {getFileExtension(schedule.fileName)}
                  </span>
                  <StatusBadge status={schedule.status} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Categoria
                  </span>
                  <span className="text-right text-foreground/80">
                    {schedule.category?.name || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Setor
                  </span>
                  <span className="text-right text-foreground/80">
                    {schedule.sector?.name || 'Todos'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Tamanho
                  </span>
                  <span className="text-right text-foreground/80">
                    {formatBytes(schedule.fileSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Visibilidade
                  </span>
                  <span className="text-right text-foreground/80">
                    {schedule.isPublic ? 'Publico' : 'Privado'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Criado
                  </span>
                  <span className="text-right text-foreground/80">
                    {formatDate(schedule.createdAt || undefined)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                <a
                  href={`${serverURL}${schedule.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground transition hover:border-foreground/60"
                  onClick={(event) => event.stopPropagation()}
                >
                  Baixar
                </a>
                <button
                  type="button"
                  className="rounded-md border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground transition hover:border-foreground/60"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(schedule);
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
                    setDeleteTarget(schedule);
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
          {!loading && paginatedSchedules.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum documento encontrado.
            </div>
          )}
        </div>
        <AdminPager page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar documento' : 'Novo documento'}
        description="Adicione arquivos para consulta no portal."
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
              disabled={formLoading || uploading || !formData.title.trim()}
            >
              {formLoading ? 'Salvando' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <AdminField label="Titulo" htmlFor="schedule-title">
            <input
              id="schedule-title"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={formData.title}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </AdminField>
          <AdminField
            label="Arquivo"
            htmlFor="schedule-file"
            hint="PDF, DOC, XLS, PPT ou TXT"
          >
            <input
              id="schedule-file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
            />
            {uploading && (
              <p className="mt-2 text-xs text-muted-foreground">
                Fazendo upload...
              </p>
            )}
            {formData.fileName && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {getFileExtension(formData.fileName)}
                </span>
                <span>{formData.fileName}</span>
                <span>({formatBytes(formData.fileSize)})</span>
              </div>
            )}
          </AdminField>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Categoria" htmlFor="schedule-category">
              <select
                id="schedule-category"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={formData.categoryId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Setor" htmlFor="schedule-sector">
              <select
                id="schedule-sector"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
                value={formData.sectorId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectorId: event.target.value,
                  }))
                }
              >
                <option value="">Todos os setores</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublic: event.target.checked,
                }))
              }
              className="rounded border-border/70"
            />
            <span>Publico (visivel sem login)</span>
          </label>
        </div>
        {formError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {formError}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Remover documento"
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
