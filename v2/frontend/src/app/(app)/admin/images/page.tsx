'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useImageGallery } from '@/hooks/useImageGallery';

export default function ImagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [search, setSearch] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(typeof window !== 'undefined');

  const filters = useMemo(
    () => ({
      search: search || undefined,
      uploadedBy: showOnlyMine ? user?.id : undefined,
    }),
    [search, showOnlyMine, user?.id],
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

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/uploads/images/${imageId}`);
      setSelectedImage(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const loadImageDetails = async (imageId: string) => {
    const response = await api.get(`/uploads/images/${imageId}`, {
      skipNotify: true,
    });
    setSelectedImage(response.data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-foreground">Galeria de imagens</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie imagens enviadas pelos usuarios.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou descricao..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showOnlyMine}
            onChange={(e) => setShowOnlyMine(e.target.checked)}
            className="rounded"
          />
          <span>Apenas minhas imagens</span>
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} imagens encontradas</span>
        <span>Pagina {page} de {Math.max(totalPages, 1)}</span>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando imagens...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhuma imagem encontrada.
        </div>
      )}

      {!loading && !error && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => loadImageDetails(image.id)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border/70 bg-muted hover:border-foreground/30 transition-colors"
            >
              <img
                src={`${serverURL}${image.url}`}
                alt={image.alt || image.originalName}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                  <p className="text-xs text-white truncate font-medium">{image.originalName}</p>
                  <p className="text-[10px] text-white/70">{formatBytes(image.size)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={previousPage}
            disabled={!hasPreviousPage}
            className="rounded-lg border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={nextPage}
            disabled={!hasNextPage}
            className="rounded-lg border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
          >
            Proxima
          </button>
        </div>
      )}

      {selectedImage && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute inset-0 bg-black/60"
            aria-label="Fechar"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border/70 bg-background p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedImage.originalName}</h2>
                <p className="text-xs text-muted-foreground">
                  Enviado por {selectedImage.user?.name || 'Usuario'} em {formatDate(selectedImage.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-lg border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.14em]"
              >
                Fechar
              </button>
            </div>

            <img
              src={`${serverURL}${selectedImage.url}`}
              alt={selectedImage.alt || selectedImage.originalName}
              className="max-h-[60vh] w-full rounded-lg border border-border/70 object-contain bg-muted/20"
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
              <p className="text-muted-foreground">Nome: {selectedImage.filename}</p>
              <p className="text-muted-foreground">Tamanho: {formatBytes(selectedImage.size)}</p>
              <p className="text-muted-foreground">Tipo: {selectedImage.mimeType}</p>
              <p className="text-muted-foreground">Uso em conteudos: {selectedImage.usageCount ?? 0}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDelete(selectedImage.id)}
                disabled={isDeleting}
                className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs uppercase tracking-[0.14em] text-destructive disabled:opacity-60"
              >
                {isDeleting ? 'Removendo...' : 'Remover imagem'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
