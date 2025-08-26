import { LinkData } from "../components/LinkCard";

export interface FileData {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface Color {
  id: number;
  value: string;
  name?: string;
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface LinksColumnProps {
  links: LinkData[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  removeLink: (id: number) => Promise<void>;
  categoryMap: Record<number, { color: string; icon: string }>;
}

export interface FilesColumnProps {
  files: FileData[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  removeFile: (id: number) => Promise<void>;
  categoryMap: Record<number, string>;
  userMap: Record<number, string>;
}

export interface CategoriesColumnProps {
  categories: Category[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  removeCategory: (id: number) => Promise<void>;
}

export interface ColorsColumnProps {
  colors: Color[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  editingId: number | null;
  editColor: string;
  editColorName: string;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  setEditColor: React.Dispatch<React.SetStateAction<string>>;
  setEditColorName: React.Dispatch<React.SetStateAction<string>>;
  saveColorEdit: () => Promise<void>;
  removeColor: (id: number) => Promise<void>;
}

export interface UsersColumnProps {
  users: User[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  removeUser: (id: number) => Promise<void>;
}