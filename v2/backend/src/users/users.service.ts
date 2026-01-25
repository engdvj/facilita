import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentAudience, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  companyId: true,
  avatarUrl: true,
  theme: true,
  createdAt: true,
  updatedAt: true,
  userSectors: {
    include: {
      userSectorUnits: {
        select: {
          unitId: true,
        },
      },
      sector: {
        include: {
          sectorUnits: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  },
};

type UserProfile = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const resolveCompanyIdFromSectors = (user: UserProfile) => {
  if (user.companyId) {
    return user.companyId;
  }
  for (const userSector of user.userSectors ?? []) {
    const sectorCompanyId = userSector.sector?.companyId;
    if (sectorCompanyId) {
      return sectorCompanyId;
    }
  }
  return null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { email: username } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findActiveById(id: string) {
    return this.prisma.user
      .findFirst({
        where: { id, status: UserStatus.ACTIVE },
        select: userSelect,
      })
      .then((user) => (user ? this.ensureCompanyId(user) : null));
  }

  async findAll(options?: {
    companyId?: string;
    sectorId?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const where = {
      ...(options?.companyId ? { companyId: options.companyId } : {}),
      ...(options?.sectorId
        ? {
            userSectors: {
              some: { sectorId: options.sectorId },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
        ...(options?.skip !== undefined ? { skip: options.skip } : {}),
        ...(options?.take !== undefined ? { take: options.take } : {}),
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.ensureCompanyId(user);
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const theme = data.theme
      ? (data.theme as Prisma.InputJsonValue)
      : undefined;

    await this.assertUserSectorUnits(data.sectors);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.username,
        passwordHash,
        role: data.role,
        status: data.status,
        companyId: data.companyId,
        avatarUrl: data.avatarUrl,
        theme,
        userSectors: data.sectors
          ? {
              create: data.sectors.map((sector) => ({
                sectorId: sector.sectorId,
                isPrimary: sector.isPrimary ?? false,
                role: sector.role ?? 'MEMBER',
                userSectorUnits: this.buildUserSectorUnits(sector.unitIds),
              })),
            }
          : undefined,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {
      name: data.name,
      email: data.username,
      role: data.role,
      status: data.status,
      companyId: data.companyId,
      avatarUrl: data.avatarUrl,
      theme: data.theme
        ? (data.theme as Prisma.InputJsonValue)
        : undefined,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    // Se sectors foi fornecido, atualiza os relacionamentos
    if (data.sectors) {
      await this.assertUserSectorUnits(data.sectors);
      updateData.userSectors = {
        deleteMany: {}, // Remove todos os relacionamentos antigos
        create: data.sectors.map((sector) => ({
          sectorId: sector.sectorId,
          isPrimary: sector.isPrimary ?? false,
          role: sector.role ?? 'MEMBER',
          userSectorUnits: this.buildUserSectorUnits(sector.unitIds),
        })),
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {
      name: data.name,
      email: data.username,
      avatarUrl: data.avatarUrl,
      theme: data.theme
        ? (data.theme as Prisma.InputJsonValue)
        : undefined,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  }

  async getDependencies(id: string) {
    const [
      sectors,
      links,
      schedules,
      notes,
      uploadedImages,
      linkVersions,
      favorites,
      refreshTokens,
      activityLogs,
      auditLogs,
    ] = await Promise.all([
      this.prisma.userSector.count({ where: { userId: id } }),
      this.prisma.link.count({ where: { userId: id } }),
      this.prisma.uploadedSchedule.count({ where: { userId: id } }),
      this.prisma.note.count({ where: { userId: id } }),
      this.prisma.uploadedImage.count({ where: { uploadedBy: id } }),
      this.prisma.linkVersion.count({ where: { changedBy: id } }),
      this.prisma.favorite.count({ where: { userId: id } }),
      this.prisma.refreshToken.count({ where: { userId: id } }),
      this.prisma.activityLog.count({ where: { userId: id } }),
      this.prisma.auditLog.count({ where: { userId: id } }),
    ]);

    return {
      sectors,
      links,
      schedules,
      notes,
      uploadedImages,
      linkVersions,
      favorites,
      refreshTokens,
      activityLogs,
      auditLogs,
      hasAny:
        sectors > 0 ||
        links > 0 ||
        schedules > 0 ||
        notes > 0 ||
        uploadedImages > 0 ||
        linkVersions > 0 ||
        favorites > 0 ||
        refreshTokens > 0 ||
        activityLogs > 0 ||
        auditLogs > 0,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      // Remove relacionamentos com setores (cascade já configurado no schema)

      // Desassocia conteúdos criados pelo usuário
      await tx.link.updateMany({
        data: { userId: null },
        where: { userId: id },
      });
      await tx.uploadedSchedule.updateMany({
        data: { userId: null },
        where: { userId: id },
      });
      await tx.note.updateMany({
        data: { userId: null },
        where: { userId: id },
      });
      await tx.activityLog.updateMany({
        data: { userId: null },
        where: { userId: id },
      });
      await tx.auditLog.updateMany({
        data: { userId: null },
        where: { userId: id },
      });

      // Deleta registros que pertencem exclusivamente ao usuário
      await tx.uploadedImage.deleteMany({ where: { uploadedBy: id } });
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.favorite.deleteMany({ where: { userId: id } });
      await tx.linkVersion.deleteMany({ where: { changedBy: id } });

      // Remove o usuário (relacionamentos UserSector serão removidos por cascade)
      return tx.user.delete({ where: { id }, select: userSelect });
    });
  }

  async getAccessItems(
    userId: string,
    options?: {
      sectorId?: string;
      page?: number;
      pageSize?: number;
      shouldPaginate?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        userSectors: {
          select: {
            sectorId: true,
            userSectorUnits: {
              select: {
                unitId: true,
              },
            },
            sector: {
              select: {
                sectorUnits: {
                  select: {
                    unitId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sectorIds = new Set(
      user.userSectors?.map((userSector) => userSector.sectorId) ?? [],
    );

    if (options?.sectorId && !sectorIds.has(options.sectorId)) {
      return { items: [], total: 0 };
    }

    const unitsBySector = this.getUserUnitsBySector(user.userSectors);
    const targetSectorId = options?.sectorId;
    const baseWhere = {
      deletedAt: null,
      ...(user.companyId ? { companyId: user.companyId } : {}),
      ...(targetSectorId ? { sectorId: targetSectorId } : {}),
    };

    const [links, schedules, notes] = await Promise.all([
      this.prisma.link.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          companyId: true,
          sectorId: true,
          unitId: true,
          userId: true,
          isPublic: true,
          audience: true,
          imageUrl: true,
          imagePosition: true,
          imageScale: true,
          status: true,
          createdAt: true,
          linkUnits: {
            select: {
              unitId: true,
            },
          },
        },
      }),
      this.prisma.uploadedSchedule.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          companyId: true,
          sectorId: true,
          unitId: true,
          userId: true,
          isPublic: true,
          audience: true,
          imageUrl: true,
          imagePosition: true,
          imageScale: true,
          status: true,
          createdAt: true,
          scheduleUnits: {
            select: {
              unitId: true,
            },
          },
        },
      }),
      this.prisma.note.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          companyId: true,
          sectorId: true,
          unitId: true,
          userId: true,
          isPublic: true,
          audience: true,
          imageUrl: true,
          imagePosition: true,
          imageScale: true,
          status: true,
          createdAt: true,
          noteUnits: {
            select: {
              unitId: true,
            },
          },
        },
      }),
    ]);

    const accessibleLinks = links
      .filter((link) =>
        this.canUserAccessItem(
          user,
          this.resolveAudience(link),
          {
            companyId: link.companyId,
            sectorId: link.sectorId,
            userId: link.userId,
            unitIds: this.resolveUnitIds(link.linkUnits, link.unitId),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((link) => ({
        id: link.id,
        title: link.title,
        type: 'link' as const,
        imageUrl: link.imageUrl,
        imagePosition: link.imagePosition,
        imageScale: link.imageScale,
        status: link.status,
        createdAt: link.createdAt,
      }));

    const accessibleSchedules = schedules
      .filter((schedule) =>
        this.canUserAccessItem(
          user,
          this.resolveAudience(schedule),
          {
            companyId: schedule.companyId,
            sectorId: schedule.sectorId,
            userId: schedule.userId,
            unitIds: this.resolveUnitIds(schedule.scheduleUnits, schedule.unitId),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        type: 'document' as const,
        imageUrl: schedule.imageUrl,
        imagePosition: schedule.imagePosition,
        imageScale: schedule.imageScale,
        status: schedule.status,
        createdAt: schedule.createdAt,
      }));

    const accessibleNotes = notes
      .filter((note) =>
        this.canUserAccessItem(
          user,
          this.resolveAudience(note),
          {
            companyId: note.companyId,
            sectorId: note.sectorId,
            userId: note.userId,
            unitIds: this.resolveUnitIds(note.noteUnits, note.unitId),
          },
          sectorIds,
          unitsBySector,
        ),
      )
      .map((note) => ({
        id: note.id,
        title: note.title,
        type: 'note' as const,
        imageUrl: note.imageUrl,
        imagePosition: note.imagePosition,
        imageScale: note.imageScale,
        status: note.status,
        createdAt: note.createdAt,
      }));

    const items = [...accessibleLinks, ...accessibleSchedules, ...accessibleNotes];
    items.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const diff = bTime - aTime;
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });

    const total = items.length;
    if (!options?.shouldPaginate) {
      return { items, total };
    }

    const page = options.page ?? 1;
    const pageSize = (options.pageSize ?? total) || 1;
    const start = (page - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    return { items: pagedItems, total };
  }

  private async ensureCompanyId(user: UserProfile) {
    if (user.companyId) {
      return user;
    }
    const resolvedCompanyId = resolveCompanyIdFromSectors(user);
    if (!resolvedCompanyId) {
      return user;
    }
    return this.prisma.user.update({
      where: { id: user.id },
      data: { companyId: resolvedCompanyId },
      select: userSelect,
    });
  }

  private getUserUnitsBySector(
    userSectors?: {
      sectorId: string;
      userSectorUnits?: { unitId: string }[] | null;
      sector?: { sectorUnits?: { unitId: string }[] | null } | null;
    }[] | null,
  ) {
    const map = new Map<string, Set<string>>();
    if (!userSectors) return map;

    userSectors.forEach((userSector) => {
      const explicitUnitIds =
        userSector.userSectorUnits?.map((unit) => unit.unitId) || [];
      const fallbackUnitIds =
        userSector.sector?.sectorUnits?.map((unit) => unit.unitId) || [];
      const unitIds =
        explicitUnitIds.length > 0 ? explicitUnitIds : fallbackUnitIds;

      map.set(userSector.sectorId, new Set(unitIds));
    });

    return map;
  }

  private resolveUnitIds(
    units?: { unitId: string }[] | null,
    unitId?: string | null,
  ) {
    const collected = [
      ...(units?.map((unit) => unit.unitId) ?? []),
      ...(unitId ? [unitId] : []),
    ].filter(Boolean);
    return Array.from(new Set(collected));
  }

  private resolveAudience(item: {
    isPublic?: boolean | null;
    audience?: ContentAudience | null;
    sectorId?: string | null;
  }) {
    if (item.isPublic) return ContentAudience.PUBLIC;
    if (item.audience) return item.audience;
    if (item.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private canUserAccessItem(
    subject: { id: string; role: UserRole; companyId?: string | null },
    audience: ContentAudience,
    item: {
      companyId?: string | null;
      sectorId?: string | null;
      userId?: string | null;
      unitIds?: string[];
    },
    sectorIds: Set<string>,
    unitsBySector: Map<string, Set<string>>,
  ) {
    if (audience === ContentAudience.PUBLIC) return true;
    if (subject.role === UserRole.SUPERADMIN) return true;
    if (audience === ContentAudience.SUPERADMIN) return false;

    const hasCompanyMatch =
      Boolean(
        subject.companyId &&
          item.companyId &&
          subject.companyId === item.companyId,
      );

    if (item.companyId && subject.companyId && !hasCompanyMatch) {
      return false;
    }

    if (audience === ContentAudience.ADMIN) {
      return subject.role === UserRole.ADMIN;
    }

    if (audience === ContentAudience.PRIVATE) {
      return item.userId === subject.id;
    }

    if (audience === ContentAudience.SECTOR) {
      if (subject.role === UserRole.ADMIN) return true;
      if (!item.sectorId || !sectorIds.has(item.sectorId)) {
        return false;
      }
      if (item.unitIds && item.unitIds.length > 0) {
        const allowedUnits = unitsBySector.get(item.sectorId);
        if (allowedUnits && allowedUnits.size > 0) {
          return item.unitIds.some((unitId) => allowedUnits.has(unitId));
        }
      }
      return true;
    }

    if (audience === ContentAudience.COMPANY) {
      return hasCompanyMatch;
    }

    return false;
  }

  private normalizeUnitIds(unitIds?: string[] | null) {
    const filtered = (unitIds ?? []).filter((unitId): unitId is string =>
      Boolean(unitId),
    );
    return Array.from(new Set(filtered));
  }

  private buildUserSectorUnits(unitIds?: string[] | null) {
    const normalizedUnitIds = this.normalizeUnitIds(unitIds);
    if (normalizedUnitIds.length === 0) {
      return undefined;
    }
    return {
      create: normalizedUnitIds.map((unitId) => ({ unitId })),
    };
  }

  private async assertUserSectorUnits(
    sectors?: { sectorId: string; unitIds?: string[] | null }[] | null,
  ) {
    if (!sectors || sectors.length === 0) return;

    const pairs: { sectorId: string; unitId: string }[] = [];
    sectors.forEach((sector) => {
      const normalizedUnitIds = this.normalizeUnitIds(sector.unitIds);
      if (normalizedUnitIds.length === 0) {
        return;
      }
      normalizedUnitIds.forEach((unitId) => {
        pairs.push({ sectorId: sector.sectorId, unitId });
      });
    });

    if (pairs.length === 0) return;

    const validPairs = await this.prisma.sectorUnit.findMany({
      where: {
        OR: pairs.map((pair) => ({
          sectorId: pair.sectorId,
          unitId: pair.unitId,
        })),
      },
      select: {
        sectorId: true,
        unitId: true,
      },
    });

    const validSet = new Set(
      validPairs.map((pair) => `${pair.sectorId}:${pair.unitId}`),
    );
    const invalid = pairs.find(
      (pair) => !validSet.has(`${pair.sectorId}:${pair.unitId}`),
    );
    if (invalid) {
      throw new ForbiddenException('Unidade nao pertence ao setor.');
    }
  }
}
