'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Link, Note, UploadedSchedule, User } from '@/types';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasHydrated) return;
      if (!user) {
        setLoading(false);
        setError('Faca login para acessar o dashboard.');
        return;
      }
      if (user.role !== 'SUPERADMIN') {
        setLoading(false);
        setError('Acesso restrito ao superadmin.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [usersRes, linksRes, schedulesRes, notesRes] = await Promise.all([
          api.get('/users'),
          api.get('/links/admin/list'),
          api.get('/schedules/admin/list'),
          api.get('/notes/admin/list'),
        ]);

        if (!active) return;
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setLinks(Array.isArray(linksRes.data) ? linksRes.data : []);
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      } catch (err: any) {
        if (!active) return;
        const message =
          err?.response?.data?.message || 'Nao foi possivel carregar o dashboard.';
        setError(typeof message === 'string' ? message : 'Erro ao carregar dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [hasHydrated, user]);

  const totals = useMemo(() => {
    const activeUsers = users.filter((item) => item.status === 'ACTIVE').length;
    const publicLinks = links.filter((item) => item.visibility === 'PUBLIC').length;
    const publicSchedules = schedules.filter((item) => item.visibility === 'PUBLIC').length;
    const publicNotes = notes.filter((item) => item.visibility === 'PUBLIC').length;

    const sharedLinks = links.reduce((acc, item) => acc + (item.shareCount || 0), 0);
    const sharedSchedules = schedules.reduce((acc, item) => acc + (item.shareCount || 0), 0);
    const sharedNotes = notes.reduce((acc, item) => acc + (item.shareCount || 0), 0);

    return {
      users: users.length,
      activeUsers,
      links: links.length,
      schedules: schedules.length,
      notes: notes.length,
      publicItems: publicLinks + publicSchedules + publicNotes,
      totalShares: sharedLinks + sharedSchedules + sharedNotes,
    };
  }, [links, notes, schedules, users]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const cards = [
    { label: 'Usuarios', value: totals.users, hint: `${totals.activeUsers} ativos` },
    { label: 'Links', value: totals.links, hint: `${links.filter((item) => item.status === 'ACTIVE').length} ativos` },
    {
      label: 'Documentos',
      value: totals.schedules,
      hint: `${schedules.filter((item) => item.status === 'ACTIVE').length} ativos`,
    },
    { label: 'Notas', value: totals.notes, hint: `${notes.filter((item) => item.status === 'ACTIVE').length} ativos` },
    { label: 'Itens publicos', value: totals.publicItems, hint: 'Publicados pelo superadmin' },
    { label: 'Compartilhamentos', value: totals.totalShares, hint: 'Total ativo nos conteudos' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
        <h1 className="font-display text-3xl text-foreground">Visao geral da plataforma</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores globais de usuarios, conteudo e compartilhamentos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
