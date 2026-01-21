import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

  async getDependencies(id: string) {
    const [
      units,
      sectors,
      users,
      categories,
      links,
      schedules,
      notes,
      uploadedImages,
    ] = await Promise.all([
      this.prisma.unit.count({ where: { companyId: id } }),
      this.prisma.sector.count({ where: { companyId: id } }),
      this.prisma.user.count({ where: { companyId: id } }),
      this.prisma.category.count({ where: { companyId: id } }),
      this.prisma.link.count({ where: { companyId: id } }),
      this.prisma.uploadedSchedule.count({ where: { companyId: id } }),
      this.prisma.note.count({ where: { companyId: id } }),
      this.prisma.uploadedImage.count({ where: { companyId: id } }),
    ]);

    return {
      units,
      sectors,
      users,
      categories,
      links,
      schedules,
      notes,
      uploadedImages,
      hasAny:
        units > 0 ||
        sectors > 0 ||
        users > 0 ||
        categories > 0 ||
        links > 0 ||
        schedules > 0 ||
        notes > 0 ||
        uploadedImages > 0,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deleta tudo em cascata na ordem correta
      await tx.favorite.deleteMany({
        where: {
          OR: [
            { link: { companyId: id } },
            { schedule: { companyId: id } },
            { note: { companyId: id } },
          ],
        },
      });
      await tx.linkVersion.deleteMany({
        where: { link: { companyId: id } },
      });
      await tx.link.deleteMany({ where: { companyId: id } });
      await tx.uploadedSchedule.deleteMany({ where: { companyId: id } });
      await tx.note.deleteMany({ where: { companyId: id } });
      await tx.uploadedImage.deleteMany({ where: { companyId: id } });
      await tx.category.deleteMany({ where: { companyId: id } });

      // Remove associações de usuários com a empresa
      await tx.refreshToken.deleteMany({
        where: { user: { companyId: id } },
      });
      await tx.favorite.deleteMany({
        where: { user: { companyId: id } },
      });
      await tx.user.deleteMany({ where: { companyId: id } });

      // Remove setores e unidades
      await tx.sector.deleteMany({ where: { companyId: id } });
      await tx.unit.deleteMany({ where: { companyId: id } });

      // Finalmente remove a empresa
      return tx.company.delete({ where: { id } });
    });
  }
}
