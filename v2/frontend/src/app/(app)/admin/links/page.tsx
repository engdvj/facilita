'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Link, Category, Sector } from '@/types';
import MaxWidth from '@/components/max-width';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';

export default function LinksPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    categoryId: '',
    sectorId: '',
    color: '',
    imageUrl: '',
    isPublic: true,
    order: 0,
  });

  useEffect(() => {
    loadData();
  }, [user, hasHydrated]);

  const loadData = async () => {
    if (!hasHydrated) return;

    if (!user?.companyId) {
      setError('Usuário sem empresa associada. Entre em contato com o administrador.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [linksRes, catsRes, sectorsRes] = await Promise.all([
        api.get(`/links?companyId=${user.companyId}`),
        api.get(`/categories?companyId=${user.companyId}`),
        api.get(`/sectors?companyId=${user.companyId}`),
      ]);
      setLinks(linksRes.data);
      setCategories(catsRes.data);
      setSectors(sectorsRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      const statusCode = err?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Não foi possível carregar os links.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    try {
      const dataToSend = {
        ...formData,
        companyId: user.companyId,
        categoryId: formData.categoryId || undefined,
        sectorId: formData.sectorId || undefined,
        color: formData.color || undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      if (editingId) {
        await api.patch(`/links/${editingId}`, dataToSend);
      } else {
        await api.post('/links', dataToSend);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Erro ao salvar link');
    }
  };

  const handleEdit = (link: Link) => {
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      categoryId: link.categoryId || '',
      sectorId: link.sectorId || '',
      color: link.color || '',
      imageUrl: link.imageUrl || '',
      isPublic: link.isPublic,
      order: link.order,
    });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;

    try {
      await api.delete(`/links/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      categoryId: '',
      sectorId: '',
      color: '',
      imageUrl: '',
      isPublic: true,
      order: 0,
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
            <h1 className="text-2xl font-bold text-foreground">Links</h1>
            <p className="text-sm text-muted-foreground">Gerencie os links do portal</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {showForm ? 'Cancelar' : 'Novo Link'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? 'Editar Link' : 'Novo Link'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Categoria
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Setor
                  </label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="">Todos os setores</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Cor personalizada
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                />
                {uploading && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fazendo upload...
                  </p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={`http://localhost:3001${formData.imageUrl}`}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Público (visível sem login)</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-foreground">Ordem:</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-lg border border-border bg-card p-4 transition hover:border-foreground"
            >
              {link.imageUrl && (
                <img
                  src={`http://localhost:3001${link.imageUrl}`}
                  alt={link.title}
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
              )}
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-foreground">{link.title}</h3>
                <StatusBadge status={link.status} />
              </div>
              {link.description && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {link.description}
                </p>
              )}
              <div className="mb-3 flex flex-wrap gap-2">
                {link.category && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {link.category.icon} {link.category.name}
                  </span>
                )}
                {link.sector && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {link.sector.name}
                  </span>
                )}
                {!link.isPublic && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Privado
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Abrir link →
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(link)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-xs text-muted-foreground hover:text-red-500"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {links.length === 0 && (
          <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground">
            Nenhum link cadastrado
          </div>
        )}
      </div>
    </MaxWidth>
  );
}
