'use client';

import { useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import ContentPreviewCard from '@/components/admin/content-preview-card';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import ContentCoverImage from '@/components/content-cover-image';
import useAdminContentCatalog from '@/hooks/use-admin-content-catalog';
import { formatBytes } from '@/lib/format';
import api from '@/lib/api';
import { normalizeImagePosition, parseImagePosition } from '@/lib/image';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { ContentVisibility, UploadedSchedule } from '@/types';

const emptyForm = {
  title: '',
  categoryId: '',
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  visibility: 'PRIVATE' as ContentVisibility,
  publicToken: '',
};

type FormTab = 'BASIC' | 'CATEGORY' | 'VISUAL';
type ScheduleFormErrors = {
  title?: string;
  fileUrl?: string;
};

export default function SchedulesPage() {
  const user = useAuthStore((state) => state.user);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UploadedSchedule | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formTab, setFormTab] = useState<FormTab>('BASIC');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<ScheduleFormErrors>({});
  const [confirmTarget, setConfirmTarget] = useState<UploadedSchedule | null>(null);
  const [removing, setRemoving] = useState(false);

  const isSuperadmin = user?.role === 'SUPERADMIN';
  const userId = user?.id;

  const {
    items,
    categories,
    loading,
    error,
    load,
    toggleStatus,
    removeItem,
  } = useAdminContentCatalog<UploadedSchedule>({
    adminListPath: '/schedules/admin/list',
    resourcePath: '/schedules',
    errorMessage: 'Não foi possível carregar documentos.',
    isSuperadmin,
    userId,
  });

  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return items
      .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!term) return true;
        return `${item.title} ${item.fileName}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, globalSearch, statusFilter]);

  const imagePosition = useMemo(() => parseImagePosition(form.imagePosition), [form.imagePosition]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, visibility: 'PRIVATE' });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const openEdit = (item: UploadedSchedule) => {
    setEditing(item);
    setForm({
      title: item.title,
      categoryId: item.categoryId || '',
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      imageUrl: item.imageUrl || '',
      imagePosition: normalizeImagePosition(item.imagePosition),
      imageScale: item.imageScale || 1,
      visibility: item.visibility,
      publicToken: item.publicToken || '',
    });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const uploadDocument = async (file: File) => {
    const body = new FormData();
    body.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/uploads/document', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipNotify: true,
      });

      setForm((prev) => ({
        ...prev,
        fileUrl: response.data.url,
        fileName: response.data.originalName,
        fileSize: response.data.size,
      }));
      setFormErrors((prev) => ({ ...prev, fileUrl: undefined }));
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const nextErrors: ScheduleFormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Título é obrigatório.';
    }

    if (!form.fileUrl) {
      nextErrors.fileUrl = 'Arquivo é obrigatório.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        categoryId: form.categoryId || undefined,
        fileUrl: form.fileUrl,
        fileName: form.fileName,
        fileSize: form.fileSize,
        imageUrl: form.imageUrl || undefined,
        imagePosition: form.imageUrl ? form.imagePosition : undefined,
        imageScale: form.imageUrl ? form.imageScale : undefined,
        visibility: isSuperadmin ? form.visibility : 'PRIVATE',
        publicToken:
          isSuperadmin && form.visibility === 'PUBLIC'
            ? form.publicToken || undefined
            : undefined,
      };

      if (editing) {
        await api.patch(`/schedules/${editing.id}`, payload);
      } else {
        await api.post('/schedules', payload);
      }

      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmTarget) return;

    setRemoving(true);
    try {
      await removeItem(confirmTarget.id);

      if (editing?.id === confirmTarget.id) {
        setModalOpen(false);
        setEditing(null);
      }
    } catch {
      // O interceptor global já notifica o erro.
    } finally {
      setRemoving(false);
      setConfirmTarget(null);
    }
  };

  return (
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <h1 className="fac-subtitle">Documentos</h1>
          <p className="text-[15px] text-muted-foreground">Gerencie os arquivos publicados no portal.</p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-[190px_auto_auto]">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
            }
            className="fac-select"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>

          <button type="button" className="fac-filter-button" disabled title="Em breve">
            Filtros
          </button>

          <button type="button" className="fac-button-primary" onClick={openCreate}>
            Novo documento
          </button>
        </div>
      </section>

      <section className="fac-panel">
        <div className="fac-panel-head">
          <p className="fac-panel-title">Lista</p>
          <p className="fac-panel-meta">{filtered.length} registros</p>
        </div>

        <div className="fac-panel-body">
          {loading ? (
            <div className="fac-loading-state">Carregando documentos...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhum documento encontrado.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((item) => (
                <article key={item.id} className={`fac-card w-[220px] max-w-full ${item.status === 'INACTIVE' ? 'opacity-80 grayscale' : ''}`}>
                  <button
                    type="button"
                    className="relative aspect-square w-full overflow-hidden bg-muted text-left"
                    onClick={() => openEdit(item)}
                  >
                    <div className="absolute inset-0">
                      <ContentCoverImage
                        src={item.imageUrl}
                        alt={item.title}
                        position={item.imagePosition}
                        scale={item.imageScale}
                        width={440}
                        height={440}
                      />
                    </div>

                    <span className="absolute left-3 top-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground">
                      {item.category?.name || 'Sem categoria'}
                    </span>
                  </button>

                  <div className="flex items-center justify-between border-t border-border bg-white/92 px-3 py-2">
                    <button
                      type="button"
                      className="min-w-0 flex-1 pr-2 text-left"
                      onClick={() => openEdit(item)}
                    >
                      <div>
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">{item.title}</p>
                        <p className="line-clamp-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {item.fileName}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.status === 'ACTIVE'}
                      aria-label={item.status === 'ACTIVE' ? `Desativar ${item.title}` : `Ativar ${item.title}`}
                      className="fac-toggle shrink-0"
                      data-state={item.status === 'ACTIVE' ? 'on' : 'off'}
                      onClick={() => {
                        void toggleStatus(item);
                      }}
                    >
                      <span className="fac-toggle-dot" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar documento' : 'Novo documento'}
        description="Adicione arquivos para consulta no portal."
        onClose={() => setModalOpen(false)}
        panelClassName="max-w-[820px]"
        footer={
          <>
            {editing ? (
              <button
                type="button"
                className="fac-button-secondary text-[11px]"
                onClick={() => {
                  if (editing) {
                    setConfirmTarget(editing);
                  }
                }}
                disabled={saving || removing}
              >
                Remover
              </button>
            ) : null}
            <button
              type="button"
              className="fac-button-secondary text-[11px]"
              onClick={() => setModalOpen(false)}
              disabled={saving || removing}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="fac-button-primary text-[11px]"
              onClick={save}
              disabled={saving || removing || !form.title.trim() || !form.fileUrl}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="fac-tabs">
          <button
            type="button"
            className="fac-tab"
            data-active={formTab === 'BASIC' ? 'true' : 'false'}
            onClick={() => setFormTab('BASIC')}
          >
            Básico
          </button>
          <button
            type="button"
            className="fac-tab"
            data-active={formTab === 'CATEGORY' ? 'true' : 'false'}
            onClick={() => setFormTab('CATEGORY')}
          >
            Categorização
          </button>
          <button
            type="button"
            className="fac-tab"
            data-active={formTab === 'VISUAL' ? 'true' : 'false'}
            onClick={() => setFormTab('VISUAL')}
          >
            Visual
          </button>
        </div>

        {formTab === 'BASIC' ? (
          <section className="fac-form-card mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="fac-label">Titulo</label>
                <input
                  value={form.title}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, title: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={`fac-input ${formErrors.title ? 'border-destructive' : ''}`}
                />
                {formErrors.title ? (
                  <p className="mt-1 text-[12px] text-destructive">{formErrors.title}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="fac-label">Arquivo</label>
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadDocument(file);
                    }
                  }}
                  className={`fac-input !h-auto !px-3 !py-2 ${formErrors.fileUrl ? 'border-destructive' : ''}`}
                />
                <p className="mt-1 text-[12px] text-muted-foreground">PDF, DOC, XLS/XLSX, PPT, TXT ou MD</p>
                {formErrors.fileUrl ? (
                  <p className="mt-1 text-[12px] text-destructive">{formErrors.fileUrl}</p>
                ) : null}
                {uploading ? <p className="mt-1 text-[12px] text-muted-foreground">Enviando arquivo...</p> : null}
                {form.fileName ? (
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Selecionado: {form.fileName} ({formatBytes(form.fileSize)})
                  </p>
                ) : null}
              </div>

              <div>
                <label className="fac-label">Visibilidade</label>
                <select
                  value={isSuperadmin ? form.visibility : 'PRIVATE'}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      visibility: event.target.value as ContentVisibility,
                    }))
                  }
                  className="fac-select"
                  disabled={!isSuperadmin}
                >
                  <option value="PRIVATE">Somente eu</option>
                  <option value="PUBLIC">Publica</option>
                </select>
              </div>

              {isSuperadmin && form.visibility === 'PUBLIC' ? (
                <div>
                  <label className="fac-label">Token publico (opcional)</label>
                  <input
                    value={form.publicToken}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, publicToken: event.target.value }))
                    }
                    className="fac-input"
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {formTab === 'CATEGORY' ? (
          <section className="fac-form-card mt-4">
            <label className="fac-label">Categoria</label>
            <select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              className="fac-select"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        {formTab === 'VISUAL' ? (
          <div className="mt-4 space-y-4">
            <section className="fac-form-card">
              <label className="fac-label">Imagem</label>
              <ImageSelector
                value={form.imageUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
              />

              {form.imageUrl ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="fac-label">Largura</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.x}
                      onChange={(event) => {
                        const nextX = Number.parseInt(event.target.value, 10);
                        setForm((prev) => ({
                          ...prev,
                          imagePosition: `${nextX}% ${imagePosition.y}%`,
                        }));
                      }}
                      className="w-full"
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground">{imagePosition.x}%</p>
                  </div>

                  <div>
                    <label className="fac-label">Altura</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.y}
                      onChange={(event) => {
                        const nextY = Number.parseInt(event.target.value, 10);
                        setForm((prev) => ({
                          ...prev,
                          imagePosition: `${imagePosition.x}% ${nextY}%`,
                        }));
                      }}
                      className="w-full"
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground">{imagePosition.y}%</p>
                  </div>

                  <div>
                    <label className="fac-label">Zoom</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={form.imageScale}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          imageScale: Number.parseFloat(event.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {form.imageScale.toFixed(1)}x
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="fac-form-card">
              <p className="fac-form-title">Previa do card</p>
              <ContentPreviewCard
                imageUrl={form.imageUrl}
                imagePosition={form.imagePosition}
                imageScale={form.imageScale}
                title={form.title}
                fallbackTitle="Nome do documento"
                footer={
                  <span className="rounded-lg border border-border bg-white/80 px-3 py-1 text-[13px] uppercase tracking-[0.12em]">
                    DOC
                  </span>
                }
              />
            </section>
          </div>
        ) : null}
      </AdminModal>

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title="Remover documento"
        description={
          confirmTarget
            ? `Confirma a remoção permanente do documento "${confirmTarget.title}"?`
            : 'Confirma a remoção permanente deste documento?'
        }
        confirmLabel="Remover documento"
        loading={removing}
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}
