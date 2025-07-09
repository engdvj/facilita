import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
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
  name?: string;

}
interface LinkFormData {
  title: string;
  url: string;
  file_url: string;
  user_id: number | null;
  category_id: number | null;
  color: string;
  image_url: string;
}

interface FileItem {
  id: number;
  title: string;
  fileUrl: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
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
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);

  const [newLink, setNewLink] = useState<LinkFormData>({
    title: "",
    url: "",
    file_url: "",
    user_id: null,
    category_id: null,
    color: "",
    image_url: "",
  });
  const [newImageType, setNewImageType] = useState<"url" | "file">("url");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newHasFile, setNewHasFile] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [newLinkType, setNewLinkType] = useState<'link' | 'file'>('link');


  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState<LinkFormData>({
    title: "",
    url: "",
    file_url: "",
    user_id: null,
    category_id: null,
    color: "",
    image_url: "",
  });
  const [editImageType, setEditImageType] = useState<"url" | "file">("url");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editHasFile, setEditHasFile] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);

  const [editLinkType, setEditLinkType] = useState<'link' | 'file'>('link');

  useEffect(() => {
    if (newLinkType === 'file') {
      setNewHasFile(false);
      setNewFile(null);
    }
  }, [newLinkType]);

  useEffect(() => {
    if (editLinkType === 'file') {
      setEditHasFile(false);
      setEditFile(null);
    }
  }, [editLinkType]);


  const [page, setPage] = useState(1);
  const perPage = 5;

  /* --------- classe reutilizável de input ------------------------- */
  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";

  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  /* ---------------------------------------------------------------- */
  const refresh = async () => {
    const [linkRes, catRes, colorRes, userRes, fileRes] = await Promise.all([
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
      api.get("/users"),
      api.get("/schedules"),
    ]);
    setLinks(
      [...(linkRes.data as LinkData[])].sort((a, b) =>
        a.title.localeCompare(b.title)
      )
    );
    setCategories(
      [...(catRes.data as Category[])].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    setColors(
      [...(colorRes.data as Color[])].sort((a, b) =>
        (a.name || a.value).localeCompare(b.name || b.value)
      )
    );
    setUsers(
      [...(userRes.data as { id: number; username: string }[])].sort((a, b) =>
        a.username.localeCompare(b.username)
      )
    );
    setFiles(fileRes.data as FileItem[]);
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
          file_url: l.fileUrl ?? "",
          user_id: l.userId ?? null,
          category_id: l.categoryId ?? null,
          color: l.color ?? "",
          image_url: l.imageUrl ?? "",
        });
        setEditLinkType(l.fileUrl ? 'file' : 'link');
        setEditImageType("url");
        setEditImageFile(null);
        setEditHasFile(!!l.fileUrl);
        setEditFile(null);
      }
    } else {
      setEditingId(null);
      setEditHasFile(false);
      setEditFile(null);
      setEditLinkType('link');

    }
  }, [id, links]);

  /* ---------------------------------------------------------------- */
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: LinkFormData = { ...newLink };

      if (newLinkType === 'file') {
        payload.url = newLink.file_url;
      }

      if (newLinkType === 'link' && newHasFile && newFile) {
        const fd = new FormData();
        fd.append("file", newFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.file_url = (res.data as { url: string }).url;
      }

      if (newImageType === "file" && newImageFile) {
        const fd = new FormData();
        fd.append("file", newImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      if (!payload.file_url) delete (payload as any).file_url;

      await api.post("/links", payload);
      toast.success("Link criado");
      await refresh();

      setNewLink({
        title: "",
        url: "",
        file_url: "",
        user_id: null,
        category_id: null,
        color: "",
        image_url: "",
      });
      setNewImageFile(null);
      setNewImageType("url");
      setNewFile(null);
      setNewHasFile(false);
      setNewLinkType('link');

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
      file_url: link.fileUrl ?? "",
      user_id: link.userId ?? null,
      category_id: link.categoryId ?? null,
      color: link.color ?? "",
      image_url: link.imageUrl ?? "",
    });
    setEditImageType("url");
    setEditImageFile(null);
    setEditHasFile(!!link.fileUrl);
    setEditFile(null);

  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const payload: LinkFormData = { ...editLink };

      if (editLinkType === 'file') {
        payload.url = editLink.file_url;
      }

      if (editLinkType === 'link' && editHasFile && editFile) {
        const fd = new FormData();
        fd.append("file", editFile);

        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.file_url = (res.data as { url: string }).url;
      } else if (editLinkType === 'link' && !editHasFile) {
        payload.file_url = null as any;

      }

      if (editImageType === "file" && editImageFile) {
        const fd = new FormData();
        fd.append("file", editImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      if (!payload.file_url) delete (payload as any).file_url;

      await api.patch(`/links/${editingId}`, payload);
      toast.success("Link atualizado");
      setEditingId(null);
      setEditImageFile(null);
      setEditImageType("url");
      setEditFile(null);
      setEditHasFile(false);
      setEditLinkType('link');

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

  const sortedLinks = [...links].sort((a, b) => a.title.localeCompare(b.title));
  const pageCount = Math.ceil(sortedLinks.length / perPage) || 1;
  const paginatedLinks = sortedLinks.slice((page - 1) * perPage, page * perPage);

  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ color: 'var(--text-color)' }}>
      <div className="grid gap-8 md:grid-cols-2">
        <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl p-6">
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

            <select
              className={fieldClass}
              value={editingId ? editLinkType : newLinkType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                editingId
                  ? setEditLinkType(e.target.value as 'link' | 'file')
                  : setNewLinkType(e.target.value as 'link' | 'file')
              }
            >
              <option value="link">Link</option>
              <option value="file">Arquivo</option>
            </select>

            { (editingId ? editLinkType : newLinkType) === 'link' ? (
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
            ) : (
              <select
                className={fieldClass}
                value={editingId ? editLink.file_url : newLink.file_url}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const fileUrl = e.target.value;
                  if (editingId) {
                    const f = files.find((fl) => fl.fileUrl === fileUrl);
                    setEditLink({
                      ...editLink,
                      file_url: fileUrl,
                      user_id: f?.userId ?? editLink.user_id,
                      category_id: f?.categoryId ?? editLink.category_id,
                    });
                  } else {
                    const f = files.find((fl) => fl.fileUrl === fileUrl);
                    setNewLink({
                      ...newLink,
                      file_url: fileUrl,
                      user_id: f?.userId ?? null,
                      category_id: f?.categoryId ?? null,
                    });
                  }
                }}
              >
                <option value="">Arquivo</option>
                {files.map((f) => (
                  <option key={f.id} value={f.fileUrl}>
                    {f.title}
                    {f.category ? ` [${f.category}]` : ""}
                    {f.user ? ` - ${f.user}` : ""}
                  </option>
                ))}
              </select>
            ) }

            <select
              className={fieldClass}
              value={
                editingId ? editLink.user_id ?? "" : newLink.user_id ?? ""
              }
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const parsed = e.target.value === "" ? null : Number(e.target.value);
                editingId
                  ? setEditLink({ ...editLink, user_id: parsed })
                  : setNewLink({ ...newLink, user_id: parsed });
              }}
            >
              <option value="">Usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>

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
            <option
              key={c.id}
              value={c.value}
              style={{ backgroundColor: c.value, color: "#000" }}
            >
              {c.name ? `${c.name} - ${c.value}` : c.value}

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
          {(editingId ? editLinkType : newLinkType) === 'link' && (
            <>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editingId ? editHasFile : newHasFile}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                editingId
                  ? setEditHasFile(e.target.checked)
                  : setNewHasFile(e.target.checked)
              }
            />
            Possui arquivo
          </label>

          {(editingId ? editHasFile : newHasFile) && (

            <input
              type="file"
              className={fieldClass}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0] ?? null;
                editingId ? setEditFile(f) : setNewFile(f);

              }}
            />
          )}
            </>
          )}

        <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary px-4 py-2 rounded"
              >
                {editingId ? "Salvar" : "Adicionar"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditHasFile(false);
                    setEditFile(null);
                    setEditLinkType('link');

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

        <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Links ({links.length})</h2>
          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {paginatedLinks.map((l) => {
              const Icon = (Icons as any)[categoryMap[l.categoryId || 0]?.icon || "Link2"];
              return (
                <motion.li
                  key={l.id}
                  layout
                  className="flex items-center gap-2 bg-[var(--card-background)] text-white p-3 rounded-2xl shadow-md hover:shadow-xl"
                >
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: l.color || categoryMap[l.categoryId || 0]?.color }}
                  />
                  {Icon && <Icon size={16} className="opacity-70" />}
                  {l.url ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 underline"
                    >
                      {l.title}
                    </a>
                  ) : (
                    <span className="flex-1">{l.title}</span>
                  )}
                  {l.fileUrl && (
                    <a
                      href={l.fileUrl}
                      className="underline mr-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      arquivo
                    </a>
                  )}
                  {l.user && (
                    <span className="text-xs px-2 py-1 rounded bg-slate-700 opacity-80">
                      {l.user}
                    </span>
                  )}
                  <button onClick={() => startEdit(l)} className="p-1 hover:text-[var(--accent-color)]">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(l.id)} className="p-1 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              );
            })}
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
