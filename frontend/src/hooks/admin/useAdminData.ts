import { useState, useCallback } from 'react';
import api from '../../api';
import { LinkData } from '../../components/LinkCard';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface Color {
  id: number;
  value: string;
  name?: string;
}

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface FileData {
  id: number;
  title: string;
  fileUrl: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
}

interface AdminData {
  links: LinkData[];
  categories: Category[];
  colors: Color[];
  users: User[];
  files: FileData[];
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>({
    links: [],
    categories: [],
    colors: [],
    users: [],
    files: []
  });

  const refresh = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.get("/links"),
        api.get("/categories"),
        api.get("/colors"),
        api.get("/users"),
        api.get("/schedules"),
      ]);

      const [linkRes, catRes, colorRes, userRes, fileRes] = results;

      const newData: AdminData = {
        links: linkRes.status === "fulfilled" 
          ? [...linkRes.value.data].sort((a, b) => a.title.localeCompare(b.title))
          : [],
        categories: catRes.status === "fulfilled"
          ? [...catRes.value.data].sort((a, b) => a.name.localeCompare(b.name))
          : [],
        colors: colorRes.status === "fulfilled"
          ? [...colorRes.value.data].sort((a, b) => (a.name || a.value).localeCompare(b.name || b.value))
          : [],
        users: userRes.status === "fulfilled"
          ? [...userRes.value.data].sort((a, b) => a.username.localeCompare(b.username))
          : [],
        files: fileRes.status === "fulfilled"
          ? [...(fileRes.value.data as FileData[])].sort((a, b) => a.title.localeCompare(b.title))
          : []
      };

      setData(newData);
    } catch (error) {
      console.error('Error refreshing admin data:', error);
    }
  }, []);

  return {
    data,
    refresh,
    setData
  };
}

export type { AdminData, Category, Color, User, FileData };