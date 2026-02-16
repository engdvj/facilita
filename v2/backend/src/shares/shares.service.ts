import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityType, NotificationType, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareLocalCategoryDto } from './dto/update-share-local-category.dto';

type ShareableEntityType =
  | 'LINK'
  | 'SCHEDULE'
  | 'NOTE';

@Injectable()
export class SharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private assertUserOnly(actor: { role: UserRole }) {
    if (actor.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException('Superadmin cannot use share flow');
    }
  }

  private assertShareableEntityType(
    entityType: EntityType,
  ): asserts entityType is ShareableEntityType {
    if (
      entityType !== EntityType.LINK &&
      entityType !== EntityType.SCHEDULE &&
      entityType !== EntityType.NOTE
    ) {
      throw new BadRequestException('Unsupported entity type for share');
    }
  }

  private buildEntityWhere(entityType: ShareableEntityType, entityId: string) {
    if (entityType === EntityType.LINK) {
      return { linkId: entityId };
    }
    if (entityType === EntityType.SCHEDULE) {
      return { scheduleId: entityId };
    }
    if (entityType === EntityType.NOTE) {
      return { noteId: entityId };
    }
    throw new BadRequestException('Unsupported entity type for share');
  }

  private async resolveEntity(entityType: ShareableEntityType, entityId: string) {
    if (entityType === EntityType.LINK) {
      const link = await this.prisma.link.findUnique({
        where: { id: entityId },
        select: { id: true, title: true, ownerId: true },
      });
      if (!link) throw new NotFoundException('Link not found');
      return link;
    }
    if (entityType === EntityType.SCHEDULE) {
      const schedule = await this.prisma.uploadedSchedule.findUnique({
        where: { id: entityId },
        select: { id: true, title: true, ownerId: true },
      });
      if (!schedule) throw new NotFoundException('Document not found');
      return schedule;
    }
    if (entityType === EntityType.NOTE) {
      const note = await this.prisma.note.findUnique({
        where: { id: entityId },
        select: { id: true, title: true, ownerId: true },
      });
      if (!note) throw new NotFoundException('Note not found');
      return note;
    }
    throw new BadRequestException('Unsupported entity type for share');
  }

  private async validateRecipients(ownerId: string, recipientIds: string[]) {
    const uniqueRecipientIds = Array.from(
      new Set(recipientIds.map((id) => id.trim()).filter(Boolean)),
    );

    if (uniqueRecipientIds.length === 0) {
      throw new BadRequestException('At least one recipient is required');
    }

    if (uniqueRecipientIds.includes(ownerId)) {
      throw new BadRequestException('Cannot share with yourself');
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueRecipientIds },
      },
      select: { id: true, role: true, status: true },
    });

    if (users.length !== uniqueRecipientIds.length) {
      throw new BadRequestException('One or more recipients do not exist');
    }

    const invalid = users.find(
      (user) => user.status !== 'ACTIVE' || user.role === UserRole.SUPERADMIN,
    );
    if (invalid) {
      throw new BadRequestException(
        'Recipients must be active users and cannot be superadmin',
      );
    }

    return uniqueRecipientIds;
  }

  private includeShareRelations() {
    return {
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
      recipient: {
        select: { id: true, name: true, email: true, role: true },
      },
      localCategory: {
        select: { id: true, name: true, color: true },
      },
      link: {
        include: {
          category: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      schedule: {
        include: {
          category: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      note: {
        include: {
          category: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    } as const;
  }

  async create(actor: { id: string; role: UserRole }, dto: CreateShareDto) {
    this.assertUserOnly(actor);
    this.assertShareableEntityType(dto.entityType);

    const entity = await this.resolveEntity(dto.entityType, dto.entityId);
    if (entity.ownerId !== actor.id) {
      throw new ForbiddenException('You can only share your own content');
    }

    const recipientIds = await this.validateRecipients(actor.id, dto.recipientIds);
    const entityWhere = this.buildEntityWhere(dto.entityType, dto.entityId);

    const shares = [];
    for (const recipientId of recipientIds) {
      const existing = await this.prisma.share.findFirst({
        where: {
          ownerId: actor.id,
          recipientId,
          entityType: dto.entityType,
          ...entityWhere,
        },
      });

      if (existing) {
        const reactivated = await this.prisma.share.update({
          where: { id: existing.id },
          data: {
            revokedAt: null,
            removedAt: null,
            localCategoryId: null,
          },
          include: this.includeShareRelations(),
        });
        shares.push(reactivated);
        continue;
      }

      const created = await this.prisma.share.create({
        data: {
          ownerId: actor.id,
          recipientId,
          entityType: dto.entityType,
          ...entityWhere,
        },
        include: this.includeShareRelations(),
      });

      shares.push(created);
    }

    await this.notificationsService.createBulk(recipientIds, {
      type: NotificationType.CONTENT_SHARED,
      entityType: dto.entityType,
      entityId: dto.entityId,
      title: 'Novo compartilhamento',
      message: `${entity.title} foi compartilhado com voce`,
      actionUrl: '/compartilhados',
      metadata: {
        ownerId: actor.id,
        entityTitle: entity.title,
      },
    });

    return {
      entityType: dto.entityType,
      entityId: dto.entityId,
      totalRecipients: recipientIds.length,
      shares,
    };
  }

  async findReceived(actor: { id: string; role: UserRole }, type?: EntityType) {
    this.assertUserOnly(actor);
    if (type) {
      this.assertShareableEntityType(type);
    }

    return this.prisma.share.findMany({
      where: {
        recipientId: actor.id,
        revokedAt: null,
        removedAt: null,
        ...(type ? { entityType: type } : {}),
      },
      include: this.includeShareRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSent(actor: { id: string; role: UserRole }, type?: EntityType) {
    this.assertUserOnly(actor);
    if (type) {
      this.assertShareableEntityType(type);
    }

    return this.prisma.share.findMany({
      where: {
        ownerId: actor.id,
        revokedAt: null,
        ...(type ? { entityType: type } : {}),
      },
      include: this.includeShareRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecipients(actor: { id: string; role: UserRole }) {
    this.assertUserOnly(actor);

    return this.prisma.user.findMany({
      where: {
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        id: { not: actor.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateLocalCategory(
    actor: { id: string; role: UserRole },
    shareId: string,
    dto: UpdateShareLocalCategoryDto,
  ) {
    this.assertUserOnly(actor);

    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
      select: {
        id: true,
        recipientId: true,
        revokedAt: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.revokedAt) {
      throw new ForbiddenException('Share is revoked');
    }

    if (share.recipientId !== actor.id) {
      throw new ForbiddenException('Only recipient can set local category');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true, ownerId: true },
      });
      if (!category || category.ownerId !== actor.id) {
        throw new ForbiddenException('Category not authorized');
      }
    }

    return this.prisma.share.update({
      where: { id: shareId },
      data: {
        localCategoryId: dto.categoryId ?? null,
      },
      include: this.includeShareRelations(),
    });
  }

  async removeReceived(actor: { id: string; role: UserRole }, shareId: string) {
    this.assertUserOnly(actor);

    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
      select: {
        id: true,
        recipientId: true,
        revokedAt: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.recipientId !== actor.id) {
      throw new ForbiddenException('Only recipient can remove a received share');
    }

    if (share.revokedAt) {
      throw new ForbiddenException('Share is revoked');
    }

    return this.prisma.share.update({
      where: { id: shareId },
      data: { removedAt: new Date() },
    });
  }

  async revoke(actor: { id: string; role: UserRole }, shareId: string) {
    this.assertUserOnly(actor);

    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
      select: {
        id: true,
        ownerId: true,
        recipientId: true,
        entityType: true,
        linkId: true,
        scheduleId: true,
        noteId: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.ownerId !== actor.id) {
      throw new ForbiddenException('Only owner can revoke a share');
    }

    const revoked = await this.prisma.share.update({
      where: { id: shareId },
      data: { revokedAt: new Date() },
      include: this.includeShareRelations(),
    });

    const entityId = share.linkId || share.scheduleId || share.noteId || '';
    await this.notificationsService.createBulk([share.recipientId], {
      type: NotificationType.CONTENT_SHARE_REVOKED,
      entityType: share.entityType,
      entityId,
      title: 'Compartilhamento revogado',
      message: 'Um compartilhamento foi revogado pelo proprietario',
      actionUrl: '/compartilhados',
    });

    return revoked;
  }
}
