import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BackupEntity, BackupPayload, backupEntities } from './backups.types';

const restoreOrder: BackupEntity[] = [
  'companies',
  'units',
  'sectors',
  'users',
  'rolePermissions',
  'categories',
  'links',
  'uploadedSchedules',
  'tags',
  'tagOnLink',
  'tagOnSchedule',
];

@Injectable()
export class BackupsService {
  constructor(private readonly prisma: PrismaService) {}

  async export(entities: BackupEntity[]): Promise<BackupPayload> {
    const data: BackupPayload['data'] = {};

    for (const entity of entities) {
      switch (entity) {
        case 'companies':
          data.companies = await this.prisma.company.findMany();
          break;
        case 'units':
          data.units = await this.prisma.unit.findMany();
          break;
        case 'sectors':
          data.sectors = await this.prisma.sector.findMany();
          break;
        case 'users':
          data.users = await this.prisma.user.findMany();
          break;
        case 'rolePermissions':
          data.rolePermissions = await this.prisma.rolePermission.findMany();
          break;
        case 'categories':
          data.categories = await this.prisma.category.findMany();
          break;
        case 'links':
          data.links = await this.prisma.link.findMany();
          break;
        case 'uploadedSchedules':
          data.uploadedSchedules = await this.prisma.uploadedSchedule.findMany();
          break;
        case 'tags':
          data.tags = await this.prisma.tag.findMany();
          break;
        case 'tagOnLink':
          data.tagOnLink = await this.prisma.tagOnLink.findMany();
          break;
        case 'tagOnSchedule':
          data.tagOnSchedule = await this.prisma.tagOnSchedule.findMany();
          break;
        default:
          break;
      }
    }

    return {
      meta: {
        version: 1,
        createdAt: new Date().toISOString(),
        entities,
      },
      data,
    };
  }

  async restore(
    payload: BackupPayload,
    entities?: BackupEntity[],
    mode: 'merge' = 'merge',
  ) {
    if (mode !== 'merge') {
      return { restored: {}, skipped: backupEntities };
    }

    const fallbackEntities = Object.keys(payload.data || {}) as BackupEntity[];
    const selectedEntities =
      entities && entities.length
        ? entities
        : payload.meta?.entities || fallbackEntities;
    const restoreTargets = restoreOrder.filter((entity) =>
      selectedEntities.includes(entity),
    );

    const results: Record<string, number> = {};

    await this.prisma.$transaction(async (tx) => {
      for (const entity of restoreTargets) {
        const raw = payload.data?.[entity];
        const items = Array.isArray(raw) ? raw : [];

        switch (entity) {
          case 'companies':
            results.companies = await this.upsertById(
              tx.company,
              items as Prisma.CompanyUncheckedCreateInput[],
            );
            break;
          case 'units':
            results.units = await this.upsertById(
              tx.unit,
              items as Prisma.UnitUncheckedCreateInput[],
            );
            break;
          case 'sectors':
            results.sectors = await this.upsertById(
              tx.sector,
              items as Prisma.SectorUncheckedCreateInput[],
            );
            break;
          case 'users':
            results.users = await this.upsertById(
              tx.user,
              items as Prisma.UserUncheckedCreateInput[],
            );
            break;
          case 'rolePermissions':
            results.rolePermissions = await this.upsertByRole(
              tx.rolePermission,
              items as Prisma.RolePermissionUncheckedCreateInput[],
            );
            break;
          case 'categories':
            results.categories = await this.upsertById(
              tx.category,
              items as Prisma.CategoryUncheckedCreateInput[],
            );
            break;
          case 'links':
            results.links = await this.upsertById(
              tx.link,
              items as Prisma.LinkUncheckedCreateInput[],
            );
            break;
          case 'uploadedSchedules':
            results.uploadedSchedules = await this.upsertById(
              tx.uploadedSchedule,
              items as Prisma.UploadedScheduleUncheckedCreateInput[],
            );
            break;
          case 'tags':
            results.tags = await this.upsertById(
              tx.tag,
              items as Prisma.TagUncheckedCreateInput[],
            );
            break;
          case 'tagOnLink':
            results.tagOnLink = await this.upsertTagOnLink(
              tx,
              items as Prisma.TagOnLinkUncheckedCreateInput[],
            );
            break;
        case 'tagOnSchedule':
          results.tagOnSchedule = await this.upsertTagOnSchedule(
            tx,
            items as Prisma.TagOnScheduleUncheckedCreateInput[],
          );
          break;
        default:
          break;
      }
    }
  });

    return { restored: results };
  }

  private async upsertById<T extends { id?: string }>(
    model: {
      upsert: (args: any) => Promise<unknown>;
    },
    items: T[],
  ) {
    let count = 0;
    for (const item of items) {
      const { id, ...data } = item;
      if (!id) {
        continue;
      }
      await model.upsert({
        where: { id },
        update: data,
        create: { id, ...(data as Omit<T, 'id'>) } as T,
      });
      count += 1;
    }
    return count;
  }

  private async upsertByRole(
    model: {
      upsert: (args: {
        where: { role: UserRole };
        update: Omit<Prisma.RolePermissionUncheckedCreateInput, 'role'>;
        create: Prisma.RolePermissionUncheckedCreateInput;
      }) => Promise<unknown>;
    },
    items: Prisma.RolePermissionUncheckedCreateInput[],
  ) {
    let count = 0;
    for (const item of items) {
      const { role, ...data } = item;
      await model.upsert({
        where: { role },
        update: data,
        create: { role, ...data },
      });
      count += 1;
    }
    return count;
  }

  private async upsertTagOnLink(
    tx: Prisma.TransactionClient,
    items: Prisma.TagOnLinkUncheckedCreateInput[],
  ) {
    let count = 0;
    for (const item of items) {
      await tx.tagOnLink.upsert({
        where: {
          linkId_tagId: {
            linkId: item.linkId,
            tagId: item.tagId,
          },
        },
        update: {},
        create: item,
      });
      count += 1;
    }
    return count;
  }

  private async upsertTagOnSchedule(
    tx: Prisma.TransactionClient,
    items: Prisma.TagOnScheduleUncheckedCreateInput[],
  ) {
    let count = 0;
    for (const item of items) {
      await tx.tagOnSchedule.upsert({
        where: {
          scheduleId_tagId: {
            scheduleId: item.scheduleId,
            tagId: item.tagId,
          },
        },
        update: {},
        create: item,
      });
      count += 1;
    }
    return count;
  }
}
