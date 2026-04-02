'use client';

import { useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import ContentPreviewCard from '@/components/admin/content-preview-card';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import ContentCoverImage from '@/components/content-cover-image';
import useAdminContentCatalog from '@/hooks/use-admin-content-catalog';
import api from '@/lib/api';
import { normalizeImagePosition, parseImagePosition } from '@/lib/image';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { ContentVisibility, Note } from '@/types';

const emptyForm = {
  title: '',
  content: '',
  categoryId: '',
  color: '#3b82f6',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  visibility: 'PRIVATE' as ContentVisibility,
  publicToken: '',
};

type FormTab = 'BASIC' | 'CATEGORY' | 'VISUAL';
type NoteFormErrors = {
  title?: string;
  content?: string;
};

export default function NotesPage() {
  const user = useAuthStore((state) => state.user);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formTab, setFormTab] = useState<FormTab>('BASIC');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<NoteFormErrors>({});
  const [confirmTarget, setConfirmTarget] = useState<Note | null>(null);
  const [removing, setRemoving] = useState(false);

  const [viewing, setViewing] = useState<Note | null>(null);

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
  } = useAdminContentCatalog<Note>({
    adminListPath: '/notes/admin/list',
    resourcePath: '/notes',
    errorMessage: 'Não foi possível carregar notas.',
    isSuperadmin,
    userId,
  });

  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return items
      .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!term) return true;
        return `${item.title} ${item.content}`.toLowerCase().includes(term);
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

  const openEdit = (item: Note) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      categoryId: item.categoryId || '',
      color: item.color || '#3b82f6',
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

  const validateForm = () => {
    const nextErrors: NoteFormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Título é obrigatório.';
    }

    if (!form.content.trim()) {
      nextErrors.content = 'Conteúdo é obrigatório.';
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
        content: form.content,
        categoryId: form.categoryId || undefined,
        color: form.color || undefined,
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
        await api.patch(`/notes/${editing.id}`, payload);
      } else {
        await api.post('/notes', payload);
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
          <h1 className="fac-subtitle">Notas</h1>
          <p className="text-[15px] text-muted-foreground">Gerencie notas pessoais e compartilhadas no portal.</p>
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
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
          </select>

          <button type="button" className="fac-filter-button" disabled title="Em breve">
            Filtros
          </button>

          <button type="button" className="fac-button-primary" onClick={openCreate}>
            Nova nota
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
            <div className="fac-loading-state">Carregando notas...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhuma nota encontrada.</div>
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
                      <div className="pr-2">
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">{item.title}</p>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Nota</p>
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
        title={editing ? 'Editar nota' : 'Nova nota'}
        description="Crie notas pessoais ou compartilhadas."
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
              disabled={saving || removing || !form.title.trim() || !form.content.trim()}
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
                <label className="fac-label">Conteudo</label>
                <textarea
                  value={form.content}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, content: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  rows={6}
                  className={`fac-textarea ${formErrors.content ? 'border-destructive' : ''}`}
                />
                {formErrors.content ? (
                  <p className="mt-1 text-[12px] text-destructive">{formErrors.content}</p>
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
                fallbackTitle="Nome da nota"
                footer={
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-white/80 px-3 py-1 text-[13px] uppercase tracking-[0.12em]"
                    onClick={() => {
                      setViewing({
                        ...form,
                        id: 'preview',
                        ownerId: user?.id || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        status: 'ACTIVE',
                        visibility: form.visibility,
                      } as Note);
                    }}
                  >
                    Ver
                  </button>
                }
              />
            </section>
          </div>
        ) : null}
      </AdminModal>

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title="Remover nota"
        description={
          confirmTarget
            ? `Confirma a remoção permanente da nota "${confirmTarget.title}"?`
            : 'Confirma a remoção permanente desta nota?'
        }
        confirmLabel="Remover nota"
        loading={removing}
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setConfirmTarget(null)}
      />

      <AdminModal
        open={Boolean(viewing)}
        title={viewing?.title || 'Nota'}
        onClose={() => setViewing(null)}
        panelClassName="max-w-3xl"
      >
        {viewing?.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-xl">
            <ContentCoverImage
              src={viewing.imageUrl}
              alt={viewing.title}
              position={viewing.imagePosition}
              scale={viewing.imageScale}
              width={1200}
              height={560}
              className="h-56 w-full object-cover"
            />
          </div>
        ) : null}

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{viewing?.content}</p>
      </AdminModal>
    </div>
  );
}
