import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { LinkFormData } from './useUserLinks';

const initialFormData: LinkFormData = {
  title: "",
  url: "",
  file_url: "",
  category_id: null,
  color: "#000000",
  image_url: "",
};

export function useLinkForm() {
  const navigate = useNavigate();
  
  // New link state
  const [newLink, setNewLink] = useState<LinkFormData>(initialFormData);
  const [newImageType, setNewImageType] = useState<"url" | "file">("url");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newHasFile, setNewHasFile] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newLinkType, setNewLinkType] = useState<'link' | 'file'>('link');

  // Edit link state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState<LinkFormData>(initialFormData);
  const [editImageType, setEditImageType] = useState<"url" | "file">("url");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editHasFile, setEditHasFile] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLinkType, setEditLinkType] = useState<'link' | 'file'>('link');

  const resetNewForm = () => {
    setNewLink(initialFormData);
    setNewImageType("url");
    setNewImageFile(null);
    setNewHasFile(false);
    setNewFile(null);
    setNewLinkType('link');
  };

  const resetEditForm = () => {
    setEditingId(null);
    setEditLink(initialFormData);
    setEditImageType("url");
    setEditImageFile(null);
    setEditHasFile(false);
    setEditFile(null);
    setEditLinkType('link');
  };

  const startEditing = (link: any) => {
    setEditingId(link.id);
    setEditLink({
      title: link.title || "",
      url: link.url || "",
      file_url: link.file_url || "",
      category_id: link.categoryId || null,
      color: link.color || "#000000",
      image_url: link.imageUrl || "",
    });
    setEditImageType("url");
    setEditImageFile(null);
    setEditHasFile(!!link.file_url);
    setEditFile(null);
    setEditLinkType(link.file_url ? 'file' : 'link');
  };

  const createLink = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("title", newLink.title);
      formData.append("category_id", newLink.category_id?.toString() || "");
      formData.append("color", newLink.color);
      
      if (newLinkType === 'link') {
        formData.append("url", newLink.url);
      } else if (newFile) {
        formData.append("file", newFile);
      }

      if (newImageType === "file" && newImageFile) {
        formData.append("image", newImageFile);
      } else if (newImageType === "url" && newLink.image_url) {
        formData.append("image_url", newLink.image_url);
      }

      await api.post("/links", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Link criado com sucesso!");
      resetNewForm();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar link:", error);
      toast.error("Erro ao criar link");
    }
  };

  const updateLink = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    
    if (!editingId) return;

    try {
      const formData = new FormData();
      formData.append("title", editLink.title);
      formData.append("category_id", editLink.category_id?.toString() || "");
      formData.append("color", editLink.color);
      
      if (editLinkType === 'link') {
        formData.append("url", editLink.url);
      } else if (editFile) {
        formData.append("file", editFile);
      }

      if (editImageType === "file" && editImageFile) {
        formData.append("image", editImageFile);
      } else if (editImageType === "url" && editLink.image_url) {
        formData.append("image_url", editLink.image_url);
      }

      await api.patch(`/links/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Link atualizado com sucesso!");
      resetEditForm();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao atualizar link:", error);
      toast.error("Erro ao atualizar link");
    }
  };

  return {
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
    resetNewForm,
    resetEditForm,
    startEditing,
    createLink,
    updateLink,
  };
}