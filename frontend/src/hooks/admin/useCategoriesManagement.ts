import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export function useCategoriesManagement(onRefresh: () => Promise<void>) {
  const navigate = useNavigate();

  const startEditCat = useCallback((cat: { id: number }) => {
    navigate(`/admin/categories/${cat.id}`);
  }, [navigate]);

  const removeCat = useCallback(async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    try {
      await api.delete(`/categories/${id}`);
      await onRefresh();
    } catch (error) {
      console.error('Error removing category:', error);
    }
  }, [onRefresh]);

  return {
    startEditCat,
    removeCat
  };
}