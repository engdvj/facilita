import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType, EntityStatus } from '@prisma/client';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Adiciona um item aos favoritos do usuário
   */
  async create(userId: string, dto: CreateFavoriteDto) {
    // Validação: apenas um dos IDs deve ser fornecido
    const idsProvided = [dto.linkId, dto.scheduleId, dto.noteId].filter(Boolean).length;

    if (idsProvided !== 1) {
      throw new BadRequestException(
        'Você deve fornecer exatamente um ID (linkId, scheduleId ou noteId)',
      );
    }

    // Validação: o ID fornecido deve corresponder ao entityType
    if (dto.entityType === EntityType.LINK && !dto.linkId) {
      throw new BadRequestException(
        'linkId é obrigatório quando entityType = LINK',
      );
    }

    if (dto.entityType === EntityType.SCHEDULE && !dto.scheduleId) {
      throw new BadRequestException(
        'scheduleId é obrigatório quando entityType = SCHEDULE',
      );
    }

    if (dto.entityType === EntityType.NOTE && !dto.noteId) {
      throw new BadRequestException(
        'noteId é obrigatório quando entityType = NOTE',
      );
    }

    // Verificar se a entidade existe
    if (dto.linkId) {
      const link = await this.prisma.link.findUnique({
        where: { id: dto.linkId },
      });
      if (!link) {
        throw new NotFoundException('Link não encontrado');
      }
    }

    if (dto.scheduleId) {
      const schedule = await this.prisma.uploadedSchedule.findUnique({
        where: { id: dto.scheduleId },
      });
      if (!schedule) {
        throw new NotFoundException('Agenda não encontrada');
      }
    }

    if (dto.noteId) {
      const note = await this.prisma.note.findUnique({
        where: { id: dto.noteId },
      });
      if (!note) {
        throw new NotFoundException('Nota não encontrada');
      }
    }

    // Verificar se já existe esse favorito
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        entityType: dto.entityType,
        linkId: dto.linkId ?? null,
        scheduleId: dto.scheduleId ?? null,
        noteId: dto.noteId ?? null,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Este item já está nos seus favoritos');
    }

    // Criar favorito
    return this.prisma.favorite.create({
      data: {
        userId,
        entityType: dto.entityType,
        linkId: dto.linkId,
        scheduleId: dto.scheduleId,
        noteId: dto.noteId,
      },
      include: {
        link: {
          include: {
            category: true,
            sector: true,
          },
        },
        schedule: {
          include: {
            category: true,
            sector: true,
          },
        },
        note: {
          include: {
            category: true,
            sector: true,
          },
        },
      },
    });
  }

  /**
   * Lista todos os favoritos do usuário
   */
  async findAllByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        link: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        schedule: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        note: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Lista favoritos filtrados por tipo
   */
  async findByUserAndType(userId: string, entityType: EntityType) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
        entityType,
      },
      include: {
        link: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
          },
        },
        schedule: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
          },
        },
        note: {
          where: {
            deletedAt: null,
          },
          include: {
            category: true,
            sector: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Verifica se um item está favoritado pelo usuário
   */
  async isFavorited(
    userId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<boolean> {
    const where: any = {
      userId,
      entityType,
    };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    const favorite = await this.prisma.favorite.findFirst({ where });
    return !!favorite;
  }

  /**
   * Remove um favorito
   */
  async remove(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado');
    }

    if (favorite.userId !== userId) {
      throw new BadRequestException(
        'Você não pode remover favoritos de outros usuários',
      );
    }

    await this.prisma.favorite.delete({
      where: { id },
    });

    return { message: 'Favorito removido com sucesso' };
  }

  /**
   * Remove favorito por entidade (alternativa)
   */
  async removeByEntity(
    userId: string,
    entityType: EntityType,
    entityId: string,
  ) {
    const where: any = {
      userId,
      entityType,
    };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    const favorite = await this.prisma.favorite.findFirst({ where });

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return { message: 'Favorito removido com sucesso' };
  }

  /**
   * Conta total de favoritos do usuário
   */
  async countByUser(userId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { userId },
    });
  }

  /**
   * Conta quantas vezes um item foi favoritado (por todos os usuários)
   */
  async countByEntity(entityType: EntityType, entityId: string): Promise<number> {
    const where: any = { entityType };

    if (entityType === EntityType.LINK) {
      where.linkId = entityId;
    } else if (entityType === EntityType.SCHEDULE) {
      where.scheduleId = entityId;
    } else if (entityType === EntityType.NOTE) {
      where.noteId = entityId;
    }

    return this.prisma.favorite.count({ where });
  }
}
