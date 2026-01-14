import { Injectable, NotFoundException } from '@nestjs/common';
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
      this.prisma.sector.count({ where: { unitId: id } }),
      this.prisma.user.count({ where: { unitId: id } }),
    ]);

    return {
      sectors,
      users,
      hasAny: sectors > 0 || users > 0,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx) => {
      // Desassocia usuários e setores da unidade
      await tx.user.updateMany({
        data: { unitId: null, sectorId: null },
        where: { unitId: id },
      });

      // Deleta setores da unidade (que desassociará conteúdos)
      const sectors = await tx.sector.findMany({
        where: { unitId: id },
        select: { id: true },
      });

      for (const sector of sectors) {
        await tx.link.updateMany({
          data: { sectorId: null },
          where: { sectorId: sector.id },
        });
        await tx.uploadedSchedule.updateMany({
          data: { sectorId: null },
          where: { sectorId: sector.id },
        });
        await tx.note.updateMany({
          data: { sectorId: null },
          where: { sectorId: sector.id },
        });
      }

      await tx.sector.deleteMany({ where: { unitId: id } });

      // Finalmente remove a unidade
      return tx.unit.delete({
        where: { id },
        include: { company: true },
      });
    });
  }
}