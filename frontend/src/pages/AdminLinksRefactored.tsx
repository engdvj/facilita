import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import * as Icons from "lucide-react";

import { LinkData, Category, Color, User, FileItem, LinkFormData } from "../types";
import { CARD_STYLES } from "../utils/constants";
import { createCategoryMap } from "../utils/pagination";
import { getIconComponent } from "../utils/helpers";

import { useEntityCRUD, usePagination } from "../hooks";
import { Button } from "../components/ui";
import { Pagination } from "../components/common";
import LinkForm from "../components/forms/LinkForm";

export default function AdminLinksRefactored() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);

  // CRUD hooks for different entities
  const { items: links, loading: linksLoading, refresh: refreshLinks, create: createLink, update: updateLink, remove: removeLink } = useEntityCRUD<LinkData>("links");
  const { items: categories } = useEntityCRUD<Category>("categories");
  const { items: colors } = useEntityCRUD<Color>("colors");
  const { items: users } = useEntityCRUD<User>("users");
  const { items: files } = useEntityCRUD<FileItem>("schedules");

  // Pagination
  const { currentPage, setCurrentPage, paginateItems } = usePagination({ itemsPerPage: 5 });

  // Computed values
  const sortedLinks = [...links].sort((a, b) => a.title.localeCompare(b.title));
  const paginationResult = paginateItems(sortedLinks);
  const categoryMap = createCategoryMap(categories);

  // Effects
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
    navigate("/admin/links");
  };

  const handleEditLink = (link: LinkData) => {
    navigate(`/admin/links/${link.id}`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLink(null);
    navigate("/admin/links");
  };

  const handleDeleteLink = async (linkId: number) => {
    await removeLink(linkId);
  };

  // Convert LinkData to LinkFormData for editing
  const getFormDataFromLink = (link: LinkData): Partial<LinkFormData> => ({
    title: link.title,
    url: link.url,
    file_url: link.fileUrl || "",
    user_id: link.userId || null,
    category_id: link.categoryId || null,
    color: link.color || "",
    image_url: link.imageUrl || "",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ color: 'var(--text-color)' }}>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <section className={CARD_STYLES.main}>
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Editar Link" : "Novo Link"}
          </h2>
          
          <LinkForm
            initialData={editingLink ? getFormDataFromLink(editingLink) : undefined}
            isEditing={!!editingId}
            isAdmin={true}
            categories={categories}
            colors={colors}
            users={users}
            files={files}
            onSubmit={editingId ? handleUpdateLink : handleCreateLink}
            onCancel={editingId ? handleCancelEdit : undefined}
            loading={linksLoading}
          />
        </section>

        {/* List Section */}
        <section className={`${CARD_STYLES.main} flex flex-col overflow-hidden`}>
          <h2 className="text-lg font-semibold mb-4">
            Links ({links.length})
          </h2>
          
          <motion.ul 
            className="space-y-2 flex-1 overflow-y-auto" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            {paginationResult.items.map((link) => {
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
                  
                  {link.user && (
                    <span className="text-xs px-2 py-1 rounded bg-slate-700 opacity-80">
                      {link.user}
                    </span>
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
  );
}