'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import AdminModal from '@/components/admin/modal';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/error';
import { useUiStore } from '@/stores/ui-store';
import { Category } from '@/types';

const emptyForm = {
  name: '',
  color: '#3b82f6',
  icon: '',
  adminOnly: false,
};
type CategoryFormErrors = {
  name?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const globalSearch = useUiStore((state) => state.globalSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});
  const [deleting, setDeleting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/categories', { params: { includeInactive: true } });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar categorias.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();

    return categories
      .filter((category) => (statusFilter === 'ALL' ? true : category.status === statusFilter))
      .filter((category) => {
        if (!term) return true;
        return category.name.toLowerCase().includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, globalSearch, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormErrors({});
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
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors: CategoryFormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Nome é obrigatório.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return;

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
    try {
      await api.patch(`/categories/${category.id}`, {
        status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
    } catch {
      // O interceptor global já notifica o erro.
    } finally {
      await load();
    }
  };

  const remove = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    try {
      await api.delete(`/categories/${confirmTarget.id}`);
      setModalOpen(false);
      setEditing(null);
    } finally {
      setDeleting(false);
      setConfirmTarget(null);
      await load();
    }
  };

  return (
    <div className="fac-page">
      <section className="fac-page-head">
        <div>
          <h1 className="fac-subtitle">Categorias</h1>
          <p className="text-[15px] text-muted-foreground">Gerencie as categorias usadas no portal.</p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-[190px_auto_auto]">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
            }
            className="fac-select"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
          </select>

          <button type="button" className="fac-filter-button" disabled title="Em breve">
            Filtros
          </button>

          <button type="button" className="fac-button-primary" onClick={openCreate}>
            Nova categoria
          </button>
        </div>
      </section>

      <section className="fac-panel">
        <div className="fac-panel-head">
          <p className="fac-panel-title">Lista</p>
          <p className="fac-panel-meta">{filtered.length} registros</p>
        </div>

        <div className="fac-panel-body">
          {loading ? (
            <div className="fac-loading-state">Carregando categorias...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fac-empty-state">Nenhuma categoria encontrada.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((category) => {
                const total =
                  (category._count?.links || 0) +
                  (category._count?.schedules || 0) +
                  (category._count?.notes || 0);

                return (
                  <article key={category.id} className={`fac-card w-[220px] max-w-full ${category.status === 'INACTIVE' ? 'opacity-80 grayscale' : ''}`}>
                    <button
                      type="button"
                      className="relative aspect-square w-full overflow-hidden bg-muted text-left"
                      onClick={() => openEdit(category)}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(160deg, ${category.color || '#64748b'}33 0%, rgba(15, 22, 26, 0.08) 100%)`,
                        }}
                      />

                      <span className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] items-center gap-2 rounded-xl border border-black/10 bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: category.color || '#64748b' }}
                        />
                        <span className="line-clamp-1">{category.name}</span>
                      </span>

                    </button>

                    <div className="flex items-center justify-between border-t border-border bg-white/92 px-3 py-2">
                      <button
                        type="button"
                        className="pr-2 text-left"
                        onClick={() => openEdit(category)}
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {category.adminOnly ? 'Admin' : 'Equipe'}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold text-foreground">
                          {total} {total === 1 ? 'item' : 'itens'}
                        </p>
                      </button>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={category.status === 'ACTIVE'}
                        aria-label={
                          category.status === 'ACTIVE'
                            ? `Desativar ${category.name}`
                            : `Ativar ${category.name}`
                        }
                        className="fac-toggle shrink-0"
                        data-state={category.status === 'ACTIVE' ? 'on' : 'off'}
                        onClick={() => {
                          void toggleStatus(category);
                        }}
                      >
                        <span className="fac-toggle-dot" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        description="Categorias organizam links e documentos."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            {editing ? (
              <button
                type="button"
                className="fac-button-secondary text-[11px]"
                onClick={() => setConfirmTarget(editing)}
                disabled={saving || deleting}
              >
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            ) : null}
            <button
              type="button"
              className="fac-button-secondary text-[11px]"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="fac-button-primary text-[11px]"
              onClick={save}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <section className="fac-form-card">
          <p className="fac-form-title">Detalhes</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="fac-label">Nome</label>
              <input
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`fac-input ${formErrors.name ? 'border-destructive' : ''}`}
              />
              {formErrors.name ? (
                <p className="mt-1 text-[12px] text-destructive">{formErrors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="fac-label">Cor</label>
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                className="fac-input !h-11 !px-2"
              />
            </div>

            <div>
              <label className="fac-label">Icone (opcional)</label>
              <input
                value={form.icon}
                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                className="fac-input"
                placeholder="Nome do icone"
              />
            </div>
          </div>
        </section>

        <section className="fac-form-card mt-4">
          <p className="fac-form-title">Permissões</p>
          <label className="flex items-center gap-2 text-[14px] text-foreground">
            <input
              type="checkbox"
              checked={form.adminOnly}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, adminOnly: event.target.checked }))
              }
            />
            Apenas administradores podem ver itens desta categoria
          </label>
        </section>
      </AdminModal>

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title="Remover categoria"
        description={
          confirmTarget
            ? `Confirma a remoção permanente da categoria "${confirmTarget.name}"?`
            : 'Confirma a remoção permanente desta categoria?'
        }
        confirmLabel="Remover categoria"
        loading={deleting}
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}
