import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sector.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true, unit: true },
    });
  }

  async findById(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: { company: true, unit: true },
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
        unitId: data.unitId,
        name: data.name,
        description: data.description,
        status: data.status,
      },
      include: { company: true, unit: true },
    });
  }

  async update(id: string, data: UpdateSectorDto) {
    await this.findById(id);
    return this.prisma.sector.update({
      where: { id },
      data,
      include: { company: true, unit: true },
    });
  }

  async getDependencies(id: string) {
    const [users, links, schedules, notes] = await Promise.all([
      this.prisma.user.count({ where: { sectorId: id } }),
      this.prisma.link.count({ where: { sectorId: id } }),
      this.prisma.uploadedSchedule.count({ where: { sectorId: id } }),
      this.prisma.note.count({ where: { sectorId: id } }),
    ]);

    return {
      users,
      links,
      schedules,
      notes,
      hasAny: users > 0 || links > 0 || schedules > 0 || notes > 0,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx) => {
      // Desassocia usuários do setor
      await tx.user.updateMany({
        data: { sectorId: null },
        where: { sectorId: id },
      });

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

      // Finalmente remove o setor
      return tx.sector.delete({
        where: { id },
        include: { company: true, unit: true },
      });
    });
  }
}