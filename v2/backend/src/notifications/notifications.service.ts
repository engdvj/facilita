import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, EntityType, ContentAudience } from '@prisma/client';
import { isUserMode } from '../common/app-mode';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  entityType: EntityType;
  entityId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Create single notification
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto,
    });
  }

  // Create notifications for multiple users
  async createBulk(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>) {
    const notifications = userIds.map((userId) => ({
      userId,
      ...dto,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  // Get notifications for user (paginated)
  async findByUser(userId: string, limit = 50, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  // Mark as read
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  // Delete notification
  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  // Cleanup old notifications (7+ days)
  async cleanupOld() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });
  }

  // Determine recipient users based on content audience
  async getRecipientsByAudience(
    companyId: string,
    sectorId: string | null | undefined,
    audience: ContentAudience,
    excludeUserId?: string,
  ): Promise<string[]> {
    if (isUserMode()) {
      const where: any = {
        status: 'ACTIVE',
        ...(excludeUserId && { id: { not: excludeUserId } }),
      };

      switch (audience) {
        case ContentAudience.PUBLIC:
          break;
        case ContentAudience.ADMIN:
          where.role = { in: ['ADMIN', 'SUPERADMIN'] };
          break;
        case ContentAudience.SUPERADMIN:
          where.role = 'SUPERADMIN';
          break;
        case ContentAudience.PRIVATE:
          return [];
        case ContentAudience.COMPANY:
        case ContentAudience.SECTOR:
        default:
          if (!companyId) return [];
          where.id = companyId;
      }

      const users = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });

      return users.map((user: { id: string }) => user.id);
    }

    const where: any = {
      status: 'ACTIVE',
      ...(excludeUserId && { id: { not: excludeUserId } }),
    };

    switch (audience) {
      case ContentAudience.PUBLIC:
        // All active users
        break;

      case ContentAudience.COMPANY:
        where.companyId = companyId;
        break;

      case ContentAudience.SECTOR:
        if (sectorId) {
          // Busca usuários que pertencem a este setor através da tabela UserSector
          where.userSectors = {
            some: {
              sectorId: sectorId,
            },
          };
        } else {
          where.companyId = companyId;
        }
        break;

      case ContentAudience.ADMIN:
        where.companyId = companyId;
        where.role = { in: ['ADMIN', 'SUPERADMIN'] };
        break;

      case ContentAudience.SUPERADMIN:
        where.role = 'SUPERADMIN';
        break;

      case ContentAudience.PRIVATE:
        // No recipients for private content
        return [];

      default:
        where.companyId = companyId;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    return users.map((user: { id: string }) => user.id);
  }

  // Get users who favorited an item
  async getUsersWhoFavorited(
    entityType: EntityType,
    entityId: string,
  ): Promise<string[]> {
    const where: any = { entityType };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    const favorites = await this.prisma.favorite.findMany({
      where,
      select: { userId: true },
    });

    return favorites.map((favorite: { userId: string }) => favorite.userId);
  }
}
