'use client';

import { useMemo, useState } from 'react';
import { Ban, Check, Download } from 'lucide-react';
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
  categoryColor?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

const typeLabel: Record<ItemType, string> = {
  LINK: 'LINK',
  SCHEDULE: 'DOC',
  NOTE: 'NOTA',
};

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const withPercent = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${withPercent(x)} ${withPercent(y)}`;
}

function resolveFileUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

function getContrastTextColor(color: string) {
  const hex = color.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#263238';
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#263238' : '#ffffff';
}

export default function FavoritosPage() {
  const { favorites, loading } = useFavorites();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ItemType>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const items = useMemo<FavoriteItem[]>(() => {
    return favorites
      .map<FavoriteItem | null>((favorite) => {
        if (favorite.entityType === 'LINK' && favorite.link) {
          return {
            id: favorite.link.id,
            type: 'LINK',
            title: favorite.link.title,
            description: favorite.link.description || undefined,
            url: favorite.link.url,
            imageUrl: favorite.link.imageUrl,
            imagePosition: favorite.link.imagePosition,
            imageScale: favorite.link.imageScale,
            categoryName: favorite.link.category?.name,
            categoryColor: favorite.link.category?.color || null,
            status: favorite.link.status,
          };
        }

        if (favorite.entityType === 'SCHEDULE' && favorite.schedule) {
          return {
            id: favorite.schedule.id,
            type: 'SCHEDULE',
            title: favorite.schedule.title,
            fileUrl: favorite.schedule.fileUrl,
            fileName: favorite.schedule.fileName,
            imageUrl: favorite.schedule.imageUrl,
            imagePosition: favorite.schedule.imagePosition,
            imageScale: favorite.schedule.imageScale,
            categoryName: favorite.schedule.category?.name,
            categoryColor: favorite.schedule.category?.color || null,
            status: favorite.schedule.status,
          };
        }

        if (favorite.entityType === 'NOTE' && favorite.note) {
          return {
            id: favorite.note.id,
            type: 'NOTE',
            title: favorite.note.title,
            content: favorite.note.content,
            imageUrl: favorite.note.imageUrl,
            imagePosition: favorite.note.imagePosition,
            imageScale: favorite.note.imageScale,
            categoryName: favorite.note.category?.name,
            categoryColor: favorite.note.category?.color || null,
            status: favorite.note.status,
          };
        }

        return null;
      })
      .filter((item): item is FavoriteItem => item !== null);
  }, [favorites]);

  const searchedItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items
      .filter((item) => (typeFilter === 'ALL' ? true : item.type === typeFilter))
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
  }, [items, search, typeFilter]);

  const categoryTabs = useMemo(() => {
    const map = new Map<string, { count: number; color?: string | null }>();

    searchedItems.forEach((item) => {
      const name = item.categoryName || 'Sem categoria';
      const current = map.get(name);
      if (current) {
        current.count += 1;
        if (!current.color && item.categoryColor) {
          current.color = item.categoryColor;
        }
      } else {
        map.set(name, { count: 1, color: item.categoryColor || null });
      }
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, count: data.count, color: data.color || null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchedItems]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'ALL') return searchedItems;
    return searchedItems.filter((item) => (item.categoryName || 'Sem categoria') === categoryFilter);
  }, [searchedItems, categoryFilter]);

  const noteMap = useMemo(() => {
    const map = new Map<string, Note>();
    favorites.forEach((favorite) => {
      if (favorite.entityType === 'NOTE' && favorite.note) {
        map.set(favorite.note.id, favorite.note);
      }
    });
    return map;
  }, [favorites]);

  const openItem = (item: FavoriteItem) => {
    if (item.status !== 'ACTIVE') return;

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
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <p className="fac-kicker">Favoritos</p>
          <h1 className="fac-subtitle">Links, documentos e notas favoritas</h1>
          <p className="text-[15px] text-muted-foreground">
            Acesse rapidamente os itens que voce marcou como favoritos.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-[760px] lg:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="fac-input sm:col-span-2"
            placeholder="Buscar nos favoritos"
          />

          <div>
            <label className="fac-label">Tipo</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'ALL' | ItemType)}
              className="fac-select"
            >
              <option value="ALL">Todos</option>
              <option value="LINK">Links</option>
              <option value="SCHEDULE">Documentos</option>
              <option value="NOTE">Notas</option>
            </select>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          data-active={categoryFilter === 'ALL' ? 'true' : 'false'}
          className="fac-pill"
          onClick={() => setCategoryFilter('ALL')}
        >
          Todos ({searchedItems.length})
        </button>

        {categoryTabs.map((tab) => {
          const isActive = categoryFilter === tab.name;
          const textColor = tab.color ? getContrastTextColor(tab.color) : undefined;
          return (
            <button
              key={tab.name}
              type="button"
              data-active={isActive ? 'true' : 'false'}
              className="fac-pill"
              style={
                tab.color
                  ? isActive
                    ? { backgroundColor: tab.color, borderColor: tab.color, color: textColor }
                    : { borderColor: tab.color, color: tab.color }
                  : undefined
              }
              onClick={() => setCategoryFilter(tab.name)}
            >
              {tab.name} ({tab.count})
            </button>
          );
        })}
      </section>

      {loading ? (
        <div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">
          Carregando favoritos...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">
          Nenhum favorito encontrado.
        </div>
      ) : (
        <section className="flex flex-wrap gap-4">
          {filteredItems.map((item) => {
            const isInactive = item.status === 'INACTIVE';
            const imageUrl = item.imageUrl ? resolveFileUrl(item.imageUrl) : '';
            const categoryName = item.categoryName || 'Sem categoria';

            return (
              <article
                key={`${item.type}-${item.id}`}
                className={`fac-card w-[220px] ${isInactive ? 'opacity-80 grayscale' : ''}`}
              >
                <div
                  className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                  onClick={() => openItem(item)}
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !isInactive) {
                      event.preventDefault();
                      openItem(item);
                    }
                  }}
                  role="button"
                  tabIndex={isInactive ? -1 : 0}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: normalizeImagePosition(item.imagePosition),
                        transform: `scale(${item.imageScale || 1})`,
                        transformOrigin: normalizeImagePosition(item.imagePosition),
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" />
                  )}

                  <span className="absolute left-3 top-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] font-semibold text-foreground">
                    {categoryName}
                  </span>

                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <FavoriteButton entityType={item.type} entityId={item.id} />
                    {item.type === 'SCHEDULE' && item.fileUrl ? (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-foreground"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isInactive) return;
                          window.open(resolveFileUrl(item.fileUrl), '_blank', 'noopener,noreferrer');
                        }}
                        aria-label="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <span className="fac-status-badge absolute bottom-3 left-3" data-status={item.status}>
                    {item.status === 'ACTIVE' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Ban className="h-5 w-5" />
                    )}
                  </span>

                  <span className="absolute bottom-3 right-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] uppercase tracking-[0.16em] text-foreground">
                    {typeLabel[item.type]}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <AdminModal
        open={Boolean(selectedNote)}
        title={selectedNote?.title || 'Nota'}
        onClose={() => setSelectedNote(null)}
        panelClassName="max-w-3xl"
      >
        {selectedNote?.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-xl">
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
        ) : null}
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
          {selectedNote?.content}
        </p>
      </AdminModal>
    </div>
  );
}
