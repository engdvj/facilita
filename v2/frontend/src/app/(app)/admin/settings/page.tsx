'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import AdminField from '@/components/admin/field';
import { useAuthStore } from '@/stores/auth-store';
import type { SystemConfig } from '@/types';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import { notify } from '@/lib/notify';
import { backupOptions } from '@/lib/backup';

type DraftValue = string | number | boolean;

const categoryLabels: Record<string, string> = {
  backup: 'Backup automatico',
  storage: 'Diretorios padrao',
  system: 'Sistema',
};

const configLabels: Record<string, string> = {
  backup_directory: 'Diretorio de backup',
  backup_schedule_enabled: 'Backup automatico',
  backup_schedule_time: 'Horario do backup',
  backup_retention_days: 'Retencao (dias)',
  upload_directory: 'Diretorio de uploads',
  export_directory: 'Diretorio de exportacao',
  install_date: 'Data de instalacao',
  app_version: 'Versao do sistema',
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseValue = (config: SystemConfig): DraftValue => {
  switch (config.type) {
    case 'boolean':
      return config.value === 'true';
    case 'number': {
      const parsed = Number(config.value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    default:
      return config.value ?? '';
  }
};

const formatValue = (config: SystemConfig, value: DraftValue) => {
  switch (config.type) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return Number.isFinite(Number(value)) ? String(Math.floor(Number(value))) : '';
    default:
      return String(value ?? '');
  }
};

const serializeValue = (config: SystemConfig, value: DraftValue) => {
  switch (config.type) {
    case 'boolean':
      return Boolean(value);
    case 'number':
      return Number(value);
    default:
      return String(value ?? '');
  }
};

const isValidValue = (config: SystemConfig, value: DraftValue) => {
  if (config.type === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  }
  if (config.type === 'time') {
    return timePattern.test(String(value ?? '').trim());
  }
  if (config.type === 'path' || config.type === 'string') {
    return String(value ?? '').trim().length > 0;
  }
  return true;
};

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftValue>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [exportingAll, setExportingAll] = useState(false);

  useNotifyOnChange(error);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      setError('Faca login para acessar as configuracoes.');
      setLoading(false);
      return;
    }

    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem editar configuracoes.');
      setLoading(false);
      return;
    }

    const loadConfigs = async () => {
      setLoading(true);
      try {
        const response = await api.get<SystemConfig[]>('/system-config');
        setConfigs(response.data);
        const initialDrafts = response.data.reduce<Record<string, DraftValue>>(
          (acc, config) => {
            acc[config.key] = parseValue(config);
            return acc;
          },
          {},
        );
        setDrafts(initialDrafts);
        setError(null);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          'Nao foi possivel carregar as configuracoes.';
        setError(typeof message === 'string' ? message : 'Erro ao carregar.');
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, [hasHydrated, user]);

  const backupDirectory = useMemo(() => {
    const config = configs.find((item) => item.key === 'backup_directory');
    if (!config) return '';
    const hasDraft = Object.prototype.hasOwnProperty.call(drafts, config.key);
    const rawValue = hasDraft ? drafts[config.key] : config.value;
    return String(rawValue ?? '').trim();
  }, [configs, drafts]);

  const groupedConfigs = useMemo(() => {
    const groups = new Map<string, SystemConfig[]>();
    configs.forEach((config) => {
      const category = config.category?.trim() || 'other';
      const current = groups.get(category) ?? [];
      current.push(config);
      groups.set(category, current);
    });

    const hiddenCategories = new Set(['storage', 'system']);
    const order = ['backup', 'other'];
    const orderedKeys = [
      ...order.filter((category) => groups.has(category)),
      ...Array.from(groups.keys()).filter(
        (key) => !order.includes(key) && !hiddenCategories.has(key),
      ),
    ];

    return orderedKeys
      .filter((category) => !hiddenCategories.has(category))
      .map((category) => ({
          key: category,
          label: categoryLabels[category] || 'Outras configuracoes',
          items: (groups.get(category) || []).sort((a, b) =>
            a.key.localeCompare(b.key),
          ),
        }));
  }, [configs]);

  const handleDraftChange = (key: string, value: DraftValue) => {
    setDrafts((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (config: SystemConfig) => {
    const value = drafts[config.key];
    if (!isValidValue(config, value)) {
      notify.error('Valor invalido para esta configuracao.');
      return;
    }

    setSaving((current) => ({ ...current, [config.key]: true }));

    try {
      const response = await api.patch<SystemConfig>(
        `/system-config/${config.key}`,
        {
          value: serializeValue(config, value),
        },
      );
      const updated = response.data;
      setConfigs((current) =>
        current.map((item) => (item.key === updated.key ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated.key]: parseValue(updated),
      }));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel salvar a configuracao.';
      notify.error(typeof message === 'string' ? message : 'Erro ao salvar.');
    } finally {
      setSaving((current) => ({ ...current, [config.key]: false }));
    }
  };

  const resolveDirectoryUrl = (directory: string) => {
    if (!directory) return null;
    if (/^[a-zA-Z]:[\\/]/.test(directory)) {
      return `file:///${directory.replace(/\\/g, '/')}`;
    }
    if (directory.startsWith('/')) {
      return `file://${directory}`;
    }
    return null;
  };

  const copyBackupDirectory = async () => {
    try {
      await navigator.clipboard.writeText(backupDirectory);
      notify.info('Caminho copiado para a area de transferencia.');
    } catch {
      notify.error('Nao foi possivel copiar o caminho do backup.');
    }
  };

  const handleOpenBackupDirectory = async () => {
    if (!backupDirectory) {
      notify.error('Diretorio de backup nao configurado.');
      return;
    }

    const url = resolveDirectoryUrl(backupDirectory);
    if (!url) {
      await copyBackupDirectory();
      return;
    }

    const opened = window.open(url, '_blank');
    if (!opened) {
      await copyBackupDirectory();
    }
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    setError(null);

    try {
      const response = await api.post(
        '/backups/export',
        { entities: backupOptions.map((option) => option.key) },
        // @ts-expect-error - skipNotify is a custom property
        { responseType: 'blob', skipNotify: true },
      );
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `facilita-backup-${date}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      notify.success('Backup gerado com sucesso.');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel gerar o backup.';
      notify.error(
        typeof message === 'string' ? message : 'Erro ao gerar backup.',
      );
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="min-w-0 space-y-1 xl:flex-1">
          <h1 className="font-display text-2xl leading-tight text-foreground">
            Configuracoes do sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina o backup automatico e gere um backup completo quando quiser.
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
          Carregando configuracoes...
        </div>
      )}

      {!loading && !configs.length && !error && (
        <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
          Nenhuma configuracao encontrada.
        </div>
      )}

      <div className="space-y-3">
        {groupedConfigs.map((group) => (
          <section
            key={group.key}
            className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {group.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {group.items.length} configuracoes
                </p>
              </div>
              {group.key === 'backup' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:opacity-60"
                    onClick={handleOpenBackupDirectory}
                    disabled={!backupDirectory || Boolean(error)}
                  >
                    Abrir diretorio de backup
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] disabled:opacity-60"
                    onClick={handleExportAll}
                    disabled={exportingAll || Boolean(error)}
                  >
                    {exportingAll ? 'Gerando...' : 'Backup total agora'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3">
              {group.items.map((config) => {
                const value =
                  drafts[config.key] ?? parseValue(config);
                const formattedValue = formatValue(config, value);
                const dirty = formattedValue !== config.value;
                const valid = isValidValue(config, value);
                const isSaving = Boolean(saving[config.key]);
                const label = configLabels[config.key] || config.key;
                const inputId = `system-config-${config.key}`;

                return (
                  <div
                    key={config.key}
                    className="rounded-xl border border-border/70 bg-card/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {config.description || config.key}
                        </p>
                      </div>
                      {!config.isEditable && (
                        <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Somente leitura
                        </span>
                      )}
                      {dirty && config.isEditable && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-700">
                          Alteracoes pendentes
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      {config.isEditable ? (
                        <AdminField
                          label="Valor"
                          htmlFor={inputId}
                          hint={config.type === 'path'
                            ? 'Use caminho relativo ou absoluto.'
                            : undefined}
                        >
                          {config.type === 'boolean' ? (
                            <label className="flex items-center gap-3">
                              <span
                                className={`text-[10px] uppercase tracking-[0.2em] ${
                                  value ? 'text-emerald-700' : 'text-muted-foreground'
                                }`}
                              >
                                {value ? 'Ativo' : 'Inativo'}
                              </span>
                              <span className="relative inline-flex h-6 w-11 items-center">
                                <input
                                  id={inputId}
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={Boolean(value)}
                                  onChange={(event) =>
                                    handleDraftChange(
                                      config.key,
                                      event.target.checked,
                                    )
                                  }
                                  disabled={isSaving || Boolean(error)}
                                />
                                <span className="absolute inset-0 rounded-full border border-border/70 bg-muted/60 transition peer-checked:border-emerald-200 peer-checked:bg-emerald-100" />
                                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground transition peer-checked:translate-x-5 peer-checked:bg-emerald-600" />
                              </span>
                            </label>
                          ) : (
                            <input
                              id={inputId}
                              type={
                                config.type === 'number'
                                  ? 'number'
                                  : config.type === 'time'
                                  ? 'time'
                                  : 'text'
                              }
                              min={config.type === 'number' ? 0 : undefined}
                              step={config.type === 'number' ? 1 : undefined}
                              value={String(value ?? '')}
                              onChange={(event) => {
                                const nextValue =
                                  config.type === 'number'
                                    ? Number(event.target.value)
                                    : event.target.value;
                                handleDraftChange(config.key, nextValue);
                              }}
                              className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground"
                              disabled={isSaving || Boolean(error)}
                            />
                          )}
                        </AdminField>
                      ) : (
                        <div className="rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-muted-foreground">
                          {config.value}
                        </div>
                      )}
                    </div>

                    {config.isEditable && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          Tipo: {config.type}
                        </span>
                        <button
                          type="button"
                          className="rounded-lg bg-primary px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] disabled:opacity-60"
                          onClick={() => handleSave(config)}
                          disabled={!dirty || !valid || isSaving || Boolean(error)}
                        >
                          {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
