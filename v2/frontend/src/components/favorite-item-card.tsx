'use client';

import { Ban, Download, FileText, Link2, Share2, StickyNote } from 'lucide-react';
import { LucideIconByName } from '@/components/admin/icon-picker';
import ContentCoverImage from '@/components/content-cover-image';
import ContentTypeSurface from '@/components/content-type-surface';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { EntityType } from '@/hooks/useFavorites';
import { getContentTypeColor, getContentTypeLabel } from '@/lib/content-type';
import AdminEntityCard from '@/components/admin/entity-card';

export type FavoriteCardItem = {
  id: string;
  type: EntityType;
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
  categoryIcon?: string | null;
  sourceKind?: 'OWN' | 'SHARED' | 'OTHER';
  sharedByName?: string;
  status: 'ACTIVE' | 'INACTIVE';
};

type FavoriteItemCardProps = {
  item: FavoriteCardItem;
  onOpen?: () => void;
  onDownload?: () => void;
  detailsVariant?: 'default' | 'home';
};

const typeIcons: Record<EntityType, typeof Link2> = {
  LINK: Link2,
  SCHEDULE: FileText,
  NOTE: StickyNote,
};

const typeSecondaryText = (item: FavoriteCardItem) => {
  if (item.type === 'LINK') {
    return item.description?.trim() || item.categoryName || 'Link salvo';
  }

  if (item.type === 'SCHEDULE') {
    return item.fileName?.trim() || item.categoryName || 'Documento salvo';
  }

  const normalizedContent = item.content?.replace(/\s+/g, ' ').trim();
  return normalizedContent || item.categoryName || 'Nota salva';
};

export default function FavoriteItemCard({
  item,
  onOpen,
  onDownload,
  detailsVariant = 'default',
}: FavoriteItemCardProps) {
  const isInactive = item.status === 'INACTIVE';
  const isHomeVariant = detailsVariant === 'home';
  const categoryLabel = item.categoryName || 'Sem categoria';
  const Icon = typeIcons[item.type];
  const dividerColor = getContentTypeColor(item.type);
  const accentColor = item.categoryColor || dividerColor;
  const secondaryText = typeSecondaryText(item);
  const hasImage = Boolean(item.imageUrl);
  const sharedBadgeTitle = item.sharedByName
    ? `Compartilhado por ${item.sharedByName}`
    : 'Compartilhado com você';

  const cover = (
    <div className="absolute inset-0">
      {hasImage ? (
        <ContentCoverImage
          src={item.imageUrl}
          alt={item.title}
          position={item.imagePosition}
          scale={item.imageScale}
          width={440}
          height={320}
        />
      ) : (
        <ContentTypeSurface accentColor={accentColor} icon={Icon}>
          {item.type === 'NOTE' && item.categoryIcon ? (
            <LucideIconByName
              name={item.categoryIcon}
              size={40}
              strokeWidth={2}
              className="text-current"
              style={{ color: accentColor }}
            />
          ) : null}
        </ContentTypeSurface>
      )}

      {hasImage ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      ) : null}

      {!isHomeVariant ? (
        <>
          <span className="absolute left-3 top-3 inline-flex max-w-[124px] items-center gap-2 rounded-full border border-white/12 bg-[rgba(21,30,35,0.84)] px-3 py-1 text-[11px] font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.categoryColor || '#f3ecdf' }}
            />
            <span className="line-clamp-1">{categoryLabel}</span>
          </span>

          <span className="absolute right-3 top-3 rounded-full border border-white/12 bg-[rgba(21,30,35,0.84)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            {getContentTypeLabel(item.type)}
          </span>
        </>
      ) : null}

      {item.sourceKind === 'SHARED' ? (
        <span
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-[rgba(21,30,35,0.84)] text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm"
          title={sharedBadgeTitle}
          aria-label={sharedBadgeTitle}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}

      {isInactive ? (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/12 bg-[rgba(122,33,33,0.88)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white shadow-[0_10px_20px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
          Inativo
        </span>
      ) : null}
    </div>
  );

  const details = (
    <div>
      <p className="line-clamp-1 text-[14px] font-semibold text-foreground">{item.title}</p>
      {isHomeVariant ? (
        <>
          <p className="line-clamp-1 mt-1 text-[12px] text-muted-foreground">{categoryLabel}</p>
          <p className="line-clamp-1 mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {getContentTypeLabel(item.type)}
          </p>
        </>
      ) : (
        <p className="line-clamp-2 mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {secondaryText}
        </p>
      )}
    </div>
  );

  const trailing = (
    <div className="flex items-center gap-2">
      {item.type === 'SCHEDULE' && onDownload ? (
        <button
          type="button"
          className="fac-button-secondary !h-9 !w-9 !px-0"
          onClick={onDownload}
          aria-label={`Baixar ${item.title}`}
          title="Baixar"
          disabled={isInactive}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      <FavoriteButton
        entityType={item.type}
        entityId={item.id}
        className="!h-9 !w-9 !border !border-border/80 !bg-background/90 hover:!bg-background"
      />
    </div>
  );

  return (
    <AdminEntityCard
      cover={cover}
      details={details}
      trailing={trailing}
      onOpen={isInactive ? undefined : onOpen}
      className={isInactive ? 'opacity-80 grayscale' : undefined}
      dividerColor={dividerColor}
    />
  );
}
