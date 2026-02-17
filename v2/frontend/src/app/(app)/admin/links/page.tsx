'use client';

import { useEffect, useMemo, useState } from 'react';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { Category, ContentVisibility, Link } from '@/types';

const emptyForm = {
  title: '',
  url: '',
  description: '',
  categoryId: '',
  color: '#3b82f6',
  imageUrl: '',
  imagePosition: '50% 50%',
  imageScale: 1,
  visibility: 'PRIVATE' as ContentVisibility,
  publicToken: '',
  order: 0,
};

type FormTab = 'BASIC' | 'CATEGORY' | 'VISUAL';

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const format = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${format(x)} ${format(y)}`;
}

function resolveImageUrl(path?: string | null) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  const payload = error as { response?: { data?: { message?: unknown } } };
  const message = payload.response?.data?.message;
  return typeof message === 'string' ? message : fallback;
}

export default function LinksPage() {
  const user = useAuthStore((state) => state.user);

  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formTab, setFormTab] = useState<FormTab>('BASIC');
  const [saving, setSaving] = useState(false);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [linksRes, categoriesRes] = await Promise.all([
        api.get(isSuperadmin ? '/links/admin/list' : '/links', {
          params: { includeInactive: true },
        }),
        api.get('/categories', { params: { includeInactive: true } }),
      ]);

      const rawLinks = Array.isArray(linksRes.data) ? linksRes.data : [];
      const scopedLinks = isSuperadmin
        ? rawLinks
        : rawLinks.filter((item: Link) => item.ownerId === user?.id);

      setLinks(scopedLinks);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Nao foi possivel carregar links.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSuperadmin, user?.id]);

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

  const imagePosition = useMemo(() => {
    const [xRaw = '50%', yRaw = '50%'] = form.imagePosition.split(' ');
    const parse = (value: string) => {
      const numeric = Number.parseInt(value, 10);
      if (Number.isNaN(numeric)) return 50;
      return Math.max(0, Math.min(100, numeric));
    };
    return {
      x: parse(xRaw),
      y: parse(yRaw),
    };
  }, [form.imagePosition]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, visibility: 'PRIVATE' });
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const openEdit = (link: Link) => {
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
      visibility: link.visibility,
      publicToken: link.publicToken || '',
      order: link.order,
    });
    setFormTab('BASIC');
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return;

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
        visibility: isSuperadmin ? form.visibility : 'PRIVATE',
        publicToken:
          isSuperadmin && form.visibility === 'PUBLIC'
            ? form.publicToken || undefined
            : undefined,
      };

      if (editing) {
        await api.patch(`/links/${editing.id}`, payload);
      } else {
        await api.post('/links', payload);
      }

      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (link: Link) => {
    await api.patch(`/links/${link.id}`, {
      status: link.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    await load();
  };

  const remove = async (link: Link) => {
    if (!window.confirm(`Remover link ${link.title}?`)) return;
    await api.delete(`/links/${link.id}`);
    await load();
  };

  return (
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <h1 className="fac-subtitle">Links</h1>
          <p className="text-[15px] text-muted-foreground">Gerencie os links que aparecem no portal.</p>
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

          <button type="button" className="fac-filter-button">
            Filtros
          </button>

          <button type="button" className="fac-button-primary" onClick={openCreate}>
            Novo link
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
            <p className="text-[14px] text-muted-foreground">Carregando links...</p>
          ) : error ? (
            <p className="text-[14px] text-red-700">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">Nenhum link encontrado.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((link) => (
                <article key={link.id} className={`fac-card w-[220px] max-w-full ${link.status === 'INACTIVE' ? 'opacity-80 grayscale' : ''}`}>
                  <button type="button" className="relative aspect-square w-full overflow-hidden bg-muted text-left" onClick={() => openEdit(link)}>
                    <div className="absolute inset-0">
                      {link.imageUrl ? (
                        <img
                          src={resolveImageUrl(link.imageUrl)}
                          alt={link.title}
                          className="h-full w-full object-cover"
                          style={{
                            objectPosition: normalizeImagePosition(link.imagePosition),
                            transform: `scale(${link.imageScale || 1})`,
                            transformOrigin: normalizeImagePosition(link.imagePosition),
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-b from-black/15 to-black/5" />
                      )}
                    </div>

                    <span className="absolute left-3 top-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground">
                      {link.category?.name || 'Sem categoria'}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-white/92 px-3 py-2">
                      <div className="pr-2">
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">{link.title}</p>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Link</p>
                      </div>

                      <span
                        className="fac-toggle shrink-0"
                        data-state={link.status === 'ACTIVE' ? 'on' : 'off'}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void toggleStatus(link);
                        }}
                      >
                        <span className="fac-toggle-dot" />
                      </span>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar link' : 'Novo link'}
        description="Atualize os principais dados do link."
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
                    void remove(editing);
                  }
                }}
                disabled={saving}
              >
                Remover
              </button>
            ) : null}
            <button
              type="button"
              className="fac-button-secondary text-[11px]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="fac-button-primary text-[11px]"
              onClick={save}
              disabled={saving || !form.title.trim() || !form.url.trim()}
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
            Basico
          </button>
          <button
            type="button"
            className="fac-tab"
            data-active={formTab === 'CATEGORY' ? 'true' : 'false'}
            onClick={() => setFormTab('CATEGORY')}
          >
            Categorizacao
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
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="fac-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="fac-label">Url</label>
                <input
                  value={form.url}
                  onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                  className="fac-input"
                  placeholder="https://exemplo.com"
                />
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

              <div>
                <label className="fac-label">Ordem</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))
                  }
                  className="fac-input"
                />
              </div>

              {isSuperadmin && form.visibility === 'PUBLIC' ? (
                <div className="sm:col-span-2">
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
              <p className="mt-1 text-[12px] text-muted-foreground">Opcional</p>

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
              <article className="fac-card w-full max-w-[280px]">
                <div className="aspect-square overflow-hidden bg-muted">
                  {form.imageUrl ? (
                    <img
                      src={resolveImageUrl(form.imageUrl)}
                      alt={form.title || 'Nome do link'}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: form.imagePosition,
                        transform: `scale(${form.imageScale})`,
                        transformOrigin: form.imagePosition,
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-b from-black/15 to-black/5" />
                  )}
                </div>
                <div className="fac-card-content">
                  <p className="line-clamp-1 text-[15px] font-semibold text-foreground">
                    {form.title || 'Nome do link'}
                  </p>
                  <span className="rounded-lg border border-border bg-white/80 px-3 py-1 text-[13px] uppercase tracking-[0.12em]">
                    LINK
                  </span>
                </div>
              </article>
            </section>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}

