import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ContentAudience, EntityStatus, UserRole } from '@prisma/client';

type LinkActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async create(createLinkDto: CreateLinkDto) {
    const link = await this.prisma.link.create({
      data: createLinkDto,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return link;
  }

  async findAll(
    companyId?: string,
    filters?: {
      sectorId?: string;
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
      includeInactive?: boolean;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const where = {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...(filters?.sectorId && { sectorId: filters.sectorId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(!shouldFilterPublic &&
        filters?.audience && { audience: filters.audience }),
      ...(filters?.isPublic !== undefined &&
        !shouldFilterPublic && { isPublic: filters.isPublic }),
      ...(shouldFilterPublic && {
        OR: [
          { audience: ContentAudience.PUBLIC },
          { isPublic: true },
        ],
      }),
    };

    console.log('LinksService.findAll - where clause:', JSON.stringify(where, null, 2));

    const links = await this.prisma.link.findMany({
      where,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    console.log('LinksService.findAll - links encontrados:', links.length);
    return links;
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            changedByUser: {
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

    if (!link || link.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor) {
    const existingLink = await this.findOne(id);
    this.assertCanMutate(existingLink, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingLink);
    const shouldUpdateAudience =
      updateLinkDto.audience !== undefined || updateLinkDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateLinkDto)
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    // Create version history if title, url or description changed
    const hasChanges =
      updateLinkDto.title !== existingLink.title ||
      updateLinkDto.url !== existingLink.url ||
      updateLinkDto.description !== existingLink.description;

    if (hasChanges && actor?.id) {
      await this.prisma.linkVersion.create({
        data: {
          linkId: id,
          title: existingLink.title,
          url: existingLink.url,
          description: existingLink.description,
          changedBy: actor.id,
        },
      });
    }

    const {
      companyId,
      userId,
      sectorId: _sectorId,
      audience,
      isPublic,
      ...rest
    } = updateLinkDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingLink.sectorId ?? undefined
        : undefined;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para links de setor.');
    }

    const updateData: UpdateLinkDto = {
      ...rest,
      sectorId,
    };

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    return this.prisma.link.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, actor?: LinkActor) {
    const existingLink = await this.findOne(id);
    this.assertCanMutate(existingLink, actor);

    return this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE,
      },
    });
  }

  private assertCanMutate(link: { userId?: string | null; companyId: string }, actor?: LinkActor) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== link.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    if (actor.role === UserRole.COLLABORATOR) {
      if (!link.userId || link.userId !== actor.id) {
        throw new ForbiddenException('Link nao autorizado.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(link: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (link.isPublic) return ContentAudience.PUBLIC;
    if (link.audience) return link.audience;
    if (link.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateLinkDto: UpdateLinkDto,
  ) {
    if (updateLinkDto.audience) return updateLinkDto.audience;
    if (updateLinkDto.isPublic !== undefined) {
      return updateLinkDto.isPublic ? ContentAudience.PUBLIC : existing;
    }
    return existing;
  }

  private assertAudienceAllowed(role: UserRole, audience: ContentAudience) {
    if (role === UserRole.SUPERADMIN) return;
    if (role === UserRole.ADMIN) {
      if (
        audience !== ContentAudience.COMPANY &&
        audience !== ContentAudience.SECTOR
      ) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
    if (role === UserRole.COLLABORATOR) {
      if (audience !== ContentAudience.PRIVATE) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
  }

  async restore(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
    });
  }
}
