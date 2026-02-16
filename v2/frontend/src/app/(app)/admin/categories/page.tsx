'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import api from '@/lib/api';
import AdminModal from '@/components/admin/modal';
import { Category } from '@/types';

const emptyForm = {
  name: '',
  color: '#3b82f6',
  icon: '',
  adminOnly: false,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const staggerStyle = (index: number) =>
    ({ '--stagger-index': index } as CSSProperties);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel carregar categorias.';
      setError(typeof message === 'string' ? message : 'Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (!term) return true;
      return category.name.toLowerCase().includes(term);
    });
  }, [categories, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      color: category.color || '#3b82f6',
      icon: category.icon || '',
      adminOnly: category.adminOnly,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}`, {
          name: form.name,
          color: form.color,
          icon: form.icon || null,
          adminOnly: form.adminOnly,
        });
      } else {
        await api.post('/categories', {
          name: form.name,
          color: form.color,
          icon: form.icon || null,
          adminOnly: form.adminOnly,
        });
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category: Category) => {
    await api.patch(`/categories/${category.id}`, {
      status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    await load();
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Remover categoria ${category.name}?`)) return;
    setDeletingId(category.id);
    try {
      await api.delete(`/categories/${category.id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 motion-stagger">
      <div
        className="motion-item flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        style={staggerStyle(1)}
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize links, documentos e notas com uma estrutura facil de manter.
          </p>
        </div>
        <button
          type="button"
          className="motion-press rounded-lg bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground"
          onClick={openCreate}
        >
          Nova categoria
        </button>
      </div>

      <div
        className="motion-item rounded-2xl border border-border/70 bg-card/75 px-4 py-3 text-xs text-muted-foreground"
        style={staggerStyle(2)}
      >
        Dica: prefira poucos grupos claros. Categorias inativas ajudam no historico sem poluir o uso diario.
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar categoria"
        className="motion-item w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        style={staggerStyle(3)}
      />

      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando categorias...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhuma categoria encontrada.
        </div>
      ) : (
        <div className="motion-item grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={staggerStyle(4)}>
          {filtered.map((category, index) => (
            <article
              key={category.id}
              className="motion-item rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[0_12px_24px_rgba(16,44,50,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,44,50,0.18)]"
              style={staggerStyle(index + 5)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                    {category.adminOnly ? ' • Somente admin' : ''}
                  </p>
                  {category._count && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Links: {category._count.links} • Docs: {category._count.schedules} • Notas: {category._count.notes}
                    </p>
                  )}
                </div>
                <div
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: category.color || '#94a3b8' }}
                  title={category.color || 'Sem cor'}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                  onClick={() => openEdit(category)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                  onClick={() => toggleStatus(category)}
                >
                  {category.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-destructive"
                  onClick={() => remove(category)}
                  disabled={deletingId === category.id}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              onClick={save}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <input
            value={form.icon}
            onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
            placeholder="Icone (opcional)"
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              className="h-10 w-16 rounded border border-border/70"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.adminOnly}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, adminOnly: event.target.checked }))
                }
              />
              Somente admin
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

