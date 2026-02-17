'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import BackupSelectionPanel from '@/components/admin/backup-selection';
import {
  buildInitialSelection,
  countSelectedOptions,
  getSelectedEntities,
} from '@/lib/backup';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/lib/notify';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

export default function BackupPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState(buildInitialSelection);
  const [exporting, setExporting] = useState(false);

  useNotifyOnChange(error);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      setError('Faca login para acessar o backup.');
      return;
    }

    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem acessar o backup.');
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

  const handleExport = async () => {
    if (!hasSelection) {
      notify.error('Selecione pelo menos um item para exportar.');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const response = await api.post(
        '/backups/export',
        { entities: selectedEntities },
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
        err?.response?.data?.message ||
        'Nao foi possivel gerar o backup.';
      notify.error(
        typeof message === 'string' ? message : 'Erro ao gerar backup.',
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fac-page">
      <div className="flex flex-col gap-2">
        <div className="min-w-0 space-y-1 xl:flex-1">
          <h1 className="font-display text-2xl leading-tight text-foreground">
            Backup
          </h1>
          <p className="text-sm text-muted-foreground">
            Gere backups granulares e mantenha os arquivos organizados.
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <BackupSelectionPanel
          title="Itens do backup"
          subtitle="Marque apenas o que voce precisa."
          selection={selection}
          setSelection={setSelection}
        />

        <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Backup manual
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Gere um arquivo compactado com dados e arquivos.
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
              {hasSelection
                ? 'Revise os itens selecionados antes de gerar o arquivo.'
                : 'Selecione pelo menos um item para gerar o backup.'}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                  Itens: {selectedCount}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-primary px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground shadow-[0_10px_18px_rgba(16,44,50,0.18)] disabled:opacity-60"
              onClick={handleExport}
              disabled={!hasSelection || exporting || Boolean(error)}
            >
              {exporting ? 'Gerando...' : 'Gerar backup'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
