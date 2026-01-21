'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api, { serverURL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useImageGallery } from '@/hooks/useImageGallery';
import { Company } from '@/types';
import { isUserMode } from '@/lib/app-mode';

export default function ImagesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [search, setSearch] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [mounted, setMounted] = useState(false);

  const isSuperAdmin = user?.role === 'SUPERADMIN' && !isUserMode;
  const companyId = isSuperAdmin ? selectedCompanyId : (user?.companyId || '');

  useEffect(() => {
    if (!hasHydrated || !isSuperAdmin) return;

    const loadCompanies = async () => {
      try {
        const response = await api.get('/companies', {
          skipNotify: true,
        });
        const data = response.data as Company[];
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar empresas:', err);
      }
    };

    loadCompanies();
  }, [hasHydrated, isSuperAdmin]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  } = useImageGallery(companyId, filters);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta imagem?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/uploads/images/${imageId}`);
      await new Promise(resolve => setTimeout(resolve, 100));
      setSelectedImage(null);
      await refresh();
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar imagem. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadImageDetails = async (imageId: string) => {
    try {
      const response = await api.get(`/uploads/images/${imageId}`, {
        skipNotify: true,
      });
      setSelectedImage(response.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Galeria de Imagens
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isUserMode
            ? 'Visualize e gerencie as imagens do portal'
            : 'Visualize e gerencie as imagens da empresa'}
        </p>
      </div>

      {/* Company Selector for Superadmin */}
      {isSuperAdmin && (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Empresa
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full rounded-lg border border-border/70 bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:border-foreground/30 focus:border-foreground/50 focus:outline-none sm:max-w-xs"
          >
            <option value="">Selecione uma empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Buscar
          </p>
          {!loading && !error && (
            <p className="text-xs text-muted-foreground">
              {total === 0 ? 'Nenhuma imagem' : `${total} ${total === 1 ? 'imagem' : 'imagens'}`}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Digite o nome da imagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 hover:border-foreground/30 focus:border-foreground/50 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(e) => setShowOnlyMine(e.target.checked)}
              className="h-4 w-4 rounded border-border/70 text-foreground focus:ring-2 focus:ring-foreground/20"
            />
            <span>Apenas minhas imagens</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Carregando imagens...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && images.length === 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/30 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-foreground">Nenhuma imagem encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? 'Tente ajustar sua busca' : 'Adicione imagens criando notas, links ou documentos'}
          </p>
        </div>
      )}

      {/* Images Grid */}
      {!loading && !error && images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => loadImageDetails(image.id)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted shadow-sm transition-all hover:scale-[1.02] hover:border-foreground/30 hover:shadow-md active:scale-100"
            >
              <img
                src={`${serverURL}${image.url}`}
                alt={image.alt || image.originalName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="truncate text-xs font-medium text-white">
                    {image.originalName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/70">
                    {formatBytes(image.size)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 px-5 py-4 shadow-sm">
          <button
            type="button"
            onClick={previousPage}
            disabled={!hasPreviousPage}
            className="motion-press rounded-lg border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página <span className="font-semibold text-foreground">{page}</span> de {totalPages}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={!hasNextPage}
            className="motion-press rounded-lg border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Image Details Modal */}
      {mounted && selectedImage && createPortal(
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Detalhes da Imagem
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="motion-press rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground/5"
                >
                  Fechar
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center rounded-lg border border-border/70 bg-muted/30 p-4">
                  <img
                    src={`${serverURL}${selectedImage.url}`}
                    alt={selectedImage.alt || selectedImage.originalName}
                    className="max-h-64 max-w-full rounded object-contain"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {selectedImage.usageCount === 0 && !isDeleting && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedImage.id)}
                      className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 active:scale-95"
                    >
                      Deletar Imagem
                    </button>
                  )}

                  {isDeleting && (
                    <div className="flex items-center justify-center rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                      <span className="text-sm text-muted-foreground">Deletando...</span>
                    </div>
                  )}

                  {(selectedImage.usageCount || 0) > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Esta imagem está sendo usada em {selectedImage.usageCount}{' '}
                        {selectedImage.usageCount === 1 ? 'lugar' : 'lugares'} e não pode ser deletada.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
