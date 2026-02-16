'use client';

import { useEffect, useMemo, useState } from 'react';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import ShareContentModal from '@/components/admin/share-content-modal';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Category, ContentVisibility, Note } from '@/types';

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

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const fmt = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${fmt(x)} ${fmt(y)}`;
}

function resolveFileUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

export default function NotesPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [sharing, setSharing] = useState<Note | null>(null);
  const [viewing, setViewing] = useState<Note | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get(isSuperadmin ? '/notes/admin/list' : '/notes'),
        api.get('/categories'),
      ]);

      const raw = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const scoped = isSuperadmin
        ? raw
        : raw.filter((item: Note) => item.ownerId === user?.id);

      setItems(scoped);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar notas.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar notas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSuperadmin, user?.id]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (!term) return true;
        return `${item.title} ${item.content}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
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
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

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

    try {
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

  const toggleStatus = async (item: Note) => {
    await api.patch(`/notes/${item.id}`, {
      status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    await load();
  };

  const remove = async (item: Note) => {
    if (!window.confirm(`Remover nota ${item.title}?`)) return;
    await api.delete(`/notes/${item.id}`);
    await load();
  };

  const sharePreview = (preview?: { name: string }[]) => {
    if (!preview || preview.length === 0) return 'Nenhum destinatario';
    const names = preview.slice(0, 3).map((value) => value.name);
    return preview.length > 3
      ? `${names.join(', ')} +${preview.length - 3}`
      : names.join(', ');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Notas</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperadmin
              ? 'Gestao global de notas com autoria e compartilhamentos.'
              : 'Gerencie suas notas pessoais.'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground"
          onClick={openCreate}
        >
          Nova nota
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo ou conteudo"
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
          <option value="ACTIVE">Ativas</option>
          <option value="INACTIVE">Inativas</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando notas...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhuma nota encontrada.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm"
            >
              <div className="relative h-36 bg-secondary/40">
                {item.imageUrl ? (
                  <img
                    src={resolveFileUrl(item.imageUrl)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: normalizeImagePosition(item.imagePosition),
                      transform: `scale(${item.imageScale || 1})`,
                      transformOrigin: normalizeImagePosition(item.imagePosition),
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 to-secondary/30" />
                )}
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="absolute right-3 top-3 rounded-full border border-black/5 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900"
                >
                  Abrir
                </button>
              </div>

              <div className="space-y-2 p-4">
                <p className="line-clamp-1 text-base font-semibold text-foreground">{item.title}</p>
                <p className="line-clamp-3 text-sm text-muted-foreground">{item.content}</p>
                <p className="text-xs text-muted-foreground">
                  Visibilidade: {item.visibility === 'PUBLIC' ? 'Publico' : 'Privado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                </p>
                {isSuperadmin && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Criado por: {item.createdBy?.name || item.owner?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Compartilhado com: {item.shareCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Destinatarios: {sharePreview(item.sharedWithPreview)}
                    </p>
                  </>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                    onClick={() => openEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                    onClick={() => toggleStatus(item)}
                  >
                    {item.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-destructive"
                    onClick={() => remove(item)}
                  >
                    Remover
                  </button>
                  {!isSuperadmin && (
                    <button
                      type="button"
                      className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                      onClick={() => setSharing(item)}
                    >
                      Compartilhar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar nota' : 'Nova nota'}
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
              disabled={saving || !form.title.trim() || !form.content.trim()}
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

          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Conteudo"
            className="md:col-span-2 w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
            rows={6}
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

      <AdminModal
        open={Boolean(viewing)}
        title={viewing?.title || 'Nota'}
        onClose={() => setViewing(null)}
        panelClassName="max-w-2xl"
      >
        {viewing?.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={resolveFileUrl(viewing.imageUrl)}
              alt={viewing.title}
              className="h-56 w-full object-cover"
              style={{
                objectPosition: normalizeImagePosition(viewing.imagePosition),
                transform: `scale(${viewing.imageScale || 1})`,
                transformOrigin: normalizeImagePosition(viewing.imagePosition),
              }}
            />
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm text-foreground">{viewing?.content}</p>
      </AdminModal>

      <ShareContentModal
        open={Boolean(sharing)}
        entityType="NOTE"
        entityId={sharing?.id || null}
        entityTitle={sharing?.title || 'Nota'}
        onClose={() => setSharing(null)}
        onShared={load}
      />
    </div>
  );
}
