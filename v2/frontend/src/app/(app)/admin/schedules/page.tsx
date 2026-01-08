'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UploadedSchedule, Category, Sector } from '@/types';
import MaxWidth from '@/components/max-width';
import StatusBadge from '@/components/admin/status-badge';
import { useAuthStore } from '@/stores/auth-store';
import { formatBytes } from '@/lib/format';

export default function SchedulesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [schedules, setSchedules] = useState<UploadedSchedule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    sectorId: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    isPublic: true,
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
      const [schedulesRes, catsRes, sectorsRes] = await Promise.all([
        api.get(`/schedules?companyId=${user.companyId}`),
        api.get(`/categories?companyId=${user.companyId}`),
        api.get(`/sectors?companyId=${user.companyId}`),
      ]);
      setSchedules(schedulesRes.data);
      setCategories(catsRes.data);
      setSectors(sectorsRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      const statusCode = err?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Não foi possível carregar as agendas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/uploads/document', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        fileUrl: response.data.url,
        fileName: response.data.originalName,
        fileSize: response.data.size,
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    if (!formData.fileUrl) {
      alert('Por favor, faça upload de um arquivo');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        companyId: user.companyId,
        categoryId: formData.categoryId || undefined,
        sectorId: formData.sectorId || undefined,
      };

      if (editingId) {
        await api.patch(`/schedules/${editingId}`, dataToSend);
      } else {
        await api.post('/schedules', dataToSend);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Erro ao salvar agenda');
    }
  };

  const handleEdit = (schedule: UploadedSchedule) => {
    setFormData({
      title: schedule.title,
      categoryId: schedule.categoryId || '',
      sectorId: schedule.sectorId || '',
      fileUrl: schedule.fileUrl,
      fileName: schedule.fileName,
      fileSize: schedule.fileSize,
      isPublic: schedule.isPublic,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta agenda?')) return;

    try {
      await api.delete(`/schedules/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      categoryId: '',
      sectorId: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      isPublic: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
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
            <h1 className="text-2xl font-bold text-foreground">Agendas e Documentos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os arquivos do portal
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {showForm ? 'Cancelar' : 'Novo Documento'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {editingId ? 'Editar Documento' : 'Novo Documento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Arquivo * (PDF, DOC, XLS, PPT, TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  required={!editingId}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-foreground focus:outline-none"
                />
                {uploading && (
                  <p className="mt-2 text-sm text-muted-foreground">Fazendo upload...</p>
                )}
                {formData.fileName && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
                      {getFileExtension(formData.fileName)}
                    </span>
                    <span>{formData.fileName}</span>
                    <span>({formatBytes(formData.fileSize)})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="isPublic" className="text-sm text-foreground">
                  Público (visível sem login)
                </label>
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

        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Setor
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                    Tamanho
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
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                          {getFileExtension(schedule.fileName)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{schedule.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.fileName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {schedule.category ? (
                        <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {schedule.category.icon} {schedule.category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {schedule.sector ? (
                        <span className="text-sm text-muted-foreground">
                          {schedule.sector.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Todos</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatBytes(schedule.fileSize)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={schedule.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`http://localhost:3001${schedule.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Baixar
                        </a>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
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
            {schedules.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Nenhum documento cadastrado
              </div>
            )}
          </div>
        </div>
      </div>
    </MaxWidth>
  );
}
