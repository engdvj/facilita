'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import AdminModal from '@/components/admin/modal';
import { useImageGallery } from '@/hooks/useImageGallery';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import type { UploadedImage } from '@/types';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const index = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(1))} ${sizes[index]}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export default function ImagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const globalSearch = useUiStore((state) => state.globalSearch);

  const [ownerFilter, setOwnerFilter] = useState<'ALL' | 'MINE'>('ALL');
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const filters = useMemo(
    () => ({
      search: globalSearch || undefined,
      uploadedBy: ownerFilter === 'MINE' ? user?.id : undefined,
    }),
    [globalSearch, ownerFilter, user?.id],
  );

  const {
    images,
    loading,
    error,
    page,
    totalPages,
    total,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refresh,
  } = useImageGallery(filters);

  const handleDelete = async () => {
    if (!selectedImage) return;

    setIsDeleting(true);
    try {
      await api.delete(`/uploads/images/${selectedImage.id}`);
      setSelectedImage(null);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
      await refresh();
    }
  };

  const loadImageDetails = async (imageId: string) => {
    const response = await api.get<UploadedImage>(`/uploads/images/${imageId}`, {
      skipNotify: true,
    });
    setSelectedImage(response.data);
  };

  if (!hasHydrated) {
    return <div className="fac-loading-state">Carregando imagens...</div>;
  }

  const activeSearch = globalSearch.trim();

  return (
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <h1 className="fac-subtitle">Galeria de imagens</h1>
          <p className="text-[15px] text-muted-foreground">
            Gerencie imagens enviadas pelos usuários.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-[190px_auto]">
          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value as 'ALL' | 'MINE')}
            className="fac-select"
          >
            <option value="ALL">Todas as imagens</option>
            <option value="MINE">Minhas imagens</option>
          </select>

          <button
            type="button"
            className="fac-button-secondary"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </section>

      <section className="fac-panel">
        <div className="fac-panel-head">
          <p className="fac-panel-title">Biblioteca</p>
          <p className="fac-panel-meta">{total} imagens</p>
        </div>

        <div className="fac-panel-body space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <section className="fac-form-card">
              <p className="fac-form-title">Contexto</p>
              <p className="text-[14px] text-muted-foreground">
                Use esta galeria para reaproveitar capas e manter padrão visual entre links,
                documentos e notas.
              </p>
              {activeSearch ? (
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Busca global ativa:{' '}
                  <span className="font-semibold text-foreground">{activeSearch}</span>
                </p>
              ) : null}
            </section>

            <section className="fac-form-card">
              <p className="fac-form-title">Página atual</p>
              <p className="font-display text-[28px] leading-none text-foreground">{page}</p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                de {Math.max(totalPages, 1)} páginas
              </p>
            </section>
          </div>

          {loading ? (
            <div className="fac-loading-state">Carregando imagens...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : images.length === 0 ? (
            <div className="fac-empty-state">Nenhuma imagem encontrada.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {images.map((image) => (
                <article
                  key={image.id}
                  className={`fac-card w-[220px] max-w-full ${image.status === 'INACTIVE' ? 'opacity-80 grayscale' : ''}`}
                >
                  <button
                    type="button"
                    className="relative aspect-square w-full overflow-hidden bg-muted text-left"
                    onClick={() => void loadImageDetails(image.id)}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={`${serverURL}${image.url}`}
                        alt={image.alt || image.originalName}
                        width={image.width ?? 440}
                        height={image.height ?? 440}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                    </div>

                    <span className="absolute left-3 top-3 flex max-w-[calc(100%-84px)] items-center gap-2 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="line-clamp-1">{image.user?.name || 'Usuário'}</span>
                    </span>

                    <span className="absolute right-3 top-3 rounded-xl border border-black/10 bg-white/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {image.width && image.height ? `${image.width}x${image.height}` : 'IMG'}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-white/92 px-3 py-2">
                      <div className="min-w-0 pr-2">
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">
                          {image.originalName}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {formatBytes(image.size)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Uso
                        </p>
                        <p className="mt-1 text-[13px] font-semibold text-foreground">
                          {image.usageCount ?? 0}
                        </p>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-secondary/45">
              <p className="text-[12px] text-muted-foreground">
                Página {page} de {Math.max(totalPages, 1)}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previousPage}
                  disabled={!hasPreviousPage}
                  className="fac-button-secondary !h-9 !px-4 text-[10px]"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="fac-button-secondary !h-9 !px-4 text-[10px]"
                >
                  Próxima
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <AdminModal
        open={Boolean(selectedImage)}
        title="Detalhes da imagem"
        description={
          selectedImage
            ? `${selectedImage.originalName} - enviado por ${selectedImage.user?.name || 'Usuário'} em ${formatDate(selectedImage.createdAt)}`
            : undefined
        }
        onClose={() => setSelectedImage(null)}
        panelClassName="max-w-[860px]"
        footer={
          selectedImage ? (
            <>
              <button
                type="button"
                className="fac-button-secondary text-[11px]"
                onClick={() => setSelectedImage(null)}
                disabled={isDeleting}
              >
                Fechar
              </button>
              <button
                type="button"
                className="fac-button-secondary text-[11px] !border-destructive/40 !bg-destructive/5 !text-destructive hover:!bg-destructive/10"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removendo...' : 'Remover imagem'}
              </button>
            </>
          ) : null
        }
      >
        {selectedImage ? (
          <>
            <section className="fac-form-card">
              <div className="overflow-hidden rounded-[18px] border border-border bg-muted/30">
                <Image
                  src={`${serverURL}${selectedImage.url}`}
                  alt={selectedImage.alt || selectedImage.originalName}
                  width={selectedImage.width ?? 1200}
                  height={selectedImage.height ?? 900}
                  unoptimized
                  className="max-h-[60vh] w-full object-contain bg-muted/20"
                />
              </div>
            </section>

            <section className="fac-form-card mt-4">
              <p className="fac-form-title">Metadados</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="fac-label">Arquivo interno</p>
                  <p className="text-[14px] text-foreground">{selectedImage.filename}</p>
                </div>

                <div>
                  <p className="fac-label">Nome original</p>
                  <p className="text-[14px] text-foreground">{selectedImage.originalName}</p>
                </div>

                <div>
                  <p className="fac-label">Tamanho</p>
                  <p className="text-[14px] text-foreground">{formatBytes(selectedImage.size)}</p>
                </div>

                <div>
                  <p className="fac-label">Tipo</p>
                  <p className="text-[14px] text-foreground">{selectedImage.mimeType}</p>
                </div>

                <div>
                  <p className="fac-label">Dimensões</p>
                  <p className="text-[14px] text-foreground">
                    {selectedImage.width && selectedImage.height
                      ? `${selectedImage.width} x ${selectedImage.height}`
                      : 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className="fac-label">Uso em conteúdos</p>
                  <p className="text-[14px] text-foreground">{selectedImage.usageCount ?? 0}</p>
                </div>

                <div>
                  <p className="fac-label">Enviado por</p>
                  <p className="text-[14px] text-foreground">
                    {selectedImage.user?.name || 'Usuário'}
                  </p>
                </div>

                <div>
                  <p className="fac-label">Data de envio</p>
                  <p className="text-[14px] text-foreground">
                    {formatDate(selectedImage.createdAt)}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="fac-label">Texto alternativo</p>
                  <p className="text-[14px] text-foreground">
                    {selectedImage.alt?.trim() || 'Não definido'}
                  </p>
                </div>
              </div>

              {selectedImage.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag) => (
                    <span key={tag} className="fac-pill !h-8 !px-3 !text-[9px]">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </AdminModal>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Remover imagem"
        description={
          selectedImage
            ? `Confirma a remoção permanente da imagem "${selectedImage.originalName}"?`
            : 'Confirma a remoção permanente desta imagem?'
        }
        confirmLabel="Remover imagem"
        loading={isDeleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
