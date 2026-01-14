'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { UploadedImage, ImageFilters } from '@/types';

interface ImageGalleryResponse {
  data: UploadedImage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useImageGallery(
  companyId: string,
  filters?: ImageFilters,
  initialPage = 1,
  initialLimit = 20,
) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadImages = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        companyId,
        page,
        limit,
        ...filters,
      };

      const response = await api.get<ImageGalleryResponse>('/uploads/images', {
        params,
        skipNotify: true,
      } as any);

      setImages(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar imagens');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, page, limit, filters]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const refresh = useCallback(async () => {
    setPage(1);
    await loadImages();
  }, [loadImages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return {
    images,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    setPage: goToPage,
    nextPage,
    previousPage,
    refresh,
  };
}
