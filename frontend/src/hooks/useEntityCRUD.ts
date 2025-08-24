import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import api from '../api';
import toast from 'react-hot-toast';

interface UseEntityCRUDReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: any) => Promise<T>;
  update: (id: number, data: any) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

export function useEntityCRUD<T>(endpoint: string): UseEntityCRUDReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  
  const { 
    data: listData, 
    loading: listLoading, 
    error: listError, 
    execute: executeList 
  } = useApi<T[]>(() => api.get(`/${endpoint}`));

  const { 
    loading: createLoading, 
    execute: executeCreate 
  } = useApi<T>((data: any) => api.post(`/${endpoint}`, data));

  const { 
    loading: updateLoading, 
    execute: executeUpdate 
  } = useApi<T>((id: number, data: any) => api.patch(`/${endpoint}/${id}`, data));

  const { 
    loading: deleteLoading, 
    execute: executeDelete 
  } = useApi<void>((id: number) => api.delete(`/${endpoint}/${id}`));

  const refresh = useCallback(async () => {
    try {
      const data = await executeList();
      setItems(data || []);
    } catch (error) {
      console.error(`Erro ao carregar ${endpoint}:`, error);
    }
  }, [executeList, endpoint]);

  const create = useCallback(async (data: any): Promise<T> => {
    try {
      const newItem = await executeCreate(data);
      await refresh();
      toast.success('Item criado com sucesso');
      return newItem;
    } catch (error) {
      toast.error('Erro ao criar item');
      throw error;
    }
  }, [executeCreate, refresh]);

  const update = useCallback(async (id: number, data: any): Promise<T> => {
    try {
      const updatedItem = await executeUpdate(id, data);
      await refresh();
      toast.success('Item atualizado com sucesso');
      return updatedItem;
    } catch (error) {
      toast.error('Erro ao atualizar item');
      throw error;
    }
  }, [executeUpdate, refresh]);

  const remove = useCallback(async (id: number): Promise<void> => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      await executeDelete(id);
      await refresh();
      toast.success('Item excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir item');
      throw error;
    }
  }, [executeDelete, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loading = listLoading || createLoading || updateLoading || deleteLoading;

  return {
    items,
    loading,
    error: listError,
    refresh,
    create,
    update,
    remove,
  };
}