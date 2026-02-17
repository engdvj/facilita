'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { RolePermission, UserRole } from '@/types';

type EditablePermission = Exclude<
  keyof RolePermission,
  'id' | 'role' | 'createdAt' | 'updatedAt'
>;

const permissionLabels: Record<EditablePermission, string> = {
  canViewDashboard: 'Ver dashboard',
  canAccessAdmin: 'Acessar admin',
  canViewUsers: 'Ver usuarios',
  canCreateUsers: 'Criar usuarios',
  canEditUsers: 'Editar usuarios',
  canDeleteUsers: 'Excluir usuarios',
  canViewLinks: 'Ver links',
  canManageLinks: 'Gerenciar links',
  canManageCategories: 'Gerenciar categorias',
  canManageSchedules: 'Gerenciar documentos',
  canViewPrivateContent: 'Ver conteudo privado',
  canBackupSystem: 'Executar backup',
  canResetSystem: 'Executar reset',
  canViewAuditLogs: 'Ver auditoria',
  canManageSystemConfig: 'Gerenciar configuracoes',
  canManageShares: 'Gerenciar compartilhamentos',
};

const roleOrder: UserRole[] = ['SUPERADMIN', 'USER'];

export default function PermissionsPage() {
  const user = useAuthStore((state) => state.user);
  const [rows, setRows] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const load = async () => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/permissions');
      const data = Array.isArray(response.data) ? response.data : [];
      setRows(
        data.sort(
          (a: RolePermission, b: RolePermission) =>
            roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
        ),
      );
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar permissoes.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar permissoes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isSuperadmin]);

  const columns = useMemo(() => Object.keys(permissionLabels) as EditablePermission[], []);

  const toggle = (role: UserRole, key: EditablePermission) => {
    setRows((prev) =>
      prev.map((row) =>
        row.role === role
          ? {
              ...row,
              [key]: !row[key],
            }
          : row,
      ),
    );
  };

  const saveRole = async (row: RolePermission) => {
    setSavingRole(row.role);
    try {
      const payload = columns.reduce((acc, key) => {
        acc[key] = Boolean(row[key]);
        return acc;
      }, {} as Record<EditablePermission, boolean>);

      await api.patch(`/permissions/${row.role}`, payload);
      await load();
    } finally {
      setSavingRole(null);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
        Acesso restrito ao superadmin.
      </div>
    );
  }

  return (
    <div className="fac-page motion-stagger">
      <div className="motion-item space-y-2" style={staggerStyle(1)}>
        <h1 className="font-display text-3xl text-foreground">Permissoes</h1>
        <p className="text-sm text-muted-foreground">
          Matriz editavel para os papeis SUPERADMIN e USER.
        </p>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Altere uma role por vez e salve em seguida. Evite mudanças em lote sem validar o impacto no fluxo diario.
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando permissoes...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="motion-item space-y-4" style={staggerStyle(3)}>
          {rows.map((row, index) => (
            <section
              key={row.role}
              className="motion-item rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.12)]"
              style={staggerStyle(index + 4)}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Role</p>
                  <h2 className="text-lg font-semibold text-foreground">{row.role}</h2>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60"
                  onClick={() => saveRole(row)}
                  disabled={savingRole === row.role}
                >
                  {savingRole === row.role ? 'Salvando...' : 'Salvar alteracoes'}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {columns.map((key) => (
                  <label
                    key={`${row.role}-${key}`}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(row[key])}
                      onChange={() => toggle(row.role, key)}
                    />
                    <span>{permissionLabels[key]}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
