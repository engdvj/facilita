import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });
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
