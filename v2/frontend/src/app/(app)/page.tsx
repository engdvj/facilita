'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api, { serverURL } from '@/lib/api';
import { getUserSectorIds, getUserUnitsBySector } from '@/lib/user-scope';
import AdminModal from '@/components/admin/modal';
import {
  Category,
  ContentAudience,
  Link as LinkType,
  Note,
  UploadedSchedule,
} from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import { FavoriteButton } from '@/components/FavoriteButton';

type CategoryOption = Category;
type ContentItem = {
  id: string;
  type: 'link' | 'document' | 'note';
  title: string;
  description?: string | null;
  content?: string | null;
  categoryId?: string | null;
  category?: CategoryOption | null;
  audience: ContentAudience;
  url?: string;
  imageUrl?: string | null;
  imagePosition?: string;
  imageScale?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  accentColor?: string | null;
  favoritesCount: number;
  status?: string;
};

const publicCompanyId = process.env.NEXT_PUBLIC_COMPANY_ID || '';

function HomeContent() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [documents, setDocuments] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<
    'ALL' | 'LINK' | 'DOCUMENT' | 'NOTE'
  >('ALL');
  const [filterVisibility, setFilterVisibility] = useState<
    'ALL' | 'PUBLIC' | 'RESTRICTED'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const userSectorIds = useMemo(() => getUserSectorIds(user), [user]);
  const userUnitsBySector = useMemo(() => getUserUnitsBySector(user), [user]);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  useNotifyOnChange(error);

  const getAudience = (link: LinkType): ContentAudience => {
    if (link.isPublic) return 'PUBLIC';
    if (link.audience) return link.audience;
    if (link.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const getDocumentAudience = (document: UploadedSchedule): ContentAudience => {
    if (document.isPublic) return 'PUBLIC';
    if (document.audience) return document.audience;
    if (document.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const getNoteAudience = (note: Note): ContentAudience => {
    if (note.isPublic) return 'PUBLIC';
    if (note.audience) return note.audience;
    if (note.sectorId) return 'SECTOR';
    return 'COMPANY';
  };

  const matchesTypeFilter = (type: 'link' | 'document' | 'note') => {
    if (filterType === 'ALL') return true;
    if (filterType === 'LINK') return type === 'link';
    if (filterType === 'DOCUMENT') return type === 'document';
    return type === 'note';
  };

  const matchesVisibilityFilter = (audience: ContentAudience) => {
    if (filterVisibility === 'ALL') return true;
    if (filterVisibility === 'PUBLIC') return audience === 'PUBLIC';
    return audience !== 'PUBLIC';
  };

  const isLight = (hex?: string) => {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
  };

  const getTagTextColor = (hex?: string) => {
    if (!hex) return undefined;
    return isLight(hex) ? '#1f2a2e' : '#fdf7ef';
  };

  const normalizeImagePosition = (position?: string) => {
    if (!position) return '50% 50%';
    const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
    const withPercent = (value: string) =>
      value.includes('%') ? value : `${value}%`;
    return `${withPercent(x)} ${withPercent(y)}`;
  };

  const resolveFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    return fileUrl.startsWith('http') ? fileUrl : `${serverURL}${fileUrl}`;
  };

  const downloadDocument = (fileUrl: string, fileName?: string) => {
    if (!fileUrl) return;
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    if (fileName) {
      anchor.download = fileName;
    }
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const getLinkUnitIds = (link: LinkType) =>
    link.linkUnits?.length
      ? link.linkUnits.map((unit) => unit.unitId)
      : link.unitId
        ? [link.unitId]
        : [];

  const getDocumentUnitIds = (document: UploadedSchedule) =>
    document.scheduleUnits?.length
      ? document.scheduleUnits.map((unit) => unit.unitId)
      : document.unitId
        ? [document.unitId]
        : [];

  const getNoteUnitIds = (note: Note) =>
    note.noteUnits?.length
      ? note.noteUnits.map((unit) => unit.unitId)
      : note.unitId
        ? [note.unitId]
        : [];

  const matchesUnit = (unitIds?: string[], sectorId?: string | null) => {
    if (!unitIds || unitIds.length === 0) return true;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') return true;
    if (!sectorId) return false;
    const allowedUnits = userUnitsBySector.get(sectorId);
    if (!allowedUnits || allowedUnits.size === 0) return true;
    return unitIds.some((unitId) => allowedUnits.has(unitId));
  };

  useEffect(() => {
    let active = true;
    const isLoggedIn = Boolean(user);
    const companyId = isLoggedIn
      ? isSuperAdmin
        ? undefined
        : user?.companyId
      : publicCompanyId || undefined;
    const canLoad = Boolean(publicCompanyId) || hasHydrated;

    const load = async () => {
      if (!canLoad) return;
      if (isLoggedIn && !companyId && !isSuperAdmin) {
        setError(
          'Usuario sem empresa associada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (companyId) {
          params.set('companyId', companyId);
        }
        if (!isLoggedIn) {
          params.set('isPublic', 'true');
        }
        const queryString = params.toString();
        const linksEndpoint =
          isLoggedIn && isSuperAdmin ? '/links/admin/list' : '/links';
        const documentsEndpoint =
          isLoggedIn && isSuperAdmin ? '/schedules/admin/list' : '/schedules';
        const notesEndpoint =
          isLoggedIn && isSuperAdmin ? '/notes/admin/list' : '/notes';

        console.log('[HomePage] Carregando dados:', {
          isLoggedIn,
          isSuperAdmin,
          userCompanyId: user?.companyId,
          companyId,
          queryString,
          linksEndpoint,
        });

        try {
          const linksResponse = await api.get(
            queryString ? `${linksEndpoint}?${queryString}` : linksEndpoint,
          );
          if (!active) return;
          console.log('[HomePage] Links recebidos:', linksResponse.data.length, linksResponse.data.map((l: any) => ({ title: l.title, companyId: l.companyId })));
          setLinks(linksResponse.data);
        } catch (linkError) {
          console.error('Error loading links:', linkError);
          if (!active) return;
          setLinks([]);
        }

        try {
          const documentsResponse = await api.get(
            queryString ? `${documentsEndpoint}?${queryString}` : documentsEndpoint,
          );
          if (!active) return;
          setDocuments(documentsResponse.data);
        } catch (docError) {
          console.error('Error loading documents:', docError);
          if (!active) return;
          setDocuments([]);
        }

        try {
          const notesResponse = await api.get(
            queryString ? `${notesEndpoint}?${queryString}` : notesEndpoint,
          );
          if (!active) return;
          setNotes(notesResponse.data);
        } catch (noteError) {
          console.error('Error loading notes:', noteError);
          if (!active) return;
          setNotes([]);
        }

        if (active) {
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Unexpected error:', err);
        setError('Nao foi possivel carregar o conteudo.');
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [hasHydrated, isSuperAdmin, user?.companyId]);

  // Handle highlight from notification
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight && !loading) {
      console.log('[HomePage] Highlighting item:', highlight);
      setHighlightedId(highlight);

      // Wait for content to render, then scroll to element
      setTimeout(() => {
        const element = document.querySelector(`[data-item-id="${highlight}"]`);
        console.log('[HomePage] Found element to scroll:', element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);

      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedId(null);
        // Remove highlight param from URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('highlight');
        const newQuery = newParams.toString();
        router.replace(newQuery ? `/?${newQuery}` : '/');
      }, 4500);
    }
  }, [searchParams, loading, router]);

  const visibleLinks = useMemo(() => {
    const canView = (link: LinkType) => {
      const audience = getAudience(link);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (user.role === 'SUPERADMIN') {
        return true;
      }
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') {
        return user.role === 'ADMIN';
      }
      if (audience === 'PRIVATE') {
        return isAdminUser || link.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getLinkUnitIds(link), link.sectorId)) return false;
        return link.sectorId ? userSectorIds.has(link.sectorId) : false;
      }
      if (audience === 'COMPANY') {
        return Boolean(user.companyId) && link.companyId === user.companyId;
      }
      return false;
    };

    return links.filter(canView);
  }, [links, user]);

  const visibleDocuments = useMemo(() => {
    const canView = (document: UploadedSchedule) => {
      const audience = getDocumentAudience(document);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (user.role === 'SUPERADMIN') {
        return true;
      }
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') {
        return user.role === 'ADMIN';
      }
      if (audience === 'PRIVATE') {
        return isAdminUser || document.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getDocumentUnitIds(document), document.sectorId)) return false;
        return document.sectorId ? userSectorIds.has(document.sectorId) : false;
      }
      if (audience === 'COMPANY') {
        return Boolean(user.companyId) && document.companyId === user.companyId;
      }
      return false;
    };

    return documents.filter(canView);
  }, [documents, user]);

  const visibleNotes = useMemo(() => {
    const canView = (note: Note) => {
      const audience = getNoteAudience(note);
      if (audience === 'PUBLIC') return true;
      if (!user) return false;
      if (user.role === 'SUPERADMIN') {
        return true;
      }
      if (audience === 'SUPERADMIN') return false;
      if (audience === 'ADMIN') {
        return user.role === 'ADMIN';
      }
      if (audience === 'PRIVATE') {
        return isAdminUser || note.userId === user.id;
      }
      if (audience === 'SECTOR') {
        if (user.role === 'ADMIN') return true;
        if (!matchesUnit(getNoteUnitIds(note), note.sectorId)) return false;
        return note.sectorId ? userSectorIds.has(note.sectorId) : false;
      }
      if (audience === 'COMPANY') {
        return Boolean(user.companyId) && note.companyId === user.companyId;
      }
      return false;
    };

    return notes.filter(canView);
  }, [notes, user]);

  const categories = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      if (link.category) {
        map[link.category.id] = link.category;
      }
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      if (document.category) {
        map[document.category.id] = document.category;
      }
    });
    visibleNotes.forEach((note) => {
      if (
        !matchesTypeFilter('note') ||
        !matchesVisibilityFilter(getNoteAudience(note))
      ) {
        return;
      }
      if (note.category) {
        map[note.category.id] = note.category;
      }
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [
    filterType,
    filterVisibility,
    visibleDocuments,
    visibleLinks,
    visibleNotes,
  ]);

  const visibleCategories = useMemo(() => {
    if (!user) return categories.filter((category) => !category.adminOnly);
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return categories;
    }
    return categories.filter((category) => !category.adminOnly);
  }, [categories, user]);

  const categoryMap = useMemo(() => {
    const map: Record<string, CategoryOption> = {};
    categories.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items: ContentItem[] = [];
    const canUseCategory = (category?: CategoryOption | null) => {
      if (!category) return true;
      return isAdminUser ? true : !category.adminOnly;
    };

    visibleLinks.forEach((link) => {
      const audience = getAudience(link);
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(audience)
      ) {
        return;
      }
      const category = link.categoryId
        ? categoryMap[link.categoryId] ?? link.category
        : link.category;
      if (!canUseCategory(category)) return;
      if (activeCategory !== 'all' && link.categoryId !== activeCategory) {
        return;
      }
      if (term) {
        const haystack = `${link.title} ${link.description ?? ''} ${link.url} ${
          category?.name ?? ''
        }`.toLowerCase();
        if (!haystack.includes(term)) return;
      }
      items.push({
        id: link.id,
        type: 'link',
        title: link.title,
        description: link.description,
        categoryId: link.categoryId,
        category,
        audience,
        url: link.url,
        imageUrl: link.imageUrl || null,
        imagePosition: link.imagePosition,
        imageScale: link.imageScale,
        accentColor: link.color || category?.color || null,
        favoritesCount: link._count?.favorites ?? 0,
        status: link.status,
      });
    });

    visibleDocuments.forEach((document) => {
      const audience = getDocumentAudience(document);
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(audience)
      ) {
        return;
      }
      const category = document.categoryId
        ? categoryMap[document.categoryId] ?? document.category
        : document.category;
      if (!canUseCategory(category)) return;
      if (activeCategory !== 'all' && document.categoryId !== activeCategory) {
        return;
      }
      if (term) {
        const haystack = `${document.title} ${document.fileName} ${
          category?.name ?? ''
        }`.toLowerCase();
        if (!haystack.includes(term)) return;
      }
      items.push({
        id: document.id,
        type: 'document',
        title: document.title,
        categoryId: document.categoryId,
        category,
        audience,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        imageUrl: document.imageUrl || null,
        imagePosition: document.imagePosition,
        imageScale: document.imageScale,
        accentColor: document.color || category?.color || null,
        favoritesCount: document._count?.favorites ?? 0,
        status: document.status,
      });
    });

    visibleNotes.forEach((note) => {
      const audience = getNoteAudience(note);
      if (
        !matchesTypeFilter('note') ||
        !matchesVisibilityFilter(audience)
      ) {
        return;
      }
      const category = note.categoryId
        ? categoryMap[note.categoryId] ?? note.category
        : note.category;
      if (!canUseCategory(category)) return;
      if (activeCategory !== 'all' && note.categoryId !== activeCategory) {
        return;
      }
      if (term) {
        const haystack = `${note.title} ${note.content} ${
          category?.name ?? ''
        }`.toLowerCase();
        if (!haystack.includes(term)) return;
      }
      items.push({
        id: note.id,
        type: 'note',
        title: note.title,
        content: note.content,
        categoryId: note.categoryId,
        category,
        audience,
        imageUrl: note.imageUrl || null,
        imagePosition: note.imagePosition,
        imageScale: note.imageScale,
        accentColor: note.color || category?.color || null,
        favoritesCount: 0,
        status: note.status,
      });
    });

    return items.sort((a, b) => a.title.localeCompare(b.title));
  }, [
    activeCategory,
    categoryMap,
    filterType,
    filterVisibility,
    isAdminUser,
    search,
    visibleDocuments,
    visibleLinks,
    visibleNotes,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      if (!link.categoryId) return;
      counts[link.categoryId] = (counts[link.categoryId] || 0) + 1;
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      if (!document.categoryId) return;
      counts[document.categoryId] = (counts[document.categoryId] || 0) + 1;
    });
    visibleNotes.forEach((note) => {
      if (
        !matchesTypeFilter('note') ||
        !matchesVisibilityFilter(getNoteAudience(note))
      ) {
        return;
      }
      if (!note.categoryId) return;
      counts[note.categoryId] = (counts[note.categoryId] || 0) + 1;
    });
    return counts;
  }, [filterType, filterVisibility, visibleDocuments, visibleLinks, visibleNotes]);

  const favoriteItems = useMemo(() => {
    return filteredItems
      .filter((item) => item.favoritesCount > 0)
      .sort((a, b) => {
        const diff = b.favoritesCount - a.favoritesCount;
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      })
      .slice(0, 8);
  }, [filteredItems]);

  const totalVisibleItems = useMemo(() => {
    const canUseCategory = (category?: CategoryOption | null) => {
      if (!category) return true;
      return isAdminUser ? true : !category.adminOnly;
    };
    let count = 0;
    visibleLinks.forEach((link) => {
      if (
        !matchesTypeFilter('link') ||
        !matchesVisibilityFilter(getAudience(link))
      ) {
        return;
      }
      const category = link.categoryId
        ? categoryMap[link.categoryId] ?? link.category
        : link.category;
      if (!canUseCategory(category)) return;
      count += 1;
    });
    visibleDocuments.forEach((document) => {
      if (
        !matchesTypeFilter('document') ||
        !matchesVisibilityFilter(getDocumentAudience(document))
      ) {
        return;
      }
      const category = document.categoryId
        ? categoryMap[document.categoryId] ?? document.category
        : document.category;
      if (!canUseCategory(category)) return;
      count += 1;
    });
    visibleNotes.forEach((note) => {
      if (
        !matchesTypeFilter('note') ||
        !matchesVisibilityFilter(getNoteAudience(note))
      ) {
        return;
      }
      const category = note.categoryId
        ? categoryMap[note.categoryId] ?? note.category
        : note.category;
      if (!canUseCategory(category)) return;
      count += 1;
    });
    return count;
  }, [
    categoryMap,
    filterType,
    filterVisibility,
    isAdminUser,
    visibleDocuments,
    visibleLinks,
    visibleNotes,
  ]);

  const renderItemCard = (item: ContentItem, index?: number) => {
    const motionStyle =
      typeof index === 'number' ? staggerStyle(index) : undefined;
    const isInactive = item.status?.toUpperCase() !== 'ACTIVE';
    const itemId = `${item.type}-${item.id}`;
    const isHighlighted = highlightedId === itemId;
    const titleBadge = (
      <div
        className="absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] truncate rounded-[12px] border border-black/5 bg-white/95 px-2 py-1 text-[11px] font-semibold text-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.08)] sm:py-1.5 sm:text-[13px]"
        title={item.title}
      >
        {item.title}
      </div>
    );
    const topFade = (
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 via-black/12 to-transparent sm:h-16" />
    );
    const bottomFade = (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 via-black/12 to-transparent sm:h-16" />
    );
    const typeLabel =
      item.type === 'link' ? 'LINK' : item.type === 'document' ? 'DOC' : 'NOTA';
    const typeBadge = (
      <div className="absolute bottom-3 right-3 z-10 rounded-[10px] border border-black/5 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111] shadow-[0_2px_5px_rgba(0,0,0,0.06)] sm:py-1.5 sm:text-[12px]">
        {typeLabel}
      </div>
    );
    const statusBadge = (
      <div
        className={`absolute bottom-3 left-3 z-10 flex items-center justify-center rounded-full border-2 p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.15)] sm:p-2 ${
          isInactive
            ? 'border-red-400 bg-red-500 text-white'
            : 'border-green-400 bg-green-500 text-white'
        }`}
      >
        {isInactive ? (
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
    );

    if (item.type === 'note') {
      const imageUrl = item.imageUrl
        ? item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${serverURL}${item.imageUrl}`
        : null;
      const note = visibleNotes.find((n) => n.id === item.id);
      return (
        <article
          key={`${item.type}-${item.id}`}
          data-item-id={itemId}
          role="button"
          tabIndex={isInactive ? -1 : 0}
          onClick={isInactive ? undefined : () => note && setSelectedNote(note)}
          onKeyDown={isInactive ? undefined : (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && note) {
              e.preventDefault();
              setSelectedNote(note);
            }
          }}
          className={`motion-item group flex flex-col overflow-hidden rounded-lg bg-card/95 ring-1 ring-black/5 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 h-40 sm:h-48 ${isInactive ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${isHighlighted ? 'animate-[pulse_1.5s_ease-in-out_3] ring-4 ring-primary shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_18px_36px_rgba(16,44,50,0.24)] scale-105' : ''}`}
          style={motionStyle}
        >
          <div className="relative h-full w-full shrink-0 overflow-hidden bg-secondary/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125 contrast-110 saturate-110 ${isInactive ? 'grayscale opacity-60' : ''}`}
                style={{
                  objectPosition: normalizeImagePosition(item.imagePosition),
                  transform: `scale(${item.imageScale || 1})`,
                  transformOrigin: normalizeImagePosition(item.imagePosition),
                }}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 ${isInactive ? 'grayscale opacity-60' : ''}`} />
            )}
            {topFade}
            {bottomFade}
            {titleBadge}
            {user && statusBadge}
            {typeBadge}
            {user && (
              <div className="absolute right-3 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  entityType="NOTE"
                  entityId={item.id}
                />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
          </div>
        </article>
      );
    }

    if (item.type === 'link') {
      const imageUrl = item.imageUrl
        ? item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${serverURL}${item.imageUrl}`
        : null;
      return (
        <a
          key={`${item.type}-${item.id}`}
          data-item-id={itemId}
          href={isInactive ? undefined : item.url}
          target={isInactive ? undefined : "_blank"}
          rel={isInactive ? undefined : "noopener noreferrer"}
          onClick={isInactive ? (e) => e.preventDefault() : undefined}
          className={`motion-item group flex flex-col overflow-hidden rounded-lg bg-card/95 ring-1 ring-black/5 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 h-40 sm:h-48 ${isInactive ? 'cursor-not-allowed pointer-events-none' : ''} ${isHighlighted ? 'animate-[pulse_1.5s_ease-in-out_3] ring-4 ring-primary shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_18px_36px_rgba(16,44,50,0.24)] scale-105' : ''}`}
          style={motionStyle}
        >
          <div className="relative h-full w-full shrink-0 overflow-hidden bg-secondary/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125 contrast-110 saturate-110 ${isInactive ? 'grayscale opacity-60' : ''}`}
                style={{
                  objectPosition: normalizeImagePosition(item.imagePosition),
                  transform: `scale(${item.imageScale || 1})`,
                  transformOrigin: normalizeImagePosition(item.imagePosition),
                }}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 ${isInactive ? 'grayscale opacity-60' : ''}`} />
            )}
            {topFade}
            {bottomFade}
            {titleBadge}
            {user && statusBadge}
            {typeBadge}
            {user && (
              <div className="absolute right-3 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  entityType="LINK"
                  entityId={item.id}
                />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
          </div>
        </a>
      );
    }

    const resolvedFileUrl = resolveFileUrl(item.fileUrl);
    const fileUrl = resolvedFileUrl || '#';
    const imageUrl = item.imageUrl
      ? item.imageUrl.startsWith('http')
        ? item.imageUrl
        : `${serverURL}${item.imageUrl}`
      : null;
    return (
      <a
        key={`${item.type}-${item.id}`}
        data-item-id={itemId}
        href={isInactive ? undefined : fileUrl}
        target={isInactive ? undefined : "_blank"}
        rel={isInactive ? undefined : "noopener noreferrer"}
        onClick={isInactive ? (e) => e.preventDefault() : undefined}
        className={`motion-item group flex flex-col overflow-hidden rounded-lg bg-card/95 ring-1 ring-black/5 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 h-40 sm:h-48 ${isInactive ? 'cursor-not-allowed pointer-events-none' : ''} ${isHighlighted ? 'animate-[pulse_1.5s_ease-in-out_3] ring-4 ring-primary shadow-[0_0_0_4px_rgba(59,130,246,0.3),0_18px_36px_rgba(16,44,50,0.24)] scale-105' : ''}`}
        style={motionStyle}
      >
        <div className="relative h-full w-full shrink-0 overflow-hidden bg-secondary/60">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:contrast-125 group-hover:saturate-125 contrast-110 saturate-110 ${isInactive ? 'grayscale opacity-60' : ''}`}
              style={{
                objectPosition: normalizeImagePosition(item.imagePosition),
                transform: `scale(${item.imageScale || 1})`,
                transformOrigin: normalizeImagePosition(item.imagePosition),
              }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/40 ${isInactive ? 'grayscale opacity-60' : ''}`} />
          )}
          {topFade}
          {bottomFade}
          {titleBadge}
          {user && statusBadge}
          {typeBadge}
          {(user || (!isInactive && resolvedFileUrl)) && (
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
              {user && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton
                    entityType="SCHEDULE"
                    entityId={item.id}
                  />
                </div>
              )}
              {!isInactive && resolvedFileUrl && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    downloadDocument(resolvedFileUrl, item.fileName);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white/95 text-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                  title="Baixar arquivo"
                  aria-label="Baixar arquivo"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
        </div>
      </a>
    );
  };

  return (
    <>
      <div
        className="motion-item flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        style={staggerStyle(1)}
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Inicio
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            Links, documentos e notas do portal
          </h1>
          <p className="text-[13px] sm:text-sm text-muted-foreground">
            Encontre rapidamente documentos, sistemas, atalhos e notas.
          </p>
        </div>

        <div className="w-full sm:max-w-[360px] space-y-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar link, documento ou nota"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[13px] text-foreground sm:px-4 sm:text-sm"
          />
          <div className={user ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-2'}>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(event) => {
                  setFilterType(
                    event.target.value as 'ALL' | 'LINK' | 'DOCUMENT' | 'NOTE',
                  );
                  setActiveCategory('all');
                }}
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[11px] text-foreground sm:text-xs"
              >
                <option value="ALL">Todos</option>
                <option value="LINK">Links</option>
                <option value="DOCUMENT">Documentos</option>
                <option value="NOTE">Notas</option>
              </select>
            </div>
            {user && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Visibilidade
                </label>
                <select
                  value={filterVisibility}
                  onChange={(event) => {
                    setFilterVisibility(
                      event.target.value as 'ALL' | 'PUBLIC' | 'RESTRICTED',
                    );
                    setActiveCategory('all');
                  }}
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[11px] text-foreground sm:text-xs"
                >
                  <option value="ALL">Todas</option>
                  <option value="PUBLIC">Publicos</option>
                  <option value="RESTRICTED">Restritos</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="motion-item flex flex-wrap gap-2" style={staggerStyle(2)}>
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`motion-press rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.22em] ${
            activeCategory === 'all'
              ? 'border-transparent bg-foreground text-background'
              : 'border-border/70 bg-card/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
          }`}
        >
          Todos ({totalVisibleItems})
        </button>
        {visibleCategories.map((category) => {
          const active = activeCategory === category.id;
          const activeStyle =
            active && category.color
              ? {
                  backgroundColor: category.color,
                  color: getTagTextColor(category.color),
                }
              : undefined;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`motion-press rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.22em] ${
                active
                  ? 'border-transparent bg-foreground text-background'
                  : 'border-border/70 bg-card/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              }`}
              style={activeStyle}
            >
              {category.name} ({categoryCounts[category.id] || 0})
            </button>
          );
        })}
      </div>


      {loading ? (
        <div className="motion-fade rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
          Carregando conteudo...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="motion-fade rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
          Nenhum item encontrado.
        </div>
      ) : (
        <div className="motion-item grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, index) =>
            renderItemCard(item, index + 1),
          )}
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
              <div className="relative h-48 w-full overflow-hidden bg-secondary/60 sm:h-64">
                <img
                  src={
                    selectedNote.imageUrl.startsWith('http')
                      ? selectedNote.imageUrl
                      : `${serverURL}${selectedNote.imageUrl}`
                  }
                  alt={selectedNote.title}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: normalizeImagePosition(selectedNote.imagePosition),
                    transform: `scale(${selectedNote.imageScale || 1})`,
                    transformOrigin: normalizeImagePosition(selectedNote.imagePosition),
                  }}
                />
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {selectedNote.content}
              </p>
            </div>
            {selectedNote.category && (
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Categoria:</span>
                <span
                  className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: selectedNote.category.color,
                    borderColor: selectedNote.category.color,
                    color: getTagTextColor(selectedNote.category.color),
                  }}
                >
                  {selectedNote.category.name}
                </span>
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="motion-fade rounded-2xl border border-border/70 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
          Carregando conteudo...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
