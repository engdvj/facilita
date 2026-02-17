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
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
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
  } satisfies Prisma.NoteInclude;

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

  private assertCanMutate(item: { ownerId: string }, actor: { id: string; role: UserRole }) {
    if (actor.role === UserRole.SUPERADMIN) return;
    if (actor.id !== item.ownerId) {
      throw new ForbiddenException('Note not authorized');
    }
  }

  async create(actor: { id: string; role: UserRole }, dto: CreateNoteDto) {
    const visibility = this.normalizeVisibility(actor.role, dto.visibility);
    const publicToken = this.ensurePublicToken(visibility, dto.publicToken);

    await this.assertCategoryOwner(dto.categoryId, actor.id);

    const created = await this.prisma.note.create({
      data: {
        ownerId: actor.id,
        categoryId: dto.categoryId,
        title: dto.title,
        content: dto.content,
        color: dto.color,
        imageUrl: dto.imageUrl,
        imagePosition: dto.imagePosition,
        imageScale: dto.imageScale,
        visibility,
        publicToken,
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
    const search = filters?.search?.trim();

    if (!viewer) {
      const where: Prisma.NoteWhereInput = {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
        visibility: ContentVisibility.PUBLIC,
        owner: { role: UserRole.SUPERADMIN },
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { owner: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              ],
            }
          : {}),
      };

      const items = await this.prisma.note.findMany({
        where,
        include: this.include,
        orderBy: { createdAt: 'desc' },
      });

      return items.map((item) => this.withShareMetadata(item));
    }

    const and: Prisma.NoteWhereInput[] = [
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
          { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { owner: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
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

    const where: Prisma.NoteWhereInput = { AND: and };

    const items = await this.prisma.note.findMany({
      where,
      include: this.include,
      orderBy: { createdAt: 'desc' },
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
    const where: Prisma.NoteWhereInput = {
      deletedAt: null,
      ...(filters.includeInactive ? {} : { status: EntityStatus.ACTIVE }),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { owner: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.note.findMany({
        where,
        include: this.include,
        orderBy: { createdAt: 'desc' },
        ...(pagination?.skip !== undefined ? { skip: pagination.skip } : {}),
        ...(pagination?.take !== undefined ? { take: pagination.take } : {}),
      }),
      this.prisma.note.count({ where }),
    ]);

    return { items: items.map((item) => this.withShareMetadata(item)), total };
  }

  async findOne(id: string, viewer?: { id?: string; role?: UserRole }) {
    const item = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (viewer?.role === UserRole.SUPERADMIN) {
      return this.withShareMetadata(item);
    }

    if (!viewer?.id) {
      throw new ForbiddenException('Note not authorized');
    }

    const canView =
      item.ownerId === viewer.id ||
      (item.visibility === ContentVisibility.PUBLIC && item.owner.role === UserRole.SUPERADMIN);

    if (!canView) {
      throw new ForbiddenException('Note not authorized');
    }

    return this.withShareMetadata(item);
  }

  async findPublicByToken(publicToken: string) {
    const item = await this.prisma.note.findFirst({
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

    if (!item) {
      throw new NotFoundException('Public note not found');
    }

    return item;
  }

  async update(id: string, actor: { id: string; role: UserRole }, dto: UpdateNoteDto) {
    const existing = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const requestedVisibility = dto.visibility ?? existing.visibility;
    const visibility = this.normalizeVisibility(actor.role, requestedVisibility);
    const publicToken = this.ensurePublicToken(visibility, dto.publicToken ?? existing.publicToken);

    const nextCategoryId = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;
    await this.assertCategoryOwner(nextCategoryId, existing.ownerId);

    const updated = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.imagePosition !== undefined ? { imagePosition: dto.imagePosition } : {}),
        ...(dto.imageScale !== undefined ? { imageScale: dto.imageScale } : {}),
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
    const existing = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const removed = await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.include,
    });

    return this.withShareMetadata(removed);
  }

  async restore(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const restored = await this.prisma.note.update({
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
    const existing = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const activated = await this.prisma.note.update({
      where: { id },
      data: { status: EntityStatus.ACTIVE },
      include: this.include,
    });

    return this.withShareMetadata(activated);
  }

  async deactivate(id: string, actor: { id: string; role: UserRole }) {
    const existing = await this.prisma.note.findUnique({
      where: { id },
      include: this.include,
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    this.assertCanMutate(existing, actor);

    const deactivated = await this.prisma.note.update({
      where: { id },
      data: { status: EntityStatus.INACTIVE },
      include: this.include,
    });

    return this.withShareMetadata(deactivated);
  }
}
