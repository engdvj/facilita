import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ContentAudience, EntityStatus, UserRole } from '@prisma/client';

type ScheduleActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class UploadedSchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    return this.prisma.uploadedSchedule.create({
      data: createScheduleDto,
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

  async findAll(
    companyId?: string,
    filters?: {
      sectorId?: string;
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const where = {
      status: EntityStatus.ACTIVE,
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

    console.log('SchedulesService.findAll - where clause:', JSON.stringify(where, null, 2));

    const schedules = await this.prisma.uploadedSchedule.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('SchedulesService.findAll - schedules encontrados:', schedules.length);
    return schedules;
  }

  async findOne(id: string) {
    const schedule = await this.prisma.uploadedSchedule.findUnique({
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
      },
    });

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
    actor?: ScheduleActor,
  ) {
    const existingSchedule = await this.findOne(id);
    this.assertCanMutate(existingSchedule, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingSchedule);
    const shouldUpdateAudience =
      updateScheduleDto.audience !== undefined ||
      updateScheduleDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateScheduleDto)
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    const {
      companyId,
      userId,
      sectorId: _sectorId,
      audience,
      isPublic,
      ...rest
    } = updateScheduleDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingSchedule.sectorId ?? undefined
        : undefined;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para documentos de setor.');
    }

    const updateData: UpdateScheduleDto = {
      ...rest,
      sectorId,
    };

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    return this.prisma.uploadedSchedule.update({
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

  async remove(id: string, actor?: ScheduleActor) {
    const existingSchedule = await this.findOne(id);
    this.assertCanMutate(existingSchedule, actor);

    return this.prisma.uploadedSchedule.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE,
      },
    });
  }

  async restore(id: string) {
    const schedule = await this.prisma.uploadedSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return this.prisma.uploadedSchedule.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
    });
  }

  private assertCanMutate(
    schedule: { companyId: string },
    actor?: ScheduleActor,
  ) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== schedule.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(schedule: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (schedule.isPublic) return ContentAudience.PUBLIC;
    if (schedule.audience) return schedule.audience;
    if (schedule.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateScheduleDto: UpdateScheduleDto,
  ) {
    if (updateScheduleDto.audience) return updateScheduleDto.audience;
    if (updateScheduleDto.isPublic !== undefined) {
      return updateScheduleDto.isPublic ? ContentAudience.PUBLIC : existing;
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
  }
}
