'use client';

import { FormEvent, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { AppMode, getAppMode, setStoredAppMode } from '@/lib/app-mode';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [appMode, setAppMode] = useState<AppMode>(() => getAppMode());
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStoredAppMode(appMode);

    try {
      const response = await api.post('/auth/login', { username, password });
      setAuth(response.data.user, response.data.accessToken);
      window.location.assign('/');
    } catch (err) {
      // Notifications handled in the API interceptor.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 motion-stagger sm:space-y-12">
      <Link
        href="/"
        className="motion-item motion-press inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground shadow-[0_10px_20px_rgba(16,44,50,0.08)] transition hover:border-foreground/30 hover:text-foreground hover:bg-card/80 dark:bg-card/50 dark:shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
        style={staggerStyle(1)}
      >
        Voltar para a pagina inicial
      </Link>
      <div className="motion-item space-y-4" style={staggerStyle(2)}>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-[4px] bg-accent shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-primary shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-secondary shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-muted shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.45)]" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Facilita admin
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-foreground">
          Acesso ao painel
        </h1>
        <p className="text-[13px] sm:text-sm text-muted-foreground">
          Use seu usuario para acessar o painel e ter acesso aos seus próprios itens.
        </p>
      </div>

      <div className="motion-item space-y-4" style={staggerStyle(3)}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Modo do portal
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { id: 'company', label: 'Modo empresa', hint: 'Hierarquia completa com empresas, setores e unidades.' },
            { id: 'user', label: 'Modo usuario', hint: 'Portal individual sem vinculos e setores.' },
          ] as const).map((option) => {
            const isActive = appMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setAppMode(option.id);
                  setStoredAppMode(option.id);
                }}
                className={`motion-press w-full rounded-2xl border px-4 py-4 text-left transition ${
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-foreground shadow-[0_10px_20px_rgba(16,44,50,0.12)]'
                    : 'border-border/70 bg-card/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {option.label}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {option.hint}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${
                      isActive ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Esta escolha define o ambiente que sera usado apos o login.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="motion-item space-y-6"
        style={staggerStyle(4)}
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2.5 text-[13px] text-foreground shadow-[0_6px_14px_rgba(16,44,50,0.08)] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border/80 dark:shadow-[0_10px_24px_rgba(0,0,0,0.45)] dark:focus:ring-primary/25 sm:px-4 sm:py-3 sm:text-sm"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-3 py-2.5 text-[13px] text-foreground shadow-[0_6px_14px_rgba(16,44,50,0.08)] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border/80 dark:shadow-[0_10px_24px_rgba(0,0,0,0.45)] dark:focus:ring-primary/25 sm:px-4 sm:py-3 sm:text-sm"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="motion-press w-full rounded-lg bg-primary px-3 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(16,44,50,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(16,44,50,0.28)] disabled:opacity-60 dark:shadow-[0_16px_32px_rgba(0,0,0,0.45)] dark:hover:shadow-[0_20px_36px_rgba(0,0,0,0.55)] sm:px-4 sm:py-3 sm:text-sm"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

    </div>
  );
}
