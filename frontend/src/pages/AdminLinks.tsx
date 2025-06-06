import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api";
import { LinkData } from "../components/LinkCard";

export default function AdminLinks() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [newImageType, setNewImageType] = useState<"url" | "file">("url");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState({
    title: "",
    url: "",
    category_id: null as number | null,
    color: "",
    image_url: "",
  });
  const [editImageType, setEditImageType] = useState<"url" | "file">("url");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";


  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";


  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (id && links.length) {
      const l = links.find((lnk) => lnk.id === parseInt(id));
      if (l) {
        setEditingId(l.id);
        setEditLink({
          title: l.title,
          url: l.url,
          category_id: l.categoryId ?? null,
          color: l.color || "",
          image_url: l.imageUrl || "",
        });
        setEditImageType("url");
        setEditImageFile(null);
      }
    } else if (!id) {
      setEditingId(null);
    }
  }, [id, links]);

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
      if (newImageType === "file" && newImageFile) {
        const fd = new FormData();
        fd.append("file", newImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = res.data.url;
      }
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
      setNewImageFile(null);
      setNewImageType("url");
      toast.success("Link criado");
    } catch {
      toast.error("Erro ao criar link");
    }
  };

  const startEdit = (link: LinkData) => {
    navigate(`/admin/links/${link.id}`);
    setEditingId(link.id);
    setEditLink({
      title: link.title,
      url: link.url,
      category_id: link.categoryId ?? null,
      color: link.color || "",
      image_url: link.imageUrl || "",
    });
    setEditImageType("url");
    setEditImageFile(null);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      const payload = { ...editLink };
      if (editImageType === "file" && editImageFile) {
        const fd = new FormData();
        fd.append("file", editImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = res.data.url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      await api.patch(`/links/${editingId}`, payload);
      toast.success("Link atualizado");
      setEditingId(null);
      setEditImageFile(null);
      setEditImageType("url");
      await refresh();
      navigate("/admin/links");
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
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-heading text-center">Links</h2>
      <form
        onSubmit={editingId ? saveEdit : handleCreate}
        className="flex flex-col gap-3 bg-white dark:bg-slate-800 p-6 rounded text-gray-900 dark:text-white"
      >
        <input
          className={fieldClass}
          placeholder="Título"
          value={editingId ? editLink.title : newLink.title}
          onChange={(e) =>
            editingId
              ? setEditLink({ ...editLink, title: e.target.value })
              : setNewLink({ ...newLink, title: e.target.value })
          }
        />
        <input
          className={fieldClass}
          placeholder="URL"
          value={editingId ? editLink.url : newLink.url}
          onChange={(e) =>
            editingId
              ? setEditLink({ ...editLink, url: e.target.value })
              : setNewLink({ ...newLink, url: e.target.value })
          }
        />
        <select
          className={fieldClass}
          value={editingId ? editLink.category_id ?? "" : newLink.category_id ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (editingId) {
              setEditLink({
                ...editLink,
                category_id: val === "" ? null : parseInt(val),
              });
            } else {
              setNewLink({
                ...newLink,
                category_id: val === "" ? null : parseInt(val),
              });
            }
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
          className={fieldClass}
          value={editingId ? editLink.color : newLink.color}
          onChange={(e) =>
            editingId
              ? setEditLink({ ...editLink, color: e.target.value })
              : setNewLink({ ...newLink, color: e.target.value })
          }

        >
          <option value="">Cor do card</option>
          {colors.map((c) => (
            <option key={c.id} value={c.value} style={{ color: c.value }}>
              {c.value}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={editingId ? editImageType : newImageType}
          onChange={(e) =>
            editingId
              ? setEditImageType(e.target.value as "url" | "file")
              : setNewImageType(e.target.value as "url" | "file")
          }

        >
          <option value="url">URL</option>
          <option value="file">Upload</option>
        </select>
        { (editingId ? editImageType : newImageType) === "url" ? (
          <input
            className={fieldClass}
            placeholder="URL da imagem"
            value={editingId ? editLink.image_url : newLink.image_url}
            onChange={(e) =>
              editingId
                ? setEditLink({ ...editLink, image_url: e.target.value })
                : setNewLink({ ...newLink, image_url: e.target.value })

            }
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            className={fieldClass}
            onChange={(e) =>
              editingId
                ? setEditImageFile(e.target.files?.[0] || null)
                : setNewImageFile(e.target.files?.[0] || null)
            }
          />
        )}
        <div className="flex gap-2">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">
            {editingId ? "Salvar" : "Adicionar"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                navigate("/admin/links");
              }}
              className="px-4 py-2 rounded border"
            >
              Cancelar
            </button>
          )}
        </div>

      </form>
      <motion.ul
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {links.map((l) => (
          <motion.li
            key={l.id}
            layout
            className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded text-gray-900 dark:text-white"
          >
            <span className="flex-1">{l.title}</span>
            <button onClick={() => startEdit(l)} className="text-sm text-blue-400">
              Editar
            </button>
            <button onClick={() => remove(l.id)} className="text-sm text-red-400">
              Excluir
            </button>

          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
