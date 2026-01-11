'use client';

import { FormEvent, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      setAuth(response.data.user, response.data.accessToken);
      router.push('/');
    } catch (err) {
      // Notifications handled in the API interceptor.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 motion-stagger">
      <Link
        href="/"
        className="motion-item motion-press inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
        style={staggerStyle(1)}
      >
        Voltar para a pagina inicial
      </Link>
      <div className="motion-item space-y-3" style={staggerStyle(2)}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Facilita admin
        </p>
        <h1 className="font-display text-3xl text-foreground">
          Acesso ao painel
        </h1>
        <p className="text-sm text-muted-foreground">
          Use seu usuario para acessar o painel e seguir a operacao.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="motion-item space-y-5"
        style={staggerStyle(3)}
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="motion-press w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(16,44,50,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_26px_rgba(16,44,50,0.25)] disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

    </div>
  );
}
