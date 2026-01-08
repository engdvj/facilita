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

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.sector.delete({ where: { id } });
  }
}