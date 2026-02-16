import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EntityStatus, Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { isAbsolute, resolve } from 'path';
import { systemConfigStore } from '../system-config/system-config.store';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';

const resolveUploadRoot = () => {
  const configured = systemConfigStore.getString('upload_directory', 'uploads');
  const value = configured.trim() || 'uploads';
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
};

const resolveUploadPath = (filePath: string) => {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  const trimmed = filePath.replace(/^[/\\]+/, '');
  const root = resolveUploadRoot();
  if (trimmed.startsWith('uploads/')) {
    return resolve(root, trimmed.slice('uploads/'.length));
  }
  return resolve(root, trimmed);
};

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = resolveUploadPath(filePath);
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filename: string, type: 'images' | 'documents' = 'documents'): string {
    return `/uploads/${type}/${filename}`;
  }

  async createImageRecord(dto: CreateImageDto) {
    return this.prisma.uploadedImage.create({
      data: {
        uploadedBy: dto.uploadedBy,
        filename: dto.filename,
        originalName: dto.originalName,
        url: dto.url,
        mimeType: dto.mimeType,
        size: dto.size,
        width: dto.width,
        height: dto.height,
        alt: dto.alt,
        tags: dto.tags || [],
        status: dto.status || 'ACTIVE',
      },
    });
  }

  async listImages(query: QueryImagesDto) {
    const { uploadedBy, search, tags, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UploadedImageWhereInput = {
      status: EntityStatus.ACTIVE,
      deletedAt: null,
    };

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [data, total] = await Promise.all([
      this.prisma.uploadedImage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.uploadedImage.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getImageById(id: string) {
    const image = await this.prisma.uploadedImage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const usageCount = await this.getImageUsageCount(image.url);

    return {
      ...image,
      usageCount,
    };
  }

  async updateImage(id: string, dto: UpdateImageDto) {
    const image = await this.prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    return this.prisma.uploadedImage.update({
      where: { id },
      data: {
        alt: dto.alt,
        tags: dto.tags,
      },
    });
  }

  async deleteImage(id: string) {
    const image = await this.prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const canDelete = await this.canDeleteImage(image.url);

    if (!canDelete) {
      const usageCount = await this.getImageUsageCount(image.url);
      throw new ConflictException(
        `Não é possível deletar esta imagem. Ela está sendo usada em ${usageCount} lugar(es).`,
      );
    }

    await this.prisma.uploadedImage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.deleteFile(image.url);

    return { message: 'Imagem deletada com sucesso' };
  }

  async getImageUsageCount(imageUrl: string): Promise<number> {
    const [notesCount, linksCount, schedulesCount] = await Promise.all([
      this.prisma.note.count({
        where: {
          imageUrl,
          deletedAt: null,
        },
      }),
      this.prisma.link.count({
        where: {
          imageUrl,
          deletedAt: null,
        },
      }),
      this.prisma.uploadedSchedule.count({
        where: {
          imageUrl,
          deletedAt: null,
        },
      }),
    ]);

    return notesCount + linksCount + schedulesCount;
  }

  async canDeleteImage(imageUrl: string): Promise<boolean> {
    const count = await this.getImageUsageCount(imageUrl);
    return count === 0;
  }
}
