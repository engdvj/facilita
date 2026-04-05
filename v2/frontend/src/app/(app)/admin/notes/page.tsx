'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ConfirmModal from '@/components/admin/confirm-modal';
import AdminFilterSelect from '@/components/admin/filter-select';
import RichTextEditor from '@/components/admin/rich-text-editor';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import AdminNoteCard from '@/components/admin/note-card';
import AdminPanelHeaderBar from '@/components/admin/panel-header-bar';
import ShareContentModal from '@/components/admin/share-content-modal';
import NoteViewerModal from '@/components/note-viewer-modal';
import useAdminContentCatalog from '@/hooks/use-admin-content-catalog';
import api from '@/lib/api';
import { normalizeImagePosition, parseImagePosition } from '@/lib/image';
import { hasPermission } from '@/lib/permissions';
import { formatSharePreview, formatShareSummary } from '@/lib/shares';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { Note } from '@/types';

const emptyForm = {
  title: '',
  content: '',
  categoryId: '',
  color: '#3b82f6',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
};

type FormTab = 'BASIC' | 'VISUAL';
type NoteFormErrors = {
  title?: string;
  content?: string;
};

export default function NotesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formTab, setFormTab] = useState<FormTab>('BASIC');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<NoteFormErrors>({});
  const [confirmTarget, setConfirmTarget] = useState<Note | null>(null);
  const [shareTarget, setShareTarget] = useState<Note | null>(null);
  const [removing, setRemoving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [viewing, setViewing] = useState<Note | null>(null);

  const isSuperadmin = user?.role === 'SUPERADMIN';
  const canManageNotes = hasPermission(user, 'canManageNotes');
  const canManageShares = hasPermission(user, 'canManageShares');
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
  const currentEditing = useMemo(
    () => (editing ? items.find((item) => item.id === editing.id) ?? editing : null),
    [editing, items],
  );
  const activeSearch = globalSearch.trim();

  const clearEditParam = useCallback(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has('edit')) return;

    params.delete('edit');
    const nextQuery = params.toString();

    setEditId(null);
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
    clearEditParam();
  }, [clearEditParam]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEditId(new URLSearchParams(window.location.search).get('edit'));
  }, []);

  const openCreate = () => {
    if (!canManageNotes) {
      return;
    }

    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const openEdit = useCallback((item: Note) => {
    if (!canManageNotes) {
      return;
    }

    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      categoryId: item.categoryId || '',
      color: item.color || '#3b82f6',
      imageUrl: item.imageUrl || '',
      imagePosition: normalizeImagePosition(item.imagePosition),
      imageScale: item.imageScale || 1,
    });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  }, [canManageNotes]);

  useEffect(() => {
    if (!editId || loading) return;

    const target = items.find((item) => item.id === editId);
    if (!target) return;
    if (modalOpen && editing?.id === target.id) return;

    openEdit(target);
  }, [editId, editing?.id, items, loading, modalOpen, openEdit]);

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
    if (!canManageNotes) return;
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
      };

      if (editing) {
        await api.patch(`/notes/${editing.id}`, payload);
      } else {
        await api.post('/notes', payload);
      }

      closeModal();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!canManageNotes) return;
    if (!confirmTarget) return;

    setRemoving(true);
    try {
      await removeItem(confirmTarget.id);

      if (editing?.id === confirmTarget.id) {
        closeModal();
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
      <section className="fac-panel">
        <AdminPanelHeaderBar
          title="Notas"
          count={filtered.length}
          actionsClassName="sm:grid-cols-[180px_auto]"
          actions={
            <>
              <AdminFilterSelect
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                }
              >
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="INACTIVE">Inativas</option>
              </AdminFilterSelect>

              <button
                type="button"
                className="fac-button-primary !h-10 !w-10 !rounded-full !px-0 !tracking-normal transition-colors duration-200 hover:!bg-accent hover:!text-accent-foreground"
                onClick={openCreate}
                aria-label="Nova nota"
                title="Nova nota"
                disabled={!canManageNotes}
              >
                <span className="text-[22px] leading-none">+</span>
              </button>
            </>
          }
        />

        <div className="fac-panel-body space-y-4">
          {activeSearch ? (
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              Busca ativa:{' '}
              <span className="normal-case tracking-normal text-foreground">{activeSearch}</span>
            </p>
          ) : null}

          {loading ? (
            <div className="fac-loading-state">Carregando notas...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhuma nota encontrada.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((item) => (
                <AdminNoteCard
                  key={item.id}
                  note={item}
                  onEdit={canManageNotes ? () => openEdit(item) : undefined}
                  onShare={
                    canManageShares && !isSuperadmin
                      ? () => {
                          setShareTarget(item);
                        }
                      : undefined
                  }
                  onToggleStatus={
                    canManageNotes
                      ? () => {
                          void toggleStatus(item);
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar nota' : 'Nova nota'}
        description="Crie notas pessoais ou compartilhadas."
        onClose={closeModal}
        panelClassName="max-w-[820px]"
        footer={
          <>
            {editing && canManageNotes ? (
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
              onClick={closeModal}
              disabled={saving || removing}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="fac-button-primary text-[11px]"
              onClick={save}
              disabled={saving || removing || !canManageNotes || !form.title.trim() || !form.content.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="fac-tabs !grid-cols-2">
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
                <label className="fac-label">Título</label>
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
                <label className="fac-label">Conteúdo</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => {
                    setForm((prev) => ({ ...prev, content: html }));
                    setFormErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  hasError={Boolean(formErrors.content)}
                  disabled={saving}
                />
                {formErrors.content ? (
                  <p className="mt-1 text-[12px] text-destructive">{formErrors.content}</p>
                ) : null}
              </div>

              <div>
                <label className="fac-label">Categoria</label>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                  className="fac-select"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {canManageShares && !isSuperadmin ? (
                <div className="sm:col-span-2 rounded-2xl border border-border/70 bg-card/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="fac-form-title">Compartilhamento</p>
                      <p className="text-[13px] text-foreground">
                        {currentEditing
                          ? formatShareSummary(currentEditing.shareCount)
                          : 'Salve a nota para compartilhar com usuários específicos.'}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {currentEditing
                          ? formatSharePreview(currentEditing.sharedWithPreview) ||
                            'Compartilhe sem alterar a visibilidade do item.'
                          : 'Disponível apenas depois que a nota for salva.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="fac-button-secondary !h-10 !px-4 text-[11px]"
                      onClick={() => {
                        if (currentEditing) {
                          setShareTarget(currentEditing);
                        }
                      }}
                      disabled={!currentEditing || saving || removing}
                    >
                      Compartilhar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {formTab === 'VISUAL' ? (
          <div className="mt-4 space-y-4">
            <section className="fac-form-card">
              <label className="fac-label">Imagem</label>
              <ImageSelector
                value={form.imageUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                showPreview={false}
              />
              <p className="mt-1 text-[12px] text-muted-foreground">Opcional</p>
            </section>

            <section className="fac-form-card">
              <p className="fac-form-title">Prévia do card</p>
              <div
                className={
                  form.imageUrl
                    ? 'mt-4 grid gap-6 md:grid-cols-[minmax(0,248px)_minmax(0,1fr)] md:items-center'
                    : 'mt-4'
                }
              >
                <div className="flex justify-center md:justify-start">
                  <AdminNoteCard
                    size="preview"
                    note={{
                      title: form.title || 'Nome da nota',
                      content: form.content || 'Conteúdo da nota',
                      category:
                        categories.find((category) => category.id === form.categoryId) ?? null,
                      status: 'ACTIVE',
                      imageUrl: form.imageUrl || undefined,
                      imagePosition: form.imagePosition,
                      imageScale: form.imageScale,
                      color: form.color,
                      shareCount: 0,
                    }}
                    previewAction={
                      <button
                        type="button"
                        className="rounded-lg border border-border bg-white/80 px-3 py-1 text-[13px] uppercase tracking-[0.12em]"
                        onClick={() => {
                          const previewCategory =
                            categories.find((category) => category.id === form.categoryId) ?? null;
                          setViewing({
                            ...form,
                            id: 'preview',
                            ownerId: user?.id || '',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            status: 'ACTIVE',
                            category: previewCategory,
                          } as Note);
                        }}
                      >
                        Ver
                      </button>
                    }
                  />
                </div>

                {form.imageUrl ? (
                  <div className="grid gap-4">
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
              </div>
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

      <ShareContentModal
        open={Boolean(shareTarget)}
        entityType="NOTE"
        entityId={shareTarget?.id ?? null}
        entityTitle={shareTarget?.title || 'Nota'}
        onClose={() => setShareTarget(null)}
        onShared={load}
      />

      <NoteViewerModal
        open={Boolean(viewing)}
        note={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
