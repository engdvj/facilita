import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api";

export default function AdminColors() {
  const [colors, setColors] = useState<{ id: number; value: string }[]>([]);
  const [newColor, setNewColor] = useState("#ffffff");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("#ffffff");

  const colorInputClass =
    "p-0 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-700";

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    const res = await api.get("/colors");
    setColors(res.data);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await api.post("/colors", { value: newColor });
      await fetchColors();
      setNewColor("#ffffff");
      toast.success("Cor criada");
    } catch {
      toast.error("Erro ao criar cor");
    }
  };

  const startEdit = (c: { id: number; value: string }) => {
    setEditingId(c.id);
    setEditValue(c.value);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await api.patch(`/colors/${editingId}`, { value: editValue });
      toast.success("Cor atualizada");
      setEditingId(null);
      await fetchColors();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Excluir cor?")) return;
    await api.delete(`/colors/${id}`);
    await fetchColors();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Cores</h2>
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded text-gray-900 dark:text-white"
      >
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className={`${colorInputClass} w-20 h-10`}
        />
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">
          Adicionar
        </button>
      </form>
      <motion.ul
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {colors.map((c) => (
          <motion.li key={c.id} layout className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded text-gray-900 dark:text-white">
            <span
              className="w-5 h-5 rounded"
              style={{ backgroundColor: c.value }}
            />
            {editingId === c.id ? (
              <>
                <input
                  type="color"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`${colorInputClass} w-20 h-8`}
                />
                <button onClick={saveEdit} className="text-sm text-green-400">
                  Salvar
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-yellow-400"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{c.value}</span>
                <button
                  onClick={() => startEdit(c)}
                  className="text-sm text-blue-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="text-sm text-red-400"
                >
                  Excluir
                </button>
              </>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
