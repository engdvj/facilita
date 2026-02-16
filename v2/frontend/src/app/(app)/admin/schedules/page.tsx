'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import ShareContentModal from '@/components/admin/share-content-modal';
import { formatBytes } from '@/lib/format';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Category, ContentVisibility, UploadedSchedule } from '@/types';

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

export default function SchedulesPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<UploadedSchedule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UploadedSchedule | null>(null);
  const [sharing, setSharing] = useState<UploadedSchedule | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get(isSuperadmin ? '/schedules/admin/list' : '/schedules', {
          params: { includeInactive: true },
        }),
        api.get('/categories'),
      ]);

      const raw = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const scoped = isSuperadmin
        ? raw
        : raw.filter((item: UploadedSchedule) => item.ownerId === user?.id);

      setItems(scoped);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar documentos.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar documentos.');
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
        return `${item.title} ${item.fileName}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
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
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim() || !form.fileUrl) return;
    setSaving(true);

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

    try {
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

  const toggleStatus = async (item: UploadedSchedule) => {
    await api.patch(`/schedules/${item.id}`, {
      status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    await load();
  };

  const remove = async (item: UploadedSchedule) => {
    if (!window.confirm(`Remover documento ${item.title}?`)) return;
    await api.delete(`/schedules/${item.id}`);
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
    <div className="space-y-5 motion-stagger">
      <div
        className="motion-item flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        style={staggerStyle(1)}
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperadmin
              ? 'Gestao global de documentos com autoria e compartilhamentos.'
              : 'Gerencie seus documentos pessoais.'}
          </p>
        </div>
        <button
          type="button"
          className="motion-press rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground"
          onClick={openCreate}
        >
          Novo documento
        </button>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Suba o arquivo primeiro e confirme nome/tamanho antes de salvar. Capa e visibilidade ajudam na descoberta.
      </div>

      <div className="motion-item grid gap-3 sm:grid-cols-[1fr_180px]" style={staggerStyle(3)}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo ou arquivo"
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
          Carregando documentos...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum documento encontrado.
        </div>
      ) : (
        <div className="motion-item grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={staggerStyle(4)}>
          {filtered.map((item, index) => (
            <article
              key={item.id}
              className="motion-item overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)]"
              style={staggerStyle(index + 5)}
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
                <a
                  href={resolveFileUrl(item.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-3 rounded-full border border-black/5 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900"
                >
                  Abrir
                </a>
              </div>

              <div className="space-y-2 p-4">
                <p className="line-clamp-1 text-base font-semibold text-foreground">{item.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                <p className="text-xs text-muted-foreground">
                  Visibilidade: {item.visibility === 'PUBLIC' ? 'Publico' : 'Privado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
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
        title={editing ? 'Editar documento' : 'Novo documento'}
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
              disabled={saving || !form.title.trim() || !form.fileUrl}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Fluxo recomendado: titulo, categoria, upload do arquivo e depois ajustes de visibilidade/imagem.
          </p>
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

          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Arquivo
            </label>
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadDocument(file);
                }
              }}
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
            />
            {uploading && <p className="text-xs text-muted-foreground">Enviando arquivo...</p>}
            {form.fileName && (
              <p className="text-xs text-muted-foreground">
                Selecionado: {form.fileName} ({formatBytes(form.fileSize)})
              </p>
            )}
          </div>

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
        </div>
      </AdminModal>

      <ShareContentModal
        open={Boolean(sharing)}
        entityType="SCHEDULE"
        entityId={sharing?.id || null}
        entityTitle={sharing?.title || 'Documento'}
        onClose={() => setSharing(null)}
        onShared={load}
      />
    </div>
  );
}
