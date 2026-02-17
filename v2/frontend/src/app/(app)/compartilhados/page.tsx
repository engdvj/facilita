'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Check, Download } from 'lucide-react';
import AdminModal from '@/components/admin/modal';
import { FavoriteButton } from '@/components/FavoriteButton';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Share } from '@/types';

type ShareStatus = 'ACTIVE' | 'INACTIVE';

const typeLabel: Record<Share['entityType'], string> = {
  LINK: 'LINK',
  SCHEDULE: 'DOC',
  NOTE: 'NOTA',
};

function getShareTitle(share: Share) {
  if (share.entityType === 'LINK') return share.link?.title || 'Link';
  if (share.entityType === 'SCHEDULE') return share.schedule?.title || 'Documento';
  return share.note?.title || 'Nota';
}

function getShareCategory(share: Share) {
  if (share.entityType === 'LINK') return share.link?.category?.name;
  if (share.entityType === 'SCHEDULE') return share.schedule?.category?.name;
  return share.note?.category?.name;
}

function getShareCategoryColor(share: Share) {
  if (share.entityType === 'LINK') return share.link?.category?.color || null;
  if (share.entityType === 'SCHEDULE') return share.schedule?.category?.color || null;
  return share.note?.category?.color || null;
}

function getShareOwner(share: Share) {
  return share.owner?.name || 'Usuario';
}

function getShareStatus(share: Share): ShareStatus {
  if (share.entityType === 'LINK') return share.link?.status || 'ACTIVE';
  if (share.entityType === 'SCHEDULE') return share.schedule?.status || 'ACTIVE';
  return share.note?.status || 'ACTIVE';
}

function getShareImage(share: Share) {
  if (share.entityType === 'LINK') return share.link?.imageUrl || null;
  if (share.entityType === 'SCHEDULE') return share.schedule?.imageUrl || null;
  return share.note?.imageUrl || null;
}

function getShareImagePosition(share: Share) {
  if (share.entityType === 'LINK') return share.link?.imagePosition;
  if (share.entityType === 'SCHEDULE') return share.schedule?.imagePosition;
  return share.note?.imagePosition;
}

function getShareImageScale(share: Share) {
  if (share.entityType === 'LINK') return share.link?.imageScale;
  if (share.entityType === 'SCHEDULE') return share.schedule?.imageScale;
  return share.note?.imageScale;
}

function getShareEntityId(share: Share) {
  if (share.entityType === 'LINK') return share.link?.id;
  if (share.entityType === 'SCHEDULE') return share.schedule?.id;
  return share.note?.id;
}

function resolveFileUrl(path?: string | null) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${serverURL}${path}`;
}

function normalizeImagePosition(position?: string | null) {
  if (!position) return '50% 50%';
  const [x = '50%', y = '50%'] = position.trim().split(/\s+/);
  const ensurePercent = (value: string) => (value.includes('%') ? value : `${value}%`);
  return `${ensurePercent(x)} ${ensurePercent(y)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  const payload = error as { response?: { data?: { message?: unknown } } };
  const message = payload.response?.data?.message;
  return typeof message === 'string' ? message : fallback;
}

export default function CompartilhadosPage() {
  const user = useAuthStore((state) => state.user);

  const [received, setReceived] = useState<Share[]>([]);
  const [sent, setSent] = useState<Share[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Share['note'] | null>(null);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = useCallback(async () => {
    if (!user || isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [receivedRes, sentRes, categoriesRes] = await Promise.all([
        api.get('/shares/received'),
        api.get('/shares/sent'),
        api.get('/categories'),
      ]);

      setReceived(Array.isArray(receivedRes.data) ? receivedRes.data : []);
      setSent(Array.isArray(sentRes.data) ? sentRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Nao foi possivel carregar os compartilhamentos.'));
    } finally {
      setLoading(false);
    }
  }, [isSuperadmin, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const localCategories = useMemo(
    () => categories.filter((category) => category.status === 'ACTIVE'),
    [categories],
  );

  const removeReceived = async (shareId: string) => {
    setProcessingId(shareId);
    try {
      await api.delete(`/shares/${shareId}/remove`);
      setReceived((prev) => prev.filter((share) => share.id !== shareId));
    } finally {
      setProcessingId(null);
    }
  };

  const revokeSent = async (shareId: string) => {
    setProcessingId(shareId);
    try {
      await api.delete(`/shares/${shareId}/revoke`);
      setSent((prev) => prev.filter((share) => share.id !== shareId));
    } finally {
      setProcessingId(null);
    }
  };

  const updateLocalCategory = async (shareId: string, categoryId: string) => {
    setProcessingId(shareId);
    try {
      await api.patch(`/shares/${shareId}/local-category`, {
        categoryId: categoryId || null,
      });
      setReceived((prev) =>
        prev.map((share) =>
          share.id === shareId
            ? {
                ...share,
                localCategoryId: categoryId || null,
                localCategory: categoryId
                  ? localCategories.find((category) => category.id === categoryId)
                  : null,
              }
            : share,
        ),
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openShare = (share: Share) => {
    if (getShareStatus(share) !== 'ACTIVE') return;

    if (share.entityType === 'LINK' && share.link?.url) {
      window.open(share.link.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (share.entityType === 'SCHEDULE' && share.schedule?.fileUrl) {
      window.open(resolveFileUrl(share.schedule.fileUrl), '_blank', 'noopener,noreferrer');
      return;
    }

    if (share.entityType === 'NOTE' && share.note) {
      setViewingNote(share.note);
    }
  };

  const hasOpenAction = (share: Share) => {
    if (share.entityType === 'LINK') return Boolean(share.link?.url);
    if (share.entityType === 'SCHEDULE') return Boolean(share.schedule?.fileUrl);
    return Boolean(share.note);
  };

  const sentStatusLabel = (share: Share) =>
    share.removedAt ? 'Removido pelo destinatario' : 'Ativo';

  if (isSuperadmin) {
    return (
      <div className="fac-page">
        <section className="space-y-2">
          <p className="fac-kicker">Compartilhados</p>
          <h1 className="fac-subtitle">Fluxo de compartilhamento</h1>
          <p className="text-[15px] text-muted-foreground">
            Superadmin nao participa do fluxo de compartilhamento.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="fac-page">
      <section className="space-y-2">
        <p className="fac-kicker">Compartilhados</p>
        <h1 className="fac-subtitle">Recebidos e enviados</h1>
        <p className="text-[15px] text-muted-foreground">
          Organize itens compartilhados sem alterar o conteudo original.
        </p>
      </section>

      {loading ? (
        <div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">
          Carregando compartilhamentos...
        </div>
      ) : error ? (
        <div className="fac-panel border-red-400 bg-red-50 px-6 py-4 text-[14px] text-red-700">{error}</div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold text-foreground">Recebidos ({received.length})</h2>
            {received.length === 0 ? (
              <div className="fac-panel px-6 py-8 text-[14px] text-muted-foreground">
                Nenhum item recebido.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {received.map((share) => {
                  const shareStatus = getShareStatus(share);
                  const isInactive = shareStatus === 'INACTIVE';
                  const imageUrl = getShareImage(share) ? resolveFileUrl(getShareImage(share)) : '';
                  const categoryName = getShareCategory(share) || 'Sem categoria';
                  const categoryColor = getShareCategoryColor(share);
                  const entityId = getShareEntityId(share);

                  return (
                    <article
                      key={share.id}
                      className={`fac-card w-[240px] ${isInactive ? 'opacity-80 grayscale' : ''}`}
                    >
                      <div
                        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                        onClick={() => openShare(share)}
                        onKeyDown={(event) => {
                          if ((event.key === 'Enter' || event.key === ' ') && !isInactive) {
                            event.preventDefault();
                            openShare(share);
                          }
                        }}
                        role="button"
                        tabIndex={isInactive ? -1 : 0}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={getShareTitle(share)}
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition: normalizeImagePosition(getShareImagePosition(share)),
                              transform: `scale(${getShareImageScale(share) || 1})`,
                              transformOrigin: normalizeImagePosition(getShareImagePosition(share)),
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" />
                        )}

                        <span
                          className="absolute left-3 top-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] font-semibold text-foreground"
                          style={categoryColor ? { borderColor: categoryColor, color: categoryColor } : undefined}
                        >
                          {categoryName}
                        </span>

                        <div className="absolute right-3 top-3 flex items-center gap-2">
                          {entityId ? <FavoriteButton entityType={share.entityType} entityId={entityId} /> : null}
                          {share.entityType === 'SCHEDULE' && share.schedule?.fileUrl ? (
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-foreground"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (isInactive) return;
                                window.open(resolveFileUrl(share.schedule?.fileUrl), '_blank', 'noopener,noreferrer');
                              }}
                              aria-label="Baixar documento"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>

                        <span className="fac-status-badge absolute bottom-3 left-3" data-status={shareStatus}>
                          {shareStatus === 'ACTIVE' ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Ban className="h-5 w-5" />
                          )}
                        </span>

                        <span className="absolute bottom-3 right-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] uppercase tracking-[0.16em] text-foreground">
                          {typeLabel[share.entityType]}
                        </span>
                      </div>

                      <div className="space-y-2 p-3">
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">
                          {getShareTitle(share)}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Compartilhado por {getShareOwner(share)}
                        </p>

                        <div>
                          <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            Categoria local
                          </label>
                          <select
                            className="fac-select !h-9 text-[13px]"
                            value={share.localCategoryId || ''}
                            onChange={(event) => updateLocalCategory(share.id, event.target.value)}
                            disabled={processingId === share.id}
                          >
                            <option value="">Sem categoria local</option>
                            {localCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasOpenAction(share) ? (
                            <button
                              type="button"
                              className="fac-button-secondary !h-9 !px-3 text-[10px] tracking-[0.16em]"
                              onClick={() => openShare(share)}
                              disabled={isInactive}
                            >
                              Abrir
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="fac-button-secondary !h-9 !px-3 text-[10px] tracking-[0.16em]"
                            onClick={() => removeReceived(share.id)}
                            disabled={processingId === share.id}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold text-foreground">Enviados ({sent.length})</h2>
            {sent.length === 0 ? (
              <div className="fac-panel px-6 py-8 text-[14px] text-muted-foreground">
                Nenhum item enviado.
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {sent.map((share) => {
                  const shareStatus = getShareStatus(share);
                  const isInactive = shareStatus === 'INACTIVE';
                  const imageUrl = getShareImage(share) ? resolveFileUrl(getShareImage(share)) : '';
                  const categoryName = getShareCategory(share) || 'Sem categoria';
                  const categoryColor = getShareCategoryColor(share);
                  const entityId = getShareEntityId(share);

                  return (
                    <article
                      key={share.id}
                      className={`fac-card w-[240px] ${isInactive ? 'opacity-80 grayscale' : ''}`}
                    >
                      <div
                        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                        onClick={() => openShare(share)}
                        onKeyDown={(event) => {
                          if ((event.key === 'Enter' || event.key === ' ') && !isInactive) {
                            event.preventDefault();
                            openShare(share);
                          }
                        }}
                        role="button"
                        tabIndex={isInactive ? -1 : 0}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={getShareTitle(share)}
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition: normalizeImagePosition(getShareImagePosition(share)),
                              transform: `scale(${getShareImageScale(share) || 1})`,
                              transformOrigin: normalizeImagePosition(getShareImagePosition(share)),
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" />
                        )}

                        <span
                          className="absolute left-3 top-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] font-semibold text-foreground"
                          style={categoryColor ? { borderColor: categoryColor, color: categoryColor } : undefined}
                        >
                          {categoryName}
                        </span>

                        <div className="absolute right-3 top-3 flex items-center gap-2">
                          {entityId ? <FavoriteButton entityType={share.entityType} entityId={entityId} /> : null}
                          {share.entityType === 'SCHEDULE' && share.schedule?.fileUrl ? (
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-foreground"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (isInactive) return;
                                window.open(resolveFileUrl(share.schedule?.fileUrl), '_blank', 'noopener,noreferrer');
                              }}
                              aria-label="Baixar documento"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>

                        <span className="fac-status-badge absolute bottom-3 left-3" data-status={shareStatus}>
                          {shareStatus === 'ACTIVE' ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Ban className="h-5 w-5" />
                          )}
                        </span>

                        <span className="absolute bottom-3 right-3 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[13px] uppercase tracking-[0.16em] text-foreground">
                          {typeLabel[share.entityType]}
                        </span>
                      </div>

                      <div className="space-y-2 p-3">
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">
                          {getShareTitle(share)}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Destinatario: {share.recipient?.name || 'Usuario'}
                        </p>
                        <p className="text-[12px] text-muted-foreground">{sentStatusLabel(share)}</p>

                        <div className="flex items-center gap-2">
                          {hasOpenAction(share) ? (
                            <button
                              type="button"
                              className="fac-button-secondary !h-9 !px-3 text-[10px] tracking-[0.16em]"
                              onClick={() => openShare(share)}
                              disabled={isInactive}
                            >
                              Abrir
                            </button>
                          ) : null}

                          {!share.removedAt ? (
                            <button
                              type="button"
                              className="fac-button-secondary !h-9 !px-3 text-[10px] tracking-[0.16em]"
                              onClick={() => revokeSent(share.id)}
                              disabled={processingId === share.id}
                            >
                              Revogar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <AdminModal
        open={Boolean(viewingNote)}
        title={viewingNote?.title || 'Nota compartilhada'}
        onClose={() => setViewingNote(null)}
        panelClassName="max-w-3xl"
      >
        {viewingNote?.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-xl">
            <img
              src={resolveFileUrl(viewingNote.imageUrl)}
              alt={viewingNote.title}
              className="h-56 w-full object-cover"
              style={{
                objectPosition: normalizeImagePosition(viewingNote.imagePosition),
                transform: `scale(${viewingNote.imageScale || 1})`,
                transformOrigin: normalizeImagePosition(viewingNote.imagePosition),
              }}
            />
          </div>
        ) : null}
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{viewingNote?.content}</p>
      </AdminModal>
    </div>
  );
}