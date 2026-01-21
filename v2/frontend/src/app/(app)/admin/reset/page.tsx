'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import useNotifyOnChange from '@/hooks/use-notify-on-change';

type ResetEntity =
  | 'companies'
  | 'units'
  | 'sectors'
  | 'users'
  | 'rolePermissions'
  | 'categories'
  | 'links'
  | 'uploadedSchedules'
  | 'notes';

const resetOptions: {
  key: ResetEntity;
  label: string;
  hint: string;
}[] = [
  {
    key: 'companies',
    label: 'Empresas',
    hint: 'Remove empresas e dados obrigatorios vinculados.',
  },
  { key: 'units', label: 'Unidades', hint: 'Apaga unidades e setores.' },
  { key: 'sectors', label: 'Setores', hint: 'Remove setores e vinculos.' },
  { key: 'users', label: 'Usuarios', hint: 'Apaga contas, acessos e favoritos.' },
  {
    key: 'rolePermissions',
    label: 'Permissoes',
    hint: 'Reinicia as regras por role.',
  },
  {
    key: 'categories',
    label: 'Categorias',
    hint: 'Apaga categorias e desvincula itens.',
  },
  { key: 'links', label: 'Links', hint: 'Remove links e historico.' },
  {
    key: 'uploadedSchedules',
    label: 'Documentos',
    hint: 'Remove documentos enviados.',
  },
  {
    key: 'notes',
    label: 'Notas',
    hint: 'Remove notas pessoais e compartilhadas.',
  },
];

const buildInitialSelection = () =>
  resetOptions.reduce<Record<ResetEntity, boolean>>((acc, option) => {
    acc[option.key] = false;
    return acc;
  }, {} as Record<ResetEntity, boolean>);

export default function ResetPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState(buildInitialSelection);
  const [resetting, setResetting] = useState(false);

  useNotifyOnChange(error);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      setError('Faca login para acessar o reset.');
      return;
    }

    if (user.role !== 'SUPERADMIN') {
      setError('Apenas superadmins podem acessar o reset do sistema.');
      return;
    }

    setError(null);
  }, [hasHydrated, user]);

  const selectedEntities = useMemo(() => {
    const base = resetOptions
      .filter((option) => selection[option.key])
      .map((option) => option.key);
    return Array.from(new Set(base));
  }, [selection]);

  const selectedCount = useMemo(
    () =>
      resetOptions.reduce(
        (total, option) => total + (selection[option.key] ? 1 : 0),
        0,
      ),
    [selection],
  );
  const allSelected = resetOptions.every((option) => selection[option.key]);
  const hasSelection = selectedCount > 0;

  const toggleAll = (value: boolean) => {
    setSelection((current) => {
      const next = { ...current };
      resetOptions.forEach((option) => {
        next[option.key] = value;
      });
      return next;
    });
  };

  const handleReset = async () => {
    if (!hasSelection) {
      setError('Selecione pelo menos um item para resetar.');
      return;
    }

    const confirmMessage = allSelected
      ? 'Isso vai apagar todo o sistema e recriar superadmin/superadmin e a empresa ADM. Deseja continuar?'
      : 'Deseja resetar os itens selecionados?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setResetting(true);
    setError(null);

    try {
      await api.post('/resets', {
        entities: selectedEntities,
      });
      setSelection(buildInitialSelection);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nao foi possivel executar o reset.';
      setError(typeof message === 'string' ? message : 'Erro ao resetar.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="min-w-0 space-y-1 xl:flex-1">
          <h1 className="font-display text-2xl leading-tight text-foreground">
            Reset do sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Resete dados de forma granular e controle o que volta com o seed.
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Itens do reset
              </p>
              <p className="text-xs text-muted-foreground">
                Marque apenas o que voce precisa.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {selectedCount} selecionados
              </span>
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
                disabled={!hasSelection}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {resetOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-start gap-2 rounded-lg border border-border/70 bg-white/80 px-2.5 py-2 text-foreground"
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

        <section className="surface animate-in fade-in slide-in-from-bottom-2 p-3 sm:p-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Reset
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Execute o reset dos itens selecionados.
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Reset remove dados permanentemente. Reset total executa o seed e
              recria superadmin/superadmin e a empresa ADM.
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1">
                Itens: {selectedCount}
              </span>
              {allSelected && (
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-destructive">
                  Reset total + seed
                </span>
              )}
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-destructive px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
              onClick={handleReset}
              disabled={!hasSelection || resetting || Boolean(error)}
            >
              {resetting ? 'Resetando...' : 'Resetar selecao'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
