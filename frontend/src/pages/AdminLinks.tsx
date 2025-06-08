import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api";
import { LinkData } from "../components/LinkCard";

/* ------------------------------------------------------------------ */
/* Tipos auxiliares                                                    */
/* ------------------------------------------------------------------ */
interface Category {
  id: number;
  name: string;
  color: string;
}
interface Color {
  id: number;
  value: string;
}
interface LinkFormData {
  title: string;
  url: string;
  category_id: number | null;
  color: string;
  image_url: string;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function AdminLinks() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [newLink, setNewLink] = useState<LinkFormData>({
    title: "",
    url: "",
    category_id: null,
    color: "",
    image_url: "",
  });
  const [newImageType, setNewImageType] = useState<"url" | "file">("url");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState<LinkFormData>({
    title: "",
    url: "",
    category_id: null,
    color: "",
    image_url: "",
  });
  const [editImageType, setEditImageType] = useState<"url" | "file">("url");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 4;

  /* --------- classe reutilizável de input ------------------------- */
  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";

  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  /* ---------------------------------------------------------------- */
  const refresh = async () => {
    const [linkRes, catRes, colorRes] = await Promise.all([
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
    ]);
    setLinks(linkRes.data as LinkData[]);
    setCategories(catRes.data as Category[]);
    setColors(colorRes.data as Color[]);
  };

  /* ---------------------------------------------------------------- */
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (id && links.length) {
      const l = links.find((lnk) => lnk.id === Number(id));
      if (l) {
        setEditingId(l.id);
        setEditLink({
          title: l.title,
          url: l.url,
          category_id: l.categoryId ?? null,
          color: l.color ?? "",
          image_url: l.imageUrl ?? "",
        });
        setEditImageType("url");
        setEditImageFile(null);
      }
    } else {
      setEditingId(null);
    }
  }, [id, links]);

  /* ---------------------------------------------------------------- */
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: LinkFormData = { ...newLink };

      if (newImageType === "file" && newImageFile) {
        const fd = new FormData();
        fd.append("file", newImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;

      await api.post("/links", payload);
      toast.success("Link criado");
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
      color: link.color ?? "",
      image_url: link.imageUrl ?? "",
    });
    setEditImageType("url");
    setEditImageFile(null);
  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const payload: LinkFormData = { ...editLink };

      if (editImageType === "file" && editImageFile) {
        const fd = new FormData();
        fd.append("file", editImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
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

  const remove = async (linkId: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${linkId}`);
    await refresh();
  };

  const pageCount = Math.ceil(links.length / perPage) || 1;
  const paginatedLinks = links.slice((page - 1) * perPage, page * perPage);

  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="grid gap-8 md:grid-cols-2">
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Editar Link" : "Novo Link"}</h2>
          <form
            onSubmit={(e) => (editingId ? saveEdit(e) : handleCreate(e))}
            className="flex flex-col gap-3"
          >
            <input
              className={fieldClass}
              placeholder="Título"
              value={editingId ? editLink.title : newLink.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                editingId
                  ? setEditLink({ ...editLink, title: e.target.value })
                  : setNewLink({ ...newLink, title: e.target.value })
              }
            />

            <input
              className={fieldClass}
              placeholder="URL"
              value={editingId ? editLink.url : newLink.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                editingId
                  ? setEditLink({ ...editLink, url: e.target.value })
                  : setNewLink({ ...newLink, url: e.target.value })
              }
            />

            <select
              className={fieldClass}
              value={
                editingId ? editLink.category_id ?? "" : newLink.category_id ?? ""
              }
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const parsed = e.target.value === "" ? null : Number(e.target.value);
                editingId
                  ? setEditLink({ ...editLink, category_id: parsed })
                  : setNewLink({ ...newLink, category_id: parsed });
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            editingId
              ? setEditImageType(e.target.value as "url" | "file")
              : setNewImageType(e.target.value as "url" | "file")
          }
        >
          <option value="url">URL</option>
          <option value="file">Upload</option>
        </select>

        {(editingId ? editImageType : newImageType) === "url" ? (
          <input
            className={fieldClass}
            placeholder="URL da imagem"
            value={editingId ? editLink.image_url : newLink.image_url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] ?? null;
              editingId ? setEditImageFile(file) : setNewImageFile(file);
            }}
          />
        )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white"
              >
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
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Links ({links.length})</h2>
          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {paginatedLinks.map((l) => (
              <motion.li
                key={l.id}
                layout
                className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-900 dark:text-white"
              >
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: l.color || categoryMap[l.categoryId || 0]?.color }}
                />
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
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="self-center">
                {page} / {pageCount}
              </span>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p: number) => Math.min(pageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
