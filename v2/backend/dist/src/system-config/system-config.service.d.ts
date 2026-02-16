import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
export declare class SystemConfigService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    syncStore(): Promise<void>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }[]>;
    findOne(key: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }>;
    update(key: string, data: UpdateSystemConfigDto): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }>;
    resolvePath(key: string, fallback: string): string;
    getBoolean(key: string, fallback: boolean): boolean;
    getNumber(key: string, fallback: number): number;
    getString(key: string, fallback: string): string;
    private normalizeValue;
    private normalizeBoolean;
    private normalizeNumber;
    private normalizeTime;
    private normalizePath;
    private normalizeString;
}
