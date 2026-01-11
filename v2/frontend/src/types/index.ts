export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'COLLABORATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type NotificationType = 'EMAIL' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';
export type EntityType = 'LINK' | 'SCHEDULE' | 'NOTE' | 'USER' | 'SECTOR' | 'COMPANY';
export type ContentAudience =
  | 'PUBLIC'
  | 'COMPANY'
  | 'SECTOR'
  | 'PRIVATE'
  | 'ADMIN'
  | 'SUPERADMIN';

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  logoUrl?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  cnpj?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  company?: Company;
}

export interface Sector {
  id: string;
  companyId: string;
  unitId: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  unit?: Unit;
}

export interface User {
  id: string;
  companyId?: string;
  unitId?: string;
  sectorId?: string;
  name: string;
  email: string;
  cpf?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  theme?: any;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  unit?: Unit;
  sector?: Sector;
}

export interface Category {
  id: string;
  companyId: string;
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
    notes?: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Link {
  id: string;
  companyId: string;
  userId?: string;
  sectorId?: string;
  categoryId?: string;
  title: string;
  url: string;
  description?: string;
  color?: string;
  imageUrl?: string;
  imagePosition?: string;
  imageScale?: number;
  isPublic: boolean;
  audience?: ContentAudience;
  order: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: Category;
  sector?: Sector;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  tags?: {
    tag: Tag;
  }[];
  versions?: LinkVersion[];
  _count?: {
    favorites: number;
  };
}

export interface UploadedSchedule {
  id: string;
  companyId: string;
  userId?: string;
  sectorId?: string;
  categoryId?: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  color?: string;
  imageUrl?: string;
  imagePosition?: string;
  imageScale?: number;
  isPublic: boolean;
  audience?: ContentAudience;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: Category;
  sector?: Sector;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  tags?: {
    tag: Tag;
  }[];
  _count?: {
    favorites: number;
  };
}

export interface Note {
  id: string;
  companyId: string;
  userId?: string;
  sectorId?: string;
  categoryId?: string;
  title: string;
  content: string;
  color?: string;
  imageUrl?: string;
  imagePosition?: string;
  imageScale?: number;
  isPublic: boolean;
  audience?: ContentAudience;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: Category;
  sector?: Sector;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface LinkVersion {
  id: string;
  linkId: string;
  title: string;
  url: string;
  description?: string;
  changedBy: string;
  changeReason?: string;
  createdAt: string;
  changedByUser?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Favorite {
  id: string;
  userId: string;
  entityType: EntityType;
  linkId?: string;
  scheduleId?: string;
  noteId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  companyId: string;
  userId?: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  data?: any;
  readAt?: string;
  sentAt?: string;
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
  canViewSectors: boolean;
  canManageSectors: boolean;
  canViewLinks: boolean;
  canManageLinks: boolean;
  canManageCategories: boolean;
  canManageSchedules: boolean;
  canBackupSystem: boolean;
  canResetSystem: boolean;
  canViewAuditLogs: boolean;
  canManageSystemConfig: boolean;
  restrictToOwnSector: boolean;
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
