import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { EntityStatus } from '@prisma/client';

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

  async findAll(companyId: string, filters?: { sectorId?: string; categoryId?: string; isPublic?: boolean }) {
    return this.prisma.uploadedSchedule.findMany({
      where: {
        companyId,
        status: EntityStatus.ACTIVE,
        deletedAt: null,
        ...(filters?.sectorId && { sectorId: filters.sectorId }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic }),
      },
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id);

    return this.prisma.uploadedSchedule.update({
      where: { id },
      data: updateScheduleDto,
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

  async remove(id: string) {
    await this.findOne(id);

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
}
