
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api";
import { LinkData } from "../components/LinkCard";

export default function AdminLinks() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [colors, setColors] = useState<{ id: number; value: string }[]>([]);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category_id: null as number | null,
    color: "",
    image_url: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState({
    title: "",
    url: "",
    category_id: null as number | null,
    color: "",
    image_url: "",
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const [linkRes, catRes, colorRes] = await Promise.all([
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
    ]);
    setLinks(linkRes.data);
    setCategories(catRes.data);
    setColors(colorRes.data);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { ...newLink };
      if (payload.category_id === null) delete (payload as any).category_id;
      await api.post("/links", payload);
      await refresh();
      setNewLink({
        title: "",
        url: "",
        category_id: null,
        color: "",
        image_url: "",
      });
      toast.success("Link criado");
    } catch {
      toast.error("Erro ao criar link");
    }
  };

  const startEdit = (link: LinkData) => {
    setEditingId(link.id);
    setEditLink({
      title: link.title,
      url: link.url,
      category_id: link.categoryId ?? null,
      color: link.color || "",
      image_url: link.imageUrl || "",
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      const payload = { ...editLink };
      if (payload.category_id === null) delete (payload as any).category_id;
      await api.patch(`/links/${editingId}`, payload);
      toast.success("Link atualizado");
      setEditingId(null);
      await refresh();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${id}`);
    await refresh();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Links</h2>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-2 max-w-sm bg-slate-800 p-4 rounded"
      >

        <input
          className="p-2 rounded text-black"
          placeholder="Título"
          value={newLink.title}
          onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
        />
        <input
          className="p-2 rounded text-black"
          placeholder="URL"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
        />
        <select
          className="p-2 rounded text-black"
          value={newLink.category_id ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setNewLink({
              ...newLink,
              category_id: val === "" ? null : parseInt(val),
            });
          }}
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="p-2 rounded text-black"
          value={newLink.color}
          onChange={(e) => setNewLink({ ...newLink, color: e.target.value })}
        >
          <option value="">Cor do card</option>
          {colors.map((c) => (
            <option key={c.id} value={c.value}>
              {c.value}
            </option>
          ))}
        </select>
        {newLink.color && (
          <div
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: newLink.color }}
          />
        )}
        <input
          className="p-2 rounded text-black"
          placeholder="URL da imagem"
          value={newLink.image_url}
          onChange={(e) =>
            setNewLink({ ...newLink, image_url: e.target.value })
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
        {links.map((l) => (
          <motion.li key={l.id} layout className="flex items-center gap-2">
            {editingId === l.id ? (
              <>
                <input
                  className="p-2 rounded text-black flex-1"
                  value={editLink.title}
                  onChange={(e) =>
                    setEditLink({ ...editLink, title: e.target.value })
                  }
                />
                <input
                  className="p-2 rounded text-black flex-1"
                  value={editLink.url}
                  onChange={(e) =>
                    setEditLink({ ...editLink, url: e.target.value })
                  }
                  placeholder="URL"
                />
                <select
                  className="p-2 rounded text-black"
                  value={editLink.category_id ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditLink({
                      ...editLink,
                      category_id: val === "" ? null : parseInt(val),
                    });
                  }}
                >
                  <option value="">Categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className="p-2 rounded text-black"
                  value={editLink.color}
                  onChange={(e) =>
                    setEditLink({ ...editLink, color: e.target.value })
                  }
                >
                  <option value="">Cor</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.value}>
                      {c.value}
                    </option>
                  ))}
                </select>
                <input
                  className="p-2 rounded text-black flex-1"
                  placeholder="Imagem"
                  value={editLink.image_url}
                  onChange={(e) =>
                    setEditLink({ ...editLink, image_url: e.target.value })
                  }
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
                <span className="flex-1">{l.title}</span>
                <button
                  onClick={() => startEdit(l)}
                  className="text-sm text-blue-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(l.id)}
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
