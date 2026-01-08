'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Category } from '@/types';
import MaxWidth from '@/components/max-width';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

export default function CategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    icon: '',
    adminOnly: false,
  });

  useEffect(() => {
    loadCategories();
  }, [user, hasHydrated]);

  const loadCategories = async () => {
    if (!hasHydrated) return;

    if (!user?.companyId) {
      setError('Usuário sem empresa associada. Entre em contato com o administrador.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await api.get(`/categories?companyId=${user.companyId}`);
      setCategories(response.data);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      const statusCode = err?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Não foi possível carregar as categorias.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, formData);
      } else {
        await api.post('/categories', {
          ...formData,
          companyId: user.companyId,
        });
      }
      loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color || '#3b82f6',
      icon: category.icon || '',
      adminOnly: category.adminOnly,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria. Ela pode estar em uso.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3b82f6',
      icon: '',
      adminOnly: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <MaxWidth>
        <div className="py-8 text-center text-muted-foreground">Carregando...</div>
      </MaxWidth>
    );
  }

  return (
    <MaxWidth>
      <div className="space-y-6 py-8">
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as categorias do portal
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {showForm ? 'Cancelar' : 'Nova Categoria'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ícone (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📁"
                    maxLength={2}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adminOnly"
                  checked={formData.adminOnly}
                  onChange={(e) => setFormData({ ...formData, adminOnly: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="adminOnly" className="text-sm text-foreground">
                  Apenas administradores podem criar nesta categoria
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Cor
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {category.icon && <span className="text-lg">{category.icon}</span>}
                        <span className="font-medium text-foreground">{category.name}</span>
                        {category.adminOnly && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border border-border"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {category.color || '#3b82f6'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {category._count?.links || 0} links, {category._count?.schedules || 0} agendas
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={category.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-sm text-muted-foreground hover:text-red-500"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Nenhuma categoria cadastrada
              </div>
            )}
          </div>
        </div>
      </div>
    </MaxWidth>
  );
}
