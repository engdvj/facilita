import { useCallback } from 'react';
import api from '../../api';

export function useFilesManagement(onRefresh: () => Promise<void>) {
  const removeFile = useCallback(async (id: number) => {
    if (!confirm("Excluir arquivo?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      await onRefresh();
    } catch (error) {
      console.error('Error removing file:', error);
    }
  }, [onRefresh]);

  return {
    removeFile
  };
}