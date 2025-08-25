import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Link2, Plus, Pencil, ArrowLeft } from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";
import DashboardLayout from "../components/layout/DashboardLayout";
import Sidebar, { SidebarSection } from "../components/layout/Sidebar";
import AppNavigation from "../components/layout/AppNavigation";
import DashboardCard from "../components/common/DashboardCard";
import ActionButton from "../components/common/ActionButton";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Color {
  id: number;
  value: string;
  name?: string;
}

interface LinkFormData {
  title: string;
  url: string;
  file_url: string;
  category_id: number | null;
  color: string;
  image_url: string;
}

interface CurrentUser {
  id: number;
  username: string;
  isAdmin: boolean;
}

export default function UserLinkCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<LinkFormData>({
    title: "",
    url: "",
    file_url: "",
    category_id: null,
    color: "",
    image_url: "",
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, categoriesRes, colorsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/categories'),
          api.get('/colors')
        ]);
        
        setUser(userRes.data);
        setCategories(categoriesRes.data);
        setColors(colorsRes.data);

        // If editing, load the link data
        if (isEditing && id) {
          const linkRes = await api.get(`/links/${id}`);
          const link = linkRes.data;
          setFormData({
            title: link.title || "",
            url: link.url || "",
            file_url: link.file_url || "",
            category_id: link.categoryId || null,
            color: link.color || "",
            image_url: link.imageUrl || "",
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        url: formData.url,
        file_url: formData.file_url,
        categoryId: formData.category_id,
        color: formData.color,
        imageUrl: formData.image_url,
        userId: user?.id
      };

      if (isEditing) {
        await api.put(`/links/${id}`, payload);
        toast.success('Link atualizado com sucesso!');
      } else {
        await api.post('/links', payload);
        toast.success('Link criado com sucesso!');
      }

      navigate('/user/links');
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error(isEditing ? 'Erro ao atualizar link' : 'Erro ao criar link');
    } finally {
      setLoading(false);
    }
  };

  const sidebarContent = (
    <Sidebar>
      <SidebarSection
        icon={<Link2 className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />}
        title="Dashboard"
        subtitle="Gerencie seus links"
      >
        <AppNavigation user={user} />
      </SidebarSection>
    </Sidebar>
  );

  return (
    <DashboardLayout
      title={isEditing ? "Editar Link" : "Novo Link"}
      subtitle={isEditing ? "Modifique as informações do seu link" : "Crie um novo link"}
      sidebar={sidebarContent}
      className="grid gap-4 grid-cols-1"
      actions={
        <ActionButton
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/user/links')}
        >
          Voltar
        </ActionButton>
      }
    >
      <div className="max-w-2xl mx-auto">
        <DashboardCard>
          <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? 'Editar Link' : 'Criar Novo Link'}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {isEditing ? 'Atualize as informações do seu link' : 'Preencha os dados para criar um novo link'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border rounded-lg"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
                placeholder="Digite o título do link"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full p-3 border rounded-lg"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
                placeholder="https://exemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Categoria
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category_id: e.target.value ? Number(e.target.value) : null 
                })}
                className="w-full p-3 border rounded-lg"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Cor do Card
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-3 border rounded-lg"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="">Cor padrão</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.value}>
                    {color.name || color.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Imagem (URL)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full p-3 border rounded-lg"
                style={{
                  background: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
                placeholder="https://exemplo.com/imagem.jpg (opcional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <ActionButton
                type="submit"
                variant="primary"
                size="md"
                icon={isEditing ? Pencil : Plus}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Link' : 'Criar Link')}
              </ActionButton>
              
              <ActionButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/user/links')}
                disabled={loading}
              >
                Cancelar
              </ActionButton>
            </div>
          </form>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}