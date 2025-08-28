import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Download,
  Check,
  X,
  User,
  FileIcon,
  Folder,
  Palette,
  Users,
  Link2,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as Icons from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";
import { Category, Color, FileData } from "../types/admin";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardStats from "../components/common/DashboardStats";
import DashboardColumn from "../components/common/DashboardColumn";
import ListItem from "../components/common/ListItem";
import ActionButton from "../components/common/ActionButton";
import { AdminStats, AdminLinkForm, AdminLinkList, AdminFileForm, AdminFileList } from "../components/admin";
import PreviewModal from "../components/common/PreviewModal";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  /* ---------- estado geral ----------------------------------------- */
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [editingFile, setEditingFile] = useState<FileData | null>(null);
  const [previewModal, setPreviewModal] = useState<{type: 'image' | 'file', url: string, name?: string} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    categoryId: '',
    imageUrl: '',
    imageFile: null as File | null,
    fileUrl: '',
    attachedFile: null as File | null,
    imageInputType: 'link' as 'link' | 'upload',
    fileInputType: 'link' as 'link' | 'upload',
    hasFile: false,
    isPublic: false,
    isFavorite: false,
    linkType: 'url' as 'url' | 'file',
    selectedFileId: ''
  });

  const [fileFormData, setFileFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    fileUrl: '',
    attachedFile: null as File | null,
    fileInputType: 'upload' as 'link' | 'upload'
  });

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleFocusSection = (event: CustomEvent) => {
      setFocusedSection(event.detail);
      // Update sidebar selection - set to section or 'dashboard' if null
      window.dispatchEvent(new CustomEvent('updateSidebarSelection', { detail: event.detail || 'dashboard' }));
    };

    window.addEventListener('focusSection', handleFocusSection as EventListener);
    return () => {
      window.removeEventListener('focusSection', handleFocusSection as EventListener);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- edição de cor --------------------------------------- */
  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#000000");
  const [editColorName, setEditColorName] = useState("");

  /* ---------- busca + paginação ----------------------------------- */
  const [linkQuery, setLinkQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [fileQuery, setFileQuery] = useState("");

  const perPage = 5;
  const [linkPage, setLinkPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [filePage, setFilePage] = useState(1);

  /* ---------- classes utilitárias --------------------------------- */
  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";
  const colorInputClass =
    "p-0 border border-gray-300 dark:border-gray-700 rounded bg-[var(--input-background)] text-white";

  /* ---------------------------------------------------------------- */
  /* Carregamento inicial                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const results = await Promise.allSettled([
        api.get("/links"),
        api.get("/categories"),
        api.get("/colors"),
        api.get("/users"),
        api.get("/schedules"),
      ]);
      const [linkRes, catRes, colorRes, userRes, fileRes] = results;

    if (linkRes.status === "fulfilled") {
      setLinks(
        [...linkRes.value.data].sort((a, b) => a.title.localeCompare(b.title))
      );
    }
    if (catRes.status === "fulfilled") {
      setCategories(
        [...catRes.value.data].sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    if (colorRes.status === "fulfilled") {
      setColors(
        [...colorRes.value.data].sort((a, b) =>
          (a.name || a.value).localeCompare(b.name || b.value)
        )
      );
    }
    if (userRes.status === "fulfilled") {
      setUsers(
        [...userRes.value.data].sort((a, b) =>
          a.username.localeCompare(b.username)
        )
      );
    }
    if (fileRes.status === "fulfilled") {
      setFiles(
        [...(fileRes.value.data as FileData[])].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
    }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Ações CRUD                                                        */
  /* ---------------------------------------------------------------- */
  const removeLink = async (id: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${id}`);
    await refresh();
  };

  const startEditCat = (cat: { id: number }) => {
    navigate(`/admin/categories/${cat.id}`);
  };

  const removeCat = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    await api.delete(`/categories/${id}`);
    await refresh();
  };

  const startEditColor = (c: { id: number; value: string; name?: string }) => {
    setEditColorId(c.id);
    setEditColor(c.value);
    setEditColorName(c.name || "");
  };

  const saveColor = async () => {
    if (editColorId === null) return;
    await api.patch(`/colors/${editColorId}`, {
      value: editColor,
      name: editColorName || undefined,
    });
    setEditColorId(null);
    setEditColor("#000000");
    setEditColorName("");
    await refresh();
  };

  const removeColor = async (id: number) => {
    if (!confirm("Excluir cor?")) return;
    await api.delete(`/colors/${id}`);
    await refresh();
  };

  const startEditUser = (u: { id: number }) => {
    navigate(`/admin/users/${u.id}`);
  };

  const removeUser = async (id: number) => {
    if (!confirm("Excluir usuário?")) return;
    await api.delete(`/users/${id}`);
    await refresh();
  };

  const removeFile = async (id: number) => {
    if (!confirm("Excluir arquivo?")) return;
    await api.delete(`/schedules/${id}`);
    await refresh();
  };

  /* ---------------------------------------------------------------- */
  /* Filtros e paginação                                               */
  /* ---------------------------------------------------------------- */
  const filteredLinks = links
    .filter((l) => l.title.toLowerCase().includes(linkQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));
  const filteredCats = categories
    .filter((c) => c.name.toLowerCase().includes(catQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  const filteredColors = colors
    .filter(
      (c) =>
        c.value.toLowerCase().includes(colorQuery.toLowerCase()) ||
        (c.name || "").toLowerCase().includes(colorQuery.toLowerCase())
    )
    .sort((a, b) => (a.name || a.value).localeCompare(b.name || b.value));
  const filteredUsers = users
    .filter((u) => u.username.toLowerCase().includes(userQuery.toLowerCase()))
    .sort((a, b) => a.username.localeCompare(b.username));
  const filteredFiles = files
    .filter((f) => f.title.toLowerCase().includes(fileQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  const linkPageCount = Math.ceil(filteredLinks.length / perPage) || 1;
  const catPageCount = Math.ceil(filteredCats.length / perPage) || 1;
  const colorPageCount = Math.ceil(filteredColors.length / perPage) || 1;
  const userPageCount = Math.ceil(filteredUsers.length / perPage) || 1;
  const filePageCount = Math.ceil(filteredFiles.length / perPage) || 1;

  const paginatedLinks = filteredLinks.slice(
    (linkPage - 1) * perPage,
    linkPage * perPage
  );
  const paginatedCats = filteredCats.slice(
    (catPage - 1) * perPage,
    catPage * perPage
  );
  const paginatedColors = filteredColors.slice(
    (colorPage - 1) * perPage,
    colorPage * perPage
  );
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * perPage,
    userPage * perPage
  );
  const paginatedFiles = filteredFiles.slice(
    (filePage - 1) * perPage,
    filePage * perPage
  );

  /* ---------- lookup rápido de categoria -------------------------- */
  const categoryMap = useMemo(() => {
    const map: Record<
      number,
      { id: number; name: string; color: string; icon: string }
    > = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  const fileCategoryMap = useMemo(() => {
    const m: Record<number, string> = {};
    categories.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [categories]);

  const userMap = useMemo(() => {
    const m: Record<number, string> = {};
    users.forEach((u) => (m[u.id] = u.username));
    return m;
  }, [users]);

  const statsData = [
    { title: "Links", count: loading ? "..." : links.length, color: "#2563eb", icon: "Link2" as const, key: "links" },
    { title: "Arquivos", count: loading ? "..." : files.length, color: "#16a34a", icon: "FileIcon" as const, key: "files" },
    { title: "Categorias", count: loading ? "..." : categories.length, color: "#9333ea", icon: "Folder" as const, key: "categories" },
    { title: "Cores", count: loading ? "..." : colors.length, color: "#e11d48", icon: "Palette" as const, key: "colors" },
    { title: "Usuários", count: loading ? "..." : users.length, color: "#6366f1", icon: "Users" as const, key: "users" },
  ];

  const dashboardActions = (
    <div className="flex items-center gap-2">
      <ActionButton
        variant="secondary"
        size="md"
        icon={RefreshCw}
        onClick={refresh}
        title="Atualizar dados"
      >
        Atualizar
      </ActionButton>
      <ActionButton
        variant="secondary"
        size="md"
        icon={Download}
        onClick={() => {/* TODO: Export function */}}
        title="Exportar dados"
      >
        Exportar
      </ActionButton>
    </div>
  );

  return (
    <div className="px-4 pt-0 pb-4">
      {/* Stats */}
      <AdminStats 
        statsData={statsData}
        focusedSection={focusedSection}
        onStatClick={(statKey) => {
          console.log('Card clicked:', statKey);
          const newSection = focusedSection === statKey ? null : statKey;
          setFocusedSection(newSection);
          window.dispatchEvent(new CustomEvent('updateSidebarSelection', { detail: newSection || 'dashboard' }));
        }}
        loading={loading}
      />

      {/* Content Grid */}
      {focusedSection ? (
        <div className="focused-content mt-4">
          {renderFocusedContent()}
        </div>
      ) : (
        <div className="admin-dashboard-grid mt-3">
      {/* Links */}
      <DashboardColumn
        title="Links"
        total={links.length}
        color="#2563eb"
        icon={<Link2 className="w-4 h-4 text-blue-600" />}
        onAdd={() => navigate('/admin/links/new')}
        page={linkPage}
        pageCount={linkPageCount}
        onPageChange={setLinkPage}
      >
        {paginatedLinks.map((link) => (
          <ListItem
            key={link.id}
            title={link.title}
            subtitle={link.url}
            imageUrl={link.imageUrl}
            icon={Link2}
            iconColor="#2563eb"
            actions={[
              { icon: Pencil, label: 'Editar', onClick: () => {
                setFocusedSection('links');
                setEditingLink(link);
                setFormData({
                  title: link.title,
                  url: link.url,
                  categoryId: link.categoryId?.toString() || '',
                  imageUrl: link.imageUrl || '',
                  imageFile: null,
                  fileUrl: link.fileUrl || '',
                  attachedFile: null,
                  imageInputType: link.imageUrl ? 'link' : 'upload',
                  fileInputType: link.fileUrl ? 'link' : 'upload',
                  hasFile: !!(link.fileUrl),
                  isPublic: link.isPublic || false,
                  isFavorite: link.isFavorite || false,
                  linkType: 'url',
                  selectedFileId: ''
                });
              }},
              { icon: Trash2, label: 'Excluir', onClick: () => removeLink(link.id), variant: 'danger' }
            ]}
          />
        ))}
      </DashboardColumn>

      {/* Arquivos */}
      <DashboardColumn
        title="Arquivos"
        total={files.length}
        color="#16a34a"
        icon={<FileIcon className="w-4 h-4 text-green-600" />}
        onAdd={() => navigate('/admin/files/new')}
        page={filePage}
        pageCount={filePageCount}
        onPageChange={setFilePage}
      >
        {paginatedFiles.map((file) => (
          <ListItem
            key={file.id}
            title={file.title}
            subtitle={fileCategoryMap[file.categoryId] || 'Sem categoria'}
            icon={FileIcon}
            iconColor="#16a34a"
            actions={[
              { icon: Pencil, label: 'Editar', onClick: () => {
                setFocusedSection('files');
                setEditingFile(file);
                setFileFormData({
                  title: file.title,
                  description: file.description || '',
                  categoryId: file.categoryId?.toString() || '',
                  fileUrl: file.fileUrl,
                  attachedFile: null,
                  fileInputType: 'link'
                });
              }},
              { icon: Download, label: 'Download', onClick: () => window.open(file.fileUrl, '_blank') },
              { icon: Trash2, label: 'Excluir', onClick: () => removeFile(file.id), variant: 'danger' }
            ]}
          />
        ))}
      </DashboardColumn>

      {/* Categorias */}
      <DashboardColumn
        title="Categorias"
        total={categories.length}
        color="#9333ea"
        icon={<Folder className="w-4 h-4 text-purple-600" />}
        onAdd={() => navigate('/admin/categories/new')}
        page={catPage}
        pageCount={catPageCount}
        onPageChange={setCatPage}
      >
        {paginatedCats.map((category) => (
          <ListItem
            key={category.id}
            title={category.name}
            subtitle={category.color}
            icon={Icons[category.icon as keyof typeof Icons] || Folder}
            iconColor={category.color}
            actions={[
              { icon: Pencil, label: 'Editar', onClick: () => navigate(`/admin/categories/${category.id}`) },
              { icon: Trash2, label: 'Excluir', onClick: () => removeCat(category.id), variant: 'danger' }
            ]}
          />
        ))}
      </DashboardColumn>

      {/* Cores */}
      <DashboardColumn
        title="Cores"
        total={colors.length}
        color="#e11d48"
        icon={<Palette className="w-4 h-4 text-pink-600" />}
        onAdd={() => navigate('/admin/colors/new')}
        page={colorPage}
        pageCount={colorPageCount}
        onPageChange={setColorPage}
      >
        {paginatedColors.map((color) => (
          <ListItem
            key={color.id}
            title={color.name || color.value}
            subtitle={color.value}
            icon={<div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />}
            actions={[
              { icon: Pencil, label: 'Editar', onClick: () => navigate(`/admin/colors`) },
              { icon: Trash2, label: 'Excluir', onClick: () => removeColor(color.id), variant: 'danger' }
            ]}
          />
        ))}
      </DashboardColumn>

      {/* Usuários */}
      <DashboardColumn
        title="Usuários"
        total={users.length}
        color="#6366f1"
        icon={<Users className="w-4 h-4 text-indigo-600" />}
        onAdd={() => navigate('/admin/users/new')}
        page={userPage}
        pageCount={userPageCount}
        onPageChange={setUserPage}
      >
        {paginatedUsers.map((user) => (
          <ListItem
            key={user.id}
            title={user.username}
            subtitle={user.email}
            icon={User}
            iconColor="#6366f1"
            badge={user.isAdmin ? { text: 'Admin', variant: 'info' } : undefined}
            actions={[
              { icon: Pencil, label: 'Editar', onClick: () => navigate(`/admin/users/${user.id}`) },
              { icon: Trash2, label: 'Excluir', onClick: () => removeUser(user.id), variant: 'danger' }
            ]}
          />
        ))}
      </DashboardColumn>
        </div>
      )}
    </div>
  );

  function renderFocusedContent() {
    console.log('renderFocusedContent called, focusedSection:', focusedSection);
    if (!focusedSection) return null;

    const currentStat = statsData.find(s => s.key === focusedSection);
    if (!currentStat) {
      console.log('No currentStat found for:', focusedSection);
      return null;
    }
    console.log('Rendering focused content for:', currentStat);

    return (
      <motion.div 
        key={focusedSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >

        {/* Focused content based on section */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            {renderSectionList(focusedSection)}
          </div>
          <div className="col-span-3">
            {renderSectionForm(focusedSection)}
          </div>
        </div>
      </motion.div>
    );
  }

  function renderSectionList(section: string | null) {
    if (!section) return null;

    if (section === 'links') {
      return (
        <AdminLinkList
          links={paginatedLinks}
          currentPage={linkPage}
          totalPages={linkPageCount}
          onPageChange={setLinkPage}
          onEdit={(link) => {
            setEditingLink(link);
            setFormData({
              title: link.title,
              url: link.url,
              categoryId: link.categoryId?.toString() || '',
              imageUrl: link.imageUrl || '',
              imageFile: null,
              fileUrl: link.fileUrl || '',
              attachedFile: null,
              imageInputType: link.imageUrl ? 'link' : 'upload',
              fileInputType: link.fileUrl ? 'link' : 'upload',
              hasFile: !!(link.fileUrl),
              isPublic: !!link.isPublic,
              isFavorite: !!link.isFavorite,
              linkType: 'url', // Por padrão, links existentes são URL
              selectedFileId: ''
            });
          }}
          onDelete={removeLink}
        />
      );
    }

    if (section === 'files') {
      return (
        <AdminFileList
          files={filteredFiles}
          onDownload={(file) => {
            try {
              if (file.fileUrl) {
                // Cria um elemento <a> temporário para forçar download
                const link = document.createElement('a');
                link.href = file.fileUrl;
                link.download = file.title || 'arquivo';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else {
                toast.error('Arquivo sem URL para download');
              }
            } catch (error) {
              console.error('Erro ao fazer download:', error);
              toast.error('Erro ao fazer download do arquivo');
            }
          }}
          onDelete={removeFile}
        />
      );
    }

    return (
      <div className="h-full p-4 rounded-lg border" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {section === 'categories' && 'Categorias'}
          {section === 'colors' && 'Cores'}
          {section === 'users' && 'Usuários'}
        </h3>
      </div>
    );
  }

  function renderSectionForm(section: string | null) {
    if (!section) return null;

    if (section === 'links') {
      return (
        <AdminLinkForm
          editingLink={editingLink}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          files={files}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // Preparar dados para envio - mapear camelCase para snake_case
              let submitData: any = {
                title: formData.title,
                url: formData.url,
                category_id: formData.categoryId ? parseInt(formData.categoryId) : null,
                color: formData.color,
                is_public: formData.isPublic,
                is_favorite: formData.isFavorite
              };
              
              // Tratar upload de imagem
              if (formData.imageInputType === 'upload' && formData.imageFile) {
                console.log('DEBUG: Uploading image file:', formData.imageFile.name);
                const imageFormData = new FormData();
                imageFormData.append('file', formData.imageFile);
                const imageUploadRes = await api.post('/upload', imageFormData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                submitData.image_url = imageUploadRes.data.url;
                console.log('DEBUG: Image uploaded to:', submitData.image_url);
              } else if (formData.imageInputType === 'link' && formData.imageUrl) {
                submitData.image_url = formData.imageUrl;
                console.log('DEBUG: Using image URL:', submitData.image_url);
              }
              
              console.log('DEBUG Frontend: formData.imageFile =', formData.imageFile);
              console.log('DEBUG Frontend: formData.imageInputType =', formData.imageInputType);
              console.log('DEBUG Frontend: submitData being sent:', submitData);
              
              // Se tipo for arquivo, definir URL a partir do arquivo selecionado
              if (formData.linkType === 'file' && formData.selectedFileId) {
                const selectedFile = files.find(f => f.id.toString() === formData.selectedFileId);
                if (selectedFile) {
                  submitData.url = selectedFile.fileUrl;
                  // Para links tipo arquivo, não enviamos anexos
                  submitData.hasFile = false;
                  submitData.file_url = '';
                }
              } else if (formData.hasFile) {
                // Se for URL com arquivo anexo
                submitData.file_url = formData.fileUrl;
              }
              
              if (editingLink) {
                await api.patch(`/links/${editingLink.id}`, submitData);
                toast.success('Link atualizado!');
              } else {
                await api.post('/links', submitData);
                toast.success('Link criado!');
              }
              
              setEditingLink(null);
              setFormData({ 
                title: '', 
                url: '', 
                categoryId: '', 
                imageUrl: '', 
                imageFile: null, 
                fileUrl: '', 
                attachedFile: null, 
                imageInputType: 'link', 
                fileInputType: 'link', 
                hasFile: false, 
                isPublic: false, 
                isFavorite: false,
                linkType: 'url',
                selectedFileId: ''
              });
              console.log('DEBUG: Calling refresh after link creation/update');
              await refresh();
              console.log('DEBUG: Refresh completed, new links count:', links.length);
            } catch (error) {
              toast.error('Erro ao salvar link');
            }
          }}
          onCancel={() => {
            setEditingLink(null);
            setFormData({ 
              title: '', 
              url: '', 
              categoryId: '', 
              imageUrl: '', 
              imageFile: null, 
              fileUrl: '', 
              attachedFile: null, 
              imageInputType: 'link', 
              fileInputType: 'link', 
              hasFile: false, 
              isPublic: false, 
              isFavorite: false,
              linkType: 'url',
              selectedFileId: ''
            });
          }}
          onImagePreview={() => {
            const url = formData.imageUrl || (formData.imageFile ? URL.createObjectURL(formData.imageFile) : '');
            const name = formData.imageFile?.name || 'Imagem';
            if (url) setPreviewModal({type: 'image', url, name});
          }}
          onFilePreview={() => {
            const url = formData.fileUrl || (formData.attachedFile ? URL.createObjectURL(formData.attachedFile) : '');
            const name = formData.attachedFile?.name || 'Arquivo';
            if (url) {
              if (formData.fileUrl) {
                window.open(url, '_blank');
              } else {
                setPreviewModal({type: 'file', url, name});
              }
            }
          }}
        />
      );
    }

    if (section === 'files') {
      return (
        <AdminFileForm
          formData={fileFormData}
          setFormData={setFileFormData}
          categories={categories}
          editingFile={editingFile}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // Validação básica
              if (!fileFormData.title.trim()) {
                toast.error('Título é obrigatório');
                return;
              }
              
              if (fileFormData.fileInputType === 'upload' && !fileFormData.attachedFile) {
                toast.error('Selecione um arquivo para upload');
                return;
              }
              
              if (fileFormData.fileInputType === 'link' && !fileFormData.fileUrl.trim()) {
                toast.error('URL do arquivo é obrigatória');
                return;
              }

              let fileUrl = '';
              
              // Se for upload, primeiro envia o arquivo
              if (fileFormData.fileInputType === 'upload' && fileFormData.attachedFile) {
                console.log('Uploading file:', fileFormData.attachedFile.name, fileFormData.attachedFile.type, fileFormData.attachedFile.size);
                const uploadData = new FormData();
                uploadData.append('file', fileFormData.attachedFile);
                const uploadRes = await api.post('/upload', uploadData, { 
                  headers: { 'Content-Type': 'multipart/form-data' } 
                });
                fileUrl = (uploadRes.data as { url: string }).url;
              } else if (fileFormData.fileInputType === 'link' && fileFormData.fileUrl.trim()) {
                fileUrl = fileFormData.fileUrl.trim();
              }
              
              // Agora cria o schedule com o padrão correto
              const payload = {
                title: fileFormData.title.trim(),
                file_url: fileUrl,
                ...(fileFormData.description.trim() && { description: fileFormData.description.trim() }),
                ...(fileFormData.categoryId && { category_id: parseInt(fileFormData.categoryId) })
              };
              
              console.log('Schedule payload:', payload);

              if (editingFile) {
                await api.put(`/schedules/${editingFile.id}`, payload);
                toast.success('Arquivo atualizado!');
              } else {
                await api.post('/schedules', payload);
                toast.success('Arquivo enviado!');
              }
              
              setEditingFile(null);
              setFileFormData({ 
                title: '', 
                description: '', 
                categoryId: '', 
                fileUrl: '', 
                attachedFile: null, 
                fileInputType: 'upload' 
              });
              await refresh();
            } catch (error: any) {
              console.error('Erro ao salvar arquivo:', error);
              
              // Tratamento mais específico de erros
              if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.response.data?.error;
                
                if (status === 400) {
                  toast.error(`Erro de validação: ${message || 'Dados inválidos'}`);
                } else if (status === 413) {
                  toast.error('Arquivo muito grande. Tente um arquivo menor.');
                } else if (status === 415) {
                  toast.error('Tipo de arquivo não suportado.');
                } else if (status >= 500) {
                  toast.error('Erro no servidor. Tente novamente mais tarde.');
                } else {
                  toast.error(`Erro: ${message || 'Erro desconhecido'}`);
                }
              } else if (error.request) {
                toast.error('Erro de conexão. Verifique sua internet.');
              } else {
                toast.error('Erro ao processar arquivo');
              }
            }
          }}
          onCancel={() => {
            setEditingFile(null);
            setFileFormData({ 
              title: '', 
              description: '', 
              categoryId: '', 
              fileUrl: '', 
              attachedFile: null, 
              fileInputType: 'upload' 
            });
          }}
          onFilePreview={() => {
            try {
              let url = '';
              let name = 'Arquivo';
              
              if (fileFormData.fileInputType === 'link' && fileFormData.fileUrl) {
                url = fileFormData.fileUrl;
                name = fileFormData.title || 'Arquivo via link';
                window.open(url, '_blank');
              } else if (fileFormData.fileInputType === 'upload' && fileFormData.attachedFile) {
                url = URL.createObjectURL(fileFormData.attachedFile);
                name = fileFormData.attachedFile.name;
                setPreviewModal({type: 'file', url, name});
                
                // Cleanup do URL object após um tempo
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                }, 60000); // 1 minuto
              } else {
                toast.error('Nenhum arquivo para visualizar');
              }
            } catch (error) {
              console.error('Erro ao visualizar arquivo:', error);
              toast.error('Erro ao visualizar arquivo');
            }
          }}
        />
      );
    }

    if (section === 'categories') {
      return (
        <div className="p-4 rounded-lg border" style={{ 
          background: 'var(--card-background)', 
          borderColor: 'var(--card-border)',
          height: 'fit-content',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Nova Categoria
          </h3>
          <form className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nome</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="Nome da categoria" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Descrição</label>
              <textarea className="w-full px-3 py-2 rounded-lg border h-20" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="Descrição da categoria" />
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-lg font-medium" style={{ background: '#9333ea', color: 'white' }}>Criar Categoria</button>
          </form>
        </div>
      );
    }

    if (section === 'colors') {
      return (
        <div className="h-full p-4 rounded-lg border overflow-y-auto" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Nova Cor
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nome</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="Nome da cor" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Código da Cor</label>
              <input type="color" className="w-full h-12 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)' }} />
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-lg font-medium" style={{ background: '#e11d48', color: 'white' }}>Criar Cor</button>
          </form>
        </div>
      );
    }

    if (section === 'users') {
      return (
        <div className="h-full p-4 rounded-lg border overflow-y-auto" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Novo Usuário
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nome de Usuário</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="Nome do usuário" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input type="email" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Senha</label>
              <input type="password" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--input-background)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }} placeholder="Senha" />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span style={{ color: 'var(--text-primary)' }}>É Administrador</span>
              </label>
            </div>
            <button type="submit" className="w-full py-2 px-4 rounded-lg font-medium" style={{ background: '#6366f1', color: 'white' }}>Criar Usuário</button>
          </form>
        </div>
      );
    }

    return (
      <div className="h-full p-4 rounded-lg border" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Formulário
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Conteúdo aparecerá aqui...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Content Grid */}
      {focusedSection ? (
        <div className="focused-content">
          {renderFocusedContent()}
        </div>
      ) : (
        <div className="p-4">
          {/* Header */}
          <div className="mb-2">
            
            {/* Stats */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {statsData.map((stat, index) => {
                const isActive = focusedSection === stat.key;
                return (
                  <motion.div 
                    key={stat.title}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isActive ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      background: 'var(--card-background)',
                      borderColor: isActive ? stat.color : 'var(--card-border)',
                      ringColor: isActive ? stat.color : 'transparent',
                      boxShadow: isActive ? `0 0 20px ${stat.color}40` : 'none'
                    }}
                    onClick={() => {
                      console.log('Card clicked:', stat.key);
                      const newSection = focusedSection === stat.key ? null : stat.key;
                      setFocusedSection(newSection);
                      // Update sidebar selection - dashboard when null, section when active
                      window.dispatchEvent(new CustomEvent('updateSidebarSelection', { detail: newSection || 'dashboard' }));
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: `0 8px 25px ${stat.color}30`
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isActive ? 1.05 : 1,
                      rotate: isActive ? [0, 1, -1, 0] : 0
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: stat.color }}
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        {(() => {
                          const IconComponent = Icons[stat.icon as keyof typeof Icons];
                          return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                        })()}
                      </motion.div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {stat.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="admin-dashboard-grid mt-8">
            {/* Links */}
            <DashboardColumn
              title="Links"
              total={links.length}
              color="#2563eb"
              icon={<Link2 className="w-4 h-4 text-blue-600" />}
              onAdd={() => navigate('/admin/links/new')}
              page={linkPage}
              pageCount={linkPageCount}
              onPageChange={setLinkPage}
            >
              {paginatedLinks.map((link) => (
                <ListItem
                  key={link.id}
                  title={link.title}
                  subtitle={link.url}
                  icon={Link2}
                  iconColor="#2563eb"
                  actions={[
                    { icon: Pencil, label: 'Editar', onClick: () => navigate(`/admin/links/${link.id}`) },
                    { icon: Trash2, label: 'Excluir', onClick: () => removeLink(link.id), variant: 'danger' }
                  ]}
                />
              ))}
            </DashboardColumn>

            {/* Arquivos */}
            <DashboardColumn
              title="Arquivos"
              total={files.length}
              color="#16a34a"
              icon={<FileIcon className="w-4 h-4 text-green-600" />}
              onAdd={() => navigate('/admin/files/new')}
              page={filePage}
              pageCount={filePageCount}
              onPageChange={setFilePage}
            >
              {paginatedFiles.map((file) => (
                <ListItem
                  key={file.id}
                  title={file.title}
                  subtitle={fileCategoryMap[file.categoryId] || 'Sem categoria'}
                  icon={FileIcon}
                  iconColor="#16a34a"
                  actions={[
                    { icon: Download, label: 'Download', onClick: () => window.open(file.fileUrl, '_blank') },
                    { icon: Trash2, label: 'Excluir', onClick: () => removeFile(file.id), variant: 'danger' }
                  ]}
                />
              ))}
            </DashboardColumn>

            {/* Categorias */}
            <DashboardColumn
              title="Categorias"
              total={categories.length}
              color="#9333ea"
              icon={<Folder className="w-4 h-4 text-purple-600" />}
              onAdd={() => navigate('/admin/categories/new')}
              page={catPage}
              pageCount={catPageCount}
              onPageChange={setCatPage}
            >
              {paginatedCats.map((category) => (
                <ListItem
                  key={category.id}
                  title={category.name}
                  subtitle={category.color}
                  icon={Icons[category.icon as keyof typeof Icons] || Folder}
                  iconColor={category.color}
                  actions={[
                    { icon: Pencil, label: 'Editar', onClick: () => startEditCat(category) },
                    { icon: Trash2, label: 'Excluir', onClick: () => removeCat(category.id), variant: 'danger' }
                  ]}
                />
              ))}
            </DashboardColumn>

            {/* Cores */}
            <DashboardColumn
              title="Cores"
              total={colors.length}
              color="#e11d48"
              icon={<Palette className="w-4 h-4 text-pink-600" />}
              onAdd={() => navigate('/admin/colors/new')}
              page={colorPage}
              pageCount={colorPageCount}
              onPageChange={setColorPage}
            >
              {paginatedColors.map((color) => (
                <ListItem
                  key={color.id}
                  title={color.name || color.value}
                  subtitle={color.value}
                  icon={<div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />}
                  actions={[
                    { icon: Pencil, label: 'Editar', onClick: () => startEditColor(color) },
                    { icon: Trash2, label: 'Excluir', onClick: () => removeColor(color.id), variant: 'danger' }
                  ]}
                />
              ))}
            </DashboardColumn>

            {/* Usuários */}
            <DashboardColumn
              title="Usuários"
              total={users.length}
              color="#6366f1"
              icon={<Users className="w-4 h-4 text-indigo-600" />}
              onAdd={() => navigate('/admin/users/new')}
              page={userPage}
              pageCount={userPageCount}
              onPageChange={setUserPage}
            >
              {paginatedUsers.map((user) => (
                <ListItem
                  key={user.id}
                  title={user.username}
                  subtitle={user.email}
                  icon={User}
                  iconColor="#6366f1"
                  badge={user.isAdmin ? { text: 'Admin', variant: 'info' } : undefined}
                  actions={[
                    { icon: Pencil, label: 'Editar', onClick: () => startEditUser(user) },
                    { icon: Trash2, label: 'Excluir', onClick: () => removeUser(user.id), variant: 'danger' }
                  ]}
                />
              ))}
            </DashboardColumn>
          </div>
        </div>
      )}
      
      <PreviewModal 
        previewData={previewModal}
        onClose={() => setPreviewModal(null)}
      />
    </>
  );
}
