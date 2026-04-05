'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ConfirmModal from '@/components/admin/confirm-modal';
import AdminFilterSelect from '@/components/admin/filter-select';
import SortableLinkList from '@/components/admin/sortable-link-list';
import ImageSelector from '@/components/admin/image-selector';
import AdminLinkCard from '@/components/admin/link-card';
import AdminModal from '@/components/admin/modal';
import AdminPanelHeaderBar from '@/components/admin/panel-header-bar';
import ShareContentModal from '@/components/admin/share-content-modal';
import useAdminContentCatalog from '@/hooks/use-admin-content-catalog';
import api from '@/lib/api';
import { normalizeImagePosition, parseImagePosition } from '@/lib/image';
import { hasPermission } from '@/lib/permissions';
import { formatSharePreview, formatShareSummary } from '@/lib/shares';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { Link } from '@/types';

const emptyForm = {
  title: '',
  url: '',
  description: '',
  categoryId: '',
  color: '#3b82f6',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  order: 0,
};

type FormTab = 'BASIC' | 'VISUAL';
type LinkFormErrors = {
  title?: string;
  url?: string;
};

export default function LinksPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formTab, setFormTab] = useState<FormTab>('BASIC');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<LinkFormErrors>({});
  const [confirmTarget, setConfirmTarget] = useState<Link | null>(null);
  const [shareTarget, setShareTarget] = useState<Link | null>(null);
  const [removing, setRemoving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState(false);

  const isSuperadmin = user?.role === 'SUPERADMIN';
  const canManageLinks = hasPermission(user, 'canManageLinks');
  const canManageShares = hasPermission(user, 'canManageShares');
  const userId = user?.id;

  const {
    items: links,
    categories,
    loading,
    error,
    load,
    toggleStatus,
    removeItem,
  } = useAdminContentCatalog<Link>({
    adminListPath: '/links/admin/list',
    resourcePath: '/links',
    errorMessage: 'Não foi possível carregar links.',
    isSuperadmin,
    userId,
  });

  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return links
      .filter((link) => (statusFilter === 'ALL' ? true : link.status === statusFilter))
      .filter((link) => {
        if (!term) return true;
        return `${link.title} ${link.description || ''} ${link.url}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [links, globalSearch, statusFilter]);

  const imagePosition = useMemo(() => parseImagePosition(form.imagePosition), [form.imagePosition]);
  const currentEditing = useMemo(
    () => (editing ? links.find((item) => item.id === editing.id) ?? editing : null),
    [editing, links],
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
    if (!canManageLinks) {
      return;
    }

    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const openEdit = useCallback((link: Link) => {
    if (!canManageLinks) {
      return;
    }

    setEditing(link);
    setForm({
      title: link.title,
      url: link.url,
      description: link.description || '',
      categoryId: link.categoryId || '',
      color: link.color || '#3b82f6',
      imageUrl: link.imageUrl || '',
      imagePosition: normalizeImagePosition(link.imagePosition),
      imageScale: link.imageScale || 1,
      order: link.order,
    });
    setFormErrors({});
    setFormTab('BASIC');
    setModalOpen(true);
  }, [canManageLinks]);

  useEffect(() => {
    if (!editId || loading) return;

    const target = links.find((item) => item.id === editId);
    if (!target) return;
    if (modalOpen && editing?.id === target.id) return;

    openEdit(target);
  }, [editId, editing?.id, links, loading, modalOpen, openEdit]);

  const validateForm = () => {
    const nextErrors: LinkFormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Título é obrigatório.';
    }

    if (!form.url.trim()) {
      nextErrors.url = 'URL é obrigatória.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!canManageLinks) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        url: form.url,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        color: form.color || undefined,
        imageUrl: form.imageUrl || undefined,
        imagePosition: form.imageUrl ? form.imagePosition : undefined,
        imageScale: form.imageUrl ? form.imageScale : undefined,
        order: form.order,
      };

      if (editing) {
        await api.patch(`/links/${editing.id}`, payload);
      } else {
        await api.post('/links', payload);
      }

      closeModal();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!canManageLinks) return;
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

  const saveOrder = async (orderedIds: string[]) => {
    if (!canManageLinks) return;
    await Promise.all(
      orderedIds.map((id, index) => api.patch(`/links/${id}`, { order: index })),
    );
    setSortMode(false);
    await load();
  };

  return (
    <div className="fac-page">
      <section className="fac-panel">
        <AdminPanelHeaderBar
          title="Links"
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
                <option value="ACTIVE">Ativos</option>
                <option value="INACTIVE">Inativos</option>
              </AdminFilterSelect>

              {canManageLinks && !sortMode && filtered.length > 1 && (
                <button
                  type="button"
                  className="fac-button-secondary !h-10 !px-4 !text-[11px]"
                  onClick={() => setSortMode(true)}
                  title="Reordenar links"
                >
                  Reordenar
                </button>
              )}

              <button
                type="button"
                className="fac-button-primary !h-10 !w-10 !rounded-full !px-0 !tracking-normal transition-colors duration-200 hover:!bg-accent hover:!text-accent-foreground"
                onClick={openCreate}
                aria-label="Novo link"
                title="Novo link"
                disabled={!canManageLinks}
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
            <div className="fac-loading-state">Carregando links...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhum link encontrado.</div>
          ) : sortMode ? (
            <SortableLinkList
              links={filtered}
              onSave={(ids) => saveOrder(ids)}
              onCancel={() => setSortMode(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((link) => (
                <AdminLinkCard
                  key={link.id}
                  link={link}
                  onEdit={canManageLinks ? () => openEdit(link) : undefined}
                  onShare={
                    canManageShares && !isSuperadmin
                      ? () => {
                          setShareTarget(link);
                        }
                      : undefined
                  }
                  onToggleStatus={
                    canManageLinks
                      ? () => {
                          void toggleStatus(link);
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
        title={editing ? 'Editar link' : 'Novo link'}
        description="Atualize os principais dados do link."
        onClose={closeModal}
        panelClassName="max-w-[820px]"
        footer={
          <>
            {editing && canManageLinks ? (
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
              disabled={saving || removing || !canManageLinks || !form.title.trim() || !form.url.trim()}
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
                <label className="fac-label">Url</label>
                <input
                  value={form.url}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, url: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, url: undefined }));
                  }}
                  className={`fac-input ${formErrors.url ? 'border-destructive' : ''}`}
                  placeholder="https://exemplo.com"
                />
                {formErrors.url ? (
                  <p className="mt-1 text-[12px] text-destructive">{formErrors.url}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="fac-label">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="fac-textarea"
                  rows={4}
                />
                <p className="mt-1 text-[12px] text-muted-foreground">Opcional</p>
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
                          : 'Salve o link para compartilhar com usuários específicos.'}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {currentEditing
                          ? formatSharePreview(currentEditing.sharedWithPreview) ||
                            'Compartilhe sem alterar a visibilidade do item.'
                          : 'Disponível apenas depois que o link for salvo.'}
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
                  <AdminLinkCard
                    size="preview"
                    link={{
                      title: form.title || 'Nome do link',
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
                      <span className="rounded-lg border border-border bg-white/80 px-3 py-1 text-[13px] uppercase tracking-[0.12em]">
                        LINK
                      </span>
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
        title="Remover link"
        description={
          confirmTarget
            ? `Confirma a remoção permanente do link "${confirmTarget.title}"?`
            : 'Confirma a remoção permanente deste link?'
        }
        confirmLabel="Remover link"
        loading={removing}
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setConfirmTarget(null)}
      />

      <ShareContentModal
        open={Boolean(shareTarget)}
        entityType="LINK"
        entityId={shareTarget?.id ?? null}
        entityTitle={shareTarget?.title || 'Link'}
        onClose={() => setShareTarget(null)}
        onShared={load}
      />
    </div>
  );
}
