import React, { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, Trash2, Home as HomeIcon, Link2, File as FileIcon, Folder, Palette, Users } from "lucide-react";
import * as Icons from "lucide-react";

import { LinkData, Category, Color, User, FileItem, LinkFormData } from "../types";
import { CARD_STYLES } from "../utils/constants";
import { createCategoryMap } from "../utils/pagination";
import { getIconComponent } from "../utils/helpers";

import { useEntityCRUD, usePagination, useApi } from "../hooks";
import { Button } from "../components/ui";
import { Pagination } from "../components/common";
import LinkForm from "../components/forms/LinkForm";
import Header from "../components/Header";
import api from "../api";

export default function UserLinksRefactored() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [open, setOpen] = useState(false);

  // Get current user
  const { execute: getMe } = useApi(() => api.get('/auth/me'));

  // CRUD hooks
  const { items: links, loading: linksLoading, refresh: refreshLinks, create: createLink, update: updateLink, remove: removeLink } = useEntityCRUD<LinkData>("links");
  const { items: categories } = useEntityCRUD<Category>("categories");
  const { items: colors } = useEntityCRUD<Color>("colors");
  const { items: files } = useEntityCRUD<FileItem>("schedules");

  // Pagination for user's own links
  const { currentPage, setCurrentPage, paginateItems } = usePagination({ itemsPerPage: 5 });

  // Computed values
  const userLinks = links.filter(l => l.userId === user?.id);
  const generalLinks = links.filter(l => l.userId !== user?.id);
  const sortedUserLinks = [...userLinks].sort((a, b) => a.title.localeCompare(b.title));
  const paginationResult = paginateItems(sortedUserLinks);
  const categoryMap = createCategoryMap(categories);

  // Load user data
  useEffect(() => {
    getMe()
      .then(userData => setUser(userData))
      .catch(() => navigate('/admin/login'));
  }, [getMe, navigate]);

  // Handle editing
  useEffect(() => {
    if (id && links.length) {
      const link = links.find(l => l.id === Number(id));
      if (link) {
        setEditingId(link.id);
        setEditingLink(link);
      }
    } else {
      setEditingId(null);
      setEditingLink(null);
    }
  }, [id, links]);

  // Event handlers
  const handleCreateLink = async (formData: LinkFormData) => {
    await createLink(formData);
  };

  const handleUpdateLink = async (formData: LinkFormData) => {
    if (!editingId) return;
    await updateLink(editingId, formData);
    setEditingId(null);
    setEditingLink(null);
    navigate("/user/links");
  };

  const handleEditLink = (link: LinkData) => {
    navigate(`/user/links/${link.id}`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLink(null);
    navigate("/user/links");
  };

  const handleDeleteLink = async (linkId: number) => {
    await removeLink(linkId);
  };

  const getFormDataFromLink = (link: LinkData): Partial<LinkFormData> => ({
    title: link.title,
    url: link.url,
    file_url: link.fileUrl || "",
    category_id: link.categoryId || null,
    color: link.color || "",
    image_url: link.imageUrl || "",
  });

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-color)' }}
    >
      <Header onMenuClick={() => setOpen(o => !o)} sidebarOpen={open} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <motion.aside
          className="w-64 p-6 space-y-4 transform transition-transform fixed top-16 bottom-0 left-0 z-20"
          style={{ backgroundColor: 'var(--card-background)', color: 'var(--link-bar-text)' }}
          initial={false}
          animate={{ x: open ? 0 : -256 }}
        >
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="mb-4 hover:underline flex items-center gap-1 px-2 py-1 rounded"
          >
            <HomeIcon size={18} /> Início
          </NavLink>
          
          <nav className="flex flex-col gap-2">
            {user.isAdmin ? (
              <>
                <NavLink to="/admin" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <HomeIcon size={18} /> Dashboard
                </NavLink>
                <NavLink to="/admin/links" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <Link2 size={18} /> Links
                </NavLink>
                <NavLink to="/admin/files" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <FileIcon size={18} /> Arquivos
                </NavLink>
                <NavLink to="/admin/categories" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <Folder size={18} /> Categorias
                </NavLink>
                <NavLink to="/admin/colors" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <Palette size={18} /> Cores
                </NavLink>
                <NavLink to="/admin/users" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                  <Users size={18} /> Usuários
                </NavLink>
              </>
            ) : (
              <NavLink to="/user/links" className="hover:underline flex items-center gap-1 px-2 py-1 rounded">
                <Link2 size={18} /> Links
              </NavLink>
            )}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-8 transition-all ${open ? 'translate-x-64 md:translate-x-0 md:ml-64' : 'md:ml-0'}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* General Links Section */}
              <section className={CARD_STYLES.main}>
                <h2 className="text-lg font-semibold mb-4">Links Gerais</h2>
                <ul className="space-y-2">
                  {generalLinks.map(link => {
                    const Icon = getIconComponent(categoryMap[link.categoryId || 0]?.icon || 'Link2', Icons);
                    return (
                      <li key={link.id} className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="opacity-70" />}
                        <a href={link.url} target="_blank" className="flex-1 underline">
                          {link.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* User Link Form */}
              <section className={CARD_STYLES.main}>
                <h2 className="text-lg font-semibold mb-4">
                  {editingId ? "Editar Link" : "Novo Link"}
                </h2>
                
                <LinkForm
                  initialData={editingLink ? getFormDataFromLink(editingLink) : undefined}
                  isEditing={!!editingId}
                  isAdmin={user.isAdmin}
                  categories={categories}
                  colors={colors}
                  users={user.isAdmin ? [] : undefined}
                  files={user.isAdmin ? files : undefined}
                  onSubmit={editingId ? handleUpdateLink : handleCreateLink}
                  onCancel={editingId ? handleCancelEdit : undefined}
                  loading={linksLoading}
                />
              </section>

              {/* User's Links List */}
              <section className={`${CARD_STYLES.main} flex flex-col overflow-hidden`}>
                <h2 className="text-lg font-semibold mb-4">
                  Seus Links ({userLinks.length})
                </h2>
                
                <motion.ul 
                  className="space-y-2 flex-1 overflow-y-auto" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  {paginationResult.items.map(link => {
                    const Icon = getIconComponent(
                      categoryMap[link.categoryId || 0]?.icon || "Link2", 
                      Icons
                    );
                    
                    return (
                      <motion.li
                        key={link.id}
                        layout
                        className={CARD_STYLES.item}
                      >
                        <span
                          className="w-4 h-4 rounded"
                          style={{ 
                            backgroundColor: link.color || categoryMap[link.categoryId || 0]?.color 
                          }}
                        />
                        
                        {Icon && <Icon size={16} className="opacity-70" />}
                        
                        {link.url ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 underline"
                          >
                            {link.title}
                          </a>
                        ) : (
                          <span className="flex-1">{link.title}</span>
                        )}
                        
                        {link.fileUrl && (
                          <a
                            href={link.fileUrl}
                            className="underline mr-2"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            arquivo
                          </a>
                        )}
                        
                        <Button
                          variant="edit"
                          onClick={() => handleEditLink(link)}
                          icon={<Pencil size={16} />}
                        />
                        
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteLink(link.id)}
                          icon={<Trash2 size={16} />}
                        />
                      </motion.li>
                    );
                  })}
                </motion.ul>

                <Pagination
                  currentPage={paginationResult.currentPage}
                  totalPages={paginationResult.pageCount}
                  onPageChange={setCurrentPage}
                />
              </section>
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}