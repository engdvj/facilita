import { useState, useCallback } from 'react';
import api from '../../api';

export function useColorsManagement(onRefresh: () => Promise<void>) {
  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#000000");
  const [editColorName, setEditColorName] = useState("");

  const startEditColor = useCallback((c: { id: number; value: string; name?: string }) => {
    setEditColorId(c.id);
    setEditColor(c.value);
    setEditColorName(c.name || "");
  }, []);

  const saveColor = useCallback(async () => {
    if (editColorId === null) return;
    try {
      await api.patch(`/colors/${editColorId}`, {
        value: editColor,
        name: editColorName || undefined,
      });
      setEditColorId(null);
      setEditColor("#000000");
      setEditColorName("");
      await onRefresh();
    } catch (error) {
      console.error('Error saving color:', error);
    }
  }, [editColorId, editColor, editColorName, onRefresh]);

  const removeColor = useCallback(async (id: number) => {
    if (!confirm("Excluir cor?")) return;
    try {
      await api.delete(`/colors/${id}`);
      await onRefresh();
    } catch (error) {
      console.error('Error removing color:', error);
    }
  }, [onRefresh]);

  const cancelEdit = useCallback(() => {
    setEditColorId(null);
    setEditColor("#000000");
    setEditColorName("");
  }, []);

  return {
    editColorId,
    editColor,
    editColorName,
    setEditColor,
    setEditColorName,
    startEditColor,
    saveColor,
    removeColor,
    cancelEdit
  };
}