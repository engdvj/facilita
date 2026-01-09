import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(options?: { excludeInternal?: boolean }) {
    return this.prisma.company.findMany({
      ...(options?.excludeInternal
        ? {
            where: {
              NOT: {
                name: 'ADM',
              },
            },
          }
        : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  create(data: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: data.name,
        cnpj: data.cnpj,
        logoUrl: data.logoUrl,
        status: data.status,
      },
    });
  }

  async update(id: string, data: UpdateCompanyDto) {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
