'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import {
  backupOptions,
  buildInitialSelection,
  countSelectedOptions,
  getSelectedEntities,
  type BackupSelection,
} from '@/lib/backup';

export default function ResetPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [selection, setSelection] = useState<BackupSelection>(buildInitialSelection(false));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      setError('Faca login para acessar o reset.');
      return;
    }
    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem executar reset.');
      return;
    }
    setError(null);
  }, [hasHydrated, user]);

  const selectedEntities = useMemo(() => getSelectedEntities(selection), [selection]);
  const selectedCount = useMemo(() => countSelectedOptions(selection), [selection]);
  const hasSelection = selectedCount > 0;

  const toggleAll = (value: boolean) => {
    setSelection(buildInitialSelection(value));
  };

  const executeReset = async () => {
    if (!hasSelection) {
      setError('Selecione pelo menos um item para resetar.');
      return;
    }

    if (
      !window.confirm(
        'Essa acao remove dados das entidades selecionadas. Deseja continuar?',
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/resets', { entities: selectedEntities });
      setSelection(buildInitialSelection(false));
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel executar o reset.';
      setError(typeof message === 'string' ? message : 'Erro ao executar reset.');
    } finally {
      setLoading(false);
    }
  };

  if (error && user?.role !== 'SUPERADMIN') {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="fac-page motion-stagger">
      <div className="motion-item space-y-2" style={staggerStyle(1)}>
        <h1 className="font-display text-3xl text-foreground">Reset do sistema</h1>
        <p className="text-sm text-muted-foreground">
          Limpe entidades especificas e mantenha seed de usuarios/permissoes.
        </p>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Operacao destrutiva: revise a selecao antes de executar. Use reset parcial sempre que possivel.
      </div>

      <div className="motion-item flex flex-wrap gap-2" style={staggerStyle(3)}>
        <button
          type="button"
          className="motion-press rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
          onClick={() => toggleAll(true)}
        >
          Selecionar tudo
        </button>
        <button
          type="button"
          className="motion-press rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
          onClick={() => toggleAll(false)}
        >
          Limpar
        </button>
        <span className="rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {selectedCount} selecionados
        </span>
      </div>

      <div className="motion-item grid gap-2 sm:grid-cols-2 xl:grid-cols-3" style={staggerStyle(4)}>
        {backupOptions.map((option) => (
          <label
            key={option.key}
            className="flex items-start gap-2 rounded-lg border border-border/70 bg-white/80 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={selection[option.key]}
              onChange={(event) =>
                setSelection((prev) => ({ ...prev, [option.key]: event.target.checked }))
              }
            />
            <span>
              <p className="text-sm font-semibold text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.hint}</p>
            </span>
          </label>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="button"
        className="motion-press rounded-lg bg-destructive px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
        onClick={executeReset}
        disabled={loading || !hasSelection}
      >
        {loading ? 'Executando...' : 'Executar reset'}
      </button>
    </div>
  );
}
