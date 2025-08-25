import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export function useUsersManagement(onRefresh: () => Promise<void>) {
  const navigate = useNavigate();

  const startEditUser = useCallback((u: { id: number }) => {
    navigate(`/admin/users/${u.id}`);
  }, [navigate]);

  const removeUser = useCallback(async (id: number) => {
    if (!confirm("Excluir usuário?")) return;
    try {
      await api.delete(`/users/${id}`);
      await onRefresh();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }, [onRefresh]);

  return {
    startEditUser,
    removeUser
  };
}