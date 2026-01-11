'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { RolePermission, UserRole } from '@/types';

type PermissionKey = Exclude<
  keyof RolePermission,
  'id' | 'role' | 'createdAt' | 'updatedAt'
>;

type PermissionItem = {
  key: PermissionKey;
  label: string;
  hint: string;
};

type PermissionGroup = {
  title: string;
  description: string;
  items: PermissionItem[];
};

const permissionGroups: PermissionGroup[] = [
  {
    title: 'Acesso basico',
    description: 'Controle quem pode entrar nas areas principais.',
    items: [
      {
        key: 'canViewDashboard',
        label: 'Ver dashboard',
        hint: 'Exibe indicadores e o resumo da operacao.',
      },
      {
        key: 'canAccessAdmin',
        label: 'Acessar admin',
        hint: 'Libera o painel administrativo do portal.',
      },
      {
        key: 'restrictToOwnSector',
        label: 'Restrito ao setor',
        hint: 'Limita dados e conteudos ao setor do usuario.',
      },
    ],
  },
  {
    title: 'Usuarios',
    description: 'Permissoes relacionadas a contas e perfis.',
    items: [
      {
        key: 'canViewUsers',
        label: 'Ver usuarios',
        hint: 'Lista usuarios e detalhes de perfil.',
      },
      {
        key: 'canCreateUsers',
        label: 'Criar usuarios',
        hint: 'Permite cadastrar novos usuarios.',
      },
      {
        key: 'canEditUsers',
        label: 'Editar usuarios',
        hint: 'Atualiza dados e atribuicoes.',
      },
      {
        key: 'canDeleteUsers',
        label: 'Excluir usuarios',
        hint: 'Remove usuarios do sistema.',
      },
    ],
  },
  {
    title: 'Estrutura',
    description: 'Gestao de empresas, unidades e setores.',
    items: [
      {
        key: 'canViewSectors',
        label: 'Ver setores',
        hint: 'Consulta unidades e departamentos.',
      },
      {
        key: 'canManageSectors',
        label: 'Gerenciar setores',
        hint: 'Cria, edita ou remove setores.',
      },
    ],
  },
  {
    title: 'Conteudo',
    description: 'Administracao de links, categorias e agendas.',
    items: [
      {
        key: 'canViewLinks',
        label: 'Ver links',
        hint: 'Acesso a colecoes e favoritos.',
      },
      {
        key: 'canManageLinks',
        label: 'Gerenciar links',
        hint: 'Cria, edita e remove links.',
      },
      {
        key: 'canManageCategories',
        label: 'Gerenciar categorias',
        hint: 'Controla categorias do portal.',
      },
      {
        key: 'canManageSchedules',
        label: 'Gerenciar documentos',
        hint: 'Publica e remove documentos.',
      },
    ],
  },
  {
    title: 'Sistema',
    description: 'Controles sensiveis e operacionais.',
    items: [
      {
        key: 'canBackupSystem',
        label: 'Backup do sistema',
        hint: 'Permite exportar dados do portal.',
      },
      {
        key: 'canResetSystem',
        label: 'Reset do sistema',
        hint: 'Permite limpar dados e reiniciar.',
      },
      {
        key: 'canViewAuditLogs',
        label: 'Ver auditoria',
        hint: 'Consulta trilha de alteracoes.',
      },
      {
        key: 'canManageSystemConfig',
        label: 'Configurar sistema',
        hint: 'Ajustes globais do portal.',
      },
    ],
  },
];

const permissionKeys: PermissionKey[] = permissionGroups.flatMap((group) =>
  group.items.map((item) => item.key),
);

const roleLabels: Record<UserRole, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
  COLLABORATOR: 'Colaborador',
};

const roleDescriptions: Record<UserRole, string> = {
  SUPERADMIN: 'Acesso total e configuracoes criticas.',
  ADMIN: 'Gestao do portal e equipes.',
  COLLABORATOR: 'Acesso operativo do dia a dia.',
};

const countActivePermissions = (rolePermission: RolePermission) =>
  permissionKeys.reduce(
    (total, key) => total + Number(rolePermission[key]),
    0,
  );

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data invalida';
  return date.toLocaleDateString('pt-BR');
};

const isPermissionDirty = (
  draft: RolePermission | null,
  baseline: RolePermission | undefined,
) => {
  if (!draft || !baseline) return false;
  return permissionKeys.some((key) => draft[key] !== baseline[key]);
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('SUPERADMIN');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<RolePermission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    let active = true;

    const loadPermissions = async () => {
      if (!hasHydrated) return;

      if (!user) {
        setError('Faca login para acessar as permissoes.');
        setLoading(false);
        return;
      }

      if (user.role !== 'SUPERADMIN') {
        setError('Apenas superadmins podem gerenciar permissoes.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get<RolePermission[]>('/permissions');
        if (!active) return;
        const roleOrder: Record<UserRole, number> = {
          SUPERADMIN: 0,
          ADMIN: 1,
          COLLABORATOR: 2,
        };
        const sorted = response.data
          .slice()
          .sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
        setPermissions(sorted);
        setError(null);
      } catch (err: any) {
        if (active) {
          const statusCode = err?.response?.status;
          if (statusCode === 401 || statusCode === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar as permissoes.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (!hasHydrated) return;

    loadPermissions();

    return () => {
      active = false;
    };
  }, [hasHydrated, user]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) return permissionGroups;

    return permissionGroups
      .map((group) => {
        const groupMatches =
          group.title.toLowerCase().includes(normalizedSearch) ||
          group.description.toLowerCase().includes(normalizedSearch);
        const items = group.items.filter((item) => {
          if (item.label.toLowerCase().includes(normalizedSearch)) return true;
          if (item.hint.toLowerCase().includes(normalizedSearch)) return true;
          return false;
        });

        if (groupMatches) {
          return group;
        }

        return items.length > 0 ? { ...group, items } : null;
      })
      .filter((group): group is PermissionGroup => Boolean(group));
  }, [normalizedSearch]);

  useEffect(() => {
    if (!permissions.length) return;
    if (!permissions.some((entry) => entry.role === activeRole)) {
      setActiveRole(permissions[0].role);
    }
  }, [activeRole, permissions]);

  const activePermission = permissions.find(
    (entry) => entry.role === activeRole,
  );
  const totalPermissions = permissionKeys.length;
  const displayPermission = draft ?? activePermission;
  const activeCount = displayPermission
    ? countActivePermissions(displayPermission)
    : 0;
  const isDirty = isPermissionDirty(draft, activePermission);
  const isReadOnly = loading || saving || Boolean(error);

  useEffect(() => {
    if (!activePermission) {
      setDraft(null);
      return;
    }
    setDraft({ ...activePermission });
    setSaveError(null);
  }, [activeRole, permissions]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = permissionKeys.reduce<Record<string, boolean>>(
        (acc, key) => {
          acc[key] = Boolean(draft[key]);
          return acc;
        },
        {},
      );
      const response = await api.patch<RolePermission>(
        `/permissions/${draft.role}`,
        payload,
      );
      const updated = response.data;
      setPermissions((current) =>
        current.map((rolePermission) =>
          rolePermission.role === updated.role ? updated : rolePermission,
        ),
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel salvar as permissoes.';
      setSaveError(
        typeof message === 'string'
          ? message
          : 'Erro ao salvar permissoes.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: PermissionKey, value: boolean) => {
    setDraft((current) =>
      current ? { ...current, [key]: value } : current,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2 xl:flex-1">
          <h1 className="font-display text-3xl text-foreground">
            Permissoes
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle quem pode acessar cada area do portal.
          </p>
        </div>
        <div className="w-full xl:w-auto xl:max-w-[420px] xl:shrink-0">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar permissao"
            className="w-full min-w-0 rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="surface animate-in fade-in slide-in-from-bottom-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Perfis
            </p>
            <span className="text-xs text-muted-foreground">
              {loading ? 'Carregando...' : `${permissions.length} perfis`}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {permissions.map((rolePermission) => {
              const isActive = rolePermission.role === activeRole;
              const previewPermission =
                isActive && draft ? draft : rolePermission;
              const roleCount = countActivePermissions(previewPermission);
              return (
                <button
                  key={rolePermission.role}
                  type="button"
                  onClick={() => setActiveRole(rolePermission.role)}
                  aria-pressed={isActive}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? 'border-foreground/60 bg-card shadow-md'
                      : 'border-border/70 bg-card/70 hover:border-foreground/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {roleLabels[rolePermission.role]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {roleDescriptions[rolePermission.role]}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                        isActive
                          ? 'border-foreground/40 text-foreground'
                          : 'border-border/70 text-muted-foreground'
                      }`}
                    >
                      {roleCount}/{totalPermissions}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                      {previewPermission.restrictToOwnSector
                        ? 'Setor'
                        : 'Global'}
                    </span>
                    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                      {previewPermission.canAccessAdmin ? 'Admin' : 'Sem admin'}
                    </span>
                  </div>
                </button>
              );
            })}
            {!loading && permissions.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
                Nenhum perfil encontrado.
              </div>
            )}
          </div>
        </div>

        <div className="surface animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Permissoes
              </p>
              <p className="text-lg font-semibold text-foreground">
                {displayPermission
                  ? roleLabels[displayPermission.role]
                  : 'Perfil nao encontrado'}
              </p>
              {displayPermission && (
                <p className="text-xs text-muted-foreground">
                  {roleDescriptions[displayPermission.role]}
                </p>
              )}
            </div>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)]"
              onClick={handleSave}
              disabled={!isDirty || isReadOnly || !draft}
            >
              {saving ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
          </div>
          <div className="grid gap-4 p-4 sm:p-6">
            {displayPermission && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                    {activeCount} de {totalPermissions} ativas
                  </span>
                  <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                    {displayPermission.restrictToOwnSector
                      ? 'Restrito ao setor'
                      : 'Acesso global'}
                  </span>
                  {activePermission && (
                    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                      Atualizado em {formatDate(activePermission.updatedAt)}
                    </span>
                  )}
                  {isDirty && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
                      Alteracoes pendentes
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {normalizedSearch ? 'Filtro ativo' : 'Todos os grupos'}
                </span>
              </div>
            )}

            {saveError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-xs text-destructive">
                {saveError}
              </div>
            )}

            {filteredGroups.map((group) => {
              const groupActiveCount = displayPermission
                ? group.items.reduce(
                    (total, item) =>
                      total + Number(displayPermission[item.key]),
                    0,
                  )
                : 0;
              return (
                <div
                  key={group.title}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {group.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {groupActiveCount}/{group.items.length}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {group.items.map((item) => {
                      const enabled = displayPermission
                        ? displayPermission[item.key]
                        : false;
                      const toggleId = `${activeRole}-${item.key}`;
                      return (
                        <div
                          key={item.key}
                          className={`flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-white/80 px-3 py-2 ${
                            isReadOnly ? 'opacity-70' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.hint}
                            </p>
                          </div>
                          <label
                            htmlFor={toggleId}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={`text-[10px] uppercase tracking-[0.2em] ${
                                enabled
                                  ? 'text-emerald-700'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {enabled ? 'Ativo' : 'Bloqueado'}
                            </span>
                            <span className="relative inline-flex h-6 w-11 items-center">
                              <input
                                id={toggleId}
                                type="checkbox"
                                className="peer sr-only"
                                checked={Boolean(enabled)}
                                onChange={(event) =>
                                  handleToggle(item.key, event.target.checked)
                                }
                                disabled={isReadOnly || !draft}
                              />
                              <span className="absolute inset-0 rounded-full border border-border/70 bg-muted/60 transition peer-checked:border-emerald-200 peer-checked:bg-emerald-100" />
                              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground transition peer-checked:translate-x-5 peer-checked:bg-emerald-600" />
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!filteredGroups.length && (
              <div className="rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma permissao encontrada.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
