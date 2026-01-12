import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ContentAudience, EntityStatus, UserRole } from '@prisma/client';

type NoteActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({
      data: createNoteDto,
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
  }

  async findAll(
    companyId?: string,
    filters?: {
      sectorId?: string;
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
      includeInactive?: boolean;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const where = {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...(filters?.sectorId && { sectorId: filters.sectorId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(!shouldFilterPublic &&
        filters?.audience && { audience: filters.audience }),
      ...(filters?.isPublic !== undefined &&
        !shouldFilterPublic && { isPublic: filters.isPublic }),
      ...(shouldFilterPublic && {
        OR: [
          { audience: ContentAudience.PUBLIC },
          { isPublic: true },
        ],
      }),
    };

    return this.prisma.note.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({
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
      },
    });

    if (!note || note.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, actor?: NoteActor) {
    const existingNote = await this.findOne(id);
    this.assertCanMutate(existingNote, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingNote);
    const shouldUpdateAudience =
      updateNoteDto.audience !== undefined || updateNoteDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateNoteDto)
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    const {
      companyId,
      userId,
      sectorId: _sectorId,
      audience,
      isPublic,
      ...rest
    } = updateNoteDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingNote.sectorId ?? undefined
        : undefined;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para notas de setor.');
    }

    const updateData: UpdateNoteDto = {
      ...rest,
      sectorId,
    };

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    return this.prisma.note.update({
      where: { id },
      data: updateData,
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
  }

  async remove(id: string, actor?: NoteActor) {
    const existingNote = await this.findOne(id);
    this.assertCanMutate(existingNote, actor);

    return this.prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE,
      },
    });
  }

  async restore(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
    });
  }

  private assertCanMutate(
    note: { userId?: string | null; companyId: string },
    actor?: NoteActor,
  ) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== note.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    if (actor.role === UserRole.COLLABORATOR) {
      if (!note.userId || note.userId !== actor.id) {
        throw new ForbiddenException('Nota nao autorizada.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(note: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (note.isPublic) return ContentAudience.PUBLIC;
    if (note.audience) return note.audience;
    if (note.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateNoteDto: UpdateNoteDto,
  ) {
    if (updateNoteDto.audience) return updateNoteDto.audience;
    if (updateNoteDto.isPublic !== undefined) {
      return updateNoteDto.isPublic ? ContentAudience.PUBLIC : existing;
    }
    return existing;
  }

  private assertAudienceAllowed(role: UserRole, audience: ContentAudience) {
    if (role === UserRole.SUPERADMIN) return;
    if (role === UserRole.ADMIN) {
      if (
        audience !== ContentAudience.COMPANY &&
        audience !== ContentAudience.SECTOR
      ) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
    if (role === UserRole.COLLABORATOR) {
      if (audience !== ContentAudience.PRIVATE) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
  }
}
