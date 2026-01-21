import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sector.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        sectorUnits: {
          include: {
            unit: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: {
        company: true,
        sectorUnits: {
          include: {
            unit: true,
          },
        },
      },
    });
    if (!sector) {
      throw new NotFoundException('Sector not found');
    }
    return sector;
  }

  create(data: CreateSectorDto) {
    return this.prisma.sector.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        status: data.status,
        sectorUnits: {
          create: data.units.map((unit) => ({
            unitId: unit.unitId,
            isPrimary: unit.isPrimary ?? false,
          })),
        },
      },
      include: {
        company: true,
        sectorUnits: {
          include: {
            unit: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateSectorDto) {
    await this.findById(id);

    const updateData: any = {
      name: data.name,
      description: data.description,
      status: data.status,
      companyId: data.companyId,
    };

    // Se units foi fornecido, atualiza os relacionamentos
    if (data.units) {
      updateData.sectorUnits = {
        deleteMany: {}, // Remove todos os relacionamentos antigos
        create: data.units.map((unit) => ({
          unitId: unit.unitId,
          isPrimary: unit.isPrimary ?? false,
        })),
      };
    }

    return this.prisma.sector.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        sectorUnits: {
          include: {
            unit: true,
          },
        },
      },
    });
  }

  async getDependencies(id: string) {
    const [users, units, links, schedules, notes] = await Promise.all([
      this.prisma.userSector.count({ where: { sectorId: id } }),
      this.prisma.sectorUnit.count({ where: { sectorId: id } }),
      this.prisma.link.count({ where: { sectorId: id } }),
      this.prisma.uploadedSchedule.count({ where: { sectorId: id } }),
      this.prisma.note.count({ where: { sectorId: id } }),
    ]);

    return {
      users,
      units,
      links,
      schedules,
      notes,
      hasAny: users > 0 || units > 0 || links > 0 || schedules > 0 || notes > 0,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Remove relacionamentos com unidades (cascade já configurado no schema)
      // Remove relacionamentos com usuários (cascade já configurado no schema)

      // Desassocia conteúdos do setor
      await tx.link.updateMany({
        data: { sectorId: null },
        where: { sectorId: id },
      });
      await tx.uploadedSchedule.updateMany({
        data: { sectorId: null },
        where: { sectorId: id },
      });
      await tx.note.updateMany({
        data: { sectorId: null },
        where: { sectorId: id },
      });

      // Remove o setor (relacionamentos UserSector e SectorUnit serão removidos por cascade)
      return tx.sector.delete({
        where: { id },
        include: {
          company: true,
          sectorUnits: {
            include: {
              unit: true,
            },
          },
        },
      });
    });
  }
}
