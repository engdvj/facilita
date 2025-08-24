export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  is_admin: boolean;
  theme?: string | Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  adminOnly?: boolean;
}

export interface Color {
  id: number;
  value: string;
  name?: string;
}

export interface LinkData {
  id: number;
  title: string;
  url: string;
  fileUrl?: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
  color?: string;
  imageUrl?: string;
}

export interface LinkFormData {
  title: string;
  url: string;
  file_url: string;
  user_id?: number | null;
  category_id: number | null;
  color: string;
  image_url: string;
}

export interface FileItem {
  id: number;
  title: string;
  fileUrl: string;
  userId?: number;
  user?: string;
  categoryId?: number;
  category?: string;
}

export type ImageType = 'url' | 'file';
export type LinkType = 'link' | 'file';

// Theme system exports
export type { ThemeColors, ThemeDefinition, ThemeId } from './theme';
export { DEFAULT_THEMES } from './theme';

export interface FormField {
  name: string;
  type: 'text' | 'select' | 'file' | 'checkbox';
  label: string;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  required?: boolean;
}

export interface PaginationResult<T> {
  items: T[];
  pageCount: number;
  currentPage: number;
  totalItems: number;
}