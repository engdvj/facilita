import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { EntityStatus } from '@prisma/client';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async create(createLinkDto: CreateLinkDto) {
    const link = await this.prisma.link.create({
      data: createLinkDto,
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

    return link;
  }

  async findAll(companyId: string, filters?: { sectorId?: string; categoryId?: string; isPublic?: boolean }) {
    return this.prisma.link.findMany({
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
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
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
        versions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            changedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!link || link.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto, userId?: string) {
    const existingLink = await this.findOne(id);

    // Create version history if title, url or description changed
    const hasChanges =
      updateLinkDto.title !== existingLink.title ||
      updateLinkDto.url !== existingLink.url ||
      updateLinkDto.description !== existingLink.description;

    if (hasChanges && userId) {
      await this.prisma.linkVersion.create({
        data: {
          linkId: id,
          title: existingLink.title,
          url: existingLink.url,
          description: existingLink.description,
          changedBy: userId,
        },
      });
    }

    return this.prisma.link.update({
      where: { id },
      data: updateLinkDto,
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
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE,
      },
    });
  }

  async restore(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
    });
  }
}
