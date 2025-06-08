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

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";

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
    <div className="space-y-6 max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-heading text-center">Categorias</h2>
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 bg-white dark:bg-slate-800 p-6 rounded-lg text-gray-900 dark:text-white"
      >
        <input
          className={fieldClass}

          placeholder="Nome"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
        />
        <select
          className={fieldClass}

          value={newCategory.color}
          onChange={(e) =>
            setNewCategory({ ...newCategory, color: e.target.value })
          }
        >
          <option value="">Selecione a cor</option>
          {colors.map((c) => (
            <option key={c.id} value={c.value} style={{ color: c.value }}>
              {c.value}
            </option>
          ))}
        </select>
        <input
          className={fieldClass}
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
          <motion.li key={c.id} layout className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-900 dark:text-white">

            {editingId === c.id ? (
              <>
                  <input
                    className={`${fieldClass} flex-1`}

                    value={editCat.name}
                  onChange={(e) =>
                    setEditCat({ ...editCat, name: e.target.value })
                  }
                />
                  <select
                    className={fieldClass}
                    value={editCat.color}
                  onChange={(e) =>
                    setEditCat({ ...editCat, color: e.target.value })
                  }
                >
                  <option value="">Cor</option>
                  {colors.map((col) => (
                    <option key={col.id} value={col.value} style={{ color: col.value }}>
                      {col.value}
                    </option>
                  ))}
                </select>
                  <input
                    className={fieldClass}

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
                <span className="ml-2 text-sm font-mono" style={{ color: c.color }}>
                  {c.color}
                </span>
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
