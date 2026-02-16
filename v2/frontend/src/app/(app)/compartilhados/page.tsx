'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminModal from '@/components/admin/modal';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Category, Share } from '@/types';

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

function getShareOwner(share: Share) {
  return share.owner?.name || 'Usuario';
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
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel carregar os compartilhamentos.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar compartilhamentos.');
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
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-foreground">Compartilhados</h1>
        <p className="text-sm text-muted-foreground">
          Superadmin nao participa do fluxo de compartilhamento. O acesso ao conteudo e direto via painel administrativo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compartilhados</p>
        <h1 className="font-display text-3xl text-foreground">Recebidos e enviados</h1>
        <p className="text-sm text-muted-foreground">
          Organize itens compartilhados sem alterar o conteudo original.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando compartilhamentos...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Recebidos ({received.length})</h2>
            {received.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
                Nenhum item recebido.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {received.map((share) => (
                  <article
                    key={share.id}
                    className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {getShareTitle(share)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Compartilhado por {getShareOwner(share)}
                        </p>
                        {getShareCategory(share) && (
                          <p className="text-xs text-muted-foreground">
                            Categoria original: {getShareCategory(share)}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            {share.entityType}
                          </span>
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            Recebido
                          </span>
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            Ativo
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {hasOpenAction(share) && (
                          <button
                            type="button"
                            className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
                            onClick={() => openShare(share)}
                          >
                            Abrir
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
                          onClick={() => removeReceived(share.id)}
                          disabled={processingId === share.id}
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Categoria local
                      </label>
                      <select
                        className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm"
                        value={share.localCategoryId || ''}
                        onChange={(event) =>
                          updateLocalCategory(share.id, event.target.value)
                        }
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
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Enviados ({sent.length})</h2>
            {sent.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
                Nenhum item enviado.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {sent.map((share) => (
                  <article
                    key={share.id}
                    className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {getShareTitle(share)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Destinatario: {share.recipient?.name || 'Usuario'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            {share.entityType}
                          </span>
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            Enviado
                          </span>
                          <span className="rounded-full border border-border/70 bg-white/80 px-2 py-1">
                            {sentStatusLabel(share)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {hasOpenAction(share) && (
                          <button
                            type="button"
                            className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
                            onClick={() => openShare(share)}
                          >
                            Abrir
                          </button>
                        )}
                        {!share.removedAt && (
                          <button
                            type="button"
                            className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-destructive"
                            onClick={() => revokeSent(share.id)}
                            disabled={processingId === share.id}
                          >
                            Revogar
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <AdminModal
        open={Boolean(viewingNote)}
        title={viewingNote?.title || 'Nota compartilhada'}
        onClose={() => setViewingNote(null)}
        panelClassName="max-w-2xl"
      >
        {viewingNote?.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-lg">
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
        )}
        <p className="whitespace-pre-wrap text-sm text-foreground">{viewingNote?.content}</p>
      </AdminModal>
    </div>
  );
}
