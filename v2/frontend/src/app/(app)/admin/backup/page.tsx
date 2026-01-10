'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import AdminField from '@/components/admin/field';
import { useAuthStore } from '@/stores/auth-store';

type BackupEntity =
  | 'companies'
  | 'units'
  | 'sectors'
  | 'users'
  | 'rolePermissions'
  | 'categories'
  | 'links'
  | 'uploadedSchedules'
  | 'notes'
  | 'tags'
  | 'tagOnLink'
  | 'tagOnSchedule';

type BackupPayload = {
  meta?: {
    createdAt?: string;
    entities?: BackupEntity[];
  };
  data?: Record<string, unknown>;
};

const backupOptions: {
  key: BackupEntity;
  label: string;
  hint: string;
}[] = [
  { key: 'companies', label: 'Empresas', hint: 'Cadastro de empresas.' },
  { key: 'units', label: 'Unidades', hint: 'Unidades vinculadas as empresas.' },
  { key: 'sectors', label: 'Setores', hint: 'Departamentos e areas.' },
  { key: 'users', label: 'Usuarios', hint: 'Perfis e credenciais.' },
  { key: 'rolePermissions', label: 'Permissoes', hint: 'Regras por role.' },
  { key: 'categories', label: 'Categorias', hint: 'Categorias de links.' },
  { key: 'links', label: 'Links', hint: 'Links e conteudo.' },
  {
    key: 'uploadedSchedules',
    label: 'Documentos',
    hint: 'Documentos enviados.',
  },
  {
    key: 'notes',
    label: 'Notas',
    hint: 'Notas pessoais e compartilhadas.',
  },
  {
    key: 'tags',
    label: 'Tags',
    hint: 'Inclui vinculos com links e documentos.',
  },
];

const buildInitialSelection = () =>
  backupOptions.reduce<Record<BackupEntity, boolean>>((acc, option) => {
    acc[option.key] = true;
    return acc;
  }, {} as Record<BackupEntity, boolean>);

export default function BackupPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState(buildInitialSelection);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePayload, setRestorePayload] = useState<BackupPayload | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      setError('Faca login para acessar o backup.');
      return;
    }

    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem acessar backup e restauracao.');
      return;
    }

    setError(null);
  }, [hasHydrated, user]);

  const selectedEntities = useMemo(
    () => {
      const base = backupOptions
        .filter((option) => selection[option.key])
        .map((option) => option.key);
      if (selection.tags) {
        base.push('tagOnLink', 'tagOnSchedule');
      }
      return Array.from(new Set(base));
    },
    [selection],
  );

  const allSelected = selectedEntities.length === backupOptions.length;
  const hasSelection = selectedEntities.length > 0;
  const createdAtLabel =
    restorePayload?.meta?.createdAt &&
    !Number.isNaN(new Date(restorePayload.meta.createdAt).getTime())
      ? new Date(restorePayload.meta.createdAt).toLocaleString('pt-BR')
      : '-';

  const toggleAll = (value: boolean) => {
    setSelection((current) => {
      const next = { ...current };
      backupOptions.forEach((option) => {
        next[option.key] = value;
      });
      return next;
    });
  };

  const handleExport = async () => {
    if (!hasSelection) {
      setError('Selecione pelo menos um item para exportar.');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const response = await api.post('/backups/export', {
        entities: selectedEntities,
      });
      const payload = response.data;
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `facilita-backup-${date}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel gerar o backup.';
      setError(typeof message === 'string' ? message : 'Erro ao gerar backup.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;
    setRestoreFile(file);
    setRestorePayload(null);
    setRestoreError(null);

    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as BackupPayload;
      setRestorePayload(parsed);
    } catch (parseError) {
      setRestoreError('Arquivo invalido. Use um JSON gerado pelo sistema.');
    }
  };

  const handleRestore = async () => {
    if (!restorePayload) {
      setRestoreError('Selecione um arquivo valido para restaurar.');
      return;
    }

    if (!hasSelection) {
      setRestoreError('Selecione pelo menos um item para restaurar.');
      return;
    }

    setRestoring(true);
    setRestoreError(null);

    try {
      await api.post('/backups/restore', {
        entities: selectedEntities,
        backup: restorePayload,
        mode: 'merge',
      });
      setRestoreFile(null);
      setRestorePayload(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel restaurar o backup.';
      setRestoreError(
        typeof message === 'string' ? message : 'Erro ao restaurar backup.',
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="min-w-0 space-y-1 xl:flex-1">
          <h1 className="font-display text-2xl leading-tight text-foreground">
            Backup e restauracao
          </h1>
          <p className="text-sm text-muted-foreground">
            Gere backups granulares e restaure apenas o que for necessario.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[260px_1fr]">
        <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Itens do backup
              </p>
              <p className="text-xs text-muted-foreground">
                Marque apenas o que voce precisa.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground"
                onClick={() => toggleAll(true)}
                disabled={allSelected}
              >
                Selecionar tudo
              </button>
              <button
                type="button"
                className="rounded-lg border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground"
                onClick={() => toggleAll(false)}
                disabled={!selectedEntities.length}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="mt-2 grid gap-1.5">
            {backupOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-start gap-2 rounded-md border border-border/70 bg-white/80 px-2.5 py-1.5 text-foreground"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border/70"
                  checked={selection[option.key]}
                  onChange={(event) =>
                    setSelection((current) => ({
                      ...current,
                      [option.key]: event.target.checked,
                    }))
                  }
                />
                <span className="flex flex-col gap-0.5 leading-tight">
                  <span className="text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Backup
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                Gere um arquivo JSON com os dados.
              </h2>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                {selectedEntities.length} itens
              </span>
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] disabled:opacity-60"
                onClick={handleExport}
                disabled={!hasSelection || exporting || Boolean(error)}
              >
                {exporting ? 'Gerando...' : 'Gerar backup'}
              </button>
            </div>
          </section>

          <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Restauracao
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                Restaure os dados selecionados.
              </h2>
            </div>

            <div className="mt-3 space-y-2">
              <AdminField label="Arquivo de backup" htmlFor="backup-file">
                <input
                  id="backup-file"
                  type="file"
                  accept="application/json"
                  className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground"
                  onChange={handleFileChange}
                  disabled={Boolean(error)}
                />
              </AdminField>

              <div className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
                {restoreFile
                  ? `Arquivo selecionado: ${restoreFile.name}`
                  : 'Selecione um arquivo JSON gerado pelo sistema.'}
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                    Data: {createdAtLabel}
                  </span>
                  <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                    Itens: {restorePayload?.meta?.entities?.length || 0}
                  </span>
                </div>
              </div>

              {restoreError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                  {restoreError}
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-lg bg-destructive px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
                onClick={handleRestore}
                disabled={
                  !restorePayload ||
                  !hasSelection ||
                  restoring ||
                  Boolean(error)
                }
              >
                {restoring ? 'Restaurando...' : 'Restaurar selecao'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
