'use client';

import { useEffect, useMemo, useState } from 'react';
import { Ban, Check, Download } from 'lucide-react';
import AdminModal from '@/components/admin/modal';
import { FavoriteButton } from '@/components/FavoriteButton';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { Link as LinkEntity, Note, UploadedSchedule } from '@/types';

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
  categoryColor?: string | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  visibility: 'PRIVATE' | 'PUBLIC';
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
  const format = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${format(x)} ${format(y)}`;
}

function resolveFileUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  const payload = error as { response?: { data?: { message?: unknown } } };
  const message = payload.response?.data?.message;
  return typeof message === 'string' ? message : fallback;
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

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  const [links, setLinks] = useState<LinkEntity[]>([]);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [typeFilter, setTypeFilter] = useState<'ALL' | ItemType>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpointLinks = isSuperadmin ? '/links/admin/list' : '/links';
        const endpointSchedules = isSuperadmin ? '/schedules/admin/list' : '/schedules';
        const endpointNotes = isSuperadmin ? '/notes/admin/list' : '/notes';

        const params = user ? { includeInactive: true } : undefined;

        const [linksRes, schedulesRes, notesRes] = await Promise.all([
          api.get(endpointLinks, { params }),
          api.get(endpointSchedules, { params }),
          api.get(endpointNotes, { params }),
        ]);

        if (!active) return;

        setLinks(Array.isArray(linksRes.data) ? linksRes.data : []);
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      } catch (err: unknown) {
        if (!active) return;
        setError(getErrorMessage(err, 'Nao foi possivel carregar os itens.'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isSuperadmin, user]);

  const mappedItems = useMemo<HomeItem[]>(() => {
    const mappedLinks: HomeItem[] = links.map((link) => ({
      id: link.id,
      type: 'LINK',
      title: link.title,
      description: link.description || undefined,
      url: link.url,
      categoryName: link.category?.name,
      categoryColor: link.category?.color || null,
      imageUrl: link.imageUrl,
      imagePosition: link.imagePosition,
      imageScale: link.imageScale,
      visibility: link.visibility,
      status: link.status,
    }));

    const mappedSchedules: HomeItem[] = schedules.map((item) => ({
      id: item.id,
      type: 'SCHEDULE',
      title: item.title,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      categoryName: item.category?.name,
      categoryColor: item.category?.color || null,
      imageUrl: item.imageUrl,
      imagePosition: item.imagePosition,
      imageScale: item.imageScale,
      visibility: item.visibility,
      status: item.status,
    }));

    const mappedNotes: HomeItem[] = notes.map((note) => ({
      id: note.id,
      type: 'NOTE',
      title: note.title,
      content: note.content,
      categoryName: note.category?.name,
      categoryColor: note.category?.color || null,
      imageUrl: note.imageUrl,
      imagePosition: note.imagePosition,
      imageScale: note.imageScale,
      visibility: note.visibility,
      status: note.status,
    }));

    return [...mappedLinks, ...mappedSchedules, ...mappedNotes].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [links, notes, schedules]);

  const searchedItems = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return mappedItems
      .filter((item) => (typeFilter === 'ALL' ? true : item.type === typeFilter))
      .filter((item) => (visibilityFilter === 'ALL' ? true : item.visibility === visibilityFilter))
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
      });
  }, [mappedItems, globalSearch, typeFilter, visibilityFilter]);

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

  const noteMap = useMemo(() => new Map(notes.map((note) => [note.id, note])), [notes]);

  const openItem = (item: HomeItem) => {
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
          <p className="fac-kicker">Inicio</p>
          <h1 className="fac-subtitle">Links, documentos e notas do portal</h1>
          <p className="text-[15px] text-muted-foreground">
            Encontre rapidamente documentos, sistemas, atalhos e notas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div>
            <label className="fac-label">Tipo</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'ALL' | ItemType)}
              className="fac-select !w-auto"
            >
              <option value="ALL">Todos</option>
              <option value="LINK">Links</option>
              <option value="SCHEDULE">Documentos</option>
              <option value="NOTE">Notas</option>
            </select>
          </div>

          <div>
            <label className="fac-label">Visibilidade</label>
            <select
              value={visibilityFilter}
              onChange={(event) =>
                setVisibilityFilter(event.target.value as 'ALL' | 'PUBLIC' | 'PRIVATE')
              }
              className="fac-select !w-auto"
            >
              <option value="ALL">Todas</option>
              <option value="PUBLIC">Publicas</option>
              <option value="PRIVATE">Restritas</option>
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
          Carregando itens...
        </div>
      ) : error ? (
        <div className="fac-panel border-red-400 bg-red-50 px-6 py-4 text-[14px] text-red-700">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">
          Nenhum item encontrado.
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

