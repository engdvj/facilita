'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import AdminModal from '@/components/admin/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { User, UserRole, UserStatus } from '@/types';

const emptyForm = {
  name: '',
  username: '',
  password: '',
  role: 'USER' as UserRole,
  status: 'ACTIVE' as UserStatus,
};

export default function UsersPage() {
  const authUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const isSuperadmin = authUser?.role === 'SUPERADMIN';

  const load = async () => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar usuarios.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSuperadmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((user) => {
        if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
        if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
        if (!term) return true;
        return `${user.name} ${user.email}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [roleFilter, search, statusFilter, users]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      username: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.username.trim()) return;

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          name: form.name,
          username: form.username,
          ...(form.password ? { password: form.password } : {}),
          role: form.role,
          status: form.status,
        });
      } else {
        await api.post('/users', {
          name: form.name,
          username: form.username,
          password: form.password,
          role: form.role,
          status: form.status,
        });
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user: User) => {
    if (!window.confirm(`Remover usuario ${user.name}?`)) return;
    await api.delete(`/users/${user.id}`);
    await load();
  };

  const statusColor = (status: UserStatus) =>
    status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700';

  if (!isSuperadmin) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
        Acesso restrito ao superadmin.
      </div>
    );
  }

  return (
    <div className="space-y-5 motion-stagger">
      <div
        className="motion-item flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        style={staggerStyle(1)}
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gerencie contas da plataforma.</p>
        </div>
        <button
          type="button"
          className="motion-press rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground"
          onClick={openCreate}
        >
          Novo usuario
        </button>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Controle de acesso centralizado. Ajuste role/status com cuidado para evitar bloqueios ou permissoes indevidas.
      </div>

      <div className="motion-item grid gap-3 sm:grid-cols-[1fr_170px_170px]" style={staggerStyle(3)}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou email"
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as 'ALL' | UserRole)}
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        >
          <option value="ALL">Todas as roles</option>
          <option value="SUPERADMIN">SUPERADMIN</option>
          <option value="USER">USER</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'ALL' | UserStatus)
          }
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando usuarios...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum usuario encontrado.
        </div>
      ) : (
        <div className="motion-item overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-[0_12px_24px_rgba(16,44,50,0.12)]" style={staggerStyle(4)}>
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor(user.status)}`}>
                    {user.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                        onClick={() => openEdit(user)}
                      >
                        Editar
                      </button>
                      {user.id !== authUser?.id && (
                        <button
                          type="button"
                          className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-destructive"
                          onClick={() => remove(user)}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar usuario' : 'Novo usuario'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              onClick={save}
              disabled={
                saving ||
                !form.name.trim() ||
                !form.username.trim() ||
                (!editing && !form.password.trim())
              }
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Para novo usuario, senha e obrigatoria. Em edicao, informe senha apenas se quiser redefinir.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <input
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            placeholder="Email"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder={editing ? 'Nova senha (opcional)' : 'Senha'}
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
            }
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          >
            <option value="USER">USER</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
          </select>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as UserStatus }))
            }
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
