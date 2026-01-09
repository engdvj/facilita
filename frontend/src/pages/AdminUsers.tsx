import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";

export default function AdminUsers() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [users, setUsers] = useState<{
    id: number;
    username: string;
    isAdmin: boolean;
  }[]>([]);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    is_admin: false,
  });

  const [editingId, setEditingId] = useState<number | null>(id ? Number(id) : null);
  const [editUser, setEditUser] = useState({
    username: "",
    password: "",
    is_admin: false,
  });

  const [page, setPage] = useState(1);
  const perPage = 5;

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (id && users.length) {
      const u = users.find((u) => u.id === Number(id));
      if (u) {
        setEditingId(u.id);
        setEditUser({
          username: u.username,
          password: "",
          is_admin: u.isAdmin,
        });
      }
    } else {
      setEditingId(null);
    }
  }, [id, users]);

  const refresh = async () => {
    const res = await api.get("/users");
    setUsers([...res.data].sort((a, b) => a.username.localeCompare(b.username)));
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/users", newUser);
      await refresh();
      setNewUser({ username: "", password: "", is_admin: false });
      toast.success("Usuário criado");
    } catch {
      toast.error("Erro ao criar usuário");
    }
  };

  const startEdit = (u: { id: number }) => {
    navigate(`/admin/users/${u.id}`);
  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId === null) return;
    const payload: any = {
      username: editUser.username,
      is_admin: editUser.is_admin,
    };
    if (editUser.password) payload.password = editUser.password;
    try {
      await api.patch(`/users/${editingId}`, payload);
      toast.success("Usuário atualizado");
      setEditingId(null);
      await refresh();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const remove = async (uid: number) => {
    if (!confirm("Excluir usuário?")) return;
    await api.delete(`/users/${uid}`);
    await refresh();
  };

  const pageCount = Math.ceil(users.length / perPage) || 1;
  const paginated = users.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ color: 'var(--text-color)' }}>
      <div className="grid gap-8 md:grid-cols-2">
        <section className="app-panel text-white/90 rounded-3xl p-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar' : 'Novo'} Usuário</h2>
          <form onSubmit={(e) => (editingId ? saveEdit(e) : handleCreate(e))} className="flex flex-col gap-3">
            <input
              className={fieldClass}
              placeholder="Usuário"
              value={editingId ? editUser.username : newUser.username}
              onChange={(e) =>
                editingId
                  ? setEditUser({ ...editUser, username: e.target.value })
                  : setNewUser({ ...newUser, username: e.target.value })
              }
            />
            <input
              type="password"
              className={fieldClass}
              placeholder="Senha"
              value={editingId ? editUser.password : newUser.password}
              onChange={(e) =>
                editingId
                  ? setEditUser({ ...editUser, password: e.target.value })
                  : setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editingId ? editUser.is_admin : newUser.is_admin}
                onChange={(e) =>
                  editingId
                    ? setEditUser({ ...editUser, is_admin: e.target.checked })
                    : setNewUser({ ...newUser, is_admin: e.target.checked })
                }
              />
              Admin
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary px-4 py-2 rounded">
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    navigate('/admin/users');
                  }}
                  className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="app-panel text-white/90 rounded-3xl flex flex-col p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Usuários ({users.length})</h2>
          <motion.ul className="space-y-3 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {paginated.map((u) => (
              <motion.li
                key={u.id}
                layout
                className="panel-item flex items-center gap-2 p-3 rounded-2xl text-white/90 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="flex-1">{u.username}</span>
                {u.isAdmin && (
                <span className="text-xs bg-[var(--accent-color)] text-slate-900 px-2 py-0.5 rounded-full font-semibold">
                  ADM
                </span>
                )}
                <button onClick={() => startEdit(u)} className="p-1 hover:text-[var(--accent-color)]">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(u.id)} className="p-1 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center text-sm text-white/70">
                {page} / {pageCount}
              </span>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 disabled:opacity-50"
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
