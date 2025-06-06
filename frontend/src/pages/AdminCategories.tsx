import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<
    { id: number; name: string; color: string; icon: string }[]
  >([]);
  const [colors, setColors] = useState<{ id: number; value: string }[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "",
    icon: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCat, setEditCat] = useState({ name: "", color: "", icon: "" });

  const inputClass =
    "p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const [catRes, colorRes] = await Promise.all([
      api.get("/categories"),
      api.get("/colors"),
    ]);
    setCategories(catRes.data);
    setColors(colorRes.data);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await api.post("/categories", newCategory);
      await refresh();
      setNewCategory({ name: "", color: "", icon: "" });
      toast.success("Categoria criada");
    } catch {
      toast.error("Erro ao criar categoria");
    }
  };

  const startEdit = (cat: {
    id: number;
    name: string;
    color: string;
    icon: string;
  }) => {
    setEditingId(cat.id);
    setEditCat({
      name: cat.name,
      color: cat.color || "",
      icon: cat.icon || "",
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await api.patch(`/categories/${editingId}`, editCat);
      toast.success("Categoria atualizada");
      setEditingId(null);
      await refresh();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    await api.delete(`/categories/${id}`);
    await refresh();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Categorias</h2>
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-2 max-w-sm bg-slate-800 p-4 rounded"
      >
        <input
          className={inputClass}
          placeholder="Nome"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
        />
        <select
          className={inputClass}
          value={newCategory.color}
          onChange={(e) =>
            setNewCategory({ ...newCategory, color: e.target.value })
          }
        >
          <option value="">Selecione a cor</option>
          {colors.map((c) => (
            <option key={c.id} value={c.value}>
              {c.value}
            </option>
          ))}
        </select>
        {newCategory.color && (
          <div
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: newCategory.color }}
          />
        )}
        <input
          className={inputClass}
          placeholder="Ícone"
          value={newCategory.icon}
          onChange={(e) =>
            setNewCategory({ ...newCategory, icon: e.target.value })
          }
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
        {categories.map((c) => (
          <motion.li key={c.id} layout className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded"
              style={{ backgroundColor: c.color }}
            />
            {editingId === c.id ? (
              <>
                  <input
                    className={`${inputClass} flex-1`}
                    value={editCat.name}
                  onChange={(e) =>
                    setEditCat({ ...editCat, name: e.target.value })
                  }
                />
                  <select
                    className={inputClass}
                    value={editCat.color}
                  onChange={(e) =>
                    setEditCat({ ...editCat, color: e.target.value })
                  }
                >
                  <option value="">Cor</option>
                  {colors.map((col) => (
                    <option key={col.id} value={col.value}>
                      {col.value}
                    </option>
                  ))}
                </select>
                  <input
                    className={inputClass}
                    value={editCat.icon}
                  onChange={(e) =>
                    setEditCat({ ...editCat, icon: e.target.value })
                  }
                  placeholder="Icone"
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
                <span className="flex-1">{c.name}</span>
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
