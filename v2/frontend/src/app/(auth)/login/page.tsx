'use client';

import axios from 'axios';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      setAuth(response.data.user, response.data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      let message = 'Invalid credentials.';

      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        if (typeof apiMessage === 'string') {
          message = apiMessage;
        } else if (Array.isArray(apiMessage)) {
          message = apiMessage.join(', ');
        } else if (err.message) {
          message = err.message;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
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

      <form onSubmit={onSubmit} className="space-y-5">
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

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(16,44,50,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_26px_rgba(16,44,50,0.25)] disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          Esqueci a senha
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Criar usuario
        </Link>
      </div>
    </div>
  );
}
