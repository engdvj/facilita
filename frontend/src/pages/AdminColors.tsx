import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";

export default function AdminColors() {
  const [colors, setColors] = useState<
    { id: number; value: string; name?: string }[]
  >([]);
  const [newColor, setNewColor] = useState("#000000");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("#000000");
  const [editName, setEditName] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 5;

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
      await api.post("/colors", {
        value: newColor,
        name: newName || undefined,

      });
      await fetchColors();
      setNewColor("#000000");
      setNewName("");

      toast.success("Cor criada");
    } catch {
      toast.error("Erro ao criar cor");
    }
  };


  const startEdit = (c: { id: number; value: string; name?: string }) => {
    setEditingId(c.id);
    setEditValue(c.value);
    setEditName(c.name || "");

  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await api.patch(`/colors/${editingId}`, {
        value: editValue,
        name: editName || undefined,

      });
      toast.success("Cor atualizada");
      setEditingId(null);
      setEditName("");

      setEditValue("#000000");

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

  const pageCount = Math.ceil(colors.length / perPage) || 1;
  const paginatedColors = colors.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="grid gap-8 md:grid-cols-2">
        <section className="bg-[#1c2233] rounded-2xl shadow-md hover:shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Nova Cor</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">

              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded border border-white/20"
              />
              <input
                type="text"
                placeholder="#RRGGBB"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="rounded-md px-3 py-2 bg-slate-800 text-white font-mono"
              />
              <input
                type="text"
                placeholder="Nome (opcional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="rounded-md px-3 py-2 bg-slate-800 text-white"
              />
            </div>
            <button className="self-end bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl transition hover:brightness-110 px-4 py-2 text-white">

              Adicionar
            </button>
          </form>
        </section>

        <section className="bg-[#1c2233] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Cores ({colors.length})</h2>
          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {paginatedColors.map((c) => (
              <motion.li key={c.id} layout className="flex items-center gap-2 bg-[#1c2233] p-3 rounded-2xl text-white shadow-md hover:shadow-xl">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                {editingId === c.id ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}

                      className={`${colorInputClass} w-12 h-8`}
                    />
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={`${colorInputClass} w-28 h-8 px-2 font-mono`}

                    />
                    <input
                      type="text"
                      placeholder="Nome"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`${colorInputClass} w-28 h-8 px-2`}
                    />

                    <span
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: editValue || "transparent" }}
                    />
                    <button onClick={saveEdit} className="p-1 text-green-400">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-yellow-400">
                      <ChevronDown size={16} className="rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-mono">
                      {c.value}

                      {c.name ? ` - ${c.name}` : ""}

                    </span>
                    <button onClick={() => startEdit(c)} className="p-1 hover:text-[#7c3aed]">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(c.id)} className="p-1 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </motion.li>
            ))}
          </motion.ul>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center">
                {page} / {pageCount}
              </span>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p: number) => Math.min(pageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
