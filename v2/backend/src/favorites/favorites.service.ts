import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

type FavoriteEntityType = 'LINK' | 'SCHEDULE' | 'NOTE';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  private assertEntityTypeSupported(
    entityType: EntityType,
  ): asserts entityType is FavoriteEntityType {
    if (
      entityType !== EntityType.LINK &&
      entityType !== EntityType.SCHEDULE &&
      entityType !== EntityType.NOTE
    ) {
      throw new BadRequestException('Unsupported entity type for favorites');
    }
  }

  private async canAccessEntity(
    userId: string,
    entityType: FavoriteEntityType,
    entityId: string,
  ) {
    if (entityType === EntityType.LINK) {
      const link = await this.prisma.link.findUnique({
        where: { id: entityId },
        include: {
          owner: {
            select: { role: true },
          },
        },
      });
      if (!link || link.deletedAt) return false;

      if (link.ownerId === userId) return true;
      if (link.visibility === 'PUBLIC' && link.owner.role === 'SUPERADMIN') return true;

      const shared = await this.prisma.share.findFirst({
        where: {
          recipientId: userId,
          linkId: entityId,
          revokedAt: null,
          removedAt: null,
        },
      });

      return Boolean(shared);
    }

    if (entityType === EntityType.SCHEDULE) {
      const schedule = await this.prisma.uploadedSchedule.findUnique({
        where: { id: entityId },
        include: {
          owner: {
            select: { role: true },
          },
        },
      });
      if (!schedule || schedule.deletedAt) return false;

      if (schedule.ownerId === userId) return true;
      if (schedule.visibility === 'PUBLIC' && schedule.owner.role === 'SUPERADMIN') return true;

      const shared = await this.prisma.share.findFirst({
        where: {
          recipientId: userId,
          scheduleId: entityId,
          revokedAt: null,
          removedAt: null,
        },
      });

      return Boolean(shared);
    }

    if (entityType === EntityType.NOTE) {
      const note = await this.prisma.note.findUnique({
        where: { id: entityId },
        include: {
          owner: {
            select: { role: true },
          },
        },
      });
      if (!note || note.deletedAt) return false;

      if (note.ownerId === userId) return true;
      if (note.visibility === 'PUBLIC' && note.owner.role === 'SUPERADMIN') return true;

      const shared = await this.prisma.share.findFirst({
        where: {
          recipientId: userId,
          noteId: entityId,
          revokedAt: null,
          removedAt: null,
        },
      });

      return Boolean(shared);
    }

    return false;
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    this.assertEntityTypeSupported(dto.entityType);

    const idsProvided = [dto.linkId, dto.scheduleId, dto.noteId].filter(Boolean).length;
    if (idsProvided !== 1) {
      throw new BadRequestException(
        'Provide exactly one ID (linkId, scheduleId or noteId)',
      );
    }

    if (dto.entityType === EntityType.LINK && !dto.linkId) {
      throw new BadRequestException('linkId is required when entityType = LINK');
    }

    if (dto.entityType === EntityType.SCHEDULE && !dto.scheduleId) {
      throw new BadRequestException('scheduleId is required when entityType = SCHEDULE');
    }

    if (dto.entityType === EntityType.NOTE && !dto.noteId) {
      throw new BadRequestException('noteId is required when entityType = NOTE');
    }

    const entityId = dto.linkId || dto.scheduleId || dto.noteId;
    if (!entityId) {
      throw new BadRequestException('Entity ID is required');
    }

    const canAccess = await this.canAccessEntity(userId, dto.entityType, entityId);
    if (!canAccess) {
      throw new NotFoundException('Content not found or not accessible');
    }

    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        entityType: dto.entityType,
        linkId: dto.linkId ?? null,
        scheduleId: dto.scheduleId ?? null,
        noteId: dto.noteId ?? null,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('This item is already in favorites');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        entityType: dto.entityType,
        linkId: dto.linkId,
        scheduleId: dto.scheduleId,
        noteId: dto.noteId,
      },
      include: {
        link: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        schedule: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        note: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        link: {
          where: { deletedAt: null },
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        schedule: {
          where: { deletedAt: null },
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        note: {
          where: { deletedAt: null },
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserAndType(userId: string, entityType: EntityType) {
    this.assertEntityTypeSupported(entityType);
    return this.prisma.favorite.findMany({
      where: { userId, entityType },
      include: {
        link: {
          where: { deletedAt: null },
          include: { category: true, owner: true },
        },
        schedule: {
          where: { deletedAt: null },
          include: { category: true, owner: true },
        },
        note: {
          where: { deletedAt: null },
          include: { category: true, owner: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFavorited(
    userId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean> {
    this.assertEntityTypeSupported(entityType);

    const where: any = {
      userId,
      entityType,
    };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    const favorite = await this.prisma.favorite.findFirst({ where });
    return !!favorite;
  }

  async remove(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findUnique({ where: { id } });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    if (favorite.userId !== userId) {
      throw new BadRequestException('You cannot remove favorites from other users');
    }

    await this.prisma.favorite.delete({ where: { id } });

    return { message: 'Favorite removed successfully' };
  }

  async removeByEntity(userId: string, entityType: EntityType, entityId: string) {
    this.assertEntityTypeSupported(entityType);

    const where: any = { userId, entityType };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    const favorite = await this.prisma.favorite.findFirst({ where });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({ where: { id: favorite.id } });

    return { message: 'Favorite removed successfully' };
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.favorite.count({ where: { userId } });
  }

  async countByEntity(entityType: EntityType, entityId: string): Promise<number> {
    this.assertEntityTypeSupported(entityType);

    const where: any = { entityType };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    return this.prisma.favorite.count({ where });
  }
}
