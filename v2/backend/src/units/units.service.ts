import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
  }

  async findById(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  create(data: CreateUnitDto) {
    return this.prisma.unit.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        cnpj: data.cnpj,
        status: data.status,
      },
      include: { company: true },
    });
  }

  async update(id: string, data: UpdateUnitDto) {
    await this.findById(id);
    return this.prisma.unit.update({
      where: { id },
      data,
      include: { company: true },
    });
  }

  async getDependencies(id: string) {
    const [sectors, users] = await Promise.all([
      this.prisma.sectorUnit.count({ where: { unitId: id } }),
      this.prisma.userSector.count({
        where: {
          sector: {
            sectorUnits: {
              some: { unitId: id },
            },
          },
        },
      }),
    ]);

    return {
      sectors,
      users,
      hasAny: sectors > 0 || users > 0,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get all sectors linked to this unit via SectorUnit
      const sectorUnits = await tx.sectorUnit.findMany({
        where: { unitId: id },
        select: { sectorId: true },
      });

      const sectorIds = sectorUnits.map(
        (su: { sectorId: string }) => su.sectorId,
      );

      // Unlink content from sectors before deleting SectorUnit relationships
      if (sectorIds.length > 0) {
        await tx.link.updateMany({
          data: { sectorId: null },
          where: { sectorId: { in: sectorIds } },
        });
        await tx.uploadedSchedule.updateMany({
          data: { sectorId: null },
          where: { sectorId: { in: sectorIds } },
        });
        await tx.note.updateMany({
          data: { sectorId: null },
          where: { sectorId: { in: sectorIds } },
        });
      }

      // Delete SectorUnit relationships (cascade will handle UserSector via sector deletion if needed)
      await tx.sectorUnit.deleteMany({ where: { unitId: id } });

      // Finally remove the unit
      return tx.unit.delete({
        where: { id },
        include: { company: true },
      });
    });
  }
}
