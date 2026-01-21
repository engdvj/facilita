import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SystemConfig } from '@prisma/client';
import { mkdir } from 'fs/promises';
import { isAbsolute, resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_CONFIG_DEFAULTS } from './system-config.defaults';
import { systemConfigStore } from './system-config.store';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

const findDefault = (key: string) =>
  SYSTEM_CONFIG_DEFAULTS.find((entry) => entry.key === key);

@Injectable()
export class SystemConfigService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncStore();
  }

  async syncStore() {
    try {
      const configs = await this.prisma.systemConfig.findMany({
        select: { key: true, value: true },
      });
      systemConfigStore.hydrate(configs);
    } catch (error) {
      console.warn('Falha ao carregar SystemConfig, usando defaults.', error);
    }
  }

  findAll() {
    return this.prisma.systemConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async findOne(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException('Configuracao nao encontrada.');
    }
    return config;
  }

  async update(key: string, data: UpdateSystemConfigDto) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) {
      throw new NotFoundException('Configuracao nao encontrada.');
    }
    if (!config.isEditable) {
      throw new BadRequestException('Configuracao nao editavel.');
    }

    const normalizedValue = await this.normalizeValue(config, data.value);
    const updated = await this.prisma.systemConfig.update({
      where: { key },
      data: { value: normalizedValue },
    });

    systemConfigStore.set(updated.key, updated.value);
    return updated;
  }

  resolvePath(key: string, fallback: string) {
    const entry = systemConfigStore.get(key);
    const value = (entry ?? fallback).trim();
    if (!value) {
      return resolve(process.cwd(), fallback);
    }
    return isAbsolute(value) ? value : resolve(process.cwd(), value);
  }

  getBoolean(key: string, fallback: boolean) {
    return systemConfigStore.getBoolean(key, fallback);
  }

  getNumber(key: string, fallback: number) {
    return systemConfigStore.getNumber(key, fallback);
  }

  getString(key: string, fallback: string) {
    return systemConfigStore.getString(key, fallback);
  }

  private async normalizeValue(config: SystemConfig, input: unknown) {
    switch (config.type) {
      case 'boolean':
        return this.normalizeBoolean(input);
      case 'number':
        return this.normalizeNumber(input);
      case 'time':
        return this.normalizeTime(input);
      case 'path':
        return this.normalizePath(input);
      default:
        return this.normalizeString(input, config.key);
    }
  }

  private normalizeBoolean(input: unknown) {
    if (typeof input === 'boolean') {
      return input ? 'true' : 'false';
    }
    if (typeof input === 'string') {
      const value = input.trim().toLowerCase();
      if (value === 'true' || value === 'false') {
        return value;
      }
    }
    throw new BadRequestException('Valor booleano invalido.');
  }

  private normalizeNumber(input: unknown) {
    const parsed =
      typeof input === 'number' ? input : Number(String(input).trim());
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('Valor numerico invalido.');
    }
    if (parsed < 0) {
      throw new BadRequestException('Valor numerico deve ser positivo.');
    }
    return String(Math.floor(parsed));
  }

  private normalizeTime(input: unknown) {
    const value = String(input ?? '').trim();
    const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!pattern.test(value)) {
      throw new BadRequestException('Horario invalido. Use HH:MM.');
    }
    return value;
  }

  private async normalizePath(input: unknown) {
    const value = String(input ?? '').trim();
    if (!value) {
      throw new BadRequestException('Diretorio invalido.');
    }
    const resolved = isAbsolute(value) ? value : resolve(process.cwd(), value);
    await mkdir(resolved, { recursive: true });
    return value;
  }

  private normalizeString(input: unknown, key: string) {
    const value = String(input ?? '').trim();
    if (!value) {
      const fallback = findDefault(key)?.value;
      if (fallback) {
        return fallback;
      }
      throw new BadRequestException('Valor invalido.');
    }
    return value;
  }
}
