import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { EntityStatus } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(companyId?: string, includeInactive = false) {
    return this.prisma.category.findMany({
      where: {
        ...(includeInactive ? {} : { status: EntityStatus.ACTIVE }),
        ...(companyId ? { companyId } : {}),
      },
      include: {
        _count: {
          select: {
            links: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
            schedules: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
            notes: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            links: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
            schedules: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
            notes: {
              where: {
                status: EntityStatus.ACTIVE,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    // Se estiver inativando a categoria, desassocia todos os links, documentos e notas
    if (updateCategoryDto.status === EntityStatus.INACTIVE) {
      console.log(
        `Inativando categoria ${category.name} (${id}) - desassociando itens...`,
      );

      const [linksUpdated, schedulesUpdated, notesUpdated] =
        await this.prisma.$transaction([
          // Remove categoria de todos os links associados
          this.prisma.link.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
          }),
          // Remove categoria de todos os documentos (schedules) associados
          this.prisma.uploadedSchedule.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
          }),
          // Remove categoria de todas as notas associadas
          this.prisma.note.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
          }),
        ]);

      console.log(
        `Desassociados: ${linksUpdated.count} links, ${schedulesUpdated.count} documentos, ${notesUpdated.count} notas`,
      );

      // Atualiza o status da categoria
      await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return this.findOne(id);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    console.log(
      `Removendo categoria ${category.name} (${id}) - desassociando e excluindo...`,
    );

    // Desassocia todos os itens e exclui a categoria
    await this.prisma.$transaction([
      // Remove categoria de todos os links associados
      this.prisma.link.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      }),
      // Remove categoria de todos os documentos (schedules) associados
      this.prisma.uploadedSchedule.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      }),
      // Remove categoria de todas as notas associadas
      this.prisma.note.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      }),
      // Exclui a categoria definitivamente
      this.prisma.category.delete({
        where: { id },
      }),
    ]);

    console.log(`Categoria ${category.name} removida com sucesso`);

    return category;
  }
}
