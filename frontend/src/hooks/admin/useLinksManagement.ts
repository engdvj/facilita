import { useCallback } from 'react';
import api from '../../api';

export function useLinksManagement(onRefresh: () => Promise<void>) {
  const removeLink = useCallback(async (id: number) => {
    if (!confirm("Excluir link?")) return;
    try {
      await api.delete(`/links/${id}`);
      await onRefresh();
    } catch (error) {
      console.error('Error removing link:', error);
    }
  }, [onRefresh]);

  return {
    removeLink
  };
}