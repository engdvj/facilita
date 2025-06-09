import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
    "p-0 border border-gray-300 dark:border-gray-700 rounded bg-[var(--input-background)] text-white";

  /* ---------------------------------- IO --------------------------------- */
  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    const res = await api.get("/colors");
    setColors(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
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

  /* ------------------------------ Paginação ------------------------------ */
  const pageCount = Math.ceil(colors.length / perPage) || 1;
  const paginatedColors = colors.slice((page - 1) * perPage, page * perPage);

  /* --------------------------------- UI ---------------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ color: 'var(--text-color)' }}>
      <div className="grid gap-8 md:grid-cols-2">
        {/* ------------------------------ NOVA COR ----------------------------- */}
        <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Nova Cor</h2>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* seletor (já mostra a cor) */}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded border border-white/20"
              />

              {/* hexadecimal */}
              <input
                type="text"
                placeholder="#RRGGBB"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-32 rounded-md px-3 py-2 bg-[var(--input-background)] text-white font-mono"
              />

              {/* nome opcional */}
              <input
                type="text"
                placeholder="Nome (opcional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 min-w-[150px] rounded-md px-3 py-2 bg-[var(--input-background)] text-white"
              />
            </div>

            <button className="self-end btn-primary rounded-xl transition hover:brightness-110 px-4 py-2">
              Adicionar
            </button>
          </form>
        </section>

        {/* --------------------------- LISTA / EDIÇÃO -------------------------- */}
        <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Cores ({colors.length})</h2>

          <motion.ul
            className="space-y-2 flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {paginatedColors.map((c) => (
              <motion.li
                key={c.id}
                layout
                className="flex flex-wrap items-center gap-2 bg-[var(--card-background)] p-3 rounded-2xl text-white shadow-md hover:shadow-xl"
              >
                {/* mini-preview na lista (mantido) */}
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: c.value }}
                />

                {editingId === c.id ? (
                  <>
                    {/* opcional: se quiser permitir picker durante edição,
                        troque para type="color"             */}
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={`${colorInputClass} w-20 h-8 font-mono px-2`}
                    />

                    <input
                      type="text"
                      placeholder="Nome"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`${colorInputClass} w-32 h-8 px-2`}
                    />

                    <button onClick={saveEdit} className="p-1 text-green-400">
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-yellow-400"
                    >
                      <ChevronDown size={16} className="rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-mono">
                      {c.value}
                      {c.name ? ` - ${c.name}` : ""}
                    </span>
                    <button
                      onClick={() => startEdit(c)}
                      className="p-1 hover:text-[var(--accent-color)]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="p-1 hover:text-red-400"
                    >
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center">
                {page} / {pageCount}
              </span>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
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
