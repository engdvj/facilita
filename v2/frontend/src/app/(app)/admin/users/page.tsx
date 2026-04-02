'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import ImageSelector from '@/components/admin/image-selector';
import AdminModal from '@/components/admin/modal';
import UserAvatar from '@/components/user-avatar';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/error';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { User, UserRole, UserStatus } from '@/types';

const emptyForm = {
  name: '',
  username: '',
  password: '',
  role: 'USER' as UserRole,
  status: 'ACTIVE' as UserStatus,
  avatarUrl: '',
};
type UserFormErrors = {
  name?: string;
  username?: string;
  password?: string;
};

export default function UsersPage() {
  const authUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [deleting, setDeleting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const isSuperadmin = authUser?.role === 'SUPERADMIN';

  const load = useCallback(async () => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar usuários.'));
    } finally {
      setLoading(false);
    }
  }, [isSuperadmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return users
      .filter((user) => (roleFilter === 'ALL' ? true : user.role === roleFilter))
      .filter((user) => (statusFilter === 'ALL' ? true : user.status === statusFilter))
      .filter((user) => {
        if (!term) return true;
        return `${user.name} ${user.email}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, globalSearch, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
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
      avatarUrl: user.avatarUrl || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors: UserFormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Nome é obrigatório.';
    }

    if (!form.username.trim()) {
      nextErrors.username = 'Usuário é obrigatório.';
    }

    if (!editing && !form.password.trim()) {
      nextErrors.password = 'Senha é obrigatória ao criar usuário.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          name: form.name,
          username: form.username,
          ...(form.password ? { password: form.password } : {}),
          role: form.role,
          status: form.status,
          avatarUrl: form.avatarUrl || undefined,
        });
      } else {
        await api.post('/users', {
          name: form.name,
          username: form.username,
          password: form.password,
          role: form.role,
          status: form.status,
          avatarUrl: form.avatarUrl || undefined,
        });
      }

      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}`, {
        status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
    } catch {
      // O interceptor global já notifica o erro.
    } finally {
      await load();
    }
  };

  const remove = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.id === authUser?.id) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${confirmTarget.id}`);
      setModalOpen(false);
      setEditing(null);
    } finally {
      setDeleting(false);
      setConfirmTarget(null);
      await load();
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="fac-panel px-6 py-6 text-[14px] text-muted-foreground">
        Acesso restrito ao superadmin.
      </div>
    );
  }

  return (
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <h1 className="fac-subtitle">Usuários</h1>
          <p className="text-[15px] text-muted-foreground">Perfis, papeis e acessos da equipe administrativa.</p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-[180px_180px_auto]">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as 'ALL' | UserRole)}
            className="fac-select"
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
            className="fac-select"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>

          <button type="button" className="fac-button-primary" onClick={openCreate}>
            Novo usuário
          </button>
        </div>
      </section>

      <section className="fac-panel">
        <div className="fac-panel-head">
          <p className="fac-panel-title">Lista</p>
          <p className="fac-panel-meta">{filtered.length} registros</p>
        </div>

        <div className="fac-panel-body">
          {loading ? (
            <div className="fac-loading-state">Carregando usuários...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhum usuário encontrado.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((user) => (
                <article key={user.id} className={`fac-card w-[220px] max-w-full ${user.status === 'INACTIVE' ? 'opacity-80 grayscale' : ''}`}>
                  <button
                    type="button"
                    className="relative aspect-square w-full overflow-hidden bg-muted text-left"
                    onClick={() => openEdit(user)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/5 dark:from-black/35 dark:to-black/20" />

                    <div className="absolute left-3 top-3">
                      <UserAvatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        size="md"
                        className="!h-12 !w-12 !rounded-full border border-black/10 bg-white/95 shadow-sm"
                      />
                    </div>

                  </button>

                  <div className="flex items-center justify-between border-t border-border bg-white/92 px-3 py-2">
                    <button
                      type="button"
                      className="min-w-0 flex-1 pr-2 text-left"
                      onClick={() => openEdit(user)}
                    >
                      <div>
                        <p className="line-clamp-1 text-[14px] font-semibold text-foreground">{user.name}</p>
                        <p className="line-clamp-1 mt-1 text-[12px] text-muted-foreground">{user.email}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={user.status === 'ACTIVE'}
                      aria-label={user.status === 'ACTIVE' ? `Desativar ${user.name}` : `Ativar ${user.name}`}
                      className={`fac-toggle shrink-0 ${user.id === authUser?.id ? 'cursor-not-allowed opacity-50' : ''}`}
                      data-state={user.status === 'ACTIVE' ? 'on' : 'off'}
                      onClick={() => {
                        if (user.id !== authUser?.id) {
                          void toggleStatus(user);
                        }
                      }}
                      disabled={user.id === authUser?.id}
                    >
                      <span className="fac-toggle-dot" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
        description="Configure credenciais e acessos do usuário."
        onClose={() => setModalOpen(false)}
        panelClassName="max-w-[760px]"
        footer={
          <>
            {editing && editing.id !== authUser?.id ? (
              <button
                type="button"
                className="fac-button-secondary text-[11px]"
                onClick={() => setConfirmTarget(editing)}
                disabled={saving || deleting}
              >
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            ) : null}

            <button
              type="button"
              className="fac-button-secondary text-[11px]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="fac-button-primary text-[11px]"
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
        <section className="fac-form-card">
          <p className="fac-form-title">Dados</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="fac-label">Nome</label>
              <input
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`fac-input ${formErrors.name ? 'border-destructive' : ''}`}
              />
              {formErrors.name ? (
                <p className="mt-1 text-[12px] text-destructive">{formErrors.name}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label className="fac-label">Usuário</label>
              <input
                value={form.username}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, username: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className={`fac-input ${formErrors.username ? 'border-destructive' : ''}`}
              />
              {formErrors.username ? (
                <p className="mt-1 text-[12px] text-destructive">{formErrors.username}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label className="fac-label">Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, password: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`fac-input ${formErrors.password ? 'border-destructive' : ''}`}
                placeholder={editing ? 'Nova senha (opcional)' : ''}
              />
              {formErrors.password ? (
                <p className="mt-1 text-[12px] text-destructive">{formErrors.password}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label className="fac-label">Imagem</label>
              <ImageSelector
                value={form.avatarUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, avatarUrl: url }))}
              />
              <p className="mt-1 text-[12px] text-muted-foreground">Opcional</p>
            </div>
          </div>
        </section>

        <section className="fac-form-card mt-4">
          <p className="fac-form-title">Acesso</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="fac-label">Role</label>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
                }
                className="fac-select"
              >
                <option value="USER">COLLABORATOR</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </div>

            <div>
              <label className="fac-label">Status</label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as UserStatus }))
                }
                className="fac-select"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>
        </section>
      </AdminModal>

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title="Remover usuário"
        description={
          confirmTarget
            ? `Confirma a remoção permanente do usuário "${confirmTarget.name}"?`
            : 'Confirma a remoção permanente deste usuário?'
        }
        confirmLabel="Remover usuário"
        loading={deleting}
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}
