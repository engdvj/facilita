import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentVisibility,
  EntityStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

type LinkActor = {
  id?: string;
  role?: UserRole;
};

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  private include = {
    category: true,
    owner: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
    shares: {
      where: { revokedAt: null, removedAt: null },
      select: {
        id: true,
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
    _count: {
      select: {
        favorites: true,
      },
    },
  } satisfies Prisma.LinkInclude;

  private withShareMetadata<T extends { owner: any; shares?: any[] }>(item: T) {
    const shares = item.shares ?? [];
    return {
      ...item,
      createdBy: item.owner,
      shareCount: shares.length,
      sharedWithPreview: shares.slice(0, 5).map((s) => s.recipient),
    };
  }

  private normalizeVisibility(actorRole: UserRole, requested?: ContentVisibility) {
    if (actorRole === UserRole.SUPERADMIN) {
      return requested ?? ContentVisibility.PRIVATE;
    }
    return ContentVisibility.PRIVATE;
  }

  private ensurePublicToken(visibility: ContentVisibility, provided?: string | null) {
    if (visibility !== ContentVisibility.PUBLIC) {
      return null;
    }
    return provided?.trim() || randomUUID();
  }

  private async assertCategoryOwner(categoryId: string | null | undefined, ownerId: string) {
    if (!categoryId) return;
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, ownerId: true },
    });

    if (!category || category.ownerId !== ownerId) {
      throw new ForbiddenException('Category not authorized');
    }
  }

  private assertCanMutate(link: { ownerId: string }, actor: LinkActor) {
    if (actor.role === UserRole.SUPERADMIN) return;
    if (!actor.id || actor.id !== link.ownerId) {
      throw new ForbiddenException('Link not authorized');
    }
  }

  async create(actor: { id: string; role: UserRole }, dto: CreateLinkDto) {
    const visibility = this.normalizeVisibility(actor.role, dto.visibility);
    const publicToken = this.ensurePublicToken(visibility, dto.publicToken);

    await this.assertCategoryOwner(dto.categoryId, actor.id);

    const created = await this.prisma.link.create({
      data: {
        ownerId: actor.id,
        categoryId: dto.categoryId,
        title: dto.title,
        url: dto.url,
        description: dto.description,
        color: dto.color,
        imageUrl: dto.imageUrl,
        imagePosition: dto.imagePosition,
        imageScale: dto.imageScale,
        visibility,
        publicToken,
        order: dto.order ?? 0,
        status: dto.status ?? EntityStatus.ACTIVE,
      },
      include: this.include,
    });

    return this.withShareMetadata(created);
  }

  async findAll(viewer?: { id: string; role: UserRole }, filters?: {
    categoryId?: string;
    search?: string;
    includeInactive?: boolean;
  }) {
    if (!viewer) return [];

    const search = filters?.search?.trim();
    const and: Prisma.LinkWhereInput[] = [
      {
        deletedAt: null,
      },
    ];

    if (filters?.categoryId) {
      and.push({ categoryId: filters.categoryId });
    }

    if (search) {
      and.push({
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { url: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      });
    }

    if (viewer.role === UserRole.SUPERADMIN) {
      if (!filters?.includeInactive) {
        and.push({ status: EntityStatus.ACTIVE });
      }
    } else if (filters?.includeInactive) {
      and.push({
        OR: [
          { ownerId: viewer.id },
          {
            visibility: ContentVisibility.PUBLIC,
            owner: { role: UserRole.SUPERADMIN },
            status: EntityStatus.ACTIVE,
          },
        ],
      });
    } else {
      and.push({ status: EntityStatus.ACTIVE });
      and.push({
        OR: [
          { ownerId: viewer.id },
          {
            visibility: ContentVisibility.PUBLIC,
            owner: { role: UserRole.SUPERADMIN },
          },
        ],
      });
    }

    const where: Prisma.LinkWhereInput = { AND: and };

    const items = await this.prisma.link.findMany({
      where,
      include: this.include,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return items.map((item) => this.withShareMetadata(item));
  }

  async findAllPaginated(
    filters: {
      categoryId?: string;
      search?: string;
      includeInactive?: boolean;
    },
    pagination?: { skip?: number; take?: number },
  ) {
    const search = filters.search?.trim();
    const where: Prisma.LinkWhereInput = {
      deletedAt: null,
      ...(filters.includeInactive ? {} : { status: EntityStatus.ACTIVE }),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { url: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { owner: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.link.findMany({
        where,
        include: this.include,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        ...(pagination?.skip !== undefined ? { skip: pagination.skip } : {}),
        ...(pagination?.take !== undefined ? { take: pagination.take } : {}),
      }),
      this.prisma.link.count({ where }),
    ]);

    return { items: items.map((item) => this.withShareMetadata(item)), total };
  }

  async findOne(id: string, viewer?: LinkActor) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!link || link.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    if (viewer?.role === UserRole.SUPERADMIN) {
      return this.withShareMetadata(link);
    }

    if (!viewer?.id) {
      throw new ForbiddenException('Link not authorized');
    }

    const canView =
      link.ownerId === viewer.id ||
      (link.visibility === ContentVisibility.PUBLIC && link.owner.role === UserRole.SUPERADMIN);

    if (!canView) {
      throw new ForbiddenException('Link not authorized');
    }

    return this.withShareMetadata(link);
  }

  async findPublicByToken(publicToken: string) {
    const link = await this.prisma.link.findFirst({
      where: {
        publicToken,
        visibility: ContentVisibility.PUBLIC,
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
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
    });

    if (!link) {
      throw new NotFoundException('Public link not found');
    }

    return link;
  }

  async update(id: string, actor: { id: string; role: UserRole }, dto: UpdateLinkDto) {
    const existing = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const requestedVisibility = dto.visibility ?? existing.visibility;
    const visibility = this.normalizeVisibility(actor.role, requestedVisibility);
    const publicToken = this.ensurePublicToken(visibility, dto.publicToken ?? existing.publicToken);

    const nextCategoryId = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;
    await this.assertCategoryOwner(nextCategoryId, existing.ownerId);

    const updated = await this.prisma.link.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.url !== undefined ? { url: dto.url } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.imagePosition !== undefined ? { imagePosition: dto.imagePosition } : {}),
        ...(dto.imageScale !== undefined ? { imageScale: dto.imageScale } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        visibility,
        publicToken,
      },
      include: this.include,
    });

    return this.withShareMetadata(updated);
  }

  async remove(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const removed = await this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      include: this.include,
    });

    return this.withShareMetadata(removed);
  }

  async restore(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const restored = await this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
      include: this.include,
    });

    return this.withShareMetadata(restored);
  }

  async activate(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const activated = await this.prisma.link.update({
      where: { id },
      data: { status: EntityStatus.ACTIVE },
      include: this.include,
    });

    return this.withShareMetadata(activated);
  }

  async deactivate(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.link.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const deactivated = await this.prisma.link.update({
      where: { id },
      data: { status: EntityStatus.INACTIVE },
      include: this.include,
    });

    return this.withShareMetadata(deactivated);
  }
}
