'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import AdminModal from '@/components/admin/modal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { serverURL } from '@/lib/api';
import { Note } from '@/types';

type ItemType = 'LINK' | 'SCHEDULE' | 'NOTE';

type FavoriteItem = {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  categoryName?: string;
  status?: string;
};

const typeLabels: Record<ItemType, string> = {
  LINK: 'Link',
  SCHEDULE: 'Documento',
  NOTE: 'Nota',
};

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const withPercent = (value: string) =>
    value.includes('%') ? value : `${value}%`;
  return `${withPercent(x)} ${withPercent(y)}`;
}

function resolveFileUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

export default function FavoritosPage() {
  const { favorites, loading } = useFavorites();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ItemType>('ALL');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const items = useMemo<FavoriteItem[]>(() => {
    const mapped = favorites
      .map<FavoriteItem | null>((favorite) => {
        if (favorite.entityType === 'LINK' && favorite.link) {
          return {
            id: favorite.link.id,
            type: 'LINK' as const,
            title: favorite.link.title,
            description: favorite.link.description || undefined,
            url: favorite.link.url,
            imageUrl: favorite.link.imageUrl,
            imagePosition: favorite.link.imagePosition,
            imageScale: favorite.link.imageScale,
            categoryName: favorite.link.category?.name,
            status: favorite.link.status,
          };
        }

        if (favorite.entityType === 'SCHEDULE' && favorite.schedule) {
          return {
            id: favorite.schedule.id,
            type: 'SCHEDULE' as const,
            title: favorite.schedule.title,
            fileUrl: favorite.schedule.fileUrl,
            fileName: favorite.schedule.fileName,
            imageUrl: favorite.schedule.imageUrl,
            imagePosition: favorite.schedule.imagePosition,
            imageScale: favorite.schedule.imageScale,
            categoryName: favorite.schedule.category?.name,
            status: favorite.schedule.status,
          };
        }

        if (favorite.entityType === 'NOTE' && favorite.note) {
          return {
            id: favorite.note.id,
            type: 'NOTE' as const,
            title: favorite.note.title,
            content: favorite.note.content,
            imageUrl: favorite.note.imageUrl,
            imagePosition: favorite.note.imagePosition,
            imageScale: favorite.note.imageScale,
            categoryName: favorite.note.category?.name,
            status: favorite.note.status,
          };
        }

        return null;
      })
      .filter((item): item is FavoriteItem => item !== null);

    const term = search.trim().toLowerCase();

    return mapped
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
  }, [favorites, search, typeFilter]);

  const noteMap = useMemo(() => {
    const map = new Map<string, Note>();
    favorites.forEach((favorite) => {
      if (favorite.entityType === 'NOTE' && favorite.note) {
        map.set(favorite.note.id, favorite.note);
      }
    });
    return map;
  }, [favorites]);

  const counts = useMemo(() => {
    const base = { LINK: 0, SCHEDULE: 0, NOTE: 0 };
    items.forEach((item) => {
      base[item.type] += 1;
    });
    return base;
  }, [items]);

  const openItem = (item: FavoriteItem) => {
    if (item.status && item.status !== 'ACTIVE') return;

    if (item.type === 'LINK' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.type === 'SCHEDULE' && item.fileUrl) {
      window.open(resolveFileUrl(item.fileUrl), '_blank', 'noopener,noreferrer');
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
    <div className="space-y-5 motion-stagger">
      <div className="motion-item space-y-2" style={staggerStyle(1)}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Favoritos
        </p>
        <h1 className="font-display text-3xl text-foreground">Meus favoritos</h1>
        <p className="text-sm text-muted-foreground">
          Atalhos pessoais para acessar conteudos importantes sem procurar de novo.
        </p>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Use a busca para filtrar rapidamente e mantenha apenas os itens que voce realmente usa no dia a dia.
      </div>

      <div className="motion-item grid gap-2 sm:grid-cols-3" style={staggerStyle(3)}>
        <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
          Links: <span className="font-semibold text-foreground">{counts.LINK}</span>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
          Documentos: <span className="font-semibold text-foreground">{counts.SCHEDULE}</span>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
          Notas: <span className="font-semibold text-foreground">{counts.NOTE}</span>
        </div>
      </div>

      <div className="motion-item grid gap-3 sm:grid-cols-[1fr_190px]" style={staggerStyle(4)}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar nos favoritos"
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
        <div className="motion-fade rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando favoritos...
        </div>
      ) : items.length === 0 ? (
        <div className="motion-fade rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum favorito encontrado.
        </div>
      ) : (
        <div className="motion-item grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={staggerStyle(5)}>
          {items.map((item, index) => {
            const image = item.imageUrl ? resolveFileUrl(item.imageUrl) : '';
            const isInactive = item.status && item.status !== 'ACTIVE';
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
                className={`motion-item group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition ${
                  isInactive
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)]'
                }`}
                style={staggerStyle(index + 6)}
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

                  <div className="absolute bottom-3 right-3 rounded-full border border-black/5 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                    {typeLabels[item.type]}
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
