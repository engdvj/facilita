'use client';

import { useEffect, useMemo, useState } from 'react';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import ShareContentModal from '@/components/admin/share-content-modal';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
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

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const fmt = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${fmt(x)} ${fmt(y)}`;
}

export default function LinksPage() {
  const user = useAuthStore((state) => state.user);
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [sharing, setSharing] = useState<Link | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksRes, categoriesRes] = await Promise.all([
        api.get(isSuperadmin ? '/links/admin/list' : '/links'),
        api.get('/categories'),
      ]);

      const rawLinks = Array.isArray(linksRes.data) ? linksRes.data : [];
      const scopedLinks = isSuperadmin
        ? rawLinks
        : rawLinks.filter((link: Link) => link.ownerId === user?.id);

      setLinks(scopedLinks);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar links.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar links.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSuperadmin, user?.id]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return links
      .filter((link) => {
        if (statusFilter !== 'ALL' && link.status !== statusFilter) return false;
        if (!term) return true;
        return `${link.title} ${link.description || ''} ${link.url}`
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, [links, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, visibility: isSuperadmin ? 'PRIVATE' : 'PRIVATE' });
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
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);

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

    try {
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

  const visibilityBadge = (visibility: ContentVisibility) =>
    visibility === 'PUBLIC' ? 'Publico' : 'Privado';

  const sharePreview = (preview?: { name: string }[]) => {
    if (!preview || preview.length === 0) return 'Nenhum destinatario';
    const names = preview.slice(0, 3).map((item) => item.name);
    return preview.length > 3
      ? `${names.join(', ')} +${preview.length - 3}`
      : names.join(', ');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Links</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperadmin
              ? 'Gestao global de links com metadados de autoria e compartilhamento.'
              : 'Gerencie seus links pessoais.'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground"
          onClick={openCreate}
        >
          Novo link
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo, descricao ou URL"
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
          }
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando links...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum link encontrado.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((link) => {
            const imageUrl = link.imageUrl
              ? link.imageUrl.startsWith('http')
                ? link.imageUrl
                : `${serverURL}${link.imageUrl}`
              : '';
            return (
              <article
                key={link.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm"
              >
                <div className="relative h-36 bg-secondary/40">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={link.title}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: normalizeImagePosition(link.imagePosition),
                        transform: `scale(${link.imageScale || 1})`,
                        transformOrigin: normalizeImagePosition(link.imagePosition),
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 to-secondary/30" />
                  )}
                  <div className="absolute left-3 top-3 rounded-full border border-black/5 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                    {visibilityBadge(link.visibility)}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-3 rounded-full border border-black/5 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900"
                  >
                    Abrir
                  </a>
                </div>

                <div className="space-y-2 p-4">
                  <p className="line-clamp-1 text-base font-semibold text-foreground">{link.title}</p>
                  {link.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{link.description}</p>
                  )}
                  <p className="line-clamp-1 text-xs text-muted-foreground">{link.url}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {link.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </p>
                  {isSuperadmin && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Criado por: {link.createdBy?.name || link.owner?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Compartilhado com: {link.shareCount || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Destinatarios: {sharePreview(link.sharedWithPreview)}
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                      onClick={() => openEdit(link)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                      onClick={() => toggleStatus(link)}
                    >
                      {link.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-destructive"
                      onClick={() => remove(link)}
                    >
                      Remover
                    </button>
                    {!isSuperadmin && (
                      <button
                        type="button"
                        className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                        onClick={() => setSharing(link)}
                      >
                        Compartilhar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar link' : 'Novo link'}
        onClose={() => setModalOpen(false)}
        panelClassName="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              onClick={save}
              disabled={saving || !form.title.trim() || !form.url.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Titulo"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <input
            value={form.url}
            onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
            placeholder="https://..."
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Descricao"
            className="md:col-span-2 w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
            rows={3}
          />
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, categoryId: event.target.value }))
            }
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          >
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={form.order}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))
            }
            placeholder="Ordem"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <input
            type="color"
            value={form.color}
            onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
            className="h-11 w-full rounded-lg border border-border/70 bg-white/80 px-2 py-2"
          />

          {isSuperadmin && (
            <>
              <select
                value={form.visibility}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    visibility: event.target.value as ContentVisibility,
                  }))
                }
                className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
              >
                <option value="PRIVATE">Privado</option>
                <option value="PUBLIC">Publico</option>
              </select>
              {form.visibility === 'PUBLIC' && (
                <input
                  value={form.publicToken}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, publicToken: event.target.value }))
                  }
                  placeholder="Token publico (opcional)"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
                />
              )}
            </>
          )}

          <div className="md:col-span-2">
            <ImageSelector
              value={form.imageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            />
          </div>

          {form.imageUrl && (
            <>
              <input
                type="range"
                min="0"
                max="100"
                value={parseInt(form.imagePosition.split(' ')[0], 10)}
                onChange={(event) => {
                  const [, y = '50%'] = form.imagePosition.split(' ');
                  setForm((prev) => ({
                    ...prev,
                    imagePosition: `${event.target.value}% ${y}`,
                  }));
                }}
                className="md:col-span-2"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={parseInt(form.imagePosition.split(' ')[1], 10)}
                onChange={(event) => {
                  const [x = '50%'] = form.imagePosition.split(' ');
                  setForm((prev) => ({
                    ...prev,
                    imagePosition: `${x} ${event.target.value}%`,
                  }));
                }}
                className="md:col-span-2"
              />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={form.imageScale}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, imageScale: Number(event.target.value) }))
                }
                className="md:col-span-2"
              />
            </>
          )}
        </div>
      </AdminModal>

      <ShareContentModal
        open={Boolean(sharing)}
        entityType="LINK"
        entityId={sharing?.id || null}
        entityTitle={sharing?.title || 'Link'}
        onClose={() => setSharing(null)}
        onShared={load}
      />
    </div>
  );
}
