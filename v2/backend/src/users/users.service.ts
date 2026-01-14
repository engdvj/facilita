import { Injectable, NotFoundException } from '@nestjs/common';
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
  unitId: true,
  sectorId: true,
  avatarUrl: true,
  theme: true,
  createdAt: true,
  updatedAt: true,
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
    return this.prisma.user.findFirst({
      where: { id, status: UserStatus.ACTIVE },
    });
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

    return user;
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const theme = data.theme
      ? (data.theme as Prisma.InputJsonValue)
      : undefined;

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.username,
        passwordHash,
        role: data.role,
        status: data.status,
        companyId: data.companyId,
        unitId: data.unitId,
        sectorId: data.sectorId,
        avatarUrl: data.avatarUrl,
        theme,
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
      unitId: data.unitId,
      sectorId: data.sectorId,
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

      return tx.user.delete({ where: { id }, select: userSelect });
    });
  }
}
