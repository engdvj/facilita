'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminModal from '@/components/admin/modal';
import { FavoriteButton } from '@/components/FavoriteButton';
import api, { serverURL } from '@/lib/api';
import { Link, Note, UploadedSchedule } from '@/types';

type ItemType = 'LINK' | 'SCHEDULE' | 'NOTE';

type HomeItem = {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  categoryName?: string;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  status: string;
};

const typeLabels: Record<ItemType, string> = {
  LINK: 'Link',
  SCHEDULE: 'Documento',
  NOTE: 'Nota',
};

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const format = (value: string) =>
    value.includes('%') ? value : `${value}%`;
  return `${format(x)} ${format(y)}`;
}

function resolveFileUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ItemType>('ALL');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [linksRes, schedulesRes, notesRes] = await Promise.all([
          api.get('/links'),
          api.get('/schedules'),
          api.get('/notes'),
        ]);

        if (!active) return;
        setLinks(Array.isArray(linksRes.data) ? linksRes.data : []);
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      } catch (err: any) {
        if (!active) return;
        const message =
          err?.response?.data?.message || 'Nao foi possivel carregar o conteudo.';
        setError(typeof message === 'string' ? message : 'Erro ao carregar conteudo.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo<HomeItem[]>(() => {
    const mappedLinks: HomeItem[] = links.map((link) => ({
      id: link.id,
      type: 'LINK' as const,
      title: link.title,
      description: link.description || undefined,
      url: link.url,
      categoryName: link.category?.name,
      imageUrl: link.imageUrl,
      imagePosition: link.imagePosition,
      imageScale: link.imageScale,
      visibility: link.visibility,
      status: link.status,
    }));

    const mappedSchedules: HomeItem[] = schedules.map((schedule) => ({
      id: schedule.id,
      type: 'SCHEDULE' as const,
      title: schedule.title,
      fileUrl: schedule.fileUrl,
      fileName: schedule.fileName,
      categoryName: schedule.category?.name,
      imageUrl: schedule.imageUrl,
      imagePosition: schedule.imagePosition,
      imageScale: schedule.imageScale,
      visibility: schedule.visibility,
      status: schedule.status,
    }));

    const mappedNotes: HomeItem[] = notes.map((note) => ({
      id: note.id,
      type: 'NOTE' as const,
      title: note.title,
      content: note.content,
      categoryName: note.category?.name,
      imageUrl: note.imageUrl,
      imagePosition: note.imagePosition,
      imageScale: note.imageScale,
      visibility: note.visibility,
      status: note.status,
    }));

    const term = search.trim().toLowerCase();

    return [...mappedLinks, ...mappedSchedules, ...mappedNotes]
      .filter((item) => typeFilter === 'ALL' || item.type === typeFilter)
      .filter((item) => {
        if (!term) return true;
        const haystack = [
          item.title,
          item.description,
          item.content,
          item.categoryName,
          item.fileName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [links, notes, schedules, search, typeFilter]);

  const noteMap = useMemo(
    () => new Map(notes.map((note) => [note.id, note])),
    [notes],
  );

  const openItem = (item: HomeItem) => {
    if (item.status !== 'ACTIVE') return;

    if (item.type === 'LINK' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.type === 'SCHEDULE' && item.fileUrl) {
      const url = resolveFileUrl(item.fileUrl);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.type === 'NOTE') {
      const note = noteMap.get(item.id);
      if (note) {
        setSelectedNote(note);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Inicio
        </p>
        <h1 className="font-display text-3xl text-foreground">
          Seus links, documentos e notas
        </h1>
        <p className="text-sm text-muted-foreground">
          Conteudos proprios e publicos, sem itens compartilhados nesta tela.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo, categoria ou descricao"
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
        />
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as 'ALL' | ItemType)
          }
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
        >
          <option value="ALL">Todos os tipos</option>
          <option value="LINK">Links</option>
          <option value="SCHEDULE">Documentos</option>
          <option value="NOTE">Notas</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando conteudo...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum item encontrado.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const image = item.imageUrl ? resolveFileUrl(item.imageUrl) : '';
            const isInactive = item.status !== 'ACTIVE';
            return (
              <article
                key={`${item.type}-${item.id}`}
                role="button"
                tabIndex={isInactive ? -1 : 0}
                onClick={() => openItem(item)}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && !isInactive) {
                    event.preventDefault();
                    openItem(item);
                  }
                }}
                className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition ${
                  isInactive
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden bg-secondary/50">
                  {image ? (
                    <img
                      src={image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{
                        objectPosition: normalizeImagePosition(item.imagePosition),
                        transform: `scale(${item.imageScale || 1})`,
                        transformOrigin: normalizeImagePosition(item.imagePosition),
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/30" />
                  )}

                  <div className="absolute left-3 top-3 rounded-xl border border-black/5 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                    {item.title}
                  </div>

                  <div className="absolute right-3 top-3">
                    <FavoriteButton entityType={item.type} entityId={item.id} />
                  </div>

                  <div className="absolute bottom-3 left-3 rounded-full border border-black/5 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                    {typeLabels[item.type]}
                  </div>

                  <div className="absolute bottom-3 right-3 rounded-full border border-black/5 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                    {item.visibility === 'PUBLIC' ? 'Publico' : 'Privado'}
                  </div>
                </div>

                <div className="space-y-1 px-4 py-3">
                  {item.categoryName ? (
                    <p className="text-xs text-muted-foreground">
                      Categoria: {item.categoryName}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem categoria</p>
                  )}
                  {item.type === 'SCHEDULE' && item.fileName && (
                    <p className="text-xs text-muted-foreground">Arquivo: {item.fileName}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedNote && (
        <AdminModal
          open={Boolean(selectedNote)}
          title={selectedNote.title}
          onClose={() => setSelectedNote(null)}
          panelClassName="max-w-2xl"
        >
          {selectedNote.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={resolveFileUrl(selectedNote.imageUrl)}
                alt={selectedNote.title}
                className="h-56 w-full object-cover"
                style={{
                  objectPosition: normalizeImagePosition(selectedNote.imagePosition),
                  transform: `scale(${selectedNote.imageScale || 1})`,
                  transformOrigin: normalizeImagePosition(selectedNote.imagePosition),
                }}
              />
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {selectedNote.content}
          </p>
        </AdminModal>
      )}
    </div>
  );
}
