import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import api from "../api";

interface FileData {
  id: number;
  title: string;
  fileUrl: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
}

interface Category {
  id: number;
  name: string;
}
interface User {
  id: number;
  username: string;
}

export default function AdminFiles() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [newFileData, setNewFileData] = useState<{ title: string; category_id: number | null; user_id: number | null }>(
    { title: "", category_id: null, user_id: null }
  );
  const [newFile, setNewFile] = useState<File | null>(null);

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";

  const refresh = async () => {
    const [fileRes, catRes, userRes] = await Promise.all([
      api.get("/schedules"),
      api.get("/categories"),
      api.get("/users"),
    ]);
    setFiles(fileRes.data as FileData[]);
    setCategories(catRes.data as Category[]);
    setUsers(userRes.data as User[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFile) return;
    const fd = new FormData();
    fd.append("file", newFile);
    const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    const payload = {
      title: newFileData.title,
      file_url: (res.data as { url: string }).url,
      category_id: newFileData.category_id || undefined,
      user_id: newFileData.user_id || undefined,
    };
    await api.post("/schedules", payload);
    setNewFile(null);
    setNewFileData({ title: "", category_id: null, user_id: null });
    await refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Excluir arquivo?")) return;
    await api.delete(`/schedules/${id}`);
    await refresh();
  };

  const categoryMap = useMemo(() => {
    const m: Record<number, string> = {};
    categories.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [categories]);

  const userMap = useMemo(() => {
    const m: Record<number, string> = {};
    users.forEach((u) => (m[u.id] = u.username));
    return m;
  }, [users]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ color: 'var(--text-color)' }}>
      <div className="grid gap-8 md:grid-cols-2">
        <section className="app-panel text-white/90 rounded-3xl p-6">
          <h2 className="text-lg font-semibold mb-4">Novo Arquivo</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              className={fieldClass}
              placeholder="Título"
              value={newFileData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewFileData({ ...newFileData, title: e.target.value })
              }
            />
            <select
              className={fieldClass}
              value={newFileData.user_id ?? ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewFileData({ ...newFileData, user_id: e.target.value ? Number(e.target.value) : null })
              }
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
              value={newFileData.category_id ?? ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewFileData({ ...newFileData, category_id: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="file"
              className={fieldClass}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFile(e.target.files?.[0] ?? null)}
            />
            <button type="submit" className="btn-primary px-4 py-2 rounded">
              Adicionar
            </button>
          </form>
        </section>
        <section className="app-panel text-white/90 rounded-3xl flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Arquivos ({files.length})</h2>
          <motion.ul className="space-y-3 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {files.map((f) => (
              <motion.li
                key={f.id}
                layout
                className="panel-item flex items-center gap-2 text-white/90 p-3 rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="flex-1">
                  {f.title}
                  {f.categoryId && (
                    <span className="ml-2 text-xs opacity-80">[{categoryMap[f.categoryId]}]</span>
                  )}
                  {f.userId && (
                    <span className="ml-2 text-xs opacity-80">@{userMap[f.userId]}</span>
                  )}
                </span>
                <a href={f.fileUrl} className="underline mr-2" target="_blank" rel="noopener noreferrer">
                  arquivo
                </a>
                <button onClick={() => remove(f.id)} className="p-1 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>
    </div>
  );
}

