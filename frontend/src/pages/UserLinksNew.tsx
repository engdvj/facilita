import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link2, Pencil, Trash2, FileIcon, Plus, ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import { useUserLinks } from "../hooks/useUserLinks";
import { useLinkForm } from "../hooks/useLinkForm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Sidebar, { SidebarSection } from "../components/layout/Sidebar";
import AppNavigation from "../components/layout/AppNavigation";
import DashboardColumn from "../components/common/DashboardColumn";
import ListItem from "../components/common/ListItem";
import DashboardCard from "../components/common/DashboardCard";
import ActionButton from "../components/common/ActionButton";

export default function UserLinks() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  
  const { 
    user, 
    links, 
    categories, 
    colors, 
    files, 
    isLoading, 
    refreshData, 
    deleteLink 
  } = useUserLinks();

  const {
    // New link state
    newLink,
    setNewLink,
    newImageType,
    setNewImageType,
    newImageFile,
    setNewImageFile,
    newHasFile,
    setNewHasFile,
    newFile,
    setNewFile,
    newLinkType,
    setNewLinkType,
    // Edit link state  
    editingId,
    editLink,
    setEditLink,
    editImageType,
    setEditImageType,
    editImageFile,
    setEditImageFile,
    editHasFile,
    setEditHasFile,
    editFile,
    setEditFile,
    editLinkType,
    setEditLinkType,
    // Actions
    startEditing,
    createLink,
    updateLink,
    resetEditForm,
  } = useLinkForm();

  // Get current user data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    getCurrentUser();
  }, []);

  // Filter and organize links
  const userLinks = links.filter(l => l.userId === currentUser?.id);
  const generalLinks = links.filter(l => l.userId !== currentUser?.id);
  const perPage = 10;
  const pageCount = Math.ceil(userLinks.length / perPage) || 1;
  const paginatedLinks = userLinks.slice((page - 1) * perPage, page * perPage);

  // Create category map for lookups
  const categoryMap = React.useMemo(() => {
    const map: Record<number, any> = {};
    categories.forEach(cat => map[cat.id] = cat);
    return map;
  }, [categories]);

  // Create sidebar content
  const sidebarContent = (
    <Sidebar>
      <SidebarSection
        icon={<Link2 className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />}
        title="Dashboard"
        subtitle="Gerencie seus links"
      >
        <AppNavigation user={currentUser} />
      </SidebarSection>
      
      {generalLinks.length > 0 && (
        <SidebarSection
          icon={<Link2 className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />}
          title="Links Gerais"
          subtitle={`${generalLinks.length} links disponíveis`}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {generalLinks.slice(0, 8).map((link) => (
              <div 
                key={link.id}
                className="flex items-center gap-2 p-2 rounded-md transition-colors text-xs"
                style={{ 
                  background: 'var(--dashboard-list-item)',
                  '&:hover': { background: 'var(--dashboard-list-item-hover)' }
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: link.color || '#6366f1' }}
                />
                <span 
                  className="truncate"
                  style={{ color: 'var(--sidebar-text)' }}
                >
                  {link.title}
                </span>
              </div>
            ))}
          </div>
        </SidebarSection>
      )}
    </Sidebar>
  );

  // Handle form submissions
  const handleCreate = async (e: React.FormEvent) => {
    await createLink(e, refreshData);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    await updateLink(e, () => {
      refreshData();
      resetEditForm();
    });
  };

  const handleStartEdit = (link: any) => {
    startEditing(link);
  };

  const handleCancelEdit = () => {
    resetEditForm();
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Dashboard de Links"
        subtitle="Carregando..."
        sidebar={sidebarContent}
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando links...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={userId ? `Links de ${user?.username || 'Usuário'}` : "Dashboard de Links"}
      subtitle="Gerencie seus links e explore os links gerais da plataforma"
      sidebar={sidebarContent}
      className="grid gap-6 grid-cols-1 xl:grid-cols-3"
    >
      {/* User Links Column - Takes 2 columns */}
      <div className="xl:col-span-2">
        <DashboardColumn
          title="Meus Links"
          subtitle={`${userLinks.length} links criados`}
          icon={<Link2 className="w-4 h-4" style={{ color: 'var(--dashboard-stat-icon)' }} />}
          total={userLinks.length}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          loading={isLoading}
          emptyMessage="Você ainda não criou nenhum link. Use o formulário ao lado para criar seu primeiro link."
        >
          {paginatedLinks.map((link, index) => {
            const category = categoryMap[link.categoryId || 0];
            const IconComponent = category ? Icons[category.icon as keyof typeof Icons] : Link2;
            
            return (
              <ListItem
                key={link.id}
                title={link.title}
                subtitle={link.url || 'Arquivo'}
                description={category?.name || 'Sem categoria'}
                icon={link.imageUrl ? (
                  <img 
                    src={link.imageUrl} 
                    alt={link.title}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                ) : IconComponent}
                iconColor={link.color || category?.color || '#6366f1'}
                badge={link.fileUrl ? { text: 'Com arquivo', variant: 'info' } : undefined}
                actions={[
                  {
                    icon: ExternalLink,
                    label: 'Abrir',
                    onClick: () => window.open(link.url || link.fileUrl, '_blank'),
                    variant: 'ghost'
                  },
                  {
                    icon: Pencil,
                    label: 'Editar',
                    onClick: () => handleStartEdit(link),
                    variant: 'ghost'
                  },
                  {
                    icon: Trash2,
                    label: 'Excluir',
                    onClick: () => deleteLink(link.id),
                    variant: 'danger'
                  }
                ]}
                onClick={() => window.open(link.url || link.fileUrl, '_blank')}
                index={index}
              />
            );
          })}
        </DashboardColumn>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        {/* Quick Create Form */}
        <DashboardCard>
          <div 
            className="p-4 border-b"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <h3 
              className="font-semibold text-lg mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {editingId ? 'Editar Link' : 'Novo Link'}
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {editingId ? 'Modifique as informações do link' : 'Crie um novo link rapidamente'}
            </p>
          </div>

          <form 
            className="p-4 space-y-4"
            onSubmit={editingId ? handleUpdate : handleCreate}
          >
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Título
              </label>
              <input
                type="text"
                value={editingId ? editLink.title : newLink.title}
                onChange={(e) => {
                  if (editingId) {
                    setEditLink({ ...editLink, title: e.target.value });
                  } else {
                    setNewLink({ ...newLink, title: e.target.value });
                  }
                }}
                className="w-full p-3 rounded-lg border text-sm"
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
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                URL
              </label>
              <input
                type="url"
                value={editingId ? editLink.url : newLink.url}
                onChange={(e) => {
                  if (editingId) {
                    setEditLink({ ...editLink, url: e.target.value });
                  } else {
                    setNewLink({ ...newLink, url: e.target.value });
                  }
                }}
                className="w-full p-3 rounded-lg border text-sm"
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
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Categoria
              </label>
              <select
                value={editingId ? (editLink.category_id || '') : (newLink.category_id || '')}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  if (editingId) {
                    setEditLink({ ...editLink, category_id: value });
                  } else {
                    setNewLink({ ...newLink, category_id: value });
                  }
                }}
                className="w-full p-3 rounded-lg border text-sm"
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

            <div className="flex gap-2">
              <ActionButton
                type="submit"
                variant="primary"
                size="md"
                icon={editingId ? Pencil : Plus}
                className="flex-1"
              >
                {editingId ? 'Salvar' : 'Criar'}
              </ActionButton>
              
              {editingId && (
                <ActionButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </ActionButton>
              )}
            </div>
          </form>
        </DashboardCard>

        {/* General Links Preview */}
        {generalLinks.length > 0 && (
          <DashboardCard>
            <div 
              className="p-4 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <h3 
                className="font-semibold text-lg mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Links Gerais
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {generalLinks.length} links disponíveis
              </p>
            </div>

            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {generalLinks.slice(0, 8).map((link, index) => {
                const category = categoryMap[link.categoryId || 0];
                const IconComponent = category ? Icons[category.icon as keyof typeof Icons] : Link2;
                
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      background: 'var(--dashboard-list-item)',
                      '&:hover': { background: 'var(--dashboard-list-item-hover)' }
                    }}
                    onClick={() => window.open(link.url || link.fileUrl, '_blank')}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: 'var(--dashboard-stat-icon-bg)',
                        color: link.color || category?.color || '#6366f1'
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {link.title}
                      </h4>
                      {category && (
                        <p 
                          className="text-xs truncate"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {category.name}
                        </p>
                      )}
                    </div>
                    <ExternalLink 
                      className="w-4 h-4 opacity-50"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        )}
      </div>
    </DashboardLayout>
  );
}