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

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.unit.delete({ where: { id } });
  }
}