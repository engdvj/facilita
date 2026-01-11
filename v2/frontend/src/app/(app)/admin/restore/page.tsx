'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import AdminField from '@/components/admin/field';
import BackupSelectionPanel from '@/components/admin/backup-selection';
import {
  buildInitialSelection,
  countSelectedOptions,
  getSelectedEntities,
} from '@/lib/backup';
import { useAuthStore } from '@/stores/auth-store';

export default function RestorePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState(buildInitialSelection);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      setError('Faca login para acessar a restauracao.');
      return;
    }

    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem acessar a restauracao.');
      return;
    }

    setError(null);
  }, [hasHydrated, user]);

  const selectedEntities = useMemo(
    () => getSelectedEntities(selection),
    [selection],
  );
  const selectedCount = useMemo(
    () => countSelectedOptions(selection),
    [selection],
  );
  const hasSelection = selectedCount > 0;

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;
    setRestoreFile(file);
    setRestoreError(null);
  };

  const handleRestore = async () => {
    if (!restoreFile) {
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
      const formData = new FormData();
      formData.append('file', restoreFile);
      formData.append('entities', JSON.stringify(selectedEntities));
      formData.append('mode', 'merge');
      await api.post('/backups/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRestoreFile(null);
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
            Restauracao
          </h1>
          <p className="text-sm text-muted-foreground">
            Restaure dados de forma segura a partir de um arquivo ZIP.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <BackupSelectionPanel
          title="Itens da restauracao"
          subtitle="Escolha o que deve ser restaurado."
          selection={selection}
          setSelection={setSelection}
        />

        <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Restauracao
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Use o arquivo gerado pelo sistema para restaurar os dados.
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            <AdminField label="Arquivo de backup" htmlFor="backup-file">
              <input
                id="backup-file"
                type="file"
                accept="application/zip,.zip"
                className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground"
                onChange={handleFileChange}
                disabled={Boolean(error)}
              />
            </AdminField>

            <div className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
              {restoreFile
                ? `Arquivo selecionado: ${restoreFile.name}`
                : 'Selecione um arquivo ZIP gerado pelo sistema.'}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                  Itens: {selectedCount}
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
              disabled={!restoreFile || !hasSelection || restoring || Boolean(error)}
            >
              {restoring ? 'Restaurando...' : 'Restaurar selecao'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
