import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";

export default function AdminColors() {
  const [colors, setColors] = useState<
    { id: number; value: string; name?: string; type?: string }[]
  >([]);
  const [newColor, setNewColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("hex");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("hex");

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
        type: newType,
      });
      await fetchColors();
      setNewColor("");
      setNewName("");
      setNewType("hex");
      toast.success("Cor criada");
    } catch {
      toast.error("Erro ao criar cor");
    }
  };

  const startEdit = (c: { id: number; value: string; name?: string; type?: string }) => {
    setEditingId(c.id);
    setEditValue(c.value);
    setEditName(c.name || "");
    setEditType(c.type || "hex");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await api.patch(`/colors/${editingId}`, {
        value: editValue,
        name: editName || undefined,
        type: editType,
      });
      toast.success("Cor atualizada");
      setEditingId(null);
      setEditName("");
      setEditType("hex");

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
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Cor (#fff, rgb..., hsl..., cmyk...)"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={`${colorInputClass} w-40 h-10 px-2`}
            />
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`${colorInputClass} w-40 h-10 px-2`}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className={`${colorInputClass} h-10 px-2`}
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
              <option value="cmyk">CMYK</option>
            </select>
            <span
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: newColor || "transparent" }}
            />
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">
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
                      className={`${colorInputClass} w-32 h-8 px-2`}
                    />
                    <input
                      type="text"
                      placeholder="Nome"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`${colorInputClass} w-28 h-8 px-2`}
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className={`${colorInputClass} h-8 px-2`}
                    >
                      <option value="hex">HEX</option>
                      <option value="rgb">RGB</option>
                      <option value="hsl">HSL</option>
                      <option value="cmyk">CMYK</option>
                    </select>
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
                      {c.name ? ` - ${c.name}` : ""} ({c.type})
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
