'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type Stats = {
  companies: number;
  units: number;
  sectors: number;
  users: number;
};

type HealthStatus = {
  status: string;
  database: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    companies: 0,
    units: 0,
    sectors: 0,
    users: 0,
  });
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    let active = true;

    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      setLoading(false);
      setError('Faca login para acessar o painel.');
      return;
    }

    const loadStats = async () => {
      try {
        const [companies, units, sectors, users, healthResponse] =
          await Promise.all([
            api.get('/companies'),
            api.get('/units'),
            api.get('/sectors'),
            api.get('/users'),
            api.get('/health'),
          ]);

        if (!active) return;

        setStats({
          companies: companies.data.length ?? 0,
          units: units.data.length ?? 0,
          sectors: sectors.data.length ?? 0,
          users: users.data.length ?? 0,
        });
        setHealth(healthResponse.data);
        setError(null);
      } catch (err: any) {
        if (active) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            setError('Sessao expirada. Faca login novamente.');
          } else {
            setError('Nao foi possivel carregar os dados do painel.');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [accessToken, hasHydrated]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="font-display text-3xl text-foreground">
          Panorama geral do Facilita
        </h1>
        <p className="text-sm text-muted-foreground">
          Indicadores-chave e saude do ambiente administrativo.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Empresas', value: stats.companies },
          { label: 'Unidades', value: stats.units },
          { label: 'Setores', value: stats.sectors },
          { label: 'Usuarios', value: stats.users },
        ].map((card) => (
          <div
            key={card.label}
            className="surface p-6 animate-in fade-in slide-in-from-bottom-2"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-foreground">
              {loading ? '--' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">
            Saude do sistema
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {health?.status || 'verificando'}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitoramento rapido de servicos essenciais.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'API', value: 'online' },
            { label: 'Banco', value: health?.database || 'offline' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border/70 bg-secondary/60 px-4 py-3"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
