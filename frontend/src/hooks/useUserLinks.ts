import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { LinkData } from '../components/LinkCard';

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

interface FileItem {
  id: number;
  title: string;
  fileUrl: string;
}

interface CurrentUser {
  id: number;
  username: string;
  isAdmin: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkFormData {
  title: string;
  url: string;
  file_url: string;
  category_id: number | null;
  color: string;
  image_url: string;
}

export function useUserLinks() {
  const { userId } = useParams<{ userId?: string }>();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      const [linksRes, catsRes, colorsRes, filesRes] = await Promise.allSettled([
        userId ? api.get(`/users/${userId}/links`) : api.get("/links"),
        api.get("/categories"),
        api.get("/colors"),
        api.get("/schedules"),
      ]);

      if (linksRes.status === "fulfilled") {
        setLinks(linksRes.value.data);
      }
      if (catsRes.status === "fulfilled") {
        setCategories(catsRes.value.data);
      }
      if (colorsRes.status === "fulfilled") {
        setColors(colorsRes.value.data);
      }
      if (filesRes.status === "fulfilled") {
        setFiles(filesRes.value.data);
      }

      if (userId) {
        try {
          const userRes = await api.get(`/users/${userId}`);
          setUser(userRes.data);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (linkId: number) => {
    if (!confirm("Tem certeza de que deseja excluir este link?")) return;
    
    try {
      await api.delete(`/links/${linkId}`);
      toast.success("Link excluído com sucesso!");
      await refreshData();
    } catch (error) {
      console.error("Erro ao excluir link:", error);
      toast.error("Erro ao excluir link");
    }
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  return {
    user,
    links,
    categories,
    colors,
    files,
    isLoading,
    refreshData,
    deleteLink,
  };
}