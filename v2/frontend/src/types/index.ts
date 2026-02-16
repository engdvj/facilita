export type UserRole = 'SUPERADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type ContentVisibility = 'PRIVATE' | 'PUBLIC';
export type EntityType = 'LINK' | 'SCHEDULE' | 'NOTE' | 'USER';

export type UserPreview = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatarUrl?: string | null;
};

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  theme?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  ownerId: string;
  name: string;
  color?: string;
  icon?: string;
  adminOnly: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    links: number;
    schedules: number;
    notes: number;
  };
}

export interface Link {
  id: string;
  ownerId: string;
  categoryId?: string | null;
  title: string;
  url: string;
  description?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  visibility: ContentVisibility;
  publicToken?: string | null;
  order: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: Category | null;
  owner?: UserPreview;
  createdBy?: UserPreview;
  shareCount?: number;
  sharedWithPreview?: UserPreview[];
  _count?: {
    favorites: number;
  };
}

export interface UploadedSchedule {
  id: string;
  ownerId: string;
  categoryId?: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  color?: string | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  visibility: ContentVisibility;
  publicToken?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: Category | null;
  owner?: UserPreview;
  createdBy?: UserPreview;
  shareCount?: number;
  sharedWithPreview?: UserPreview[];
  _count?: {
    favorites: number;
  };
}

export interface Note {
  id: string;
  ownerId: string;
  categoryId?: string | null;
  title: string;
  content: string;
  color?: string | null;
  imageUrl?: string | null;
  imagePosition?: string | null;
  imageScale?: number | null;
  visibility: ContentVisibility;
  publicToken?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: Category | null;
  owner?: UserPreview;
  createdBy?: UserPreview;
  shareCount?: number;
  sharedWithPreview?: UserPreview[];
}

export interface Share {
  id: string;
  ownerId: string;
  recipientId: string;
  entityType: 'LINK' | 'SCHEDULE' | 'NOTE';
  linkId?: string | null;
  scheduleId?: string | null;
  noteId?: string | null;
  localCategoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  removedAt?: string | null;
  revokedAt?: string | null;
  owner?: UserPreview;
  recipient?: UserPreview;
  localCategory?: Pick<Category, 'id' | 'name' | 'color'> | null;
  link?: Link | null;
  schedule?: UploadedSchedule | null;
  note?: Note | null;
}

export interface Favorite {
  id: string;
  userId: string;
  entityType: 'LINK' | 'SCHEDULE' | 'NOTE';
  linkId?: string | null;
  scheduleId?: string | null;
  noteId?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  entityType: EntityType;
  entityId: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  canViewDashboard: boolean;
  canAccessAdmin: boolean;
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewLinks: boolean;
  canManageLinks: boolean;
  canManageCategories: boolean;
  canManageSchedules: boolean;
  canViewPrivateContent: boolean;
  canBackupSystem: boolean;
  canResetSystem: boolean;
  canViewAuditLogs: boolean;
  canManageSystemConfig: boolean;
  canManageShares: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: string;
  isEditable: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedImage {
  id: string;
  uploadedBy: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  tags: string[];
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  usageCount?: number;
}

export interface ImageFilters {
  search?: string;
  uploadedBy?: string;
  tags?: string[];
}
