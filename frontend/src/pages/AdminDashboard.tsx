import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import * as Icons from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";
import { Category, Color, FileData } from "../types/admin";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardStats from "../components/common/DashboardStats";
import DashboardColumn from "../components/common/DashboardColumn";
import ListItem from "../components/common/ListItem";
import ActionButton from "../components/common/ActionButton";

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

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleFocusSection = (event: CustomEvent) => {
      setFocusedSection(event.detail);
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
    <div className="p-4">
      {/* Header */}
      <div className="mb-2">
        
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-2">
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
                  setFocusedSection(focusedSection === stat.key ? null : stat.key);
                  // Toggle focused section - click again to deselect
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
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-6 h-6 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: stat.color }}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {(() => {
                      const IconComponent = Icons[stat.icon as keyof typeof Icons];
                      return IconComponent ? <IconComponent className="w-3 h-3" /> : null;
                    })()}
                  </motion.div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {stat.count}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {stat.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      {focusedSection ? (
        <div className="focused-content">
          {renderFocusedContent()}
        </div>
      ) : (
        <div className="admin-dashboard-grid">
      {/* Links */}
      <DashboardColumn
        title="Links"
        total={links.length}
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
        <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)] overflow-hidden">
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
        <div className="h-full p-4 rounded-lg border overflow-y-auto" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Links ({filteredLinks.length})
          </h3>
          {paginatedLinks.map((link) => (
            <div key={link.id} className="p-3 border rounded-lg mb-2" style={{ borderColor: 'var(--card-border)', background: 'var(--card-background)' }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {link.title}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {link.url}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
                    onClick={() => deleteLink(link.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="h-full p-4 rounded-lg border" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {section === 'files' && 'Arquivos'}
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
        <div className="h-full p-4 rounded-lg border overflow-y-auto" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Criar Novo Link
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Título
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  background: 'var(--input-background)', 
                  borderColor: 'var(--input-border)', 
                  color: 'var(--text-primary)' 
                }}
                placeholder="Digite o título do link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  background: 'var(--input-background)', 
                  borderColor: 'var(--input-border)', 
                  color: 'var(--text-primary)' 
                }}
                placeholder="https://exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Descrição
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border h-24"
                style={{ 
                  background: 'var(--input-background)', 
                  borderColor: 'var(--input-border)', 
                  color: 'var(--text-primary)' 
                }}
                placeholder="Descrição opcional do link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Categoria
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border"
                style={{ 
                  background: 'var(--input-background)', 
                  borderColor: 'var(--input-border)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option>Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                background: '#2563eb',
                color: 'white'
              }}
            >
              Criar Link
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="h-full p-4 rounded-lg border" style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {section === 'files' && 'Upload de Arquivo'}
          {section === 'categories' && 'Nova Categoria'}
          {section === 'colors' && 'Nova Cor'}
          {section === 'users' && 'Novo Usuário'}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Formulário aparecerá aqui...
        </p>
      </div>
    );
  }
}
